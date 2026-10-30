import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.opportunity_matching_service import opportunity_matching_service
from app.models.domain import ExperienceLevel, MatchClassification

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


def test_experience_fit_matrix():
    """
    Tests experience fit score matrix.
    """
    fit_fresher = opportunity_matching_service.calculate_experience_fit("STUDENT", ExperienceLevel.FRESHER)
    assert fit_fresher == 100.0

    fit_entry = opportunity_matching_service.calculate_experience_fit("STUDENT", ExperienceLevel.ENTRY)
    assert fit_entry == 90.0

    fit_exp = opportunity_matching_service.calculate_experience_fit("STUDENT", ExperienceLevel.EXPERIENCED)
    assert fit_exp < fit_fresher


def test_matching_classification_and_explanation():
    """
    Tests match score classification thresholds and explanation generator.
    """
    assert opportunity_matching_service.classify_match(88.0) == MatchClassification.EXCELLENT
    assert opportunity_matching_service.classify_match(75.0) == MatchClassification.GOOD
    assert opportunity_matching_service.classify_match(55.0) == MatchClassification.PARTIAL
    assert opportunity_matching_service.classify_match(40.0) == MatchClassification.LOW

    reason = opportunity_matching_service.generate_match_explanation(
        career_role_name="Ayurvedic Pharmaceutical R&D",
        career_match_score=100.0,
        matched_count=4,
        total_req=5,
        critical_missing_skills=["Data Analysis"]
    )

    assert "Ayurvedic Pharmaceutical R&D" in reason
    assert "4 of 5" in reason
    assert "Critical requirement not yet fully demonstrated in: Data Analysis" in reason


def test_personalized_opportunities_api_workflow():
    """
    Tests end-to-end opportunity matching API.
    """
    token = get_token_for_user("opp_student1@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Select target career
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

    # 2. Get personalized opportunities
    res_opp = client.get("/api/v1/students/me/opportunities", headers=headers)
    assert res_opp.status_code == 200
    opp_data = res_opp.json()

    assert opp_data["target_career"]["id"] == target_role["id"]
    assert "summary" in opp_data
    assert "opportunities" in opp_data
    assert isinstance(opp_data["summary"]["total_opportunities"], int)

    if len(opp_data["opportunities"]) > 0:
        first_match = opp_data["opportunities"][0]
        assert "match_score" in first_match
        assert "breakdown" in first_match
        assert "opportunity" in first_match
        assert first_match["opportunity"]["organization_name"] is not None


def test_dismiss_opportunity_match():
    """
    Tests opportunity match dismissal API.
    """
    token = get_token_for_user("opp_student2@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    res_roles = client.get("/api/v1/career-roles", headers=headers)
    roles = res_roles.json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    res_opp = client.get("/api/v1/students/me/opportunities", headers=headers)
    assert res_opp.status_code == 200
    opps = res_opp.json()["opportunities"]

    if len(opps) > 0:
        target_opp_id = opps[0]["opportunity"]["id"]

        # Dismiss opportunity match
        res_dis = client.post(f"/api/v1/students/me/opportunities/{target_opp_id}/dismiss", headers=headers)
        assert res_dis.status_code == 204

        # Verify dismissed match is excluded from active list
        res_opp2 = client.get("/api/v1/students/me/opportunities", headers=headers)
        opps2 = res_opp2.json()["opportunities"]
        opp_ids_after = [o["opportunity"]["id"] for o in opps2]
        assert target_opp_id not in opp_ids_after


def test_opportunity_security_and_rbac():
    """
    Tests RBAC authorization and security rules for opportunity endpoints.
    """
    token_faculty = get_token_for_user("opp_fac@ayursetu.edu.in", role="FACULTY")
    token_industry = get_token_for_user("opp_ind@ayursetu.edu.in", role="INDUSTRY")

    # Faculty attempting student personalized opportunities -> 403
    res_fac = client.get("/api/v1/students/me/opportunities", headers={"Authorization": f"Bearer {token_faculty}"})
    assert res_fac.status_code == 403

    # Industry attempting student personalized opportunities -> 403
    res_ind = client.get("/api/v1/students/me/opportunities", headers={"Authorization": f"Bearer {token_industry}"})
    assert res_ind.status_code == 403

    # Public catalog endpoint accessible to everyone
    res_pub = client.get("/api/v1/opportunities")
    assert res_pub.status_code == 200
    assert isinstance(res_pub.json(), list)
