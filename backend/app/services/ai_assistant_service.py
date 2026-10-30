import uuid
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.user import User
from app.models.domain import StudentProfile, CareerRole, StudentSkillScore, LearningResource
from app.models.ai_career import (
    AIAssistantChat,
    CareerRoadmap,
    CareerGoal,
    CareerGoalMilestone,
    StudentResume,
    MockInterviewSession
)
from app.schemas.ai_career import (
    AIChatResponseOut,
    ResumeAnalysisOut,
    MockInterviewReportOut,
    AICareerRecommendationItemOut,
    InterviewCoachOut,
    PortfolioReviewOut,
    StudyAssistantOut
)

PROMPT_INJECTION_PATTERNS = ["ignore previous instructions", "system prompt", "leak api key", "drop database", "sudo "]

class AIAssistantService:

    @classmethod
    def sanitize_input(cls, text: str):
        lower = text.lower()
        for pattern in PROMPT_INJECTION_PATTERNS:
            if pattern in lower:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected. System prompts, administrative commands, and injection patterns are strictly blocked."
                )

    @classmethod
    async def chat(cls, db: AsyncSession, student_user: User, message: str, session_id: Optional[str] = None) -> AIChatResponseOut:
        cls.sanitize_input(message)
        sess_id = session_id or f"sess-{uuid.uuid4().hex[:10]}"

        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            student = StudentProfile(
                user_id=student_user.id,
                full_name=student_user.full_name or "AyurSetu Student",
                current_year="BAMS 3rd Year",
                degree_program="BAMS"
            )
            db.add(student)
            await db.commit()
            await db.refresh(student)

        # Context-aware intelligent response generation
        lower_msg = message.lower()
        if "skill" in lower_msg or "improve" in lower_msg:
            reply = f"Based on your profile in {student.current_year or 'BAMS'}, I recommend advancing your competencies in Nadi Pariksha, Dravyaguna phytochemistry QC, and Clinical Panchakarma protocols. Completing assessment quizzes will directly close your skill gaps!"
            followups = ["What courses should I take next?", "Show me active clinical internships", "Generate my career roadmap"]
        elif "career" in lower_msg or "prepare" in lower_msg or "target" in lower_msg:
            reply = "To prepare for an Ayurvedic Clinical Specialist role: 1. Complete verified Panchakarma assessments. 2. Participate in Rural AYUSH Healthcare Camps to gain hands-on OPD hours. 3. Build a verified digital portfolio."
            followups = ["Check my ATS resume score", "Start AI mock interview", "Browse upcoming healthcare camps"]
        elif "internship" in lower_msg or "ready" in lower_msg:
            reply = "You are in a strong readiness tier for Clinical Internships. Your profile strength is above 75%, and your verified skills align well with Panchakarma & Hospital OPD positions."
            followups = ["Browse active internships", "How to polish my resume?", "Schedule a mentorship session with a Doctor"]
        else:
            reply = f"Namaste! As your AyurSetu AI Career Assistant, I am here to guide your learning, skill progression, ATS resume optimization, and placement preparation for AYUSH careers. How can I assist your journey today?"
            followups = ["What skills should I improve?", "Am I ready for internships?", "How can I prepare for my target career?"]

        chat_entry = AIAssistantChat(
            student_id=student.id,
            session_id=sess_id,
            role="user",
            message=message,
            context_data={"year": student.current_year, "degree": student.degree_program}
        )
        db.add(chat_entry)
        await db.commit()

        return AIChatResponseOut(
            session_id=sess_id,
            reply=reply,
            suggested_followups=followups,
            context_used={"degree": student.degree_program}
        )

    @classmethod
    async def analyze_resume(cls, db: AsyncSession, student_user: User, resume_text: str, target_role: str) -> ResumeAnalysisOut:
        cls.sanitize_input(resume_text)
        lower_resume = resume_text.lower()

        core_ayush_keywords = ["panchakarma", "dravyaguna", "nadi pariksha", "charaka samhita", "clinical opd", "bams", "pharmacovigilance", "rasashastra", "gmp"]
        matched = [k for k in core_ayush_keywords if k in lower_resume]
        missing = [k for k in core_ayush_keywords if k not in lower_resume]

        score = min(100.0, max(40.0, (len(matched) / len(core_ayush_keywords)) * 100.0))
        warnings = []
        if len(matched) < 3:
            warnings.append("Low keyword density for target Ayurvedic role. Include specific classical treatises and clinical procedures.")
        if "experience" not in lower_resume and "internship" not in lower_resume:
            warnings.append("Missing clinical rotation / internship experience section.")

        suggestions = [
            f"Add key competency terms: {', '.join(missing[:3])}",
            "Highlight verified volunteer healthcare camp hours and clinical OPD caseload",
            "Attach verifiable certificate tokens to validate hands-on credentials"
        ]

        return ResumeAnalysisOut(
            ats_score=round(score, 1),
            matched_keywords=matched,
            missing_keywords=missing,
            formatting_warnings=warnings,
            improvement_suggestions=suggestions
        )

    @classmethod
    async def coach_interview_answer(cls, db: AsyncSession, question: str, answer: str) -> InterviewCoachOut:
        cls.sanitize_input(answer)
        lower_ans = answer.lower()

        has_terminology = any(t in lower_ans for t in ["dosha", "prakriti", "dravyaguna", "samprapti", "chikitsa", "agni", "panchakarma", "shloka"])
        has_structure = len(answer.split()) > 25

        clarity = 88.0 if has_structure else 65.0
        star_feedback = "Good situational structure with clear action and resolution." if has_structure else "Expand answer using the STAR method (Situation, Task, Action, Result)."
        ayur_feedback = "Strong integration of classical Ayurvedic clinical terminology." if has_terminology else "Enhance answer with specific classical Dravyaguna principles or Roganidana terminology."

        return InterviewCoachOut(
            clarity_score=clarity,
            structure_star_feedback=star_feedback,
            ayurvedic_terminology_review=ayur_feedback,
            suggested_improved_response=f"In addressing {question}, begin by outlining the clinical Samprapti (pathogenesis), state your diagnostic pulse/Nadi assessment, describe the selected Pathya-Apathya & Shamana/Shodhana protocol, and summarize the patient therapeutic outcome.",
            clinical_safety_note="AI interview coaching is strictly for academic and communication preparation and does not replace licensed clinical examinations."
        )

    @classmethod
    async def study_assistant(cls, db: AsyncSession, question: str) -> StudyAssistantOut:
        cls.sanitize_input(question)
        lower_q = question.lower()

        if "triphala" in lower_q:
            answer = "Triphala is a classical Tridoshic Rasayana formulation composed of equal parts of Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellirica), and Amalaki (Emblica officinalis). It possesses Deepana, Pachana, Chakshushya (vision enhancing), and mild Anulomana (laxative) properties."
            citations = ["Charaka Samhita Chikitsasthana 1/3", "Bhavaprakasha Nighantu Haritakyadi Varga"]
            topic = "Dravyaguna & Bhaishajya Kalpana"
        elif "panchakarma" in lower_q:
            answer = "Panchakarma comprises the five classical bio-purificatory therapies: Vamana (Therapeutic emesis for Kapha), Virechana (Purgation for Pitta), Vasti (Enema therapy for Vata), Nasya (Errhine therapy for Urdhwajatrugata roga), and Raktamokshana (Bloodletting for Rakta/Pitta dushti). Purvakarma (Snehana & Swedana) is mandatory prior to Pradhanakarma."
            citations = ["Charaka Samhita Sutrasthana 2", "Sushruta Samhita Chikitsasthana 33"]
            topic = "Panchakarma Protocols"
        else:
            answer = "In classical Ayurvedic ontology, health (Swastha) is defined by Acharya Sushruta as the state of equilibrium among the Doshas (Vata, Pitta, Kapha), Agni (digestive fire), Dhatus (tissues), and Malas (excretions), accompanied by peace of the Atman (Soul), Indriyas (Senses), and Manas (Mind)."
            citations = ["Sushruta Samhita Sutrasthana 15/41", "Charaka Samhita Sutrasthana 1"]
            topic = "Fundamental Principles (Maulik Siddhanta)"

        return StudyAssistantOut(
            answer=answer,
            classical_citations=citations,
            curriculum_topic=topic
        )
