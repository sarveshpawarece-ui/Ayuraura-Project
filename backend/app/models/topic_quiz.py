import enum
import uuid
from datetime import datetime, timezone
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
# ENUMS FOR TOPIC QUIZ
# ============================================================

class QuizDifficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    MIXED = "MIXED"
    ADAPTIVE = "ADAPTIVE"

class QuizQuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"
    MULTI_SELECT = "MULTI_SELECT"
    MATCH_FOLLOWING = "MATCH_FOLLOWING"
    ASSERTION_REASON = "ASSERTION_REASON"

class QuizAttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


# ============================================================
# 1. SUBJECT HIERARCHY
# ============================================================

class TopicQuizSubject(Base):
    __tablename__ = "topic_quiz_subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    icon = Column(String(50), default="BookOpen", nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    topics = relationship("TopicQuizTopic", back_populates="subject", cascade="all, delete-orphan", order_by="TopicQuizTopic.display_order")
    questions = relationship("TopicQuizQuestion", back_populates="subject", cascade="all, delete-orphan")


# ============================================================
# 2. TOPIC HIERARCHY
# ============================================================

class TopicQuizTopic(Base):
    __tablename__ = "topic_quiz_topics"
    __table_args__ = (UniqueConstraint("subject_id", "name", name="uq_subject_topic_name"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("topic_quiz_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    subject = relationship("TopicQuizSubject", back_populates="topics")
    subtopics = relationship("TopicQuizSubtopic", back_populates="topic", cascade="all, delete-orphan", order_by="TopicQuizSubtopic.display_order")
    questions = relationship("TopicQuizQuestion", back_populates="topic", cascade="all, delete-orphan")


# ============================================================
# 3. SUBTOPIC HIERARCHY
# ============================================================

class TopicQuizSubtopic(Base):
    __tablename__ = "topic_quiz_subtopics"
    __table_args__ = (UniqueConstraint("topic_id", "name", name="uq_topic_subtopic_name"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topic_quiz_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    topic = relationship("TopicQuizTopic", back_populates="subtopics")
    questions = relationship("TopicQuizQuestion", back_populates="subtopic")


# ============================================================
# 4. TOPIC QUIZ QUESTIONS
# ============================================================

class TopicQuizQuestion(Base):
    __tablename__ = "topic_quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("topic_quiz_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topic_quiz_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("topic_quiz_subtopics.id", ondelete="SET NULL"), nullable=True, index=True)

    # Denormalized strings for ultra-fast query filtering
    subject_name = Column(String(255), nullable=False, index=True)
    topic_name = Column(String(255), nullable=False, index=True)
    subtopic_name = Column(String(255), nullable=True, index=True)

    difficulty = Column(SQLEnum(QuizDifficulty), default=QuizDifficulty.MEDIUM, nullable=False, index=True)
    question_type = Column(SQLEnum(QuizQuestionType), default=QuizQuestionType.MCQ, nullable=False)
    question_text = Column(Text, nullable=False)
    
    # Options format: [{"id": "A", "text": "...", "is_correct": true}, {"id": "B", "text": "...", "is_correct": false}, ...]
    options = Column(JSON, nullable=False)
    correct_answer = Column(String(255), nullable=False)  # e.g. "A" or "True" or multiple JSON array
    explanation = Column(Text, nullable=False)  # Pedagogical explanation of why the answer is correct
    clinical_pearl = Column(Text, nullable=True)  # Shloka reference / clinical application note
    tags = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    subject = relationship("TopicQuizSubject", back_populates="questions")
    topic = relationship("TopicQuizTopic", back_populates="questions")
    subtopic = relationship("TopicQuizSubtopic", back_populates="questions")


# ============================================================
# 5. STUDENT TOPIC PERFORMANCE & WEAK AREA TRACKER
# ============================================================

class StudentTopicPerformance(Base):
    __tablename__ = "student_topic_performances"
    __table_args__ = (UniqueConstraint("student_user_id", "subject_name", "topic_name", name="uq_student_subject_topic"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(UUID(as_uuid=True), nullable=True)
    subject_name = Column(String(255), nullable=False, index=True)
    topic_id = Column(UUID(as_uuid=True), nullable=True)
    topic_name = Column(String(255), nullable=False, index=True)

    total_questions_answered = Column(Integer, default=0, nullable=False)
    total_correct = Column(Integer, default=0, nullable=False)
    mastery_percentage = Column(Float, default=0.0, nullable=False)
    is_weak_area = Column(Boolean, default=False, nullable=False, index=True)
    quizzes_taken_count = Column(Integer, default=0, nullable=False)
    last_practiced_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


# ============================================================
# 6. TOPIC QUIZ ATTEMPT & RESULTS
# ============================================================

class TopicQuizAttempt(Base):
    __tablename__ = "topic_quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    subject_name = Column(String(255), nullable=False)
    topic_name = Column(String(255), nullable=False)
    subtopic_name = Column(String(255), nullable=True)
    difficulty_mode = Column(String(50), default="MEDIUM", nullable=False)

    total_questions = Column(Integer, default=10, nullable=False)
    correct_count = Column(Integer, default=0, nullable=False)
    incorrect_count = Column(Integer, default=0, nullable=False)
    score_percentage = Column(Float, default=0.0, nullable=False)
    time_taken_seconds = Column(Integer, default=0, nullable=False)
    status = Column(SQLEnum(QuizAttemptStatus), default=QuizAttemptStatus.IN_PROGRESS, nullable=False)

    # Snapshot of questions and student answers
    questions_data = Column(JSON, default=list, nullable=False)
    answers_data = Column(JSON, default=list, nullable=False)

    # Weak areas and recommendations generated after submission
    weak_topics_detected = Column(JSON, default=list, nullable=False)
    recommended_expert_specializations = Column(JSON, default=list, nullable=False)
    recommended_learning_resources = Column(JSON, default=list, nullable=False)

    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
