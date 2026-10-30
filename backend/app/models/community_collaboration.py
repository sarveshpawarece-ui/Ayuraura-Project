import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 1 & 2 — EDUCATIONAL COMMUNITY & FACULTY Q&A MODELS
# ============================================================

class DiscussionBookmark(Base):
    __tablename__ = "discussion_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_discussion_bookmark"),
    )

    post = relationship("ForumPost")
    user = relationship("User")


class FacultyQuestion(Base):
    """
    Phase 2: Formal educational questions directed to faculty / departmental educators.
    Protects student privacy by allowing student anonymity to peers while remaining visible to verified faculty.
    """
    __tablename__ = "faculty_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="SET NULL"), nullable=True, index=True)

    subject_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    academic_year = Column(String(50), default="1st Year", nullable=False)

    title = Column(String(255), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    is_anonymous_to_peers = Column(Boolean, default=False, nullable=False)
    
    # Status: OPEN, ANSWERED, RESOLVED, REJECTED
    status = Column(String(50), default="OPEN", nullable=False, index=True)
    
    faculty_answer = Column(Text, nullable=True)
    answered_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    
    # AI Simplification (Phase 7)
    ai_simplified_explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("User", foreign_keys=[student_id])
    faculty = relationship("User", foreign_keys=[faculty_id])
    answered_by = relationship("User", foreign_keys=[answered_by_user_id])
    institution = relationship("InstitutionProfile")


# ============================================================
# PHASE 4 — STUDENT STUDY GROUPS & COLLABORATION
# ============================================================

class StudyGroup(Base):
    __tablename__ = "study_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="SET NULL"), nullable=True, index=True)

    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    subject_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(255), nullable=False)
    academic_year = Column(String(50), default="1st Year", nullable=False)
    topic_focus = Column(String(255), nullable=True)

    max_members = Column(Integer, default=15, nullable=False)
    is_private = Column(Boolean, default=False, nullable=False)
    passcode = Column(String(50), nullable=True)

    # List of shared resources: [{"title": "...", "url": "...", "type": "NOTES|SLIDES|LINK", "shared_by": "..."}]
    resources = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])
    institution = relationship("InstitutionProfile")
    members = relationship("StudyGroupMember", back_populates="group", cascade="all, delete-orphan")
    discussions = relationship("StudyGroupDiscussion", back_populates="group", cascade="all, delete-orphan")


class StudyGroupMember(Base):
    __tablename__ = "study_group_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), default="MEMBER", nullable=False)  # ADMIN, MEMBER
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_study_group_member"),
    )

    group = relationship("StudyGroup", back_populates="members")
    user = relationship("User")


class StudyGroupDiscussion(Base):
    __tablename__ = "study_group_discussions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    group = relationship("StudyGroup", back_populates="discussions")
    author = relationship("User")


# ============================================================
# PHASE 5 — EDUCATIONAL FEEDBACK & RATINGS (ANTI-MANIPULATION)
# ============================================================

class EducationalFeedback(Base):
    """
    Phase 5: Structured feedback and ratings for sessions, faculty resources, and study materials.
    Enforces a unique constraint per (user_id, target_type, target_id) to strictly prevent rating manipulation.
    """
    __tablename__ = "educational_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(String(50), nullable=False, index=True)  # EXPERT_SESSION, FACULTY_RESOURCE, STUDY_MATERIAL, LEARNING_ACTIVITY
    target_id = Column(String(100), nullable=False, index=True)
    target_title = Column(String(255), nullable=False)

    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    feedback_text = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)  # Private unless user explicitly consents
    moderation_status = Column(String(50), default="APPROVED", nullable=False)  # APPROVED, FLAGGED, REMOVED

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id", name="uq_user_target_feedback"),
    )

    user = relationship("User")


# ============================================================
# PHASE 6 — COMMUNITY MODERATION AND SAFETY
# ============================================================

class CommunityModerationAction(Base):
    """
    Phase 6: Audit trail of moderation decisions.
    Ensures human review accountability with zero purely unverified AI automated punitive actions.
    """
    __tablename__ = "community_moderation_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    moderator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # HIDE_POST, REMOVE_POST, WARN_USER, RESTRICT_USER, DISMISS_REPORT
    target_type = Column(String(50), nullable=False)  # POST, COMMENT, QUESTION, RESOURCE, USER
    target_id = Column(String(100), nullable=False)
    reason = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    moderator = relationship("User")


class UserRestriction(Base):
    """
    Phase 6: User temporary or permanent posting restrictions imposed by authorized moderators.
    """
    __tablename__ = "user_restrictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    is_restricted = Column(Boolean, default=True, nullable=False)
    restricted_until = Column(DateTime(timezone=True), nullable=True)
    restriction_reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


# ============================================================
# PHASE 8 — NOTIFICATION PREFERENCES
# ============================================================

class UserNotificationPreference(Base):
    """
    Phase 8: Fine-grained user notification preferences to avoid notification fatigue.
    """
    __tablename__ = "user_notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    faculty_replies = Column(Boolean, default=True, nullable=False)
    session_announcements = Column(Boolean, default=True, nullable=False)
    session_reminders = Column(Boolean, default=True, nullable=False)
    study_group_activity = Column(Boolean, default=True, nullable=False)
    discussion_replies = Column(Boolean, default=True, nullable=False)
    available_recordings = Column(Boolean, default=True, nullable=False)

    # Academic & Student Learning Notification Categories
    academic_announcements = Column(Boolean, default=True, nullable=False)
    study_reminders = Column(Boolean, default=True, nullable=False)
    exam_alerts = Column(Boolean, default=True, nullable=False)
    timetable_updates = Column(Boolean, default=True, nullable=False)
    career_updates = Column(Boolean, default=True, nullable=False)
    learning_resource_alerts = Column(Boolean, default=True, nullable=False)

    # Channels & Cadence
    email_channel_enabled = Column(Boolean, default=False, nullable=False)
    push_channel_enabled = Column(Boolean, default=True, nullable=False)
    reminder_frequency = Column(String(50), default="IMMEDIATE", nullable=False) # IMMEDIATE, DAILY_DIGEST

    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")

