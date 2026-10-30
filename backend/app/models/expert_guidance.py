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
from app.models.user import UserRole

# ============================================================
# ENUMS FOR SESSIONS & GUIDANCE
# ============================================================

class SessionType(str, enum.Enum):
    LIVE_LECTURE = "LIVE_LECTURE"
    LIVE_GUIDANCE = "LIVE_GUIDANCE"
    RECORDED_LECTURE = "RECORDED_LECTURE"
    QA_SESSION = "QA_SESSION"
    EXPERT_TALK = "EXPERT_TALK"
    WORKSHOP = "WORKSHOP"
    MENTORSHIP = "MENTORSHIP"

class SessionLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class SessionStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class SessionVisibility(str, enum.Enum):
    PUBLIC = "PUBLIC"
    FOLLOWERS_ONLY = "FOLLOWERS_ONLY"
    SELECTED_STUDENTS = "SELECTED_STUDENTS"
    INSTITUTION_STUDENTS = "INSTITUTION_STUDENTS"
    PRIVATE = "PRIVATE"

# ============================================================
# EXPERT PROFILE EXTENSION
# ============================================================

class ExpertProfile(Base):
    __tablename__ = "expert_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.DOCTOR, nullable=False)
    professional_title = Column(String(255), default="Ayurvedic Consultant & Faculty", nullable=False)
    institution_or_clinic = Column(String(255), nullable=True)
    qualifications = Column(String(255), default="BAMS, MD (Ayurveda)", nullable=False)
    specialization = Column(String(255), default="Kayachikitsa", nullable=False)  # Primary specialization
    areas_of_expertise = Column(JSON, default=list, nullable=False)  # ["Panchakarma", "Dravyaguna", "Clinical Practice"]
    subjects = Column(JSON, default=list, nullable=False)
    skills = Column(JSON, default=list, nullable=False)
    languages = Column(JSON, default=lambda: ["English", "Hindi", "Sanskrit"], nullable=False)
    years_of_experience = Column(Integer, default=5, nullable=False)
    bio = Column(Text, nullable=True)
    profile_photo_url = Column(String(500), nullable=True)

    # Verification & Badges
    is_verified = Column(Boolean, default=True, nullable=False)
    verification_badge_title = Column(String(100), default="Verified Ayurvedic Expert (NCISM)", nullable=False)

    # Dynamic Aggregates & Confidence Metrics
    average_rating = Column(Float, default=5.0, nullable=False)
    total_ratings = Column(Integer, default=0, nullable=False)
    completed_sessions_count = Column(Integer, default=0, nullable=False)
    total_sessions_count = Column(Integer, default=0, nullable=False)
    followers_count = Column(Integer, default=0, nullable=False)
    bayesian_score = Column(Float, default=4.5, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
    sessions = relationship("ExpertSession", back_populates="expert_profile", cascade="all, delete-orphan")
    followers = relationship("ExpertFollow", back_populates="expert", cascade="all, delete-orphan")


# ============================================================
# EXPERT SESSION ENTITY
# ============================================================

class ExpertSession(Base):
    __tablename__ = "expert_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_profile_id = Column(UUID(as_uuid=True), ForeignKey("expert_profiles.id", ondelete="SET NULL"), nullable=True, index=True)

    expert_name = Column(String(255), nullable=False)
    expert_role = Column(String(50), default="DOCTOR", nullable=False)
    institution = Column(String(255), nullable=True)

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    session_type = Column(SQLEnum(SessionType), default=SessionType.LIVE_LECTURE, nullable=False, index=True)
    category = Column(String(100), default="Panchakarma", nullable=False, index=True)  # Primary category/expertise
    topics = Column(JSON, default=list, nullable=False)  # ["Virechana Protocol", "Clinical Assessment"]
    level = Column(SQLEnum(SessionLevel), default=SessionLevel.INTERMEDIATE, nullable=False)

    # Timing
    scheduled_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, default=60, nullable=False)

    # Capacity & Access
    max_students = Column(Integer, default=200, nullable=False)
    language = Column(String(100), default="English / Hindi", nullable=False)
    session_thumbnail = Column(String(500), nullable=True)
    learning_objectives = Column(JSON, default=list, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    visibility = Column(SQLEnum(SessionVisibility), default=SessionVisibility.PUBLIC, nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.SCHEDULED, nullable=False, index=True)

    # Live Streaming
    live_stream_url = Column(String(500), default="https://meet.google.com/ayu-live-stream", nullable=True)
    current_live_attendees = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    # Recording Details
    recording_available = Column(Boolean, default=True, nullable=False)
    recording_url = Column(String(1000), nullable=True)
    recording_duration = Column(Integer, default=0, nullable=False)
    recording_views_count = Column(Integer, default=0, nullable=False)
    recording_uploaded_at = Column(DateTime(timezone=True), nullable=True)

    # Aggregate Session Ratings
    average_rating = Column(Float, default=0.0, nullable=False)
    total_ratings = Column(Integer, default=0, nullable=False)
    participants_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    expert_profile = relationship("ExpertProfile", back_populates="sessions")
    participants = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")
    ratings = relationship("SessionRating", back_populates="session", cascade="all, delete-orphan")
    questions = relationship("SessionQuestion", back_populates="session", cascade="all, delete-orphan")


# ============================================================
# SESSION PARTICIPANTS & ATTENDANCE
# ============================================================

class SessionParticipant(Base):
    __tablename__ = "session_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("expert_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=True)
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    attended_live = Column(Boolean, default=False, nullable=False)
    live_joined_at = Column(DateTime(timezone=True), nullable=True)
    live_left_at = Column(DateTime(timezone=True), nullable=True)

    watched_recording = Column(Boolean, default=False, nullable=False)
    watch_duration_seconds = Column(Integer, default=0, nullable=False)
    is_eligible_to_rate = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("session_id", "student_user_id", name="uq_session_student_participant"),
    )

    session = relationship("ExpertSession", back_populates="participants")


