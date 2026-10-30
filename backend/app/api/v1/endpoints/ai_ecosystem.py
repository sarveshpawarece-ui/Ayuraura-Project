import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.bams_ecosystem import StudentBamsProgress
from app.models.ai_ecosystem import AIChatSession, AIChatMessage, AIGeneratedQuiz, AIQuizAttempt, AIStudySchedule
from app.services.ai_unified_service import AIUnifiedService
from app.schemas.ai_ecosystem import (
    AIChatSessionCreateIn,
    AIChatSessionOut,
    AIChatMessageIn,
    AIChatMessageOut,
    AIChatResponseOut,
    AINoteCreateIn,
    AINoteUpdateIn,
    AINoteOut,
    AINoteVersionOut,
    AINoteTransformIn,
    AINoteTransformOut,
    AIQuizGenerateIn,
    AIQuizOut,
    AIQuizSubmitIn,
    AIQuizResultOut,
    AIStudyPlanGenerateIn,
    AIStudyPlanOut,
    AILearningRecommendationsOut,
    AIAnswerSubmitIn,
    AIAnswerFeedbackOut,
    AIFacultyToolIn,
    AIFacultyToolOut,
    AISearchIn,
    AISearchResponseOut,
    AIAnatomyExplainerIn,
    AIAnatomyExplainerOut,
    AIAnatomyQAIn,
    AIAnatomyQAOut,
    AIAnatomyQuizIn,
    AIAnatomyQuizOut,
    AIAnatomySummaryIn,
    AIAnatomySummaryOut,
    StudentAnatomyProgressIn,
    StudentAnatomyProgressOut
)

router = APIRouter()

# ============================================================
# 1. UNIFIED AI CHATBOT & SESSIONS
# ============================================================

@router.get("/sessions", response_model=List[AIChatSessionOut])
async def list_chat_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(AIChatSession)
        .where(AIChatSession.user_id == current_user.id)
        .order_by(AIChatSession.is_pinned.desc(), AIChatSession.updated_at.desc())
    )
    sessions = res.scalars().all()
    out = []
    for s in sessions:
        count_res = await db.execute(
            select(AIChatMessage).where(AIChatMessage.session_id == s.id)
        )
        msg_count = len(count_res.scalars().all())
        out.append(
            AIChatSessionOut(
                id=s.id,
                title=s.title,
                user_role=s.user_role,
                current_subject=s.current_subject,
                is_pinned=s.is_pinned,
                created_at=s.created_at,
                updated_at=s.updated_at,
                message_count=msg_count
            )
        )
    return out

