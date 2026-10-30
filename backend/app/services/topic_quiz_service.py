import uuid
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.models.topic_quiz import (
    TopicQuizSubject,
    TopicQuizTopic,
    TopicQuizSubtopic,
    TopicQuizQuestion,
    StudentTopicPerformance,
    TopicQuizAttempt,
    QuizDifficulty,
    QuizQuestionType,
    QuizAttemptStatus
)
from app.models.expert_guidance import ExpertProfile
from app.models.domain import StudentProfile
from app.schemas.topic_quiz import (
    QuizGenerateRequest,
    QuizOptionOut,
    QuizQuestionOut,
    QuizEvaluatedQuestionOut,
    RecommendedExpertSummary,
    RecommendedLearningResource,
    QuizResultResponse,
    StudentTopicPerformanceOut,
    StudentTopicAnalyticsResponse,
    PersonalizedQuizRecommendationOut
)
from app.services.expert_recommendation import compute_bayesian_rating


class TopicQuizService:
    @staticmethod
    async def get_all_subjects(db: AsyncSession) -> List[TopicQuizSubject]:
        """
        Retrieves all active subjects with their associated topics and subtopics.
        """
        query = (
            select(TopicQuizSubject)
            .where(TopicQuizSubject.is_active == True)
            .options(
                selectinload(TopicQuizSubject.topics).selectinload(TopicQuizTopic.subtopics)
            )
            .order_by(TopicQuizSubject.display_order, TopicQuizSubject.name)
        )
        res = await db.execute(query)
        subjects = res.scalars().all()
        return list(subjects)

    @staticmethod
    async def get_topics_by_subject(db: AsyncSession, subject_id: uuid.UUID) -> List[TopicQuizTopic]:
        query = (
            select(TopicQuizTopic)
            .where(
                TopicQuizTopic.subject_id == subject_id,
                TopicQuizTopic.is_active == True
            )
            .options(selectinload(TopicQuizTopic.subtopics))
            .order_by(TopicQuizTopic.display_order, TopicQuizTopic.name)
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def get_subtopics_by_topic(db: AsyncSession, topic_id: uuid.UUID) -> List[TopicQuizSubtopic]:
        query = (
            select(TopicQuizSubtopic)
            .where(
                TopicQuizSubtopic.topic_id == topic_id,
                TopicQuizSubtopic.is_active == True
            )
            .order_by(TopicQuizSubtopic.display_order, TopicQuizSubtopic.name)
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @classmethod
    async def generate_quiz(
        cls,
        db: AsyncSession,
        student_user_id: uuid.UUID,
        req: QuizGenerateRequest
    ) -> TopicQuizAttempt:
        """
        Generates a topic-bounded quiz.
        NEVER mixes unrelated questions. Strictly filters by subject, topic, subtopic, and difficulty.
        """
        query = select(TopicQuizQuestion).where(TopicQuizQuestion.is_active == True)

        # Subject Filter
        if req.subject_id:
            query = query.where(TopicQuizQuestion.subject_id == req.subject_id)
        elif req.subject_name:
            query = query.where(TopicQuizQuestion.subject_name.ilike(f"%{req.subject_name.strip()}%"))

        # Topic Filter
        if req.topic_id:
            query = query.where(TopicQuizQuestion.topic_id == req.topic_id)
        elif req.topic_name:
            query = query.where(TopicQuizQuestion.topic_name.ilike(f"%{req.topic_name.strip()}%"))

        # Subtopic Filter (optional)
        if req.subtopic_id:
            query = query.where(TopicQuizQuestion.subtopic_id == req.subtopic_id)
        elif req.subtopic_name and req.subtopic_name.upper() != "ALL":
            query = query.where(TopicQuizQuestion.subtopic_name.ilike(f"%{req.subtopic_name.strip()}%"))

        # Difficulty Filter
        if req.difficulty not in [QuizDifficulty.MIXED, QuizDifficulty.ADAPTIVE]:
            query = query.where(TopicQuizQuestion.difficulty == req.difficulty)

        res = await db.execute(query)
        available_questions = list(res.scalars().all())

        if not available_questions:
            # Fallback check if subject exists to provide meaningful error or graceful broad topic search
            raise ValueError(
                f"No questions found for Subject: '{req.subject_name or req.subject_id}', Topic: '{req.topic_name or req.topic_id}'."
            )

        # Shuffle and limit
        random.shuffle(available_questions)
        selected_questions = available_questions[: req.limit]

        # Snapshot questions into attempt data
        first_q = selected_questions[0]
        subject_name = first_q.subject_name
        topic_name = first_q.topic_name
        subtopic_name = req.subtopic_name or (first_q.subtopic_name if req.subtopic_id else None)

        questions_snapshot = []
        for q in selected_questions:
            questions_snapshot.append({
                "id": str(q.id),
                "question_text": q.question_text,
                "subject_name": q.subject_name,
                "topic_name": q.topic_name,
                "subtopic_name": q.subtopic_name,
                "difficulty": q.difficulty.value if hasattr(q.difficulty, 'value') else str(q.difficulty),
                "question_type": q.question_type.value if hasattr(q.question_type, 'value') else str(q.question_type),
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "clinical_pearl": q.clinical_pearl,
                "tags": q.tags or []
            })

        attempt = TopicQuizAttempt(
            student_user_id=student_user_id,
            subject_name=subject_name,
            topic_name=topic_name,
            subtopic_name=subtopic_name,
            difficulty_mode=req.difficulty.value if hasattr(req.difficulty, 'value') else str(req.difficulty),
            total_questions=len(selected_questions),
            status=QuizAttemptStatus.IN_PROGRESS,
            questions_data=questions_snapshot,
            answers_data=[],
            weak_topics_detected=[],
            recommended_expert_specializations=[],
            recommended_learning_resources=[]
        )

        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
        return attempt

    @classmethod
    async def submit_quiz_attempt(
        cls,
        db: AsyncSession,
        student_user_id: uuid.UUID,
        attempt_id: uuid.UUID,
        answers: List[Dict[str, Any]],
        time_taken_seconds: int = 0
    ) -> QuizResultResponse:
        """
        Evaluates submitted quiz, updates topic performance, detects weak areas,
        and links recommendations for study and experts.
        """
        res = await db.execute(
            select(TopicQuizAttempt).where(
                TopicQuizAttempt.id == attempt_id,
                TopicQuizAttempt.student_user_id == student_user_id
            )
        )
        attempt = res.scalars().first()
        if not attempt:
            raise ValueError("Quiz attempt not found")

        questions_map = {q["id"]: q for q in attempt.questions_data}
        answers_map = {str(a["question_id"]): a["selected_option"] for a in answers}

        evaluated_questions: List[QuizEvaluatedQuestionOut] = []
        correct_count = 0

        # Topic level stats for this attempt
        topic_stats: Dict[str, Dict[str, int]] = {}

        for q_id, q_data in questions_map.items():
            stud_ans = answers_map.get(q_id)
            correct_ans = q_data["correct_answer"]
            is_correct = bool(stud_ans and str(stud_ans).strip().upper() == str(correct_ans).strip().upper())

            if is_correct:
                correct_count += 1

            t_name = q_data["topic_name"]
            if t_name not in topic_stats:
                topic_stats[t_name] = {"total": 0, "correct": 0, "subject": q_data["subject_name"]}
            topic_stats[t_name]["total"] += 1
            if is_correct:
                topic_stats[t_name]["correct"] += 1

            # Format options for output
            raw_options = q_data["options"] or []
            options_out = [
                QuizOptionOut(id=str(opt.get("id", idx)), text=str(opt.get("text", opt)))
                for idx, opt in enumerate(raw_options)
            ]

            evaluated_questions.append(
                QuizEvaluatedQuestionOut(
                    question_id=uuid.UUID(q_id),
                    question_text=q_data["question_text"],
                    subject_name=q_data["subject_name"],
                    topic_name=q_data["topic_name"],
                    subtopic_name=q_data.get("subtopic_name"),
                    difficulty=q_data["difficulty"],
                    options=options_out,
                    student_answer=stud_ans,
                    correct_answer=correct_ans,
                    is_correct=is_correct,
                    explanation=q_data["explanation"],
                    clinical_pearl=q_data.get("clinical_pearl")
                )
            )

        total_q = len(attempt.questions_data)
        incorrect_count = total_q - correct_count
        score_pct = round((correct_count / max(1, total_q)) * 100.0, 1)

        # 1. Update StudentTopicPerformance records
        weak_topics: List[str] = []
        for t_name, stat in topic_stats.items():
            perf_res = await db.execute(
                select(StudentTopicPerformance).where(
                    StudentTopicPerformance.student_user_id == student_user_id,
                    StudentTopicPerformance.topic_name == t_name
                )
            )
            perf = perf_res.scalars().first()

            if not perf:
                perf = StudentTopicPerformance(
                    student_user_id=student_user_id,
                    subject_name=stat["subject"],
                    topic_name=t_name,
                    total_questions_answered=stat["total"],
                    total_correct=stat["correct"],
                    mastery_percentage=round((stat["correct"] / max(1, stat["total"])) * 100.0, 1),
                    quizzes_taken_count=1,
                    last_practiced_at=datetime.now(timezone.utc)
                )
                perf.is_weak_area = perf.mastery_percentage < 65.0
                db.add(perf)
            else:
                perf.total_questions_answered += stat["total"]
                perf.total_correct += stat["correct"]
                perf.mastery_percentage = round((perf.total_correct / max(1, perf.total_questions_answered)) * 100.0, 1)
                perf.quizzes_taken_count += 1
                perf.is_weak_area = (perf.mastery_percentage < 65.0 and perf.total_questions_answered >= 5)
                perf.last_practiced_at = datetime.now(timezone.utc)

            if perf.mastery_percentage < 65.0 or (stat["correct"] / max(1, stat["total"])) < 0.65:
                weak_topics.append(t_name)

        # 2. Find Recommended Experts in this Subject / Weak Topics
        target_subject = attempt.subject_name
        subject_keywords = [w.lower() for w in target_subject.replace("(", " ").replace(")", " ").split() if len(w) > 3]

        experts_res = await db.execute(
            select(ExpertProfile).order_by(desc(ExpertProfile.bayesian_score))
        )
        all_experts = list(experts_res.scalars().all())

        recommended_experts: List[RecommendedExpertSummary] = []
        for exp in all_experts:
            exp_terms = [exp.specialization.lower()] + [a.lower() for a in (exp.areas_of_expertise or [])]
            matches = any(any(kw in term or term in kw for kw in subject_keywords) for term in exp_terms) or any(
                any(wt.lower() in term for term in exp_terms) for wt in weak_topics
            )
            if matches:
                bayes = compute_bayesian_rating(exp.average_rating, exp.total_ratings)
                recommended_experts.append(
                    RecommendedExpertSummary(
                        expert_id=exp.id,
                        user_id=exp.user_id,
                        full_name=exp.full_name,
                        specialization=exp.specialization,
                        institution=exp.institution_or_clinic,
                        average_rating=round(exp.average_rating or 5.0, 1),
                        total_ratings=exp.total_ratings or 0,
                        bayesian_score=round(bayes, 2),
                        total_points=getattr(exp, "total_points", 1250),
                        current_streak=getattr(exp, "current_streak", 12),
                        regularity_score=getattr(exp, "regularity_score", 96.0),
                        reason=f"Top clinician specializing in {exp.specialization} to guide you in {attempt.topic_name}"
                    )
                )

        # Fallback if no direct keyword match
        if not recommended_experts and all_experts:
            for exp in all_experts[:3]:
                bayes = compute_bayesian_rating(exp.average_rating, exp.total_ratings)
                recommended_experts.append(
                    RecommendedExpertSummary(
                        expert_id=exp.id,
                        user_id=exp.user_id,
                        full_name=exp.full_name,
                        specialization=exp.specialization,
                        institution=exp.institution_or_clinic,
                        average_rating=round(exp.average_rating or 5.0, 1),
                        total_ratings=exp.total_ratings or 0,
                        bayesian_score=round(bayes, 2),
                        total_points=getattr(exp, "total_points", 1250),
                        current_streak=getattr(exp, "current_streak", 12),
                        regularity_score=getattr(exp, "regularity_score", 96.0),
                        reason=f"Top rated Ayurvedic faculty to guide your clinical practice in {attempt.topic_name}"
                    )
                )

        # 3. Formulate Recommended Learning Resources
        rec_resources: List[RecommendedLearningResource] = [
            RecommendedLearningResource(
                id="rec-1",
                title=f"Clinical Foundations & Pharmacology of {attempt.topic_name}",
                resource_type="RECORDED_LECTURE",
                category=attempt.subject_name,
                url="/student/sessions",
                description=f"Comprehensive masterclass recording with practical formulations and diagnosis protocols for {attempt.topic_name}."
            ),
            RecommendedLearningResource(
                id="rec-2",
                title=f"Classical Treatise Notes: {attempt.subject_name} ({attempt.topic_name})",
                resource_type="STUDY_MODULE",
                category=attempt.subject_name,
                url="/learning",
                description=f"Curated shloka translations, indications, and dosage charts for {attempt.topic_name}."
            )
        ]

        # 4. Finalize Attempt record
        attempt.status = QuizAttemptStatus.COMPLETED
        attempt.answers_data = [
            {"question_id": str(a.get("question_id", "")), "selected_option": str(a.get("selected_option", ""))}
            for a in answers
        ]
        attempt.correct_count = correct_count
        attempt.incorrect_count = incorrect_count
        attempt.score_percentage = score_pct
        attempt.time_taken_seconds = time_taken_seconds
        attempt.weak_topics_detected = weak_topics
        attempt.recommended_expert_specializations = [e.specialization for e in recommended_experts[:3]]
        attempt.recommended_learning_resources = [r.model_dump() for r in rec_resources]
        attempt.submitted_at = datetime.now(timezone.utc)

        await db.commit()

        return QuizResultResponse(
            attempt_id=attempt.id,
            subject_name=attempt.subject_name,
            topic_name=attempt.topic_name,
            subtopic_name=attempt.subtopic_name,
            difficulty_mode=attempt.difficulty_mode,
            total_questions=total_q,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            score_percentage=score_pct,
            time_taken_seconds=time_taken_seconds,
            status=attempt.status.value if hasattr(attempt.status, 'value') else str(attempt.status),
            evaluated_questions=evaluated_questions,
            weak_topics_detected=weak_topics,
            recommended_experts=recommended_experts[:3],
            recommended_learning_resources=rec_resources,
            submitted_at=attempt.submitted_at
        )

    @classmethod
    async def get_student_topic_analytics(cls, db: AsyncSession, student_user_id: uuid.UUID) -> StudentTopicAnalyticsResponse:
        """
        Retrieves topic mastery breakdown and weak area alerts.
        """
        res = await db.execute(
            select(StudentTopicPerformance)
            .where(StudentTopicPerformance.student_user_id == student_user_id)
            .order_by(StudentTopicPerformance.mastery_percentage)
        )
        performances = list(res.scalars().all())

        if not performances:
            return StudentTopicAnalyticsResponse(
                overall_mastery=0.0,
                total_quizzes_taken=0,
                total_questions_practiced=0,
                strong_topics=[],
                weak_topics=[],
                topic_breakdown=[]
            )

        total_ans = sum(p.total_questions_answered for p in performances)
        total_corr = sum(p.total_correct for p in performances)
        total_quizzes = sum(p.quizzes_taken_count for p in performances)
        overall_pct = round((total_corr / max(1, total_ans)) * 100.0, 1)

        weak_list = [
            StudentTopicPerformanceOut.model_validate(p)
            for p in performances if p.mastery_percentage < 65.0
        ]
        strong_list = [
            StudentTopicPerformanceOut.model_validate(p)
            for p in performances if p.mastery_percentage >= 80.0
        ]
        breakdown = [StudentTopicPerformanceOut.model_validate(p) for p in performances]

        return StudentTopicAnalyticsResponse(
            overall_mastery=overall_pct,
            total_quizzes_taken=total_quizzes,
            total_questions_practiced=total_ans,
            strong_topics=strong_list,
            weak_topics=weak_list,
            topic_breakdown=breakdown
        )

    @classmethod
    async def get_personalized_recommendations(
        cls,
        db: AsyncSession,
        student_user_id: uuid.UUID
    ) -> List[PersonalizedQuizRecommendationOut]:
        """
        Recommends targeted quizzes based on weak topics and career focus.
        """
        recs: List[PersonalizedQuizRecommendationOut] = []

        # 1. From Weak Topics
        res = await db.execute(
            select(StudentTopicPerformance)
            .where(
                StudentTopicPerformance.student_user_id == student_user_id,
                StudentTopicPerformance.mastery_percentage < 65.0
            )
            .order_by(StudentTopicPerformance.mastery_percentage)
        )
        weak_perfs = res.scalars().all()

        for wp in weak_perfs:
            recs.append(
                PersonalizedQuizRecommendationOut(
                    subject_name=wp.subject_name,
                    topic_name=wp.topic_name,
                    difficulty="MEDIUM",
                    recommendation_reason=f"Practice to improve your mastery ({wp.mastery_percentage:.0f}%)",
                    weak_mastery_pct=wp.mastery_percentage,
                    icon="Target"
                )
            )

        # 2. Add Curated Core Clinical Topics if few recommendations
        if len(recs) < 4:
            core_topics = [
                ("Panchakarma", "Vamana", "EASY", "High-yield Shodhana protocols for exams and clinical practice"),
                ("Dravyaguna", "Medicinal Plants", "MEDIUM", "Master classical botanical markers and therapeutic actions"),
                ("Rasashastra", "Bhasma", "MEDIUM", "Standardization and safety parameters for metallic preparations"),
                ("Kayachikitsa", "Digestive Disorders", "MEDIUM", "Grahani and Agni management algorithms")
            ]
            for subj, top, diff, reason in core_topics:
                if not any(r.topic_name == top for r in recs):
                    recs.append(
                        PersonalizedQuizRecommendationOut(
                            subject_name=subj,
                            topic_name=top,
                            difficulty=diff,
                            recommendation_reason=reason,
                            icon="Sparkles"
                        )
                    )

        return recs[:6]
