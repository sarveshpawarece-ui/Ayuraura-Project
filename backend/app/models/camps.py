import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.user import UserRole

# ============================================================
# PHASE 26–30 — HEALTHCARE CAMPS & COORDINATION MODELS
# ============================================================

class HealthcareCamp(Base):
    __tablename__ = "healthcare_camps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organizer_name = Column(String(255), nullable=False)
    organizer_type = Column(String(50), default="NGO", nullable=False)  # NGO, DOCTOR, CLINIC, INSTITUTION

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    camp_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)

    venue_name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    pincode = Column(String(20), nullable=False)

    capacity = Column(Integer, default=200, nullable=False)
    registered_attendees_count = Column(Integer, default=0, nullable=False)

    services_offered = Column(JSON, default=list, nullable=False)  # List of approved services
    doctors_attending = Column(JSON, default=list, nullable=False)

    contact_phone = Column(String(50), nullable=False)
    contact_email = Column(String(255), nullable=False)

    status = Column(String(50), default="UPCOMING", nullable=False, index=True)  # UPCOMING, ONGOING, COMPLETED, CANCELLED
    cancellation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    attendees = relationship("CampAttendeeRegistration", back_populates="camp", cascade="all, delete-orphan")
    volunteer_applications = relationship("CampVolunteerApplication", back_populates="camp", cascade="all, delete-orphan")
    schedule_items = relationship("CampScheduleItem", back_populates="camp", cascade="all, delete-orphan")
    attendance_records = relationship("CampAttendanceRecord", back_populates="camp", cascade="all, delete-orphan")
    tasks = relationship("CampCoordinationTask", back_populates="camp", cascade="all, delete-orphan")
    broadcasts = relationship("CampBroadcastMessage", back_populates="camp", cascade="all, delete-orphan")
    final_report = relationship("FinalCampReport", back_populates="camp", uselist=False, cascade="all, delete-orphan")


class CampAttendeeRegistration(Base):
    __tablename__ = "camp_attendee_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    attendee_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    preferred_service = Column(String(100), nullable=True)
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    camp = relationship("HealthcareCamp", back_populates="attendees")


class CampVolunteerApplication(Base):
    __tablename__ = "camp_volunteer_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_role = Column(SQLEnum(UserRole), nullable=False)
    applicant_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    specialization_or_course = Column(String(255), nullable=True)
    role_applied_for = Column(String(100), nullable=False)  # e.g. Consulting Physician, Patient Triage Assistant, Herbal Dispensary
    motivation_note = Column(Text, nullable=True)
    assigned_duty = Column(String(255), nullable=True)
    status = Column(String(50), default="APPLIED", nullable=False)  # APPLIED, SELECTED, REJECTED, WITHDRAWN
    rejection_reason = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("camp_id", "user_id", name="uq_camp_user_volunteer"),)
    camp = relationship("HealthcareCamp", back_populates="volunteer_applications")


class CampScheduleItem(Base):
    __tablename__ = "camp_schedule_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_title = Column(String(255), nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    lead_person = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    camp = relationship("HealthcareCamp", back_populates="schedule_items")


class CampAttendanceRecord(Base):
    __tablename__ = "camp_attendance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    volunteer_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    verified_hours = Column(Float, default=0.0, nullable=False)
    attendance_status = Column(String(50), default="PRESENT", nullable=False)  # PRESENT, ABSENT, HALF_DAY
    supervisor_notes = Column(Text, nullable=True)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("camp_id", "user_id", "date", name="uq_camp_user_attendance"),)
    camp = relationship("HealthcareCamp", back_populates="attendance_records")


class CampParticipationCertificate(Base):
    __tablename__ = "camp_participation_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    certificate_token = Column(String(100), unique=True, index=True, nullable=False)
    certificate_hash = Column(String(128), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    camp_title = Column(String(255), nullable=False)
    organizer_name = Column(String(255), nullable=False)
    role_performed = Column(String(100), nullable=False)
    hours_served = Column(Float, nullable=False)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_valid = Column(Boolean, default=True, nullable=False)
    added_to_portfolio = Column(Boolean, default=False, nullable=False)


class FinalCampReport(Base):
    __tablename__ = "final_camp_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_beneficiaries_served = Column(Integer, default=0, nullable=False)
    men_count = Column(Integer, default=0, nullable=False)
    women_count = Column(Integer, default=0, nullable=False)
    children_count = Column(Integer, default=0, nullable=False)
    seniors_count = Column(Integer, default=0, nullable=False)
    services_delivered_breakdown = Column(JSON, default=dict, nullable=False)
    common_diagnoses = Column(JSON, default=list, nullable=False)
    total_doctors_participated = Column(Integer, default=0, nullable=False)
    total_volunteers_participated = Column(Integer, default=0, nullable=False)
    total_volunteer_hours_logged = Column(Float, default=0.0, nullable=False)
    executive_summary = Column(Text, nullable=False)
    challenges_faced = Column(Text, nullable=True)
    followup_recommendations = Column(Text, nullable=True)
    evidence_photo_urls = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    camp = relationship("HealthcareCamp", back_populates="final_report")


class CampVolunteerEvaluation(Base):
    __tablename__ = "camp_volunteer_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    evaluator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    punctuality_rating = Column(Integer, default=5, nullable=False)
    clinical_support_rating = Column(Integer, default=5, nullable=False)
    patient_communication_rating = Column(Integer, default=5, nullable=False)
    overall_rating = Column(Integer, default=5, nullable=False)
    commendation_notes = Column(Text, nullable=True)
    improvement_areas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CampStudentReview(Base):
    __tablename__ = "camp_student_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentorship_quality_rating = Column(Integer, default=5, nullable=False)
    organization_rating = Column(Integer, default=5, nullable=False)
    learning_experience_rating = Column(Integer, default=5, nullable=False)
    overall_rating = Column(Integer, default=5, nullable=False)
    review_text = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CampCoordinationTask(Base):
    __tablename__ = "camp_coordination_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_role = Column(String(50), default="ALL", nullable=False)  # ALL, DOCTORS, VOLUNTEERS, COORDINATORS
    priority = Column(String(20), default="MEDIUM", nullable=False)   # LOW, MEDIUM, HIGH, URGENT
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    camp = relationship("HealthcareCamp", back_populates="tasks")


class CampBroadcastMessage(Base):
    __tablename__ = "camp_broadcast_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camp_id = Column(UUID(as_uuid=True), ForeignKey("healthcare_camps.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_name = Column(String(255), nullable=False)
    sender_role = Column(SQLEnum(UserRole), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_urgent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    camp = relationship("HealthcareCamp", back_populates="broadcasts")


class AppNotification(Base):
    __tablename__ = "app_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="SYSTEM_ALERT", nullable=False, index=True)
    action_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
