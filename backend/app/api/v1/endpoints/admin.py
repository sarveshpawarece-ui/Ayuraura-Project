import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.domain import IndustryProfile, VerificationStatus
from app.schemas.industry import OrganizationProfileOut, AdminVerificationUpdate

router = APIRouter()


def check_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to platform Administrators"
        )
    return current_user


@router.get("/organizations", response_model=List[OrganizationProfileOut])
async def list_organizations(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(check_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List organizations for admin verification review."""
    stmt = select(IndustryProfile).order_by(desc(IndustryProfile.created_at))
    if status_filter:
        try:
            v_status = VerificationStatus(status_filter.upper())
            stmt = stmt.where(IndustryProfile.verification_status == v_status)
        except ValueError:
            pass
    res = await db.execute(stmt)
    return res.scalars().all()


@router.patch("/organizations/{organization_id}/verification", response_model=OrganizationProfileOut)
async def update_organization_verification(
    organization_id: uuid.UUID,
    update_in: AdminVerificationUpdate,
    current_user: User = Depends(check_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update organization verification status (VERIFIED, REJECTED, SUSPENDED)."""
    stmt = select(IndustryProfile).where(IndustryProfile.id == organization_id)
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.verification_status = update_in.verification_status
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/institutions")
async def list_institutions(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(check_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List institutions for admin verification review."""
    from app.models.domain import InstitutionProfile
    stmt = select(InstitutionProfile)
    if status_filter:
        try:
            v_status = VerificationStatus(status_filter.upper())
            stmt = stmt.where(InstitutionProfile.verification_status == v_status)
        except ValueError:
            pass
    res = await db.execute(stmt)
    institutions = res.scalars().all()
    return [
        {
            "id": str(i.id),
            "institution_name": i.institution_name,
            "aishe_code": i.aishe_code,
            "verification_status": i.verification_status.value if hasattr(i.verification_status, "value") else str(i.verification_status),
            "city": i.city,
            "state": i.state
        }
        for i in institutions
    ]


@router.patch("/institutions/{institution_id}/verification")
async def update_institution_verification(
    institution_id: uuid.UUID,
    update_in: AdminVerificationUpdate,
    current_user: User = Depends(check_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update institution verification status (VERIFIED, REJECTED, SUSPENDED)."""
    from app.models.domain import InstitutionProfile
    stmt = select(InstitutionProfile).where(InstitutionProfile.id == institution_id)
    res = await db.execute(stmt)
    inst = res.scalars().first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    inst.verification_status = update_in.verification_status
    await db.commit()
    await db.refresh(inst)
    return {
        "id": str(inst.id),
        "institution_name": inst.institution_name,
        "verification_status": inst.verification_status.value if hasattr(inst.verification_status, "value") else str(inst.verification_status)
    }

