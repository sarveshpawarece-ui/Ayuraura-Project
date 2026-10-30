import pytest
import uuid
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    with TestClient(app):
        yield

client = TestClient(app)

def get_token_for_user(email: str, role: str = "STUDENT", password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]

    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"{role.title()} Test User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_cross_user_privacy_and_data_isolation():
    """Phase 3: Verify Student A's private notes and chat sessions are strictly inaccessible to Student B."""
    email_a = f"student_a_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    email_b = f"student_b_{uuid.uuid4().hex[:6]}@ayursetu.edu"

    token_a = get_token_for_user(email_a, role="STUDENT")
    token_b = get_token_for_user(email_b, role="STUDENT")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Student A creates a private study note
    note_a = client.post("/api/v1/ai-ecosystem/notes", json={
        "title": "Confidential Asthi Dhatu Notes",
        "content": "Asthi Dhatu provides structural framework. Upadhatu is Danta and Kesha.",
        "subject": "Rachana Sharira",
        "topic": "Dhatu Siddhanta",
        "folder_name": "Private Folder"
    }, headers=headers_a).json()
    note_a_id = note_a["id"]

    # 2. Student A creates a private chat session
    session_a = client.post("/api/v1/ai-ecosystem/sessions", json={
        "title": "Private Sharira Doubt Session",
        "current_subject": "Rachana Sharira"
    }, headers=headers_a).json()
    session_a_id = session_a["id"]

    # 3. Student B lists notes - Student A's note MUST NOT be visible
    notes_b = client.get("/api/v1/ai-ecosystem/notes", headers=headers_b).json()
    assert not any(n["id"] == note_a_id for n in notes_b)

    # 4. Student B attempts to update Student A's note -> 404 Not Found
    update_hack = client.put(f"/api/v1/ai-ecosystem/notes/{note_a_id}", json={
        "title": "Hacked Title"
    }, headers=headers_b)
    assert update_hack.status_code == 404

    # 5. Student B attempts to delete Student A's note -> 404 Not Found
    delete_hack = client.delete(f"/api/v1/ai-ecosystem/notes/{note_a_id}", headers=headers_b)
    assert delete_hack.status_code == 404

    # 6. Student B lists chat sessions -> Session A MUST NOT be visible
    sessions_b = client.get("/api/v1/ai-ecosystem/sessions", headers=headers_b).json()
    assert not any(s["id"] == session_a_id for s in sessions_b)

    # 7. Student B attempts to read messages of Session A -> Returns empty list
    session_msgs_b = client.get(f"/api/v1/ai-ecosystem/sessions/{session_a_id}/messages", headers=headers_b).json()
    assert session_msgs_b == []


def test_chatbot_multiturn_suggested_followups_and_note_context():
    """Phase 1 & 2: Test multi-turn conversation, suggested follow-up chaining, and note attachment context."""
    email = f"chat_tester_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Initiate conversation with general query
    msg1_res = client.post("/api/v1/ai-ecosystem/chat", json={
        "message": "Explain Tridosha in simple language.",
        "subject_context": "Maulik Siddhanta"
    }, headers=headers)
    assert msg1_res.status_code == 200
    msg1_data = msg1_res.json()
    session_id = msg1_data["session_id"]
    assert "Vata" in msg1_data["reply"] and "Pitta" in msg1_data["reply"] and "Kapha" in msg1_data["reply"]
    assert len(msg1_data["suggested_followups"]) >= 3
    assert len(msg1_data["classical_citations"]) > 0

    # 2. Follow-up: Select the first suggested question and submit in same session
    first_suggestion = msg1_data["suggested_followups"][0]
    msg2_res = client.post("/api/v1/ai-ecosystem/chat", json={
        "session_id": session_id,
        "message": first_suggestion,
        "subject_context": "Maulik Siddhanta"
    }, headers=headers)
    assert msg2_res.status_code == 200
    msg2_data = msg2_res.json()
    assert msg2_data["session_id"] == session_id
    assert len(msg2_data["reply"]) > 50

    # 3. Note-to-Chat context: Ask question with attached note
    msg3_res = client.post("/api/v1/ai-ecosystem/chat", json={
        "session_id": session_id,
        "message": "What exam improvements can you suggest for my note on Pranavaha Srotas?",
        "subject_context": "Kriya Sharira",
        "note_context": "Pranavaha Srotas Moola: Hridaya and Mahasrotas. Vitiation causes Shwasa and Kasa."
    }, headers=headers)
    assert msg3_res.status_code == 200
    msg3_data = msg3_res.json()
    assert "note" in msg3_data["reply"].lower() or "srotas" in msg3_data["reply"].lower()

    # 4. Verify conversation history has all user turns and assistant responses preserved
    history_res = client.get(f"/api/v1/ai-ecosystem/sessions/{session_id}/messages", headers=headers)
    assert history_res.status_code == 200
    all_msgs = history_res.json()
    assert len(all_msgs) == 6  # 3 user turns + 3 assistant turns


