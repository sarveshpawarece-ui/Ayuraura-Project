import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, or_
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.topic_quiz import (
    TopicQuizSubject,
    TopicQuizTopic,
    TopicQuizSubtopic,
    TopicQuizQuestion,
    TopicQuizAttempt,
    QuizDifficulty,
    QuizQuestionType,
    QuizAttemptStatus
)
from app.schemas.topic_quiz import (
    TopicQuizSubjectOut,
    TopicQuizTopicOut,
    TopicQuizSubtopicOut,
    QuizQuestionOut,
    QuizOptionOut,
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizSubmitRequest,
    QuizResultResponse,
    StudentTopicAnalyticsResponse,
    PersonalizedQuizRecommendationOut,
    AdminQuestionCreateRequest,
    AdminQuestionOut
)
from app.services.topic_quiz_service import TopicQuizService

router = APIRouter(prefix="/quiz", tags=["Topic-Based Quiz System"])


# ============================================================
# 1. SUBJECTS, TOPICS & SUBTOPICS HIERARCHY
# ============================================================

@router.get("/subjects", response_model=List[TopicQuizSubjectOut])
async def get_all_subjects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns full hierarchy of available subjects with topics and subtopics.
    """
    subjects = await TopicQuizService.get_all_subjects(db)
    
    # Calculate questions count per topic for metadata
    result = []
    for s in subjects:
        topics_out = []
        for t in s.topics:
            subtopics_out = [
                TopicQuizSubtopicOut(
                    id=st.id,
                    topic_id=st.topic_id,
                    name=st.name,
                    description=st.description,
                    display_order=st.display_order
                )
                for st in t.subtopics
            ]
            topics_out.append(
                TopicQuizTopicOut(
                    id=t.id,
                    subject_id=t.subject_id,
                    name=t.name,
                    description=t.description,
                    display_order=t.display_order,
                    questions_count=0,
                    subtopics=subtopics_out
                )
            )
        result.append(
            TopicQuizSubjectOut(
                id=s.id,
                name=s.name,
                code=s.code,
                icon=s.icon,
                description=s.description,
                display_order=s.display_order,
                topics=topics_out
            )
        )
    return result


@router.get("/subjects/{subject_id}/topics", response_model=List[TopicQuizTopicOut])
async def get_topics_for_subject(
    subject_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = await TopicQuizService.get_topics_by_subject(db, subject_id)
    return [
        TopicQuizTopicOut(
            id=t.id,
            subject_id=t.subject_id,
            name=t.name,
            description=t.description,
            display_order=t.display_order,
            subtopics=[
                TopicQuizSubtopicOut(
                    id=st.id,
                    topic_id=st.topic_id,
                    name=st.name,
                    description=st.description,
                    display_order=st.display_order
                )
                for st in t.subtopics
            ]
        )
        for t in topics
    ]


@router.get("/topics/{topic_id}/subtopics", response_model=List[TopicQuizSubtopicOut])
async def get_subtopics_for_topic(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtopics = await TopicQuizService.get_subtopics_by_topic(db, topic_id)
    return [
        TopicQuizSubtopicOut(
            id=st.id,
            topic_id=st.topic_id,
            name=st.name,
            description=st.description,
            display_order=st.display_order
        )
        for st in subtopics
    ]


# ============================================================
# 2. QUIZ GENERATION & ACTIVE QUIZ ROOM
# ============================================================

@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_topic_quiz(
    req: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a topic-bounded quiz according to selected Subject, Topic, Subtopic and Difficulty.
    NEVER returns unrelated questions.
    """
    try:
        attempt = await TopicQuizService.generate_quiz(db, current_user.id, req)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

    # Mask correct answers for student view
    questions_out: List[QuizQuestionOut] = []
    for q in attempt.questions_data:
        raw_options = q.get("options") or []
        options_out = [
            QuizOptionOut(id=str(opt.get("id", idx)), text=str(opt.get("text", opt)))
            for idx, opt in enumerate(raw_options)
        ]
        questions_out.append(
            QuizQuestionOut(
                id=uuid.UUID(q["id"]),
                subject_name=q["subject_name"],
                topic_name=q["topic_name"],
                subtopic_name=q.get("subtopic_name"),
                difficulty=q["difficulty"],
                question_type=q["question_type"],
                question_text=q["question_text"],
                options=options_out,
                tags=q.get("tags", [])
            )
        )

    return QuizGenerateResponse(
        attempt_id=attempt.id,
        subject_name=attempt.subject_name,
        topic_name=attempt.topic_name,
        subtopic_name=attempt.subtopic_name,
        difficulty_mode=attempt.difficulty_mode,
        total_questions=attempt.total_questions,
        questions=questions_out,
        started_at=attempt.started_at
    )


