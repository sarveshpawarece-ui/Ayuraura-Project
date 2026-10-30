import pytest
import uuid
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.db.init_db import init_db

client = TestClient(app)


@pytest.mark.asyncio
async def test_topic_based_quiz_system():
    # 1. Create tables & Initialize Database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    unique_suffix = uuid.uuid4().hex[:6]
    student_user_id = None
    doctor_user_id = None

    async with AsyncSessionLocal() as session:
        await init_db(session)

        # Create student user
        student_user = User(
            email=f"quiz_student_{unique_suffix}@ayursetu.in",
            hashed_password=get_password_hash("password123"),
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True
        )
        session.add(student_user)

        # Create doctor user
        doctor_user = User(
            email=f"quiz_doctor_{unique_suffix}@ayursetu.in",
            hashed_password=get_password_hash("password123"),
            role=UserRole.DOCTOR,
            is_active=True,
            is_verified=True
        )
        session.add(doctor_user)
        await session.commit()
        await session.refresh(student_user)
        await session.refresh(doctor_user)

        student_user_id = student_user.id
        doctor_user_id = doctor_user.id

    student_token = create_access_token(subject=str(student_user_id), role=UserRole.STUDENT)
    student_headers = {"Authorization": f"Bearer {student_token}"}

    doctor_token = create_access_token(subject=str(doctor_user_id), role=UserRole.DOCTOR)
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}


    # -------------------------------------------------------------
    # STEP 1: FETCH SUBJECTS HIERARCHY
    # -------------------------------------------------------------
    res_subj = client.get("/api/v1/quiz/subjects", headers=student_headers)
    assert res_subj.status_code == 200
    subjects = res_subj.json()
    assert len(subjects) >= 4
    
    dravyaguna = next((s for s in subjects if "Dravyaguna" in s["name"]), None)
    assert dravyaguna is not None
    assert len(dravyaguna["topics"]) >= 1

    panchakarma = next((s for s in subjects if "Panchakarma" in s["name"]), None)
    assert panchakarma is not None

    # -------------------------------------------------------------
    # STEP 2: GENERATE DRAVYAGUNA -> MEDICINAL PLANTS QUIZ
    # VERIFY ZERO CROSS-SUBJECT CONTAMINATION
    # -------------------------------------------------------------
    med_plants_topic = next((t for t in dravyaguna["topics"] if "Medicinal Plants" in t["name"]), None)
    assert med_plants_topic is not None

    gen_payload = {
        "subject_id": dravyaguna["id"],
        "topic_id": med_plants_topic["id"],
        "difficulty": "EASY",
        "limit": 5
    }
    res_gen = client.post("/api/v1/quiz/generate", json=gen_payload, headers=student_headers)
    assert res_gen.status_code == 200
    quiz_data = res_gen.json()
    
    attempt_id = quiz_data["attempt_id"]
    questions = quiz_data["questions"]
    assert len(questions) >= 1

    # Strict topic check: EVERY question MUST be Dravyaguna & Medicinal Plants
    for q in questions:
        assert q["subject_name"] == dravyaguna["name"]
        assert q["topic_name"] == med_plants_topic["name"]
        # Verify options are masked (no 'is_correct' field leaked during exam mode)
        for opt in q["options"]:
            assert "is_correct" not in opt

    # -------------------------------------------------------------
    # STEP 3: GENERATE PANCHAKARMA -> VAMANA QUIZ
    # VERIFY STRICT TOPIC ISOLATION
    # -------------------------------------------------------------
    vamana_topic = next((t for t in panchakarma["topics"] if "Vamana" in t["name"]), None)
    assert vamana_topic is not None

    gen_vamana = {
        "subject_id": panchakarma["id"],
        "topic_id": vamana_topic["id"],
        "difficulty": "EASY",
        "limit": 5
    }
    res_vamana = client.post("/api/v1/quiz/generate", json=gen_vamana, headers=student_headers)
    assert res_vamana.status_code == 200
    vamana_quiz = res_vamana.json()
    assert len(vamana_quiz["questions"]) >= 1

    for q in vamana_quiz["questions"]:
        assert q["subject_name"] == panchakarma["name"]
        assert q["topic_name"] == vamana_topic["name"]
        # Ensure no Dravyaguna or other herbs leaked into Vamana quiz
        assert "Withania" not in q["question_text"]

    # -------------------------------------------------------------
    # STEP 4: SUBMIT QUIZ & EVALUATE RESULTS
    # -------------------------------------------------------------
    answers_payload = {
        "answers": [
            {"question_id": q["id"], "selected_option": "A"}  # Option A is correct for our seeded questions
            for q in questions
        ],
        "time_taken_seconds": 45
    }

    res_submit = client.post(
        f"/api/v1/quiz/attempts/{attempt_id}/submit",
        json=answers_payload,
        headers=student_headers
    )
    assert res_submit.status_code == 200
    result_data = res_submit.json()

    assert result_data["total_questions"] == len(questions)
    assert result_data["score_percentage"] == 100.0
    assert result_data["correct_count"] == len(questions)
    assert result_data["status"] == "COMPLETED"

    # Verify in-depth explanations and clinical pearls are delivered
    assert len(result_data["evaluated_questions"]) == len(questions)
    for eq in result_data["evaluated_questions"]:
        assert eq["is_correct"] is True
        assert eq["explanation"] is not None and len(eq["explanation"]) > 10

    # Verify recommendations are attached
    assert len(result_data["recommended_experts"]) >= 1
    assert len(result_data["recommended_learning_resources"]) >= 1

    # -------------------------------------------------------------
    # STEP 5: VERIFY STUDENT TOPIC PERFORMANCE ANALYTICS
    # -------------------------------------------------------------
    res_perf = client.get("/api/v1/quiz/student/performance", headers=student_headers)
    assert res_perf.status_code == 200
    perf_data = res_perf.json()

    assert perf_data["total_quizzes_taken"] >= 1
    assert perf_data["overall_mastery"] == 100.0
    assert len(perf_data["strong_topics"]) >= 1

    # -------------------------------------------------------------
    # STEP 6: VERIFY PERSONALIZED QUIZ RECOMMENDATIONS
    # -------------------------------------------------------------
    res_rec = client.get("/api/v1/quiz/student/recommendations", headers=student_headers)
    assert res_rec.status_code == 200
    recs = res_rec.json()
    assert len(recs) >= 1

    # -------------------------------------------------------------
    # STEP 7: ADMIN / FACULTY QUESTION CREATION & VALIDATION
    # -------------------------------------------------------------
    new_q_payload = {
        "subject_id": dravyaguna["id"],
        "topic_id": med_plants_topic["id"],
        "difficulty": "HARD",
        "question_type": "MCQ",
        "question_text": "What is the primary bitter glycoside in Picrorhiza kurroa (Katuki)?",
        "options": [
            {"id": "A", "text": "Kutkin (Picroside I & II)", "is_correct": True},
            {"id": "B", "text": "Curcumin", "is_correct": False},
            {"id": "C", "text": "Gymnemic Acid", "is_correct": False},
            {"id": "D", "text": "Bacoside", "is_correct": False}
        ],
        "correct_answer": "A",
        "explanation": "Kutkin is the bitter iridoid glycoside complex composed of Picroside I and Kutkoside responsible for Katuki's potent Yakriduttejaka (hepatoprotective) and Bhedana actions.",
        "clinical_pearl": "Katuki in small doses acts as Deepana, but in high doses acts as Bhedana/Virechana.",
        "tags": ["Dravyaguna", "Medicinal Plants", "Katuki"]
    }

    res_create_q = client.post("/api/v1/quiz/admin/questions", json=new_q_payload, headers=doctor_headers)
    assert res_create_q.status_code == 200
    created_q = res_create_q.json()
    assert created_q["correct_answer"] == "A"
    assert created_q["subject_name"] == dravyaguna["name"]
