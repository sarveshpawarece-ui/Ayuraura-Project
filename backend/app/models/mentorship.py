import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.user import UserRole

# ============================================================
# PHASE 39 — ALUMNI AND FACULTY MENTORSHIP MODELS
# ============================================================

class AlumniProfile(Base):
    __tablename__ = "alumni_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    graduation_year = Column(Integer, nullable=False, index=True)
    institution_name = Column(String(255), nullable=False)
    degree = Column(String(100), nullable=False)
    current_role_title = Column(String(255), nullable=False)
    current_organization = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    linkedin_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    domain_expertise = Column(JSON, default=list, nullable=False)  # ["Panchakarma", "Clinical Research", "ASU GMP"]
    mentorship_available = Column(Boolean, default=True, nullable=False)
    preferred_mentorship_topics = Column(JSON, default=list, nullable=False)
    is_verified_alumni = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class MentorshipEngagement(Base):
    __tablename__ = "mentorship_engagements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_role = Column(SQLEnum(UserRole), nullable=False)  # ALUMNI or FACULTY
    topic = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=45, nullable=False)
    status = Column(String(50), default="REQUESTED", nullable=False, index=True)  # REQUESTED, ACCEPTED, COMPLETED, REJECTED, CANCELLED
    rejection_reason = Column(Text, nullable=True)
    meeting_link = Column(String(500), nullable=True)
    mentor_guidance_notes = Column(Text, nullable=True)
    student_consent_share_progress = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
