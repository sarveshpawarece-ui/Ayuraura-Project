import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.ai_ecosystem import NoteTransformType, AIQuestionFormat, FacultyToolType

# ============================================================
# 1. UNIFIED CHAT SCHEMAS
# ============================================================

class AIChatSessionCreateIn(BaseModel):
    title: Optional[str] = "New Consultation"
    current_subject: Optional[str] = "General BAMS"

class AIChatSessionOut(BaseModel):
    id: uuid.UUID
    title: str
    user_role: str
    current_subject: Optional[str] = None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class AIChatMessageIn(BaseModel):
    session_id: Optional[uuid.UUID] = None
    message: str = Field(..., min_length=1)
    subject_context: Optional[str] = None
    note_context: Optional[str] = None

class AIChatMessageOut(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    suggested_followups: List[str] = []
    classical_citations: List[str] = []
    context_used: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIChatResponseOut(BaseModel):
    session_id: uuid.UUID
    session_title: str
    reply: str
    suggested_followups: List[str] = []
    classical_citations: List[str] = []
    context_used: Dict[str, Any] = {}
    safety_disclaimer: str

# ============================================================
# 2. AI NOTES SCHEMAS
# ============================================================

class AINoteCreateIn(BaseModel):
    title: str = Field(..., min_length=1)
    content: str = ""
    subject: str = "Maulik Siddhanta"
    topic: str = "General"
    chapter: str = "Chapter 1"
    folder_name: str = "General"
    tags: List[str] = []
    color_code: str = "emerald"
    is_pinned: bool = False

class AINoteUpdateIn(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    chapter: Optional[str] = None
    folder_name: Optional[str] = None
    tags: Optional[List[str]] = None
    color_code: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    change_summary: Optional[str] = "Edited Note"

class AINoteVersionOut(BaseModel):
    id: uuid.UUID
    version_number: int
    title: str
    content: str
    change_summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AINoteOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    subject: str
    topic: str
    chapter: str
    folder_name: str
    tags: List[str]
    color_code: str
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    version_count: Optional[int] = 1

    model_config = ConfigDict(from_attributes=True)

class AINoteTransformIn(BaseModel):
    note_id: Optional[uuid.UUID] = None
    content: str
    subject: Optional[str] = "BAMS"
    transformation_type: NoteTransformType
    user_instruction: Optional[str] = None

class AINoteTransformOut(BaseModel):
    transformation_type: NoteTransformType
    original_snippet: str
    improved_content: str
    diff_summary: str
    headings_suggested: List[str] = []
    key_concepts: List[str] = []
    missing_points: List[str] = []
    flashcards: List[Dict[str, str]] = []  # [{front, back}]
    revision_checklist: List[str] = []
    classical_references: List[str] = []

# ============================================================
# 3. AI QUIZ GENERATOR SCHEMAS
# ============================================================

class AIQuizGenerateIn(BaseModel):
    subject: str = "Dravyaguna"
    topic: str = "Triphala & Rasayana Herbs"
    difficulty: str = "MEDIUM"  # EASY, MEDIUM, HARD, ADAPTIVE
    question_format: AIQuestionFormat = AIQuestionFormat.MCQ
    question_count: int = Field(5, ge=1, le=20)
    source_note_id: Optional[uuid.UUID] = None
    source_text: Optional[str] = None

class AIQuizQuestionOut(BaseModel):
    id: int
    question: str
    question_format: str
    options: List[str] = []
    correct_index: Optional[int] = None
    correct_answer_text: Optional[str] = None
    explanation: str
    why_incorrect: Dict[str, str] = {}
    marks: int = 1
    classical_citation: Optional[str] = None

class AIQuizOut(BaseModel):
    id: uuid.UUID
    title: str
    subject: str
    topic: str
    difficulty: str
    question_format: str
    question_count: int
    questions: List[AIQuizQuestionOut]
    is_official_exam: bool
    created_at: datetime

class AIQuizSubmitIn(BaseModel):
    quiz_id: uuid.UUID
    answers: List[Dict[str, Any]]  # [{question_id, selected_index, selected_text}]
    time_taken_seconds: int = 0

class AIQuizResultOut(BaseModel):
    attempt_id: uuid.UUID
    quiz_id: uuid.UUID
    score: float
    max_score: float
    score_percentage: float
    passed: bool
    detailed_evaluations: List[Dict[str, Any]]
    feedback_notes: str
    weak_topics_flagged: List[str] = []
    recommended_revision: str

# ============================================================
# 4. AI STUDY PLANNER SCHEMAS
# ============================================================

class AIStudyPlanGenerateIn(BaseModel):
    title: Optional[str] = None
    exam_name: str = "BAMS Annual Professional Exam"
    exam_date: date
    target_subjects: List[str] = ["Roganidana", "Kayachikitsa", "Shalya Tantra"]
    daily_available_hours: float = Field(4.0, ge=1.0, le=14.0)
    preferred_study_time: str = "MORNING"  # MORNING, EVENING, SPLIT
    weak_topics: List[str] = []
    completed_topics: List[str] = []
    revision_frequency_days: int = 4

class AIStudySessionOut(BaseModel):
    session_id: str
    subject: str
    topic: str
    duration_minutes: int
    session_type: str  # STUDY, REVISION, PRACTICE_QUIZ, RESTORATIVE_BREAK
    suggested_time_slot: str
    is_completed: bool = False
    priority: str = "HIGH"  # HIGH, MEDIUM, NORMAL

class AIStudyDayOut(BaseModel):
    day_number: int
    date_str: str
    total_hours: float
    focus_theme: str
    sessions: List[AIStudySessionOut]

class AIStudyPlanOut(BaseModel):
    id: uuid.UUID
    title: str
    exam_name: str
    exam_date: date
    days_remaining: int
    available_hours_daily: float
    target_subjects: List[str]
    weak_topics: List[str]
    days: List[AIStudyDayOut]
    progress_percentage: float
    ayurvedic_lifestyle_tip: str
    created_at: datetime

# ============================================================
# 5. AI PERSONALIZED LEARNING & WEAK TOPIC RECOMMENDATIONS
# ============================================================

class AILearningRecommendationItem(BaseModel):
    topic: str
    subject: str
    reason: str
    mastery_level_pct: float
    recommended_action: str
    priority: str  # URGENT, RECOMMENDED, OPTIONAL
    suggested_quiz_topic: str
    suggested_shloka_reference: Optional[str] = None

class AILearningRecommendationsOut(BaseModel):
    student_name: str
    current_year: str
    overall_learning_health: str  # EXCELLENT, STEADY, ATTENTION_REQUIRED
    average_quiz_score_pct: float
    weak_topics: List[AILearningRecommendationItem]
    next_recommended_steps: List[str]

# ============================================================
# 6. AI ANSWER FEEDBACK SCHEMAS
# ============================================================

class AIAnswerSubmitIn(BaseModel):
    subject: str = "Kayachikitsa"
    question_text: str = Field(..., min_length=5)
    student_answer: str = Field(..., min_length=15)
    target_marks: int = Field(10, ge=5, le=20)

class AIAnswerFeedbackOut(BaseModel):
    evaluation_id: uuid.UUID
    overall_score: float
    target_marks: int
    score_percentage: float
    structure_score: float
    clarity_score: float
    terminology_score: float
    covered_concepts: List[str]
    missing_concepts: List[str]
    constructive_feedback: str
    grammar_and_presentation_tips: List[str]
    model_answer: str
    safety_disclaimer: str

# ============================================================
# 7. AI FACULTY ASSISTANT SCHEMAS
# ============================================================

class AIFacultyToolIn(BaseModel):
    tool_type: FacultyToolType
    subject: str
    curriculum_level: str = "BAMS 3rd Year"
    topic: str
    additional_notes: Optional[str] = None
    target_duration_minutes: Optional[int] = 60

class AIFacultyToolOut(BaseModel):
    id: uuid.UUID
    tool_type: FacultyToolType
    subject: str
    curriculum_level: str
    topic: str
    title: str
    content: Dict[str, Any]
    formatted_markdown: str
    created_at: datetime

# ============================================================
# 8. AI EDUCATIONAL SEARCH SCHEMAS
# ============================================================

class AISearchIn(BaseModel):
    query: str = Field(..., min_length=2)
    subject_filter: Optional[str] = None
    resource_type_filter: Optional[str] = None  # ALL, SHLOKA, SYLLABUS, NOTE, CASE_STUDY

class AISearchResultItem(BaseModel):
    id: str
    title: str
    snippet: str
    category: str  # Classical Treatise, NCISM Syllabus, Case Study, Personal Note
    subject: str
    source_citation: str
    relevance_score: float
    url: Optional[str] = None

class AISearchResponseOut(BaseModel):
    query: str
    total_results: int
    results: List[AISearchResultItem]
    ai_synthesis: str
    suggested_followups: List[str]

# ============================================================
# 9. AI ANATOMY & SUBJECT EXPLAINER SCHEMAS
# ============================================================

class AIAnatomyExplainerIn(BaseModel):
    structure_name: str
    sanskrit_name: Optional[str] = None
    region: Optional[str] = "Full Body"
    mode: str = "BEGINNER"  # BEGINNER, ADVANCED
    include_questions: bool = True

class AIAnatomyExplainerOut(BaseModel):
    structure_name: str
    sanskrit_name: str
    mode: str
    classical_correlation: str  # Rachana Sharira, Srotas, Dhatu, Upadhatu
    modern_anatomy_summary: str
    clinical_marma_vulnerability: str
    clinical_surgical_significance: Optional[str] = None
    step_by_step_physiological_flow: List[str]
    high_yield_exam_points: List[str]
    practice_questions: List[Dict[str, str]]
    disclaimer: str

# 10. INTERACTIVE ANATOMY LEARNING & AI SCHEMAS
class AIAnatomyQAIn(BaseModel):
    structure_name: str
    sanskrit_name: Optional[str] = None
    system_id: Optional[str] = None
    question: str
    bams_subject: Optional[str] = "Rachana Sharir"

class AIAnatomyQAOut(BaseModel):
    structure_name: str
    question: str
    answer: str
    classical_treatise_citations: List[str]
    suggested_followups: List[str]
    bams_correlation: str
    disclaimer: str

class AIAnatomyQuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    classical_citation: Optional[str] = None
    bams_subject: str

class AIAnatomyFlashcard(BaseModel):
    id: str
    title: str
    sanskrit_term: str
    front: str
    back: str
    bams_subject: str
    high_yield_note: str

class AIAnatomyQuizIn(BaseModel):
    structure_name: str
    sanskrit_name: Optional[str] = None
    system_id: Optional[str] = None
    bams_year: Optional[str] = "1st Year"
    difficulty: Optional[str] = "INTERMEDIATE"

class AIAnatomyQuizOut(BaseModel):
    structure_name: str
    system_name: str
    questions: List[AIAnatomyQuizQuestion]
    flashcards: List[AIAnatomyFlashcard]
    disclaimer: str

class AIAnatomySummaryIn(BaseModel):
    structure_name: str
    sanskrit_name: Optional[str] = None
    system_id: Optional[str] = None

class AIAnatomySummaryOut(BaseModel):
    structure_name: str
    key_takeaways: List[str]
    mnemonics: List[str]
    classical_shlokas: List[str]
    exam_viva_tips: List[str]
    disclaimer: str

class StudentAnatomyProgressIn(BaseModel):
    structure_id: str
    system_id: str
    is_completed: bool
    notes: Optional[str] = None

class StudentAnatomyProgressOut(BaseModel):
    completed_structures: List[str]
    total_studied: int
    notes: Dict[str, str]
    recommended_revisions: List[Dict[str, str]]
