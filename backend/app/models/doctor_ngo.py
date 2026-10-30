import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.domain import VerificationStatus

# ============================================================
# PHASE 21, 22, 25 — DOCTOR, CLINIC & NGO MODELS
# ============================================================

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    name_prefix = Column(String(50), nullable=True, default="Dr.")
    first_name = Column(String(150), nullable=True)
    middle_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    full_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False, index=True)  # NCISM / State Board
    state_medical_council = Column(String(255), nullable=False)
    qualification = Column(String(255), nullable=False)  # BAMS, MD (Ayu), MS (Ayu), Ph.D
    specialization = Column(String(255), nullable=False)  # Panchakarma, Kayachikitsa, Dravyaguna, Shalya
    years_of_experience = Column(Integer, default=0, nullable=False)
    designation = Column(String(255), nullable=True)  # Consultant, Ayurvedic Physician, Professor
    areas_of_expertise = Column(JSON, default=list, nullable=False)  # list of tags
    bio = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    country = Column(String(100), default="India", nullable=False)
    pincode = Column(String(20), nullable=True)
    clinic_address = Column(String(500), nullable=True)

    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False, index=True)
    verification_remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id], back_populates="doctor_profile")
    documents = relationship("DoctorVerificationDocument", back_populates="doctor", cascade="all, delete-orphan")
    clinics = relationship("ClinicHospitalProfile", back_populates="owner_doctor", cascade="all, delete-orphan")
    internships = relationship("InternshipPosting", foreign_keys="[InternshipPosting.doctor_id]", back_populates="doctor_profile", cascade="all, delete-orphan")


class DoctorVerificationDocument(Base):
    __tablename__ = "doctor_verification_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(100), nullable=False)  # MEDICAL_REGISTRATION_CERTIFICATE, DEGREE_CERTIFICATE, IDENTITY_PROOF, CLINIC_HOSPITAL_PROOF, OTHER
    document_name = Column(String(255), nullable=False)
    file_url = Column(String(1000), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)
    
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime(timezone=True), nullable=True)

    doctor = relationship("DoctorProfile", back_populates="documents")


class ClinicHospitalProfile(Base):
    __tablename__ = "clinic_hospital_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    organization_type = Column(String(50), default="CLINIC", nullable=False)  # CLINIC, HOSPITAL, WELLNESS_CENTER, AYURVEDIC_PANCHAKARMA_CENTRE
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    country = Column(String(100), default="India", nullable=False)
    pincode = Column(String(20), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=True)
    services_offered = Column(JSON, default=list, nullable=False)
    facilities = Column(JSON, default=list, nullable=False)
    working_hours = Column(String(255), default="Mon-Sat: 09:00 AM - 07:00 PM", nullable=True)
    bed_capacity = Column(Integer, default=0, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner_doctor = relationship("DoctorProfile", back_populates="clinics")


class DoctorMessage(Base):
    __tablename__ = "doctor_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class DoctorStudentSession(Base):
    __tablename__ = "doctor_student_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Clinical Mentorship Session", nullable=False)
    purpose = Column(String(255), nullable=False)  # Mentorship, Internship Discussion, Career Guidance, Clinical Guidance, Feedback, Other
    session_type = Column(String(100), default="Clinical Guidance", nullable=False)
    meeting_mode = Column(String(20), default="Online", nullable=False)  # Online, Offline
    meeting_link = Column(String(500), nullable=True)
    location = Column(String(500), nullable=True)
    scheduled_date = Column(Date, nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=True)
    duration_minutes = Column(Integer, default=30, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False, index=True)  # SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    cancellation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class NGOProfile(Base):
    __tablename__ = "ngo_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    darpan_id = Column(String(100), unique=True, nullable=True, index=True)  # NITI Aayog Darpan ID
    registration_number = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    service_areas = Column(JSON, default=list, nullable=False)  # Free Health Camps, Herb Conservation, Tribal Health
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    website_url = Column(String(500), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    address = Column(String(500), nullable=False)
    pincode = Column(String(20), nullable=False)

    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
