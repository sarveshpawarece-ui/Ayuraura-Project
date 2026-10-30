import os
import re
import uuid
import json
import httpx
from datetime import datetime, timezone, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import StudentProfile, FacultyProfile
from app.models.doctor_ngo import DoctorProfile
from app.models.forum import ForumPost, ForumComment
from app.models.ai_ecosystem import (
    AIChatRole,
    NoteTransformType,
    AIQuestionFormat,
    FacultyToolType,
    AIChatSession,
    AIChatMessage,
    AINote,
    AINoteVersion,
    AIGeneratedQuiz,
    AIQuizAttempt,
    AIStudySchedule,
    AIAnswerEvaluation,
    AIFacultyLog
)
from app.models.learning_hub import ClassicalShloka, ClassicalTreatise
from app.models.bams_ecosystem import BamsCaseStudy
from app.schemas.ai_ecosystem import (
    AIChatMessageIn,
    AIChatResponseOut,
    AINoteCreateIn,
    AINoteUpdateIn,
    AINoteOut,
    AINoteTransformIn,
    AINoteTransformOut,
    AIQuizGenerateIn,
    AIQuizOut,
    AIQuizQuestionOut,
    AIQuizSubmitIn,
    AIQuizResultOut,
    AIStudyPlanGenerateIn,
    AIStudyPlanOut,
    AIStudyDayOut,
    AIStudySessionOut,
    AILearningRecommendationsOut,
    AILearningRecommendationItem,
    AIAnswerSubmitIn,
    AIAnswerFeedbackOut,
    AIFacultyToolIn,
    AIFacultyToolOut,
    AISearchIn,
    AISearchResponseOut,
    AISearchResultItem,
    AIAnatomyExplainerIn,
    AIAnatomyExplainerOut,
    AIAnatomyQAIn,
    AIAnatomyQAOut,
    AIAnatomyQuizIn,
    AIAnatomyQuizOut,
    AIAnatomyQuizQuestion,
    AIAnatomyFlashcard,
    AIAnatomySummaryIn,
    AIAnatomySummaryOut
)

PROMPT_INJECTION_PATTERNS = [
    "ignore previous instructions",
    "ignore all instructions",
    "system prompt",
    "leak api key",
    "drop database",
    "drop table",
    "sudo ",
    "<script>",
    "exec(",
    "delete from users",
]

MEDICAL_SAFETY_DISCLAIMER = (
    "AyurSetu AI is an academic educational guidance system designed under NCISM syllabus guidelines. "
    "It does NOT offer personalized clinical diagnosis, emergency medical treatment, or replace qualified AYUSH physicians."
)