def test_ai_note_transformations_non_destructive_and_versioning():
    """Phase 1 & 2: Test AI note transformations without overwriting original content, and version restoration."""
    email = f"notes_ver_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    original_content = "Vamana is induced emesis for Kapha dosha. Given in vasanta ritu."

    # 1. Create original note
    created_note = client.post("/api/v1/ai-ecosystem/notes", json={
        "title": "Vamana Karma Draft",
        "content": original_content,
        "subject": "Panchakarma",
        "topic": "Vamana"
    }, headers=headers).json()
    note_id = created_note["id"]

    # 2. Run AI transformation (BAMS Exam Answer)
    transform_res = client.post("/api/v1/ai-ecosystem/notes/transform", json={
        "content": original_content,
        "transformation_type": "EXAM_READY_ANSWER",
        "subject": "Panchakarma"
    }, headers=headers)
    assert transform_res.status_code == 200
    t_data = transform_res.json()
    assert t_data["improved_content"] != original_content
    assert len(t_data["key_concepts"]) > 0
    assert len(t_data["flashcards"]) > 0

    # 3. CRITICAL: Verify original note in database is STILL original (AI does not overwrite without user confirmation)
    db_note = client.get("/api/v1/ai-ecosystem/notes", headers=headers).json()[0]
    assert db_note["content"] == original_content

    # 4. Student explicitly accepts AI suggestions and updates note
    client.put(f"/api/v1/ai-ecosystem/notes/{note_id}", json={
        "content": t_data["improved_content"],
        "change_summary": "Applied AI Exam-Ready structure"
    }, headers=headers)

    # 5. Check version history: should have Version 1 and Version 2
    versions = client.get(f"/api/v1/ai-ecosystem/notes/{note_id}/versions", headers=headers).json()
    assert len(versions) == 2
    v1_id = [v["id"] for v in versions if v["version_number"] == 1][0]

    # 6. Restore Version 1
    restore_res = client.post(f"/api/v1/ai-ecosystem/notes/{note_id}/restore/{v1_id}", headers=headers)
    assert restore_res.status_code == 200
    restored_note = restore_res.json()
    assert restored_note["content"] == original_content


def test_ai_quiz_generation_distractor_explanations_and_submission():
    """Phase 1: Test quiz generation with rationale for incorrect options, scoring, and history."""
    email = f"quiz_ver_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Generate Quiz
    quiz_res = client.post("/api/v1/ai-ecosystem/quiz/generate", json={
        "subject": "Dravyaguna Vijnana",
        "topic": "Rasa Panchaka",
        "question_count": 5,
        "question_format": "MCQ",
        "difficulty": "MEDIUM"
    }, headers=headers)
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    quiz_id = quiz_data["id"]
    assert len(quiz_data["questions"]) == 5

    # Check that questions have option rationales
    first_q = quiz_data["questions"][0]
    assert len(first_q["options"]) == 4
    assert len(first_q["why_incorrect"]) >= 1  # Explains why distractors are incorrect
    assert first_q["correct_index"] in [0, 1, 2, 3]

    # 2. Submit Answers
    answers_payload = [{"question_id": q["id"], "selected_index": 0} for q in quiz_data["questions"]]
    submit_res = client.post("/api/v1/ai-ecosystem/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": answers_payload,
        "time_taken_seconds": 120
    }, headers=headers)
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert "score" in result
    assert "score_percentage" in result
    assert len(result["detailed_evaluations"]) == 5

    # 3. Verify Quiz History
    history_res = client.get("/api/v1/ai-ecosystem/quiz/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert any(h["quiz_id"] == quiz_id for h in history)


def test_ai_study_planner_generation_and_fetch():
    """Phase 1 & 2: Test study schedule generation and retrieval."""
    email = f"planner_ver_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    target_exam = (date.today() + timedelta(days=60)).isoformat()
    plan_res = client.post("/api/v1/ai-ecosystem/study-plan/generate", json={
        "title": "BAMS 2nd Professional Sprint",
        "exam_name": "University Professional Exam",
        "exam_date": target_exam,
        "available_hours_daily": 4.0,
        "preferred_study_time": "MORNING",
        "target_subjects": ["Dravyaguna", "Rasashastra", "Roganidana"],
        "weak_topics": ["Bhasma Nirmana", "Samprapti of Prameha"]
    }, headers=headers)
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data["days_remaining"] >= 59
    assert len(plan_data["days"]) > 0

    # Retrieve active study plan
    active_res = client.get("/api/v1/ai-ecosystem/study-plan", headers=headers)
    assert active_res.status_code == 200
    active_data = active_res.json()
    assert active_data["title"] == "BAMS 2nd Professional Sprint"
    assert active_data["days_remaining"] >= 59
    assert "Brahma Muhurta" in active_data["ayurvedic_lifestyle_tip"]


def test_ai_descriptive_answer_feedback():
    """Phase 1: Test descriptive answer evaluation against rubric."""
    email = f"answer_ver_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    eval_res = client.post("/api/v1/ai-ecosystem/answer-feedback", json={
        "subject": "Maulik Siddhanta",
        "question_text": "Explain the concept of Shad Kriya Kala and its importance in preventive medicine.",
        "student_answer": (
            "Shad Kriya Kala describes six stages of disease formation: Sanchaya, Prakopa, Prasara, Sthana-samshraya, Vyakti, Bhedavastha. "
            "Sanchaya is the accumulation of dosha in its own site. In Sthana-samshraya, dosha-dushya sammurchana occurs leading to prodromal symptoms. "
            "Preventive treatment in early stages stops chronic irreversible complications."
        ),
        "target_marks": 10
    }, headers=headers)
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["target_marks"] == 10
    assert 0 <= data["overall_score"] <= 10
    assert len(data["covered_concepts"]) > 0
    assert len(data["missing_concepts"]) > 0
    assert len(data["constructive_feedback"]) > 20
    assert len(data["model_answer"]) > 50


