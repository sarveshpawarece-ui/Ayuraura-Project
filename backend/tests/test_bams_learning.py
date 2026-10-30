import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    with TestClient(app) as test_c:
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


def test_bams_curriculum_and_subjects_retrieval():
    # 1. Fetch entire curriculum
    res = client.get("/api/v1/bams-learning/curriculum")
    assert res.status_code == 200
    data = res.json()
    assert "professional_years" in data
    assert len(data["professional_years"]) >= 4
    assert len(data["subjects"]) >= 14
    assert len(data["topics"]) >= 10
    assert data["total_subjects"] >= 14
    assert data["total_topics"] >= 10

    # 2. Filter subjects by professional year
    res_1st = client.get("/api/v1/bams-learning/subjects?prof_year=1st%20Prof")
    assert res_1st.status_code == 200
    subjects_1st = res_1st.json()
    assert len(subjects_1st) >= 3
    for s in subjects_1st:
        assert s["professionalYear"] == "1st Prof"

    # 3. Retrieve single topic
    first_topic_id = data["topics"][0]["id"]
    res_topic = client.get(f"/api/v1/bams-learning/topics/{first_topic_id}")
    assert res_topic.status_code == 200
    topic_data = res_topic.json()
    assert topic_data["id"] == first_topic_id
    assert "sanskritShloka" in topic_data
    assert "diagram" in topic_data


