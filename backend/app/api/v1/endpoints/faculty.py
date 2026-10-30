from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.services.faculty_service import FacultyService
from app.schemas.faculty import (
    FacultyProfileOut,
    FacultyProfileUpdateIn,
    FacultyDashboardOut,
    EducationalResourceCreateIn,
    EducationalResourceUpdateIn,
    EducationalResourceOut,
    ResourceWorkflowUpdateIn,
    LectureScheduleCreateIn,
    LectureScheduleUpdateIn,
    LectureScheduleOut
)

router = APIRouter()

# Guard: Faculty, Admin, or Doctor acting as educator
faculty_role_guard = RoleChecker([UserRole.FACULTY, UserRole.ADMIN, UserRole.DOCTOR])
student_or_faculty_guard = RoleChecker([UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.DOCTOR])


# =============================================================
# 1. FACULTY DASHBOARD & PROFILE
# =============================================================

@router.get("/dashboard", response_model=FacultyDashboardOut)
async def get_faculty_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.get_dashboard(db, current_user)


@router.get("/profile", response_model=FacultyProfileOut)
async def get_faculty_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    profile = await FacultyService.get_or_create_faculty_profile(db, current_user)
    inst_name = profile.institution.institution_name if profile.institution else "Ayurvedic Institution"
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "institution_id": str(profile.institution_id),
        "institution_name": inst_name,
        "full_name": profile.full_name,
        "name_prefix": profile.name_prefix,
        "first_name": profile.first_name,
        "middle_name": profile.middle_name,
        "last_name": profile.last_name,
        "department": profile.department,
        "designation": profile.designation,
        "qualifications": profile.qualifications,
        "specialization": profile.specialization,
        "assigned_subjects": profile.assigned_subjects or [],
        "assigned_academic_years": profile.assigned_academic_years or [],
        "contact_email": profile.contact_email or current_user.email,
        "contact_phone": profile.contact_phone,
        "bio": profile.bio,
        "is_active": profile.is_active,
        "created_at": profile.created_at
    }


@router.patch("/profile", response_model=FacultyProfileOut)
async def update_faculty_profile(
    update_data: FacultyProfileUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.update_profile(db, current_user, update_data)


# =============================================================
# 2. EDUCATIONAL RESOURCE SHARING (PHASE 3)
# =============================================================

@router.post("/resources", response_model=EducationalResourceOut, status_code=status.HTTP_201_CREATED)
async def create_educational_resource(
    resource_data: EducationalResourceCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.create_resource(db, current_user, resource_data)


@router.get("/resources", response_model=List[EducationalResourceOut])
async def get_faculty_resources(
    academic_year: Optional[str] = Query(None),
    subject_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.get_faculty_resources(
        db=db,
        user=current_user,
        academic_year=academic_year,
        subject_id=subject_id,
        resource_type=resource_type
    )


@router.put("/resources/{id}")
async def update_educational_resource(
    id: str,
    update_data: EducationalResourceUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.update_resource(db, current_user, id, update_data)


@router.patch("/resources/{id}/workflow")
async def update_resource_workflow_status(
    id: str,
    workflow_data: ResourceWorkflowUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    """
    Transition educational resource through review workflow:
    DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PUBLISHED / REJECTED / ARCHIVED.
    """
    return await FacultyService.update_resource_workflow(
        db=db,
        user=current_user,
        resource_id=id,
        workflow_status=workflow_data.workflow_status,
        reviewer_feedback=workflow_data.reviewer_feedback
    )


@router.delete("/resources/{id}")
async def delete_educational_resource(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.delete_resource(db, current_user, id)


# =============================================================
# 3. LECTURE & SESSION MANAGEMENT (PHASE 4)
# =============================================================

@router.post("/lectures", response_model=LectureScheduleOut, status_code=status.HTTP_201_CREATED)
async def schedule_lecture(
    lecture_data: LectureScheduleCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.schedule_lecture(db, current_user, lecture_data)


@router.get("/lectures", response_model=List[LectureScheduleOut])
async def get_faculty_lectures(
    academic_year: Optional[str] = Query(None),
    subject_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.get_lectures(
        db=db,
        user=current_user,
        academic_year=academic_year,
        subject_id=subject_id
    )


@router.put("/lectures/{id}")
async def update_lecture_schedule(
    id: str,
    update_data: LectureScheduleUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.update_lecture(db, current_user, id, update_data)


@router.delete("/lectures/{id}")
async def delete_lecture_schedule(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.delete_lecture(db, current_user, id)


# =============================================================
# 4. STUDENT LEARNING ACTIVITIES & PRIVACY-COMPLIANT ROSTER
# =============================================================

@router.get("/students")
async def get_class_students_roster(
    academic_year: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(faculty_role_guard)
):
    return await FacultyService.get_class_roster(db, current_user, academic_year)


# =============================================================
# 5. STUDENT INSTITUTIONAL ACCESS (STUDENTS VIEW FACULTY MATERIALS & LECTURES)
# =============================================================

@router.get("/student-resources", response_model=List[EducationalResourceOut])
async def get_student_institutional_resources(
    subject_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_or_faculty_guard)
):
    return await FacultyService.get_student_institutional_resources(db, current_user, subject_id)


@router.get("/student-lectures", response_model=List[LectureScheduleOut])
async def get_student_institutional_lectures(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_or_faculty_guard)
):
    return await FacultyService.get_student_institutional_lectures(db, current_user)