@router.post("/sessions", response_model=AIChatSessionOut, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    data: AIChatSessionCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = AIChatSession(
        user_id=current_user.id,
        title=data.title or "New Consultation",
        user_role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        current_subject=data.current_subject or "General BAMS"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return AIChatSessionOut(
        id=session.id,
        title=session.title,
        user_role=session.user_role,
        current_subject=session.current_subject,
        is_pinned=session.is_pinned,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0
    )

@router.get("/sessions/{session_id}/messages", response_model=List[AIChatMessageOut])
async def get_session_messages(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    res = await db.execute(
        select(AIChatSession).where(
            AIChatSession.id == session_id,
            AIChatSession.user_id == current_user.id
        )
    )
    session = res.scalar_one_or_none()
    if not session:
        return []

    msg_res = await db.execute(
        select(AIChatMessage)
        .where(AIChatMessage.session_id == session_id)
        .order_by(AIChatMessage.created_at.asc())
    )
    return list(msg_res.scalars().all())

@router.post("/chat", response_model=AIChatResponseOut)
async def unified_chat(
    data: AIChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.chat(db, current_user, data)


# ============================================================
# 2. AI NOTES ASSISTANT & TRANSFORMATIONS
# ============================================================

@router.get("/notes", response_model=List[AINoteOut])
async def list_notes(
    subject: Optional[str] = Query(None),
    folder: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notes = await AIUnifiedService.list_notes(db, current_user, subject, folder, search)
    out = []
    for n in notes:
        out.append(
            AINoteOut(
                id=n.id,
                title=n.title,
                content=n.content,
                subject=n.subject,
                topic=n.topic,
                chapter=n.chapter,
                folder_name=n.folder_name,
                tags=n.tags,
                color_code=n.color_code,
                is_pinned=n.is_pinned,
                is_archived=n.is_archived,
                created_at=n.created_at,
                updated_at=n.updated_at,
                version_count=1
            )
        )
    return out

@router.post("/notes", response_model=AINoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    data: AINoteCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = await AIUnifiedService.create_note(db, current_user, data)
    return AINoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        topic=note.topic,
        chapter=note.chapter,
        folder_name=note.folder_name,
        tags=note.tags,
        color_code=note.color_code,
        is_pinned=note.is_pinned,
        is_archived=note.is_archived,
        created_at=note.created_at,
        updated_at=note.updated_at,
        version_count=1
    )

@router.put("/notes/{note_id}", response_model=AINoteOut)
async def update_note(
    note_id: uuid.UUID,
    data: AINoteUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = await AIUnifiedService.update_note(db, current_user, note_id, data)
    return AINoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        topic=note.topic,
        chapter=note.chapter,
        folder_name=note.folder_name,
        tags=note.tags,
        color_code=note.color_code,
        is_pinned=note.is_pinned,
        is_archived=note.is_archived,
        created_at=note.created_at,
        updated_at=note.updated_at,
        version_count=1
    )

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await AIUnifiedService.delete_note(db, current_user, note_id)
    return None

@router.get("/notes/{note_id}/versions", response_model=List[AINoteVersionOut])
async def list_note_versions(
    note_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.list_note_versions(db, current_user, note_id)

@router.post("/notes/{note_id}/restore/{version_id}", response_model=AINoteOut)
async def restore_note_version(
    note_id: uuid.UUID,
    version_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = await AIUnifiedService.restore_note_version(db, current_user, note_id, version_id)
    return AINoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        topic=note.topic,
        chapter=note.chapter,
        folder_name=note.folder_name,
        tags=note.tags,
        color_code=note.color_code,
        is_pinned=note.is_pinned,
        is_archived=note.is_archived,
        created_at=note.created_at,
        updated_at=note.updated_at,
        version_count=1
    )

@router.post("/notes/transform", response_model=AINoteTransformOut)
async def transform_note(
    data: AINoteTransformIn,
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.transform_note(data)


# ============================================================
# 3. AI QUIZ AND EXAM GENERATOR
# ============================================================

@router.post("/quiz/generate", response_model=AIQuizOut)
async def generate_quiz(
    data: AIQuizGenerateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.generate_quiz(db, current_user, data)

@router.post("/quiz/submit", response_model=AIQuizResultOut)
async def submit_quiz(
    data: AIQuizSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.submit_quiz(db, current_user, data)

@router.get("/quiz/history")
async def quiz_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(AIQuizAttempt)
        .where(AIQuizAttempt.user_id == current_user.id)
        .order_by(AIQuizAttempt.completed_at.desc())
        .limit(15)
    )
    attempts = res.scalars().all()
    history = []
    for a in attempts:
        q_res = await db.execute(select(AIGeneratedQuiz).where(AIGeneratedQuiz.id == a.quiz_id))
        quiz = q_res.scalar_one_or_none()
        history.append({
            "attempt_id": a.id,
            "quiz_id": a.quiz_id,
            "quiz_title": quiz.title if quiz else "Practice Quiz",
            "subject": quiz.subject if quiz else "Ayurveda",
            "score": a.score,
            "max_score": a.max_score,
            "score_percentage": a.score_percentage,
            "feedback_notes": a.feedback_notes,
            "completed_at": a.completed_at
        })
    return history


# ============================================================
# 4. AI PERSONAL STUDY PLANNER
# ============================================================

@router.post("/study-plan/generate", response_model=AIStudyPlanOut)
async def generate_study_plan(
    data: AIStudyPlanGenerateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.generate_study_plan(db, current_user, data)

@router.get("/study-plan")
async def get_active_study_plan(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(AIStudySchedule)
        .where(AIStudySchedule.user_id == current_user.id, AIStudySchedule.is_active == True)
        .order_by(AIStudySchedule.created_at.desc())
    )
    plan = res.scalar_one_or_none()
    if not plan:
        return None
    today = date.today()
    exam_d = plan.exam_date
    if isinstance(exam_d, str):
        try:
            from datetime import datetime as dt
            exam_d = dt.strptime(exam_d, "%Y-%m-%d").date()
        except Exception:
            exam_d = today
    days_rem = max(1, (exam_d - today).days)
    return {
        "id": plan.id,
        "title": plan.title,
        "exam_name": plan.exam_name,
        "exam_date": plan.exam_date,
        "days_remaining": days_rem,
        "available_hours_daily": plan.available_hours_daily,
        "target_subjects": plan.target_subjects,
        "weak_topics": plan.weak_topics,
        "days": plan.schedule_blocks,
        "progress_percentage": plan.progress_percentage,
        "ayurvedic_lifestyle_tip": "Brahma Muhurta study with warm Ushodaka stimulates Medha Agni and enhances Shloka retention.",
        "created_at": plan.created_at
    }


# ============================================================
# 5. AI PERSONALIZED LEARNING & RECOMMENDATIONS
# ============================================================

@router.get("/recommendations", response_model=AILearningRecommendationsOut)
async def get_learning_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.get_learning_recommendations(db, current_user)


# ============================================================
# 6. AI DESCRIPTIVE ANSWER FEEDBACK
# ============================================================

@router.post("/answer-feedback", response_model=AIAnswerFeedbackOut)
async def evaluate_answer(
    data: AIAnswerSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.evaluate_answer(db, current_user, data)


# ============================================================
# 7. AI FACULTY ASSISTANT
# ============================================================

@router.post("/faculty-tool", response_model=AIFacultyToolOut)
async def faculty_ai_tool(
    data: AIFacultyToolIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.faculty_tool(db, current_user, data)


# ============================================================
# 8. AI EDUCATIONAL CONTENT SEARCH
# ============================================================

@router.post("/search", response_model=AISearchResponseOut)
async def educational_search(
    data: AISearchIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIUnifiedService.search_content(db, current_user, data)


# ============================================================
# 9. AI ANATOMY & SUBJECT EXPLAINER
# ============================================================

@router.post("/anatomy-explainer", response_model=AIAnatomyExplainerOut)
async def anatomy_explainer(
    data: AIAnatomyExplainerIn,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Pedagogical BAMS Sharira Rachana explanation for 3D structures."""
    return await AIUnifiedService.explain_anatomy(data)


@router.post("/anatomy-qa", response_model=AIAnatomyQAOut)
async def anatomy_question_answering(
    data: AIAnatomyQAIn,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Contextual academic Q&A regarding currently viewed anatomical structure."""
    return await AIUnifiedService.ask_anatomy_question(data)


@router.post("/anatomy-quiz", response_model=AIAnatomyQuizOut)
async def anatomy_quiz_generation(
    data: AIAnatomyQuizIn,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Generate topic-based active-recall quiz and flashcards for anatomical structures."""
    return await AIUnifiedService.generate_anatomy_quiz(data)


@router.post("/anatomy-summary", response_model=AIAnatomySummaryOut)
async def anatomy_revision_summary(
    data: AIAnatomySummaryIn,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Generate high-yield revision summary, mnemonics, and classical treatise citations."""
    return await AIUnifiedService.get_anatomy_revision_summary(data)


@router.get("/anatomy-progress", response_model=StudentAnatomyProgressOut)
async def get_anatomy_progress(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve student anatomy study progress, notes, and revision recommendations."""
    completed = []
    notes = {}
    recommendations = [
        {"structure_id": "femur_right", "title": "Femur (Asthi Sharir)", "reason": "High-yield long bone osteology; recommended for revision"},
        {"structure_id": "knee_acl", "title": "Knee Joint Articulation (Sandhi)", "reason": "Synovial articulation and Snayu ligaments practical correlation"},
        {"structure_id": "heart_organ", "title": "Hridaya (Cardiovascular)", "reason": "Mula of Rasavaha and Pranavaha Srotas core revision"}
    ]

    if current_user:
        res = await db.execute(
            select(StudentBamsProgress).where(StudentBamsProgress.user_id == current_user.id)
        )
        prog = res.scalar_one_or_none()
        if prog:
            completed = [t for t in (prog.completed_topics or []) if t.startswith("anat_")]
            notes = (prog.learning_goals or {}).get("anatomy_notes", {})

    return StudentAnatomyProgressOut(
        completed_structures=completed,
        total_studied=len(completed),
        notes=notes,
        recommended_revisions=recommendations
    )


@router.post("/anatomy-progress", response_model=StudentAnatomyProgressOut)
async def update_anatomy_progress(
    payload: StudentAnatomyProgressIn,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Record student completion and personal notes for an anatomical structure."""
    completed = []
    notes = {}
    topic_id = f"anat_{payload.structure_id}"

    if current_user:
        res = await db.execute(
            select(StudentBamsProgress).where(StudentBamsProgress.user_id == current_user.id)
        )
        prog = res.scalar_one_or_none()
        if not prog:
            prog = StudentBamsProgress(
                user_id=current_user.id,
                current_prof_year="1st Prof",
                completed_topics=[],
                bookmarked_topics=[],
                recently_viewed_topics=[],
                learning_goals={"anatomy_notes": {}}
            )
            db.add(prog)

        comp_list = list(prog.completed_topics or [])
        if payload.is_completed and topic_id not in comp_list:
            comp_list.append(topic_id)
        elif not payload.is_completed and topic_id in comp_list:
            comp_list.remove(topic_id)
        prog.completed_topics = comp_list

        lg = dict(prog.learning_goals or {})
        current_notes = dict(lg.get("anatomy_notes", {}))
        if payload.notes:
            current_notes[payload.structure_id] = payload.notes
        lg["anatomy_notes"] = current_notes
        prog.learning_goals = lg

        await db.commit()
        await db.refresh(prog)

        completed = [t for t in prog.completed_topics if t.startswith("anat_")]
        notes = current_notes
    else:
        completed = [topic_id] if payload.is_completed else []
        if payload.notes:
            notes[payload.structure_id] = payload.notes

    recommendations = [
        {"structure_id": "femur_right", "title": "Femur (Asthi Sharir)", "reason": "High-yield long bone osteology; recommended for revision"},
        {"structure_id": "knee_acl", "title": "Knee Joint Articulation (Sandhi)", "reason": "Synovial articulation and Snayu ligaments practical correlation"}
    ]

    return StudentAnatomyProgressOut(
        completed_structures=completed,
        total_studied=len(completed),
        notes=notes,
        recommended_revisions=recommendations
    )
