import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 3, 4, 5 — INTERNSHIP ECOSYSTEM, ATTENDANCE & PROGRESS
# ============================================================

class InternshipPosting(Base):
    __tablename__ = "internship_postings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey("clinic_hospital_profiles.id", ondelete="SET NULL"), nullable=True, index=True)

    organization_name = Column(String(255), nullable=False)
    organization_type = Column(String(50), default="CLINIC", nullable=False)  # CLINIC, HOSPITAL, AYURVEDIC_COMPANY, RESEARCH

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    department = Column(String(100), default="General Ayurveda", nullable=False)  # Panchakarma, Kayachikitsa, Dravyaguna
    specialization = Column(String(100), default="General Ayurveda", nullable=False)
    internship_type = Column(String(100), default="Clinical Internship", nullable=False)  # Clinical Internship, Research Internship, Hospital Internship, Ayurveda Practice, Panchakarma, Pharmacy, Wellness, Teaching, Healthcare Camp, Other
    
    duration_months = Column(Integer, default=6, nullable=False)
    duration_text = Column(String(100), nullable=True)  # e.g. "6 Months"
    mode = Column(String(50), default="ON_SITE", nullable=False)  # ON_SITE, HYBRID, REMOTE
    location_city = Column(String(100), nullable=False, index=True)
    location_state = Column(String(100), nullable=False, index=True)
    location_address = Column(String(255), nullable=True)
    
    stipend_inr_month = Column(Float, default=0.0, nullable=False)
    capacity = Column(Integer, default=5, nullable=False)
    number_of_seats = Column(Integer, default=5, nullable=False)
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=False)
    
    # Eligibility & Requirements
    eligible_courses = Column(JSON, default=list, nullable=False)  # e.g. ["BAMS", "MD Ayurveda"]
    eligible_years = Column(JSON, default=list, nullable=False)    # e.g. ["Final Year", "Intern"]
    minimum_qualification = Column(String(100), nullable=True)
    experience_required = Column(String(100), nullable=True)
    requirements = Column(Text, nullable=False)
    skills_required = Column(JSON, default=list, nullable=False)
    
    # Content & Scope
    responsibilities = Column(Text, nullable=True)
    learning_outcomes = Column(Text, nullable=True)
    benefits = Column(JSON, default=list, nullable=False)
    working_hours = Column(String(100), default="09:00 AM - 05:00 PM (Mon-Sat)", nullable=True)
    
    status = Column(String(50), default="PUBLISHED", nullable=False, index=True)  # DRAFT, PUBLISHED, OPEN, CLOSED, EXPIRED, CANCELLED, COMPLETED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    doctor_profile = relationship("DoctorProfile", foreign_keys=[doctor_id], back_populates="internships")
    clinic = relationship("ClinicHospitalProfile", foreign_keys=[clinic_id])
    applications = relationship("InternshipApplication", back_populates="internship", cascade="all, delete-orphan")


class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    internship_id = Column(UUID(as_uuid=True), ForeignKey("internship_postings.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    cover_note = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(1000), nullable=True)
    portfolio_url = Column(String(1000), nullable=True)
    additional_message = Column(Text, nullable=True)

    status = Column(String(50), default="APPLIED", nullable=False, index=True)  # APPLIED, UNDER_REVIEW, SHORTLISTED, SELECTED, OFFERED, ACCEPTED, DECLINED, REJECTED, WITHDRAWN
    rejection_reason = Column(Text, nullable=True)
    match_score = Column(Float, default=0.0, nullable=False)

    applied_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    shortlisted_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("internship_id", "student_id", name="uq_internship_student_application"),)

    internship = relationship("InternshipPosting", back_populates="applications")
    student = relationship("StudentProfile", foreign_keys=[student_id])
    offer_letter = relationship("InternshipOfferLetter", back_populates="application", uselist=False, cascade="all, delete-orphan")
    attendance_logs = relationship("InternshipAttendanceLog", back_populates="application", cascade="all, delete-orphan")
    progress_milestones = relationship("InternshipProgressMilestone", back_populates="application", cascade="all, delete-orphan")
    tasks = relationship("InternshipTask", back_populates="application", cascade="all, delete-orphan")
    certificate = relationship("InternshipCompletionCertificate", back_populates="application", uselist=False, cascade="all, delete-orphan")


class InternshipOfferLetter(Base):
    __tablename__ = "internship_offer_letters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    internship_id = Column(UUID(as_uuid=True), ForeignKey("internship_postings.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey("clinic_hospital_profiles.id", ondelete="SET NULL"), nullable=True, index=True)

    student_name = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=True)
    clinic_name = Column(String(255), nullable=True)
    role_title = Column(String(255), default="Clinical Ayurveda Intern", nullable=False)
    working_hours = Column(String(100), default="09:00 AM - 05:00 PM (Mon-Sat)", nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    stipend_amount = Column(Float, default=0.0, nullable=False)
    terms_text = Column(Text, nullable=False)
    status = Column(String(50), default="ISSUED", nullable=False)  # DRAFT, ISSUED, ACCEPTED, DECLINED, EXPIRED, CANCELLED

    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    declined_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    decline_reason = Column(Text, nullable=True)

    application = relationship("InternshipApplication", back_populates="offer_letter")


class InternshipAttendanceLog(Base):
    __tablename__ = "internship_attendance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    internship_id = Column(UUID(as_uuid=True), ForeignKey("internship_postings.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True, index=True)

    date = Column(Date, nullable=False)
    check_in = Column(String(20), default="09:00 AM", nullable=True)
    check_out = Column(String(20), default="05:00 PM", nullable=True)
    status = Column(String(50), default="PRESENT", nullable=False)  # PRESENT, ABSENT, HALF_DAY, LEAVE
    is_present = Column(Boolean, default=True, nullable=False)
    hours_worked = Column(Float, default=8.0, nullable=False)
    remarks = Column(String(255), nullable=True)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    application = relationship("InternshipApplication", back_populates="attendance_logs")
    student = relationship("StudentProfile", foreign_keys=[student_id])


