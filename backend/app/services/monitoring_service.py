import uuid
import re
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, and_, text
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User, UserRole
from app.models.monitoring_feedback import PlatformIssueReport, SystemErrorLog
from app.models.topic_quiz import TopicQuizAttempt, StudentTopicPerformance
from app.schemas.monitoring_feedback import (
    PlatformIssueCreate,
    PlatformIssueOut,
    PlatformIssueAdminUpdate,
    ClientErrorReport,
    SystemErrorOut,
    SystemErrorAdminUpdate,
    ExtendedHealthCheckOut,
)

# Startup baseline timestamp for uptime calculation
STARTUP_TIME = time.time()

# Sensitive data sanitization regexes
TOKEN_REGEX = re.compile(r'(Bearer\s+[A-Za-z0-9\-_\.]+)|(AIzaSy[A-Za-z0-9\-_]{30,})|(sk-[A-Za-z0-9\-_]{20,})', re.IGNORECASE)
PASSWORD_REGEX = re.compile(r'(["\']?password["\']?\s*[:=]\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)


def sanitize_technical_string(val: Optional[str]) -> str:
    if not val:
        return ""
    # Strip dangerous tokens and secrets
    sanitized = TOKEN_REGEX.sub("[REDACTED_CREDENTIAL]", val)
    sanitized = PASSWORD_REGEX.sub(r'\1[REDACTED_PASSWORD]\3', sanitized)
    # Strip HTML tags
    clean = re.sub(r'<[^>]*>', '', sanitized)
    return clean[:5000]


def sanitize_dict_context(ctx: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = {}
    forbidden_keys = {"password", "secret", "token", "authorization", "cookie", "gemini_api_key", "secret_key"}
    for k, v in ctx.items():
        if any(fk in k.lower() for fk in forbidden_keys):
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, str):
            sanitized[k] = sanitize_technical_string(v)
        elif isinstance(v, dict):
            sanitized[k] = sanitize_dict_context(v)
        elif isinstance(v, (int, float, bool)) or v is None:
            sanitized[k] = v
        else:
            sanitized[k] = str(v)[:200]
    return sanitized


class MonitoringService:

    # =========================================================================
    # 1. USER FEEDBACK & ISSUE REPORTING
    # =========================================================================
    @classmethod
    async def submit_issue(
        cls,
        db: AsyncSession,
        payload: PlatformIssueCreate,
        current_user: Optional[User] = None
    ) -> PlatformIssueReport:
        clean_title = sanitize_technical_string(payload.title)
        clean_desc = sanitize_technical_string(payload.description)
        clean_page = sanitize_technical_string(payload.page_url) if payload.page_url else None
        clean_device = sanitize_technical_string(payload.device_info) if payload.device_info else None

        valid_types = {"BUG_REPORT", "FEATURE_SUGGESTION", "RESOURCE_FEEDBACK", "USABILITY_ISSUE"}
        valid_categories = {"3D_ANATOMY", "TOPIC_QUIZ", "SYLLABUS", "AUTH_LOGIN", "COMMUNITY", "PERFORMANCE", "GENERAL"}
        valid_priorities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

        fb_type = payload.feedback_type.upper() if payload.feedback_type.upper() in valid_types else "BUG_REPORT"
        fb_cat = payload.category.upper() if payload.category.upper() in valid_categories else "GENERAL"
        fb_prio = payload.priority.upper() if payload.priority.upper() in valid_priorities else "MEDIUM"

        report = PlatformIssueReport(
            id=uuid.uuid4(),
            reporter_id=current_user.id if current_user else None,
            reporter_role=current_user.role.value if current_user and hasattr(current_user.role, "value") else (str(current_user.role) if current_user else "GUEST"),
            feedback_type=fb_type,
            category=fb_cat,
            title=clean_title,
            description=clean_desc,
            page_url=clean_page,
            device_info=clean_device,
            priority=fb_prio,
            status="OPEN"
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    @classmethod
    async def get_my_issues(
        cls,
        db: AsyncSession,
        current_user: User
    ) -> List[PlatformIssueReport]:
        stmt = (
            select(PlatformIssueReport)
            .where(PlatformIssueReport.reporter_id == current_user.id)
            .order_by(desc(PlatformIssueReport.created_at))
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    # =========================================================================
    # 2. SYSTEM ERROR LOGGING & DEDUPLICATION
    # =========================================================================
    @classmethod
    async def record_error(
        cls,
        db: AsyncSession,
        payload: ClientErrorReport
    ) -> SystemErrorLog:
        clean_msg = sanitize_technical_string(payload.error_message)
        clean_ctx = sanitize_dict_context(payload.technical_context)
        clean_ep = sanitize_technical_string(payload.endpoint) if payload.endpoint else None

        valid_severities = {"INFO", "WARNING", "ERROR", "CRITICAL"}
        severity = payload.severity.upper() if payload.severity.upper() in valid_severities else "ERROR"

        # Check for existing open error with same message & endpoint in the last 24h
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        stmt = (
            select(SystemErrorLog)
            .where(
                and_(
                    SystemErrorLog.error_type == payload.error_type,
                    SystemErrorLog.endpoint == clean_ep,
                    SystemErrorLog.error_message == clean_msg,
                    SystemErrorLog.status != "RESOLVED",
                    SystemErrorLog.last_seen_at >= cutoff
                )
            )
            .order_by(desc(SystemErrorLog.last_seen_at))
            .limit(1)
        )
        res = await db.execute(stmt)
        existing = res.scalars().first()

        if existing:
            existing.occurrence_count += 1
            existing.last_seen_at = datetime.now(timezone.utc)
            existing.technical_context = clean_ctx
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            new_log = SystemErrorLog(
                id=uuid.uuid4(),
                error_type=payload.error_type,
                severity=severity,
                endpoint=clean_ep,
                status_code=payload.status_code,
                error_message=clean_msg,
                technical_context=clean_ctx,
                occurrence_count=1,
                status="UNRESOLVED"
            )
            db.add(new_log)
            await db.commit()
            await db.refresh(new_log)
            return new_log

    # =========================================================================
    # 3. COMPREHENSIVE EXTENDED HEALTH CHECK
    # =========================================================================
    @classmethod
    async def get_extended_health(
        cls,
        db: AsyncSession
    ) -> Dict[str, Any]:
        # 1. Database liveness & latency
        t0 = time.perf_counter()
        db_healthy = False
        db_latency_ms = 0.0
        try:
            await db.execute(text("SELECT 1"))
            db_latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            db_healthy = True
        except Exception:
            db_healthy = False

        # 2. AI Service status
        ai_configured = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10)
        ai_service_status = {
            "configured": ai_configured,
            "provider": "Google Gemini 1.5 Flash",
            "status": "OPERATIONAL" if ai_configured else "STANDBY_DEV_MODE"
        }

        # 3. Auth Subsystem status
        auth_service_status = {
            "status": "OPERATIONAL",
            "algorithm": settings.ALGORITHM,
            "token_expiration_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "secret_key_hardened": bool(
                settings.SECRET_KEY != "ayursetu-sih2k26-secret-key-change-in-production-32bytes"
            )
        }

        # 4. Learning Workflows Activity Check
        res_attempts = await db.execute(select(func.count(TopicQuizAttempt.id)))
        total_quiz_attempts = res_attempts.scalar() or 0

        res_perf = await db.execute(select(func.count(StudentTopicPerformance.id)))
        total_topic_performances = res_perf.scalar() or 0

        learning_workflows_status = {
            "topic_quiz_engine": "HEALTHY",
            "total_quiz_attempts": total_quiz_attempts,
            "active_topic_records": total_topic_performances,
            "anatomy_viewer_status": "READY"
        }

        # 5. Error & Issue Counts
        res_unresolved = await db.execute(
            select(func.count(SystemErrorLog.id)).where(SystemErrorLog.status == "UNRESOLVED")
        )
        unresolved_errors = res_unresolved.scalar() or 0

        res_crit = await db.execute(
            select(func.count(SystemErrorLog.id)).where(
                and_(SystemErrorLog.status == "UNRESOLVED", SystemErrorLog.severity == "CRITICAL")
            )
        )
        critical_errors = res_crit.scalar() or 0

        res_open_issues = await db.execute(
            select(func.count(PlatformIssueReport.id)).where(PlatformIssueReport.status == "OPEN")
        )
        open_issues = res_open_issues.scalar() or 0

        overall_status = "HEALTHY"
        if not db_healthy or critical_errors > 0:
            overall_status = "DEGRADED"

        return {
            "status": overall_status,
            "timestamp": datetime.now(timezone.utc),
            "uptime_seconds": round(time.time() - STARTUP_TIME, 1),
            "database": {
                "connected": db_healthy,
                "latency_ms": db_latency_ms,
                "driver": "asyncpg / aiosqlite"
            },
            "ai_service": ai_service_status,
            "auth_service": auth_service_status,
            "learning_workflows": learning_workflows_status,
            "error_summary": {
                "unresolved_errors_count": unresolved_errors,
                "critical_errors_count": critical_errors
            },
            "active_issues": {
                "open_issues_count": open_issues
            }
        }

    # =========================================================================
    # 4. ADMIN ISSUE & ERROR RESOLUTION WORKFLOWS
    # =========================================================================
    @classmethod
    async def admin_list_issues(
        cls,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        type_filter: Optional[str] = None,
        priority_filter: Optional[str] = None
    ) -> List[PlatformIssueReport]:
        stmt = select(PlatformIssueReport).order_by(desc(PlatformIssueReport.created_at))
        if status_filter:
            stmt = stmt.where(PlatformIssueReport.status == status_filter.upper())
        if type_filter:
            stmt = stmt.where(PlatformIssueReport.feedback_type == type_filter.upper())
        if priority_filter:
            stmt = stmt.where(PlatformIssueReport.priority == priority_filter.upper())

        res = await db.execute(stmt)
        return list(res.scalars().all())

    @classmethod
    async def admin_update_issue(
        cls,
        db: AsyncSession,
        issue_id: uuid.UUID,
        payload: PlatformIssueAdminUpdate,
        admin_user: User
    ) -> PlatformIssueReport:
        stmt = select(PlatformIssueReport).where(PlatformIssueReport.id == issue_id)
        res = await db.execute(stmt)
        issue = res.scalars().first()
        if not issue:
            raise HTTPException(status_code=404, detail="Platform issue report not found")

        if payload.status:
            valid_statuses = {"OPEN", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"}
            if payload.status.upper() in valid_statuses:
                issue.status = payload.status.upper()
                if issue.status in {"RESOLVED", "CLOSED"}:
                    issue.resolved_at = datetime.now(timezone.utc)
                    issue.resolved_by = admin_user.id
                else:
                    issue.resolved_at = None

        if payload.priority:
            valid_priorities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
            if payload.priority.upper() in valid_priorities:
                issue.priority = payload.priority.upper()

        if payload.admin_notes is not None:
            issue.admin_notes = sanitize_technical_string(payload.admin_notes)

        issue.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(issue)
        return issue

    @classmethod
    async def admin_list_errors(
        cls,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        severity_filter: Optional[str] = None
    ) -> List[SystemErrorLog]:
        stmt = select(SystemErrorLog).order_by(desc(SystemErrorLog.last_seen_at))
        if status_filter:
            stmt = stmt.where(SystemErrorLog.status == status_filter.upper())
        if severity_filter:
            stmt = stmt.where(SystemErrorLog.severity == severity_filter.upper())

        res = await db.execute(stmt)
        return list(res.scalars().all())

    @classmethod
    async def admin_update_error(
        cls,
        db: AsyncSession,
        error_id: uuid.UUID,
        payload: SystemErrorAdminUpdate
    ) -> SystemErrorLog:
        stmt = select(SystemErrorLog).where(SystemErrorLog.id == error_id)
        res = await db.execute(stmt)
        err = res.scalars().first()
        if not err:
            raise HTTPException(status_code=404, detail="System error log not found")

        valid_statuses = {"UNRESOLVED", "INVESTIGATING", "RESOLVED", "IGNORED"}
        if payload.status.upper() in valid_statuses:
            err.status = payload.status.upper()
            if err.status == "RESOLVED":
                err.resolved_at = datetime.now(timezone.utc)
            else:
                err.resolved_at = None

        await db.commit()
        await db.refresh(err)
        return err
