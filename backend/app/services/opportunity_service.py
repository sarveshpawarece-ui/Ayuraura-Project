import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.domain import (
    IndustryOpportunity,
    OpportunityRequiredSkill,
    OpportunityCareerRole,
    OpportunityStatus
)
from app.schemas.opportunity import (
    IndustryOpportunityOut,
    OpportunityRequiredSkillOut
)


class OpportunityService:
    async def list_opportunities(
        self,
        db: AsyncSession,
        opportunity_type: Optional[str] = None,
        work_mode: Optional[str] = None,
        experience_level: Optional[str] = None,
        career_role_id: Optional[uuid.UUID] = None
    ) -> List[IndustryOpportunityOut]:
        """
        Public/General catalog view of active industry opportunities.
        """
        now = datetime.now(timezone.utc)
        query = (
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(IndustryOpportunity.career_roles)
            )
            .where(
                IndustryOpportunity.status == OpportunityStatus.ACTIVE,
                (IndustryOpportunity.application_deadline == None) | (IndustryOpportunity.application_deadline >= now)
            )
        )

        if opportunity_type:
            query = query.where(IndustryOpportunity.opportunity_type == opportunity_type)
        if work_mode:
            query = query.where(IndustryOpportunity.work_mode == work_mode)
        if experience_level:
            query = query.where(IndustryOpportunity.experience_level == experience_level)
        if career_role_id:
            query = query.join(OpportunityCareerRole).where(OpportunityCareerRole.career_role_id == career_role_id)

        res = await db.execute(query.order_by(IndustryOpportunity.title))
        opportunities = res.scalars().all()

        return [
            IndustryOpportunityOut(
                id=o.id,
                title=o.title,
                description=o.description,
                responsibilities=o.responsibilities,
                requirements=o.requirements,
                opportunity_type=o.opportunity_type.value if hasattr(o.opportunity_type, "value") else str(o.opportunity_type),
                organization_name=o.organization_name,
                organization_description=o.organization_description,
                location_text=o.location_text,
                city=o.city,
                state=o.state,
                country=o.country,
                work_mode=o.work_mode.value if hasattr(o.work_mode, "value") else str(o.work_mode),
                employment_type=o.employment_type.value if hasattr(o.employment_type, "value") else str(o.employment_type),
                experience_level=o.experience_level.value if hasattr(o.experience_level, "value") else str(o.experience_level),
                application_url=o.application_url,
                source_name=o.source_name,
                source_type=o.source_type.value if hasattr(o.source_type, "value") else str(o.source_type),
                application_deadline=o.application_deadline,
                start_date=o.start_date,
                end_date=o.end_date,
                salary_min=o.salary_min,
                salary_max=o.salary_max,
                salary_currency=o.salary_currency,
                is_salary_disclosed=o.is_salary_disclosed,
                status=o.status.value if hasattr(o.status, "value") else str(o.status),
                required_skills=[
                    OpportunityRequiredSkillOut(
                        id=rs.id,
                        skill_id=rs.skill_id,
                        skill_name=rs.skill.name if rs.skill else "Skill",
                        required_score=rs.required_score,
                        importance=rs.importance,
                        is_required=rs.is_required
                    )
                    for rs in o.required_skills
                ]
            )
            for o in opportunities
        ]

    async def get_opportunity(self, db: AsyncSession, opportunity_id: uuid.UUID) -> IndustryOpportunityOut:
        res = await db.execute(
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill)
            )
            .where(IndustryOpportunity.id == opportunity_id)
        )
        o = res.scalars().first()
        if not o:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity not found."
            )

        return IndustryOpportunityOut(
            id=o.id,
            title=o.title,
            description=o.description,
            responsibilities=o.responsibilities,
            requirements=o.requirements,
            opportunity_type=o.opportunity_type.value if hasattr(o.opportunity_type, "value") else str(o.opportunity_type),
            organization_name=o.organization_name,
            organization_description=o.organization_description,
            location_text=o.location_text,
            city=o.city,
            state=o.state,
            country=o.country,
            work_mode=o.work_mode.value if hasattr(o.work_mode, "value") else str(o.work_mode),
            employment_type=o.employment_type.value if hasattr(o.employment_type, "value") else str(o.employment_type),
            experience_level=o.experience_level.value if hasattr(o.experience_level, "value") else str(o.experience_level),
            application_url=o.application_url,
            source_name=o.source_name,
            source_type=o.source_type.value if hasattr(o.source_type, "value") else str(o.source_type),
            application_deadline=o.application_deadline,
            start_date=o.start_date,
            end_date=o.end_date,
            salary_min=o.salary_min,
            salary_max=o.salary_max,
            salary_currency=o.salary_currency,
            is_salary_disclosed=o.is_salary_disclosed,
            status=o.status.value if hasattr(o.status, "value") else str(o.status),
            required_skills=[
                OpportunityRequiredSkillOut(
                    id=rs.id,
                    skill_id=rs.skill_id,
                    skill_name=rs.skill.name if rs.skill else "Skill",
                    required_score=rs.required_score,
                    importance=rs.importance,
                    is_required=rs.is_required
                )
                for rs in o.required_skills
            ]
        )


opportunity_service = OpportunityService()
