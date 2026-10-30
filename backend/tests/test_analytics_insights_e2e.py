import pytest
import uuid
from datetime import datetime, timezone, date, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.models.domain import StudentProfile, FacultyProfile, InstitutionProfile, VerificationStatus
from app.models.topic_quiz import StudentTopicPerformance, TopicQuizAttempt, QuizAttemptStatus
from app.models.ai_ecosystem import AIStudySchedule
from app.db.init_db import init_db

client = TestClient(app)


@pytest.mark.asyncio
async def test_analytics_and_insights_system_e2e():
    # 1. Create tables & Initialize Database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    unique_suffix = uuid.uuid4().hex[:6]
    student_user_id = None
    faculty_user_id = None
    admin_user_id = None

    async with AsyncSessionLocal() as session:
        await init_db(session)

        # Create Institution User & Profile
        inst_user = User(
            email=f"analytics_inst_{unique_suffix}@ayursetu.edu",
            hashed_password=get_password_hash("password123"),
            role=UserRole.INSTITUTION,
            is_active=True,
            is_verified=True
        )
        session.add(inst_user)
        await session.commit()
        await session.refresh(inst_user)

        institution = InstitutionProfile(
            user_id=inst_user.id,
            institution_name=f"Govt Ayurvedic Medical College {unique_suffix}",
            aishe_code=f"AISHE-ANALYTICS-{unique_suffix}",
            state="Maharashtra",
            city="Pune",
            verification_status=VerificationStatus.VERIFIED
        )
        session.add(institution)
        await session.commit()
        await session.refresh(institution)

        # Create Student User & Profile
        student_user = User(
            email=f"analytics_student_{unique_suffix}@ayursetu.edu",
            hashed_password=get_password_hash("password123"),
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True
        )
        session.add(student_user)
        await session.commit()
        await session.refresh(student_user)

        student_prof = StudentProfile(
            user_id=student_user.id,
            institution_id=institution.id,
            full_name=f"Vaidya Candidate {unique_suffix}",
            current_year=2,
            academic_year=2026,
            degree_program="BAMS"
        )
        session.add(student_prof)

        # Create Faculty User & Profile
        faculty_user = User(
            email=f"analytics_faculty_{unique_suffix}@ayursetu.edu",
            hashed_password=get_password_hash("password123"),
            role=UserRole.FACULTY,
            is_active=True,
            is_verified=True
        )
        session.add(faculty_user)
        await session.commit()
        await session.refresh(faculty_user)

        faculty_prof = FacultyProfile(
            user_id=faculty_user.id,
            institution_id=institution.id,
            full_name=f"Prof. Vaidya Raman {unique_suffix}",
            department="Department of Dravyaguna",
            designation="Professor & HOD",
            assigned_subjects=[
                {"id": "dravyaguna", "name": "Dravyaguna Vijnana", "academic_year": "2nd Year"},
                {"id": "rachana_sharir", "name": "Rachana Sharir", "academic_year": "1st Year"}
            ],
            assigned_academic_years=["1st Year", "2nd Year"],
            is_active=True
        )
        session.add(faculty_prof)

        # Create Admin User
        admin_user = User(
            email=f"analytics_admin_{unique_suffix}@ayursetu.edu",
            hashed_password=get_password_hash("password123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)

        # Seed Authentic Student Performance Data
        # A. Mastered topic
        perf_mastered = StudentTopicPerformance(
            student_user_id=student_user.id,
            subject_name="Dravyaguna Vijnana",
            topic_name="Materia Medica of Ashwagandha",
            total_questions_answered=20,
            total_correct=18,
            mastery_percentage=90.0,
            is_weak_area=False,
            quizzes_taken_count=2
        )
        # B. Weak area needing revision
        perf_weak = StudentTopicPerformance(
            student_user_id=student_user.id,
            subject_name="Rachana Sharir",
            topic_name="Marma Sharir Classification",
            total_questions_answered=15,
            total_correct=6,
            mastery_percentage=40.0,
            is_weak_area=True,
            quizzes_taken_count=1
        )
        session.add(perf_mastered)
        session.add(perf_weak)

        # Seed Topic Quiz Attempt
        attempt = TopicQuizAttempt(
            student_user_id=student_user.id,
            subject_name="Dravyaguna Vijnana",
            topic_name="Materia Medica of Ashwagandha",
            difficulty_mode="MEDIUM",
            total_questions=10,
            correct_count=9,
            incorrect_count=1,
            score_percentage=90.0,
            time_taken_seconds=340,
            status=QuizAttemptStatus.COMPLETED
        )
        session.add(attempt)

        # Seed AI Study Schedule
        plan = AIStudySchedule(
            user_id=student_user.id,
            title="BAMS 2nd Professional Exam Sprint",
            exam_name="Annual NCISM Professional Assessment",
            exam_date=date.today() + timedelta(days=45),
            available_hours_daily=4.0,
            target_subjects=["Dravyaguna Vijnana", "Rachana Sharir"],
            weak_topics=["Marma Sharir Classification"],
            progress_percentage=35.0,
            schedule_blocks=[{"day": 1, "completed": True}, {"day": 2, "completed": False}],
            is_active=True
        )
        session.add(plan)

        await session.commit()

        student_user_id = student_user.id
        faculty_user_id = faculty_user.id
        admin_user_id = admin_user.id

    student_token = create_access_token(subject=str(student_user_id), role=UserRole.STUDENT)
    student_headers = {"Authorization": f"Bearer {student_token}"}

    faculty_token = create_access_token(subject=str(faculty_user_id), role=UserRole.FACULTY)
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}

    admin_token = create_access_token(subject=str(admin_user_id), role=UserRole.ADMIN)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # =========================================================================
    # TEST 1: Student Learning Insights
    # =========================================================================
    res_student = client.get("/api/v1/analytics/student/me", headers=student_headers)
    assert res_student.status_code == 200, res_student.text
    data_stu = res_student.json()

    assert "student_profile" in data_stu
    assert "summary" in data_stu
    assert data_stu["summary"]["total_questions_answered"] >= 35
    assert data_stu["summary"]["total_correct"] >= 24
    assert data_stu["summary"]["overall_accuracy_pct"] > 60.0

    # Verify weak areas categorization
    assert len(data_stu["weak_areas_to_revisit"]) >= 1
    weak_topic = data_stu["weak_areas_to_revisit"][0]
    assert weak_topic["topic_name"] == "Marma Sharir Classification"
    assert weak_topic["mastery_percentage"] == 40.0

    # Verify study planner progress integration
    assert data_stu["study_planner_progress"]["has_active_plan"] is True
    assert data_stu["study_planner_progress"]["days_until_exam"] == 45

    # Verify recommendations distinction (Observed Data vs Pedagogical Suggestion)
    assert len(data_stu["recommendations"]) >= 1
    recs = data_stu["recommendations"]
    assert any(r["source"] == "OBSERVED_PERFORMANCE" for r in recs)

    # Privacy boundary: Student cannot access faculty or admin analytics
    res_unauth_fac = client.get("/api/v1/analytics/faculty/overview", headers=student_headers)
    assert res_unauth_fac.status_code == 403

    res_unauth_adm = client.get("/api/v1/analytics/admin/platform", headers=student_headers)
    assert res_unauth_adm.status_code == 403

    # =========================================================================
    # TEST 2: Faculty Educational Insights
    # =========================================================================
    res_fac = client.get("/api/v1/analytics/faculty/overview", headers=faculty_headers)
    assert res_fac.status_code == 200, res_fac.text
    data_fac = res_fac.json()

    assert "faculty_info" in data_fac
    assert "student_participation" in data_fac
    assert data_fac["student_participation"]["total_enrolled_students"] >= 1
    assert "2nd Year" in data_fac["student_participation"]["students_by_year"]

    assert "assessment_performance" in data_fac
    assert data_fac["assessment_performance"]["total_cohort_quiz_attempts"] >= 1
    assert data_fac["assessment_performance"]["average_score_pct"] == 90.0

    # Top challenging topics should flag Marma Sharir
    assert len(data_fac["top_challenging_topics"]) >= 1

    # Privacy check: Verify no private student personal details (like password hashes or chat messages) are returned
    assert "password" not in str(data_fac).lower()
    assert "private_notes" not in str(data_fac).lower()

    # =========================================================================
    # TEST 3: Admin Platform Insights
    # =========================================================================
    res_adm = client.get("/api/v1/analytics/admin/platform", headers=admin_headers)
    assert res_adm.status_code == 200, res_adm.text
    data_adm = res_adm.json()

    assert "platform_overview" in data_adm
    assert "educational_metrics" in data_adm
    assert "platform_health" in data_adm
    assert data_adm["platform_health"]["database_status"] == "ONLINE"
    assert "database_query_latency_ms" in data_adm["platform_health"]

    # =========================================================================
    # TEST 4: Existing Institution Placement Overview Preservation
    # =========================================================================
    res_inst = client.get("/api/v1/analytics/institution/overview", headers=admin_headers)
    assert res_inst.status_code == 200, res_inst.text
    data_inst = res_inst.json()
    assert "total_enrolled_students" in data_inst
    assert "placement_readiness_index" in data_inst