# ============================================================
# SESSION RATINGS & REVIEWS (Multi-dimensional)
# ============================================================

class SessionRating(Base):
    __tablename__ = "session_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("expert_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    student_name = Column(String(255), nullable=False)
    overall_rating = Column(Float, nullable=False)  # 1.0 to 5.0

    # Categorical breakdown
    rating_knowledge = Column(Integer, default=5, nullable=False)         # 1-5
    rating_teaching_quality = Column(Integer, default=5, nullable=False)  # 1-5
    rating_clarity = Column(Integer, default=5, nullable=False)           # 1-5
    rating_practical_value = Column(Integer, default=5, nullable=False)   # 1-5
    rating_engagement = Column(Integer, default=5, nullable=False)        # 1-5
    rating_usefulness = Column(Integer, default=5, nullable=False)        # 1-5

    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("session_id", "student_user_id", name="uq_session_student_rating"),
    )

    session = relationship("ExpertSession", back_populates="ratings")


# ============================================================
# EXPERT FOLLOWING RELATIONSHIP
# ============================================================

class ExpertFollow(Base):
    __tablename__ = "expert_follows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expert_profile_id = Column(UUID(as_uuid=True), ForeignKey("expert_profiles.id", ondelete="CASCADE"), nullable=True, index=True)

    followed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        UniqueConstraint("student_user_id", "expert_user_id", name="uq_student_expert_follow"),
    )

    expert = relationship("ExpertProfile", back_populates="followers")


# ============================================================
# LIVE SESSION Q&A
# ============================================================

class SessionQuestion(Base):
    __tablename__ = "session_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("expert_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user_name = Column(String(255), nullable=False)
    user_role = Column(String(50), default="STUDENT", nullable=False)
    question_text = Column(Text, nullable=False)

    answer_text = Column(Text, nullable=True)
    answered_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    is_answered = Column(Boolean, default=False, nullable=False, index=True)
    upvotes_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    session = relationship("ExpertSession", back_populates="questions")


# ============================================================
# SESSION REMINDERS
# ============================================================

class SessionReminder(Base):
    __tablename__ = "session_reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("expert_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reminder_type = Column(String(50), default="NOTIFICATION", nullable=False)  # NOTIFICATION, CALENDAR, EMAIL
    is_sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("session_id", "student_user_id", name="uq_session_student_reminder"),
    )
