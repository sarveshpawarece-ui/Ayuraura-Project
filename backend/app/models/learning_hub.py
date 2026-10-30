import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 33, 34, 35 — LEARNING HUB, SHLOKAS & PRACTICE MODELS
# ============================================================

class ResourceBookmark(Base):
    __tablename__ = "resource_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "resource_id", name="uq_user_resource_bookmark"),)


class ResourceViewHistory(Base):
    __tablename__ = "resource_view_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    last_viewed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    progress_percentage = Column(Integer, default=0, nullable=False)


class ResourceRating(Base):
    __tablename__ = "resource_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "resource_id", name="uq_user_resource_rating"),)


class BookMarketplaceItem(Base):
    __tablename__ = "book_marketplace_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    isbn = Column(String(50), nullable=True)
    edition = Column(String(50), nullable=True)
    publisher = Column(String(255), nullable=True)
    page_count = Column(Integer, nullable=True)
    price_inr = Column(Float, default=0.0, nullable=False)
    is_in_stock = Column(Boolean, default=True, nullable=False)
    seller_name = Column(String(255), nullable=False)
    seller_contact = Column(String(255), nullable=False)
    seller_location = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ClassicalTreatise(Base):
    __tablename__ = "classical_treatises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False)
    period_era = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    total_sthanas = Column(Integer, default=6, nullable=False)
    total_chapters = Column(Integer, default=120, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ClassicalShloka(Base):
    __tablename__ = "classical_shlokas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    treatise_id = Column(UUID(as_uuid=True), ForeignKey("classical_treatises.id", ondelete="CASCADE"), nullable=False, index=True)
    treatise_name = Column(String(255), nullable=False, index=True)
    sthana = Column(String(100), nullable=False, index=True)  # Sutra, Nidana, Chikitsa, Sharira
    chapter_number = Column(Integer, nullable=False)
    chapter_name = Column(String(255), nullable=False)
    verse_number = Column(String(50), nullable=False)
    sanskrit_devanagari = Column(Text, nullable=False)
    iast_transliteration = Column(Text, nullable=False)
    english_meaning = Column(Text, nullable=False)
    clinical_significance = Column(Text, nullable=True)
    subject = Column(String(100), nullable=False, index=True)  # Dosha-Dhatu-Mala, Dravyaguna, Dinacharya, Panchakarma
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SubjectStudyModule(Base):
    __tablename__ = "subject_study_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_name = Column(String(100), nullable=False, index=True)  # Dravyaguna, Rasashastra, Panchakarma, Roganidana
    topic_title = Column(String(255), nullable=False, index=True)
    curriculum_year = Column(String(50), default="BAMS 2nd Year", nullable=False)
    summary_content = Column(Text, nullable=False)
    key_concepts = Column(JSON, default=list, nullable=False)
    shloka_references = Column(JSON, default=list, nullable=False)
    exam_high_yield_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class StudentStudyNote(Base):
    __tablename__ = "student_study_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    subject = Column(String(100), default="General", nullable=False, index=True)
    folder_name = Column(String(100), default="General", nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    color_code = Column(String(50), default="emerald", nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_bookmarked = Column(Boolean, default=False, nullable=False)
    linked_shloka_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(50), default="ALL", nullable=False)
    total_questions = Column(Integer, default=5, nullable=False)
    correct_count = Column(Integer, default=0, nullable=False)
    score_pct = Column(Float, default=0.0, nullable=False)
    time_spent_seconds = Column(Integer, default=0, nullable=False)
    answers_data = Column(JSON, default=list, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
