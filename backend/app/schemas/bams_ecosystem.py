import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ============================================================
# 1. CASE STUDY SCHEMAS
# ============================================================

class BamsCaseStudyCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    subject: str = Field(..., max_length=100)
    topic: str = Field(..., max_length=255)
    difficulty: str = Field("Intermediate")
    patient_age: Optional[int] = 40
    patient_gender: Optional[str] = "Female"
    patient_prakriti: Optional[str] = "Vata-Kapha"
    presenting_complaints: List[str] = Field(default_factory=list)
    history_of_illness: str = Field(..., min_length=20)
    clinical_findings: Dict[str, Any] = Field(default_factory=dict)
    ayurvedic_assessment: Dict[str, Any] = Field(default_factory=dict)
    differential_considerations: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)
    discussion_questions: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_intervention: str = Field(..., min_length=20)

class BamsCaseStudyOut(BaseModel):
    id: uuid.UUID
    case_id_code: str
    title: str
    subject: str
    topic: str
    difficulty: str
    patient_age: Optional[int]
    patient_gender: Optional[str]
    patient_prakriti: Optional[str]
    presenting_complaints: List[str]
    history_of_illness: str
    clinical_findings: Dict[str, Any]
    ayurvedic_assessment: Dict[str, Any]
    differential_considerations: List[str]
    learning_objectives: List[str]
    discussion_questions: List[Dict[str, Any]]
    recommended_intervention: str
    case_fingerprint_hash: str
    verified_author_name: str
    educational_disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# 2. GUIDANCE REQUEST SCHEMAS
# ============================================================

class DoctorGuidanceRequestCreate(BaseModel):
    doctor_id: uuid.UUID
    session_type: str = Field(..., max_length=100)
    topic: str = Field(..., max_length=255)
    subject: str = Field(..., max_length=100)
    student_group: str = Field(..., max_length=255)
    expected_students_count: int = Field(30, ge=1, le=500)
    preferred_date: datetime
    duration_minutes: int = Field(60, ge=15, le=240)
    guidance_mode: str = Field("ONLINE")  # ONLINE or OFFLINE
    offline_location: Optional[str] = None
    fee_type: str = Field("FREE")  # FREE or PAID
    honorarium_amount_inr: float = Field(0.0, ge=0.0)
    description: Optional[str] = None
    learning_objectives: List[str] = Field(default_factory=list)

class DoctorGuidanceRequestUpdateStatus(BaseModel):
    status: str = Field(..., description="ACCEPTED, REJECTED, or SESSION_CREATED")
    rejection_reason: Optional[str] = None

class DoctorGuidanceRequestOut(BaseModel):
    id: uuid.UUID
    institution_id: uuid.UUID
    doctor_id: uuid.UUID
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    session_type: str
    topic: str
    subject: str
    student_group: str
    expected_students_count: int
    preferred_date: datetime
    duration_minutes: int
    guidance_mode: str
    offline_location: Optional[str]
    fee_type: str
    honorarium_amount_inr: float
    is_fee_paid: bool
    description: Optional[str]
    learning_objectives: List[str]
    status: str
    rejection_reason: Optional[str]
    created_session_id: Optional[uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# 3. TIMETABLE PREFERENCE SCHEMAS
# ============================================================

class StudentTimetablePreferenceCreate(BaseModel):
    college_start_time: str = Field("09:00", max_length=10)
    college_end_time: str = Field("16:00", max_length=10)
    has_internship: bool = False
    internship_start_time: Optional[str] = "08:30"
    internship_end_time: Optional[str] = "14:00"
    preferred_study_hours_daily: int = Field(3, ge=1, le=8)
    preferred_wake_time: str = Field("06:00", max_length=10)
    preferred_bed_time: str = Field("22:30", max_length=10)
    fitness_routine_preference: str = Field("Pranayama & Surya Namaskar", max_length=100)
    weak_topics_selected: List[str] = Field(default_factory=list)
    upcoming_exam_date: Optional[datetime] = None

class StudentTimetablePreferenceOut(BaseModel):
    id: uuid.UUID
    college_start_time: str
    college_end_time: str
    has_internship: bool
    internship_start_time: Optional[str]
    internship_end_time: Optional[str]
    preferred_study_hours_daily: int
    preferred_wake_time: str
    preferred_bed_time: str
    fitness_routine_preference: str
    weak_topics_selected: List[str]
    upcoming_exam_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# 4. REMEDIATION SCHEMAS
# ============================================================

class RemediationCompletionRequest(BaseModel):
    topic_id: str
    topic_title: str
    subject_name: str
    pre_score: float = Field(..., ge=0.0, le=100.0)
    post_quiz_score: float = Field(..., ge=0.0, le=100.0)
    voice_reader_used: bool = True
    case_study_completed: bool = True

class RemediationCompletionResponse(BaseModel):
    success: bool
    topic_id: str
    updated_skill_name: str
    new_proficiency_level: str
    new_skill_score: float
    previous_score: float
    score_delta: float
    exam_readiness_pct: float
    career_match_pct: float
    message: str

# ============================================================
# 5. PIPELINE STATUS SCHEMA
# ============================================================

class PipelineStageStatus(BaseModel):
    stage_number: int
    stage_name: str
    status: str  # "COMPLETED", "IN_PROGRESS", "RECOMMENDED"
    metrics_summary: str
    deep_link_url: str

class EcosystemPipelineStatusOut(BaseModel):
    overall_progress_pct: float
    exam_readiness_pct: float
    career_readiness_pct: float
    target_career_name: Optional[str]
    weak_topics_count: int
    active_weak_topics: List[Dict[str, Any]]
    pipeline_stages: List[PipelineStageStatus]