def test_role_based_permissions_faculty_vs_student_vs_admin():
    """Phase 3: Verify role restrictions. Students cannot access faculty AI tools; Faculty/Doctor and Admin can."""
    student_email = f"stu_role_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    doctor_email = f"doc_role_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    admin_email = f"adm_role_{uuid.uuid4().hex[:6]}@ayursetu.edu"

    token_stu = get_token_for_user(student_email, role="STUDENT")
    token_doc = get_token_for_user(doctor_email, role="DOCTOR")
    token_adm = get_token_for_user(admin_email, role="ADMIN")

    headers_stu = {"Authorization": f"Bearer {token_stu}"}
    headers_doc = {"Authorization": f"Bearer {token_doc}"}
    headers_adm = {"Authorization": f"Bearer {token_adm}"}

    payload = {
        "tool_type": "LESSON_OUTLINE",
        "subject": "Kayachikitsa",
        "topic": "Management of Amavata",
        "curriculum_level": "BAMS Final Year"
    }

    # 1. Student must be rejected with 403 Forbidden
    res_stu = client.post("/api/v1/ai-ecosystem/faculty-tool", json=payload, headers=headers_stu)
    assert res_stu.status_code == 403

    # 2. Doctor/Faculty must succeed with 200 OK
    res_doc = client.post("/api/v1/ai-ecosystem/faculty-tool", json=payload, headers=headers_doc)
    assert res_doc.status_code == 200
    doc_data = res_doc.json()
    assert "lesson_plan" in doc_data["content"] or "outline" in doc_data["content"] or len(doc_data["formatted_markdown"]) > 0

    # 3. Admin must succeed with 200 OK
    res_adm = client.post("/api/v1/ai-ecosystem/faculty-tool", json={
        "tool_type": "EXAM_QUESTION_PAPER",
        "subject": "Shalya Tantra",
        "topic": "Bhagna (Fractures) and Vrana Shodhana",
        "curriculum_level": "BAMS Final Year"
    }, headers=headers_adm)
    assert res_adm.status_code == 200
    adm_data = res_adm.json()
    assert "question_paper" in adm_data["content"] or len(adm_data["formatted_markdown"]) > 0


def test_unauthenticated_requests_are_rejected():
    """Phase 3: Verify unauthenticated requests cannot access any AI endpoints."""
    endpoints = [
        ("GET", "/api/v1/ai-ecosystem/sessions"),
        ("POST", "/api/v1/ai-ecosystem/sessions"),
        ("GET", "/api/v1/ai-ecosystem/notes"),
        ("POST", "/api/v1/ai-ecosystem/notes"),
        ("POST", "/api/v1/ai-ecosystem/chat"),
        ("POST", "/api/v1/ai-ecosystem/quiz/generate"),
        ("GET", "/api/v1/ai-ecosystem/study-plan"),
        ("POST", "/api/v1/ai-ecosystem/faculty-tool"),
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code in [401, 403], f"Endpoint {path} failed auth check with status {res.status_code}"
