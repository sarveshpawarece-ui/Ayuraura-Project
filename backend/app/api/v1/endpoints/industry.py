import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.industry import (
    OrganizationProfileOut,
    OrganizationProfileUpdate,
    IndustryOpportunityCreate,
    IndustryOpportunityUpdate,
    IndustryOpportunityOut,
    ApplicantSummaryOut,
    ApplicantDetailOut,
    ApplicationStatusUpdateIn,
    InternalNoteCreate,
    InternalNoteOut,
    IndustryDashboardSummaryOut,
    IndustryAnalyticsOut
)
from app.services.industry_service import IndustryService

router = APIRouter()


def check_industry_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user has INDUSTRY or ADMIN role."""
    if current_user.role not in [UserRole.INDUSTRY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Industry or Admin accounts"
        )
    return current_user


# ==========================================
# DASHBOARD & ANALYTICS
# ==========================================

@router.get("/dashboard", response_model=IndustryDashboardSummaryOut)
async def get_industry_dashboard(
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve industry dashboard metrics, recent opportunities, and applicants."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.get_dashboard_summary(db, org)


@router.get("/analytics", response_model=IndustryAnalyticsOut)
async def get_industry_analytics(
    period: str = Query("30d", description="7d, 30d, 90d, all_time"),
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve hiring pipeline funnel and match score distribution analytics."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.get_industry_analytics(db, org, period)


# ==========================================
# ORGANIZATION PROFILE
# ==========================================

@router.get("/organization", response_model=OrganizationProfileOut)
async def get_organization_profile(
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Get authenticated user's organization profile."""
    return await IndustryService.get_or_create_industry_profile(db, current_user)


