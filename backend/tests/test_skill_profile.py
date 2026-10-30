import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.skill_profile_service import get_proficiency_level

client = TestClient(app)

def get_token_for_user(email: str, password: str = "AyurSetu@2026", role: str = "STUDENT") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code != 200:
        client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": password,
                "role": role,
                "full_name": email.split("@")[0].replace("_", " ").title(),
            }
        )
        response = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]


def ensure_seed_data_exists():
    from app.core.database import AsyncSessionLocal
    from app.db.init_db import init_db
    import asyncio
    async def run_seed():
        async with AsyncSessionLocal() as db:
            await init_db(db)
    asyncio.run(run_seed())


def test_proficiency_level_boundaries():
    assert get_proficiency_level(0.0) == "BEGINNER"
    assert get_proficiency_level(39.0) == "BEGINNER"
    assert get_proficiency_level(40.0) == "BASIC"
    assert get_proficiency_level(59.0) == "BASIC"
    assert get_proficiency_level(60.0) == "INTERMEDIATE"
    assert get_proficiency_level(74.0) == "INTERMEDIATE"
    assert get_proficiency_level(75.0) == "ADVANCED"
    assert get_proficiency_level(89.0) == "ADVANCED"
    assert get_proficiency_level(90.0) == "EXPERT"
    assert get_proficiency_level(100.0) == "EXPERT"


def test_skill_profile_unassessed_state():
    ensure_seed_data_exists()
    email = f"student_unassessed_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/students/me/skills", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["overall_score"] is None
    assert data["skills"] == []
    assert data["categories"] == []
    assert data["strengths"] == []
    assert data["areas_to_improve"] == []


def test_skill_profile_generation_and_thresholds():
    ensure_seed_data_exists()
    email = f"student_prof_gen_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # Set Target Career
    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # Start and submit assessment
    start_res = client.post("/api/v1/assessments/start", headers=headers).json()
    attempt_id = start_res["attempt_id"]
    questions = start_res["questions"]

    # Answer all questions
    for q in questions:
        opt_id = q["options"][0]["id"]
        client.post(
            f"/api/v1/assessments/{attempt_id}/answers",
            json={"question_id": q["id"], "selected_option_id": opt_id},
            headers=headers
        )

    # Submit assessment -> automatically triggers skill_profile_service.sync_skill_profile_from_attempt()
    sub_res = client.post(f"/api/v1/assessments/{attempt_id}/submit", headers=headers)
    assert sub_res.status_code == 200

    # Fetch Current Skill Profile
    prof_res = client.get("/api/v1/students/me/skills", headers=headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()

    assert prof["overall_score"] is not None
    assert len(prof["skills"]) >= 1
    assert len(prof["categories"]) >= 1

    # Verify deterministic strength (>=75%) vs area to improve (<60%) classifications
    for sk in prof["skills"]:
        if sk["score"] >= 75.0:
            assert sk["skill_name"] in prof["strengths"]
        if sk["score"] < 60.0:
            assert sk["skill_name"] in prof["areas_to_improve"]


def test_skill_profile_retake_preserves_history():
    ensure_seed_data_exists()
    email = f"student_prof_retake_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # Attempt 1
    start_1 = client.post("/api/v1/assessments/start", headers=headers).json()
    att_1_id = start_1["attempt_id"]
    client.post(f"/api/v1/assessments/{att_1_id}/submit", headers=headers)

    prof_1 = client.get("/api/v1/students/me/skills", headers=headers).json()

    # Attempt 2 (Retake)
    start_2 = client.post("/api/v1/assessments/start", headers=headers).json()
    att_2_id = start_2["attempt_id"]
    # Answer first 5 questions
    for q in start_2["questions"][:5]:
        client.post(
            f"/api/v1/assessments/{att_2_id}/answers",
            json={"question_id": q["id"], "selected_option_id": q["options"][0]["id"]},
            headers=headers
        )
    client.post(f"/api/v1/assessments/{att_2_id}/submit", headers=headers)

    prof_2 = client.get("/api/v1/students/me/skills", headers=headers).json()
    hist_res = client.get("/api/v1/students/me/skills/history", headers=headers)
    assert hist_res.status_code == 200
    hist = hist_res.json()

    # Verify history contains attempt entries for assessed skills
    assert len(hist) >= 1
    for item in hist:
        assert len(item["attempts"]) >= 2, "Historical attempts must be preserved across retakes!"


def test_skill_profile_ownership_and_rbac():
    ensure_seed_data_exists()
    email_a = f"stud_sp_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"stud_sp_b_{uuid.uuid4().hex[:6]}@example.com"
    fac_email = f"fac_sp_{uuid.uuid4().hex[:6]}@example.com"

    token_a = get_token_for_user(email_a, role="STUDENT")
    token_b = get_token_for_user(email_b, role="STUDENT")
    token_fac = get_token_for_user(fac_email, role="FACULTY")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_fac = {"Authorization": f"Bearer {token_fac}"}

    # Student A gets own skill profile
    res_a = client.get("/api/v1/students/me/skills", headers=headers_a)
    assert res_a.status_code == 200

    # Student B gets own skill profile (empty)
    res_b = client.get("/api/v1/students/me/skills", headers=headers_b)
    assert res_b.status_code == 200

    # Faculty gets 403 Forbidden
    res_fac = client.get("/api/v1/students/me/skills", headers=headers_fac)
    assert res_fac.status_code == 403
