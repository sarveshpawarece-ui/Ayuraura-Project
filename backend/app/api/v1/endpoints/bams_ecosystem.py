import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.bams_ecosystem_service import bams_ecosystem_service
from app.schemas.bams_ecosystem import (
    BamsCaseStudyCreate,
    BamsCaseStudyOut,
    DoctorGuidanceRequestCreate,
    DoctorGuidanceRequestUpdateStatus,
    DoctorGuidanceRequestOut,
    StudentTimetablePreferenceCreate,
    StudentTimetablePreferenceOut,
    RemediationCompletionRequest,
    RemediationCompletionResponse,
    EcosystemPipelineStatusOut
)

router = APIRouter()

# ============================================================
# 1. ECOSYSTEM PIPELINE & WEAK TOPICS
# ============================================================

@router.get("/pipeline", response_model=EcosystemPipelineStatusOut)
async def get_ecosystem_pipeline(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve 11-stage connected pipeline status for student."""
    return await bams_ecosystem_service.get_pipeline_status(db, current_user)

@router.get("/weak-topics")
async def get_student_weak_topics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect student's weak areas from quiz, assessments and cases."""
    return await bams_ecosystem_service.get_weak_topics(db, current_user)

@router.post("/remediation/complete", response_model=RemediationCompletionResponse)
async def complete_remediation(
    payload: RemediationCompletionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit post-remediation quiz results, dynamically recalculate StudentSkill and topic performance."""
    return await bams_ecosystem_service.complete_topic_remediation(db, current_user, payload)

# ============================================================
# 2. EDUCATIONAL CASE STUDIES & DUPLICATE PREVENTION
# ============================================================

@router.post("/cases", response_model=BamsCaseStudyOut, status_code=status.HTTP_201_CREATED)
async def submit_case_study(
    payload: BamsCaseStudyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Doctor or verified faculty submits educational case study with automated duplicate hash check."""
    return await bams_ecosystem_service.create_case_study(db, current_user, payload)

@router.get("/cases", response_model=List[BamsCaseStudyOut])
async def list_case_studies(
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Browse verified educational clinical case studies with Ayurvedic assessment."""
    return await bams_ecosystem_service.get_case_studies(db, subject, difficulty)

# ============================================================
# 3. INSTITUTION TO DOCTOR GUIDANCE REQUESTS
# ============================================================

@router.post("/guidance-requests", response_model=DoctorGuidanceRequestOut, status_code=status.HTTP_201_CREATED)
async def create_guidance_request(
    payload: DoctorGuidanceRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Institution invites a Doctor for guidance session (Free or Paid, Online or Offline)."""
    return await bams_ecosystem_service.create_guidance_request(db, current_user, payload)

@router.get("/guidance-requests", response_model=List[DoctorGuidanceRequestOut])
async def list_guidance_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve guidance requests."""
    return await bams_ecosystem_service.get_guidance_requests(db, current_user)

@router.patch("/guidance-requests/{request_id}/status", response_model=DoctorGuidanceRequestOut)
async def update_guidance_request_status(
    request_id: uuid.UUID,
    payload: DoctorGuidanceRequestUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Doctor accepts or rejects the institution guidance invitation."""
    return await bams_ecosystem_service.update_guidance_request_status(db, request_id, current_user, payload)

# ============================================================
# 4. SMART TIMETABLE SCHEDULE
# ============================================================

@router.get("/timetable/preferences", response_model=StudentTimetablePreferenceOut)
async def get_timetable_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student timetable constraints (college, internship, sleep, fitness)."""
    return await bams_ecosystem_service.get_or_create_timetable_pref(db, current_user)

@router.put("/timetable/preferences", response_model=StudentTimetablePreferenceOut)
async def update_timetable_preferences(
    payload: StudentTimetablePreferenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save student timetable preferences."""
    return await bams_ecosystem_service.update_timetable_pref(db, current_user, payload)
