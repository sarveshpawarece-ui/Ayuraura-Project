import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, JSON, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 44 — TRUST, PRIVACY & SECURITY AUDIT MODELS
# ============================================================

class UserPrivacySettings(Base):
    __tablename__ = "user_privacy_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    profile_visibility = Column(String(50), default="PUBLIC", nullable=False)  # PUBLIC, REGISTERED_ONLY, INSTITUTION_ONLY, PRIVATE
    portfolio_visibility = Column(String(50), default="PUBLIC", nullable=False)  # PUBLIC, LINK_ONLY, PRIVATE
    contact_email_visible = Column(Boolean, default=False, nullable=False)
    contact_phone_visible = Column(Boolean, default=False, nullable=False)
    show_assessment_scores = Column(Boolean, default=True, nullable=False)
    show_volunteer_hours = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class UserModerationReport(Base):
    __tablename__ = "user_moderation_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason_category = Column(String(50), default="INAPPROPRIATE_CONTENT", nullable=False)  # HARASSMENT, MEDICAL_MISINFORMATION, FAKE_CREDENTIALS, SPAM
    description = Column(Text, nullable=False)
    evidence_url = Column(String(500), nullable=True)
    status = Column(String(50), default="PENDING_REVIEW", nullable=False, index=True)  # PENDING_REVIEW, ACTION_TAKEN, DISMISSED
    admin_notes = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blocker_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("blocker_id", "blocked_id", name="uq_blocker_blocked_user"),)


class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)  # LOGIN_SUCCESS, VERIFICATION_STATUS_CHANGE, USER_REPORTED
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class LoginOtpChallenge(Base):
    """
    Two-step verification OTP challenge records.
    Never stores plaintext OTPs; uses cryptographic SHA-256 hash digests.
    Enforces expiration (default 5 minutes), single-use invalidation, and rate limits.
    """
    __tablename__ = "login_otp_challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_token = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hashed_otp = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    attempts_count = Column(Integer, default=0, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
