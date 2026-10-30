import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 17, 18, 19, 20 — AI CAREER, RESUME & INTERVIEWS
# ============================================================

class AIAssistantChat(Base):
    __tablename__ = "ai_assistant_chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant
    message = Column(Text, nullable=False)
    context_data = Column(JSON, nullable=True)  # Snapshot of skills/target career used
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_career_title = Column(String(255), nullable=False)
    current_readiness_score = Column(Float, default=0.0, nullable=False)  # 0-100
    stages = Column(JSON, default=list, nullable=False)  # List of roadmap stages with milestones
    skill_milestones = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(Date, nullable=False)
    priority = Column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, URGENT
    progress_percentage = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    milestones = relationship("CareerGoalMilestone", back_populates="goal", cascade="all, delete-orphan")


class CareerGoalMilestone(Base):
    __tablename__ = "career_goal_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("career_goals.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    goal = relationship("CareerGoal", back_populates="milestones")


class StudentResume(Base):
    __tablename__ = "student_resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="My Professional Resume", nullable=False)
    template_name = Column(String(50), default="CLASSICAL_AYURVEDIC", nullable=False)  # CLASSICAL_AYURVEDIC, MODERN_CLINICAL, RESEARCH_ACADEMIC, EXECUTIVE_AYUSH
    resume_data = Column(JSON, nullable=False)  # Complete structured resume JSON
    ats_score = Column(Float, default=0.0, nullable=False)
    matched_keywords = Column(JSON, default=list, nullable=False)
    missing_keywords = Column(JSON, default=list, nullable=False)
    formatting_warnings = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_title = Column(String(255), nullable=False)
    category = Column(String(50), default="AYURVEDA_DOMAIN", nullable=False)  # TECHNICAL, HR, BEHAVIORAL, AYURVEDA_DOMAIN, GENERAL
    status = Column(String(50), default="IN_PROGRESS", nullable=False)  # IN_PROGRESS, COMPLETED
    current_question_index = Column(Integer, default=0, nullable=False)
    questions_and_answers = Column(JSON, default=list, nullable=False)  # [{question, answer, evaluation, score}]
    final_report = Column(JSON, nullable=True)  # {communication_score, technical_score, confidence_score, areas_for_growth}
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
