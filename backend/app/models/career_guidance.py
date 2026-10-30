import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class StudentCareerGoal(Base):
    __tablename__ = "student_career_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    pathway_id = Column(String(100), nullable=False, index=True) # e.g. CLINICAL_PRACTICE, HIGHER_EDUCATION_MD
    target_date = Column(String(50), nullable=True) # e.g. "2027-06-30"
    priority = Column(String(20), default="MEDIUM", nullable=False) # HIGH, MEDIUM, LOW
    status = Column(String(30), default="NOT_STARTED", nullable=False) # NOT_STARTED, IN_PROGRESS, COMPLETED
    milestones = Column(JSON, default=list, nullable=False) # [{"id": "m1", "title": "...", "completed": False}]
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class StudentCareerBookmark(Base):
    __tablename__ = "student_career_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pathway_id = Column(String(100), nullable=False, index=True)
    pathway_title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class CareerGuidanceResource(Base):
    __tablename__ = "career_guidance_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False, index=True) # ARTICLE, INTERNSHIP_GUIDE, INTERVIEW_PREP, HIGHER_EDUCATION, DEVELOPMENT_CHECKLIST, ANNOUNCEMENT
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list, nullable=False) # ["AIPGET", "Panchakarma", "Clinical Practice"]
    target_year = Column(String(50), default="All Years", nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author_name = Column(String(255), default="AyurSetu Career Faculty", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User")
