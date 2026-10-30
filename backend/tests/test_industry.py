import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token_for_user(email: str, password: str = "AyurSetu@2026", role: str = "INDUSTRY") -> str:
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
                "organization_or_institution": f"{email.split('@')[0].title()} Corp"
            }
        )
        res_login = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        return res_login.json()["access_token"]
    return response.json()["access_token"]


def test_industry_profile_get_and_update():
    token = get_token_for_user("test_ind_profile@ayurveda.com", role="INDUSTRY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get organization profile
    res = client.get("/api/v1/industry/organization", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "company_name" in data
    assert data["verification_status"] in ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]

    # 2. Update organization profile
    res_update = client.patch(
        "/api/v1/industry/organization",
        json={
            "company_name": "Himalaya Herbals Advanced",
            "description": "Leading Ayurvedic research & manufacturing hub.",
            "website_url": "https://himalayaherbals.example.com",
            "contact_email": "contact@himalayaherbals.example.com",
            "location": "Bengaluru, India"
        },
        headers=headers
    )
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["company_name"] == "Himalaya Herbals Advanced"
    assert updated_data["website_url"] == "https://himalayaherbals.example.com"
    assert updated_data["location"] == "Bengaluru, India"


def test_unverified_org_cannot_publish_opportunity():
    token = get_token_for_user("unverified_org@ayurveda.com", role="INDUSTRY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create opportunity trying to publish immediately -> should fail or save as DRAFT
    res = client.post(
        "/api/v1/industry/opportunities",
        json={
            "title": "Unverified Opportunity",
            "description": "This is a test description for an unverified opportunity.",
            "opportunity_type": "JOB",
            "work_mode": "ONSITE",
            "employment_type": "FULL_TIME",
            "status": "PUBLISHED"
        },
        headers=headers
    )
    assert res.status_code in [403, 201]
    if res.status_code == 201:
        # If created, status must be overridden to DRAFT
        assert res.json()["status"] == "DRAFT"
        opp_id = res.json()["id"]

        # 2. Try to publish explicitly via endpoint -> must return 403 Forbidden
        res_pub = client.post(f"/api/v1/industry/opportunities/{opp_id}/publish", headers=headers)
        assert res_pub.status_code == 403


def test_admin_verification_and_verified_publish_flow():
    # 1. Register industry user
    ind_email = "org_verification_test@ayurveda.com"
    ind_token = get_token_for_user(ind_email, role="INDUSTRY")
    ind_headers = {"Authorization": f"Bearer {ind_token}"}

    # Get org id
    res_profile = client.get("/api/v1/industry/organization", headers=ind_headers)
    org_id = res_profile.json()["id"]

    # 2. Register admin user & verify organization
    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res_verify = client.patch(
        f"/api/v1/admin/organizations/{org_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers=admin_headers
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["verification_status"] == "VERIFIED"

    # 3. Create draft opportunity
    deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    res_opp = client.post(
        "/api/v1/industry/opportunities",
        json={
            "title": "Ayurvedic Medical Officer",
            "description": "Responsible for managing Ayurvedic consultations and clinical operations.",
            "opportunity_type": "JOB",
            "work_mode": "HYBRID",
            "employment_type": "FULL_TIME",
            "application_deadline": deadline,
            "status": "DRAFT"
        },
        headers=ind_headers
    )
    assert res_opp.status_code == 201
    opp_id = res_opp.json()["id"]
    assert res_opp.json()["status"] == "DRAFT"

    # 4. Publish opportunity now that org is VERIFIED
    res_pub = client.post(f"/api/v1/industry/opportunities/{opp_id}/publish", headers=ind_headers)
    assert res_pub.status_code == 200
    assert res_pub.json()["status"] == "PUBLISHED"

    # 5. Pause opportunity
    res_pause = client.post(f"/api/v1/industry/opportunities/{opp_id}/pause", headers=ind_headers)
    assert res_pause.status_code == 200
    assert res_pause.json()["status"] == "PAUSED"

    # 6. Resume opportunity
    res_resume = client.post(f"/api/v1/industry/opportunities/{opp_id}/resume", headers=ind_headers)
    assert res_resume.status_code == 200
    assert res_resume.json()["status"] == "PUBLISHED"

    # 7. Close opportunity
    res_close = client.post(f"/api/v1/industry/opportunities/{opp_id}/close", headers=ind_headers)
    assert res_close.status_code == 200
    assert res_close.json()["status"] == "CLOSED"


def test_applicant_review_pipeline_and_internal_notes():
    # 1. Setup verified organization and published opportunity
    ind_email = "applicant_review_org@ayurveda.com"
    ind_token = get_token_for_user(ind_email, role="INDUSTRY")
    ind_headers = {"Authorization": f"Bearer {ind_token}"}

    res_org = client.get("/api/v1/industry/organization", headers=ind_headers)
    org_id = res_org.json()["id"]

    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    client.patch(
        f"/api/v1/admin/organizations/{org_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers=admin_headers
    )

    deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    res_opp = client.post(
        "/api/v1/industry/opportunities",
        json={
            "title": "Ayurvedic R&D Specialist",
            "description": "Research and formulation development for standardized herbal formulations.",
            "opportunity_type": "RESEARCH",
            "application_deadline": deadline,
            "status": "PUBLISHED"
        },
        headers=ind_headers
    )
    opp_id = res_opp.json()["id"]

    # 2. Setup student user and apply
    student_token = get_token_for_user("applicant_student@ayurveda.com", role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    res_app = client.post(
        "/api/v1/students/me/applications",
        json={"opportunity_id": opp_id, "notes": "Eager to contribute to Ayurvedic formulation research."},
        headers=student_headers
    )
    assert res_app.status_code == 201
    application_id = res_app.json()["id"]

    # 3. Industry lists applicants
    res_apps = client.get("/api/v1/industry/applications", headers=ind_headers)
    assert res_apps.status_code == 200
    apps_list = res_apps.json()
    assert len(apps_list) > 0
    target_app = next((a for a in apps_list if a["id"] == application_id), None)
    assert target_app is not None
    assert target_app["status"] in ["SAVED", "APPLIED", "UNDER_REVIEW"]


    # 4. Industry gets candidate detail
    res_detail = client.get(f"/api/v1/industry/applications/{application_id}", headers=ind_headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == application_id
    assert "match_breakdown" in detail
    assert "student_skills" in detail

    # 5. Advance applicant status -> SHORTLISTED
    res_status = client.patch(
        f"/api/v1/industry/applications/{application_id}/status",
        json={"status": "SHORTLISTED", "note": "Strong academic record in Dravya Guna."},
        headers=ind_headers
    )
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "SHORTLISTED"

    # 6. Add organization-private internal note
    res_note = client.post(
        f"/api/v1/industry/applications/{application_id}/notes",
        json={"note": "Scheduled technical screening for next Tuesday."},
        headers=ind_headers
    )
    assert res_note.status_code == 201
    note_data = res_note.json()
    assert note_data["note"] == "Scheduled technical screening for next Tuesday."
    note_id = note_data["id"]

    # 7. List internal notes
    res_notes_list = client.get(f"/api/v1/industry/applications/{application_id}/notes", headers=ind_headers)
    assert res_notes_list.status_code == 200
    assert len(res_notes_list.json()) >= 1

    # 8. Delete internal note
    res_del_note = client.delete(f"/api/v1/industry/applications/{application_id}/notes/{note_id}", headers=ind_headers)
    assert res_del_note.status_code == 204


def test_organization_isolation_and_idor_protection():
    # Setup Org A
    org_a_token = get_token_for_user("org_a@ayurveda.com", role="INDUSTRY")
    org_a_headers = {"Authorization": f"Bearer {org_a_token}"}
    res_opp_a = client.post(
        "/api/v1/industry/opportunities",
        json={
            "title": "Org A Opportunity",
            "description": "Description for Org A opportunity.",
            "status": "DRAFT"
        },
        headers=org_a_headers
    )
    opp_a_id = res_opp_a.json()["id"]

    # Setup Org B
    org_b_token = get_token_for_user("org_b@ayurveda.com", role="INDUSTRY")
    org_b_headers = {"Authorization": f"Bearer {org_b_token}"}

    # Org B trying to access Org A's opportunity -> must fail with 404
    res_idor_opp = client.get(f"/api/v1/industry/opportunities/{opp_a_id}", headers=org_b_headers)
    assert res_idor_opp.status_code == 404

    # Org B trying to update Org A's opportunity -> must fail with 404
    res_idor_update = client.patch(
        f"/api/v1/industry/opportunities/{opp_a_id}",
        json={"title": "Hacked Title"},
        headers=org_b_headers
    )
    assert res_idor_update.status_code == 404


def test_industry_dashboard_summary_and_analytics():
    token = get_token_for_user("analytics_org@ayurveda.com", role="INDUSTRY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get dashboard summary
    res_dash = client.get("/api/v1/industry/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert "total_opportunities" in dash_data
    assert "total_applications" in dash_data
    assert "recent_opportunities" in dash_data
    assert "recent_applications" in dash_data

    # 2. Get analytics
    res_analytics = client.get("/api/v1/industry/analytics?period=30d", headers=headers)
    assert res_analytics.status_code == 200
    analytics_data = res_analytics.json()
    assert analytics_data["period"] == "30d"
    assert "pipeline_funnel" in analytics_data
    assert "match_score_distribution" in analytics_data