@router.get("/attempts/{attempt_id}", response_model=QuizGenerateResponse)
async def get_quiz_attempt(
    attempt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(TopicQuizAttempt).where(
            TopicQuizAttempt.id == attempt_id,
            TopicQuizAttempt.student_user_id == current_user.id
        )
    )
    attempt = res.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")

    questions_out: List[QuizQuestionOut] = []
    for q in attempt.questions_data:
        raw_options = q.get("options") or []
        options_out = [
            QuizOptionOut(id=str(opt.get("id", idx)), text=str(opt.get("text", opt)))
            for idx, opt in enumerate(raw_options)
        ]
        questions_out.append(
            QuizQuestionOut(
                id=uuid.UUID(q["id"]),
                subject_name=q["subject_name"],
                topic_name=q["topic_name"],
                subtopic_name=q.get("subtopic_name"),
                difficulty=q["difficulty"],
                question_type=q["question_type"],
                question_text=q["question_text"],
                options=options_out,
                tags=q.get("tags", [])
            )
        )

    return QuizGenerateResponse(
        attempt_id=attempt.id,
        subject_name=attempt.subject_name,
        topic_name=attempt.topic_name,
        subtopic_name=attempt.subtopic_name,
        difficulty_mode=attempt.difficulty_mode,
        total_questions=attempt.total_questions,
        questions=questions_out,
        started_at=attempt.started_at
    )


# ============================================================
# 3. QUIZ SUBMISSION & RESULTS
# ============================================================

@router.post("/attempts/{attempt_id}/submit", response_model=QuizResultResponse)
async def submit_topic_quiz(
    attempt_id: uuid.UUID,
    payload: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits quiz answers, evaluates performance, updates topic mastery,
    flags weak areas, and returns rich explanations + expert/study recommendations.
    """
    try:
        answers_dicts = [a.model_dump() for a in payload.answers]
        result = await TopicQuizService.submit_quiz_attempt(
            db=db,
            student_user_id=current_user.id,
            attempt_id=attempt_id,
            answers=answers_dicts,
            time_taken_seconds=payload.time_taken_seconds
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


# ============================================================
# 4. STUDENT TOPIC PERFORMANCE & PERSONALIZED RECOMMENDATIONS
# ============================================================

@router.get("/student/performance", response_model=StudentTopicAnalyticsResponse)
async def get_student_topic_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns student topic mastery scores, strong topics, and weak topic alerts.
    """
    return await TopicQuizService.get_student_topic_analytics(db, current_user.id)


@router.get("/student/recommendations", response_model=List[PersonalizedQuizRecommendationOut])
async def get_personalized_quiz_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns personalized quiz suggestions targeted to improve detected weak topics.
    """
    return await TopicQuizService.get_personalized_recommendations(db, current_user.id)


# ============================================================
# 5. FACULTY & ADMIN QUESTION MANAGEMENT
# ============================================================

@router.post("/admin/questions", response_model=AdminQuestionOut)
async def create_quiz_question(
    payload: AdminQuestionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.FACULTY, UserRole.ADMIN, UserRole.DOCTOR]))
):
    # Verify subject and topic exist
    subj_res = await db.execute(select(TopicQuizSubject).where(TopicQuizSubject.id == payload.subject_id))
    subj = subj_res.scalars().first()
    if not subj:
        raise HTTPException(status_code=400, detail="Invalid Subject ID")

    topic_res = await db.execute(select(TopicQuizTopic).where(TopicQuizTopic.id == payload.topic_id, TopicQuizTopic.subject_id == payload.subject_id))
    topic = topic_res.scalars().first()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic does not belong to the selected Subject")

    subtopic_name = None
    if payload.subtopic_id:
        sub_res = await db.execute(select(TopicQuizSubtopic).where(TopicQuizSubtopic.id == payload.subtopic_id, TopicQuizSubtopic.topic_id == payload.topic_id))
        sub = sub_res.scalars().first()
        if not sub:
            raise HTTPException(status_code=400, detail="Subtopic does not belong to the selected Topic")
        subtopic_name = sub.name

    q = TopicQuizQuestion(
        subject_id=payload.subject_id,
        topic_id=payload.topic_id,
        subtopic_id=payload.subtopic_id,
        subject_name=subj.name,
        topic_name=topic.name,
        subtopic_name=subtopic_name,
        difficulty=payload.difficulty,
        question_type=payload.question_type,
        question_text=payload.question_text.strip(),
        options=payload.options,
        correct_answer=payload.correct_answer.strip(),
        explanation=payload.explanation.strip(),
        clinical_pearl=payload.clinical_pearl.strip() if payload.clinical_pearl else None,
        tags=payload.tags,
        created_by_user_id=current_user.id
    )

    db.add(q)
    await db.commit()
    await db.refresh(q)
    return q


@router.get("/admin/questions", response_model=List[AdminQuestionOut])
async def list_admin_questions(
    subject_id: Optional[uuid.UUID] = None,
    topic_id: Optional[uuid.UUID] = None,
    difficulty: Optional[QuizDifficulty] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.FACULTY, UserRole.ADMIN, UserRole.DOCTOR]))
):
    query = select(TopicQuizQuestion).order_by(desc(TopicQuizQuestion.created_at)).limit(limit)

    if subject_id:
        query = query.where(TopicQuizQuestion.subject_id == subject_id)
    if topic_id:
        query = query.where(TopicQuizQuestion.topic_id == topic_id)
    if difficulty:
        query = query.where(TopicQuizQuestion.difficulty == difficulty)
    if search:
        s_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                TopicQuizQuestion.question_text.ilike(s_term),
                TopicQuizQuestion.topic_name.ilike(s_term),
                TopicQuizQuestion.explanation.ilike(s_term)
            )
        )

    res = await db.execute(query)
    return list(res.scalars().all())
