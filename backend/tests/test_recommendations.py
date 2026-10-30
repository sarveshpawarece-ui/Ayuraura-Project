import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.recommendation_service import recommendation_service
from app.models.domain import QuestionDifficulty

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


def test_relevance_formula_and_difficulty_fit():
    """
    Tests deterministic difficulty fit and explanation formatting.
    """
    fit_easy = recommendation_service.calculate_difficulty_fit(current_score=40.0, difficulty=QuestionDifficulty.EASY)
    assert fit_easy == 1.0

    fit_hard = recommendation_service.calculate_difficulty_fit(current_score=40.0, difficulty=QuestionDifficulty.HARD)
    assert fit_hard < fit_easy

    reason = recommendation_service.generate_explanation_reason(
        skill_name="Data Analysis",
        current_score=48.0,
        required_score=70.0,
        gap=22.0,
        classification="WEAK",
        career_role_name="Ayurvedic Pharmaceutical R&D"
    )
    assert "Data Analysis" in reason
    assert "22.0" in reason
    assert "Ayurvedic Pharmaceutical R&D" in reason


def test_recommendations_api_workflow():
    """
    Tests end-to-end recommendation generation API.
    """
    token = get_token_for_user("rec_student1@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch available career roles & set target
    res_roles = client.get("/api/v1/career-roles", headers=headers)
    assert res_roles.status_code == 200
    roles = res_roles.json()
    assert len(roles) > 0
    target_role = roles[0]

    client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": target_role["id"]},
        headers=headers
    )

    # 2. Fetch recommendations endpoint
    res_rec = client.get("/api/v1/students/me/recommendations", headers=headers)
    assert res_rec.status_code == 200
    rec_data = res_rec.json()

    assert rec_data["career_role"]["id"] == target_role["id"]
    assert "summary" in rec_data
    assert "recommendations" in rec_data
    assert isinstance(rec_data["summary"]["total_recommendations"], int)


def test_dismiss_recommendation():
    """
    Tests recommendation dismissal API.
    """
    token = get_token_for_user("rec_student2@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    res_roles = client.get("/api/v1/career-roles", headers=headers)
    roles = res_roles.json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    res_rec = client.get("/api/v1/students/me/recommendations", headers=headers)
    assert res_rec.status_code == 200
    recs = res_rec.json()["recommendations"]

    if len(recs) > 0:
        target_rec_id = recs[0]["id"]

        # Dismiss recommendation
        res_dis = client.post(f"/api/v1/students/me/recommendations/{target_rec_id}/dismiss", headers=headers)
        assert res_dis.status_code == 204


        # Verify dismissed recommendation is excluded from active list
        res_rec2 = client.get("/api/v1/students/me/recommendations", headers=headers)
        recs2 = res_rec2.json()["recommendations"]
        rec_ids_after = [r["id"] for r in recs2]
        assert target_rec_id not in rec_ids_after


def test_recommendation_security_and_rbac():
    """
    Tests RBAC authorization rules for recommendation endpoints.
    """
    token_faculty = get_token_for_user("rec_fac@ayursetu.edu.in", role="FACULTY")
    token_industry = get_token_for_user("rec_ind@ayursetu.edu.in", role="INDUSTRY")

    # Faculty attempting student recommendations -> 403
    res_fac = client.get("/api/v1/students/me/recommendations", headers={"Authorization": f"Bearer {token_faculty}"})
    assert res_fac.status_code == 403

    # Industry attempting student recommendations -> 403
    res_ind = client.get("/api/v1/students/me/recommendations", headers={"Authorization": f"Bearer {token_industry}"})
    assert res_ind.status_code == 403
