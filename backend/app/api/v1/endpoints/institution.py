from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.domain import VerificationStatus
from app.api.deps import get_current_user, RoleChecker
from app.services.institution_service import InstitutionService
from app.schemas.institution import (
    InstitutionProfileOut,
    InstitutionProfileUpdate,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentOut,
    StudentMembershipInviteIn,
    StudentMembershipUpdateIn,
    StudentSummaryOut,
    StudentDetailOut,
    InstitutionOpportunityOut,
    InstitutionApplicationOut,
    InstitutionDashboardSummaryOut,
    InstitutionAnalyticsOut,
    InstitutionVerificationSubmitIn,
    InstitutionVerificationStatusOut,
    InstitutionInvitationCreateIn,
    InstitutionInvitationOut
)
from app.schemas.faculty import FacultySubjectAssignIn

router = APIRouter()

# Role Guard: INSTITUTION or ADMIN
institution_role_guard = RoleChecker([UserRole.INSTITUTION, UserRole.ADMIN])

async def check_institution_verification(db: AsyncSession, user_id: str) -> str:
    profile = await InstitutionService.get_profile_by_user(db, user_id)
    if profile.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Institution verification status is {profile.verification_status}. Full student analytics requires VERIFIED status."
        )
    return str(profile.id)


@router.get("/dashboard", response_model=InstitutionDashboardSummaryOut)
async def get_institution_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    summary = await InstitutionService.get_dashboard_summary(db, str(profile.id))
    return summary


@router.get("/profile", response_model=InstitutionProfileOut)
async def get_institution_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return profile


@router.patch("/profile", response_model=InstitutionProfileOut)
async def update_institution_profile(
    update_data: InstitutionProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    updated = await InstitutionService.update_profile(db, str(current_user.id), update_data)
    return updated


# --- DEPARTMENT MANAGEMENT ---
@router.get("/departments", response_model=List[DepartmentOut])
async def get_departments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.get_departments(db, str(profile.id))


@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
async def create_department(
    dept_data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    dept = await InstitutionService.create_department(db, str(profile.id), dept_data)
    return {
        "id": str(dept.id),
        "institution_id": str(dept.institution_id),
        "name": dept.name,
        "code": dept.code,
        "description": dept.description,
        "is_active": dept.is_active,
        "created_at": dept.created_at
    }


@router.patch("/departments/{id}", response_model=DepartmentOut)
async def update_department(
    id: str,
    dept_data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    dept = await InstitutionService.update_department(db, str(profile.id), id, dept_data)
    return {
        "id": str(dept.id),
        "institution_id": str(dept.institution_id),
        "name": dept.name,
        "code": dept.code,
        "description": dept.description,
        "is_active": dept.is_active,
        "created_at": dept.created_at
    }


@router.post("/departments/{id}/deactivate")
async def deactivate_department(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    dept = await InstitutionService.deactivate_department(db, str(profile.id), id)
    return {"message": f"Department '{dept.name}' deactivated successfully."}


# --- STUDENT MANAGEMENT ---
@router.get("/students")
async def get_institution_students(
    search: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    career_id: Optional[str] = Query(None),
    assessment_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    inst_id = await check_institution_verification(db, str(current_user.id))
    return await InstitutionService.get_students(
        db=db,
        institution_id=inst_id,
        search=search,
        department_id=department_id,
        career_id=career_id,
        assessment_status=assessment_status,
        page=page,
        limit=limit
    )


@router.get("/students/{id}", response_model=StudentDetailOut)
async def get_student_detail(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    inst_id = await check_institution_verification(db, str(current_user.id))
    return await InstitutionService.get_student_detail(db, inst_id, id)


@router.post("/students/invite")
async def invite_student(
    invite_data: StudentMembershipInviteIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.invite_student(db, str(profile.id), invite_data)


@router.delete("/students/{id}/membership")
async def deactivate_student_membership(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.deactivate_student_membership(db, str(profile.id), id)


# --- OPPORTUNITY DISCOVERY (READ-ONLY) ---
@router.get("/opportunities", response_model=List[InstitutionOpportunityOut])
async def get_relevant_opportunities(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.get_opportunities(db, str(profile.id), search)


# --- APPLICATIONS MONITORING (READ-ONLY) ---
@router.get("/applications", response_model=List[InstitutionApplicationOut])
async def get_student_applications(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    inst_id = await check_institution_verification(db, str(current_user.id))
    return await InstitutionService.get_applications(db, inst_id, search, status)


# --- ANALYTICS ---
@router.get("/analytics", response_model=InstitutionAnalyticsOut)
async def get_institution_analytics(
    period: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    inst_id = await check_institution_verification(db, str(current_user.id))
    return await InstitutionService.get_analytics(db, inst_id, period)


# --- ONBOARDING & VERIFICATION WORKFLOW (PHASE 1) ---
@router.post("/verification-submit", response_model=InstitutionVerificationStatusOut)
async def submit_institution_verification(
    data: InstitutionVerificationSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.submit_verification(db, str(profile.id), data)


@router.get("/verification-status", response_model=InstitutionVerificationStatusOut)
async def get_institution_verification_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.get_verification_status(db, str(profile.id))


# --- INSTITUTIONAL INVITATIONS (PHASE 5) ---
@router.post("/invitations", response_model=InstitutionInvitationOut, status_code=status.HTTP_201_CREATED)
async def create_institution_invitation(
    invite_data: InstitutionInvitationCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.create_invitation(
        db=db,
        institution_id=str(profile.id),
        invited_by_user_id=str(current_user.id),
        invite_data=invite_data
    )


@router.get("/invitations", response_model=List[InstitutionInvitationOut])
async def list_institution_invitations(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.get_invitations(
        db=db,
        institution_id=str(profile.id),
        role=role,
        status_filter=status
    )


@router.delete("/invitations/{id}")
async def revoke_institution_invitation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.revoke_invitation(db, str(profile.id), id)


# --- FACULTY MANAGEMENT ---
@router.get("/faculty")
async def list_institution_faculty(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.get_faculty_members(db, str(profile.id))


@router.post("/faculty/{id}/assign")
async def assign_faculty_subjects(
    id: str,
    subjects_data: FacultySubjectAssignIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(institution_role_guard)
):
    profile = await InstitutionService.get_profile_by_user(db, str(current_user.id))
    return await InstitutionService.assign_faculty_subjects(db, str(profile.id), id, subjects_data)

