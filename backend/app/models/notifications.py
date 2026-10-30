import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class StudentReminder(Base):
    __tablename__ = "student_reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reminder_type = Column(String(50), default="STUDY_SESSION", nullable=False, index=True)
    subject = Column(String(100), nullable=True)
    scheduled_time = Column(String(50), nullable=False) # e.g. "2026-11-02T10:00:00Z" or "08:00 AM"
    recurrence = Column(String(50), default="ONCE", nullable=False) # ONCE, DAILY, WEEKLY
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    action_url = Column(String(500), nullable=True)
    ai_generated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class AcademicAnnouncement(Base):
    __tablename__ = "academic_announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), default="FACULTY", nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="ACADEMIC", nullable=False, index=True) # ACADEMIC, EXAM, TIMETABLE, RESOURCE, FACULTY, CAREER
    target_audience = Column(String(50), default="ALL_STUDENTS", nullable=False, index=True) # ALL_STUDENTS, 1ST_PROF, 2ND_PROF, 3RD_PROF, 4TH_PROF, INTERNS
    is_urgent = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(500), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    author = relationship("User")
