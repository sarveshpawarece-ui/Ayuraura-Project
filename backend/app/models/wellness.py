import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 45 — AYURVEDA HEALTH & WELLNESS (EDUCATIONAL) MODELS
# ============================================================

class WellnessResource(Base):
    __tablename__ = "wellness_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(50), default="DINACHARYA", nullable=False, index=True)  # YOGA_ASANA, PRANAYAMA, DINACHARYA, RITUCHARYA, NUTRITION_AHARA, SADVRITTA_MENTAL_WELLNESS, MEDITATION
    target_focus = Column(String(100), nullable=False, index=True)  # Agni, Manas, Mobility, Ojas, Prana
    suitable_for_prakriti = Column(JSON, default=list, nullable=False)  # ["VATA", "PITTA", "KAPHA", "ALL"]
    difficulty_level = Column(String(50), default="BEGINNER", nullable=False)  # BEGINNER, INTERMEDIATE, DAILY_PRACTICE
    duration_minutes = Column(Integer, default=15, nullable=False)
    content_html = Column(Text, nullable=False)
    steps = Column(JSON, default=list, nullable=False)
    contraindications_text = Column(Text, nullable=True)
    classical_citations = Column(JSON, default=list, nullable=False)
    video_demonstration_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class StudentWellnessBookmark(Base):
    __tablename__ = "student_wellness_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    wellness_resource_id = Column(UUID(as_uuid=True), ForeignKey("wellness_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("student_id", "wellness_resource_id", name="uq_student_wellness_bookmark"),)
