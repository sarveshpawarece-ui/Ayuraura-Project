import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 49 — COMMUNITY & DISCUSSION FORUM MODELS
# ============================================================

class ForumCategory(Base):
    __tablename__ = "forum_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="MessageSquare", nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    topics_count = Column(Integer, default=0, nullable=False)
    posts_count = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    posts = relationship("ForumPost", back_populates="category", cascade="all, delete-orphan")


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("forum_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    # BAMS Curriculum & Educational Organization
    subject_id = Column(String(100), nullable=True, index=True)
    subject_name = Column(String(255), nullable=True)
    topic = Column(String(255), nullable=True)
    academic_year = Column(String(50), nullable=True)
    post_type = Column(String(50), default="DISCUSSION", nullable=False, index=True)  # QUESTION, DISCUSSION, STUDY_TIP, EXAM_PREP, RESOURCE_SHARE
    resource_url = Column(String(1000), nullable=True)

    # AI Community Insights (Phase 7)
    ai_summary = Column(Text, nullable=True)
    ai_followups = Column(JSON, default=list, nullable=False)

    tags = Column(JSON, default=list, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)
    upvotes_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    bookmarks_count = Column(Integer, default=0, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    is_solved = Column(Boolean, default=False, nullable=False)
    moderation_status = Column(String(50), default="PUBLISHED", nullable=False, index=True)  # PUBLISHED, FLAGGED, HIDDEN
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship("ForumCategory", back_populates="posts")
    comments = relationship("ForumComment", back_populates="post", cascade="all, delete-orphan")
    author = relationship("User", foreign_keys=[author_id])


class ForumComment(Base):
    __tablename__ = "forum_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_comment_id = Column(UUID(as_uuid=True), ForeignKey("forum_comments.id", ondelete="CASCADE"), nullable=True, index=True)
    content = Column(Text, nullable=False)
    upvotes_count = Column(Integer, default=0, nullable=False)
    is_accepted_answer = Column(Boolean, default=False, nullable=False)
    moderation_status = Column(String(50), default="PUBLISHED", nullable=False)  # PUBLISHED, FLAGGED, HIDDEN
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    post = relationship("ForumPost", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])


class ForumPostReaction(Base):
    __tablename__ = "forum_post_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reaction_type = Column(String(50), default="UPVOTE", nullable=False)  # UPVOTE, HELPFUL, CLINICAL_INSIGHT
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_user_reaction"),)


class ForumReport(Base):
    __tablename__ = "forum_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=True, index=True)
    comment_id = Column(UUID(as_uuid=True), ForeignKey("forum_comments.id", ondelete="CASCADE"), nullable=True, index=True)
    reason = Column(String(50), default="INAPPROPRIATE", nullable=False)  # SPAM, MEDICAL_MISINFORMATION, HARASSMENT
    details = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, REVIEWED, DISMISSED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
