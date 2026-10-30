import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.domain import (
    StudentProfile,
    Skill,
    AssessmentAttempt,
    AssessmentSkillScore,
    AssessmentCategoryScore,
    StudentSkillScore,
    AttemptStatus,
)
from app.schemas.assessment import CareerRoleSimple
from app.schemas.skill_profile import (
    SkillScoreOut,
    CategoryScoreOut,
    StudentSkillProfileOut,
    SkillDetailOut,
    SkillHistoryItemOut,
    SkillHistoryAttemptOut,
)

# Centralized Configurable Thresholds
STRENGTH_THRESHOLD = 75.0
IMPROVEMENT_THRESHOLD = 60.0

BEGINNER_MAX = 39.0
BASIC_MAX = 59.0
INTERMEDIATE_MAX = 74.0
ADVANCED_MAX = 89.0
EXPERT_MAX = 100.0

def get_proficiency_level(score: float) -> str:
    if score <= BEGINNER_MAX:
        return "BEGINNER"
    elif score <= BASIC_MAX:
        return "BASIC"
    elif score <= INTERMEDIATE_MAX:
        return "INTERMEDIATE"
    elif score <= ADVANCED_MAX:
        return "ADVANCED"
    else:
        return "EXPERT"

class SkillProfileService:
    async def sync_skill_profile_from_attempt(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        attempt_id: uuid.UUID
    ) -> None:
        """
        Upsert current student_skill_scores from the latest submitted assessment attempt.
        Historical attempt scores remain preserved in assessment_skill_scores.
        """
        # Fetch attempt skill scores
        res = await db.execute(
            select(AssessmentSkillScore).where(AssessmentSkillScore.attempt_id == attempt_id)
        )
        attempt_skill_scores = res.scalars().all()

        now = datetime.now(timezone.utc)

        for att_score in attempt_skill_scores:
            # Check existing StudentSkillScore
            res_existing = await db.execute(
                select(StudentSkillScore).where(
                    StudentSkillScore.student_profile_id == student_profile_id,
                    StudentSkillScore.skill_id == att_score.skill_id
                )
            )
            existing_score = res_existing.scalars().first()

            score_val = round(att_score.normalized_score, 1)
            prof_level = att_score.proficiency_level

            if existing_score:
                existing_score.score = score_val
                existing_score.proficiency_level = prof_level
                existing_score.source = "ASSESSMENT"
                existing_score.assessment_attempt_id = attempt_id
                existing_score.calculated_at = now
                existing_score.updated_at = now
            else:
                new_score = StudentSkillScore(
                    student_profile_id=student_profile_id,
                    skill_id=att_score.skill_id,
                    score=score_val,
                    proficiency_level=prof_level,
                    source="ASSESSMENT",
                    assessment_attempt_id=attempt_id,
                    calculated_at=now,
                    created_at=now,
                    updated_at=now
                )
                db.add(new_score)

        await db.flush()

    async def get_current_skill_profile(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID
    ) -> StudentSkillProfileOut:
        """
        Retrieves consolidated current student skill profile derived from latest submitted assessment.
        """
        # Fetch student profile with target career
        res_sp = await db.execute(
            select(StudentProfile)
            .options(selectinload(StudentProfile.target_career))
            .where(StudentProfile.id == student_profile_id)
        )
        sp = res_sp.scalars().first()

        # Fetch latest submitted attempt for overall score and categories
        res_attempt = await db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.category_scores),
                selectinload(AssessmentAttempt.career_role)
            )
            .where(
                AssessmentAttempt.student_profile_id == student_profile_id,
                AssessmentAttempt.status == AttemptStatus.SUBMITTED
            )
            .order_by(AssessmentAttempt.submitted_at.desc())
        )
        latest_attempt = res_attempt.scalars().first()

        # Fetch current student skill scores joined with Skill
        res_skills = await db.execute(
            select(StudentSkillScore, Skill)
            .join(Skill, StudentSkillScore.skill_id == Skill.id)
            .where(StudentSkillScore.student_profile_id == student_profile_id)
        )
        skill_rows = res_skills.all()

        target_career_simple = None
        if sp and sp.target_career:
            target_career_simple = CareerRoleSimple.model_validate(sp.target_career)

        if not latest_attempt and not skill_rows:
            return StudentSkillProfileOut(
                overall_score=None,
                target_career=target_career_simple,
                last_assessed_at=None,
                skills=[],
                categories=[],
                strengths=[],
                areas_to_improve=[],
                updated_at=None
            )

        # Build skill scores list
        skills_out: List[SkillScoreOut] = []
        strengths: List[str] = []
        areas_to_improve: List[str] = []
        latest_updated_at: Optional[datetime] = None

        for sss, sk in skill_rows:
            score_rounded = round(sss.score, 1)
            skills_out.append(
                SkillScoreOut(
                    skill_id=sk.id,
                    skill_name=sk.name,
                    score=score_rounded,
                    proficiency=sss.proficiency_level,
                    source=sss.source
                )
            )

            # Deterministic Strength vs Area to Improve check
            if score_rounded >= STRENGTH_THRESHOLD:
                strengths.append(sk.name)
            elif score_rounded < IMPROVEMENT_THRESHOLD:
                areas_to_improve.append(sk.name)

            if not latest_updated_at or sss.updated_at > latest_updated_at:
                latest_updated_at = sss.updated_at

        # Sort skills by score descending
        skills_out.sort(key=lambda x: (x.score if x.score is not None else -1), reverse=True)

        # Build categories list from latest submitted attempt
        categories_out: List[CategoryScoreOut] = []
        overall_score = None
        last_assessed = None

        if latest_attempt:
            overall_score = round(latest_attempt.overall_score, 1) if latest_attempt.overall_score is not None else None
            last_assessed = latest_attempt.submitted_at

            for cs in latest_attempt.category_scores:
                categories_out.append(
                    CategoryScoreOut(
                        category=cs.category.value if hasattr(cs.category, "value") else str(cs.category),
                        score=round(cs.normalized_score, 1),
                        proficiency=cs.proficiency_level
                    )
                )

        categories_out.sort(key=lambda x: x.category)

        return StudentSkillProfileOut(
            overall_score=overall_score,
            target_career=target_career_simple,
            last_assessed_at=last_assessed,
            skills=skills_out,
            categories=categories_out,
            strengths=strengths,
            areas_to_improve=areas_to_improve,
            updated_at=latest_updated_at or last_assessed
        )

    async def get_skill_detail(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        skill_id: uuid.UUID
    ) -> SkillDetailOut:
        """
        Retrieves detail for a specific skill for the current student.
        """
        res_sk = await db.execute(select(Skill).where(Skill.id == skill_id))
        sk = res_sk.scalars().first()
        if not sk:
            raise ValueError("Skill not found")

        res_sss = await db.execute(
            select(StudentSkillScore).where(
                StudentSkillScore.student_profile_id == student_profile_id,
                StudentSkillScore.skill_id == skill_id
            )
        )
        sss = res_sss.scalars().first()

        if not sss:
            return SkillDetailOut(
                skill_id=sk.id,
                skill_name=sk.name,
                category=sk.category.value if hasattr(sk.category, "value") else str(sk.category),
                description=sk.description,
                score=None,
                proficiency="UNASSESSED",
                source="ASSESSMENT",
                assessment_attempt_id=None,
                calculated_at=None
            )

        return SkillDetailOut(
            skill_id=sk.id,
            skill_name=sk.name,
            category=sk.category.value if hasattr(sk.category, "value") else str(sk.category),
            description=sk.description,
            score=round(sss.score, 1),
            proficiency=sss.proficiency_level,
            source=sss.source,
            assessment_attempt_id=sss.assessment_attempt_id,
            calculated_at=sss.calculated_at
        )

    async def get_skill_history(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID
    ) -> List[SkillHistoryItemOut]:
        """
        Retrieves historical skill scores across all submitted assessment attempts.
        """
        # Fetch all submitted attempts for student profile ordered chronologically
        res_attempts = await db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.skill_scores).selectinload(AssessmentSkillScore.skill)
            )
            .where(
                AssessmentAttempt.student_profile_id == student_profile_id,
                AssessmentAttempt.status == AttemptStatus.SUBMITTED
            )
            .order_by(AssessmentAttempt.submitted_at.asc())
        )
        attempts = res_attempts.scalars().all()

        skill_map: Dict[uuid.UUID, Dict[str, Any]] = {}

        for att in attempts:
            for ass in att.skill_scores:
                sk = ass.skill
                if sk.id not in skill_map:
                    skill_map[sk.id] = {
                        "skill_id": sk.id,
                        "skill_name": sk.name,
                        "attempts": []
                    }
                
                skill_map[sk.id]["attempts"].append(
                    SkillHistoryAttemptOut(
                        attempt_id=att.id,
                        submitted_at=att.submitted_at,
                        score=round(ass.normalized_score, 1),
                        proficiency=ass.proficiency_level
                    )
                )

        history_items = [
            SkillHistoryItemOut(
                skill_id=data["skill_id"],
                skill_name=data["skill_name"],
                attempts=data["attempts"]
            )
            for data in skill_map.values()
        ]
        history_items.sort(key=lambda x: x.skill_name)

        return history_items

skill_profile_service = SkillProfileService()
