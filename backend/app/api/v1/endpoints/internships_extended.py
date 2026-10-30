import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.services.internship_lifecycle_service import InternshipLifecycleService
from app.schemas.internships import (
    InternshipPostingCreateIn,
    InternshipPostingUpdateIn,
    InternshipPostingOut,
    DoctorInternshipSummaryOut,
    InternshipApplyIn,
    InternshipApplicationOut,
    InternshipReviewIn,
    InternshipRejectIn,
    OfferLetterCreateIn,
    OfferLetterOut,
    OfferDeclineIn,
    LogAttendanceIn,
    AttendanceLogOut,
    AttendanceSummaryOut,
    ProgressMilestoneIn,
    ProgressMilestoneUpdateIn,
    ProgressMilestoneOut,
    InternshipTaskIn,
    InternshipTaskUpdateIn,
    InternshipTaskOut,
    InternshipFullProgressOut,
    InternshipCertificateOut,
    CertificatePublicVerifyOut,
    SupervisorFeedbackIn,
    SupervisorFeedbackOut,
    StudentFeedbackIn,
    StudentFeedbackOut,
    CompleteInternshipIn,
    DoctorInternshipAnalyticsOut,
    InternshipHistoryItemOut
)

router = APIRouter()

# ============================================================
# PHASE 3 — INTERNSHIP POSTINGS CRUD & DISCOVERY
# ============================================================