def test_student_progress_tracking_and_bookmarks():
    student_email = f"bams_learner_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check initial progress
    prog_res = client.get("/api/v1/bams-learning/progress", headers=headers)
    assert prog_res.status_code == 200
    prog = prog_res.json()
    assert "completed_topics" in prog
    assert "bookmarked_topics" in prog
    assert "overall_completion_pct" in prog
    assert prog["overall_completion_pct"] == 0.0

    # 2. Toggle completion on topic top-rach-01
    comp_res = client.post("/api/v1/bams-learning/topics/top-rach-01/toggle-complete", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "top-rach-01" in comp_data["completed_topics"]
    assert comp_data["overall_completion_pct"] > 0.0

    # 3. Toggle bookmark on topic top-rach-01
    bm_res = client.post("/api/v1/bams-learning/topics/top-rach-01/toggle-bookmark", headers=headers)
    assert bm_res.status_code == 200
    bm_data = bm_res.json()
    assert "top-rach-01" in bm_data["bookmarked_topics"]

    # 4. Record topic view
    view_res = client.post(
        "/api/v1/bams-learning/topics/top-rach-01/view",
        json={"title": "Introduction to Marma Sharir", "subject_id": "sub-rachana", "subject_name": "Rachana Sharir"},
        headers=headers
    )
    assert view_res.status_code == 200
    view_data = view_res.json()
    assert len(view_data["recently_viewed_topics"]) >= 1
    assert view_data["recently_viewed_topics"][0]["topic_id"] == "top-rach-01"
    assert view_data["continue_learning_topic"] is not None


def test_clinical_and_internship_logbook():
    student_email = f"intern_doc_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add logbook entry
    payload = {
        "date": "2026-10-29",
        "posting": "Panchakarma Inpatient Department",
        "department": "Panchakarma",
        "procedure_observed": "Snehan and Swedan followed by Virechana Karma in Tamaka Shwasa patient",
        "reflection": "Observed significant reduction in bronchial spasm post-swedan. Patient tolerated sneha pan well.",
        "supervisor_name": "Dr. V. K. Sharma (MD Ayu)"
    }
    log_res = client.post("/api/v1/bams-learning/logbook", json=payload, headers=headers)
    assert log_res.status_code == 201
    log_entry = log_res.json()
    assert log_entry["posting"] == payload["posting"]
    assert log_entry["department"] == "Panchakarma"
    assert "id" in log_entry

    # 2. Get list of logbook entries
    list_res = client.get("/api/v1/bams-learning/logbook", headers=headers)
    assert list_res.status_code == 200
    entries = list_res.json()
    assert len(entries) >= 1
    assert entries[0]["procedure_observed"] == payload["procedure_observed"]


def test_student_personalized_dashboard_endpoint():
    student_email = f"bams_dash_{uuid.uuid4().hex[:6]}@aayuraura.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/bams-learning/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "student_name" in data
    assert "academic_year" in data
    assert "overall_completion_pct" in data
    assert "subjects_progress" in data
    assert len(data["subjects_progress"]) >= 5
    assert "today_study_plan" in data
    assert len(data["today_study_plan"]) >= 3
    assert "upcoming_exams" in data
    assert len(data["upcoming_exams"]) >= 2
    assert "pending_revisions" in data
    assert "quiz_performance" in data
    assert "goals" in data
    assert "milestones" in data
    assert len(data["milestones"]) >= 3
    assert "recommendations" in data
    assert len(data["recommendations"]) >= 3


def test_smart_learning_recommendations_flow():
    student_email = f"bams_rec_{uuid.uuid4().hex[:6]}@aayuraura.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch recommendations
    res = client.get("/api/v1/bams-learning/recommendations", headers=headers)
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 3
    first_rec = recs[0]
    rec_id = first_rec["id"]
    assert "reason" in first_rec
    assert "action_url" in first_rec
    assert "priority" in first_rec

    # 2. Complete recommendation
    comp_res = client.post(f"/api/v1/bams-learning/recommendations/{rec_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["completed"] is True

    # 3. Dismiss another recommendation
    second_rec_id = recs[1]["id"]
    dismiss_res = client.post(f"/api/v1/bams-learning/recommendations/{second_rec_id}/dismiss", headers=headers)
    assert dismiss_res.status_code == 200
    assert dismiss_res.json()["dismissed"] is True

    # 4. Verify dismissed item is filtered out
    recs_after = client.get("/api/v1/bams-learning/recommendations", headers=headers).json()
    assert all(r["id"] != second_rec_id for r in recs_after)

    # 5. Reset recommendations
    reset_res = client.post("/api/v1/bams-learning/recommendations/reset", headers=headers)
    assert reset_res.status_code == 200
    recs_reset = client.get("/api/v1/bams-learning/recommendations", headers=headers).json()
    assert any(r["id"] == second_rec_id for r in recs_reset)


def test_interactive_flashcards_deck_and_review():
    student_email = f"bams_flash_{uuid.uuid4().hex[:6]}@aayuraura.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch full flashcard deck
    res = client.get("/api/v1/bams-learning/flashcards", headers=headers)
    assert res.status_code == 200
    cards = res.json()
    assert len(cards) >= 6
    first_card = cards[0]
    assert "sanskritTerm" in first_card
    assert "conceptExplanation" in first_card
    assert "clinicalCorrelation" in first_card
    assert "masteryStatus" in first_card

    # 2. Filter by subject
    res_panch = client.get("/api/v1/bams-learning/flashcards?subject_id=sub-panchakarma", headers=headers)
    assert res_panch.status_code == 200
    panch_cards = res_panch.json()
    assert len(panch_cards) >= 1
    assert all(c["subjectId"] == "sub-panchakarma" for c in panch_cards)

    # 3. Record student self-assessment review
    review_res = client.post(
        f"/api/v1/bams-learning/flashcards/{first_card['id']}/review",
        json={"rating": "EASY"},
        headers=headers
    )
    assert review_res.status_code == 200
    assert review_res.json()["rating"] == "EASY"

    # 4. Verify updated status reflects MASTERED
    res_updated = client.get("/api/v1/bams-learning/flashcards", headers=headers)
    cards_updated = res_updated.json()
    matched = next(c for c in cards_updated if c["id"] == first_card["id"])
    assert matched["masteryStatus"] == "MASTERED"
    assert matched["userRating"] == "EASY"


def test_student_learning_goals_and_reminders():
    student_email = f"bams_goals_{uuid.uuid4().hex[:6]}@aayuraura.edu"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get initial goals
    res = client.get("/api/v1/bams-learning/goals", headers=headers)
    assert res.status_code == 200
    goals = res.json()
    assert "target_minutes_daily" in goals
    assert "current_streak_days" in goals
    assert "streak_encouragement" in goals

    # 2. Update goals and customize reminders
    update_res = client.post(
        "/api/v1/bams-learning/goals",
        json={
            "target_minutes_daily": 60,
            "target_topics_daily": 4,
            "target_quizzes_weekly": 5,
            "reminders_enabled": True,
            "reminder_time": "20:30"
        },
        headers=headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["target_minutes_daily"] == 60
    assert updated["target_topics_daily"] == 4
    assert updated["reminder_time"] == "20:30"
    assert updated["reminders_enabled"] is True