@router.patch("/organization", response_model=OrganizationProfileOut)
async def update_organization_profile(
    profile_in: OrganizationProfileUpdate,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Update organization profile information."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.update_organization_profile(db, org, profile_in)


# ==========================================
# OPPORTUNITY MANAGEMENT
# ==========================================

@router.get("/opportunities", response_model=List[IndustryOpportunityOut])
async def list_organization_opportunities(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """List opportunities created by current organization."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opps = await IndustryService.list_opportunities(db, org.id, status_filter, search)
    out_list = []
    for opp in opps:
        out_list.append({
            "id": opp.id,
            "organization_id": opp.organization_id,
            "organization_name": opp.organization_name,
            "title": opp.title,
            "description": opp.description,
            "responsibilities": opp.responsibilities,
            "requirements": opp.requirements,
            "opportunity_type": opp.opportunity_type,
            "work_mode": opp.work_mode,
            "employment_type": opp.employment_type,
            "experience_level": opp.experience_level,
            "location_text": opp.location_text,
            "city": opp.city,
            "state": opp.state,
            "country": opp.country,
            "application_deadline": opp.application_deadline,
            "salary_min": opp.salary_min,
            "salary_max": opp.salary_max,
            "salary_currency": opp.salary_currency,
            "is_salary_disclosed": opp.is_salary_disclosed,
            "status": opp.status,
            "created_at": opp.created_at,
            "updated_at": opp.updated_at,
            "required_skills": [
                {
                    "id": req.id,
                    "opportunity_id": req.opportunity_id,
                    "skill_id": req.skill_id,
                    "skill_name": req.skill.name if req.skill else None,
                    "skill_category": req.skill.category.value if req.skill else None,
                    "required_score": req.required_score,
                    "importance": req.importance,
                    "is_required": req.is_required
                }
                for req in (opp.required_skills or [])
            ],
            "applicant_count": len(opp.applications or [])
        })
    return out_list


@router.post("/opportunities", response_model=IndustryOpportunityOut, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    opp_in: IndustryOpportunityCreate,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new opportunity."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.create_opportunity(db, org, current_user.id, opp_in)
    return {
        "id": opp.id,
        "organization_id": opp.organization_id,
        "organization_name": opp.organization_name,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "requirements": opp.requirements,
        "opportunity_type": opp.opportunity_type,
        "work_mode": opp.work_mode,
        "employment_type": opp.employment_type,
        "experience_level": opp.experience_level,
        "location_text": opp.location_text,
        "city": opp.city,
        "state": opp.state,
        "country": opp.country,
        "application_deadline": opp.application_deadline,
        "salary_min": opp.salary_min,
        "salary_max": opp.salary_max,
        "salary_currency": opp.salary_currency,
        "is_salary_disclosed": opp.is_salary_disclosed,
        "status": opp.status,
        "created_at": opp.created_at,
        "updated_at": opp.updated_at,
        "required_skills": [
            {
                "id": req.id,
                "opportunity_id": req.opportunity_id,
                "skill_id": req.skill_id,
                "skill_name": req.skill.name if req.skill else None,
                "skill_category": req.skill.category.value if req.skill else None,
                "required_score": req.required_score,
                "importance": req.importance,
                "is_required": req.is_required
            }
            for req in (opp.required_skills or [])
        ],
        "applicant_count": len(opp.applications or [])
    }


@router.get("/opportunities/{opportunity_id}", response_model=IndustryOpportunityOut)
async def get_opportunity_detail(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single opportunity details with requirements."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.get_opportunity(db, org.id, opportunity_id)
    return {
        "id": opp.id,
        "organization_id": opp.organization_id,
        "organization_name": opp.organization_name,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "requirements": opp.requirements,
        "opportunity_type": opp.opportunity_type,
        "work_mode": opp.work_mode,
        "employment_type": opp.employment_type,
        "experience_level": opp.experience_level,
        "location_text": opp.location_text,
        "city": opp.city,
        "state": opp.state,
        "country": opp.country,
        "application_deadline": opp.application_deadline,
        "salary_min": opp.salary_min,
        "salary_max": opp.salary_max,
        "salary_currency": opp.salary_currency,
        "is_salary_disclosed": opp.is_salary_disclosed,
        "status": opp.status,
        "created_at": opp.created_at,
        "updated_at": opp.updated_at,
        "required_skills": [
            {
                "id": req.id,
                "opportunity_id": req.opportunity_id,
                "skill_id": req.skill_id,
                "skill_name": req.skill.name if req.skill else None,
                "skill_category": req.skill.category.value if req.skill else None,
                "required_score": req.required_score,
                "importance": req.importance,
                "is_required": req.is_required
            }
            for req in (opp.required_skills or [])
        ],
        "applicant_count": len(opp.applications or [])
    }


@router.patch("/opportunities/{opportunity_id}", response_model=IndustryOpportunityOut)
async def update_opportunity(
    opportunity_id: uuid.UUID,
    opp_in: IndustryOpportunityUpdate,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Update opportunity parameters and skill requirements."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.update_opportunity(db, org, opportunity_id, opp_in)
    return {
        "id": opp.id,
        "organization_id": opp.organization_id,
        "organization_name": opp.organization_name,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "requirements": opp.requirements,
        "opportunity_type": opp.opportunity_type,
        "work_mode": opp.work_mode,
        "employment_type": opp.employment_type,
        "experience_level": opp.experience_level,
        "location_text": opp.location_text,
        "city": opp.city,
        "state": opp.state,
        "country": opp.country,
        "application_deadline": opp.application_deadline,
        "salary_min": opp.salary_min,
        "salary_max": opp.salary_max,
        "salary_currency": opp.salary_currency,
        "is_salary_disclosed": opp.is_salary_disclosed,
        "status": opp.status,
        "created_at": opp.created_at,
        "updated_at": opp.updated_at,
        "required_skills": [
            {
                "id": req.id,
                "opportunity_id": req.opportunity_id,
                "skill_id": req.skill_id,
                "skill_name": req.skill.name if req.skill else None,
                "skill_category": req.skill.category.value if req.skill else None,
                "required_score": req.required_score,
                "importance": req.importance,
                "is_required": req.is_required
            }
            for req in (opp.required_skills or [])
        ],
        "applicant_count": len(opp.applications or [])
    }


@router.post("/opportunities/{opportunity_id}/publish", response_model=IndustryOpportunityOut)
async def publish_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Publish opportunity (Enforces organization verification status)."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.publish_opportunity(db, org, current_user.id, opportunity_id)
    return await get_opportunity_detail(opportunity_id, current_user, db)


@router.post("/opportunities/{opportunity_id}/pause", response_model=IndustryOpportunityOut)
async def pause_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Pause published opportunity."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.pause_opportunity(db, org, current_user.id, opportunity_id)
    return await get_opportunity_detail(opportunity_id, current_user, db)


@router.post("/opportunities/{opportunity_id}/resume", response_model=IndustryOpportunityOut)
async def resume_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Resume paused opportunity."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.resume_opportunity(db, org, current_user.id, opportunity_id)
    return await get_opportunity_detail(opportunity_id, current_user, db)


@router.post("/opportunities/{opportunity_id}/close", response_model=IndustryOpportunityOut)
async def close_opportunity(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Close opportunity."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    opp = await IndustryService.close_opportunity(db, org, current_user.id, opportunity_id)
    return await get_opportunity_detail(opportunity_id, current_user, db)


# ==========================================
# APPLICATION & REVIEW MANAGEMENT
# ==========================================

@router.get("/applications", response_model=List[ApplicantSummaryOut])
async def list_applicants(
    opportunity_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    min_match_score: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("applied_at"),
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """List candidate applications submitted to organization opportunities."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.list_applicants(
        db, org.id, opportunity_id, status_filter, min_match_score, search, sort_by
    )


@router.get("/applications/{application_id}", response_model=ApplicantDetailOut)
async def get_applicant_detail(
    application_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed candidate profile, skill scores, Phase 10 match breakdown, and review history."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.get_applicant_detail(db, org.id, application_id)


@router.patch("/applications/{application_id}/status", response_model=ApplicantDetailOut)
async def update_applicant_status(
    application_id: uuid.UUID,
    status_in: ApplicationStatusUpdateIn,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Advance applicant review status in pipeline (UNDER_REVIEW, SHORTLISTED, INTERVIEW, OFFERED, etc.)."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.update_applicant_status(
        db, org.id, current_user.id, application_id, status_in
    )


# ==========================================
# ORGANIZATION PRIVATE INTERNAL NOTES
# ==========================================

@router.get("/applications/{application_id}/notes", response_model=List[InternalNoteOut])
async def list_internal_notes(
    application_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """List internal review notes for an application (Private to organization)."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.list_internal_notes(db, org.id, application_id)


@router.post("/applications/{application_id}/notes", response_model=InternalNoteOut, status_code=status.HTTP_201_CREATED)
async def add_internal_note(
    application_id: uuid.UUID,
    note_in: InternalNoteCreate,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a private internal review note."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    return await IndustryService.add_internal_note(
        db, org.id, current_user.id, current_user.email, application_id, note_in
    )


@router.delete("/applications/{application_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_internal_note(
    application_id: uuid.UUID,
    note_id: uuid.UUID,
    current_user: User = Depends(check_industry_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a private internal review note."""
    org = await IndustryService.get_or_create_industry_profile(db, current_user)
    await IndustryService.delete_internal_note(db, org.id, note_id)
    return None
