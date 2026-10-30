import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.camp_service import CampService
from app.schemas.camps import (
    CampCreateIn,
    CampUpdateIn,
    CampOut,
    CampRegisterAttendeeIn,
    CampAttendeeOut,
    VolunteerApplyIn,
    VolunteerApplicationOut,
    VolunteerReviewIn,
    AttendanceLogItemIn,
    AttendanceRecordOut,
    CampCertificateOut,
    FinalCampReportIn,
    FinalCampReportOut
)

router = APIRouter()

@router.post("", response_model=CampOut, status_code=status.HTTP_201_CREATED)
async def create_camp(
    data: CampCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.create_camp(db, current_user, data)

@router.get("", response_model=List[CampOut])
async def list_camps(
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    service: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await CampService.list_camps(db, city, state, status, service, search)

@router.get("/{camp_id}", response_model=CampOut)
async def get_camp(
    camp_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await CampService.get_camp(db, camp_id)

@router.post("/{camp_id}/register-attendee", response_model=CampAttendeeOut)
async def register_attendee(
    camp_id: uuid.UUID,
    data: CampRegisterAttendeeIn,
    db: AsyncSession = Depends(get_db)
):
    return await CampService.register_attendee(db, camp_id, data)

@router.post("/{camp_id}/volunteer", response_model=VolunteerApplicationOut)
async def apply_volunteer(
    camp_id: uuid.UUID,
    data: VolunteerApplyIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.apply_volunteer(db, current_user, camp_id, data)

@router.patch("/volunteers/{app_id}/review", response_model=VolunteerApplicationOut)
async def review_volunteer(
    app_id: uuid.UUID,
    data: VolunteerReviewIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.review_volunteer(db, current_user, app_id, data)

@router.post("/{camp_id}/attendance", response_model=AttendanceRecordOut)
async def record_attendance(
    camp_id: uuid.UUID,
    data: AttendanceLogItemIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.record_attendance(db, current_user, camp_id, data)

@router.post("/{camp_id}/certificates/issue", response_model=CampCertificateOut)
async def issue_certificate(
    camp_id: uuid.UUID,
    user_id: uuid.UUID = Query(...),
    recipient_name: str = Query(...),
    role_performed: str = Query("Volunteer"),
    hours: float = Query(6.0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.issue_certificate(db, current_user, camp_id, user_id, recipient_name, role_performed, hours)

@router.post("/{camp_id}/final-report", response_model=FinalCampReportOut)
async def submit_final_report(
    camp_id: uuid.UUID,
    data: FinalCampReportIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CampService.submit_final_report(db, current_user, camp_id, data)
