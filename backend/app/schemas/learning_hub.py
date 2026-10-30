from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 33, 34, 35, 36, 37 — LEARNING, KNOWLEDGE, TESTS & SCHOLARSHIPS SCHEMAS
# ============================================================

class ClassicalShlokaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    treatise_name: str
    sthana: str
    chapter_number: int
    chapter_name: str
    verse_number: str
    sanskrit_devanagari: str
    iast_transliteration: str
    english_meaning: str
    clinical_significance: Optional[str] = None
    subject: str
    tags: List[str]

class StudyModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject_name: str
    topic_title: str
    curriculum_year: str
    summary_content: str
    key_concepts: List[Dict[str, Any]]
    shloka_references: List[Any]
    exam_high_yield_notes: Optional[str] = None

class StudyNoteCreateIn(BaseModel):
    title: str = Field(..., min_length=1)
    content: str
    subject: str = "General"
    folder_name: str = "General"
    tags: List[str] = []
    color_code: str = "emerald"
    is_pinned: bool = False

class StudyNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    title: str
    content: str
    subject: str
    folder_name: str
    tags: List[str]
    color_code: str
    is_pinned: bool
    is_bookmarked: bool
    created_at: datetime
    updated_at: datetime

class PracticeStartIn(BaseModel):
    subject: str
    difficulty: str = "ALL"
    question_count: int = 5

class PracticeSubmitIn(BaseModel):
    answers: List[Dict[str, Any]]  # [{question_id, selected_option}]
    time_spent_seconds: int = 60

class PracticeSessionResultOut(BaseModel):
    total_questions: int
    correct_count: int
    score_pct: float
    time_spent_seconds: int
    review: List[Dict[str, Any]]

class MockTestStartIn(BaseModel):
    test_type: str = "MOCK_EXAM"

class MockTestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    test_type: str
    duration_minutes: int
    total_questions: int
    total_marks: float
    sections_config: List[Dict[str, Any]]
    questions_data: List[Dict[str, Any]]

class MockTestScorecardOut(BaseModel):
    total_score: float
    score_percentage: float
    percentile_rank: float
    section_scores: Dict[str, float]
    review: List[Dict[str, Any]]

class CourseEnrollIn(BaseModel):
    course_id: uuid.UUID

class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    instructor_name: str
    instructor_title: str
    category: str
    difficulty: str
    estimated_hours: float
    thumbnail_url: Optional[str] = None
    description: str
    skills_taught: List[str]
    modules: List[Dict[str, Any]]

class CourseCertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    certificate_token: str
    certificate_hash: str
    student_name: str
    course_title: str
    score_achieved: float
    issued_at: datetime
    is_valid: bool

class ScholarshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    provider_name: str
    provider_type: str
    description: str
    eligibility_criteria_text: str
    required_courses: List[str]
    min_cgpa: Optional[float] = None
    min_percentage: Optional[float] = None
    amount_benefit: str
    deadline: date
    application_url: str
    official_notification_url: Optional[str] = None
    status: str
    tags: List[str]