class InternshipProgressMilestone(Base):
    __tablename__ = "internship_progress_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    internship_id = Column(UUID(as_uuid=True), ForeignKey("internship_postings.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True, index=True)

    milestone_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="CLINICAL", nullable=False)  # CLINICAL, RESEARCH, LEARNING, GENERAL
    status = Column(String(50), default="IN_PROGRESS", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_percentage = Column(Integer, default=0, nullable=False)
    due_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    supervisor_review = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    application = relationship("InternshipApplication", back_populates="progress_milestones")
    tasks = relationship("InternshipTask", back_populates="milestone", cascade="all, delete-orphan")


class InternshipTask(Base):
    __tablename__ = "internship_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    milestone_id = Column(UUID(as_uuid=True), ForeignKey("internship_progress_milestones.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), default="CLINICAL_ACTIVITY", nullable=False)  # CLINICAL_ACTIVITY, RESEARCH_ACTIVITY, LEARNING_OBJECTIVE, PATIENT_CASE
    status = Column(String(50), default="NOT_STARTED", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED
    doctor_remarks = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    milestone = relationship("InternshipProgressMilestone", back_populates="tasks")
    application = relationship("InternshipApplication", back_populates="tasks")


class InternshipCompletionCertificate(Base):
    __tablename__ = "internship_completion_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    certificate_token = Column(String(100), unique=True, index=True, nullable=False)
    certificate_hash = Column(String(128), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    student_name = Column(String(255), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    doctor_name = Column(String(255), nullable=True)
    clinic_name = Column(String(255), nullable=True)
    internship_title = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=False)
    specialization = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    duration_text = Column(String(100), nullable=True)
    completion_date = Column(Date, nullable=False)
    total_hours_completed = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="VALID", nullable=False)  # VALID, REVOKED, EXPIRED
    is_valid = Column(Boolean, default=True, nullable=False)
    added_to_portfolio = Column(Boolean, default=False, nullable=False)
    verification_url = Column(String(500), nullable=True)
    qr_data = Column(Text, nullable=True)
    digital_signature_hash = Column(String(255), nullable=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    application = relationship("InternshipApplication", back_populates="certificate")


class InternshipSupervisorFeedback(Base):
    __tablename__ = "internship_supervisor_feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), nullable=True, index=True)

    # 8 Category Ratings (1-5)
    clinical_skills_rating = Column(Integer, default=5, nullable=False)
    communication_rating = Column(Integer, default=5, nullable=False)
    professionalism_rating = Column(Integer, default=5, nullable=False)
    punctuality_rating = Column(Integer, default=5, nullable=False)
    technical_knowledge_rating = Column(Integer, default=5, nullable=False)
    teamwork_rating = Column(Integer, default=5, nullable=False)
    learning_ability_rating = Column(Integer, default=5, nullable=False)
    overall_rating = Column(Integer, default=5, nullable=False)

    # Written Evaluations
    written_feedback = Column(Text, nullable=True)
    strengths_notes = Column(Text, nullable=True)
    areas_for_growth = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class InternshipStudentFeedback(Base):
    __tablename__ = "internship_student_feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("internship_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), nullable=True, index=True)

    # Experience Ratings (1-5)
    overall_rating = Column(Integer, default=5, nullable=False)
    learning_experience_rating = Column(Integer, default=5, nullable=False)
    doctor_mentorship_rating = Column(Integer, default=5, nullable=False)
    mentorship_quality_rating = Column(Integer, default=5, nullable=False)
    work_environment_rating = Column(Integer, default=5, nullable=False)
    clinical_exposure_rating = Column(Integer, default=5, nullable=False)
    organization_rating = Column(Integer, default=5, nullable=False)
    facilities_rating = Column(Integer, default=5, nullable=False)

    # Written Comments
    overall_experience_comments = Column(Text, nullable=True)
    review_comments = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
