import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class PlatformIssueReport(Base):
    """
    User-submitted bug reports, feature suggestions, usability issues, and educational resource feedback.
    Protects user privacy: never contains passwords, private study notes, or confidential patient records.
    """
    __tablename__ = "platform_issue_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reporter_role = Column(String(50), nullable=True, index=True)
    
    # Types: BUG_REPORT, FEATURE_SUGGESTION, RESOURCE_FEEDBACK, USABILITY_ISSUE
    feedback_type = Column(String(50), nullable=False, index=True, default="BUG_REPORT")
    
    # Categories: 3D_ANATOMY, TOPIC_QUIZ, SYLLABUS, AUTH_LOGIN, COMMUNITY, PERFORMANCE, GENERAL
    category = Column(String(50), nullable=False, index=True, default="GENERAL")
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    page_url = Column(String(500), nullable=True)
    device_info = Column(String(500), nullable=True)
    
    # Priorities: LOW, MEDIUM, HIGH, CRITICAL
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True)
    
    # Statuses: OPEN, UNDER_REVIEW, IN_PROGRESS, RESOLVED, CLOSED
    status = Column(String(50), default="OPEN", nullable=False, index=True)
    
    admin_notes = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    reporter = relationship("User", foreign_keys=[reporter_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


class SystemErrorLog(Base):
    """
    Technical error logs and service anomalies captured across backend and frontend boundaries.
    Sanitizes technical details to ensure zero leakage of credentials, tokens, or PII.
    """
    __tablename__ = "system_error_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Types: API_ERROR, DB_QUERY_FAILURE, AI_TIMEOUT, AUTH_FAILURE, CLIENT_RUNTIME
    error_type = Column(String(100), nullable=False, index=True)
    
    # Severity: INFO, WARNING, ERROR, CRITICAL
    severity = Column(String(50), default="ERROR", nullable=False, index=True)
    
    endpoint = Column(String(255), nullable=True, index=True)
    status_code = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=False)
    technical_context = Column(JSON, default=dict, nullable=False)
    
    occurrence_count = Column(Integer, default=1, nullable=False)
    
    # Statuses: UNRESOLVED, INVESTIGATING, RESOLVED, IGNORED
    status = Column(String(50), default="UNRESOLVED", nullable=False, index=True)
    
    first_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    last_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
