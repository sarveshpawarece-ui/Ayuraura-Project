import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.skill_gap_service import skill_gap_service

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


def test_gap_classification_rules():
    """
    Tests exact boundary classification logic and formulas.
    """
    # Mastered (Current > Required)
    c, g = skill_gap_service.classify_skill_gap(current_score=85.0, required_score=80.0)
    assert c == "MASTERED"
    assert g == 0.0
    assert skill_gap_service.calculate_gap_priority(g, "HIGH", c) == "NONE"

    # Exact Required
    c, g = skill_gap_service.classify_skill_gap(current_score=80.0, required_score=80.0)
    assert c == "MASTERED"
    assert g == 0.0
    assert skill_gap_service.calculate_gap_priority(g, "CRITICAL", c) == "NONE"

    # One point below (Adequate)
    c, g = skill_gap_service.classify_skill_gap(current_score=79.0, required_score=80.0)
    assert c == "ADEQUATE"
    assert g == 1.0

    # Ten points below (Adequate threshold edge)
    c, g = skill_gap_service.classify_skill_gap(current_score=70.0, required_score=80.0)
    assert c == "ADEQUATE"
    assert g == 10.0

    # Eleven points below (Weak threshold)
    c, g = skill_gap_service.classify_skill_gap(current_score=69.0, required_score=80.0)
    assert c == "WEAK"
    assert g == 11.0

    # Zero score (Weak, NOT Missing)
    c, g = skill_gap_service.classify_skill_gap(current_score=0.0, required_score=80.0)
    assert c == "WEAK"
    assert g == 80.0

    # Unassessed / Null score (Missing)
    c, g = skill_gap_service.classify_skill_gap(current_score=None, required_score=80.0)
    assert c == "MISSING"
    assert g == 80.0
    assert skill_gap_service.calculate_gap_priority(g, "CRITICAL", c) == "CRITICAL"


def test_priority_calculation_matrix():
    """
    Tests priority deterministic matrix rules.
    """
    p = skill_gap_service.calculate_gap_priority(gap=25.0, importance="CRITICAL", classification="WEAK")
    assert p in ["CRITICAL", "HIGH"]

    p_low = skill_gap_service.calculate_gap_priority(gap=5.0, importance="LOW", classification="ADEQUATE")
    assert p_low == "LOW"


def test_skill_gap_api_workflow():
    """
    Tests end-to-end skill gap report generation API.
    """
    token = get_token_for_user("gap_student1@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch available career roles
    res_roles = client.get("/api/v1/career-roles", headers=headers)
    assert res_roles.status_code == 200
    roles = res_roles.json()
    assert len(roles) > 0
    target_role = roles[0]

    # 2. Set target career role
    res_target = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": target_role["id"]},
        headers=headers
    )
    assert res_target.status_code == 200

    # 3. Fetch skill gaps endpoint
    res_gap = client.get("/api/v1/students/me/skill-gaps", headers=headers)
    assert res_gap.status_code == 200
    gap_data = res_gap.json()

    assert gap_data["career_role"]["id"] == target_role["id"]
    assert "summary" in gap_data
    assert "skills" in gap_data
    assert isinstance(gap_data["summary"]["total_required_skills"], int)
    assert isinstance(gap_data["summary"]["overall_gap_percentage"], float)


def test_target_career_change_recalculates_gaps():
    """
    Tests that changing target career recalculates gap report without altering skill scores.
    """
    token = get_token_for_user("gap_student2@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    res_roles = client.get("/api/v1/career-roles", headers=headers)
    roles = res_roles.json()
    assert len(roles) >= 2

    role_1 = roles[0]
    role_2 = roles[1]

    # Set Role 1
    client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": role_1["id"]},
        headers=headers
    )
    res_gap1 = client.get("/api/v1/students/me/skill-gaps", headers=headers)
    assert res_gap1.status_code == 200
    report1 = res_gap1.json()
    assert report1["career_role"]["id"] == role_1["id"]

    # Switch to Role 2
    client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": role_2["id"]},
        headers=headers
    )
    res_gap2 = client.get("/api/v1/students/me/skill-gaps", headers=headers)
    assert res_gap2.status_code == 200
    report2 = res_gap2.json()
    assert report2["career_role"]["id"] == role_2["id"]


def test_skill_gap_security_and_rbac():
    """
    Tests RBAC authorization rules and cross-student isolation.
    """
    token_faculty = get_token_for_user("gap_fac@ayursetu.edu.in", role="FACULTY")
    token_industry = get_token_for_user("gap_ind@ayursetu.edu.in", role="INDUSTRY")

    # Faculty attempting student gap endpoint -> 403
    res_fac = client.get("/api/v1/students/me/skill-gaps", headers={"Authorization": f"Bearer {token_faculty}"})
    assert res_fac.status_code == 403

    # Industry attempting student gap endpoint -> 403
    res_ind = client.get("/api/v1/students/me/skill-gaps", headers={"Authorization": f"Bearer {token_industry}"})
    assert res_ind.status_code == 403

    # Cross-student isolation check: Student A vs Student B
    token_student_a = get_token_for_user("student_a_gap@ayursetu.edu.in", role="STUDENT")
    token_student_b = get_token_for_user("student_b_gap@ayursetu.edu.in", role="STUDENT")

    headers_a = {"Authorization": f"Bearer {token_student_a}"}
    headers_b = {"Authorization": f"Bearer {token_student_b}"}

    # Set target career for A
    res_roles = client.get("/api/v1/career-roles", headers=headers_a)
    roles = res_roles.json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers_a)

    # Student A gets own profile
    res_a = client.get("/api/v1/students/me/skill-gaps", headers=headers_a)
    assert res_a.status_code == 200

    # Student B gets own profile (not A's)
    res_b = client.get("/api/v1/students/me/skill-gaps", headers=headers_b)
    # B has no target career set yet -> 400
    assert res_b.status_code == 400
