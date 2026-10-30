import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 36 — TESTS, COURSES & CERTIFICATES MODELS
# ============================================================

class ExamMockTest(Base):
    __tablename__ = "exam_mock_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    test_type = Column(String(50), default="MOCK_EXAM", nullable=False)  # MOCK_EXAM, APTITUDE_PLACEMENT, DOMAIN_DIAGNOSTIC
    duration_minutes = Column(Integer, default=60, nullable=False)
    total_questions = Column(Integer, default=50, nullable=False)
    total_marks = Column(Float, default=200.0, nullable=False)
    negative_marking_rate = Column(Float, default=0.25, nullable=False)
    sections_config = Column(JSON, default=list, nullable=False)
    questions_data = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ExamMockAttempt(Base):
    __tablename__ = "exam_mock_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("exam_mock_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="IN_PROGRESS", nullable=False)  # IN_PROGRESS, SUBMITTED, EVALUATED, TIMED_OUT
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    time_taken_seconds = Column(Integer, default=0, nullable=False)
    total_score = Column(Float, default=0.0, nullable=False)
    score_percentage = Column(Float, default=0.0, nullable=False)
    percentile_rank = Column(Float, default=50.0, nullable=False)
    section_scores = Column(JSON, default=dict, nullable=False)
    answers_data = Column(JSON, default=list, nullable=False)


class CertificateCourse(Base):
    __tablename__ = "certificate_courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    instructor_name = Column(String(255), nullable=False)
    instructor_title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)  # Pharmacology QC, Panchakarma Masterclass, Regulatory
    difficulty = Column(String(50), default="INTERMEDIATE", nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED
    estimated_hours = Column(Float, default=20.0, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    skills_taught = Column(JSON, default=list, nullable=False)
    passing_score_pct = Column(Float, default=70.0, nullable=False)
    modules = Column(JSON, default=list, nullable=False)  # List of modules
    exit_assessment_questions = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("certificate_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="ENROLLED", nullable=False)  # ENROLLED, IN_PROGRESS, COMPLETED
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    progress_percentage = Column(Integer, default=0, nullable=False)
    completed_module_ids = Column(JSON, default=list, nullable=False)
    exit_quiz_score_pct = Column(Float, nullable=True)

    course = relationship("CertificateCourse", back_populates="enrollments")
    certificate = relationship("CourseCertificate", back_populates="enrollment", uselist=False, cascade="all, delete-orphan")


class CourseCertificate(Base):
    __tablename__ = "course_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("course_enrollments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("certificate_courses.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    certificate_token = Column(String(100), unique=True, index=True, nullable=False)
    certificate_hash = Column(String(128), nullable=False)
    student_name = Column(String(255), nullable=False)
    course_title = Column(String(255), nullable=False)
    score_achieved = Column(Float, nullable=False)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_valid = Column(Boolean, default=True, nullable=False)

    enrollment = relationship("CourseEnrollment", back_populates="certificate")
