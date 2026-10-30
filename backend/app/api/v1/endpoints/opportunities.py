import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.schemas.opportunity import (
    IndustryOpportunityOut,
    OpportunityMatchItemOut,
    StudentOpportunitiesReportOut
)
from app.schemas.matching import RecalculateMatchesRequest, OpportunityCandidateMatrixOut
from app.services.matching_engine import matching_engine
from app.services.opportunity_matching_service import opportunity_matching_service
from app.services.opportunity_service import opportunity_service
from app.services.student_profile_service import student_profile_service


router = APIRouter()


@router.get("/students/me/opportunities", response_model=StudentOpportunitiesReportOut)
async def get_my_personalized_opportunities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Get personalized industry opportunity matches generated from target career, skill profile, and skill gaps.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await opportunity_matching_service.generate_opportunity_matches(db, profile.id)


@router.get("/students/me/opportunities/{opportunity_id}", response_model=OpportunityMatchItemOut)
async def get_my_opportunity_match_detail(
    opportunity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Get detailed match breakdown for a specific opportunity.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await opportunity_matching_service.get_opportunity_match_detail(db, profile.id, opportunity_id)


@router.post("/students/me/opportunities/{opportunity_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_my_opportunity_match(
    opportunity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Dismiss an opportunity match.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    await opportunity_matching_service.dismiss_opportunity_match(db, profile.id, opportunity_id)
    return None


@router.post("/students/me/opportunities/recalculate", response_model=StudentOpportunitiesReportOut)
async def recalculate_my_opportunity_matches(
    req: Optional[RecalculateMatchesRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Force recalculate student opportunity matches using the Advanced Matching Engine with optional weight customization.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    weights = req.weights if req else None
    return await matching_engine.evaluate_student_matches(db, profile.id, weights)


@router.get("/opportunities/{opportunity_id}/candidate-matches", response_model=OpportunityCandidateMatrixOut)
async def get_opportunity_candidate_rankings(
    opportunity_id: uuid.UUID,
    top_n: int = Query(50, ge=1, le=200, description="Top N candidates to retrieve"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.INDUSTRY, UserRole.FACULTY, UserRole.INSTITUTION, UserRole.ADMIN]))
):
    """
    Rank candidate students for an industry opportunity using the Advanced Matching Engine (Industry/Faculty view).
    """
    return await matching_engine.rank_candidates_for_opportunity(db, opportunity_id, top_n)



@router.get("/opportunities", response_model=List[IndustryOpportunityOut])
async def list_industry_opportunities(
    opportunity_type: Optional[str] = Query(None, description="Filter by type (JOB, INTERNSHIP, RESEARCH, PROJECT)"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode (ONSITE, REMOTE, HYBRID)"),
    experience_level: Optional[str] = Query(None, description="Filter by level (STUDENT, FRESHER, ENTRY)"),
    career_role_id: Optional[uuid.UUID] = Query(None, description="Filter by career role ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Public/General catalog view of active industry opportunities.
    """
    return await opportunity_service.list_opportunities(
        db,
        opportunity_type=opportunity_type,
        work_mode=work_mode,
        experience_level=experience_level,
        career_role_id=career_role_id
    )


@router.get("/opportunities/{opportunity_id}", response_model=IndustryOpportunityOut)
async def get_industry_opportunity_detail(
    opportunity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Public detail view of an industry opportunity.
    """
    return await opportunity_service.get_opportunity(db, opportunity_id)
