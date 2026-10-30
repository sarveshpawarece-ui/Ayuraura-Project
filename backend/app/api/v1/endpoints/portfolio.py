from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.domain import StudentProfile
from app.api.deps import get_current_user, RoleChecker
from app.services.portfolio_service import PortfolioService
from app.schemas.portfolio import (
    PortfolioOut,
    PortfolioUpdateIn,
    ProjectCreate,
    ProjectUpdate,
    ProjectOut,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceOut,
    CertificationCreate,
    CertificationUpdate,
    CertificationOut,
    AchievementCreate,
    AchievementUpdate,
    AchievementOut,
    EducationCreate,
    EducationUpdate,
    EducationOut
)

router = APIRouter()
student_role_guard = RoleChecker([UserRole.STUDENT, UserRole.ADMIN])

async def get_student_profile_id(db: AsyncSession, user: User) -> str:
    stmt = select(StudentProfile).where(StudentProfile.user_id == user.id)
    student = (await db.execute(stmt)).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found for authenticated user.")
    return str(student.id)


@router.get("", response_model=PortfolioOut)
async def get_student_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio


@router.patch("", response_model=PortfolioOut)
async def update_student_portfolio(
    update_in: PortfolioUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_portfolio(db, s_id, update_in)


@router.post("/publish", response_model=PortfolioOut)
async def publish_student_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.publish_portfolio(db, s_id)


@router.post("/unpublish", response_model=PortfolioOut)
async def unpublish_student_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.unpublish_portfolio(db, s_id)


# --- PROJECTS ---
@router.get("/projects", response_model=List[ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio.projects


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.create_project(db, s_id, data)


@router.patch("/projects/{id}", response_model=ProjectOut)
async def update_project(
    id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_project(db, s_id, id, data)


@router.delete("/projects/{id}")
async def delete_project(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    await PortfolioService.delete_project(db, s_id, id)
    return {"message": "Project deleted successfully."}


# --- EXPERIENCES ---
@router.get("/experience", response_model=List[ExperienceOut])
async def list_experiences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio.experiences


@router.post("/experience", response_model=ExperienceOut, status_code=status.HTTP_201_CREATED)
async def create_experience(
    data: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.create_experience(db, s_id, data)


@router.patch("/experience/{id}", response_model=ExperienceOut)
async def update_experience(
    id: str,
    data: ExperienceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_experience(db, s_id, id, data)


@router.delete("/experience/{id}")
async def delete_experience(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    await PortfolioService.delete_experience(db, s_id, id)
    return {"message": "Experience record deleted successfully."}


# --- CERTIFICATIONS ---
@router.get("/certifications", response_model=List[CertificationOut])
async def list_certifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio.certifications


@router.post("/certifications", response_model=CertificationOut, status_code=status.HTTP_201_CREATED)
async def create_certification(
    data: CertificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.create_certification(db, s_id, data)


@router.patch("/certifications/{id}", response_model=CertificationOut)
async def update_certification(
    id: str,
    data: CertificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_certification(db, s_id, id, data)


@router.delete("/certifications/{id}")
async def delete_certification(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    await PortfolioService.delete_certification(db, s_id, id)
    return {"message": "Certification deleted successfully."}


# --- ACHIEVEMENTS ---
@router.get("/achievements", response_model=List[AchievementOut])
async def list_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio.achievements


@router.post("/achievements", response_model=AchievementOut, status_code=status.HTTP_201_CREATED)
async def create_achievement(
    data: AchievementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.create_achievement(db, s_id, data)


@router.patch("/achievements/{id}", response_model=AchievementOut)
async def update_achievement(
    id: str,
    data: AchievementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_achievement(db, s_id, id, data)


@router.delete("/achievements/{id}")
async def delete_achievement(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    await PortfolioService.delete_achievement(db, s_id, id)
    return {"message": "Achievement deleted successfully."}


# --- EDUCATION ---
@router.get("/education", response_model=List[EducationOut])
async def list_education(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    portfolio = await PortfolioService.get_or_create_portfolio(db, s_id)
    return portfolio.educations


@router.post("/education", response_model=EducationOut, status_code=status.HTTP_201_CREATED)
async def create_education(
    data: EducationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.create_education(db, s_id, data)


@router.patch("/education/{id}", response_model=EducationOut)
async def update_education(
    id: str,
    data: EducationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    return await PortfolioService.update_education(db, s_id, id, data)


@router.delete("/education/{id}")
async def delete_education(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(student_role_guard)
):
    s_id = await get_student_profile_id(db, current_user)
    await PortfolioService.delete_education(db, s_id, id)
    return {"message": "Education record deleted successfully."}
