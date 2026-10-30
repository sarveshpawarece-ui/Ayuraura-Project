from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.domain import VerificationRequest, VerificationStatus, VerificationAudit
from app.api.deps import get_current_user, RoleChecker
from app.services.verification_service import VerificationService
from app.schemas.verification import (
    VerificationRequestOut,
    AdminApproveIn,
    AdminRejectIn,
    AdminRevokeIn,
    VerificationAnalyticsOut
)

router = APIRouter()
admin_role_guard = RoleChecker([UserRole.ADMIN])

@router.get("", response_model=List[VerificationRequestOut])
async def list_verification_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    subject_type: Optional[str] = Query(None),
    verification_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """List verification requests queue for admin review."""
    stmt = (
        select(VerificationRequest)
        .options(
            selectinload(VerificationRequest.evidences),
            selectinload(VerificationRequest.audits).selectinload(VerificationAudit.actor),
            selectinload(VerificationRequest.submitter),
            selectinload(VerificationRequest.reviewer)
        )
        .order_by(desc(VerificationRequest.created_at))
    )

    if status_filter:
        try:
            v_stat = VerificationStatus(status_filter.upper())
            stmt = stmt.where(VerificationRequest.status == v_stat)
        except ValueError:
            pass

    if subject_type:
        stmt = stmt.where(VerificationRequest.subject_type == subject_type.upper())
    if verification_type:
        stmt = stmt.where(VerificationRequest.verification_type == verification_type.upper())

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/analytics", response_model=VerificationAnalyticsOut)
async def get_verification_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """Get high-level verification queue statistics."""
    total = (await db.execute(select(func.count(VerificationRequest.id)))).scalar() or 0
    pending = (await db.execute(select(func.count(VerificationRequest.id)).where(VerificationRequest.status == VerificationStatus.PENDING))).scalar() or 0
    approved = (await db.execute(select(func.count(VerificationRequest.id)).where(VerificationRequest.status == VerificationStatus.VERIFIED))).scalar() or 0
    rejected = (await db.execute(select(func.count(VerificationRequest.id)).where(VerificationRequest.status == VerificationStatus.REJECTED))).scalar() or 0
    revoked = (await db.execute(select(func.count(VerificationRequest.id)).where(VerificationRequest.status == VerificationStatus.REVOKED))).scalar() or 0
    expired = (await db.execute(select(func.count(VerificationRequest.id)).where(VerificationRequest.status == VerificationStatus.EXPIRED))).scalar() or 0

    reviewed = approved + rejected + revoked
    approval_rate = round((approved / reviewed * 100), 1) if reviewed > 0 else 0.0

    return {
        "total_requests": total,
        "pending_count": pending,
        "approved_count": approved,
        "rejected_count": rejected,
        "revoked_count": revoked,
        "expired_count": expired,
        "approval_rate_pct": approval_rate
    }


@router.get("/{id}", response_model=VerificationRequestOut)
async def get_admin_verification_detail(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """Get detailed verification request view for admin review."""
    return await VerificationService.get_request_by_id(db, id)


@router.post("/{id}/approve", response_model=VerificationRequestOut)
async def approve_verification_request(
    id: str,
    approve_in: AdminApproveIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """Approve a verification request."""
    return await VerificationService.approve_request(db, current_user, id, approve_in)


@router.post("/{id}/reject", response_model=VerificationRequestOut)
async def reject_verification_request(
    id: str,
    reject_in: AdminRejectIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """Reject a verification request with mandatory reason."""
    return await VerificationService.reject_request(db, current_user, id, reject_in)


@router.post("/{id}/revoke", response_model=VerificationRequestOut)
async def revoke_verification_request(
    id: str,
    revoke_in: AdminRevokeIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_role_guard)
):
    """Revoke a previously verified request with mandatory reason."""
    return await VerificationService.revoke_request(db, current_user, id, revoke_in)
