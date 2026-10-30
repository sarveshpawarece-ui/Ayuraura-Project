import uuid
import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.doctor_ngo import DoctorProfile
from app.services.doctor_ngo_service import DoctorNGOService
from app.schemas.doctor_ngo import (
    DoctorProfileCreateIn,
    DoctorProfileUpdateIn,
    DoctorProfileOut,
    DoctorVerificationDocumentIn,
    DoctorVerificationDocumentOut,
    DoctorVerificationStatusOut,
    DoctorVerificationSubmitIn,
    ClinicProfileCreateIn,
    ClinicProfileUpdateIn,
    ClinicProfileOut,
    DoctorMessageIn,
    DoctorMessageOut,
    ConversationSummaryOut,
    DoctorSessionCreateIn,
    DoctorSessionRequestIn,
    DoctorSessionStatusUpdateIn,
    DoctorSessionOut,
    DoctorDashboardSummaryOut,
    NGOProfileCreateIn,
    NGOProfileOut
)

router = APIRouter()

# ============================================================
# PHOTO UPLOAD DIRECTORY — stored under backend/uploads/doctor_photos
# ============================================================
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "uploads", "doctor_photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_PHOTO_SIZE_MB = 5

def check_doctor_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user has DOCTOR or ADMIN role."""
    if current_user.role not in [UserRole.DOCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role '{current_user.role.value}' is not authorized to access doctor resources"
        )
    return current_user

def check_ngo_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user has NGO or ADMIN role."""
    if current_user.role not in [UserRole.NGO, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role '{current_user.role.value}' is not authorized to access NGO resources"
        )
    return current_user

def check_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user has ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to platform Administrators"
        )
    return current_user

# ============================================================
# 1. DOCTOR PROFILE ENDPOINTS
# ============================================================

@router.get("/doctors/profile/me", response_model=DoctorProfileOut)
@router.get("/doctor/profile/me", response_model=DoctorProfileOut)
@router.get("/doctors/me/profile", response_model=DoctorProfileOut)
@router.get("/doctor/me/profile", response_model=DoctorProfileOut)
async def get_my_doctor_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.get_doctor_profile_me(db, current_user)


