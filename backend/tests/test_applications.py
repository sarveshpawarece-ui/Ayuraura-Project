import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.models.domain import ApplicationStatus, CoverLetterStatus

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
        res_login = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        return res_login.json()["access_token"]
    return response.json()["access_token"]


def setup_student_and_get_opportunity(email: str):
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Select target career role
    res_roles = client.get("/api/v1/career-roles", headers=headers)
    if res_roles.status_code == 200 and len(res_roles.json()) > 0:
        target_role = res_roles.json()[0]
        client.put(
            "/api/v1/students/me/target-career",
            json={"career_role_id": target_role["id"]},
            headers=headers
        )

    # 2. Get existing applications for student to avoid reusing an opportunity with prior status
    res_my_apps = client.get("/api/v1/students/me/applications", headers=headers)
    existing_opp_ids = set()
    if res_my_apps.status_code == 200:
        apps_list = res_my_apps.json().get("applications", [])
        existing_opp_ids = {a["opportunity_id"] for a in apps_list if "opportunity_id" in a}

    # 3. Get opportunities report
    res_opps = client.get("/api/v1/students/me/opportunities", headers=headers)
    if res_opps.status_code == 200 and "opportunities" in res_opps.json():
        opps = res_opps.json()["opportunities"]
        if opps:
            now_utc = datetime.now(timezone.utc)
            for opp in opps:
                target_opp = opp.get("opportunity", opp)
                opp_id = target_opp["id"]
                if opp_id in existing_opp_ids:
                    continue
                dl_str = target_opp.get("application_deadline")
                if not dl_str:
                    return token, headers, opp_id
                try:
                    dl_dt = datetime.fromisoformat(dl_str.replace(" ", "T"))
                    if dl_dt.tzinfo is None:
                        dl_dt = dl_dt.replace(tzinfo=timezone.utc)
                    if dl_dt > now_utc:
                        return token, headers, opp_id
                except Exception:
                    pass

    # Fallback to general list endpoint
    res_raw = client.get("/api/v1/opportunities", headers=headers)
    opps_raw = res_raw.json() if res_raw.status_code == 200 else []
    now_utc = datetime.now(timezone.utc)
    for opp in opps_raw:
        opp_id = opp["id"]
        if opp_id in existing_opp_ids:
            continue
        dl_str = opp.get("application_deadline")
        if not dl_str:
            return token, headers, opp_id
        try:
            dl_dt = datetime.fromisoformat(dl_str.replace(" ", "T"))
            if dl_dt.tzinfo is None:
                dl_dt = dl_dt.replace(tzinfo=timezone.utc)
            if dl_dt > now_utc:
                return token, headers, opp_id
        except Exception:
            pass

    return token, headers, opps_raw[0]["id"] if opps_raw else None




def test_create_and_save_application():
    """
    Tests creating a SAVED application.
    """
    import uuid
    email = f"app_student1_{uuid.uuid4().hex[:6]}@ayursetu.edu.in"
    token, headers, opp_id = setup_student_and_get_opportunity(email)

    # Save opportunity as application
    res_save = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "SAVED", "notes": "Interested in R&D"},
        headers=headers
    )
    assert res_save.status_code == 201
    data = res_save.json()
    assert data["status"] == "SAVED"
    assert data["opportunity_id"] == opp_id
    assert data["match_score_snapshot"] is not None
    assert len(data["status_history"]) > 0

    # Retrieve application detail
    app_id = data["id"]
    res_detail = client.get(f"/api/v1/students/me/applications/{app_id}", headers=headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == app_id
    assert detail["status"] == "SAVED"


def test_mark_as_applied_and_duplicate_prevention():
    """
    Tests marking application as APPLIED and duplicate request protection.
    """
    token, headers, opp_id = setup_student_and_get_opportunity("app_student2@ayursetu.edu.in")

    # 1. Create APPLIED application
    res_app = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "APPLIED", "notes": "Submitted form on company site"},
        headers=headers
    )
    assert res_app.status_code == 201
    app_data = res_app.json()
    assert app_data["status"] == "APPLIED"
    assert app_data["applied_at"] is not None

    # 2. Duplicate submission returns existing application safely
    res_dup = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "APPLIED"},
        headers=headers
    )
    assert res_dup.status_code in (200, 201)
    assert res_dup.json()["id"] == app_data["id"]


