import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.matching_engine import matching_engine
from app.schemas.matching import MatchWeightConfig
from app.schemas.opportunity import (
    OpportunityMatchItemOut,
    StudentOpportunitiesReportOut
)


class OpportunityMatchingService:
    def calculate_experience_fit(self, student_level: Optional[str], opp_level) -> float:
        return matching_engine.calculate_experience_fit(student_level, opp_level)

    def classify_match(self, score: float):
        return matching_engine.classify_match(score)

    def generate_match_explanation(self, *args, **kwargs) -> str:
        return matching_engine.generate_match_explanation(*args, **kwargs)

    async def generate_opportunity_matches(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        weight_config: Optional[MatchWeightConfig] = None
    ) -> StudentOpportunitiesReportOut:
        """
        Delegates match generation and persistence to centralized MatchingEngine.
        """
        return await matching_engine.evaluate_student_matches(db, student_profile_id, weight_config)


    async def get_opportunity_match_detail(
        self, db: AsyncSession, student_profile_id: uuid.UUID, opportunity_id: uuid.UUID
    ) -> OpportunityMatchItemOut:
        report = await self.generate_opportunity_matches(db, student_profile_id)
        for item in report.opportunities:
            if item.opportunity.id == opportunity_id:
                return item

        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity match not found."
        )

    async def dismiss_opportunity_match(
        self, db: AsyncSession, student_profile_id: uuid.UUID, opportunity_id: uuid.UUID
    ) -> None:
        from sqlalchemy.future import select
        from app.models.domain import OpportunityMatch, MatchStatus
        res_m = await db.execute(
            select(OpportunityMatch).where(
                OpportunityMatch.opportunity_id == opportunity_id,
                OpportunityMatch.student_profile_id == student_profile_id
            )
        )
        match_obj = res_m.scalars().first()
        if not match_obj:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity match not found."
            )

        match_obj.status = MatchStatus.DISMISSED
        await db.commit()


opportunity_matching_service = OpportunityMatchingService()