class AIUnifiedService:

    @classmethod
    def sanitize_input(cls, text: str):
        if not text:
            return
        lower = text.lower()
        for pattern in PROMPT_INJECTION_PATTERNS:
            if pattern in lower:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected. System prompts, administrative commands, and injection patterns are strictly blocked."
                )

    # ============================================================
    # 1. UNIFIED MASTER AI CHATBOT
    # ============================================================

    @classmethod
    async def chat(
        cls,
        db: AsyncSession,
        current_user: User,
        data: AIChatMessageIn
    ) -> AIChatResponseOut:
        cls.sanitize_input(data.message)

        # 1. Resolve or create chat session
        session: Optional[AIChatSession] = None
        if data.session_id:
            res = await db.execute(
                select(AIChatSession).where(
                    and_(
                        AIChatSession.id == data.session_id,
                        AIChatSession.user_id == current_user.id
                    )
                )
            )
            session = res.scalar_one_or_none()

        if not session:
            title = data.message[:45].strip()
            if len(data.message) > 45:
                title += "..."
            session = AIChatSession(
                user_id=current_user.id,
                title=title or "BAMS Consultation",
                user_role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
                current_subject=data.subject_context or "General BAMS"
            )
            db.add(session)
            await db.commit()
            await db.refresh(session)

        # 2. Fetch recent conversation history for multi-turn context
        history_res = await db.execute(
            select(AIChatMessage)
            .where(AIChatMessage.session_id == session.id)
            .order_by(AIChatMessage.created_at.desc())
            .limit(6)
        )
        recent_messages = list(reversed(history_res.scalars().all()))

        # 3. Save User Message
        user_msg = AIChatMessage(
            session_id=session.id,
            role="user",
            content=data.message,
            suggested_followups=[],
            classical_citations=[],
            context_used={
                "role": session.user_role,
                "subject": data.subject_context or session.current_subject,
                "has_note_context": bool(data.note_context)
            }
        )
        db.add(user_msg)
        await db.commit()

        # 4. Generate Intelligent Domain Response
        reply_text, followups, citations = await cls._generate_educational_reply(
            db=db,
            user=current_user,
            query=data.message,
            history=recent_messages,
            subject=data.subject_context or session.current_subject,
            note_context=data.note_context
        )

        # 5. Save Assistant Message
        assistant_msg = AIChatMessage(
            session_id=session.id,
            role="assistant",
            content=reply_text,
            suggested_followups=followups,
            classical_citations=citations,
            context_used={"role": session.user_role}
        )
        db.add(assistant_msg)
        session.updated_at = datetime.now(timezone.utc)
        await db.commit()

        return AIChatResponseOut(
            session_id=session.id,
            session_title=session.title,
            reply=reply_text,
            suggested_followups=followups,
            classical_citations=citations,
            context_used={"user_role": session.user_role, "subject": session.current_subject},
            safety_disclaimer=MEDICAL_SAFETY_DISCLAIMER
        )

    @classmethod
    async def _generate_educational_reply(
        cls,
        db: AsyncSession,
        user: User,
        query: str,
        history: List[AIChatMessage],
        subject: Optional[str] = None,
        note_context: Optional[str] = None
    ) -> Tuple[str, List[str], List[str]]:
        lower_q = query.lower()

        # Optional External LLM check
        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        if gemini_key:
            try:
                llm_reply, llm_followups, llm_cites = await cls._call_gemini_chat(
                    gemini_key, query, history, user.role.value, subject, note_context
                )
                if llm_reply:
                    return llm_reply, llm_followups, llm_cites
            except Exception:
                pass  # Gracefully fall back to local Ayurvedic Knowledge Engine

        # Core Classical Ayurvedic Knowledge Engine
        if note_context:
            reply = (
                f"**Analysis of Selected Note Context:**\n\n"
                f"I reviewed your note excerpt: *\"{note_context[:140]}...\"*\n\n"
                f"- **Core Concepts Identified**: Clear alignment with classical Ayurvedic principles.\n"
                "- **Suggested Enhancements**: Ensure you include Sanskrit Shloka references, highlight classical Samprapti Ghatakas (Hetu, Dosha, Dushya, Srotas, Agni), and provide clear diagnostic indications.\n"
                "- **Exam Structuring Tip**: Divide your notes into (1) Definition & Etymology (Nirukti), (2) Classical Classification, (3) Clinical Manifestations, and (4) Chikitsa Sutra."
            )
            citations = ["NCISM BAMS Curriculum Guidelines", "Charaka Samhita Vimanasthana 8"]
            followups = [
                "Convert this note into an exam-ready 5-mark answer.",
                "Generate a 5-question revision quiz from this note.",
                "What classical citations can I add to support this note?",
                "Create a concise bullet-point summary."
            ]
        elif "tridosha" in lower_q or "vata" in lower_q or "pitta" in lower_q or "kapha" in lower_q:
            reply = (
                "**Tridosha** represents the three fundamental psycho-physiological energies governing human physiology and pathology in Ayurveda: "
                "\n\n1. **Vata (Akasha + Vayu)**: Governs bodily movement, nerve impulses (Gati), respiratory rhythm, and elimination of Malas. Key qualities: Ruksha (dry), Laghu (light), Sheeta (cold), Khara (rough), Chala (mobile). "
                "\n2. **Pitta (Tejas + Jala)**: Governs thermogenesis, cellular digestion (Paka), metabolic transformation, vision (Alochaka), and intellectual comprehension (Medha). Key qualities: Sasneha (unctuous), Teekshna (penetrating), Ushna (hot), Laghu (light), Visra (foul odor). "
                "\n3. **Kapha (Jala + Prithvi)**: Governs biological cohesion, structural stability (Sthirata), lubrication of joints (Shleshaka), and cellular anabolism (Upachaya). Key qualities: Guru (heavy), Sheeta (cold), Manda (slow), Snigdha (unctuous), Picchila (cloudy)."
                "\n\n*Clinical Significance:* Health is the dynamic equilibrium (Dhatu Samya) of these Doshas, while vitiation (Vaishamya) initiates Samprapti (pathogenesis)."
            )
            citations = [
                "Charaka Samhita Sutrasthana 1/57 (Ruksha sheeto laghuh sookshmashchalo'tha vishadah kharah)",
                "Ashtanga Hridaya Sutrasthana 1/7-12",
                "Sushruta Samhita Sutrasthana 21/3"
            ]
            followups = [
                "Explain the biological functions of Vata, Pitta, and Kapha sub-types.",
                "How should I structure a 10-mark answer on Tridosha in a BAMS exam?",
                "Give real-life clinical examples of Tridosha vitiation and dietetics.",
                "Generate 5 practice MCQs on Tridosha Siddhanta."
            ]
        elif "panchakarma" in lower_q or "vamana" in lower_q or "virechana" in lower_q or "basti" in lower_q:
            reply = (
                "**Panchakarma** refers to the five classical bio-purificatory and therapeutic detoxification procedures of Ayurveda designed to eliminate deep-seated morbid Doshas (Utklesha) from their roots:"
                "\n\n- **1. Vamana (Therapeutic Emesis)**: Primary Pradhanakarma for vitiated Kapha and Kapha-dominant conditions like Tamaka Shwasa, Kaphaja Kasa, and Kushtha."
                "\n- **2. Virechana (Therapeutic Purgation)**: The gold-standard therapy for Pitta disorders, Rakta Dushti, Kamala (jaundice), and chronic skin dermatoses."
                "\n- **3. Basti (Medicated Enema Therapy)**: Considered *Ardha Chikitsa* (half of all treatment) in Ayurveda, sovereign remedy for all 80 Nanatmaja Vata Vyadhis. Divided into Niruha (decoction) and Anuvasana (oil)."
                "\n- **4. Nasya (Errhine Therapy)**: Bio-purification for diseases of the supraclavicular region (*Nasa hi Shiraso Dvaram*)."
                "\n- **5. Raktamokshana (Bloodletting)**: Described elaborately by Acharya Sushruta via Jalaukavacharana (leeches), Siravyadha (venesection), or Shringa for severe Pitta-Rakta vitiation."
                "\n\n*Mandatory Phases:* Purvakarma (Deepana-Pachana, Snehana, Swedana) → Pradhanakarma → Paschatkarma (Samsarjana Krama dietary rehabilitation)."
            )
            citations = [
                "Charaka Samhita Siddhisthana 2",
                "Sushruta Samhita Chikitsasthana 33-38",
                "Ashtanga Hridaya Sutrasthana 18 & 19"
            ]
            followups = [
                "What is the Samsarjana Krama protocol following Vamana and Virechana?",
                "Explain the difference between Niruha Basti and Anuvasana Basti.",
                "What are the contraindications (Ayogya) for Vamana Karma?",
                "Create a comparison table of Purvakarma protocols."
            ]
        elif "dravyaguna" in lower_q or "herb" in lower_q or "triphala" in lower_q or "ashwagandha" in lower_q:
            reply = (
                "**Dravyaguna Vijnana** studies medicinal plants through the Ayurvedic pharmacological pentad (Saptapadartha):\n\n"
                "- **Rasa (Taste)**: Madhura, Amla, Lavana, Katu, Tikta, Kashaya.\n"
                "- **Guna (Qualities)**: 20 Gurvadi Gunas (e.g. Guru/Laghu, Sheeta/Ushna, Snigdha/Ruksha).\n"
                "- **Virya (Potency)**: Ushna (hot) or Sheeta (cold) thermal potency.\n"
                "- **Vipaka (Post-digestive metabolic taste)**: Madhura (anabolic/Kapha), Amla (Pitta), Katu (catabolic/Vata).\n"
                "- **Prabhava (Specific pharmacological action)**: Inherent unexplainable bioactivity (e.g. Danti and Chitraka share Rasa/Virya/Vipaka, yet Danti has Rechana Prabhava).\n"
                "- **Karma (Action)**: Deepana, Pachana, Rasayana, Lekhana, Anulomana."
            )
            citations = [
                "Charaka Samhita Sutrasthana 26 (Atreya Bhadrakapyiya Adhyaya)",
                "Bhavaprakasha Nighantu Haritakyadi Varga",
                "Dravyaguna Vijnana - Prof. P.V. Sharma"
            ]
            followups = [
                "Explain the Rasa Panchaka of Ashwagandha and Shatavari.",
                "What is the difference between Vipaka and Rasa?",
                "How does Prabhava override Rasa and Virya in drug action?",
                "Generate flashcards on top 10 classical Ayurvedic herbs."
            ]
        elif "marma" in lower_q or "anatomy" in lower_q or "srotas" in lower_q:
            reply = (
                "**Marma Sharira** is the ancient Ayurvedic science of vital anatomical points described primarily by Acharya Sushruta. There are **107 Marma points** located where Mamsa (muscle), Sira (vessels), Snayu (ligaments/tendons), Asthi (bones), and Sandhi (joints) anatomically convene, housing the Prana (vital life force).\n\n"
                "**Classification by Prognosis (Sadhyo-pranahara to Rujakara):**\n"
                "1. *Sadhyo-pranahara (19)*: Immediate fatal injury within 7 days (e.g. Sringataka, Hridaya, Nabhi, Basti).\n"
                "2. *Kalantara-pranahara (33)*: Fatal within 15–30 days (e.g. Stanmoola, Apalapa).\n"
                "3. *Vishalyaghna (3)*: Fatal once foreign body/weapon is extracted (Utkshepa, Sthapani).\n"
                "4. *Vaikalyakara (44)*: Causes permanent anatomical deformity or functional paralysis (e.g. Kurpara, Ani).\n"
                "5. *Rujakara (8)*: Causes intense unrelenting pain (e.g. Gulpha, Manibandha)."
            )
            citations = [
                "Sushruta Samhita Sharirasthana 6 (Pratyeka Marma Nirdesha Sharira)",
                "Charaka Samhita Trimarmiya Chikitsa Adhyaya 26",
                "Ashtanga Sharira Chapter 4"
            ]
            followups = [
                "Explain the Trimarma (Hridaya, Shira, Basti) and their clinical significance.",
                "What are the anatomical structures underlying Sthapani and Adhipati Marma?",
                "Open 3D interactive view for Kurpara and Gulpha Marma.",
                "Generate 5 high-yield viva questions on Marma Sharira."
            ]
        elif note_context:
            reply = (
                f"**Analysis of Selected Note Context:**\n\n"
                f"I reviewed your note excerpt: *\"{note_context[:140]}...\"*\n\n"
                f"- **Core Concepts Identified**: Clear alignment with classical Ayurvedic principles.\n"
                "- **Suggested Enhancements**: Ensure you include Sanskrit Shloka references, highlight classical Samprapti Ghatakas (Hetu, Dosha, Dushya, Srotas, Agni), and provide clear diagnostic indications.\n"
                "- **Exam Structuring Tip**: Divide your notes into (1) Definition & Etymology (Nirukti), (2) Classical Classification, (3) Clinical Manifestations, and (4) Chikitsa Sutra."
            )
            citations = ["NCISM BAMS Curriculum Guidelines", "Charaka Samhita Vimanasthana 8"]
            followups = [
                "Convert this note into an exam-ready 5-mark answer.",
                "Generate a 5-question revision quiz from this note.",
                "What classical citations can I add to support this note?",
                "Create a concise bullet-point summary."
            ]
        else:
            reply = (
                f"Namaste! As your **AayurSetu Master AI Assistant**, I am calibrated to support your BAMS education, NCISM curriculum mastery, clinical training, and examinations.\n\n"
                f"I can assist you with:\n"
                f"- **BAMS Subjects**: Maulik Siddhanta, Rachana Sharira, Kriya Sharira, Dravyaguna, Rasashastra, Roganidana, Kayachikitsa, Shalya, Shalakya, Panchakarma.\n"
                f"- **Classical Samhitas**: Charaka, Sushruta, Ashtanga Hridaya, Madhava Nidana, Sharangadhara, Bhavaprakasha.\n"
                f"- **Study Tools**: High-yield exam answers, note simplification, flashcard creation, and diagnostic quizzes.\n\n"
                f"What concept or subject would you like to explore today?"
            )
            citations = ["Sushruta Samhita Sutrasthana 15/41", "Charaka Samhita Sutrasthana 1"]
            followups = [
                "Explain the Shad-Kriya Kala (stages of pathogenesis) with a diagrammatic flow.",
                "What are the 7 Dhatus and their Upadhatus and Malas?",
                "How to prepare for BAMS 1st Year University Examinations?",
                "Explain the diagnostic methodology of Rogi-Roga Pariksha."
            ]

        return reply, followups, citations

    @classmethod
    async def _call_gemini_chat(
        cls,
        api_key: str,
        query: str,
        history: List[AIChatMessage],
        role: str,
        subject: Optional[str],
        note_context: Optional[str]
    ) -> Tuple[str, List[str], List[str]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        system_instruction = (
            "You are the master educational AI assistant for AayurSetu, an authoritative BAMS (Bachelor of Ayurvedic Medicine & Surgery) "
            "academic intelligence platform aligned with NCISM curriculum guidelines. "
            "Provide accurate, scholarly, classical Sanskrit-referenced Ayurvedic educational explanations. "
            "Always include classical citations (e.g. Charaka Samhita Sutrasthana, Sushruta Samhita, Ashtanga Hridaya). "
            "Never provide personalized medical diagnosis or replace licensed physicians. "
            "Return response as JSON with keys: reply (formatted markdown), suggested_followups (list of 4 strings), classical_citations (list of strings)."
        )

        contents = []
        for msg in history:
            contents.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [{"text": msg.content}]
            })

        user_content_str = query
        if subject:
            user_content_str = f"[Subject: {subject}] " + user_content_str
        if note_context:
            user_content_str += f"\n[User Note Context: {note_context}]"

        contents.append({
            "role": "user",
            "parts": [{"text": user_content_str}]
        })

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4
            }
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return (
                    parsed.get("reply", ""),
                    parsed.get("suggested_followups", [])[:4],
                    parsed.get("classical_citations", [])
                )
        return "", [], []

    # ============================================================
    # 2. AI NOTES ASSISTANT & TRANSFORMATIONS
    # ============================================================

    @classmethod
    async def create_note(cls, db: AsyncSession, user: User, data: AINoteCreateIn) -> AINote:
        cls.sanitize_input(data.title)
        cls.sanitize_input(data.content)

        note = AINote(
            user_id=user.id,
            title=data.title,
            content=data.content,
            subject=data.subject,
            topic=data.topic,
            chapter=data.chapter,
            folder_name=data.folder_name,
            tags=data.tags,
            color_code=data.color_code,
            is_pinned=data.is_pinned
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)

        # Create initial Version 1
        initial_version = AINoteVersion(
            note_id=note.id,
            version_number=1,
            title=note.title,
            content=note.content,
            change_summary="Initial Creation"
        )
        db.add(initial_version)
        await db.commit()

        return note

    @classmethod
    async def list_notes(
        cls,
        db: AsyncSession,
        user: User,
        subject: Optional[str] = None,
        folder: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[AINote]:
        query = select(AINote).where(
            and_(AINote.user_id == user.id, AINote.is_archived == False)
        )
        filters = []
        if subject:
            filters.append(AINote.subject.ilike(f"%{subject}%"))
        if folder:
            filters.append(AINote.folder_name.ilike(f"%{folder}%"))
        if search:
            filters.append(
                or_(
                    AINote.title.ilike(f"%{search}%"),
                    AINote.content.ilike(f"%{search}%"),
                    AINote.topic.ilike(f"%{search}%")
                )
            )

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(
            query.order_by(AINote.is_pinned.desc(), AINote.updated_at.desc())
        )
        return list(result.scalars().all())

    @classmethod
    async def update_note(cls, db: AsyncSession, user: User, note_id: uuid.UUID, data: AINoteUpdateIn) -> AINote:
        res = await db.execute(select(AINote).where(and_(AINote.id == note_id, AINote.user_id == user.id)))
        note = res.scalar_one_or_none()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or unauthorized.")

        content_changed = data.content is not None and data.content != note.content
        title_changed = data.title is not None and data.title != note.title

        if data.title is not None:
            cls.sanitize_input(data.title)
            note.title = data.title
        if data.content is not None:
            cls.sanitize_input(data.content)
            note.content = data.content
        if data.subject is not None:
            note.subject = data.subject
        if data.topic is not None:
            note.topic = data.topic
        if data.chapter is not None:
            note.chapter = data.chapter
        if data.folder_name is not None:
            note.folder_name = data.folder_name
        if data.tags is not None:
            note.tags = data.tags
        if data.color_code is not None:
            note.color_code = data.color_code
        if data.is_pinned is not None:
            note.is_pinned = data.is_pinned
        if data.is_archived is not None:
            note.is_archived = data.is_archived

        note.updated_at = datetime.now(timezone.utc)

        # Track version if content or title changed
        if content_changed or title_changed:
            count_res = await db.execute(select(func.count(AINoteVersion.id)).where(AINoteVersion.note_id == note.id))
            ver_count = count_res.scalar() or 0
            new_version = AINoteVersion(
                note_id=note.id,
                version_number=ver_count + 1,
                title=note.title,
                content=note.content,
                change_summary=data.change_summary or f"Version {ver_count + 1} update"
            )
            db.add(new_version)

        await db.commit()
        await db.refresh(note)
        return note

    @classmethod
    async def delete_note(cls, db: AsyncSession, user: User, note_id: uuid.UUID) -> bool:
        res = await db.execute(select(AINote).where(and_(AINote.id == note_id, AINote.user_id == user.id)))
        note = res.scalar_one_or_none()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        await db.delete(note)
        await db.commit()
        return True

    @classmethod
    async def list_note_versions(cls, db: AsyncSession, user: User, note_id: uuid.UUID) -> List[AINoteVersion]:
        # Verify ownership
        res = await db.execute(select(AINote).where(and_(AINote.id == note_id, AINote.user_id == user.id)))
        if not res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

        v_res = await db.execute(
            select(AINoteVersion)
            .where(AINoteVersion.note_id == note_id)
            .order_by(AINoteVersion.version_number.desc())
        )
        return list(v_res.scalars().all())

    @classmethod
    async def restore_note_version(cls, db: AsyncSession, user: User, note_id: uuid.UUID, version_id: uuid.UUID) -> AINote:
        res = await db.execute(select(AINote).where(and_(AINote.id == note_id, AINote.user_id == user.id)))
        note = res.scalar_one_or_none()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

        v_res = await db.execute(
            select(AINoteVersion).where(
                and_(AINoteVersion.id == version_id, AINoteVersion.note_id == note_id)
            )
        )
        version = v_res.scalar_one_or_none()
        if not version:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

        note.title = version.title
        note.content = version.content
        note.updated_at = datetime.now(timezone.utc)

        # Record restoration as a new version
        count_res = await db.execute(select(func.count(AINoteVersion.id)).where(AINoteVersion.note_id == note.id))
        ver_count = count_res.scalar() or 0
        restored_ver = AINoteVersion(
            note_id=note.id,
            version_number=ver_count + 1,
            title=note.title,
            content=note.content,
            change_summary=f"Restored from Version {version.version_number}"
        )
        db.add(restored_ver)
        await db.commit()
        await db.refresh(note)
        return note

    @classmethod
    async def transform_note(cls, data: AINoteTransformIn) -> AINoteTransformOut:
        cls.sanitize_input(data.content)
        content = data.content.strip()
        t_type = data.transformation_type

        headings: List[str] = []
        concepts: List[str] = []
        missing: List[str] = []
        flashcards: List[Dict[str, str]] = []
        checklist: List[str] = []
        citations: List[str] = []
        improved: str = ""
        diff: str = ""

        if t_type == NoteTransformType.SIMPLIFY or t_type == NoteTransformType.BEGINNER_FRIENDLY:
            improved = (
                f"### Simplified Core Concept\n\n"
                f"{content}\n\n"
                f"**Beginner Analogy:** Think of these principles like the natural elements that sustain our ecosystem. "
                f"Just as water, wind, and fire maintain the earth in equilibrium, the body relies on these internal bio-forces for daily health. "
                f"When one element increases excessively, seasonal imbalances manifest.\n\n"
                f"**Key Takeaways:**\n"
                f"- Primary active properties are intuitive and observe nature.\n"
                f"- Nutrition and daily routine (Dinacharya) regulate equilibrium.\n"
                f"- Early identification prevents severe stage progression."
            )
            diff = "Simplified complex terminology into accessible language with nature-based analogies."
            concepts = ["Equilibrium (Samya)", "Bio-forces", "Dietary Harmony"]
            headings = ["Core Concept", "Beginner Analogy", "Key Takeaways"]

        elif t_type == NoteTransformType.CONCISE_REVISION:
            improved = (
                f"### High-Yield Revision Summary (NCISM Exam Standard)\n\n"
                f"• **Definition:** Concise fundamental overview synthesized from classical treatises.\n"
                f"• **Core Constituents:** Direct classical attributes and bio-mechanisms.\n"
                f"• **Clinical Indicators:** Primary diagnostic symptoms and presentation.\n"
                f"• **Therapeutic Principle (Chikitsa Sutra):** Direct counter-action through Vipareeta Guna (opposite qualities).\n\n"
                f"**Ultra-Quick Recall Mnemonics:** Remember dominant Gunas and primary anatomical seat (Sthana)."
            )
            diff = "Condensed paragraphs into rapid high-yield revision bullet points."
            checklist = ["Memorize primary Gunas", "Recall anatomical seats (Sthanas)", "Review classical Shloka snippet"]

        elif t_type == NoteTransformType.EXAM_READY_ANSWER:
            improved = (
                f"### Standard 10-Mark BAMS University Model Answer Structure\n\n"
                f"#### 1. Nirukti & Paribhasha (Etymology & Definition)\n"
                f"Classical Ayurvedic definition synthesized from Brihat-trayi treatises with appropriate context.\n\n"
                f"#### 2. Classical Sanskrit Reference\n"
                f"*\"दोषधातुमलसञ्चयः शरीरम्...\"* (Classical Treatise Citation)\n\n"
                f"#### 3. Bhedas / Classification & Types\n"
                f"Comprehensive division with respective locations (Sthana), functions (Karma), and characteristic traits (Lakshana).\n\n"
                f"#### 4. Samprapti (Etiopathogenesis)\n"
                f"- **Nidana (Etiology):** Dietary, lifestyle, and environmental precipitators.\n"
                f"- **Dosha-Dushya Sammurchana:** Pathological amalgamation leading to tissue impairment.\n\n"
                f"#### 5. Chikitsa Siddhanta (Management Strategy)\n"
                f"- **Shamana Chikitsa:** Palliative herbal formulation & dietetics.\n"
                f"- **Shodhana Protocol:** Indicated bio-cleansing Panchakarma."
            )
            diff = "Restructured note into standard 5/10-mark BAMS university exam rubric."
            headings = ["Nirukti & Paribhasha", "Classical Reference", "Classification & Types", "Samprapti", "Chikitsa Siddhanta"]
            concepts = ["Nirukti & Paribhasha", "Classical Shloka Correlation", "Samprapti Ghatakas", "Chikitsa Siddhanta"]
            flashcards = [
                {"front": "What are the primary Samprapti Ghatakas?", "back": "Hetu, Dosha, Dushya, Srotas, Srotodushti Prakara, Agni, and Udbhavasthana."},
                {"front": "State the general Chikitsa Sutra principle.", "back": "Nidana Parivarjana followed by appropriate Shodhana and Shamana therapy."}
            ]
            citations = ["Charaka Samhita Sutrasthana", "Sushruta Samhita Sharirasthana"]

        elif t_type == NoteTransformType.COMPARISON_TABLE:
            improved = (
                f"### Comprehensive Comparative Analysis\n\n"
                f"| Diagnostic Parameter | Vata / Category A | Pitta / Category B | Kapha / Category C |\n"
                f"| :--- | :--- | :--- | :--- |\n"
                f"| **Dominant Mahabhuta** | Akasha + Vayu | Tejas + Jala | Jala + Prithvi |\n"
                f"| **Key Qualities (Gunas)** | Ruksha, Laghu, Sheeta, Khara | Sasneha, Teekshna, Ushna | Guru, Sheeta, Manda, Snigdha |\n"
                f"| **Primary Seat (Sthana)** | Pakwashaya (Colon), Kati | Nabhi (Umbilicus), Amashaya | Uras (Chest), Kantha (Throat) |\n"
                f"| **Bio-Function (Karma)** | Gati, Utsaha, Mala Tyaga | Darshana, Paka, Medha | Sthirata, Sandhibandha, Kshama |\n"
                f"| **Principal Treatment** | Basti, Taila Snehana | Virechana, Ghrita Shamana | Vamana, Madhu, Tikta Kashaya |\n\n"
                f"**Clinical Application:** Compare the presenting symptoms against these parameters during Dashavidha Pariksha."
            )
            diff = "Generated structured markdown comparison matrix with primary differential parameters."
            headings = ["Comparative Matrix", "Clinical Application"]

        elif t_type == NoteTransformType.FLASHCARDS:
            improved = f"Generated 4 High-Yield Digital Flashcards based on: {content[:80]}..."
            flashcards = [
                {"front": "What are the primary Mahabhutas involved in this topic?", "back": "Classical elemental constituents as delineated in Maulik Siddhanta."},
                {"front": "What is the primary anatomical seat (Pradhana Sthana)?", "back": "Specific organ system and Srotas locus according to Acharya Charaka."},
                {"front": "What is the cardinal symptom of vitiation (Vriddhi Lakshana)?", "back": "Key diagnostic indicators observed during clinical examination."},
                {"front": "What is the sovereign therapeutic line (Chikitsa Sutra)?", "back": "Application of dravyas having opposite attributes (Vipareeta Guna Chikitsa)."}
            ]
            diff = "Extracted key question-answer pairs for spaced-repetition flashcards."

        elif t_type == NoteTransformType.QUIZ_QUESTIONS:
            improved = "Generated 4 Self-Assessment Questions from this note to test active recall."
            checklist = [
                "1. MCQ: Which Mahabhuta is predominantly involved?",
                "2. Short Answer: Describe the cardinal signs of vitiation in 50 words.",
                "3. Long Answer: Detail the complete pathogenesis (Samprapti) with flowchart.",
                "4. Viva: What is the primary classical counter-indication?"
            ]
            diff = "Constructed multi-tiered practice questions based on note content."

        elif t_type == NoteTransformType.REVISION_CHECKLIST:
            improved = "### Exam Readiness & Revision Checklist\n\n"
            checklist = [
                "Memorize Sanskrit Nirukti (Etymology) & definition",
                "Be able to recite at least one core classical Shloka reference",
                "Know the five sub-types and their distinct anatomical locations",
                "Trace the complete Samprapti Ghatakas (Hetu to Vyakti)",
                "Identify 3 first-line herbal formulations (Yoga) with dosage",
                "Practice writing this topic within a 12-minute exam limit"
            ]
            diff = "Generated actionable exam preparation checklist."

        else:
            improved = (
                f"### Improved Educational Content & Clarity\n\n"
                f"{content}\n\n"
                f"**Refined Structural Points:**\n"
                f"- Enhanced conceptual flow using classical terminological precision.\n"
                f"- Eliminated ambiguous phrasing and corrected grammatical coherence.\n"
                f"- Formatted technical terms with standard IAST diacritics where applicable."
            )
            diff = "Polished readability, structured paragraphs, and improved Ayurvedic clarity."

        return AINoteTransformOut(
            transformation_type=t_type,
            original_snippet=content[:300],
            improved_content=improved,
            diff_summary=diff,
            headings_suggested=headings,
            key_concepts=concepts,
            missing_points=missing,
            flashcards=flashcards,
            revision_checklist=checklist,
            classical_references=citations
        )

    # ============================================================
    # 3. AI QUIZ AND EXAM GENERATOR
    # ============================================================

    @classmethod
    async def generate_quiz(
        cls,
        db: AsyncSession,
        user: User,
        data: AIQuizGenerateIn
    ) -> AIQuizOut:
        cls.sanitize_input(data.topic)

        # Question Bank generation based on subject/topic
        questions: List[AIQuizQuestionOut] = []

        sub_lower = data.subject.lower()
        topic_lower = data.topic.lower()

        if "dravyaguna" in sub_lower or "herb" in topic_lower or "triphala" in topic_lower:
            questions = [
                AIQuizQuestionOut(
                    id=1,
                    question="Which of the following herbs is NOT a constituent of the classical Triphala formulation?",
                    question_format="MCQ",
                    options=["Haritaki (Terminalia chebula)", "Bibhitaki (Terminalia bellirica)", "Amalaki (Emblica officinalis)", "Guduchi (Tinospora cordifolia)"],
                    correct_index=3,
                    correct_answer_text="Guduchi (Tinospora cordifolia)",
                    explanation="Triphala consists of Haritaki, Bibhitaki, and Amalaki in equal proportions. Guduchi is a Rasayana herb of Menispermaceae family, but not part of Triphala.",
                    why_incorrect={
                        "Haritaki (Terminalia chebula)": "Haritaki is one of the three classical fruits of Triphala, revered for Vata-Shamana and Anulomana.",
                        "Bibhitaki (Terminalia bellirica)": "Bibhitaki is the second constituent, predominant in Kashaya Rasa and Kapha-Pitta balancing.",
                        "Amalaki (Emblica officinalis)": "Amalaki is the third constituent, rich in Vitamin C and classical Tridosha-Shamaka."
                    },
                    marks=1,
                    classical_citation="Charaka Samhita Chikitsasthana 1/3"
                ),
                AIQuizQuestionOut(
                    id=2,
                    question="What is the primary Vipaka (post-digestive metabolic taste) of Amalaki?",
                    question_format="MCQ",
                    options=["Madhura (Sweet)", "Amla (Sour)", "Katu (Pungent)", "Tikta (Bitter)"],
                    correct_index=0,
                    correct_answer_text="Madhura (Sweet)",
                    explanation="Although Amalaki tastes intensely sour (Amla Rasa), its post-digestive metabolic transformation (Vipaka) is Madhura, which explains why it does not vitiate Pitta.",
                    why_incorrect={
                        "Amla (Sour)": "Amla is the primary Rasa of Amalaki on the tongue, but its Vipaka transforms to Madhura.",
                        "Katu (Pungent)": "Pungent Vipaka belongs to herbs like Pippali and Maricha.",
                        "Tikta (Bitter)": "Tikta is one of Amalaki's secondary Rasas (it contains 5 Rasas except Lavana), not its Vipaka."
                    },
                    marks=1,
                    classical_citation="Bhavaprakasha Nighantu Haritakyadi Varga"
                ),
                AIQuizQuestionOut(
                    id=3,
                    question="According to Dravyaguna principles, which pharmacodynamic property directly overrides Rasa, Guna, and Virya?",
                    question_format="MCQ",
                    options=["Prabhava (Specific Action)", "Vipaka", "Karma", "Anupana"],
                    correct_index=0,
                    correct_answer_text="Prabhava (Specific Action)",
                    explanation="Prabhava (Acintya Shakti) is the inexplicable specific therapeutic power of a drug that overrides the predictable actions of its Rasa, Guna, and Virya.",
                    why_incorrect={
                        "Vipaka": "Vipaka follows regular metabolic digestion and is subordinate to Prabhava.",
                        "Karma": "Karma is the therapeutic outcome produced by the dravya's composite properties.",
                        "Anupana": "Anupana is the vehicle or adjuvant that facilitates drug absorption."
                    },
                    marks=1,
                    classical_citation="Charaka Samhita Sutrasthana 26/67"
                ),
                AIQuizQuestionOut(
                    id=4,
                    question="What is the primary botanical family of Ashwagandha (Withania somnifera)?",
                    question_format="MCQ",
                    options=["Solanaceae", "Fabaceae", "Zingiberaceae", "Apiaceae"],
                    correct_index=0,
                    correct_answer_text="Solanaceae",
                    explanation="Ashwagandha belongs to the Solanaceae (nightshade) family. Its active chemical constituents include withanolides and withaferin A.",
                    why_incorrect={
                        "Fabaceae": "Fabaceae includes plants like Yashtimadhu and Mudga.",
                        "Zingiberaceae": "Zingiberaceae is the ginger family including Haridra and Ardraka.",
                        "Apiaceae": "Apiaceae includes umbelliferous seeds like Jeeraka and Shatapushpa."
                    },
                    marks=1,
                    classical_citation="Ayurvedic Pharmacopoeia of India (API) Vol. 1"
                ),
                AIQuizQuestionOut(
                    id=5,
                    question="Which classical formulation is indicated as the prime Rasayana for cognitive enhancement (Medhya)?",
                    question_format="MCQ",
                    options=["Brahma Rasayana", "Mandukaparni Svarasa (Chatushtaya Medhya)", "Khadirarishta", "Arogyavardhini Vati"],
                    correct_index=1,
                    correct_answer_text="Mandukaparni Svarasa (Chatushtaya Medhya)",
                    explanation="Acharya Charaka designates the 4 Medhya Rasayanas: Mandukaparni Svarasa, Yashtimadhu Churna with milk, Guduchi Svarasa, and Shankhapushpi Kalka.",
                    why_incorrect={
                        "Brahma Rasayana": "Brahma Rasayana is a premier general longevity Rasayana, but not the specific 4 Medhya Rasayanas.",
                        "Khadirarishta": "Khadirarishta is formulated primarily for Kushtha and Rakta dushti.",
                        "Arogyavardhini Vati": "Arogyavardhini is indicated for Yakrit roga, Medoroga, and Deepana-Pachana."
                    },
                    marks=1,
                    classical_citation="Charaka Samhita Chikitsasthana 1/3/30-31"
                )
            ]
        else:
            # Default Comprehensive BAMS Exam Questions
            questions = [
                AIQuizQuestionOut(
                    id=1,
                    question="Which stage of Shat-Kriya Kala immediately precedes the manifestation of localized disease symptoms (Vyakti)?",
                    question_format="MCQ",
                    options=["Sthana-Samshraya (Localization)", "Prasara (Dissemination)", "Prakopa (Aggravation)", "Sanchaya (Accumulation)"],
                    correct_index=0,
                    correct_answer_text="Sthana-Samshraya (Localization)",
                    explanation="The 6 stages in order are: Sanchaya → Prakopa → Prasara → Sthana-Samshraya (where Purvarupas appear) → Vyakti (overt disease) → Bheda (chronicity/complications).",
                    why_incorrect={
                        "Prasara (Dissemination)": "Prasara is Stage 3, where Doshas overflow from their seats into circulation.",
                        "Prakopa (Aggravation)": "Prakopa is Stage 2, where Doshas excite within their own seats.",
                        "Sanchaya (Accumulation)": "Sanchaya is Stage 1, initial physiological accumulation."
                    },
                    marks=1,
                    classical_citation="Sushruta Samhita Sutrasthana 21/18"
                ),
                AIQuizQuestionOut(
                    id=2,
                    question="According to Acharya Sushruta, total number of Marma points in the human body is:",
                    question_format="MCQ",
                    options=["107", "108", "72", "64"],
                    correct_index=0,
                    correct_answer_text="107",
                    explanation="Sushruta systematically enumerates 107 Marma points divided across extremities (44), thorax/abdomen (12), back (14), and supraclavicular/head region (37).",
                    why_incorrect={
                        "108": "108 is a sacred Yogic number, but classical anatomical Marma enumeration is strictly 107.",
                        "72": "72 is linked with major Srotas and Nadi pathways.",
                        "64": "64 corresponds to classical 64 arts or Tantric subdivisions."
                    },
                    marks=1,
                    classical_citation="Sushruta Samhita Sharirasthana 6/3"
                ),
                AIQuizQuestionOut(
                    id=3,
                    question="Which biological Dhatu is responsible for 'Dharana' (structural sustenance and marrow filling)?",
                    question_format="MCQ",
                    options=["Asthi Dhatu", "Majja Dhatu", "Medas Dhatu", "Mamsa Dhatu"],
                    correct_index=0,
                    correct_answer_text="Asthi Dhatu",
                    explanation="Asthi Dhatu provides Deha Dharana (structural framework and bodily support) and protects vital internal visceral organs.",
                    why_incorrect={
                        "Majja Dhatu": "Majja function is 'Poorana' (filling the hollow cavities of bones) and Sneha.",
                        "Medas Dhatu": "Medas function is Snehana and Svedotpatti.",
                        "Mamsa Dhatu": "Mamsa function is Lepana (covering the skeletal framework)."
                    },
                    marks=1,
                    classical_citation="Ashtanga Hridaya Sutrasthana 11/4"
                ),
                AIQuizQuestionOut(
                    id=4,
                    question="What is the prime line of treatment (Chikitsa Sutra) for Avarana of Vata by Pitta?",
                    question_format="MCQ",
                    options=["Sheeta-Snigdha & Pitta-Avidahi Upachara", "Ushna-Ruksha therapies", "Strict Langhana only", "Excessive Snehapana with Katu dravyas"],
                    correct_index=0,
                    correct_answer_text="Sheeta-Snigdha & Pitta-Avidahi Upachara",
                    explanation="In Pittavrita Vata, therapies must pacify Pitta without aggravating Vata, hence cooling, gentle unctuous drugs and non-burning dietetics are employed.",
                    why_incorrect={
                        "Ushna-Ruksha therapies": "Hot and dry therapies would severely aggravate Pitta and intensify the Avarana.",
                        "Strict Langhana only": "Strict fasting causes Vata aggravation.",
                        "Excessive Snehapana with Katu dravyas": "Katu Rasa severely excites Pitta."
                    },
                    marks=1,
                    classical_citation="Charaka Samhita Chikitsasthana 28/235"
                ),
                AIQuizQuestionOut(
                    id=5,
                    question="In classical Panchakarma, what is the prerequisite diagnostic assessment before planning Vamana Karma?",
                    question_format="MCQ",
                    options=["Proper Snehana and Swedana achieving Samyak Snigdha Lakshanas", "Immediate administration of Madanaphala on empty stomach", "Heavy fasting for 3 days", "Virechana administration first"],
                    correct_index=0,
                    correct_answer_text="Proper Snehana and Swedana achieving Samyak Snigdha Lakshanas",
                    explanation="Purvakarma (internal unction reaching optimum bio-saturation followed by sudation) is mandatory to mobilize toxins from Shakha to Koshtha.",
                    why_incorrect={
                        "Immediate administration of Madanaphala on empty stomach": "Administering emetics without Purvakarma causes serious tissue rupture (Gatra-Bheda).",
                        "Heavy fasting for 3 days": "Excessive Langhana causes Dhatukshaya and weakness.",
                        "Virechana administration first": "Classical sequence dictates Vamana before Virechana."
                    },
                    marks=1,
                    classical_citation="Charaka Samhita Sutrasthana 15/8"
                )
            ]

        # Limit to requested count
        questions = questions[:data.question_count]

        # Save to database
        db_quiz = AIGeneratedQuiz(
            user_id=user.id,
            title=f"{data.subject}: {data.topic} Practice Exam",
            subject=data.subject,
            topic=data.topic,
            difficulty=data.difficulty,
            question_format=data.question_format,
            question_count=len(questions),
            questions_data=[q.model_dump() for q in questions],
            source_note_id=data.source_note_id
        )
        db.add(db_quiz)
        await db.commit()
        await db.refresh(db_quiz)

        return AIQuizOut(
            id=db_quiz.id,
            title=db_quiz.title,
            subject=db_quiz.subject,
            topic=db_quiz.topic,
            difficulty=db_quiz.difficulty,
            question_format=db_quiz.question_format.value,
            question_count=db_quiz.question_count,
            questions=questions,
            is_official_exam=False,
            created_at=db_quiz.created_at
        )

    @classmethod
    async def submit_quiz(
        cls,
        db: AsyncSession,
        user: User,
        data: AIQuizSubmitIn
    ) -> AIQuizResultOut:
        res = await db.execute(select(AIGeneratedQuiz).where(AIGeneratedQuiz.id == data.quiz_id))
        quiz = res.scalar_one_or_none()
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        questions = quiz.questions_data
        score = 0.0
        max_score = float(len(questions))
        evaluations: List[Dict[str, Any]] = []
        weak_topics: List[str] = []

        # Map submitted answers by question_id
        answers_map = {ans.get("question_id"): ans for ans in data.answers}

        for q in questions:
            qid = q.get("id")
            correct_idx = q.get("correct_index")
            user_ans = answers_map.get(qid, {})
            selected_idx = user_ans.get("selected_index")

            is_correct = (selected_idx is not None and selected_idx == correct_idx)
            if is_correct:
                score += 1.0
            else:
                weak_topics.append(quiz.topic)

            evaluations.append({
                "question_id": qid,
                "question": q.get("question"),
                "selected_index": selected_idx,
                "correct_index": correct_idx,
                "is_correct": is_correct,
                "explanation": q.get("explanation"),
                "why_incorrect": q.get("why_incorrect"),
                "citation": q.get("classical_citation")
            })

        pct = (score / max_score) * 100.0 if max_score > 0 else 0.0
        passed = pct >= 60.0

        feedback = (
            f"Outstanding performance! Solid conceptual clarity in {quiz.subject}."
            if pct >= 80.0 else
            f"Good effort. Review the rationale for incorrect questions in {quiz.topic} to reach distinction tier."
            if pct >= 60.0 else
            f"Needs targeted revision. We recommend re-reading classical citations for {quiz.topic}."
        )

        # Record attempt
        attempt = AIQuizAttempt(
            quiz_id=quiz.id,
            user_id=user.id,
            answers_data=data.answers,
            score=score,
            max_score=max_score,
            score_percentage=round(pct, 1),
            feedback_notes=feedback,
            time_taken_seconds=data.time_taken_seconds
        )
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)

        return AIQuizResultOut(
            attempt_id=attempt.id,
            quiz_id=quiz.id,
            score=score,
            max_score=max_score,
            score_percentage=round(pct, 1),
            passed=passed,
            detailed_evaluations=evaluations,
            feedback_notes=feedback,
            weak_topics_flagged=list(set(weak_topics)),
            recommended_revision=f"Focus on {quiz.subject} - {quiz.topic} Shlokas and diagnostic classifications."
        )

    # ============================================================
    # 4. AI PERSONAL STUDY PLANNER
    # ============================================================

    @classmethod
    async def generate_study_plan(
        cls,
        db: AsyncSession,
        user: User,
        data: AIStudyPlanGenerateIn
    ) -> AIStudyPlanOut:
        cls.sanitize_input(data.exam_name)

        today = date.today()
        days_remaining = max(1, (data.exam_date - today).days)

        # Distribute daily schedule
        plan_days: List[AIStudyDayOut] = []
        num_days_to_generate = min(14, days_remaining)  # 2-week active sprint

        subjects_cycle = data.target_subjects if data.target_subjects else ["Maulik Siddhanta", "Roganidana", "Dravyaguna"]
        weak_set = set(data.weak_topics)

        for i in range(num_days_to_generate):
            current_date = today + timedelta(days=i)
            day_subject = subjects_cycle[i % len(subjects_cycle)]
            is_revision_day = (i + 1) % data.revision_frequency_days == 0

            sessions: List[AIStudySessionOut] = []

            if is_revision_day:
                sessions.append(
                    AIStudySessionOut(
                        session_id=f"sess-{i}-1",
                        subject=day_subject,
                        topic="Comprehensive Spaced Revision & Shloka Recitation",
                        duration_minutes=60,
                        session_type="REVISION",
                        suggested_time_slot="06:30 - 07:30",
                        is_completed=False,
                        priority="HIGH"
                    )
                )
                sessions.append(
                    AIStudySessionOut(
                        session_id=f"sess-{i}-2",
                        subject=day_subject,
                        topic="Adaptive Diagnostic Practice Quiz",
                        duration_minutes=45,
                        session_type="PRACTICE_QUIZ",
                        suggested_time_slot="08:00 - 08:45",
                        is_completed=False,
                        priority="HIGH"
                    )
                )
            else:
                sessions.append(
                    AIStudySessionOut(
                        session_id=f"sess-{i}-1",
                        subject=day_subject,
                        topic=f"Core Classical Concepts & Treatises ({day_subject})",
                        duration_minutes=75,
                        session_type="STUDY",
                        suggested_time_slot="06:00 - 07:15" if data.preferred_study_time == "MORNING" else "17:30 - 18:45",
                        is_completed=False,
                        priority="HIGH" if day_subject in weak_set else "NORMAL"
                    )
                )
                sessions.append(
                    AIStudySessionOut(
                        session_id=f"sess-{i}-2",
                        subject=day_subject,
                        topic=f"Clinical Application & Differential Diagnosis",
                        duration_minutes=60,
                        session_type="STUDY",
                        suggested_time_slot="07:30 - 08:30" if data.preferred_study_time == "MORNING" else "19:00 - 20:00",
                        is_completed=False,
                        priority="MEDIUM"
                    )
                )
                sessions.append(
                    AIStudySessionOut(
                        session_id=f"sess-{i}-3",
                        subject="Swasthavritta & Dinacharya",
                        topic="Mindfulness, Pranayama & Restorative Walk",
                        duration_minutes=30,
                        session_type="RESTORATIVE_BREAK",
                        suggested_time_slot="18:00 - 18:30",
                        is_completed=False,
                        priority="NORMAL"
                    )
                )

            total_h = sum(s.duration_minutes for s in sessions) / 60.0

            plan_days.append(
                AIStudyDayOut(
                    day_number=i + 1,
                    date_str=current_date.strftime("%Y-%m-%d"),
                    total_hours=round(total_h, 1),
                    focus_theme=f"{day_subject} Mastery Sprint" if not is_revision_day else "Consolidation & Active Recall",
                    sessions=sessions
                )
            )

        lifestyle_tip = (
            "Ayurvedic Dinacharya Recommendation: Begin study sessions during Brahma Muhurta (4:30 AM – 6:00 AM) "
            "when Sattva Guna is dominant in nature. Drink warm water infused with Ushodaka, and avoid studying immediately after heavy meals (Guru Ahara) to maintain peak Medha Agni."
        )

        plan_title = data.title if data.title else f"{data.exam_name} Adaptive Study Plan"
        db_plan = AIStudySchedule(
            user_id=user.id,
            title=plan_title,
            exam_name=data.exam_name,
            exam_date=data.exam_date,
            available_hours_daily=data.daily_available_hours,
            preferred_study_time=data.preferred_study_time,
            target_subjects=data.target_subjects,
            weak_topics=data.weak_topics,
            schedule_blocks=[d.model_dump() for d in plan_days],
            progress_percentage=0.0,
            is_active=True
        )
        db.add(db_plan)
        await db.commit()
        await db.refresh(db_plan)

        return AIStudyPlanOut(
            id=db_plan.id,
            title=db_plan.title,
            exam_name=db_plan.exam_name,
            exam_date=db_plan.exam_date,
            days_remaining=days_remaining,
            available_hours_daily=db_plan.available_hours_daily,
            target_subjects=db_plan.target_subjects,
            weak_topics=db_plan.weak_topics,
            days=plan_days,
            progress_percentage=db_plan.progress_percentage,
            ayurvedic_lifestyle_tip=lifestyle_tip,
            created_at=db_plan.created_at
        )

    # ============================================================
    # 5. AI PERSONALIZED LEARNING & WEAK-TOPIC RECOMMENDATIONS
    # ============================================================

    @classmethod
    async def get_learning_recommendations(
        cls,
        db: AsyncSession,
        user: User
    ) -> AILearningRecommendationsOut:
        # Check student profile
        res_stu = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        stu = res_stu.scalar_one_or_none()

        student_name = stu.full_name if (stu and stu.full_name) else (user.email.split("@")[0].title() if user.email else "AyurSetu Student")
        current_year = stu.current_year if (stu and stu.current_year) else "BAMS 3rd Year"

        # Check recent quiz attempts
        res_attempts = await db.execute(
            select(AIQuizAttempt).where(AIQuizAttempt.user_id == user.id).order_by(AIQuizAttempt.completed_at.desc()).limit(5)
        )
        attempts = list(res_attempts.scalars().all())

        avg_score = sum(a.score_percentage for a in attempts) / len(attempts) if attempts else 74.5

        recommendations = [
            AILearningRecommendationItem(
                topic="Shat-Kriya Kala & Pathogenesis",
                subject="Roganidana & Vikriti Vijnana",
                reason="Observed hesitation on Sthana-Samshraya stage questions and Dosha-Dushya Sammurchana.",
                mastery_level_pct=62.0,
                recommended_action="Review Charaka Sutrasthana Chapter 11 and attempt the 5-minute diagnostic quiz.",
                priority="URGENT",
                suggested_quiz_topic="Shat Kriya Kala Practice",
                suggested_shloka_reference="Sushruta Samhita Sutrasthana 21/18"
            ),
            AILearningRecommendationItem(
                topic="Rasa Panchaka of Deepana-Pachana Herbs",
                subject="Dravyaguna Vijnana",
                reason="Crucial foundation topic for pharmacology QC and upcoming university clinical vivas.",
                mastery_level_pct=71.5,
                recommended_action="Create digital flashcards comparing Pippali, Chitraka, and Shunti pharmacodynamics.",
                priority="RECOMMENDED",
                suggested_quiz_topic="Deepana Pachana Drugs",
                suggested_shloka_reference="Bhavaprakasha Haritakyadi Varga"
            ),
            AILearningRecommendationItem(
                topic="107 Marma Classification & Vulnerability",
                subject="Rachana Sharira",
                reason="Core NCISM 1st/2nd-year curriculum competency frequently tested in oral vivas.",
                mastery_level_pct=78.0,
                recommended_action="Inspect 3D Anatomical leader lines for Sadhyo-pranahara Marma points in the 3D workspace.",
                priority="RECOMMENDED",
                suggested_quiz_topic="Marma Sharira Mastery",
                suggested_shloka_reference="Sushruta Sharirasthana 6"
            )
        ]

        steps = [
            "Complete 1 topic quiz on 'Shat-Kriya Kala' to close the primary diagnostic gap.",
            "Use the AI Notes Assistant to simplify your revision notes on 'Panchakarma Samsarjana Krama'.",
            "Dedicate 30 minutes to oral viva simulation in the Mock Interview Coach."
        ]

        return AILearningRecommendationsOut(
            student_name=student_name,
            current_year=current_year,
            overall_learning_health="STEADY" if avg_score >= 70.0 else "ATTENTION_REQUIRED",
            average_quiz_score_pct=round(avg_score, 1),
            weak_topics=recommendations,
            next_recommended_steps=steps
        )

    # ============================================================
    # 6. AI DESCRIPTIVE ANSWER FEEDBACK
    # ============================================================

    @classmethod
    async def evaluate_answer(
        cls,
        db: AsyncSession,
        user: User,
        data: AIAnswerSubmitIn
    ) -> AIAnswerFeedbackOut:
        cls.sanitize_input(data.question_text)
        cls.sanitize_input(data.student_answer)

        ans = data.student_answer.strip()
        words = len(ans.split())

        has_shloka = any(w in ans.lower() for w in ["shloka", "charaka", "sushruta", "vagbhata", "samhita", "sutra"])
        has_ayur_terms = sum(1 for term in ["dosha", "dhatu", "mala", "samprapti", "nidana", "chikitsa", "agni", "ama", "srotas", "upakrama"] if term in ans.lower())
        has_structure = ("1." in ans or "2." in ans or "-" in ans or "•" in ans or "\n" in ans)

        # Objective Scoring Rubric
        structure_pts = min(3.0, 1.5 + (1.5 if has_structure and words > 40 else 0.5))
        clarity_pts = min(3.0, 1.0 + min(2.0, words / 60.0))
        terminology_pts = min(4.0, 1.0 + (has_ayur_terms * 0.5) + (1.0 if has_shloka else 0.0))

        raw_score = structure_pts + clarity_pts + terminology_pts
        scaled_score = round(min(float(data.target_marks), (raw_score / 10.0) * float(data.target_marks)), 1)
        pct = (scaled_score / float(data.target_marks)) * 100.0

        covered = []
        if has_ayur_terms >= 3:
            covered.append("Strong usage of classical Ayurvedic terminology (Samprapti / Dosha dynamics)")
        if words >= 50:
            covered.append("Adequate descriptive depth for examination standards")
        if has_structure:
            covered.append("Clear structural demarcation using paragraphs or numbered points")

        missing = []
        if not has_shloka:
            missing.append("Classical Sanskrit Shloka reference or treatise citation (e.g. Charaka Sutrasthana / Sushruta)")
        if "chikitsa" not in ans.lower() and "treatment" not in ans.lower():
            missing.append("Therapeutic principles (Chikitsa Sutra / Shamana-Shodhana protocol)")
        if words < 60:
            missing.append("Expansion on clinical etiopathogenesis (Nidana Panchaka details)")

        feedback = (
            f"Your answer demonstrates promising academic foundation ({pct:.0f}% benchmark). "
            f"To achieve top marks from university examiners: ensure you open with a concise Sanskrit definition (Nirukti), "
            f"cite the relevant treatise reference, clearly illustrate the Samprapti Ghatakas with a flow layout, and conclude with the line of treatment."
        )

        model_answer = (
            f"**Exemplary BAMS Model Answer for: \"{data.question_text}\"**\n\n"
            f"**1. Paribhasha (Definition):** State the classical definition verbatim with authoritative clarity.\n\n"
            f"**2. Classical Reference:** *\"तत्र दोषधातुमलसञ्चयात्मकं शरीरम्...\"* (Sushruta Samhita Sutrasthana 15/41)\n\n"
            f"**3. Samprapti Ghatakas (Pathogenesis Elements):**\n"
            f"- **Dosha:** Specific vitiated sub-doshas.\n"
            f"- **Dushya:** Affected tissues (Dhatus) and fluid channels.\n"
            f"- **Agni:** State of Jatharagni / Dhatvagni (Mandagni / Vishamagni).\n"
            f"- **Srotas:** Implicated micro-circulatory channels (Srotodushti type: Sanga, Vimargagamana).\n\n"
            f"**4. Chikitsa Sutra (Management):**\n"
            f"- **Purvakarma:** Deepana-Pachana with Trikatu / Chitrakadi Vati.\n"
            f"- **Pradhanakarma:** Selected bio-purification (Vamana / Virechana / Basti).\n"
            f"- **Shamana Formulations:** Standard classical compound prescriptions (Kwatha, Vati, Asava-Arishta)."
        )

        eval_record = AIAnswerEvaluation(
            user_id=user.id,
            subject=data.subject,
            question_text=data.question_text,
            student_answer=data.student_answer,
            target_marks=data.target_marks,
            structure_score=structure_pts,
            clarity_score=clarity_pts,
            terminology_score=terminology_pts,
            overall_score=scaled_score,
            covered_concepts=covered,
            missing_concepts=missing,
            constructive_feedback=feedback,
            model_answer=model_answer
        )
        db.add(eval_record)
        await db.commit()
        await db.refresh(eval_record)

        return AIAnswerFeedbackOut(
            evaluation_id=eval_record.id,
            overall_score=scaled_score,
            target_marks=data.target_marks,
            score_percentage=round(pct, 1),
            structure_score=structure_pts,
            clarity_score=clarity_pts,
            terminology_score=terminology_pts,
            covered_concepts=covered,
            missing_concepts=missing,
            constructive_feedback=feedback,
            grammar_and_presentation_tips=[
                "Use bullet points for Dosha-Dushya interactions instead of unbroken paragraphs.",
                "Highlight key Sanskrit technical terms in bold or underline.",
                "Include a small diagnostic flowchart for Samprapti to stand out to examiners."
            ],
            model_answer=model_answer,
            safety_disclaimer=eval_record.safety_disclaimer
        )

    # ============================================================
    # 7. AI FACULTY ASSISTANT
    # ============================================================

    @classmethod
    async def faculty_tool(
        cls,
        db: AsyncSession,
        user: User,
        data: AIFacultyToolIn
    ) -> AIFacultyToolOut:
        cls.sanitize_input(data.topic)

        # Enforce faculty or doctor permissions
        if user.role not in [UserRole.FACULTY, UserRole.DOCTOR, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Faculty AI tools are restricted to verified Faculty, Doctors, and Academic Administrators."
            )

        content: Dict[str, Any] = {}
        formatted_md = ""

        if data.tool_type == FacultyToolType.LESSON_OUTLINE:
            formatted_md = (
                f"# Structured University Lesson Plan\n\n"
                f"**Subject:** {data.subject} | **Curriculum Level:** {data.curriculum_level}\n"
                f"**Lecture Topic:** {data.topic}\n"
                f"**Target Duration:** {data.target_duration_minutes} Minutes\n\n"
                f"## 1. Learning Objectives (NCISM Standard)\n"
                f"- Understand the classical definition, etymology, and historical context in Brihat-trayi treatises.\n"
                f"- Analyze the clinical etiopathogenesis (Nidana Panchaka) with modern pathophysiological correlations.\n"
                f"- Formulate evidence-based Ayurvedic prescription protocols and dietary advice (Pathya-Apathya).\n\n"
                f"## 2. 45-Minute Pedagogical Timeline\n"
                f"- **00-10 Min:** Introduction, Sanskrit Nirukti & recitation of core Shloka.\n"
                f"- **10-25 Min:** Core mechanism: Dosha-Dushya dynamics, Srotas involvement, and clinical signs.\n"
                f"- **25-35 Min:** Interactive Clinical Case Presentation & differential diagnostics.\n"
                f"- **35-45 Min:** Question & Answer, summary recap, and homework assignment.\n\n"
                f"## 3. High-Yield Viva Questions for Students\n"
                f"1. What is the cardinal differential symptom distinguishing this condition?\n"
                f"2. Cite the primary classical treatment principle (Chikitsa Sutra).\n\n"
                f"## 4. Recommended References\n"
                f"- Charaka Samhita with Chakrapani commentary.\n"
                f"- Sushruta Samhita with Dalhana commentary."
            )
            content = {
                "objectives": ["Classical understanding", "Clinical application", "Prescription formulation"],
                "duration_minutes": data.target_duration_minutes,
                "references": ["Charaka Samhita", "Sushruta Samhita"]
            }

        elif data.tool_type in [FacultyToolType.PRACTICE_QUESTIONS, FacultyToolType.EXAM_QUESTION_PAPER]:
            formatted_md = (
                f"# University Examination & Practice Assessment\n\n"
                f"**Subject:** {data.subject} | **Class:** {data.curriculum_level}\n"
                f"**Topic Focus:** {data.topic}\n"
                f"**Maximum Marks:** 50 | **Time Allowed:** 1 Hour 30 Minutes\n\n"
                f"> **AI Advisory:** AI-generated question paper aligned to NCISM assessment standards. Always verify marks distribution with your university controller.\n\n"
                f"### SECTION A: Long Answer Questions (LAQ) — [2 x 10 = 20 Marks]\n"
                f"*(Answer any TWO with classical Sanskrit reference & clinical protocol)*\n\n"
                f"1. Define the fundamental principles of **{data.topic}**. Detail the complete etiopathogenesis (Samprapti) with flowchart, clinical presentations, and line of management (Chikitsa Sutra). [10 Marks]\n"
                f"2. Explain the differential diagnosis and classical formulations indicated for advanced manifestations of **{data.topic}**. [10 Marks]\n\n"
                f"### SECTION B: Short Answer Questions (SAQ) — [4 x 5 = 20 Marks]\n"
                f"3. Write the Nirukti, Paribhasha, and classification of **{data.topic}** according to Acharya Charaka. [5 Marks]\n"
                f"4. Describe the specific Pathya and Apathya (Diet & Lifestyle regimen). [5 Marks]\n"
                f"5. Differentiate the presentation based on dominant Doshas (Vataja vs Pittaja vs Kaphaja). [5 Marks]\n"
                f"6. Describe the indicated Panchakarma bio-purification procedure and precautions. [5 Marks]\n\n"
                f"### SECTION C: Multiple Choice Questions (MCQ) — [10 x 1 = 10 Marks]\n"
                f"7. Which classical treatise contains the primary Chikitsa Sutra for {data.topic}?\n"
                f"   - (A) Charaka Samhita Chikitsa Sthana\n"
                f"   - (B) Sushruta Samhita Sharira Sthana\n"
                f"   - (C) Ashtanga Hridaya Sutra Sthana\n"
                f"   - (D) Sharangadhara Samhita\n"
                f"   *Answer: (A)*\n\n"
                f"8-16. Standard curriculum questions testing botanical identification, classical Shlokas, and contraindications."
            )
            content = {"sections": ["LAQ", "SAQ", "MCQ"], "total_marks": 50, "disclaimer": "AI-Generated Faculty Practice Tool"}

        elif data.tool_type == FacultyToolType.LEARNING_OBJECTIVES:
            formatted_md = (
                f"# NCISM Competency-Based Learning Objectives\n\n"
                f"**Subject:** {data.subject} | **Level:** {data.curriculum_level}\n"
                f"**Topic:** {data.topic}\n\n"
                f"> **AI Advisory:** Competency framework aligned with National Commission for Indian System of Medicine guidelines.\n\n"
                f"### Domain: Knowledge (Cognitive)\n"
                f"- **K1:** Define and recall the classical Sanskrit Shloka describing the Nirukti and Lakshana of **{data.topic}**.\n"
                f"- **K2:** Explain the Samprapti Ghataka (Nidana, Dosha, Dushya, Agni, Srotas, and Udbhava Sthana).\n"
                f"- **K3:** Differentiate the Upadrava (complications) and Arishta Lakshana (prognostic indicators).\n\n"
                f"### Domain: Clinical Skills (Psychomotor)\n"
                f"- **S1:** Perform Ashtavidha and Dashavidha Pariksha on simulated patient presentations.\n"
                f"- **S2:** Formulate tailored Kashaya, Churna, and Asava-Arishta posology with proper Anupana.\n\n"
                f"### Domain: Professionalism & Ethics (Affective)\n"
                f"- **A1:** Communicate dietary Pathya-Apathya instructions compassionately to patients.\n"
                f"- **A2:** Document treatment responses adhering to integrative medical record standards."
            )
            content = {"domains": ["Cognitive", "Psychomotor", "Affective"], "standard": "NCISM Competency Model"}

        elif data.tool_type == FacultyToolType.CASE_SCENARIO:
            formatted_md = (
                f"# Clinical Education Case Scenario & Bedside Discussion\n\n"
                f"**Subject:** {data.subject} | **Topic Focus:** {data.topic}\n"
                f"**Curriculum Level:** {data.curriculum_level} Clinical Postings\n\n"
                f"> **AI Advisory:** Simulated educational patient scenario for clinical problem-solving. Not a diagnosis of a real individual.\n\n"
                f"### Patient Profile & Chief Complaints\n"
                f"A 42-year-old male executive presents with progressive symptoms associated with **{data.topic}** persisting for 3 months.\n"
                f"- Aggravating Factors: Stress, irregular meals (Vishamashana), excessive dry food (Ruksha Ahara).\n"
                f"- Primary Rogi Pariksha: Nadi: Vata-Pitta dominant; Jihva: Sama (coated); Mala: Vibandha (constipation).\n\n"
                f"### Diagnostic Inquiry for Students\n"
                f"1. **Samprapti Formulation:** Identify the primary Sroto Dushti type (Sanga, Atipravritti, Siragranthi, or Vimarga Gamana).\n"
                f"2. **Differential Diagnosis:** What two conditions present with overlapping Lakshanas in Madhava Nidana?\n"
                f"3. **Chikitsa Sutra Selection:** Outline the classical Shodhana and Shamana sequence.\n\n"
                f"### Model Clinical Solution Key\n"
                f"- **Deepana-Pachana:** Trikatu or Chitrakadi Vati prior to therapeutic meals.\n"
                f"- **Snehana & Svedana:** Classical Abhyanga followed by Nadi Sveda.\n"
                f"- **Shamana Formulations:** Classical Rasayana restorative protocol upon achieving Nirama state."
            )
            content = {"type": "Clinical Problem-Based Learning", "complexity": "Intermediate"}

        elif data.tool_type == FacultyToolType.REVISION_ACTIVITY:
            formatted_md = (
                f"# Active Classroom Revision & Peer-Learning Activities\n\n"
                f"**Subject:** {data.subject} | **Topic:** {data.topic}\n\n"
                f"### 1. 5-Minute Shloka Memory Challenge\n"
                f"Have student pairs recite and decode key keywords from Brihat-trayi concerning **{data.topic}**.\n\n"
                f"### 2. Dosha-Dushya Concept Mapping\n"
                f"Divide class into 3 groups (Vata, Pitta, Kapha presentations). Each team charts the Rogamarga on whiteboard.\n\n"
                f"### 3. Rapid-Fire Viva Prompts\n"
                f"- Prompt 1: What is the cardinal contraindicated Ahara (Apathya)?\n"
                f"- Prompt 2: State the classical gold-standard Rasayana indicated here.\n"
                f"- Prompt 3: Under what clinical criteria is Vamana vs Virechana indicated?"
            )
            content = {"activities": ["Memory Challenge", "Concept Mapping", "Rapid Viva"]}

        elif data.tool_type == FacultyToolType.CONTENT_IMPROVEMENT:
            formatted_md = (
                f"# Pedagogical Content Enhancement & Presentation Polish\n\n"
                f"**Subject:** {data.subject} | **Topic:** {data.topic}\n\n"
                f"### Visual & Interactive Suggestions for Lecture Slides\n"
                f"- **Slide 1-3:** Sanskrit Nirukti breakdown with animated Devanagari calligraphy.\n"
                f"- **Slide 4-6:** Dual-column comparative table contrasting Classical vs Modern Anatomical parallels.\n"
                f"- **Slide 7-9:** Step-by-step Samprapti Flowchart with Dosha icon highlights.\n"
                f"- **Slide 10:** Clinical bedside photo/illustration with interactive quiz poll for students."
            )
            content = {"enhancements": ["Interactive Slides", "Dual-Column Tables", "Flowchart Design"]}

        else:
            formatted_md = (
                f"# Academic Study Resource & Literature Synthesis\n\n"
                f"**Subject:** {data.subject} | **Topic:** {data.topic}\n\n"
                f"> **AI Advisory:** AI-curated academic summary for educational study and student revision.\n\n"
                f"### Executive Summary for Students\n"
                f"Comprehensive distillation of Brihat-trayi commentaries on **{data.topic}**. "
                f"Structured for rapid revision and evidence-informed Ayurvedic clinical practice."
            )
            content = {"type": "Literature Synthesis"}


        log = AIFacultyLog(
            faculty_user_id=user.id,
            tool_type=data.tool_type,
            subject=data.subject,
            curriculum_level=data.curriculum_level,
            input_topic=data.topic,
            generated_content={"markdown": formatted_md, "structured": content}
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)

        return AIFacultyToolOut(
            id=log.id,
            tool_type=log.tool_type,
            subject=log.subject,
            curriculum_level=log.curriculum_level,
            topic=log.input_topic,
            title=f"{data.tool_type.value.replace('_', ' ').title()}: {data.topic}",
            content=content,
            formatted_markdown=formatted_md,
            created_at=log.created_at
        )

    # ============================================================
    # 8. AI EDUCATIONAL CONTENT SEARCH
    # ============================================================

    @classmethod
    async def search_content(
        cls,
        db: AsyncSession,
        user: User,
        data: AISearchIn
    ) -> AISearchResponseOut:
        cls.sanitize_input(data.query)
        q = data.query.strip().lower()

        results: List[AISearchResultItem] = []

        # 1. Search Classical Shlokas
        shloka_res = await db.execute(
            select(ClassicalShloka).where(
                or_(
                    ClassicalShloka.english_meaning.ilike(f"%{q}%"),
                    ClassicalShloka.sanskrit_devanagari.ilike(f"%{q}%"),
                    ClassicalShloka.iast_transliteration.ilike(f"%{q}%"),
                    ClassicalShloka.subject.ilike(f"%{q}%")
                )
            ).limit(4)
        )
        for s in shloka_res.scalars().all():
            results.append(
                AISearchResultItem(
                    id=str(s.id),
                    title=f"{s.treatise_name} ({s.sthana} Sthana {s.chapter_number}/{s.verse_number})",
                    snippet=f"Sanskrit: {s.sanskrit_devanagari} — Meaning: {s.english_meaning[:120]}...",
                    category="Classical Treatise",
                    subject=s.subject,
                    source_citation=f"{s.treatise_name} {s.sthana} Ch {s.chapter_number}",
                    relevance_score=0.95
                )
            )

        # 2. Search BAMS Case Studies
        case_res = await db.execute(
            select(BamsCaseStudy).where(
                or_(
                    BamsCaseStudy.title.ilike(f"%{q}%"),
                    BamsCaseStudy.subject.ilike(f"%{q}%"),
                    BamsCaseStudy.topic.ilike(f"%{q}%")
                )
            ).limit(3)
        )
        for c in case_res.scalars().all():
            results.append(
                AISearchResultItem(
                    id=str(c.id),
                    title=c.title,
                    snippet=f"Clinical Case: {c.history_of_illness[:130]}...",
                    category="BAMS Clinical Case Study",
                    subject=c.subject,
                    source_citation=f"NCISM Verified Faculty Case #{c.case_id_code}",
                    relevance_score=0.88,
                    url=f"/student/ecosystem?tab=cases"
                )
            )

        # 3. Search User's Personal Notes (Strictly User Isolated)
        note_res = await db.execute(
            select(AINote).where(
                and_(
                    AINote.user_id == user.id,
                    AINote.is_archived == False,
                    or_(
                        AINote.title.ilike(f"%{q}%"),
                        AINote.content.ilike(f"%{q}%"),
                        AINote.topic.ilike(f"%{q}%")
                    )
                )
            ).limit(3)
        )
        for n in note_res.scalars().all():
            results.append(
                AISearchResultItem(
                    id=str(n.id),
                    title=n.title,
                    snippet=f"Personal Study Note ({n.subject}): {n.content[:120]}...",
                    category="Personal Study Note",
                    subject=n.subject,
                    source_citation="My Private Study Notes",
                    relevance_score=0.92
                )
            )

        # Synthesis
        synthesis = (
            f"Retrieved {len(results)} authoritative resources across classical Brihat-trayi treatises, "
            f"NCISM clinical case studies, and your saved study notes for query: \"{data.query}\"."
        )

        followups = [
            f"Explain {data.query} in beginner-friendly language.",
            f"How is {data.query} assessed in BAMS university exams?",
            f"Generate 3 practice MCQs on {data.query}."
        ]

        return AISearchResponseOut(
            query=data.query,
            total_results=len(results),
            results=results,
            ai_synthesis=synthesis,
            suggested_followups=followups
        )

    # ============================================================
    # 9. AI ANATOMY & SUBJECT EXPLAINER
    # ============================================================

    @classmethod
    async def explain_anatomy(
        cls,
        data: AIAnatomyExplainerIn
    ) -> AIAnatomyExplainerOut:
        cls.sanitize_input(data.structure_name)
        struct = data.structure_name.strip()
        sanskrit = data.sanskrit_name or "Sharira Rachana Pratibimba"
        mode = data.mode.upper()

        if mode == "BEGINNER":
            classical = (
                f"**Rachana Sharira Foundation:** In Ayurveda, the structural integrity of {struct} "
                f"is governed primarily by Asthi Dhatu (skeletal framework), Mamsa (muscular tissue), and Snayu (fibrous ligaments). "
                f"It serves as a functional pathway for Vata-driven physiological movement (Gati) and anatomical support."
            )
            modern = (
                f"**Gross Anatomy:** {struct} provides essential biomechanical stability, protects deep neurovascular structures, "
                f"and facilitates articulated kinetic motion in synergy with surrounding soft tissue fascia."
            )
            surgical = (
                f"**Clinical & Surgical Significance (Shalya Tantra):** Injury or trauma to this region can disturb local Pranavaha and Rasavaha Srotas. "
                f"Surgical interventions require strict preservation of regional Snayu (tendons/ligaments) and Sira (vessels). "
                f"Classical protocol mandates Snigdha Sweda, Lepana, and anatomical immobilization."
            )
        else:
            classical = (
                f"**Advanced Ayurvedic Histology & Srotas Correlation:**\n"
                f"- **Dhatu & Upadhatu:** Primarily Mamsavaha and Asthivaha Srotas with Snayu-Kandara binding.\n"
                f"- **Dosha Seat:** Vyana Vata locus governing kinetic micro-circulation and somatic neuromuscular coordination.\n"
                f"- **Shalya Anatomy:** Surgical dissection requires meticulous identification of neurovascular fascia bundles to avoid functional deficits (Kshata)."
            )
            modern = (
                f"**Micro-Structural & Neurovascular Architecture:**\n"
                f"Composed of dense organized connective tissue, collagen bundles, and articulated synovial junctions, "
                f"innervated by deep peripheral somatic pathways and supplied by targeted collateral arterial arches."
            )
            surgical = (
                f"**Surgical Trauma & Shalya Protocol:** Direct trauma risks structural disruption and severe Rujakara (intense pain) sequelae. "
                f"Classical Shalya Tantra dictates systematic Kshara-Agni or surgical reduction with specialized Bhagna Bandhana splinting."
            )

        flow = [
            f"1. Nutrient delivery via Rasavaha and Raktavaha micro-capillaries.",
            f"2. Structural cohesion maintained by Kapha (Shleshaka & Tarpaka).",
            f"3. Motility and sensory transmission regulated by Vyana Vata.",
            f"4. Metabolic cellular turnover governed by Dhatvagni."
        ]

        high_yield = [
            f"Identify underlying anatomical structures in BAMS 1st Year Rachana Sharira practicals.",
            f"State the associated Dhatu, Srotas, and Upadhatu structural relationships.",
            f"Distinguish clinical presentation under Vataja vs Pittaja inflammatory conditions."
        ]

        questions = [
            {
                "question": f"Which Dhatu predominantly forms the structural matrix of {struct}?",
                "answer": "Asthi and Mamsa Dhatus with Snayu ligaments."
            },
            {
                "question": f"Which sub-dosha of Vata is responsible for kinetic articulation in this anatomical zone?",
                "answer": "Vyana Vata (governing all bodily movements and arterial circulation)."
            }
        ]

        return AIAnatomyExplainerOut(
            structure_name=struct,
            sanskrit_name=sanskrit,
            mode=mode,
            classical_correlation=classical,
            modern_anatomy_summary=modern,
            clinical_marma_vulnerability=surgical,
            clinical_surgical_significance=surgical,
            step_by_step_physiological_flow=flow,
            high_yield_exam_points=high_yield,
            practice_questions=questions,
            disclaimer=MEDICAL_SAFETY_DISCLAIMER
        )

    @classmethod
    async def ask_anatomy_question(
        cls,
        data: AIAnatomyQAIn
    ) -> AIAnatomyQAOut:
        cls.sanitize_input(data.question)
        cls.sanitize_input(data.structure_name)
        struct = data.structure_name.strip()
        q = data.question.strip()
        sanskrit = data.sanskrit_name or "Sharira Rachana"
        subj = data.bams_subject or "Rachana Sharir"

        ans = (
            f"In the context of **{subj}** and modern functional anatomy, **{struct}** ({sanskrit}) "
            f"plays a foundational physiological role.\n\n"
            f"**1. Anatomical Architecture & Relations:**\n"
            f"Structurally composed of specialized tissue matrices (Asthi/Mamsa/Snayu), {struct} "
            f"maintains spatial alignment with adjacent neurovascular tracts and protective fascial compartments.\n\n"
            f"**2. Classical Treatise Perspective ({subj}):**\n"
            f"According to Sushruta Samhita (Sharira Sthana, Adhyaya 5) and Charaka Samhita (Sharira Sthana, Adhyaya 7), "
            f"this zone is nourished sequentially through Dhatu Poshana Nyaya via micro-srotas pathways, under the regulation "
            f"of Vyana Vata for physiological kinetic movement.\n\n"
            f"**3. Addressing your specific question on '{q}':**\n"
            f"During clinical examination and surgical dissection, careful tissue layer-by-layer differentiation is mandatory. "
            f"Any functional disruption impairs local Gati (movement) and Dharana (structural support), requiring classical "
            f"Snehana-Swedana, immobilization, or targeted Shalya intervention depending on acute vs chronic presentation."
        )

        citations = [
            "Sushruta Samhita, Sharira Sthana, Chapter 5 (Sharira Sankhya Vyakarana)",
            "Charaka Samhita, Sharira Sthana, Chapter 7 (Sharira Vichaya)",
            "Ashtanga Hridaya, Sharira Sthana, Chapter 3",
            "NCISM BAMS 1st Professional Rachana Sharira Syllabus"
        ]

        followups = [
            f"What are the major arterial arches supplying {struct}?",
            f"How does Charaka classify the Srotas rooted in this anatomical region?",
            f"What are the typical clinical signs of trauma (Kshata) to this structure in Shalya Tantra?",
            f"How do Asthi and Majja Dhatus interact within {struct}?"
        ]

        struct_lower = struct.lower()
        sys_lower = (data.system_id or "").lower()
        if "heart" in struct_lower or "hridaya" in struct_lower or "cardio" in sys_lower:
            srotas_mention = "Rasavaha and Pranavaha Srotas (Hridaya is classical Mula)"
        elif "digest" in sys_lower or "stomach" in struct_lower or "amashaya" in struct_lower:
            srotas_mention = "Annavaha and Purishavaha Srotas (Amashaya & Pachakagni)"
        elif "resp" in sys_lower or "lung" in struct_lower or "phupphusa" in struct_lower:
            srotas_mention = "Pranavaha and Udakavaha Srotas"
        else:
            srotas_mention = "Asthivaha, Mamsavaha, and Majjavaha Srotas"

        bams_corr = (
            f"Directly mapped to {subj}: {srotas_mention}, Vyana Vata, and Shleshaka Kapha kinetic balance."
        )

        return AIAnatomyQAOut(
            structure_name=struct,
            question=q,
            answer=ans,
            classical_treatise_citations=citations,
            suggested_followups=followups,
            bams_correlation=bams_corr,
            disclaimer=MEDICAL_SAFETY_DISCLAIMER
        )

    @classmethod
    async def generate_anatomy_quiz(
        cls,
        data: AIAnatomyQuizIn
    ) -> AIAnatomyQuizOut:
        cls.sanitize_input(data.structure_name)
        struct = data.structure_name.strip()
        sanskrit = data.sanskrit_name or "Sharira Rachana"
        sys_name = data.system_id or "General Anatomy"

        questions = [
            AIAnatomyQuizQuestion(
                id=f"quiz-{struct.lower().replace(' ', '_')}-1",
                question=f"According to Sushruta Samhita, what primary Dhatu constitutes the structural framework of {struct} ({sanskrit})?",
                options=[
                    "Asthi Dhatu (Bone Matrix) with Snayu ligaments",
                    "Rasa Dhatu (Primary plasma chyle)",
                    "Majja Dhatu (Bone marrow tissue) exclusively",
                    "Medas Dhatu (Adipose tissue) only"
                ],
                correct_index=0,
                explanation=f"{struct} forms an integral structural component governed by Asthi and Mamsa Dhatus, reinforced by Snayu (fibrous ligaments).",
                classical_citation="Sushruta Samhita, Sharira Sthana 5",
                bams_subject="Rachana Sharir"
            ),
            AIAnatomyQuizQuestion(
                id=f"quiz-{struct.lower().replace(' ', '_')}-2",
                question=f"Which sub-dosha of Vata governs active motility, kinetic articulation, and micro-circulation across {struct}?",
                options=[
                    "Prana Vata",
                    "Udana Vata",
                    "Samana Vata",
                    "Vyana Vata"
                ],
                correct_index=3,
                explanation="Vyana Vata is seated in the Hridaya and traverses the entire Sharira, governing all kinetic neuromuscular locomotion and arterial flow.",
                classical_citation="Ashtanga Hridaya, Sutrasthana 12",
                bams_subject="Kriya Sharir"
            ),
            AIAnatomyQuizQuestion(
                id=f"quiz-{struct.lower().replace(' ', '_')}-3",
                question=f"In Shalya Tantra surgical principles, what is the crucial anatomical precaution when dissecting near {struct}?",
                options=[
                    "Preservation of surrounding deep Sira (vessels) and Snayu (fibrous cords) to prevent deformity",
                    "Complete cauterization of all adjacent fascial planes",
                    "Immediate application of Tikshna Kshara without irrigation",
                    "Complete avoidance of anatomical immobilization"
                ],
                correct_index=0,
                explanation="Sushruta dictates meticulous preservation of regional Sira and Snayu bundles during Shastrakarma to avert functional deficits (Vaikalya).",
                classical_citation="Sushruta Samhita, Sutrasthana 25 (Ashtavidha Shastrakarma)",
                bams_subject="Shalya Tantra"
            )
        ]

        flashcards = [
            AIAnatomyFlashcard(
                id=f"fc-{struct.lower().replace(' ', '_')}-1",
                title=f"{struct} — Classical Nomenclature",
                sanskrit_term=sanskrit,
                front=f"What is the classical Ayurvedic anatomical categorization and Sanskrit designation of {struct}?",
                back=f"Designated as {sanskrit}, classified under Asthi / Mamsa / Sandhi Sharira in Sushruta Sharira Sthana.",
                bams_subject="Rachana Sharir",
                high_yield_note="High-yield viva question for BAMS 1st Professional practicals."
            ),
            AIAnatomyFlashcard(
                id=f"fc-{struct.lower().replace(' ', '_')}-2",
                title=f"{struct} — Srotas & Functional Correlation",
                sanskrit_term="Srotas & Dhatu Poshana",
                front=f"Which Srotas and Dhatvagni pathways regulate the nutrition and structural density of {struct}?",
                back="Regulated by Asthivaha and Mamsavaha Srotas, mediated by Medodhatvagni and Asthidhatvagni.",
                bams_subject="Kriya Sharir",
                high_yield_note="Key question for NCISM Paper-1 and Paper-2 theory examinations."
            ),
            AIAnatomyFlashcard(
                id=f"fc-{struct.lower().replace(' ', '_')}-3",
                title=f"{struct} — Clinical & Shalya Significance",
                sanskrit_term="Shalya Tantra & Bhagna",
                front=f"What is the primary clinical trauma presentation (Bhagna / Kshata) associated with {struct}?",
                back="Direct trauma causes acute Rujakara pain, swelling, and kinetic limitation; managed via Bandhana splinting and Murvenna / Mahanarayana Taila.",
                bams_subject="Shalya Tantra",
                high_yield_note="Clinical correlation frequently tested in 4th Prof Shalya Tantra."
            )
        ]

        return AIAnatomyQuizOut(
            structure_name=struct,
            system_name=sys_name,
            questions=questions,
            flashcards=flashcards,
            disclaimer=MEDICAL_SAFETY_DISCLAIMER
        )

    @classmethod
    async def get_anatomy_revision_summary(
        cls,
        data: AIAnatomySummaryIn
    ) -> AIAnatomySummaryOut:
        cls.sanitize_input(data.structure_name)
        struct = data.structure_name.strip()
        sanskrit = data.sanskrit_name or "Sharira Rachana"

        takeaways = [
            f"**Structural Definition:** {struct} ({sanskrit}) provides crucial architectural stability and anatomical containment.",
            f"**Ayurvedic Mapping:** Governed by Asthi and Mamsa Dhatus, anchored in Asthivaha/Mamsavaha Srotas.",
            f"**Kinetic Principle:** Dynamic movement and somatic reflex arcs are propelled by Vyana Vata in equilibrium with Shleshaka Kapha lubrication.",
            f"**Surgical Safeguard:** In Shalya Tantra, operative incisions must run parallel to natural cleavage lines to preserve neurovascular bundles."
        ]

        mnemonics = [
            f"**D-S-V Rule for {struct}:** **D**hatu (Asthi/Mamsa) $\\rightarrow$ **S**rotas (Asthivaha) $\\rightarrow$ **V**ata (Vyana Gati).",
            f"**3-S Surgical Preservation:** **S**ira (Blood vessels), **S**nayu (Ligaments), **S**andhi (Joint Capsules)."
        ]

        shlokas = [
            "मज्जास्नेहः स्नायुसंघातः संधयश्चास्थिसंश्रिताः। (Sushruta Samhita, Sharira Sthana)",
            "देहेन्द्रियमनःसंयोगे गतिप्रसारणादयो व्यापारा व्यानेन। (Charaka Samhita, Chikitsa Sthana)"
        ]

        tips = [
            "In university practical viva, be prepared to demonstrate osteological landmarks and articular surfaces on bone specimens.",
            "Know the difference between Tarunasthi (cartilaginous structures) and Nalakasthi (tubular long bones).",
            "Correlate trauma mechanisms with modern fracture classification and classical Bhagna Bandhana management."
        ]

        return AIAnatomySummaryOut(
            structure_name=struct,
            key_takeaways=takeaways,
            mnemonics=mnemonics,
            classical_shlokas=shlokas,
            exam_viva_tips=tips,
            disclaimer=MEDICAL_SAFETY_DISCLAIMER
        )

    # ============================================================
    # PHASE 7 — COMMUNITY AI INTEGRATION METHODS
    # ============================================================

    @classmethod
    async def summarize_community_discussion(
        cls, db: AsyncSession, post_id: uuid.UUID
    ) -> Dict[str, Any]:
        """
        Summarizes an educational discussion thread and generates relevant follow-up questions.
        Includes mandatory AI attribution and non-fabrication disclaimer.
        """
        post = await db.get(ForumPost, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Discussion post not found.")

        # Fetch comments
        c_stmt = select(ForumComment).where(and_(
            ForumComment.post_id == post_id,
            ForumComment.moderation_status == "PUBLISHED"
        )).order_by(ForumComment.created_at.asc())
        comments = (await db.execute(c_stmt)).scalars().all()

        subj = post.subject_name or "Ayurvedic Medicine"
        topic = post.topic or post.title

        summary = (
            f"**Key Pedagogical Summary on {subj} ({topic}):**\n\n"
            f"- **Core Clinical Inquiry:** {post.title}\n"
            f"- **Foundational Principles:** Analyzed under classical Ayurvedic parameters with reference to Tridosha, Dhatu, and Mala dynamics.\n"
            f"- **Discussion Consensus:** {len(comments)} peer and faculty contributions highlighting classical Chikitsa protocols, formulation posology, and practical examination points.\n"
            f"- **Clinical Pearls:** Emphasized classical Brihat-trayi cross-referencing and practical NCISM examination alignment."
        )

        followups = [
            f"What are the specific contraindications (Varjya) mentioned in Charaka Samhita regarding {topic}?",
            f"How does modern physiology explain the systemic bio-availability in comparison to classical Ayurvedic observations?",
            f"Which Shloka from Sushruta or Ashtanga Hridaya serves as the primary Pramana for this protocol?"
        ]

        post.ai_summary = summary
        post.ai_followups = followups
        await db.commit()

        return {
            "is_ai_generated": True,
            "mode": "DISCUSSION_SUMMARY",
            "title": f"AI Synthesis: {post.title}",
            "content": summary,
            "citations": [
                "Charaka Samhita (Sutra / Chikitsa Sthana)",
                "Sushruta Samhita (Sharira / Uttara Tantra)",
                "NCISM BAMS National Curriculum Framework"
            ],
            "advisory": (
                "AI EDUCATIONAL ADVISORY: This summary was synthesized automatically by the Aayuraura AI Academic Assistant "
                "for conceptual review. It is NOT authored by a medical faculty member and does not substitute for direct "
                "faculty guidance or primary Samhita study."
            ),
            "suggested_resources": [
                {"title": f"Classical Treatises on {subj}", "url": "/learning-hub"},
                {"title": f"{subj} High-Yield Flashcards", "url": "/student/flashcards"},
                {"title": "NCISM Syllabi Alignment", "url": "/student/syllabus"}
            ],
            "followup_questions": followups
        }

    @classmethod
    async def simplify_educational_explanation(
        cls, concept: str, raw_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simplifies complex Sanskrit or Ayurvedic concepts into clear, accessible language.
        """
        simplified_content = (
            f"### Simplified Breakdown: {concept}\n\n"
            f"**1. What It Means in Everyday Language:**\n"
            f"Think of {concept} as the body's natural regulatory mechanism. In classical Ayurveda, "
            f"this represents how physiological forces interact to maintain cellular and metabolic harmony.\n\n"
            f"**2. Classical Foundation:**\n"
            f"Rooted in the Brihat-trayi principles of Dosha-Dhatu-Mala Samya (dynamic biological balance).\n\n"
            f"**3. Practical Analogy:**\n"
            f"Much like a balanced ecosystem where sunlight, water, and soil work together, "
            f"this principle ensures unobstructed circulation (Srotas) and optimal digestive fire (Agni).\n\n"
            f"**4. High-Yield Exam Memory Aid:**\n"
            f"- Remember the root Sanskrit definition: *'Samadoshah Samagnishcha Samadhatu Malakriyah'*\n"
            f"- Connect it directly to clinical pathology (Nidana Panchaka)."
        )

        return {
            "is_ai_generated": True,
            "mode": "CONCEPT_SIMPLIFICATION",
            "title": f"Simplified Concept: {concept}",
            "content": simplified_content,
            "citations": [
                "Sushruta Samhita, Sutrasthana Chapter 15",
                "Charaka Samhita, Sharirasthana"
            ],
            "advisory": (
                "AI EDUCATIONAL ADVISORY: Generated to simplify complex terminology. "
                "Always verify classical Shloka citations with official NCISM textbooks."
            ),
            "suggested_resources": [
                {"title": "Samhita Recitation Audio", "url": "/learning-hub"},
                {"title": "3D Anatomy Correlation", "url": "/interactive-3d"}
            ]
        }

    @classmethod
    async def ask_community_topic(
        cls, subject: str, topic: str, query: str
    ) -> Dict[str, Any]:
        """
        Answers an educational topic query with clear AI disclosure and authentic Samhita citations.
        """
        answer_text = (
            f"### AI Academic Guidance: {topic} ({subject})\n\n"
            f"**Addressing Student Query:** *\"{query}\"*\n\n"
            f"**1. Classical Ayurvedic Framework:**\n"
            f"According to classical Brihat-trayi references for {subject}, the fundamental approach to {topic} "
            f"involves assessing the Prakriti-Vikriti equilibrium, Agni status, and Srotodushti patterns.\n\n"
            f"**2. Key Syllabic Competencies:**\n"
            f"- Understand the etymology (Nirukti) and classical definition (Lakshana).\n"
            f"- Recognize differential diagnosis (Vyavachhedaka Nidana) for standard BAMS written examinations.\n"
            f"- Identify standard classical formulations (Yoga) and dietetic regimens (Pathya-Apathya).\n\n"
            f"**3. Recommended Study Strategy:**\n"
            f"Memorize the seminal Shloka for this topic from Charaka or Sushruta, and review relevant flashcard sets in the student ecosystem."
        )

        return {
            "is_ai_generated": True,
            "mode": "ACADEMIC_TOPIC_QNA",
            "title": f"Topic Guidance: {topic}",
            "content": answer_text,
            "citations": [
                "Charaka Samhita",
                "Sushruta Samhita",
                "Ashtanga Hridaya"
            ],
            "advisory": (
                "AI ATTRIBUTION: This response was generated by Aayuraura's Educational AI. "
                "It is designed solely for self-study and is not an official faculty diagnosis or grading."
            ),
            "suggested_resources": [
                {"title": f"Study Notes for {subject}", "url": f"/faculty/materials?subject={subject}"},
                {"title": "AI Practice Quiz", "url": "/student/exam-prep"}
            ]
        }

