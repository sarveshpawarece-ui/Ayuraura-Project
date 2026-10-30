import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.matching_engine import matching_engine
from app.schemas.matching import MatchWeightConfig
from app.models.domain import ExperienceLevel

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


def test_matching_engine_weight_normalization():
    """
    Tests weight normalization when custom weights are supplied.
    """
    custom = MatchWeightConfig(
        skill_match_weight=2.0,
        career_match_weight=1.0,
        required_coverage_weight=0.5,
        experience_fit_weight=0.5
    )
    norm = matching_engine.normalize_weights(custom)
    assert norm.skill_match_weight == pytest.approx(0.50)
    assert norm.career_match_weight == pytest.approx(0.25)
    assert norm.required_coverage_weight == pytest.approx(0.125)
    assert norm.experience_fit_weight == pytest.approx(0.125)


def test_recalculate_opportunities_api_with_custom_weights():
    """
    Tests POST /api/v1/students/me/opportunities/recalculate with custom weights.
    """
    token = get_token_for_user("match_eng_student@ayursetu.edu.in", role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # Set target career
    res_roles = client.get("/api/v1/career-roles", headers=headers)
    roles = res_roles.json()
    assert len(roles) > 0
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers=headers)

    # Recalculate with heavy skill weight
    req_payload = {
        "weights": {
            "skill_match_weight": 0.70,
            "career_match_weight": 0.15,
            "required_coverage_weight": 0.10,
            "experience_fit_weight": 0.05
        }
    }
    res_recalc = client.post("/api/v1/students/me/opportunities/recalculate", json=req_payload, headers=headers)
    assert res_recalc.status_code == 200
    data = res_recalc.json()
    assert "summary" in data
    assert "opportunities" in data


def test_candidate_ranking_api_workflow():
    """
    Tests Industry/Faculty candidate matrix ranking for an opportunity.
    """
    token_student = get_token_for_user("match_candidate_std@ayursetu.edu.in", role="STUDENT")
    token_industry = get_token_for_user("match_ind_partner@ayursetu.edu.in", role="INDUSTRY")

    # Student selects career
    res_roles = client.get("/api/v1/career-roles", headers={"Authorization": f"Bearer {token_student}"})
    roles = res_roles.json()
    client.put("/api/v1/students/me/target-career", json={"career_role_id": roles[0]["id"]}, headers={"Authorization": f"Bearer {token_student}"})

    # Public catalog to get opportunity ID
    res_opps = client.get("/api/v1/opportunities")
    opps = res_opps.json()
    assert len(opps) > 0
    opp_id = opps[0]["id"]

    # Industry ranks candidates
    res_rank = client.get(f"/api/v1/opportunities/{opp_id}/candidate-matches", headers={"Authorization": f"Bearer {token_industry}"})
    assert res_rank.status_code == 200
    rank_data = res_rank.json()

    assert rank_data["opportunity_id"] == opp_id
    assert "total_candidates_evaluated" in rank_data
    assert "top_candidates" in rank_data
    assert isinstance(rank_data["top_candidates"], list)


def test_candidate_ranking_rbac():
    """
    Tests RBAC security for candidate matrix ranking.
    """
    token_student = get_token_for_user("match_std_sec@ayursetu.edu.in", role="STUDENT")
    res_opps = client.get("/api/v1/opportunities")
    opp_id = res_opps.json()[0]["id"]

    # Student calling candidate matrix endpoint -> 403 Forbidden
    res_forbidden = client.get(f"/api/v1/opportunities/{opp_id}/candidate-matches", headers={"Authorization": f"Bearer {token_student}"})
    assert res_forbidden.status_code == 403
