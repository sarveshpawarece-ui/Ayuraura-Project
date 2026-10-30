from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_current_user, RoleChecker
from app.core.database import get_db
from app.models.domain import ApplicationStatus, StudentProfile
from app.models.user import User, UserRole
from app.schemas.application import (
    ApplicationCreateReq,
    ApplicationDetailsUpdateReq,
    ApplicationListReportOut,
    ApplicationMarkAppliedReq,
    ApplicationOut,
    ApplicationStatusUpdateReq,
    ApplicationSummaryOut,
    ApplicationAnalyticsOut,
    ApplicationWithdrawReq,
)
from app.services.application_service import application_service

router = APIRouter()


async def get_student_profile_id(current_user: User, db: AsyncSession) -> UUID:
    stmt = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    sp = res.scalar_one_or_none()
    if not sp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete your profile first."
        )
    return sp.id


# =============================================================
# STUDENT APPLICATION MANAGEMENT ENDPOINTS (/students/me/applications)
# =============================================================

@router.get("/students/me/applications/summary", response_model=ApplicationSummaryOut)
async def get_application_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.get_summary(db, student_id)


@router.get("/students/me/applications/analytics", response_model=ApplicationAnalyticsOut)
async def get_application_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.get_analytics(db, student_id)


@router.get("/students/me/applications", response_model=ApplicationListReportOut)
@router.get("/applications/my-applications", response_model=ApplicationListReportOut)
async def list_student_applications(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    type: Optional[str] = Query(None, description="Filter by opportunity type"),
    min_match: Optional[float] = Query(None, ge=0.0, le=100.0, description="Min match score snapshot"),
    search: Optional[str] = Query(None, description="Search in title, organization, or notes"),
    sort: Optional[str] = Query("recently_updated", description="recently_updated, recently_applied, deadline_soon, highest_match, newest, oldest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.list_applications(
        db=db,
        student_profile_id=student_id,
        status_filter=status,
        type_filter=type,
        min_match=min_match,
        search=search,
        sort=sort,
        page=page,
        page_size=page_size
    )


@router.post("/students/me/applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
@router.post("/applications/apply", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def create_application(
    req: ApplicationCreateReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.create_application(db, student_id, req)


@router.get("/students/me/applications/{id}", response_model=ApplicationOut)
async def get_application_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.get_application_detail(db, student_id, id)


@router.post("/students/me/applications/{id}/mark-applied", response_model=ApplicationOut)
async def mark_application_as_applied(
    id: UUID,
    req: ApplicationMarkAppliedReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.mark_as_applied(db, student_id, id, req)


@router.post("/students/me/applications/{id}/withdraw", response_model=ApplicationOut)
async def withdraw_application(
    id: UUID,
    req: ApplicationWithdrawReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.withdraw_application(db, student_id, id, req)


@router.patch("/students/me/applications/{id}/status", response_model=ApplicationOut)
async def update_application_status(
    id: UUID,
    req: ApplicationStatusUpdateReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.update_status(db, student_id, id, req)


@router.patch("/students/me/applications/{id}", response_model=ApplicationOut)
async def update_application_details(
    id: UUID,
    req: ApplicationDetailsUpdateReq,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.update_application_details(db, student_id, id, req)


@router.delete("/students/me/applications/{id}")
async def delete_saved_application(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    student_id = await get_student_profile_id(current_user, db)
    return await application_service.delete_saved(db, student_id, id)
