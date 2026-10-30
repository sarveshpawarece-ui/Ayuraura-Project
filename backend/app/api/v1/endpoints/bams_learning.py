import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.bams_learning_service import BamsLearningService
from app.schemas.bams_learning import (
    BamsCurriculumOut,
    BamsSubjectSchema,
    BamsTopicSchema,
    StudentProgressOut,
    RecordViewTopicIn,
    ClinicalLogbookEntryIn,
    ClinicalLogbookEntryOut,
    StudentGoalSettingsIn,
    StudentGoalSettingsOut,
    SmartRecommendationOut,
    FlashcardCardSchema,
    FlashcardReviewIn,
    StudentPersonalizedDashboardOut
)


router = APIRouter()

# ============================================================
# 1. CURRICULUM & SUBJECT/TOPIC BROWSING
# ============================================================

@router.get("/curriculum", response_model=BamsCurriculumOut)
async def get_curriculum(
    prof_year: Optional[str] = Query(None, description="Filter by professional year e.g. 1st Prof, 2nd Prof"),
    subject_id: Optional[str] = Query(None, description="Filter by subject ID e.g. sub-rachana")
):
    """Retrieve NCISM BAMS curriculum structure across professional years, subjects, and topics."""
    return BamsLearningService.get_curriculum(prof_year=prof_year, subject_id=subject_id)


@router.get("/subjects", response_model=List[BamsSubjectSchema])
async def list_subjects(
    prof_year: Optional[str] = Query(None, description="Filter by professional year")
):
    """Retrieve list of BAMS subjects with syllabus unit counts, hours, and descriptions."""
    curriculum = BamsLearningService.get_curriculum(prof_year=prof_year)
    return curriculum.subjects


@router.get("/topics", response_model=List[BamsTopicSchema])
async def list_topics(
    subject_id: Optional[str] = Query(None, description="Filter by subject ID"),
    prof_year: Optional[str] = Query(None, description="Filter by professional year")
):
    """Retrieve BAMS learning topics with Shlokas, diagrams, learning objectives, and revision points."""
    curriculum = BamsLearningService.get_curriculum(prof_year=prof_year, subject_id=subject_id)
    return curriculum.topics


@router.get("/topics/{topic_id}", response_model=BamsTopicSchema)
async def get_topic_by_id(topic_id: str):
    """Retrieve single BAMS topic by unique ID."""
    curriculum = BamsLearningService.get_curriculum()
    for topic in curriculum.topics:
        if topic.id == topic_id:
            return topic
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Topic '{topic_id}' not found.")


# ============================================================
# 2. STUDENT PROGRESS, BOOKMARKS & RECENT HISTORY
# ============================================================

@router.get("/progress", response_model=StudentProgressOut)
async def get_my_learning_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve authenticated student's real-time syllabus completion, bookmarks, and continue-learning pointer."""
    return await BamsLearningService.get_student_progress(db, current_user)


@router.post("/topics/{topic_id}/toggle-complete", response_model=StudentProgressOut)
async def toggle_topic_complete(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle completed status for a BAMS topic and recalculate progress percentages."""
    return await BamsLearningService.toggle_topic_complete(db, current_user, topic_id)


@router.post("/topics/{topic_id}/toggle-bookmark", response_model=StudentProgressOut)
async def toggle_topic_bookmark(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle bookmark for a BAMS topic."""
    return await BamsLearningService.toggle_topic_bookmark(db, current_user, topic_id)


@router.post("/topics/{topic_id}/view", response_model=StudentProgressOut)
async def record_topic_view(
    topic_id: str,
    payload: RecordViewTopicIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record student viewing a topic to update recently viewed history and continue-learning pointer."""
    return await BamsLearningService.record_topic_view(
        db,
        current_user,
        topic_id=topic_id,
        title=payload.title,
        subject_id=payload.subject_id,
        subject_name=payload.subject_name
    )


# ============================================================
# 3. CLINICAL & INTERNSHIP LOGBOOK
# ============================================================

@router.get("/logbook", response_model=List[ClinicalLogbookEntryOut])
async def get_logbook_entries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve practical and internship clinical logbook entries for the student."""
    progress = await BamsLearningService.get_student_progress(db, current_user)
    return [ClinicalLogbookEntryOut(**e) for e in progress.clinical_logbook]


@router.post("/logbook", response_model=ClinicalLogbookEntryOut, status_code=status.HTTP_201_CREATED)
async def add_logbook_entry(
    payload: ClinicalLogbookEntryIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a clinical or internship logbook entry with reflection and supervisor sign-off."""
    return await BamsLearningService.add_logbook_entry(db, current_user, payload)


# ============================================================
# 4. PERSONALIZED STUDENT DASHBOARD CONSOLIDATED VIEW
# ============================================================

@router.get("/dashboard", response_model=StudentPersonalizedDashboardOut)
async def get_student_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve consolidated personalized student dashboard with real academic progress, notes, schedule, exams, and goals."""
    return await BamsLearningService.get_personalized_dashboard(db, current_user)


# ============================================================
# 5. SMART LEARNING RECOMMENDATIONS
# ============================================================

@router.get("/recommendations", response_model=List[SmartRecommendationOut])
async def get_smart_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve smart context-aware learning recommendations based on syllabus progress, quiz scores, and saved notes."""
    return await BamsLearningService.get_smart_recommendations(db, current_user)


@router.post("/recommendations/{rec_id}/dismiss")
async def dismiss_recommendation(
    rec_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dismiss a specific recommendation."""
    return await BamsLearningService.dismiss_recommendation(db, current_user, rec_id)


@router.post("/recommendations/{rec_id}/complete")
async def complete_recommendation(
    rec_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a recommendation as completed."""
    return await BamsLearningService.complete_recommendation(db, current_user, rec_id)


@router.post("/recommendations/reset")
async def reset_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reset dismissed and completed recommendations to refresh suggestion pool."""
    return await BamsLearningService.reset_recommendations(db, current_user)


# ============================================================
# 6. INTERACTIVE FLASHCARDS
# ============================================================

@router.get("/flashcards", response_model=List[FlashcardCardSchema])
async def get_flashcard_deck(
    subject_id: Optional[str] = Query(None, description="Filter by subject ID e.g. sub-panchakarma"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve interactive active-recall flashcard deck with Shlokas, concept explanations, and clinical pearls."""
    return await BamsLearningService.get_flashcards(db, current_user, subject_id=subject_id)


@router.post("/flashcards/{card_id}/review")
async def review_flashcard(
    card_id: str,
    payload: FlashcardReviewIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record student self-assessment rating (EASY, MEDIUM, HARD) for spaced repetition."""
    return await BamsLearningService.record_flashcard_review(db, current_user, card_id, payload.rating)


# ============================================================
# 7. LEARNING MOTIVATION & GOALS
# ============================================================

@router.get("/goals", response_model=StudentGoalSettingsOut)
async def get_student_goals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve daily/weekly study goals, current streak, and reminder settings."""
    return await BamsLearningService.get_goals(db, current_user)


@router.post("/goals", response_model=StudentGoalSettingsOut)
async def update_student_goals(
    payload: StudentGoalSettingsIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update student daily study targets, weekly quiz goals, and reminder preferences."""
    return await BamsLearningService.update_goals(db, current_user, payload)

