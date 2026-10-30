from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.domain import Skill, StudentProfile, StudentSkill, CareerPath, CareerSkillRequirement
from app.schemas.domain import SkillOut, StudentSkillUpdate, SkillGapReport
from app.api.deps import get_current_user, RoleChecker
from app.intelligence.skill_gap_analyzer import skill_gap_analyzer

router = APIRouter()

@router.get("/taxonomy", response_model=List[SkillOut])
async def get_skills_taxonomy(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill))
    skills = result.scalars().all()
    return skills

@router.post("/student", status_code=200)
async def update_student_skill(
    skill_update: StudentSkillUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    result_skill = await db.execute(
        select(StudentSkill).where(
            StudentSkill.student_id == profile.id,
            StudentSkill.skill_id == skill_update.skill_id
        )
    )
    existing_ss = result_skill.scalars().first()

    if existing_ss:
        existing_ss.proficiency_level = skill_update.proficiency_level
    else:
        new_ss = StudentSkill(
            student_id=profile.id,
            skill_id=skill_update.skill_id,
            proficiency_level=skill_update.proficiency_level
        )
        db.add(new_ss)

    await db.commit()
    return {"message": "Skill updated successfully"}

@router.get("/gap-analysis", response_model=SkillGapReport)
async def get_skill_gap_analysis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Fetch student skills
    res_skills = await db.execute(
        select(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).where(StudentSkill.student_id == profile.id)
    )
    student_skills_data = []
    for ss, s in res_skills.all():
        student_skills_data.append({
            "skill_id": str(s.id),
            "name": s.name,
            "proficiency_level": ss.proficiency_level
        })

    # Fetch default or target career
    res_career = await db.execute(select(CareerPath))
    career = res_career.scalars().first()
    career_title = career.title if career else "Ayurvedic Clinical Researcher & Quality Analyst"

    res_reqs = await db.execute(
        select(CareerSkillRequirement, Skill).join(Skill, CareerSkillRequirement.skill_id == Skill.id)
    )
    target_reqs = []
    for csr, s in res_reqs.all():
        target_reqs.append({
            "skill_id": str(s.id),
            "name": s.name,
            "required_proficiency": csr.required_proficiency,
            "importance_weight": csr.importance_weight
        })

    analysis = skill_gap_analyzer.analyze_gap(student_skills_data, target_reqs)

    return SkillGapReport(
        overall_match_score=analysis["overall_match_score"],
        target_career_title=career_title,
        acquired_skills=analysis["acquired_skills"],
        missing_skills=analysis["missing_skills"],
        recommended_actions=analysis["recommended_actions"],
        explainability_summary=analysis["explainability_summary"]
    )
