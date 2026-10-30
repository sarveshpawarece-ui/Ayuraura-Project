import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 41 — EVENTS AND NETWORKING MODELS
# ============================================================

class PlatformEvent(Base):
    __tablename__ = "platform_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organizer_name = Column(String(255), nullable=False)
    organizer_type = Column(String(50), default="INSTITUTION", nullable=False)  # INSTITUTION, INDUSTRY, DOCTOR, NGO, ADMIN

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    event_type = Column(String(50), default="WEBINAR", nullable=False, index=True)  # GUEST_LECTURE, WEBINAR, WORKSHOP, CONFERENCE, STUDENT_SESSION, EXPERT_SESSION

    speaker_name = Column(String(255), nullable=False)
    speaker_title = Column(String(255), nullable=False)
    speaker_organization = Column(String(255), nullable=True)
    speaker_bio = Column(Text, nullable=True)

    event_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)

    is_online = Column(Boolean, default=True, nullable=False)
    location_venue = Column(String(255), nullable=True)
    meeting_url = Column(String(500), nullable=True)

    capacity = Column(Integer, default=100, nullable=False)
    registered_count = Column(Integer, default=0, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    topics_covered = Column(JSON, default=list, nullable=False)
    status = Column(String(50), default="UPCOMING", nullable=False, index=True)  # UPCOMING, LIVE, COMPLETED, CANCELLED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("platform_events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="REGISTERED", nullable=False)  # REGISTERED, ATTENDED, ABSENT, CANCELLED
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    attended_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_event_user_registration"),)

    event = relationship("PlatformEvent", back_populates="registrations")
    certificate = relationship("EventCertificate", back_populates="registration", uselist=False, cascade="all, delete-orphan")


class EventCertificate(Base):
    __tablename__ = "event_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(UUID(as_uuid=True), ForeignKey("event_registrations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("platform_events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    certificate_token = Column(String(100), unique=True, index=True, nullable=False)
    certificate_hash = Column(String(128), nullable=False)
    attendee_name = Column(String(255), nullable=False)
    event_title = Column(String(255), nullable=False)
    event_type = Column(String(50), nullable=False)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_valid = Column(Boolean, default=True, nullable=False)
    added_to_portfolio = Column(Boolean, default=False, nullable=False)

    registration = relationship("EventRegistration", back_populates="certificate")
