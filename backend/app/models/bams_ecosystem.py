import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    Float,
    Text,
    Enum as SQLEnum,
    ForeignKey,
    JSON,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# ENUMS
# ============================================================

class GuidanceMode(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"

class GuidanceFeeType(str, enum.Enum):
    FREE = "FREE"
    PAID = "PAID"

class GuidanceRequestStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    SESSION_CREATED = "SESSION_CREATED"
    COMPLETED = "COMPLETED"

class CaseDifficulty(str, enum.Enum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    COMPLEX = "Complex/Integrated"

# ============================================================
# 1. BAMS EDUCATIONAL CASE STUDY MODEL
# ============================================================

class BamsCaseStudy(Base):
    __tablename__ = "bams_case_studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id_code = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(255), nullable=False, index=True)
    difficulty = Column(SQLEnum(CaseDifficulty), default=CaseDifficulty.INTERMEDIATE, nullable=False)
    
    # Demographics & Presentation
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String(50), nullable=True)
    patient_prakriti = Column(String(100), nullable=True)
    presenting_complaints = Column(JSON, default=list, nullable=False)
    history_of_illness = Column(Text, nullable=False)

    # Ayurvedic Diagnostics
    clinical_findings = Column(JSON, default=dict, nullable=False)  # Nadi, Mala, Mutra, Jihwa, etc.
    ayurvedic_assessment = Column(JSON, default=dict, nullable=False)  # Hetu, Dosha, Dushya, Agni, Ama, Vyadhi
    differential_considerations = Column(JSON, default=list, nullable=False)
    learning_objectives = Column(JSON, default=list, nullable=False)
    discussion_questions = Column(JSON, default=list, nullable=False)
    recommended_intervention = Column(Text, nullable=False)

    # Governance & Duplicate Prevention
    case_fingerprint_hash = Column(String(128), unique=True, nullable=False, index=True)
    author_doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True)
    verified_author_name = Column(String(255), nullable=False, default="Faculty / Verified Vaidya")
    is_published = Column(Boolean, default=True, nullable=False)
    educational_disclaimer = Column(
        Text,
        default="Educational Case Study Only. Formulated strictly for academic training under NCISM curriculum guidelines. Not intended as personal medical diagnosis."
    )
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# ============================================================
# 2. INSTITUTION TO DOCTOR GUIDANCE REQUEST MODEL
# ============================================================

class DoctorGuidanceRequest(Base):
    __tablename__ = "doctor_guidance_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    session_type = Column(String(100), nullable=False)  # Clinical Case Review, Viva Simulation, Exam Strategy, etc.
    topic = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    student_group = Column(String(255), nullable=False)  # e.g. "Final Year BAMS Batch A", "Interns"
    expected_students_count = Column(Integer, default=30, nullable=False)

    preferred_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60, nullable=False)
    guidance_mode = Column(SQLEnum(GuidanceMode), default=GuidanceMode.ONLINE, nullable=False)
    offline_location = Column(String(500), nullable=True)

    fee_type = Column(SQLEnum(GuidanceFeeType), default=GuidanceFeeType.FREE, nullable=False)
    honorarium_amount_inr = Column(Float, default=0.0, nullable=False)
    is_fee_paid = Column(Boolean, default=False, nullable=False)

    description = Column(Text, nullable=True)
    learning_objectives = Column(JSON, default=list, nullable=False)
    status = Column(SQLEnum(GuidanceRequestStatus), default=GuidanceRequestStatus.REQUESTED, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_session_id = Column(UUID(as_uuid=True), nullable=True)  # Links to ExpertSession once approved
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("InstitutionProfile")
    doctor = relationship("DoctorProfile")

# ============================================================
# 3. STUDENT TIMETABLE PREFERENCES MODEL
# ============================================================

class StudentTimetablePreference(Base):
    __tablename__ = "student_timetable_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    college_start_time = Column(String(10), default="09:00", nullable=False)
    college_end_time = Column(String(10), default="16:00", nullable=False)
    has_internship = Column(Boolean, default=False, nullable=False)
    internship_start_time = Column(String(10), default="08:30", nullable=True)
    internship_end_time = Column(String(10), default="14:00", nullable=True)
    preferred_study_hours_daily = Column(Integer, default=3, nullable=False)
    preferred_wake_time = Column(String(10), default="06:00", nullable=False)
    preferred_bed_time = Column(String(10), default="22:30", nullable=False)
    fitness_routine_preference = Column(String(100), default="Pranayama & Surya Namaskar", nullable=False)
    weak_topics_selected = Column(JSON, default=list, nullable=False)
    upcoming_exam_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")

# ============================================================
# 4. STUDENT REMEDIATION HISTORY & SCORE TRACKER
# ============================================================

class StudentRemediationLog(Base):
    __tablename__ = "student_remediation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(100), nullable=False, index=True)
    topic_title = Column(String(255), nullable=False)
    subject_name = Column(String(100), nullable=False)
    pre_remediation_score = Column(Float, nullable=False)
    post_quiz_score = Column(Float, nullable=False)
    score_improvement_delta = Column(Float, nullable=False)
    voice_reader_used = Column(Boolean, default=True, nullable=False)
    case_study_completed = Column(Boolean, default=True, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")


# ============================================================
# 5. STUDENT BAMS LEARNING PROGRESS & PERSONALIZATION
# ============================================================

class StudentBamsProgress(Base):
    __tablename__ = "student_bams_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    current_prof_year = Column(String(50), default="4th Prof", nullable=False)
    completed_topics = Column(JSON, default=list, nullable=False)  # ["top-panch-1", "top-panch-2"]
    bookmarked_topics = Column(JSON, default=list, nullable=False) # ["top-panch-3"]
    recently_viewed_topics = Column(JSON, default=list, nullable=False) # [{topic_id, title, subject_id, viewed_at}]
    clinical_logbook_entries = Column(JSON, default=list, nullable=False) # [{id, date, posting, department, procedure_observed, reflection, supervisor_name}]
    learning_goals = Column(JSON, default=dict, nullable=True) # {target_minutes_daily, target_topics_daily, reminders_enabled, reminder_time}
    dismissed_recommendation_ids = Column(JSON, default=list, nullable=True) # ["rec-id-1", ...]
    completed_recommendation_ids = Column(JSON, default=list, nullable=True) # ["rec-id-2", ...]
    flashcard_mastery = Column(JSON, default=dict, nullable=True) # {card_id: "EASY" | "MEDIUM" | "HARD"}
    checklist_completed_ids = Column(JSON, default=list, nullable=True) # ["chk-1", "chk-2"]
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")