@router.post("/doctors/profile", response_model=DoctorProfileOut)
@router.post("/doctor/profile", response_model=DoctorProfileOut)
async def create_or_update_doctor_profile(
    data: DoctorProfileCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.create_or_update_doctor_profile(db, current_user, data)


@router.put("/doctors/profile/me", response_model=DoctorProfileOut)
@router.put("/doctor/profile/me", response_model=DoctorProfileOut)
async def update_my_doctor_profile(
    data: DoctorProfileUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.update_doctor_profile_partial(db, current_user, data)


@router.get("/doctors/dashboard/summary", response_model=DoctorDashboardSummaryOut)
@router.get("/doctor/dashboard/summary", response_model=DoctorDashboardSummaryOut)
async def get_doctor_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.get_doctor_dashboard_summary(db, current_user)


@router.get("/doctors", response_model=List[DoctorProfileOut])
async def list_doctors(
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    specialization: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    profiles = await DoctorNGOService.list_doctors(db, city, state, specialization, verified_only)
    return [await DoctorNGOService.get_doctor_by_id(db, p.id) for p in profiles]


# ============================================================
# 1b. DOCTOR PROFESSIONAL PHOTO UPLOAD
# ============================================================

@router.post("/doctors/profile/photo", response_model=DoctorProfileOut)
@router.post("/doctor/profile/photo", response_model=DoctorProfileOut)
async def upload_doctor_profile_photo(
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    """Upload or replace the doctor's professional profile photo."""
    # Validate content type
    content_type = photo.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Allowed: JPG, PNG, WebP"
        )

    # Read file and validate size
    file_bytes = await photo.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_PHOTO_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Photo size {size_mb:.1f}MB exceeds maximum {MAX_PHOTO_SIZE_MB}MB"
        )

    # Build unique filename tied to this doctor's user_id
    ext_map = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    ext = ext_map.get(content_type, ".jpg")
    filename = f"doctor_{current_user.id.hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Write to disk
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Update profile_photo_url in DB
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        # Create stub profile
        profile = await DoctorNGOService.get_or_create_doctor_profile(db, current_user)

    photo_url = f"/api/v1/doctor/photos/{filename}"
    profile.profile_photo_url = photo_url
    await db.commit()
    await db.refresh(profile)

    return await DoctorNGOService.get_doctor_profile_me(db, current_user)


@router.delete("/doctors/profile/photo", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/doctor/profile/photo", status_code=status.HTTP_204_NO_CONTENT)
async def remove_doctor_profile_photo(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    """Remove the doctor's professional profile photo."""
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if profile and profile.profile_photo_url:
        # Try to delete the file from disk
        try:
            filename = profile.profile_photo_url.split("/")[-1]
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        profile.profile_photo_url = None
        await db.commit()
    return None


@router.get("/doctor/photos/{filename}")
async def serve_doctor_photo(filename: str):
    """Serve a doctor profile photo."""
    from fastapi.responses import FileResponse
    # Security: only allow filenames matching pattern doctor_<hex>.ext
    import re
    if not re.match(r'^doctor_[a-f0-9]{32}\.(jpg|png|webp)$', filename):
        raise HTTPException(status_code=404, detail="Photo not found")
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(file_path)


# ============================================================
# 2. VERIFICATION & DOCUMENTS ENDPOINTS
# ============================================================

@router.get("/doctors/verification/me", response_model=DoctorVerificationStatusOut)
@router.get("/doctor/verification/me", response_model=DoctorVerificationStatusOut)
async def get_doctor_verification_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.get_doctor_verification_status(db, current_user)


@router.post("/doctors/verification/submit", response_model=DoctorVerificationStatusOut)
@router.post("/doctor/verification/submit", response_model=DoctorVerificationStatusOut)
async def submit_doctor_verification(
    data: DoctorVerificationSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.submit_doctor_verification(db, current_user, data)


@router.post("/doctors/documents", response_model=DoctorVerificationDocumentOut)
@router.post("/doctor/documents", response_model=DoctorVerificationDocumentOut)
async def upload_doctor_document(
    data: DoctorVerificationDocumentIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.upload_doctor_document(db, current_user, data)


@router.delete("/doctors/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    await DoctorNGOService.delete_doctor_document(db, current_user, document_id)
    return None


@router.post("/doctors/{profile_id}/verify", response_model=DoctorProfileOut)
async def verify_doctor(
    profile_id: uuid.UUID,
    approve: bool = Query(True),
    remarks: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin_user)
):
    return await DoctorNGOService.verify_doctor(db, current_user, profile_id, approve, remarks)


# ============================================================
# 3. CLINIC & HOSPITAL MANAGEMENT ENDPOINTS
# ============================================================

@router.get("/doctors/clinics/me", response_model=List[ClinicProfileOut])
@router.get("/doctor/clinics/me", response_model=List[ClinicProfileOut])
@router.get("/doctors/me/clinics", response_model=List[ClinicProfileOut])
@router.get("/doctor/me/clinics", response_model=List[ClinicProfileOut])
@router.get("/doctors/clinics", response_model=List[ClinicProfileOut])
@router.get("/doctor/clinics", response_model=List[ClinicProfileOut])
async def list_my_clinics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.list_doctor_clinics(db, current_user)


@router.post("/doctors/clinics", response_model=ClinicProfileOut)
async def create_clinic(
    data: ClinicProfileCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.create_clinic(db, current_user, data)


@router.put("/doctors/clinics/{clinic_id}", response_model=ClinicProfileOut)
async def update_clinic(
    clinic_id: uuid.UUID,
    data: ClinicProfileUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    return await DoctorNGOService.update_clinic(db, current_user, clinic_id, data)


@router.delete("/doctors/clinics/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clinic(
    clinic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_doctor_user)
):
    await DoctorNGOService.delete_clinic(db, current_user, clinic_id)
    return None


# ============================================================
# 4. MESSAGING ENDPOINTS
# ============================================================

@router.post("/doctors/messages", response_model=DoctorMessageOut)
async def send_message(
    data: DoctorMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.send_doctor_message(db, current_user, data)


@router.get("/doctors/messages/conversations", response_model=List[ConversationSummaryOut])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.list_conversations(db, current_user)


@router.get("/doctors/messages/conversation/{other_user_id}", response_model=List[DoctorMessageOut])
async def get_conversation(
    other_user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.list_conversation(db, current_user.id, other_user_id)


# ============================================================
# 5. SESSIONS ENDPOINTS
# ============================================================

@router.post("/doctors/sessions", response_model=DoctorSessionOut)
async def create_session(
    data: DoctorSessionCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.create_session(db, current_user, data)


@router.post("/doctors/sessions/request", response_model=DoctorSessionOut)
async def request_session(
    data: DoctorSessionRequestIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.request_session(db, current_user, data)


@router.get("/doctors/sessions", response_model=List[DoctorSessionOut])
@router.get("/doctor/sessions", response_model=List[DoctorSessionOut])
@router.get("/doctors/me/sessions", response_model=List[DoctorSessionOut])
@router.get("/doctor/me/sessions", response_model=List[DoctorSessionOut])
async def list_sessions(
    session_status: Optional[str] = Query("ALL", alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.list_sessions(db, current_user, session_status)


@router.put("/doctors/sessions/{session_id}/status", response_model=DoctorSessionOut)
async def update_session_status(
    session_id: uuid.UUID,
    data: DoctorSessionStatusUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DoctorNGOService.update_session_status(db, current_user, session_id, data)


@router.get("/doctors/{doctor_id}", response_model=DoctorProfileOut)
async def get_doctor_public_profile(
    doctor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    return await DoctorNGOService.get_doctor_by_id(db, doctor_id)


# ============================================================
# 6. NGO ENDPOINTS (Preserved)
# ============================================================

@router.get("/ngos/profile/me", response_model=NGOProfileOut)
@router.get("/ngos/profile", response_model=NGOProfileOut)
@router.get("/ngo/profile/me", response_model=NGOProfileOut)
@router.get("/ngo/profile", response_model=NGOProfileOut)
async def get_my_ngo_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_ngo_user)
):
    return await DoctorNGOService.get_ngo_profile_me(db, current_user)


@router.post("/ngos/profile", response_model=NGOProfileOut)
@router.post("/ngo/profile", response_model=NGOProfileOut)
async def update_ngo_profile(
    data: NGOProfileCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_ngo_user)
):
    return await DoctorNGOService.create_or_update_ngo_profile(db, current_user, data)


@router.post("/ngos/{profile_id}/verify", response_model=NGOProfileOut)
async def verify_ngo(
    profile_id: uuid.UUID,
    approve: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_admin_user)
):
    return await DoctorNGOService.verify_ngo(db, current_user, profile_id, approve)


# ============================================================
# 7. INTERNSHIP APPLICATION ALIASES
# ============================================================

from app.services.internship_lifecycle_service import InternshipLifecycleService
from app.schemas.internships import (
    InternshipApplicationOut,
    InternshipRejectIn,
    OfferLetterOut,
    OfferDeclineIn,
    ProgressMilestoneOut,
    ProgressMilestoneUpdateIn,
    InternshipTaskIn,
    InternshipTaskUpdateIn,
    InternshipTaskOut,
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

@router.get("/doctor/applications", response_model=List[InternshipApplicationOut])
async def list_doctor_applications_alias(
    internship_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query("ALL"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_doctor_applications(
        db, current_user, internship_id=internship_id, status_filter=status, search=search
    )


@router.get("/student/applications", response_model=List[InternshipApplicationOut])
async def list_student_applications_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_student_applications(db, current_user)


@router.get("/applications/{app_id}", response_model=InternshipApplicationOut)
async def get_application_details_alias(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_application_by_id(db, current_user, app_id)


@router.post("/applications/{app_id}/shortlist", response_model=InternshipApplicationOut)
async def shortlist_application_alias(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.shortlist_application(db, current_user, app_id)


@router.post("/applications/{app_id}/reject", response_model=InternshipApplicationOut)
async def reject_application_alias(
    app_id: uuid.UUID,
    data: Optional[InternshipRejectIn] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.reject_application(db, current_user, app_id, data)


@router.post("/applications/{app_id}/withdraw", response_model=InternshipApplicationOut)
async def withdraw_application_alias(
    app_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.withdraw_application(db, current_user, app_id)


# ============================================================
# PHASE 5 — OFFERS, ATTENDANCE, MILESTONES & TASKS DIRECT ROUTES
# ============================================================

@router.get("/doctor/offers", response_model=List[OfferLetterOut])
async def list_doctor_offers_alias(
    status: Optional[str] = Query("ALL"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_doctor_offers(db, current_user, status)


@router.get("/student/offers", response_model=List[OfferLetterOut])
async def list_student_offers_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.list_student_offers(db, current_user)


@router.get("/offers/{offer_id}", response_model=OfferLetterOut)
async def get_offer_detail_alias(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_offer_by_id(db, current_user, offer_id)


@router.post("/offers/{offer_id}/accept", response_model=OfferLetterOut)
async def accept_offer_alias(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.accept_offer(db, current_user, offer_id)


@router.post("/offers/{offer_id}/decline", response_model=OfferLetterOut)
async def decline_offer_alias(
    offer_id: uuid.UUID,
    data: Optional[OfferDeclineIn] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.decline_offer(db, current_user, offer_id, data)


@router.post("/offers/{offer_id}/cancel", response_model=OfferLetterOut)
async def cancel_offer_alias(
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.cancel_offer(db, current_user, offer_id)


@router.put("/milestones/{milestone_id}", response_model=ProgressMilestoneOut)
async def update_milestone_alias(
    milestone_id: uuid.UUID,
    data: ProgressMilestoneUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.update_milestone(db, current_user, milestone_id, data)


@router.post("/milestones/{milestone_id}/tasks", response_model=InternshipTaskOut)
async def add_milestone_task_alias(
    milestone_id: uuid.UUID,
    data: InternshipTaskIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.create_task(db, current_user, milestone_id, data)


@router.put("/tasks/{task_id}", response_model=InternshipTaskOut)
async def update_task_alias(
    task_id: uuid.UUID,
    data: InternshipTaskUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.update_task(db, current_user, task_id, data)


# ============================================================
# PHASE 6 ALIASES: COMPLETION, CERTIFICATES, FEEDBACK & ANALYTICS
# ============================================================

@router.post("/doctor/internships/complete/{app_id}", response_model=InternshipCertificateOut)
async def doctor_complete_rotation_alias(
    app_id: uuid.UUID,
    data: CompleteInternshipIn = CompleteInternshipIn(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.complete_internship(db, current_user, app_id, data)


@router.get("/doctor/internships/analytics", response_model=DoctorInternshipAnalyticsOut)
async def get_doctor_analytics_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_doctor_analytics(db, current_user)


@router.get("/doctor/internships/history", response_model=List[InternshipHistoryItemOut])
async def get_doctor_history_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_internship_history(db, current_user, "DOCTOR")


@router.get("/student/internships/history", response_model=List[InternshipHistoryItemOut])
async def get_student_history_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await InternshipLifecycleService.get_internship_history(db, current_user, "STUDENT")


@router.get("/certificates/verify/{certificate_token}", response_model=CertificatePublicVerifyOut)
async def public_verify_certificate_alias(
    certificate_token: str,
    db: AsyncSession = Depends(get_db)
):
    return await InternshipLifecycleService.verify_certificate_public(db, certificate_token)



