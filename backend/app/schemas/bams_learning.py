import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class BamsShlokaSchema(BaseModel):
    devanagari: str
    iast: str
    englishMeaning: str
    sourceTreatise: str
    clinicalPearl: str

class BamsDiagramSchema(BaseModel):
    title: str
    description: str
    educationalContext: str
    altText: str
    diagramType: str
    visualSvgType: str

class BamsTopicSchema(BaseModel):
    id: str
    subjectId: str
    subjectName: str
    unitNumber: int
    unitTitle: str
    topicTitle: str
    difficulty: str
    learningObjectives: List[str] = []
    explanation: str
    sanskritShloka: Optional[BamsShlokaSchema] = None
    diagram: Optional[BamsDiagramSchema] = None
    keyRevisionPoints: List[str] = []
    examHighYield: bool = False

class BamsSubjectSchema(BaseModel):
    id: str
    code: str
    name: str
    sanskritName: str
    professionalYear: str
    iconName: str
    totalHours: int
    description: str
    unitsCount: int
    topicsCount: int
    linkedSkillName: str
    targetCareerRelevance: List[str] = []

class BamsCurriculumOut(BaseModel):
    professional_years: List[str]
    subjects: List[BamsSubjectSchema]
    topics: List[BamsTopicSchema]
    total_subjects: int
    total_topics: int

class StudentProgressOut(BaseModel):
    user_id: uuid.UUID
    current_prof_year: str
    completed_topics: List[str]
    bookmarked_topics: List[str]
    recently_viewed_topics: List[Dict[str, Any]]
    overall_completion_pct: float
    subject_completion: Dict[str, float]
    clinical_logbook: List[Dict[str, Any]]
    continue_learning_topic: Optional[Dict[str, Any]] = None

class ToggleTopicActionIn(BaseModel):
    prof_year: Optional[str] = None

class RecordViewTopicIn(BaseModel):
    title: str
    subject_id: str
    subject_name: Optional[str] = None

class ClinicalLogbookEntryIn(BaseModel):
    date: str = Field(..., description="Date of clinical posting, e.g. 2026-10-29")
    posting: str = Field(..., description="e.g. Inpatient Ward, Panchakarma Theatre, Shalya OT")
    department: str = Field("Panchakarma", description="Department name")
    procedure_observed: str = Field(..., description="Procedure or patient case observed")
    reflection: str = Field(..., description="Clinical observation and learning reflection")
    supervisor_name: Optional[str] = "Dr. Vaidya In-Charge"

class ClinicalLogbookEntryOut(ClinicalLogbookEntryIn):
    id: str
    created_at: Optional[str] = None

# ============================================================
# LEARNING MOTIVATION, GOALS & REMINDERS
# ============================================================

class StudentGoalSettingsIn(BaseModel):
    target_minutes_daily: int = Field(45, ge=10, le=480, description="Daily study target in minutes")
    target_topics_daily: int = Field(3, ge=1, le=20, description="Target topics to review daily")
    target_quizzes_weekly: int = Field(4, ge=1, le=50, description="Target quizzes to attempt weekly")
    reminders_enabled: bool = Field(True, description="Enable gentle daily revision reminders")
    reminder_time: str = Field("19:00", description="Preferred 24-hr reminder time (HH:MM)")

class StudentGoalSettingsOut(StudentGoalSettingsIn):
    completed_minutes_today: int = 35
    completed_topics_today: int = 2
    current_streak_days: int = 4
    streak_encouragement: str = "Great focus! You're making steady daily progress."

# ============================================================
# SMART LEARNING RECOMMENDATIONS
# ============================================================

class SmartRecommendationOut(BaseModel):
    id: str
    type: str = Field(..., description="LESSON | PRACTICE_QUIZ | FLASHCARD | REVISION | NOTE_REVIEW | CASE_STUDY")
    title: str
    subject: str
    topic_id: Optional[str] = None
    reason: str
    priority: str = Field("MEDIUM", description="HIGH | MEDIUM | ROUTINE")
    est_minutes: int = 15
    action_url: str
    is_completed: bool = False
    is_dismissed: bool = False

# ============================================================
# INTERACTIVE FLASHCARDS & CHECKLISTS
# ============================================================

class FlashcardCardSchema(BaseModel):
    id: str
    subjectId: str
    subjectName: str
    topicId: str
    topicTitle: str
    sanskritTerm: str
    sanskritDevanagari: str
    conceptExplanation: str
    clinicalCorrelation: str
    modernCorrelate: str
    difficulty: str = "INTERMEDIATE"
    masteryStatus: str = "NEW"  # NEW, LEARNING, MASTERED
    userRating: Optional[str] = None  # EASY, MEDIUM, HARD

class FlashcardReviewIn(BaseModel):
    rating: str = Field(..., description="EASY | MEDIUM | HARD")

class ChecklistToggleIn(BaseModel):
    item_id: str
    completed: bool

# ============================================================
# PERSONALIZED STUDENT DASHBOARD CONSOLIDATED VIEW
# ============================================================

class StudentPersonalizedDashboardOut(BaseModel):
    student_name: str
    academic_year: str
    overall_completion_pct: float
    topics_completed_count: int
    total_topics_count: int
    bookmarked_count: int
    subjects_progress: List[Dict[str, Any]]
    today_study_plan: List[Dict[str, Any]]
    upcoming_exams: List[Dict[str, Any]]
    pending_revisions: List[Dict[str, Any]]
    recently_viewed_topics: List[Dict[str, Any]]
    saved_notes_count: int
    saved_notes_recent: List[Dict[str, Any]]
    quiz_performance: Dict[str, Any]
    goals: StudentGoalSettingsOut
    milestones: List[Dict[str, Any]]
    recommendations: List[SmartRecommendationOut]

