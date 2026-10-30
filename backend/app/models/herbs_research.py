import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 47 — HERBS, RESEARCH & STUDENT PROJECTS MODELS
# ============================================================

class MedicinalPlant(Base):
    __tablename__ = "medicinal_plants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    common_name = Column(String(255), nullable=False, index=True)
    sanskrit_name = Column(String(255), nullable=False, index=True)
    sanskrit_devanagari = Column(String(255), nullable=False)
    botanical_name = Column(String(255), nullable=False, index=True)
    family = Column(String(255), nullable=False, index=True)
    synonyms = Column(JSON, default=list, nullable=False)
    rasa = Column(JSON, default=list, nullable=False)  # ["Tikta", "Kashaya", "Madhura"]
    guna = Column(JSON, default=list, nullable=False)  # ["Laghu", "Snigdha"]
    virya = Column(String(50), default="USHNA", nullable=False)  # USHNA, SHEETA
    vipaka = Column(String(50), default="MADHURA", nullable=False)  # MADHURA, KATU, AMLA
    prabhava = Column(String(255), nullable=True)
    doshakarma = Column(String(255), nullable=False)  # Vata-Kapha Shamaka, Tridoshahara
    parts_used = Column(JSON, default=list, nullable=False)  # ["Root", "Leaves"]
    classical_formulations = Column(JSON, default=list, nullable=False)
    phytochemical_markers = Column(JSON, default=list, nullable=False)
    classical_citations = Column(JSON, default=list, nullable=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AyushResearchPaper(Base):
    __tablename__ = "ayush_research_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    authors = Column(JSON, default=list, nullable=False)
    journal_name = Column(String(255), nullable=False)
    publication_year = Column(Integer, nullable=False, index=True)
    volume_issue = Column(String(100), nullable=True)
    doi_url = Column(String(500), nullable=True)
    abstract = Column(Text, nullable=False)
    study_type = Column(String(50), default="CLINICAL_RCT", nullable=False, index=True)  # CLINICAL_RCT, IN_VITRO, ANIMAL_STUDY, PHYTOCHEMISTRY_QC, REVIEW
    linked_herb_names = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class StudentProjectShowcase(Base):
    __tablename__ = "student_project_showcases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    abstract = Column(Text, nullable=False)
    project_category = Column(String(50), default="FORMULATION_DEVELOPMENT", nullable=False)  # FORMULATION_DEVELOPMENT, BOTANICAL_SURVEY, CLINICAL_CASE_STUDY
    skills_demonstrated = Column(JSON, default=list, nullable=False)
    media_urls = Column(JSON, default=list, nullable=False)
    document_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by_faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    moderation_status = Column(String(50), default="PUBLISHED", nullable=False)  # PUBLISHED, PENDING_MODERATION, FLAGGED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
