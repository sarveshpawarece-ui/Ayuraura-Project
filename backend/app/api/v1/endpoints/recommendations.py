import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.schemas.recommendation import (
    LearningResourceOut,
    RecommendationItemOut,
    StudentRecommendationsReportOut
)
from app.services.recommendation_service import recommendation_service
from app.services.student_profile_service import student_profile_service

router = APIRouter()

@router.get("/students/me/recommendations", response_model=StudentRecommendationsReportOut)
@router.get("/recommendations/students/me", response_model=StudentRecommendationsReportOut)
async def get_my_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Get personalized learning recommendations generated from Phase 7 skill gaps.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await recommendation_service.generate_recommendations(db, profile.id)


@router.get("/students/me/recommendations/{recommendation_id}", response_model=RecommendationItemOut)
async def get_my_recommendation_detail(
    recommendation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Get detail for a specific recommendation.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await recommendation_service.get_recommendation_detail(db, profile.id, recommendation_id)


@router.post("/students/me/recommendations/{recommendation_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_my_recommendation(
    recommendation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    """
    Dismiss a recommendation.
    """
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    await recommendation_service.dismiss_recommendation(db, profile.id, recommendation_id)
    return None


@router.get("/learning-resources", response_model=List[LearningResourceOut])
async def list_learning_resources(
    skill_id: Optional[uuid.UUID] = Query(None, description="Filter by skill ID"),
    career_role_id: Optional[uuid.UUID] = Query(None, description="Filter by career role ID"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type (COURSE, CERTIFICATION, PROJECT, WORKSHOP)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Catalog listing of active learning resources.
    """
    return await recommendation_service.get_learning_resources(
        db, skill_id=skill_id, career_role_id=career_role_id, resource_type=resource_type
    )
