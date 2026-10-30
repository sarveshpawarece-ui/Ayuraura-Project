import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.user import User
from app.models.domain import (
    StudentProfile,
    StudentExperience,
    StudentProject,
    StudentSkill,
    Skill,
    SkillCategory,
    ProficiencyLevel,
    SkillSource,
)
from app.schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentExperienceCreate,
    StudentProjectCreate,
    SelfDeclaredSkillCreate,
)
from app.services.profile_completion_service import profile_completion_service

class StudentProfileService:

    async def get_or_create_profile(self, db: AsyncSession, user_id: uuid.UUID) -> StudentProfile:
        result = await db.execute(
            select(StudentProfile)
            .options(
                selectinload(StudentProfile.experiences),
                selectinload(StudentProfile.projects),
                selectinload(StudentProfile.target_career_role),
                selectinload(StudentProfile.student_skills).selectinload(StudentSkill.skill)
            )
            .where(StudentProfile.user_id == user_id)
        )
        profile = result.scalars().first()
        if not profile:
            profile = StudentProfile(user_id=user_id, full_name="")
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            # Re-query with options
            result = await db.execute(
                select(StudentProfile)
                .options(
                    selectinload(StudentProfile.experiences),
                    selectinload(StudentProfile.projects),
                    selectinload(StudentProfile.target_career_role),
                    selectinload(StudentProfile.student_skills).selectinload(StudentSkill.skill)
                )
                .where(StudentProfile.user_id == user_id)
            )
            profile = result.scalars().first()
        return profile

    async def update_profile(
        self, db: AsyncSession, user_id: uuid.UUID, profile_in: StudentProfileUpdate
    ) -> StudentProfile:
        profile = await self.get_or_create_profile(db, user_id)

        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)

        # Sync full_name if structured name fields provided
        if profile.name_prefix and (profile.name_prefix.lower().startswith("dr") or profile.name_prefix.lower().startswith("prof")):
            profile.name_prefix = ""  # Strict guard: students cannot take doctor titles

        name_parts = [p for p in [profile.name_prefix, profile.first_name, profile.middle_name, profile.last_name] if p and p.strip()]
        if name_parts:
            profile.full_name = " ".join(name_parts).strip()

        # Sync degree_program and academic_year
        if profile.course:
            profile.degree_program = profile.course
        if profile.current_year:
            profile.academic_year = profile.current_year

        await db.commit()
        await db.refresh(profile)
        return profile

    async def add_experience(
        self, db: AsyncSession, user_id: uuid.UUID, exp_in: StudentExperienceCreate
    ) -> StudentExperience:
        profile = await self.get_or_create_profile(db, user_id)
        exp = StudentExperience(
            student_profile_id=profile.id,
            title=exp_in.title,
            organization=exp_in.organization,
            experience_type=exp_in.experience_type,
            description=exp_in.description,
            start_date=exp_in.start_date,
            end_date=exp_in.end_date,
            is_current=exp_in.is_current,
        )
        db.add(exp)
        await db.commit()
        await db.refresh(exp)
        return exp

    async def delete_experience(self, db: AsyncSession, user_id: uuid.UUID, exp_id: uuid.UUID) -> bool:
        profile = await self.get_or_create_profile(db, user_id)
        result = await db.execute(
            select(StudentExperience).where(
                StudentExperience.id == exp_id,
                StudentExperience.student_profile_id == profile.id
            )
        )
        exp = result.scalars().first()
        if not exp:
            raise HTTPException(status_code=404, detail="Experience record not found")
        await db.delete(exp)
        await db.commit()
        return True

    async def add_project(
        self, db: AsyncSession, user_id: uuid.UUID, proj_in: StudentProjectCreate
    ) -> StudentProject:
        profile = await self.get_or_create_profile(db, user_id)
        proj = StudentProject(
            student_profile_id=profile.id,
            title=proj_in.title,
            description=proj_in.description,
            technologies=proj_in.technologies,
            role=proj_in.role,
            project_url=proj_in.project_url,
            start_date=proj_in.start_date,
            end_date=proj_in.end_date,
        )
        db.add(proj)
        await db.commit()
        await db.refresh(proj)
        return proj

    async def delete_project(self, db: AsyncSession, user_id: uuid.UUID, proj_id: uuid.UUID) -> bool:
        profile = await self.get_or_create_profile(db, user_id)
        result = await db.execute(
            select(StudentProject).where(
                StudentProject.id == proj_id,
                StudentProject.student_profile_id == profile.id
            )
        )
        proj = result.scalars().first()
        if not proj:
            raise HTTPException(status_code=404, detail="Project record not found")
        await db.delete(proj)
        await db.commit()
        return True

    async def add_self_declared_skill(
        self, db: AsyncSession, user_id: uuid.UUID, skill_in: SelfDeclaredSkillCreate
    ) -> StudentSkill:
        profile = await self.get_or_create_profile(db, user_id)

        # Find or create skill in skills taxonomy
        skill_name = skill_in.skill_name_or_id.strip()
        res_skill = await db.execute(select(Skill).where(Skill.name.ilike(skill_name)))
        skill = res_skill.scalars().first()

        if not skill:
            skill = Skill(
                name=skill_name,
                category=SkillCategory.AYURVEDA_DOMAIN,
                description="Self-declared student skill"
            )
            db.add(skill)
            await db.flush()

        res_ss = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == profile.id,
                StudentSkill.skill_id == skill.id
            )
        )
        student_skill = res_ss.scalars().first()

        if student_skill:
            student_skill.proficiency_level = skill_in.proficiency_level
            student_skill.source = SkillSource.SELF_DECLARED
        else:
            student_skill = StudentSkill(
                student_id=profile.id,
                skill_id=skill.id,
                proficiency_level=skill_in.proficiency_level,
                source=SkillSource.SELF_DECLARED
            )
            db.add(student_skill)

        await db.commit()
        await db.refresh(student_skill)
        return student_skill

    async def delete_self_declared_skill(self, db: AsyncSession, user_id: uuid.UUID, student_skill_id: uuid.UUID) -> bool:
        profile = await self.get_or_create_profile(db, user_id)
        res_ss = await db.execute(
            select(StudentSkill).where(
                StudentSkill.id == student_skill_id,
                StudentSkill.student_id == profile.id
            )
        )
        student_skill = res_ss.scalars().first()
        if not student_skill:
            raise HTTPException(status_code=404, detail="Student skill not found")
        await db.delete(student_skill)
        await db.commit()
        return True

student_profile_service = StudentProfileService()
