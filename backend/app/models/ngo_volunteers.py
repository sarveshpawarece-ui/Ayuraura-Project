import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 50 — NGO VOLUNTEER OPPORTUNITY MODELS
# ============================================================

class NGOVolunteerOpportunity(Base):
    __tablename__ = "ngo_volunteer_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ngo_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ngo_name = Column(String(255), nullable=False)
    ngo_darpan_id = Column(String(100), nullable=True)

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    skills_required = Column(JSON, default=list, nullable=False)
    location_city = Column(String(100), nullable=False, index=True)
    location_state = Column(String(100), nullable=False, index=True)
    venue_address = Column(String(500), nullable=False)

    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False)
    estimated_hours = Column(Float, default=20.0, nullable=False)

    capacity = Column(Integer, default=15, nullable=False)
    selected_count = Column(Integer, default=0, nullable=False)
    requirements_text = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN", nullable=False, index=True)  # OPEN, FILLED, COMPLETED, CANCELLED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    applications = relationship("NGOVolunteerApplication", back_populates="opportunity", cascade="all, delete-orphan")


class NGOVolunteerApplication(Base):
    __tablename__ = "ngo_volunteer_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("ngo_volunteer_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    applicant_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    academic_year = Column(String(50), nullable=True)
    motivation_statement = Column(Text, nullable=True)
    status = Column(String(50), default="APPLIED", nullable=False, index=True)  # APPLIED, UNDER_REVIEW, SELECTED, REJECTED, COMPLETED, WITHDRAWN
    rejection_reason = Column(Text, nullable=True)
    verified_hours_completed = Column(Float, default=0.0, nullable=False)
    supervisor_remarks = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("opportunity_id", "student_id", name="uq_ngo_opp_student_application"),)

    opportunity = relationship("NGOVolunteerOpportunity", back_populates="applications")
    certificate = relationship("NGOVolunteerCertificate", back_populates="application", uselist=False, cascade="all, delete-orphan")


class NGOVolunteerCertificate(Base):
    __tablename__ = "ngo_volunteer_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("ngo_volunteer_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("ngo_volunteer_opportunities.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    certificate_token = Column(String(100), unique=True, index=True, nullable=False)
    certificate_hash = Column(String(128), nullable=False)
    student_name = Column(String(255), nullable=False)
    ngo_name = Column(String(255), nullable=False)
    opportunity_title = Column(String(255), nullable=False)
    hours_served = Column(Float, nullable=False)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_valid = Column(Boolean, default=True, nullable=False)
    added_to_portfolio = Column(Boolean, default=False, nullable=False)

    application = relationship("NGOVolunteerApplication", back_populates="certificate")
