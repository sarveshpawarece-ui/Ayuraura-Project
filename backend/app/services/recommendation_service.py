import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.domain import (
    StudentProfile,
    CareerRole,
    Skill,
    LearningResource,
    LearningResourceSkill,
    LearningResourceCareer,
    Recommendation,
    RecommendationStatus,
    QuestionDifficulty
)
from app.services.skill_gap_service import skill_gap_service
from app.schemas.recommendation import (
    LearningResourceOut,
    RecommendationItemOut,
    RecommendationSummaryOut,
    StudentRecommendationsReportOut
)
from app.schemas.assessment import CareerRoleSimple


class RecommendationService:
    MIN_SKILL_RELEVANCE: float = 0.40

    def calculate_difficulty_fit(self, current_score: Optional[float], difficulty: Optional[QuestionDifficulty]) -> float:
        """
        Calculates difficulty fit (0.0-1.0) based on student current score vs resource difficulty.
        """
        student_score = current_score if current_score is not None else 0.0
        
        target_score_map = {
            QuestionDifficulty.EASY: 40.0,
            QuestionDifficulty.MEDIUM: 70.0,
            QuestionDifficulty.HARD: 90.0
        }
        target_score = target_score_map.get(difficulty, 70.0)

        fit = max(1.0 - (abs(student_score - target_score) / 100.0), 0.3)
        return fit

    def generate_explanation_reason(
        self,
        skill_name: str,
        current_score: Optional[float],
        required_score: float,
        gap: float,
        classification: str,
        career_role_name: str
    ) -> str:
        """
        Generates deterministic, human-readable explanation for the recommendation.
        """
        if classification == "MISSING":
            return (
                f"Recommended because {skill_name} is a required competency for {career_role_name} "
                f"but has not yet been assessed. This resource provides essential foundational training."
            )
        elif classification == "WEAK":
            return (
                f"Recommended because your assessed {skill_name} score ({current_score}%) is {gap:.1f} points "
                f"below the required target ({required_score}%) for {career_role_name}."
            )
        elif classification == "ADEQUATE":
            return (
                f"Recommended to further strengthen your {skill_name} score ({current_score}%), "
                f"which is close to the {required_score}% target for {career_role_name}."
            )
        else:
            return f"Recommended learning resource to support your development in {skill_name}."

    async def generate_recommendations(
        self, db: AsyncSession, student_profile_id: uuid.UUID
    ) -> StudentRecommendationsReportOut:
        """
        Generates and updates personalized learning recommendations by consuming Phase 7 Skill Gap output.
        """
        # 1. Consume Phase 7 Skill Gap Report
        gap_report = await skill_gap_service.generate_skill_gap_report(db, student_profile_id)

        if not gap_report.career_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target career role not selected."
            )

        career_role_id = gap_report.career_role.id
        career_role_name = gap_report.career_role.name

        # Mark existing active recommendations for OTHER career roles as OUTDATED
        res_old_recs = await db.execute(
            select(Recommendation).where(
                Recommendation.student_profile_id == student_profile_id,
                Recommendation.career_role_id != career_role_id,
                Recommendation.status == RecommendationStatus.ACTIVE
            )
        )
        for old_rec in res_old_recs.scalars().all():
            old_rec.status = RecommendationStatus.OUTDATED
        await db.flush()

        active_gap_skill_ids = set()
        gap_items_map = {}
        for item in gap_report.skills:
            if item.classification in ["WEAK", "MISSING", "ADEQUATE"] and item.gap > 0:
                active_gap_skill_ids.add(item.skill_id)
                gap_items_map[item.skill_id] = item

        # Mark recommendations for skills no longer in gap list as OUTDATED
        res_current_recs = await db.execute(
            select(Recommendation).where(
                Recommendation.student_profile_id == student_profile_id,
                Recommendation.career_role_id == career_role_id,
                Recommendation.status == RecommendationStatus.ACTIVE
            )
        )
        existing_recs_list = res_current_recs.scalars().all()
        existing_recs_map = {
            (r.learning_resource_id, r.skill_id): r for r in existing_recs_list
        }

        for rec in existing_recs_list:
            if rec.skill_id not in active_gap_skill_ids:
                rec.status = RecommendationStatus.OUTDATED
        await db.flush()

        now = datetime.now(timezone.utc)

        # Generate candidate recommendations for active gaps
        for skill_id, gap_item in gap_items_map.items():
            # Query active learning resources mapped to skill_id
            res_lr_skills = await db.execute(
                select(LearningResourceSkill)
                .options(selectinload(LearningResourceSkill.learning_resource))
                .where(
                    LearningResourceSkill.skill_id == skill_id,
                    LearningResourceSkill.relevance_weight >= self.MIN_SKILL_RELEVANCE
                )
            )
            lr_skill_mappings = res_lr_skills.scalars().all()

            for lr_skill in lr_skill_mappings:
                resource = lr_skill.learning_resource
                if not resource or not resource.is_active:
                    continue

                # Check career relevance
                res_lr_career = await db.execute(
                    select(LearningResourceCareer).where(
                        LearningResourceCareer.learning_resource_id == resource.id,
                        LearningResourceCareer.career_role_id == career_role_id
                    )
                )
                lr_career = res_lr_career.scalars().first()
                career_relevance = lr_career.relevance_weight if lr_career else 0.5

                # Calculate components
                gap_score = 1.0 if gap_item.classification == "MISSING" else min(gap_item.gap / 40.0, 1.0)
                skill_relevance = lr_skill.relevance_weight
                diff_fit = self.calculate_difficulty_fit(gap_item.current_score, resource.difficulty)

                raw_relevance = (
                    (gap_score * 0.40) +
                    (skill_relevance * 0.30) +
                    (career_relevance * 0.20) +
                    (diff_fit * 0.10)
                )
                relevance_score = round(raw_relevance * 100.0, 1)

                reason = self.generate_explanation_reason(
                    gap_item.skill_name,
                    gap_item.current_score,
                    gap_item.required_score,
                    gap_item.gap,
                    gap_item.classification,
                    career_role_name
                )

                rec_key = (resource.id, skill_id)
                if rec_key in existing_recs_map:
                    rec_obj = existing_recs_map[rec_key]
                    if rec_obj.status == RecommendationStatus.ACTIVE:
                        rec_obj.relevance_score = relevance_score
                        rec_obj.priority = gap_item.priority
                        rec_obj.reason = reason
                        rec_obj.generated_at = now
                else:
                    # Check if previously dismissed
                    res_dismissed = await db.execute(
                        select(Recommendation).where(
                            Recommendation.student_profile_id == student_profile_id,
                            Recommendation.learning_resource_id == resource.id,
                            Recommendation.skill_id == skill_id,
                            Recommendation.career_role_id == career_role_id,
                            Recommendation.status == RecommendationStatus.DISMISSED
                        )
                    )
                    if not res_dismissed.scalars().first():
                        new_rec = Recommendation(
                            student_profile_id=student_profile_id,
                            learning_resource_id=resource.id,
                            skill_id=skill_id,
                            career_role_id=career_role_id,
                            relevance_score=relevance_score,
                            priority=gap_item.priority,
                            reason=reason,
                            status=RecommendationStatus.ACTIVE,
                            generated_at=now
                        )
                        db.add(new_rec)

        await db.commit()

        # Fetch all active recommendations for output
        res_final = await db.execute(
            select(Recommendation)
            .options(
                selectinload(Recommendation.learning_resource),
                selectinload(Recommendation.skill)
            )
            .where(
                Recommendation.student_profile_id == student_profile_id,
                Recommendation.career_role_id == career_role_id,
                Recommendation.status == RecommendationStatus.ACTIVE
            )
        )
        final_recs = res_final.scalars().all()

        rec_items: List[RecommendationItemOut] = []
        crit_cnt = 0
        high_cnt = 0
        med_cnt = 0
        low_cnt = 0

        for r in final_recs:
            gap_item = gap_items_map.get(r.skill_id)
            curr_score = gap_item.current_score if gap_item else None
            req_score = gap_item.required_score if gap_item else 75.0
            gap_val = gap_item.gap if gap_item else 0.0
            classif = gap_item.classification if gap_item else "WEAK"

            if r.priority == "CRITICAL":
                crit_cnt += 1
            elif r.priority == "HIGH":
                high_cnt += 1
            elif r.priority == "MEDIUM":
                med_cnt += 1
            else:
                low_cnt += 1

            lr_out = LearningResourceOut(
                id=r.learning_resource.id,
                title=r.learning_resource.title,
                description=r.learning_resource.description,
                resource_type=r.learning_resource.resource_type.value if hasattr(r.learning_resource.resource_type, "value") else str(r.learning_resource.resource_type),
                provider=r.learning_resource.provider,
                url=r.learning_resource.url,
                thumbnail_url=r.learning_resource.thumbnail_url,
                difficulty=r.learning_resource.difficulty.value if hasattr(r.learning_resource.difficulty, "value") else str(r.learning_resource.difficulty),
                estimated_hours=r.learning_resource.estimated_hours,
                price_type=r.learning_resource.price_type.value if hasattr(r.learning_resource.price_type, "value") else str(r.learning_resource.price_type),
                language=r.learning_resource.language
            )

            rec_items.append(
                RecommendationItemOut(
                    id=r.id,
                    skill_id=r.skill_id,
                    skill_name=r.skill.name if r.skill else "Unknown Skill",
                    current_score=curr_score,
                    required_score=req_score,
                    gap=gap_val,
                    classification=classif,
                    priority=r.priority,
                    relevance_score=r.relevance_score,
                    reason=r.reason,
                    resource=lr_out,
                    status=r.status.value if hasattr(r.status, "value") else str(r.status),
                    generated_at=r.generated_at
                )
            )

        # Sort recommendations by Priority (CRITICAL > HIGH > MEDIUM > LOW), then relevance_score desc
        prio_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}
        rec_items.sort(key=lambda x: (prio_order.get(x.priority, 5), -x.relevance_score))

        summary = RecommendationSummaryOut(
            total_recommendations=len(rec_items),
            critical=crit_cnt,
            high=high_cnt,
            medium=med_cnt,
            low=low_cnt
        )

        return StudentRecommendationsReportOut(
            career_role=gap_report.career_role,
            summary=summary,
            recommendations=rec_items,
            generated_at=now
        )

    async def get_recommendation_detail(
        self, db: AsyncSession, student_profile_id: uuid.UUID, recommendation_id: uuid.UUID
    ) -> RecommendationItemOut:
        """
        Retrieves detail for a specific recommendation owned by authenticated student.
        """
        report = await self.generate_recommendations(db, student_profile_id)
        for item in report.recommendations:
            if item.id == recommendation_id:
                return item

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )

    async def dismiss_recommendation(
        self, db: AsyncSession, student_profile_id: uuid.UUID, recommendation_id: uuid.UUID
    ) -> None:
        """
        Dismisses a recommendation for authenticated student.
        """
        res_rec = await db.execute(
            select(Recommendation).where(
                Recommendation.id == recommendation_id,
                Recommendation.student_profile_id == student_profile_id
            )
        )
        rec = res_rec.scalars().first()
        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found"
            )

        rec.status = RecommendationStatus.DISMISSED
        await db.commit()

    async def get_learning_resources(
        self,
        db: AsyncSession,
        skill_id: Optional[uuid.UUID] = None,
        career_role_id: Optional[uuid.UUID] = None,
        resource_type: Optional[str] = None
    ) -> List[LearningResourceOut]:
        """
        Public/Student catalog view of active learning resources.
        """
        query = select(LearningResource).where(LearningResource.is_active == True)

        if skill_id:
            query = query.join(LearningResourceSkill).where(LearningResourceSkill.skill_id == skill_id)
        if career_role_id:
            query = query.join(LearningResourceCareer).where(LearningResourceCareer.career_role_id == career_role_id)
        if resource_type:
            query = query.where(LearningResource.resource_type == resource_type)

        res = await db.execute(query.order_by(LearningResource.title))
        resources = res.scalars().all()

        return [
            LearningResourceOut(
                id=r.id,
                title=r.title,
                description=r.description,
                resource_type=r.resource_type.value if hasattr(r.resource_type, "value") else str(r.resource_type),
                provider=r.provider,
                url=r.url,
                thumbnail_url=r.thumbnail_url,
                difficulty=r.difficulty.value if hasattr(r.difficulty, "value") else str(r.difficulty),
                estimated_hours=r.estimated_hours,
                price_type=r.price_type.value if hasattr(r.price_type, "value") else str(r.price_type),
                language=r.language
            )
            for r in resources
        ]


recommendation_service = RecommendationService()
