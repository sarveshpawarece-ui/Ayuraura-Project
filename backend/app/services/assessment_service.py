import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.domain import (
    StudentProfile,
    CareerRole,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    AssessmentAttemptQuestion,
    AssessmentAnswer,
    AssessmentSkillScore,
    AssessmentCategoryScore,
    AttemptStatus,
)
from app.services.student_profile_service import student_profile_service
from app.services.assessment_question_service import assessment_question_service
from app.services.assessment_scoring_service import assessment_scoring_service

class AssessmentService:

    async def start_assessment(self, db: AsyncSession, user_id: uuid.UUID) -> AssessmentAttempt:
        """
        Starts a new assessment attempt.
        Verifies prerequisite: Authenticated STUDENT, Profile completed, Target Career selected.
        """
        profile = await student_profile_service.get_or_create_profile(db, user_id)

        # Check prerequisite: Target Career Selected
        if not profile.target_career_id and not profile.target_career_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please select a target career before starting the assessment."
            )

        target_career_id = profile.target_career_id or profile.target_career_role.id

        # Create new Assessment Attempt
        attempt = AssessmentAttempt(
            student_profile_id=profile.id,
            career_role_id=target_career_id,
            status=AttemptStatus.IN_PROGRESS,
            started_at=datetime.now(timezone.utc)
        )
        db.add(attempt)
        await db.flush()

        # Snapshot selected questions
        await assessment_question_service.create_attempt_question_snapshot(db, attempt.id)

        await db.commit()
        return await self.get_attempt_by_id(db, attempt.id, user_id)

    async def get_attempt_by_id(self, db: AsyncSession, attempt_id: uuid.UUID, user_id: uuid.UUID) -> AssessmentAttempt:
        """
        Fetches an assessment attempt by ID, enforcing student ownership.
        """
        profile = await student_profile_service.get_or_create_profile(db, user_id)

        result = await db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.career_role),
                selectinload(AssessmentAttempt.attempt_questions)
                    .selectinload(AssessmentAttemptQuestion.question)
                    .selectinload(AssessmentQuestion.options),
                selectinload(AssessmentAttempt.attempt_questions)
                    .selectinload(AssessmentAttemptQuestion.question)
                    .selectinload(AssessmentQuestion.skill),
                selectinload(AssessmentAttempt.answers),
                selectinload(AssessmentAttempt.skill_scores).selectinload(AssessmentSkillScore.skill),
                selectinload(AssessmentAttempt.category_scores),
            )
            .where(
                AssessmentAttempt.id == attempt_id,
                AssessmentAttempt.student_profile_id == profile.id
            )
        )
        attempt = result.scalars().first()
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment attempt not found or unauthorized access."
            )
        return attempt

    async def get_current_assessment(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[AssessmentAttempt]:
        """
        Gets the active IN_PROGRESS assessment for the authenticated student.
        """
        profile = await student_profile_service.get_or_create_profile(db, user_id)

        result = await db.execute(
            select(AssessmentAttempt)
            .options(
                selectinload(AssessmentAttempt.career_role),
                selectinload(AssessmentAttempt.attempt_questions)
                    .selectinload(AssessmentAttemptQuestion.question)
                    .selectinload(AssessmentQuestion.options),
                selectinload(AssessmentAttempt.attempt_questions)
                    .selectinload(AssessmentAttemptQuestion.question)
                    .selectinload(AssessmentQuestion.skill),
                selectinload(AssessmentAttempt.answers)
            )
            .where(
                AssessmentAttempt.student_profile_id == profile.id,
                AssessmentAttempt.status == AttemptStatus.IN_PROGRESS
            )
            .order_by(AssessmentAttempt.started_at.desc())
        )
        return result.scalars().first()

    async def save_answer(
        self, db: AsyncSession, user_id: uuid.UUID, attempt_id: uuid.UUID, question_id: uuid.UUID, selected_option_id: Optional[uuid.UUID]
    ) -> AssessmentAnswer:
        """
        Stores or updates an answer for an active attempt.
        """
        attempt = await self.get_attempt_by_id(db, attempt_id, user_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Assessment attempt is already submitted and locked."
            )

        # Verify question belongs to attempt
        question_entry = next((aq for aq in attempt.attempt_questions if str(aq.question_id) == str(question_id)), None)
        if not question_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question does not belong to this assessment attempt."
            )

        # Check existing answer entry
        res_ans = await db.execute(
            select(AssessmentAnswer).where(
                AssessmentAnswer.attempt_id == attempt_id,
                AssessmentAnswer.question_id == question_id
            )
        )
        answer = res_ans.scalars().first()

        if answer:
            answer.selected_option_id = selected_option_id
            answer.answered_at = datetime.now(timezone.utc)
        else:
            answer = AssessmentAnswer(
                attempt_id=attempt_id,
                question_id=question_id,
                selected_option_id=selected_option_id,
                answered_at=datetime.now(timezone.utc)
            )
            db.add(answer)

        await db.commit()
        await db.refresh(answer)
        return answer

    async def submit_assessment(self, db: AsyncSession, user_id: uuid.UUID, attempt_id: uuid.UUID) -> Dict[str, Any]:
        """
        Submits and locks an assessment attempt.
        Evaluates correctness on backend, computes skill/category scores, stores snapshots.
        """
        attempt = await self.get_attempt_by_id(db, attempt_id, user_id)
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Assessment attempt has already been submitted."
            )

        questions = [aq.question for aq in attempt.attempt_questions]

        # Fetch all recorded answers for attempt
        res_answers = await db.execute(
            select(AssessmentAnswer).where(AssessmentAnswer.attempt_id == attempt_id)
        )
        existing_answers = res_answers.scalars().all()
        answers_dict = {ans.question_id: ans.selected_option_id for ans in existing_answers}

        # Calculate results via scoring service
        computed = assessment_scoring_service.compute_assessment_result(questions, answers_dict)

        # Update processed answer records in DB
        for pa in computed["processed_answers"]:
            q_id = pa["question_id"]
            sel_opt = pa["selected_option_id"]
            is_corr = pa["is_correct"]
            r_score = pa["raw_score"]
            w_score = pa["weighted_score"]

            res_entry = await db.execute(
                select(AssessmentAnswer).where(
                    AssessmentAnswer.attempt_id == attempt_id,
                    AssessmentAnswer.question_id == q_id
                )
            )
            ans_record = res_entry.scalars().first()
            if not ans_record:
                ans_record = AssessmentAnswer(
                    attempt_id=attempt_id,
                    question_id=q_id,
                    selected_option_id=sel_opt,
                    is_correct=is_corr,
                    raw_score=r_score,
                    weighted_score=w_score,
                    answered_at=datetime.now(timezone.utc)
                )
                db.add(ans_record)
            else:
                ans_record.is_correct = is_corr
                ans_record.raw_score = r_score
                ans_record.weighted_score = w_score

        # Save Skill Scores Snapshots
        for ss in computed["skill_scores"]:
            skill_score_record = AssessmentSkillScore(
                attempt_id=attempt_id,
                skill_id=ss["skill_id"],
                earned_weight=ss["earned_weight"],
                available_weight=ss["available_weight"],
                normalized_score=ss["score"],
                proficiency_level=ss["proficiency"]
            )
            db.add(skill_score_record)

        # Save Category Scores Snapshots
        for cs in computed["category_scores"]:
            cat_score_record = AssessmentCategoryScore(
                attempt_id=attempt_id,
                category=cs["category"],
                earned_weight=cs["earned_weight"],
                available_weight=cs["available_weight"],
                normalized_score=cs["score"],
                proficiency_level=cs["proficiency"]
            )
            db.add(cat_score_record)

        # Lock attempt
        attempt.status = AttemptStatus.SUBMITTED
        attempt.overall_score = computed["overall_score"]
        attempt.submitted_at = datetime.now(timezone.utc)

        # Flush pending AssessmentSkillScore records so they are readable in session
        await db.flush()

        # Sync persistent student skill profile from submitted attempt
        from app.services.skill_profile_service import skill_profile_service
        await skill_profile_service.sync_skill_profile_from_attempt(db, attempt.student_profile_id, attempt.id)

        await db.commit()



        # Re-fetch locked attempt with preloaded relationships
        fresh_attempt = await self.get_attempt_by_id(db, attempt_id, user_id)

        return {
            "attempt_id": fresh_attempt.id,
            "career_role": fresh_attempt.career_role,
            "overall_score": fresh_attempt.overall_score,
            "categories": computed["category_scores"],
            "skills": computed["skill_scores"],
            "strengths": computed["strengths"],
            "weaknesses": computed["weaknesses"],
            "started_at": fresh_attempt.started_at,
            "submitted_at": fresh_attempt.submitted_at
        }

    async def get_assessment_result(self, db: AsyncSession, user_id: uuid.UUID, attempt_id: uuid.UUID) -> Dict[str, Any]:
        """
        Retrieves the result summary for a submitted attempt.
        """
        attempt = await self.get_attempt_by_id(db, attempt_id, user_id)

        questions = [aq.question for aq in attempt.attempt_questions]
        answers_dict = {ans.question_id: ans.selected_option_id for ans in attempt.answers}

        computed = assessment_scoring_service.compute_assessment_result(questions, answers_dict)

        return {
            "attempt_id": attempt.id,
            "career_role": attempt.career_role,
            "overall_score": attempt.overall_score or computed["overall_score"],
            "categories": computed["category_scores"],
            "skills": computed["skill_scores"],
            "strengths": computed["strengths"],
            "weaknesses": computed["weaknesses"],
            "started_at": attempt.started_at,
            "submitted_at": attempt.submitted_at or datetime.now(timezone.utc)
        }

    async def get_assessment_history(self, db: AsyncSession, user_id: uuid.UUID) -> List[AssessmentAttempt]:
        """
        Retrieves past assessment attempts for the authenticated student.
        """
        profile = await student_profile_service.get_or_create_profile(db, user_id)

        result = await db.execute(
            select(AssessmentAttempt)
            .options(selectinload(AssessmentAttempt.career_role))
            .where(AssessmentAttempt.student_profile_id == profile.id)
            .order_by(AssessmentAttempt.created_at.desc())
        )
        return list(result.scalars().all())

assessment_service = AssessmentService()