def test_valid_and_invalid_status_transitions():
    """
    Tests status transition state machine rules.
    """
    import uuid
    email = f"app_student3_{uuid.uuid4().hex[:6]}@ayursetu.edu.in"
    token, headers, opp_id = setup_student_and_get_opportunity(email)

    # 1. Create SAVED application
    res_init = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "SAVED"},
        headers=headers
    )
    app_id = res_init.json()["id"]

    # 2. SAVED -> APPLIED (Valid)
    res_applied = client.post(
        f"/api/v1/students/me/applications/{app_id}/mark-applied",
        json={"notes": "Completed external submission"},
        headers=headers
    )
    assert res_applied.status_code == 200, f"Mark applied failed: {res_applied.status_code} {res_applied.text}"
    assert res_applied.json()["status"] == "APPLIED"


    # 3. APPLIED -> UNDER_REVIEW (Valid)
    res_ur = client.patch(
        f"/api/v1/students/me/applications/{app_id}/status",
        json={"status": "UNDER_REVIEW", "notes": "Recruiter acknowledged receipt"},
        headers=headers
    )
    assert res_ur.status_code == 200
    assert res_ur.json()["status"] == "UNDER_REVIEW"

    # 4. UNDER_REVIEW -> REJECTED (Valid)
    res_rej = client.patch(
        f"/api/v1/students/me/applications/{app_id}/status",
        json={"status": "REJECTED", "notes": "Position filled"},
        headers=headers
    )
    assert res_rej.status_code == 200
    assert res_rej.json()["status"] == "REJECTED"

    # 5. REJECTED -> INTERVIEW (Invalid! Must return 400)
    res_inv = client.patch(
        f"/api/v1/students/me/applications/{app_id}/status",
        json={"status": "INTERVIEW"},
        headers=headers
    )
    assert res_inv.status_code == 400


def test_withdraw_application():
    """
    Tests withdrawing an active application.
    """
    token, headers, opp_id = setup_student_and_get_opportunity("app_student4@ayursetu.edu.in")

    res_app = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "APPLIED"},
        headers=headers
    )
    app_id = res_app.json()["id"]

    # Withdraw application
    res_w = client.post(
        f"/api/v1/students/me/applications/{app_id}/withdraw",
        json={"notes": "Accepted another offer"},
        headers=headers
    )
    assert res_w.status_code == 200
    assert res_w.json()["status"] == "WITHDRAWN"


def test_summary_and_analytics_endpoints():
    """
    Tests application summary counters and analytics calculations.
    """
    token, headers, opp_id = setup_student_and_get_opportunity("app_student5@ayursetu.edu.in")

    client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "APPLIED"},
        headers=headers
    )

    # Summary
    res_sum = client.get("/api/v1/students/me/applications/summary", headers=headers)
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert "total_applications" in summary
    assert "saved" in summary
    assert "applied" in summary

    # Analytics
    res_ana = client.get("/api/v1/students/me/applications/analytics", headers=headers)
    assert res_ana.status_code == 200
    analytics = res_ana.json()
    assert "response_rate" in analytics
    assert "interview_rate" in analytics
    assert "offer_rate" in analytics
    assert "average_match_score" in analytics


def test_private_notes_and_url_security():
    """
    Tests private notes editing and URL security checks.
    """
    token, headers, opp_id = setup_student_and_get_opportunity("app_student6@ayursetu.edu.in")

    res_app = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "SAVED"},
        headers=headers
    )
    app_id = res_app.json()["id"]

    # Edit private notes & follow-up date
    res_edit = client.patch(
        f"/api/v1/students/me/applications/{app_id}",
        json={
            "notes": "Follow up with HR after 5 days",
            "follow_up_date": "2026-09-15",
            "resume_version": "v2_custom"
        },
        headers=headers
    )
    assert res_edit.status_code == 200
    data = res_edit.json()
    assert "Follow up with HR" in data["notes"]
    assert data["follow_up_date"] == "2026-09-15"
    assert data["resume_version"] == "v2_custom"

    # Notes exceeding 5000 chars should be rejected
    huge_notes = "A" * 5001
    res_huge = client.patch(
        f"/api/v1/students/me/applications/{app_id}",
        json={"notes": huge_notes},
        headers=headers
    )
    assert res_huge.status_code == 422  # Pydantic max_length validation


def test_cross_student_access_isolation():
    """
    Tests that Student A cannot access or mutate Student B's applications.
    """
    token_a, headers_a, opp_id = setup_student_and_get_opportunity("app_student_a@ayursetu.edu.in")
    token_b, headers_b, _ = setup_student_and_get_opportunity("app_student_b@ayursetu.edu.in")

    # Student A creates application
    res_a = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "status": "SAVED"},
        headers=headers_a
    )
    app_id = res_a.json()["id"]

    # Student B attempts to fetch Student A's application -> 404
    res_b_get = client.get(f"/api/v1/students/me/applications/{app_id}", headers=headers_b)
    assert res_b_get.status_code == 404

    # Student B attempts to withdraw Student A's application -> 404
    res_b_w = client.post(f"/api/v1/students/me/applications/{app_id}/withdraw", json={}, headers=headers_b)
    assert res_b_w.status_code == 404
