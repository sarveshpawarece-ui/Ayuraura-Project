import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 37 — SCHOLARSHIP MODELS
# ============================================================

class ScholarshipListing(Base):
    __tablename__ = "scholarship_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    provider_name = Column(String(255), nullable=False)
    provider_type = Column(String(50), default="GOVERNMENT", nullable=False)  # GOVERNMENT, RESEARCH_COUNCIL, TRUST_NGO, CORPORATE_CSR, INSTITUTION
    description = Column(Text, nullable=False)
    eligibility_criteria_text = Column(Text, nullable=False)
    required_courses = Column(JSON, default=list, nullable=False)  # ["BAMS", "MD (Ayurveda)", "Ph.D."]
    min_cgpa = Column(Float, nullable=True)
    min_percentage = Column(Float, nullable=True)
    target_academic_years = Column(JSON, default=list, nullable=False)
    target_specializations = Column(JSON, nullable=True)
    amount_benefit = Column(String(255), nullable=False)
    deadline = Column(Date, nullable=False, index=True)
    application_url = Column(String(500), nullable=False)
    official_notification_url = Column(String(500), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True)  # ACTIVE, UPCOMING, EXPIRED, ARCHIVED
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class StudentScholarshipBookmark(Base):
    __tablename__ = "student_scholarship_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarship_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("student_id", "scholarship_id", name="uq_student_scholarship_bookmark"),)
