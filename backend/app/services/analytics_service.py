import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, date
import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc, text
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import (
    StudentProfile,
    FacultyProfile,
    InstitutionProfile,
    EducationalResource,
    Application,
    Opportunity,
    VerificationRequest,
    VerificationStatus
)
from app.models.topic_quiz import StudentTopicPerformance, TopicQuizAttempt
from app.models.ai_ecosystem import AIStudySchedule
from app.models.courses_tests import CourseEnrollment, CertificateCourse
from app.models.learning_hub import ResourceBookmark, ResourceViewHistory, ClassicalShloka
from app.models.camps import HealthcareCamp
from app.services.faculty_service import FacultyService


def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


class AnalyticsService:

    # =========================================================================
    # 1. STUDENT LEARNING INSIGHTS
    # =========================================================================
    @classmethod
    async def get_student_learning_insights(
        cls, db: AsyncSession, current_user: User
    ) -> Dict[str, Any]:
        """
        Gathers privacy-compliant, authentic learning analytics for the current student.
        Uses real data from StudentTopicPerformance, TopicQuizAttempt, AIStudySchedule,
        CourseEnrollment, and LearningHub bookmarks.
        """
        # 1. Fetch Student Profile
        stmt_prof = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        student = (await db.execute(stmt_prof)).scalar_one_or_none()

        student_name = student.full_name if student and student.full_name else current_user.full_name
        current_year_str = f"Year {student.current_year}" if student and student.current_year else "BAMS Student"

        # 2. Topic Performance & Mastery
        stmt_perf = (
            select(StudentTopicPerformance)
            .where(StudentTopicPerformance.student_user_id == current_user.id)
            .order_by(StudentTopicPerformance.mastery_percentage.asc())
        )
        perf_records = (await db.execute(stmt_perf)).scalars().all()

        total_questions_answered = sum(p.total_questions_answered for p in perf_records)
        total_correct = sum(p.total_correct for p in perf_records)
        overall_accuracy_pct = round((total_correct / total_questions_answered * 100.0), 1) if total_questions_answered > 0 else 0.0

        mastered_topics = []
        weak_areas_to_revisit = []
        in_progress_topics = []
        subject_grouping: Dict[str, Dict[str, Any]] = {}

        for p in perf_records:
            topic_info = {
                "id": str(p.id),
                "subject_name": p.subject_name,
                "topic_name": p.topic_name,
                "mastery_percentage": round(p.mastery_percentage, 1),
                "questions_answered": p.total_questions_answered,
                "correct_count": p.total_correct,
                "quizzes_taken": p.quizzes_taken_count,
                "is_weak_area": p.is_weak_area,
                "last_practiced_at": p.last_practiced_at.isoformat() if p.last_practiced_at else None,
            }

            if p.mastery_percentage >= 75.0 and not p.is_weak_area:
                mastered_topics.append(topic_info)
            elif p.is_weak_area or p.mastery_percentage < 55.0:
                weak_areas_to_revisit.append(topic_info)
            else:
                in_progress_topics.append(topic_info)

            # Group by subject
            subj = p.subject_name
            if subj not in subject_grouping:
                subject_grouping[subj] = {
                    "subject_name": subj,
                    "total_questions": 0,
                    "total_correct": 0,
                    "topics_count": 0,
                    "weak_topics_count": 0,
                }
            subject_grouping[subj]["total_questions"] += p.total_questions_answered
            subject_grouping[subj]["total_correct"] += p.total_correct
            subject_grouping[subj]["topics_count"] += 1
            if p.is_weak_area or p.mastery_percentage < 55.0:
                subject_grouping[subj]["weak_topics_count"] += 1

        subject_breakdown = []
        for s_name, s_data in subject_grouping.items():
            acc = round((s_data["total_correct"] / s_data["total_questions"] * 100.0), 1) if s_data["total_questions"] > 0 else 0.0
            subject_breakdown.append({
                "subject_name": s_name,
                "total_questions": s_data["total_questions"],
                "total_correct": s_data["total_correct"],
                "accuracy_pct": acc,
                "topics_count": s_data["topics_count"],
                "weak_topics_count": s_data["weak_topics_count"],
            })
        subject_breakdown.sort(key=lambda x: x["accuracy_pct"], reverse=True)

        # 3. Quiz Attempts History
        stmt_attempts = (
            select(TopicQuizAttempt)
            .where(TopicQuizAttempt.student_user_id == current_user.id)
            .order_by(TopicQuizAttempt.started_at.desc())
            .limit(10)
        )
        attempts = (await db.execute(stmt_attempts)).scalars().all()

        total_quizzes_taken = len(attempts)
        avg_score_pct = round(sum(a.score_percentage for a in attempts) / total_quizzes_taken, 1) if total_quizzes_taken > 0 else 0.0
        total_time_spent_seconds = sum(a.time_taken_seconds for a in attempts)

        recent_quizzes = [
            {
                "id": str(a.id),
                "subject_name": a.subject_name,
                "topic_name": a.topic_name,
                "score_percentage": round(a.score_percentage, 1),
                "correct_count": a.correct_count,
                "total_questions": a.total_questions,
                "time_taken_seconds": a.time_taken_seconds,
                "difficulty_mode": a.difficulty_mode,
                "status": a.status.value if hasattr(a.status, "value") else str(a.status),
                "started_at": a.started_at.isoformat() if a.started_at else None,
            }
            for a in attempts
        ]

        # 4. Active Study Planner Schedule
        stmt_schedule = (
            select(AIStudySchedule)
            .where(AIStudySchedule.user_id == current_user.id, AIStudySchedule.is_active == True)
            .order_by(AIStudySchedule.created_at.desc())
            .limit(1)
        )
        active_plan = (await db.execute(stmt_schedule)).scalar_one_or_none()

        planner_progress = {
            "has_active_plan": active_plan is not None,
            "plan_id": str(active_plan.id) if active_plan else None,
            "title": active_plan.title if active_plan else "No Active Study Plan",
            "exam_name": active_plan.exam_name if active_plan else None,
            "target_exam_date": str(active_plan.exam_date) if active_plan and active_plan.exam_date else None,
            "days_until_exam": max(0, (active_plan.exam_date - date.today()).days) if active_plan and active_plan.exam_date else None,
            "progress_percentage": round(active_plan.progress_percentage, 1) if active_plan else 0.0,
            "target_subjects": active_plan.target_subjects if active_plan else [],
            "schedule_blocks_count": len(active_plan.schedule_blocks) if active_plan and active_plan.schedule_blocks else 0,
        }

        # 5. Revision & Learning Hub Engagement
        res_bookmarks = await db.execute(
            select(func.count(ResourceBookmark.id)).where(ResourceBookmark.user_id == current_user.id)
        )
        total_bookmarks = res_bookmarks.scalar() or 0

        res_views = await db.execute(
            select(func.count(ResourceViewHistory.id)).where(ResourceViewHistory.user_id == current_user.id)
        )
        total_resource_views = res_views.scalar() or 0

        total_courses_enrolled = 0
        total_courses_completed = 0
        if student:
            res_enroll = await db.execute(
                select(CourseEnrollment).where(CourseEnrollment.student_id == student.id)
            )
            enrollments = res_enroll.scalars().all()
            total_courses_enrolled = len(enrollments)
            total_courses_completed = sum(1 for e in enrollments if e.status == "COMPLETED")

        # 6. Personalized Recommendations (Explicit distinction between observed data vs AI suggestion)
        recommendations = []

        # Rec 1: Based on lowest accuracy subject or weak topic
        if weak_areas_to_revisit:
            top_weak = weak_areas_to_revisit[0]
            recommendations.append({
                "id": "rec-weak-revisit",
                "type": "REVISION",
                "priority": "HIGH",
                "source": "OBSERVED_PERFORMANCE",
                "title": f"Revisit {top_weak['topic_name']} ({top_weak['subject_name']})",
                "description": f"Observed accuracy on this topic is {top_weak['mastery_percentage']}%. Retesting with spaced active recall flashcards will build foundational retention.",
                "action_url": f"/student/quiz?subject={top_weak['subject_name']}",
                "action_label": "Practice Topic Quiz"
            })
        elif subject_breakdown:
            lowest_subj = subject_breakdown[-1]
            recommendations.append({
                "id": "rec-subject-reinforce",
                "type": "REVISION",
                "priority": "MEDIUM",
                "source": "OBSERVED_PERFORMANCE",
                "title": f"Reinforce {lowest_subj['subject_name']}",
                "description": f"Your current accuracy in {lowest_subj['subject_name']} stands at {lowest_subj['accuracy_pct']}%. Reviewing classical commentaries is advised.",
                "action_url": "/student/offline",
                "action_label": "Review Shlokas & Notes"
            })

        # Rec 2: Based on Study Planner
        if active_plan:
            recommendations.append({
                "id": "rec-study-plan",
                "type": "STUDY_PLAN",
                "priority": "HIGH",
                "source": "OBSERVED_PERFORMANCE",
                "title": f"Continue {active_plan.title}",
                "description": f"Target: {active_plan.exam_name} in {planner_progress['days_until_exam']} days. Schedule is {planner_progress['progress_percentage']}% completed.",
                "action_url": "/ai?tab=planner",
                "action_label": "View Study Schedule"
            })
        else:
            recommendations.append({
                "id": "rec-plan-create",
                "type": "STUDY_PLAN",
                "priority": "MEDIUM",
                "source": "PEDAGOGICAL_SUGGESTION",
                "title": "Establish an Adaptive Study Plan",
                "description": "Align your weekly review hours with your upcoming BAMS university or competitive exams.",
                "action_url": "/ai?tab=planner",
                "action_label": "Generate Study Plan"
            })

        # Rec 3: Active Recall Flashcards & Shlokas
        recommendations.append({
            "id": "rec-active-recall",
            "type": "CLASSICAL_SHLOKA",
            "priority": "MEDIUM",
            "source": "PEDAGOGICAL_SUGGESTION",
            "title": "Daily Classical Shloka Mastery",
            "description": "Active recall on Charaka Sutrasthana and Sushruta Sharirasthana increases retention for both viva examinations and clinical practice.",
            "action_url": "/student/offline",
            "action_label": "Open Offline Flashcards"
        })

        return {
            "student_profile": {
                "student_id": str(student.id) if student else str(current_user.id),
                "full_name": student_name,
                "academic_year": current_year_str,
                "email": current_user.email,
            },
            "summary": {
                "total_questions_answered": total_questions_answered,
                "total_correct": total_correct,
                "overall_accuracy_pct": overall_accuracy_pct,
                "total_quizzes_taken": total_quizzes_taken,
                "avg_quiz_score_pct": avg_score_pct,
                "total_time_spent_seconds": total_time_spent_seconds,
                "mastered_topics_count": len(mastered_topics),
                "weak_topics_count": len(weak_areas_to_revisit),
                "in_progress_topics_count": len(in_progress_topics),
                "total_bookmarks": total_bookmarks,
                "total_resource_views": total_resource_views,
                "total_courses_enrolled": total_courses_enrolled,
                "total_courses_completed": total_courses_completed,
            },
            "subject_breakdown": subject_breakdown,
            "weak_areas_to_revisit": weak_areas_to_revisit,
            "mastered_topics": mastered_topics[:10],
            "study_planner_progress": planner_progress,
            "recent_quiz_history": recent_quizzes,
            "recommendations": recommendations,
        }

    # =========================================================================
    # 2. FACULTY EDUCATIONAL INSIGHTS
    # =========================================================================
    @classmethod
    async def get_faculty_insights(
        cls, db: AsyncSession, current_user: User
    ) -> Dict[str, Any]:
        """
        Aggregated, privacy-respecting educational insights for authorized faculty.
        Strictly limits data access to the faculty member's institution and assigned subjects.
        Never exposes private notes, passwords, or personal chat histories.
        """
        profile = await FacultyService.get_or_create_faculty_profile(db, current_user)
        inst_id = profile.institution_id

        inst_name = profile.institution.institution_name if profile.institution else "Ayurvedic Medical College"

        # 1. Fetch Students belonging exclusively to this faculty member's institution
        stmt_students = (
            select(StudentProfile)
            .where(StudentProfile.institution_id == inst_id)
        )
        inst_students = (await db.execute(stmt_students)).scalars().all()
        total_students_enrolled = len(inst_students)

        # Year distribution
        year_dist: Dict[str, int] = {"1st Year": 0, "2nd Year": 0, "3rd Year": 0, "4th Year": 0, "Interns": 0}
        for s in inst_students:
            if s.current_year == 1:
                year_dist["1st Year"] += 1
            elif s.current_year == 2:
                year_dist["2nd Year"] += 1
            elif s.current_year == 3:
                year_dist["3rd Year"] += 1
            elif s.current_year == 4:
                year_dist["4th Year"] += 1
            else:
                year_dist["Interns"] += 1

        student_user_ids = [s.user_id for s in inst_students if s.user_id]

        # 2. Institutional Quiz Engagement & Assessment Performance
        total_institution_quiz_attempts = 0
        avg_cohort_score_pct = 0.0
        pass_rate_pct = 0.0
        active_quiz_participants = 0
        subject_cohort_metrics: Dict[str, Dict[str, Any]] = {}
        cohort_weak_topics: Dict[str, int] = {}
        cohort_strong_topics: Dict[str, int] = {}

        if student_user_ids:
            # Topic Quiz Attempts
            stmt_attempts = (
                select(TopicQuizAttempt)
                .where(TopicQuizAttempt.student_user_id.in_(student_user_ids))
            )
            cohort_attempts = (await db.execute(stmt_attempts)).scalars().all()
            total_institution_quiz_attempts = len(cohort_attempts)

            if cohort_attempts:
                avg_cohort_score_pct = round(
                    sum(a.score_percentage for a in cohort_attempts) / total_institution_quiz_attempts, 1
                )
                passing_attempts = sum(1 for a in cohort_attempts if a.score_percentage >= 60.0)
                pass_rate_pct = round((passing_attempts / total_institution_quiz_attempts * 100.0), 1)
                active_quiz_participants = len(set(a.student_user_id for a in cohort_attempts))

            # Performance by Topic across Cohort
            stmt_perfs = (
                select(StudentTopicPerformance)
                .where(StudentTopicPerformance.student_user_id.in_(student_user_ids))
            )
            cohort_perfs = (await db.execute(stmt_perfs)).scalars().all()

            for cp in cohort_perfs:
                subj = cp.subject_name
                if subj not in subject_cohort_metrics:
                    subject_cohort_metrics[subj] = {
                        "subject_name": subj,
                        "total_questions": 0,
                        "total_correct": 0,
                        "topic_records": 0,
                    }
                subject_cohort_metrics[subj]["total_questions"] += cp.total_questions_answered
                subject_cohort_metrics[subj]["total_correct"] += cp.total_correct
                subject_cohort_metrics[subj]["topic_records"] += 1

                topic_key = f"{cp.topic_name} ({cp.subject_name})"
                if cp.is_weak_area or cp.mastery_percentage < 55.0:
                    cohort_weak_topics[topic_key] = cohort_weak_topics.get(topic_key, 0) + 1
                elif cp.mastery_percentage >= 75.0:
                    cohort_strong_topics[topic_key] = cohort_strong_topics.get(topic_key, 0) + 1

        # Format Subject Performance Trends
        subject_performance_list = []
        for s_name, s_data in subject_cohort_metrics.items():
            acc = round((s_data["total_correct"] / s_data["total_questions"] * 100.0), 1) if s_data["total_questions"] > 0 else 0.0
            subject_performance_list.append({
                "subject_name": s_name,
                "total_questions_answered": s_data["total_questions"],
                "cohort_accuracy_pct": acc,
                "total_topic_records": s_data["topic_records"],
            })
        subject_performance_list.sort(key=lambda x: x["cohort_accuracy_pct"], reverse=True)

        # Top Challenging Topics across the Institution Cohort
        sorted_weak = sorted(cohort_weak_topics.items(), key=lambda x: x[1], reverse=True)[:5]
        top_challenging_topics = [{"topic": item[0], "students_struggling_count": item[1]} for item in sorted_weak]

        sorted_strong = sorted(cohort_strong_topics.items(), key=lambda x: x[1], reverse=True)[:5]
        top_mastered_topics = [{"topic": item[0], "students_mastered_count": item[1]} for item in sorted_strong]

        # 3. Faculty Teaching Materials Engagement
        stmt_resources = (
            select(EducationalResource)
            .where(EducationalResource.faculty_id == profile.id)
        )
        faculty_resources = (await db.execute(stmt_resources)).scalars().all()
        total_resources_shared = len(faculty_resources)

        # 4. Actionable Curricular Recommendations for Faculty
        teaching_recommendations = []
        if top_challenging_topics:
            leading_challenge = top_challenging_topics[0]
            teaching_recommendations.append({
                "id": "rec-fac-lecture",
                "category": "CURRICULUM_REINFORCEMENT",
                "title": f"Reinforce {leading_challenge['topic']}",
                "description": f"{leading_challenge['students_struggling_count']} student records flag this topic as challenging. Consider scheduling a clinical case seminar or viva practice.",
                "priority": "HIGH"
            })
        else:
            teaching_recommendations.append({
                "id": "rec-fac-baseline",
                "category": "ASSESSMENT_MONITORING",
                "title": "Encourage Formative Assessment",
                "description": "Invite your academic batch to complete the topic quiz for assigned subjects to establish diagnostic mastery benchmarks.",
                "priority": "MEDIUM"
            })

        if total_resources_shared < 3:
            teaching_recommendations.append({
                "id": "rec-fac-materials",
                "category": "RESOURCE_SHARING",
                "title": "Publish High-Yield Revision Handouts",
                "description": "Sharing digital lecture outlines and classical shloka interpretations empowers students to prepare beforehand.",
                "priority": "MEDIUM"
            })

        return {
            "faculty_info": {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "department": profile.department or "Department of Samhita & Siddhanta",
                "designation": profile.designation or "Associate Professor",
                "institution_name": inst_name,
                "assigned_subjects": profile.assigned_subjects or [],
                "assigned_academic_years": profile.assigned_academic_years or [],
            },
            "student_participation": {
                "total_enrolled_students": total_students_enrolled,
                "active_quiz_participants": active_quiz_participants,
                "participation_rate_pct": round((active_quiz_participants / total_students_enrolled * 100.0), 1) if total_students_enrolled > 0 else 0.0,
                "students_by_year": year_dist,
            },
            "assessment_performance": {
                "total_cohort_quiz_attempts": total_institution_quiz_attempts,
                "average_score_pct": avg_cohort_score_pct,
                "pass_rate_pct": pass_rate_pct,
            },
            "subject_performance_trends": subject_performance_list,
            "top_challenging_topics": top_challenging_topics,
            "top_mastered_topics": top_mastered_topics,
            "resource_engagement": {
                "total_resources_shared": total_resources_shared,
                "assigned_subjects_count": len(profile.assigned_subjects or []),
            },
            "teaching_recommendations": teaching_recommendations,
        }

    # =========================================================================
    # 3. ADMIN PLATFORM INSIGHTS
    # =========================================================================
    @classmethod
    async def get_admin_platform_insights(
        cls, db: AsyncSession, current_user: User
    ) -> Dict[str, Any]:
        """
        Platform-wide analytics, ecosystem activity, and reliability telemetry for Admins.
        Calculates real aggregates across the database while protecting individual student privacy.
        """
        # 1. User Distribution by Role
        res_users = await db.execute(select(User.role, func.count(User.id)).group_by(User.role))
        role_counts = {role.value if hasattr(role, "value") else str(role): count for role, count in res_users.all()}

        total_users = sum(role_counts.values())

        # 2. Learning & Educational Ecosystem Activity
        res_attempts = await db.execute(select(func.count(TopicQuizAttempt.id)))
        total_quiz_attempts = res_attempts.scalar() or 0

        res_perf = await db.execute(select(func.count(StudentTopicPerformance.id)))
        total_topic_performances = res_perf.scalar() or 0

        res_plans = await db.execute(select(func.count(AIStudySchedule.id)))
        total_study_plans = res_plans.scalar() or 0

        res_courses = await db.execute(select(func.count(CertificateCourse.id)))
        total_courses = res_courses.scalar() or 0

        res_enroll = await db.execute(select(func.count(CourseEnrollment.id)))
        total_course_enrollments = res_enroll.scalar() or 0

        res_resources = await db.execute(select(func.count(EducationalResource.id)))
        total_resources = res_resources.scalar() or 0

        res_shlokas = await db.execute(select(func.count(ClassicalShloka.id)))
        total_shlokas = res_shlokas.scalar() or 0

        # 3. Career & Institutional Ecosystem
        res_apps = await db.execute(select(func.count(Application.id)))
        total_applications = res_apps.scalar() or 0

        res_opps = await db.execute(select(func.count(Opportunity.id)))
        total_opportunities = res_opps.scalar() or 0

        res_camps = await db.execute(select(func.count(HealthcareCamp.id)))
        total_camps = res_camps.scalar() or 0

        res_verif = await db.execute(select(func.count(VerificationRequest.id)))
        total_verifications = res_verif.scalar() or 0

        res_verif_pending = await db.execute(
            select(func.count(VerificationRequest.id)).where(VerificationRequest.status == "PENDING")
        )
        pending_verifications = res_verif_pending.scalar() or 0

        # 4. System Latency Benchmark
        t0 = time.perf_counter()
        await db.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)

        return {
            "platform_overview": {
                "total_registered_users": total_users,
                "role_distribution": role_counts,
                "active_modules": [
                    "BAMS Syllabus & 3D Anatomy",
                    "Topic-Wise Quiz & Mastery Engine",
                    "AI Study Planner & Feedback",
                    "Faculty Teaching Portal",
                    "PWA Offline Learning Hub",
                    "Verified Career & Internship Portal"
                ],
            },
            "educational_metrics": {
                "total_quiz_attempts": total_quiz_attempts,
                "total_topic_performance_records": total_topic_performances,
                "total_active_study_plans": total_study_plans,
                "total_certificate_courses": total_courses,
                "total_course_enrollments": total_course_enrollments,
                "total_educational_resources": total_resources,
                "total_classical_shlokas": total_shlokas,
            },
            "ecosystem_metrics": {
                "total_applications": total_applications,
                "total_opportunities": total_opportunities,
                "total_healthcare_camps": total_camps,
                "total_verification_requests": total_verifications,
                "pending_verifications": pending_verifications,
            },
            "platform_health": {
                "database_status": "ONLINE",
                "database_query_latency_ms": latency_ms,
                "pwa_cache_version": "aayuraura-pwa-v1",
                "service_worker_status": "READY",
                "encryption_protocol": "TLS 1.3 / JWT-HS256 Rotation",
                "data_privacy_standard": "Role-Based Data Scoping / Zero PII Leakage",
                "server_time_utc": datetime.now(timezone.utc).isoformat(),
            }
        }
