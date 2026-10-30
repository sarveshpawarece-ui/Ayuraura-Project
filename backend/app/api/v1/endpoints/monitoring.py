import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.services.monitoring_service import MonitoringService
from app.schemas.monitoring_feedback import (
    PlatformIssueCreate,
    PlatformIssueOut,
    PlatformIssueAdminUpdate,
    ClientErrorReport,
    SystemErrorOut,
    SystemErrorAdminUpdate,
    ExtendedHealthCheckOut,
)

router = APIRouter()

admin_guard = RoleChecker([UserRole.ADMIN])


def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def _serialize_issue(issue: Any) -> Dict[str, Any]:
    return {
        "id": str(issue.id),
        "reporter_id": str(issue.reporter_id) if issue.reporter_id else None,
        "reporter_role": issue.reporter_role,
        "feedback_type": issue.feedback_type,
        "category": issue.category,
        "title": issue.title,
        "description": issue.description,
        "page_url": issue.page_url,
        "device_info": issue.device_info,
        "priority": issue.priority,
        "status": issue.status,
        "admin_notes": issue.admin_notes,
        "resolved_at": issue.resolved_at,
        "created_at": issue.created_at,
        "updated_at": issue.updated_at,
    }


def _serialize_error(err: Any) -> Dict[str, Any]:
    return {
        "id": str(err.id),
        "error_type": err.error_type,
        "severity": err.severity,
        "endpoint": err.endpoint,
        "status_code": err.status_code,
        "error_message": err.error_message,
        "technical_context": err.technical_context or {},
        "occurrence_count": err.occurrence_count,
        "status": err.status,
        "first_seen_at": err.first_seen_at,
        "last_seen_at": err.last_seen_at,
        "resolved_at": err.resolved_at,
    }


# =============================================================================
# 1. USER FEEDBACK SUBMISSION & PRIVATE RETRIEVAL
# =============================================================================

@router.post("/feedback", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: PlatformIssueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit platform feedback, bug reports, feature suggestions, or usability issues.
    Available to all authenticated users across all roles (Student, Faculty, Doctor, Institution, Admin).
    Input is scrubbed to eliminate sensitive credentials or personal health data.
    """
    issue = await MonitoringService.submit_issue(db, payload, current_user)
    return _serialize_issue(issue)


@router.get("/feedback/my", response_model=List[Dict[str, Any]])
async def get_my_feedback(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all feedback and issues submitted by the current user.
    Preserves privacy: users can only see their own feedback reports and status updates.
    """
    issues = await MonitoringService.get_my_issues(db, current_user)
    return [_serialize_issue(i) for i in issues]


# =============================================================================
# 2. CLIENT & SYSTEM ERROR INGESTION
# =============================================================================

@router.post("/client-errors", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def record_client_error(
    payload: ClientErrorReport,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest technical client-side errors, uncaught exceptions, and service timeouts.
    Automatically scrubs tokens, keys, and PII, and aggregates recurring failures.
    """
    err = await MonitoringService.record_error(db, payload)
    return _serialize_error(err)


# =============================================================================
# 3. EXTENDED PLATFORM HEALTH & DIAGNOSTICS
# =============================================================================

@router.get("/health/extended", response_model=ExtendedHealthCheckOut)
async def get_extended_health_telemetry(
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive health check telemetry evaluating database liveness/latency,
    AI service connectivity, auth token engine, and critical educational workflows.
    """
    return await MonitoringService.get_extended_health(db)


# =============================================================================
# 4. ADMIN ISSUE & ERROR MANAGEMENT (ADMIN ONLY)
# =============================================================================

@router.get("/admin/issues", response_model=List[Dict[str, Any]])
async def admin_list_issues(
    status_filter: Optional[str] = Query(None, alias="status"),
    type_filter: Optional[str] = Query(None, alias="type"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard)
):
    """List all platform issues and user feedback for administrative triage and resolution."""
    issues = await MonitoringService.admin_list_issues(db, status_filter, type_filter, priority_filter)
    return [_serialize_issue(i) for i in issues]


@router.patch("/admin/issues/{issue_id}", response_model=Dict[str, Any])
async def admin_update_issue(
    issue_id: str,
    payload: PlatformIssueAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard)
):
    """Update issue status (OPEN -> UNDER_REVIEW -> IN_PROGRESS -> RESOLVED -> CLOSED) and record resolution notes."""
    uid = _to_uuid(issue_id)
    issue = await MonitoringService.admin_update_issue(db, uid, payload, current_user)
    return _serialize_issue(issue)


@router.get("/admin/errors", response_model=List[Dict[str, Any]])
async def admin_list_errors(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard)
):
    """List captured system and client errors sorted by recency and occurrence frequency."""
    errors = await MonitoringService.admin_list_errors(db, status_filter, severity_filter)
    return [_serialize_error(e) for e in errors]


@router.patch("/admin/errors/{error_id}", response_model=Dict[str, Any])
async def admin_update_error(
    error_id: str,
    payload: SystemErrorAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard)
):
    """Update error resolution status (INVESTIGATING, RESOLVED, IGNORED)."""
    uid = _to_uuid(error_id)
    err = await MonitoringService.admin_update_error(db, uid, payload)
    return _serialize_error(err)
