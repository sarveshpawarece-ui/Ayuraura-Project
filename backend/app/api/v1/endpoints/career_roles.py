import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.career_role import CareerRoleOut
from app.schemas.skill_gap import CareerRoleRequiredSkillsOut
from app.services.career_role_service import career_role_service
from app.services.skill_gap_service import skill_gap_service

router = APIRouter()

@router.get("", response_model=List[CareerRoleOut])
@router.get("/", response_model=List[CareerRoleOut])
async def list_career_roles(
    category: Optional[str] = Query(None, description="Filter by career category (e.g. AYURVEDA_PHARMACEUTICAL)"),
    search: Optional[str] = Query(None, description="Search keyword in role title or description"),
    db: AsyncSession = Depends(get_db)
):
    roles = await career_role_service.get_career_roles(db, category=category, search=search, is_active=True)
    return [CareerRoleOut.model_validate(r) for r in roles]

@router.get("/{career_role_id}/required-skills", response_model=CareerRoleRequiredSkillsOut)
async def get_career_role_required_skills(
    career_role_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get required skills for a target career role.
    Supports either UUID or slug parameter.
    """
    role = await career_role_service.get_career_role_by_id_or_slug(db, career_role_id)
    if not role or not role.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{career_role_id}' not found"
        )
    return await skill_gap_service.get_role_required_skills(db, role.id)

@router.get("/{role_id_or_slug}", response_model=CareerRoleOut)
async def get_career_role_detail(
    role_id_or_slug: str,
    db: AsyncSession = Depends(get_db)
):
    role = await career_role_service.get_career_role_by_id_or_slug(db, role_id_or_slug)
    if not role or not role.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{role_id_or_slug}' not found"
        )
    return CareerRoleOut.model_validate(role)
