import uuid
from fastapi.testclient import TestClient
from app.main import app

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


def test_assessment_prerequisite_validation():
    ensure_seed_data_exists()
    email = f"student_noprefer_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # Clear target career if set
    client.delete("/api/v1/students/me/target-career", headers=headers)

    # Attempt start without target career -> 400
    res_start = client.post("/api/v1/assessments/start", headers=headers)
    assert res_start.status_code == 400
    assert "target career" in res_start.json()["detail"].lower()


def test_assessment_security_no_answer_leakage():
    ensure_seed_data_exists()
    email = f"student_sec_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # Set Target Career
    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # Start assessment
    res = client.post("/api/v1/assessments/start", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "questions" in data
    assert len(data["questions"]) >= 1

    # Verify is_correct and answer_key are NOT present in options payload
    for q in data["questions"]:
        for opt in q["options"]:
            assert "is_correct" not in opt, "SECURITY BREACH: is_correct leaked in option payload!"
            assert "answer_key" not in opt, "SECURITY BREACH: answer_key leaked in option payload!"


def test_assessment_full_lifecycle_scoring_and_normalization():
    ensure_seed_data_exists()
    email = f"student_lifecycle_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Set Target Career
    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # 2. Start Assessment
    start_res = client.post("/api/v1/assessments/start", headers=headers)
    assert start_res.status_code == 200
    start_data = start_res.json()
    attempt_id = start_data["attempt_id"]
    questions = start_data["questions"]

    # 3. Answer questions
    for q in questions:
        opt_id = q["options"][0]["id"]
        ans_res = client.post(
            f"/api/v1/assessments/{attempt_id}/answers",
            json={"question_id": q["id"], "selected_option_id": opt_id},
            headers=headers
        )
        assert ans_res.status_code == 200

    # 4. Submit Assessment
    sub_res = client.post(f"/api/v1/assessments/{attempt_id}/submit", headers=headers)
    assert sub_res.status_code == 200
    result = sub_res.json()

    assert result["attempt_id"] == attempt_id
    assert "overall_score" in result
    assert isinstance(result["overall_score"], float)
    assert "categories" in result
    assert "skills" in result
    assert "strengths" in result
    assert "weaknesses" in result

    # 5. Fetch Result via GET
    get_res = client.get(f"/api/v1/assessments/{attempt_id}/result", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["overall_score"] == result["overall_score"]

    # 6. Attempt answer modification on submitted attempt -> 409
    res_mod = client.post(
        f"/api/v1/assessments/{attempt_id}/answers",
        json={"question_id": questions[0]["id"], "selected_option_id": questions[0]["options"][0]["id"]},
        headers=headers
    )
    assert res_mod.status_code == 409


def test_assessment_retake_creates_new_attempt():
    ensure_seed_data_exists()
    email = f"student_retake_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # Attempt 1
    start_1 = client.post("/api/v1/assessments/start", headers=headers).json()
    attempt_1_id = start_1["attempt_id"]
    client.post(f"/api/v1/assessments/{attempt_1_id}/submit", headers=headers)

    # Attempt 2 (Retake)
    start_2 = client.post("/api/v1/assessments/start", headers=headers).json()
    attempt_2_id = start_2["attempt_id"]

    assert attempt_1_id != attempt_2_id, "Retake must create a NEW attempt ID!"

    # Verify history lists both attempts
    hist = client.get("/api/v1/assessments/history", headers=headers).json()
    attempt_ids = [h["attempt_id"] for h in hist]
    assert attempt_1_id in attempt_ids
    assert attempt_2_id in attempt_ids


def test_assessment_ownership_and_rbac():
    ensure_seed_data_exists()
    email_a = f"stud_owner_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"stud_owner_b_{uuid.uuid4().hex[:6]}@example.com"
    fac_email = f"fac_owner_{uuid.uuid4().hex[:6]}@example.com"

    token_a = get_token_for_user(email_a, role="STUDENT")
    token_b = get_token_for_user(email_b, role="STUDENT")
    token_fac = get_token_for_user(fac_email, role="FACULTY")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_fac = {"Authorization": f"Bearer {token_fac}"}

    roles = client.get("/api/v1/career-roles").json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers_a)

    # Student A starts assessment
    attempt_a = client.post("/api/v1/assessments/start", headers=headers_a).json()["attempt_id"]

    # Student B attempts to access Student A's attempt -> 404
    res_b_get = client.get(f"/api/v1/assessments/{attempt_a}", headers=headers_b)
    assert res_b_get.status_code == 404

    # Student B attempts to submit Student A's attempt -> 404
    res_b_sub = client.post(f"/api/v1/assessments/{attempt_a}/submit", headers=headers_b)
    assert res_b_sub.status_code == 404

    # Faculty attempts to start assessment -> 403
    res_fac_start = client.post("/api/v1/assessments/start", headers=headers_fac)
    assert res_fac_start.status_code == 403
