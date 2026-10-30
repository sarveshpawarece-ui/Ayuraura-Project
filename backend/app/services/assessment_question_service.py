from typing import List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.domain import AssessmentQuestion, QuestionCategory, AssessmentAttemptQuestion

class AssessmentQuestionService:
    """
    Selects balanced questions (10 Technical, 10 Domain, 5 Soft Skills) from active question bank
    and snapshots them for an assessment attempt.
    """

    TARGET_TECHNICAL_COUNT = 10
    TARGET_DOMAIN_COUNT = 10
    TARGET_SOFT_SKILL_COUNT = 5

    async def get_active_questions(self, db: AsyncSession) -> List[AssessmentQuestion]:
        """
        Fetches active questions with preloaded options and skill taxonomy.
        """
        result = await db.execute(
            select(AssessmentQuestion)
            .options(
                selectinload(AssessmentQuestion.options),
                selectinload(AssessmentQuestion.skill)
            )
            .where(AssessmentQuestion.is_active == True)
        )
        return list(result.scalars().all())

    async def create_attempt_question_snapshot(
        self, db: AsyncSession, attempt_id: uuid.UUID
    ) -> List[AssessmentQuestion]:
        """
        Selects balanced question set and snapshots into assessment_attempt_questions table.
        """
        all_questions = await self.get_active_questions(db)

        tech_qs = [q for q in all_questions if q.category == QuestionCategory.TECHNICAL]
        domain_qs = [q for q in all_questions if q.category == QuestionCategory.DOMAIN]
        soft_qs = [q for q in all_questions if q.category == QuestionCategory.SOFT_SKILL]

        selected = (
            tech_qs[: self.TARGET_TECHNICAL_COUNT] +
            domain_qs[: self.TARGET_DOMAIN_COUNT] +
            soft_qs[: self.TARGET_SOFT_SKILL_COUNT]
        )

        # Fallback if specific category distribution is incomplete in smaller test environments
        if len(selected) < 25 and len(all_questions) > len(selected):
            remaining = [q for q in all_questions if q not in selected]
            selected.extend(remaining[: (25 - len(selected))])

        snapshot_entries = []
        for idx, q in enumerate(selected, start=1):
            entry = AssessmentAttemptQuestion(
                attempt_id=attempt_id,
                question_id=q.id,
                question_order=idx
            )
            db.add(entry)
            snapshot_entries.append(q)

        await db.flush()
        return snapshot_entries

assessment_question_service = AssessmentQuestionService()
