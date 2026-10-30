import uuid
from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.student_profile import (
    StudentProfileOut,
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentExperienceCreate,
    StudentExperienceOut,
    StudentProjectCreate,
    StudentProjectOut,
    SelfDeclaredSkillCreate,
    StudentSkillItemOut,
)
from app.schemas.career_role import (
    CareerRoleOut,
    TargetCareerSet,
    TargetCareerResponse,
)
from app.api.deps import get_current_user, RoleChecker
from app.services.student_profile_service import student_profile_service
from app.services.profile_completion_service import profile_completion_service
from app.services.career_role_service import career_role_service

router = APIRouter()

def build_student_profile_response(profile) -> StudentProfileOut:
    skills_list = []
    if hasattr(profile, "student_skills") and profile.student_skills:
        for ss in profile.student_skills:
            if hasattr(ss, "skill") and ss.skill:
                skills_list.append(
                    StudentSkillItemOut(
                        id=str(ss.id),
                        skill_id=str(ss.skill_id),
                        skill_name=ss.skill.name,
                        category=ss.skill.category.value if hasattr(ss.skill.category, "value") else str(ss.skill.category),
                        proficiency_level=ss.proficiency_level,
                        source=ss.source,
                    )
                )

    exp_list = [StudentExperienceOut.model_validate(e) for e in (profile.experiences or [])]
    proj_list = [StudentProjectOut.model_validate(p) for p in (profile.projects or [])]

    completion_pct, completion_status = profile_completion_service.calculate_completion(
        profile,
        skills_count=len(skills_list),
        exp_count=len(exp_list),
        proj_count=len(proj_list),
    )

    return StudentProfileOut(
        id=str(profile.id),
        user_id=str(profile.user_id),
        first_name=profile.first_name,
        last_name=profile.last_name,
        full_name=profile.full_name or f"{profile.first_name or ''} {profile.last_name or ''}".strip(),
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        phone=profile.phone,
        profile_photo_url=profile.profile_photo_url,
        bio=profile.bio,
        college_name=profile.college_name,
        course=profile.course or profile.degree_program,
        enrollment_number=profile.enrollment_number,
        specialization=profile.specialization,
        current_year=profile.current_year or profile.academic_year,
        graduation_year=profile.graduation_year,
        cgpa=profile.cgpa,
        city=profile.city,
        state=profile.state,
        country=profile.country or "India",
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url,
        website_url=profile.website_url,
        interests=profile.interests or [],
        profile_completion_percentage=completion_pct,
        profile_status=completion_status,
        skills=skills_list,
        experiences=exp_list,
        projects=proj_list,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("/me/profile", response_model=StudentProfileOut)
async def get_my_student_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return build_student_profile_response(profile)


@router.post("/me/profile", response_model=StudentProfileOut, status_code=status.HTTP_201_CREATED)
async def create_my_student_profile(
    profile_in: StudentProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.update_profile(db, current_user.id, StudentProfileUpdate(**profile_in.model_dump()))
    return build_student_profile_response(profile)


@router.put("/me/profile", response_model=StudentProfileOut)
@router.patch("/me/profile", response_model=StudentProfileOut)
async def update_my_student_profile(
    profile_in: StudentProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.update_profile(db, current_user.id, profile_in)
    return build_student_profile_response(profile)


@router.get("/me/target-career", response_model=TargetCareerResponse)
async def get_my_target_career(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    role = await career_role_service.get_student_target_career(db, current_user.id)
    if not role:
        return TargetCareerResponse(target_career=None)
    return TargetCareerResponse(target_career=CareerRoleOut.model_validate(role))


@router.put("/me/target-career", response_model=TargetCareerResponse)
async def set_my_target_career(
    target_in: TargetCareerSet,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    role = await career_role_service.set_student_target_career(db, current_user.id, target_in.career_role_id)
    return TargetCareerResponse(target_career=CareerRoleOut.model_validate(role))


@router.delete("/me/target-career", response_model=TargetCareerResponse)
async def clear_my_target_career(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    await career_role_service.clear_student_target_career(db, current_user.id)
    return TargetCareerResponse(target_career=None)


@router.post("/me/experiences", response_model=StudentExperienceOut, status_code=status.HTTP_201_CREATED)
async def add_student_experience(
    exp_in: StudentExperienceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    exp = await student_profile_service.add_experience(db, current_user.id, exp_in)
    return StudentExperienceOut.model_validate(exp)


@router.delete("/me/experiences/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student_experience(
    exp_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    await student_profile_service.delete_experience(db, current_user.id, exp_id)
    return None


@router.post("/me/projects", response_model=StudentProjectOut, status_code=status.HTTP_201_CREATED)
async def add_student_project(
    proj_in: StudentProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    proj = await student_profile_service.add_project(db, current_user.id, proj_in)
    return StudentProjectOut.model_validate(proj)


@router.delete("/me/projects/{proj_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student_project(
    proj_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    await student_profile_service.delete_project(db, current_user.id, proj_id)
    return None


@router.post("/me/skills", status_code=status.HTTP_201_CREATED)
async def add_self_declared_skill(
    skill_in: SelfDeclaredSkillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    await student_profile_service.add_self_declared_skill(db, current_user.id, skill_in)
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return build_student_profile_response(profile)


@router.delete("/me/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_self_declared_skill(
    skill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    await student_profile_service.delete_self_declared_skill(db, current_user.id, skill_id)
    return None


# ============================================================
# PHASE 6 — STUDENT SKILL PROFILE & SCORING ENGINE ENDPOINTS
# ============================================================
from app.schemas.skill_profile import (
    StudentSkillProfileOut,
    SkillDetailOut,
    SkillHistoryItemOut,
)
from app.services.skill_profile_service import skill_profile_service

@router.get("/me/skills", response_model=StudentSkillProfileOut)
async def get_my_skill_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_profile_service.get_current_skill_profile(db, profile.id)


@router.get("/me/skills/history", response_model=List[SkillHistoryItemOut])
async def get_my_skill_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_profile_service.get_skill_history(db, profile.id)


@router.get("/me/skills/detail/{skill_id}", response_model=SkillDetailOut)
async def get_my_skill_detail(
    skill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_profile_service.get_skill_detail(db, profile.id, skill_id)


# ============================================================
# PHASE 7 — SKILL GAP ENGINE ENDPOINTS
# ============================================================
from app.schemas.skill_gap import (
    StudentSkillGapReportOut,
    SkillGapItemOut,
    SkillGapHistoryItemOut as SkillGapHistoryItemOutPhase7,
)
from app.services.skill_gap_service import skill_gap_service

@router.get("/me/skill-gaps", response_model=StudentSkillGapReportOut)
@router.get("/me/skill-gap", response_model=StudentSkillGapReportOut)
async def get_my_skill_gaps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_gap_service.generate_skill_gap_report(db, profile.id)


@router.get("/me/skill-gaps/history", response_model=List[SkillGapHistoryItemOutPhase7])
async def get_my_skill_gap_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_gap_service.get_skill_gap_history(db, profile.id)


@router.get("/me/skill-gaps/detail/{skill_id}", response_model=SkillGapItemOut)
async def get_my_skill_gap_detail(
    skill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    profile = await student_profile_service.get_or_create_profile(db, current_user.id)
    return await skill_gap_service.get_skill_gap_detail(db, profile.id, skill_id)


