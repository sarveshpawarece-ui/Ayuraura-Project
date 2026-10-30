import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# =============================================================================
# PLATFORM ISSUE & FEEDBACK SCHEMAS
# =============================================================================

class PlatformIssueCreate(BaseModel):
    feedback_type: str = Field(
        default="BUG_REPORT",
        description="BUG_REPORT, FEATURE_SUGGESTION, RESOURCE_FEEDBACK, or USABILITY_ISSUE"
    )
    category: str = Field(
        default="GENERAL",
        description="3D_ANATOMY, TOPIC_QUIZ, SYLLABUS, AUTH_LOGIN, COMMUNITY, PERFORMANCE, or GENERAL"
    )
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10, max_length=5000)
    page_url: Optional[str] = Field(None, max_length=500)
    device_info: Optional[str] = Field(None, max_length=500)
    priority: str = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH, or CRITICAL")


class PlatformIssueOut(BaseModel):
    id: str
    reporter_id: Optional[str] = None
    reporter_role: Optional[str] = None
    feedback_type: str
    category: str
    title: str
    description: str
    page_url: Optional[str] = None
    device_info: Optional[str] = None
    priority: str
    status: str
    admin_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlatformIssueAdminUpdate(BaseModel):
    status: Optional[str] = Field(None, description="OPEN, UNDER_REVIEW, IN_PROGRESS, RESOLVED, CLOSED")
    priority: Optional[str] = Field(None, description="LOW, MEDIUM, HIGH, CRITICAL")
    admin_notes: Optional[str] = Field(None, max_length=2000)


# =============================================================================
# SYSTEM ERROR LOG SCHEMAS
# =============================================================================

class ClientErrorReport(BaseModel):
    error_type: str = Field(default="CLIENT_RUNTIME", description="CLIENT_RUNTIME, API_ERROR, AI_TIMEOUT, AUTH_FAILURE")
    severity: str = Field(default="ERROR", description="INFO, WARNING, ERROR, CRITICAL")
    endpoint: Optional[str] = Field(None, max_length=255)
    status_code: Optional[int] = None
    error_message: str = Field(..., min_length=2, max_length=2000)
    technical_context: Dict[str, Any] = Field(default_factory=dict)


class SystemErrorOut(BaseModel):
    id: str
    error_type: str
    severity: str
    endpoint: Optional[str] = None
    status_code: Optional[int] = None
    error_message: str
    technical_context: Dict[str, Any]
    occurrence_count: int
    status: str
    first_seen_at: datetime
    last_seen_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SystemErrorAdminUpdate(BaseModel):
    status: str = Field(..., description="INVESTIGATING, RESOLVED, IGNORED")


# =============================================================================
# PLATFORM MONITORING HEALTH & TELEMETRY SCHEMAS
# =============================================================================

class ExtendedHealthCheckOut(BaseModel):
    status: str
    timestamp: datetime
    uptime_seconds: float
    database: Dict[str, Any]
    ai_service: Dict[str, Any]
    auth_service: Dict[str, Any]
    learning_workflows: Dict[str, Any]
    error_summary: Dict[str, Any]
    active_issues: Dict[str, Any]
