import enum
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Date,
    Integer,
    Float,
    Text,
    Enum as SQLEnum,
    ForeignKey,
    JSON,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# ENUMS FOR UNIFIED AI ECOSYSTEM
# ============================================================

class AIChatRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class NoteTransformType(str, enum.Enum):
    SIMPLIFY = "SIMPLIFY"
    BEGINNER_FRIENDLY = "BEGINNER_FRIENDLY"
    CONCISE_REVISION = "CONCISE_REVISION"
    EXAM_READY_ANSWER = "EXAM_READY_ANSWER"
    GRAMMAR_CLARITY = "GRAMMAR_CLARITY"
    BULLET_POINTS = "BULLET_POINTS"
    COMPARISON_TABLE = "COMPARISON_TABLE"
    HIGHLIGHT_CONCEPTS = "HIGHLIGHT_CONCEPTS"
    MISSING_SECTIONS = "MISSING_SECTIONS"
    FLASHCARDS = "FLASHCARDS"
    QUIZ_QUESTIONS = "QUIZ_QUESTIONS"
    REVISION_CHECKLIST = "REVISION_CHECKLIST"

class AIQuestionFormat(str, enum.Enum):
    MCQ = "MCQ"
    SHORT_ANSWER = "SHORT_ANSWER"
    LONG_ANSWER = "LONG_ANSWER"
    VIVA = "VIVA"
    FLASHCARD = "FLASHCARD"
    PRACTICE_TEST = "PRACTICE_TEST"

class FacultyToolType(str, enum.Enum):
    LESSON_OUTLINE = "LESSON_OUTLINE"
    EXAM_QUESTION_PAPER = "EXAM_QUESTION_PAPER"
    MATERIAL_SUMMARY = "MATERIAL_SUMMARY"
    REVISION_ACTIVITY = "REVISION_ACTIVITY"
    STUDY_RESOURCE = "STUDY_RESOURCE"
    PRACTICE_QUESTIONS = "PRACTICE_QUESTIONS"
    CONTENT_IMPROVEMENT = "CONTENT_IMPROVEMENT"
    LEARNING_OBJECTIVES = "LEARNING_OBJECTIVES"
    CASE_SCENARIO = "CASE_SCENARIO"


# ============================================================
# 1. UNIFIED CHAT SESSIONS & MESSAGES (FOR ALL ROLES)
# ============================================================

class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Consultation")
    user_role = Column(String(50), nullable=False, default="STUDENT")
    current_subject = Column(String(100), nullable=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    messages = relationship("AIChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="AIChatMessage.created_at")
    user = relationship("User")


class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    suggested_followups = Column(JSON, default=list, nullable=False)
    classical_citations = Column(JSON, default=list, nullable=False)
    context_used = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("AIChatSession", back_populates="messages")


# ============================================================
# 2. AI NOTES ASSISTANT & VERSION HISTORY
# ============================================================

class AINote(Base):
    __tablename__ = "ai_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Note")
    content = Column(Text, nullable=False, default="")
    subject = Column(String(100), default="Maulik Siddhanta", nullable=False, index=True)
    topic = Column(String(255), default="General", nullable=False)
    chapter = Column(String(100), default="Chapter 1", nullable=False)
    folder_name = Column(String(100), default="General", nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    color_code = Column(String(50), default="emerald", nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    versions = relationship("AINoteVersion", back_populates="note", cascade="all, delete-orphan", order_by="AINoteVersion.version_number.desc()")
    user = relationship("User")


class AINoteVersion(Base):
    __tablename__ = "ai_note_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_id = Column(UUID(as_uuid=True), ForeignKey("ai_notes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(String(255), default="Manual Edit", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    note = relationship("AINote", back_populates="versions")


# ============================================================
# 3. AI QUIZ & EXAM GENERATOR
# ============================================================

class AIGeneratedQuiz(Base):
    __tablename__ = "ai_generated_quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="MEDIUM", nullable=False)  # EASY, MEDIUM, HARD, ADAPTIVE
    question_format = Column(SQLEnum(AIQuestionFormat), default=AIQuestionFormat.MCQ, nullable=False)
    question_count = Column(Integer, default=5, nullable=False)
    questions_data = Column(JSON, default=list, nullable=False)  # [{id, question, options, correct_index, explanation, why_incorrect, marks, citation}]
    source_note_id = Column(UUID(as_uuid=True), nullable=True)
    is_official_exam = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    attempts = relationship("AIQuizAttempt", back_populates="quiz", cascade="all, delete-orphan")
    user = relationship("User")


class AIQuizAttempt(Base):
    __tablename__ = "ai_quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("ai_generated_quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    answers_data = Column(JSON, default=list, nullable=False)  # [{question_id, selected_answer, is_correct, points_earned}]
    score = Column(Float, default=0.0, nullable=False)
    max_score = Column(Float, default=0.0, nullable=False)
    score_percentage = Column(Float, default=0.0, nullable=False)
    feedback_notes = Column(Text, nullable=True)
    time_taken_seconds = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    quiz = relationship("AIGeneratedQuiz", back_populates="attempts")
    user = relationship("User")


# ============================================================
# 4. AI PERSONAL STUDY PLANNER
# ============================================================

class AIStudySchedule(Base):
    __tablename__ = "ai_study_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="BAMS Mastery Plan")
    exam_name = Column(String(255), nullable=False, default="Annual University Exam")
    exam_date = Column(Date, nullable=False)
    available_hours_daily = Column(Float, default=3.5, nullable=False)
    preferred_study_time = Column(String(50), default="MORNING", nullable=False)  # MORNING, EVENING, SPLIT
    target_subjects = Column(JSON, default=list, nullable=False)
    weak_topics = Column(JSON, default=list, nullable=False)
    schedule_blocks = Column(JSON, default=list, nullable=False)  # [{day: 1, date: "2026-11-01", sessions: [{subject, topic, duration, type, completed}]}]
    progress_percentage = Column(Float, default=0.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")


# ============================================================
# 5. AI DESCRIPTIVE ANSWER FEEDBACK
# ============================================================

class AIAnswerEvaluation(Base):
    __tablename__ = "ai_answer_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    target_marks = Column(Integer, default=10, nullable=False)
    structure_score = Column(Float, default=0.0, nullable=False)
    clarity_score = Column(Float, default=0.0, nullable=False)
    terminology_score = Column(Float, default=0.0, nullable=False)
    overall_score = Column(Float, default=0.0, nullable=False)
    covered_concepts = Column(JSON, default=list, nullable=False)
    missing_concepts = Column(JSON, default=list, nullable=False)
    constructive_feedback = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    safety_disclaimer = Column(
        Text,
        default="AI answer grading is an academic preparation aid formulated under NCISM syllabus guidelines and does not represent official university examination results.",
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


# ============================================================
# 6. AI FACULTY ASSISTANT
# ============================================================

class AIFacultyLog(Base):
    __tablename__ = "ai_faculty_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tool_type = Column(SQLEnum(FacultyToolType), nullable=False)
    subject = Column(String(100), nullable=False)
    curriculum_level = Column(String(50), default="BAMS Final Year", nullable=False)
    input_topic = Column(String(255), nullable=False)
    generated_content = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    faculty_user = relationship("User")
