from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc

from app.core.database import get_db
from app.models.user import User
from app.models.domain import VerificationRequest, VerificationAudit
from app.api.deps import get_current_user
from app.services.verification_service import VerificationService
from app.schemas.verification import (
    VerificationRequestCreate,
    VerificationRequestOut,
    VerificationResubmitIn
)

router = APIRouter()

@router.get("", response_model=List[VerificationRequestOut])
async def list_student_verifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List authenticated user's submitted verification requests."""
    stmt = (
        select(VerificationRequest)
        .options(
            selectinload(VerificationRequest.evidences),
            selectinload(VerificationRequest.audits).selectinload(VerificationAudit.actor),
            selectinload(VerificationRequest.submitter),
            selectinload(VerificationRequest.reviewer)
        )
        .where(VerificationRequest.submitted_by == current_user.id)
        .order_by(desc(VerificationRequest.created_at))
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=VerificationRequestOut, status_code=status.HTTP_201_CREATED)
async def submit_verification_request(
    data: VerificationRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a new verification request with evidence."""
    return await VerificationService.submit_request(db, current_user, data)


@router.get("/{id}", response_model=VerificationRequestOut)
async def get_verification_request(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed verification request view (IDOR protected)."""
    req = await VerificationService.get_request_by_id(db, id)
    if req.submitted_by != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied.")
    return req


@router.post("/{id}/resubmit", response_model=VerificationRequestOut)
async def resubmit_verification_request(
    id: str,
    data: VerificationResubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resubmit a rejected verification request with updated evidence."""
    return await VerificationService.resubmit_request(db, current_user, id, data)


@router.patch("/{id}/visibility", response_model=VerificationRequestOut)
async def toggle_public_badge_visibility(
    id: str,
    is_public_badge: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle public badge visibility for verified record."""
    req = await VerificationService.get_request_by_id(db, id)
    if req.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    req.is_public_badge = is_public_badge
    await db.commit()
    return await VerificationService.get_request_by_id(db, id)