@router.post("", response_model=InternshipPostingOut, status_code=status.HTTP_201_CREATED)
async def create_internship(
    data: InternshipPostingCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.create_posting(db, current_user, data)


@router.get("", response_model=List[InternshipPostingOut])
async def list_public_internships(
    search: Optional[str] = None,
    specialization: Optional[str] = None,
    internship_type: Optional[str] = None,
    mode: Optional[str] = None,
    location_city: Optional[str] = None,
    location_state: Optional[str] = None,
    duration_months: Optional[int] = None,
    stipend_min: Optional[float] = None,
    course: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await InternshipLifecycleService.list_postings(
        db=db,
        search=search,
        specialization=specialization,
        internship_type=internship_type,
        mode=mode,
        location_city=location_city,
        location_state=location_state,
        duration_months=duration_months,
        stipend_min=stipend_min,
        course=course,
        status="PUBLISHED"
    )


@router.get("/doctor/me", response_model=List[DoctorInternshipSummaryOut])
async def list_doctor_internships(
    status: Optional[str] = "ALL",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_doctor_postings(db, current_user, status)


@router.get("/doctor/applications", response_model=List[InternshipApplicationOut])
@router.get("/applications/doctor/me", response_model=List[InternshipApplicationOut])
async def list_doctor_applications(
    internship_id: Optional[uuid.UUID] = None,
    status: Optional[str] = "ALL",
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_doctor_applications(
        db=db,
        doctor_user=current_user,
        internship_id=internship_id,
        status_filter=status,
        search=search
    )


@router.get("/applications/me", response_model=List[InternshipApplicationOut])
async def list_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_student_applications(db, current_user)


@router.get("/applications/{app_id}", response_model=InternshipApplicationOut)
async def get_application_details(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_application_by_id(db, current_user, app_id)


@router.get("/{posting_id}", response_model=InternshipPostingOut)
async def get_internship_detail(
    posting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await InternshipLifecycleService.get_posting_by_id(db, posting_id)


@router.put("/{posting_id}", response_model=InternshipPostingOut)
async def update_internship(
    posting_id: uuid.UUID,
    data: InternshipPostingUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.update_posting(db, current_user, posting_id, data)


@router.delete("/{posting_id}", status_code=status.HTTP_200_OK)
async def delete_internship(
    posting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.delete_posting(db, current_user, posting_id)


@router.post("/{posting_id}/publish", response_model=InternshipPostingOut)
async def publish_internship(
    posting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.publish_posting(db, current_user, posting_id)


@router.post("/{posting_id}/close", response_model=InternshipPostingOut)
async def close_internship(
    posting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.close_posting(db, current_user, posting_id)


@router.post("/{posting_id}/cancel", response_model=InternshipPostingOut)
async def cancel_internship(
    posting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.cancel_posting(db, current_user, posting_id)


# ============================================================
# PHASE 4 — APPLICATIONS & SHORTLISTING
# ============================================================

@router.post("/{posting_id}/apply", response_model=InternshipApplicationOut)
async def apply_internship(
    posting_id: uuid.UUID,
    data: InternshipApplyIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.apply_internship(db, current_user, posting_id, data)


@router.post("/applications/{app_id}/shortlist", response_model=InternshipApplicationOut)
async def shortlist_candidate(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.shortlist_application(db, current_user, app_id)


@router.post("/applications/{app_id}/reject", response_model=InternshipApplicationOut)
async def reject_candidate(
    app_id: uuid.UUID,
    data: Optional[InternshipRejectIn] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.reject_application(db, current_user, app_id, data)


@router.post("/applications/{app_id}/withdraw", response_model=InternshipApplicationOut)
async def withdraw_candidate_application(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.withdraw_application(db, current_user, app_id)


# ============================================================
# PHASE 5 — OFFERS, ATTENDANCE, MILESTONES & TASKS
# ============================================================

# Offers
@router.post("/applications/{app_id}/offer", response_model=OfferLetterOut)
@router.post("/{posting_id}/offers", response_model=OfferLetterOut)
async def issue_offer_letter(
    app_id: Optional[uuid.UUID] = None,
    posting_id: Optional[uuid.UUID] = None,
    application_id: Optional[uuid.UUID] = Query(None),
    data: OfferLetterCreateIn = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_app_id = app_id or application_id
    if not target_app_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="application_id is required")
    return await InternshipLifecycleService.issue_offer(db, current_user, target_app_id, data)


@router.get("/doctor/offers", response_model=List[OfferLetterOut])
@router.get("/offers/doctor/me", response_model=List[OfferLetterOut])
async def get_doctor_offers(
    status: Optional[str] = "ALL",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_doctor_offers(db, current_user, status)


@router.get("/student/offers", response_model=List[OfferLetterOut])
@router.get("/offers/student/me", response_model=List[OfferLetterOut])
async def get_student_offers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_student_offers(db, current_user)


@router.get("/offers/{offer_id}", response_model=OfferLetterOut)
async def get_offer_detail_extended(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_offer_by_id(db, current_user, offer_id)


@router.post("/offers/{offer_id}/accept", response_model=OfferLetterOut)
async def accept_offer_extended(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.accept_offer(db, current_user, offer_id)


@router.post("/offers/{offer_id}/decline", response_model=OfferLetterOut)
async def decline_offer_extended(
    offer_id: uuid.UUID,
    data: Optional[OfferDeclineIn] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.decline_offer(db, current_user, offer_id, data)


@router.post("/offers/{offer_id}/cancel", response_model=OfferLetterOut)
async def cancel_offer_extended(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.cancel_offer(db, current_user, offer_id)


@router.put("/milestones/{milestone_id}", response_model=ProgressMilestoneOut)
async def update_milestone_extended(
    milestone_id: uuid.UUID,
    data: ProgressMilestoneUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.update_milestone(db, current_user, milestone_id, data)


@router.post("/milestones/{milestone_id}/tasks", response_model=InternshipTaskOut)
async def add_milestone_task_extended(
    milestone_id: uuid.UUID,
    data: InternshipTaskIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.create_task(db, current_user, milestone_id, data)


@router.put("/tasks/{task_id}", response_model=InternshipTaskOut)
async def update_task_extended(
    task_id: uuid.UUID,
    data: InternshipTaskUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.update_task(db, current_user, task_id, data)


# Attendance
@router.post("/applications/{app_id}/attendance", response_model=AttendanceLogOut)
@router.post("/{posting_id}/attendance", response_model=AttendanceLogOut)
async def record_attendance(
    app_id: Optional[uuid.UUID] = None,
    posting_id: Optional[uuid.UUID] = None,
    application_id: Optional[uuid.UUID] = Query(None),
    data: LogAttendanceIn = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_app_id = app_id or application_id
    if not target_app_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="application_id is required")
    return await InternshipLifecycleService.log_attendance(db, current_user, target_app_id, data)


@router.get("/applications/{app_id}/attendance", response_model=AttendanceSummaryOut)
@router.get("/{posting_id}/attendance", response_model=AttendanceSummaryOut)
async def view_attendance(
    app_id: Optional[uuid.UUID] = None,
    posting_id: Optional[uuid.UUID] = None,
    application_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_app_id = app_id or application_id
    if not target_app_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="application_id is required")
    return await InternshipLifecycleService.get_attendance_summary(db, current_user, target_app_id)


# Milestones & Tasks
@router.post("/applications/{app_id}/milestones", response_model=ProgressMilestoneOut)
@router.post("/{posting_id}/milestones", response_model=ProgressMilestoneOut)
async def add_milestone(
    app_id: Optional[uuid.UUID] = None,
    posting_id: Optional[uuid.UUID] = None,
    application_id: Optional[uuid.UUID] = Query(None),
    data: ProgressMilestoneIn = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_app_id = app_id or application_id
    if not target_app_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="application_id is required")
    return await InternshipLifecycleService.create_milestone(db, current_user, target_app_id, data)


@router.get("/applications/{app_id}/progress", response_model=InternshipFullProgressOut)
async def view_full_progress(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_full_progress(db, current_user, app_id)


# ============================================================
# PHASE 6 — COMPLETION, CERTIFICATES, FEEDBACK & ANALYTICS
# ============================================================

@router.post("/applications/{app_id}/complete", response_model=InternshipCertificateOut)
async def complete_rotation(
    app_id: uuid.UUID,
    data: CompleteInternshipIn = CompleteInternshipIn(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.complete_internship(db, current_user, app_id, data)


@router.get("/applications/{app_id}/certificate", response_model=InternshipCertificateOut)
async def get_rotation_certificate(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_certificate_by_application_id(db, current_user, app_id)


@router.get("/certificates/verify/{certificate_token}", response_model=CertificatePublicVerifyOut)
@router.get("/verify/{certificate_token}", response_model=CertificatePublicVerifyOut)
async def verify_certificate_public_route(
    certificate_token: str,
    db: AsyncSession = Depends(get_db)
):
    return await InternshipLifecycleService.verify_certificate_public(db, certificate_token)


@router.post("/applications/{app_id}/feedback/doctor", response_model=SupervisorFeedbackOut)
async def submit_doctor_evaluation(
    app_id: uuid.UUID,
    data: SupervisorFeedbackIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.submit_doctor_feedback(db, current_user, app_id, data)


@router.get("/applications/{app_id}/feedback/doctor", response_model=SupervisorFeedbackOut)
async def get_doctor_evaluation(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_doctor_feedback(db, current_user, app_id)


@router.post("/applications/{app_id}/feedback/student", response_model=StudentFeedbackOut)
async def submit_student_rotation_feedback(
    app_id: uuid.UUID,
    data: StudentFeedbackIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.submit_student_feedback(db, current_user, app_id, data)


@router.get("/applications/{app_id}/feedback/student", response_model=StudentFeedbackOut)
async def get_student_rotation_feedback(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_student_feedback(db, current_user, app_id)


@router.get("/doctor/analytics", response_model=DoctorInternshipAnalyticsOut)
async def get_doctor_internship_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_doctor_analytics(db, current_user)


@router.get("/doctor/history", response_model=List[InternshipHistoryItemOut])
async def get_doctor_internship_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_internship_history(db, current_user, "DOCTOR")


@router.get("/student/history", response_model=List[InternshipHistoryItemOut])
async def get_student_internship_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_internship_history(db, current_user, "STUDENT")
