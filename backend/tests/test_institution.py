import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, password: str = "AyurSetu@2026", role: str = "INSTITUTION") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": "Test Institution User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_institution_profile_view_and_update():
    # Token for institution user
    inst_token = get_token_for_user("institution_admin@ayurveda.com", role="INSTITUTION")
    headers = {"Authorization": f"Bearer {inst_token}"}

    # 1. Get profile
    res_get = client.get("/api/v1/institution/profile", headers=headers)
    assert res_get.status_code == 200
    data = res_get.json()
    assert "institution_name" in data
    assert "verification_status" in data

    # 2. Update profile with valid HTTPS website
    res_patch = client.patch(
        "/api/v1/institution/profile",
        json={
            "description": "Premier Institute for Ayurvedic Studies & Clinical Research.",
            "website_url": "https://ayurvedainstitute.edu.in",
            "contact_email": "contact@ayurvedainstitute.edu.in",
            "contact_phone": "+91 80 2345 6789",
            "city": "Bengaluru",
            "state": "Karnataka"
        },
        headers=headers
    )
    assert res_patch.status_code == 200
    updated = res_patch.json()
    assert updated["description"] == "Premier Institute for Ayurvedic Studies & Clinical Research."
    assert updated["website_url"] == "https://ayurvedainstitute.edu.in"

    # 3. Security test: Reject HTTP / unsafe URL protocols
    res_unsafe = client.patch(
        "/api/v1/institution/profile",
        json={"website_url": "http://unsafe-site.com"},
        headers=headers
    )
    assert res_unsafe.status_code == 400


def test_institution_verification_check_and_admin_approval():
    inst_email = f"unverified_{str(uuid.uuid4())[:6]}@ayurveda.com"
    inst_token = get_token_for_user(inst_email, role="INSTITUTION")
    inst_headers = {"Authorization": f"Bearer {inst_token}"}


    # 1. Profile accessible when pending
    res_prof = client.get("/api/v1/institution/profile", headers=inst_headers)
    assert res_prof.status_code == 200
    inst_id = res_prof.json()["id"]

    # 2. Protected student directory returns 403 when PENDING
    res_students = client.get("/api/v1/institution/students", headers=inst_headers)
    assert res_students.status_code == 403

    # 3. Admin verifies institution
    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res_admin = client.patch(
        f"/api/v1/admin/institutions/{inst_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers=admin_headers
    )
    assert res_admin.status_code == 200
    assert res_admin.json()["verification_status"] == "VERIFIED"

    # 4. Protected student directory now accessible
    res_students_ok = client.get("/api/v1/institution/students", headers=inst_headers)
    assert res_students_ok.status_code == 200


def test_department_management_crud_and_idor():
    inst1_token = get_token_for_user("dept_inst1@ayurveda.com", role="INSTITUTION")
    headers1 = {"Authorization": f"Bearer {inst1_token}"}

    inst2_token = get_token_for_user("dept_inst2@ayurveda.com", role="INSTITUTION")
    headers2 = {"Authorization": f"Bearer {inst2_token}"}

    dept_code = f"DG-{str(uuid.uuid4())[:6]}"
    res_create = client.post(
        "/api/v1/institution/departments",
        json={
            "name": "Department of Dravya Guna",
            "code": dept_code,
            "description": "Ayurvedic Materia Medica and Pharmacology Department"
        },
        headers=headers1
    )
    assert res_create.status_code == 201
    dept1_id = res_create.json()["id"]
    assert res_create.json()["code"] == dept_code


    # 2. List departments Inst 1
    res_list = client.get("/api/v1/institution/departments", headers=headers1)
    assert res_list.status_code == 200
    assert any(d["id"] == dept1_id for d in res_list.json())

    # 3. IDOR Security Check: Inst 2 cannot modify Inst 1 department
    res_idor = client.patch(
        f"/api/v1/institution/departments/{dept1_id}",
        json={"name": "Hacked Dept Name"},
        headers=headers2
    )
    assert res_idor.status_code == 404

    # 4. Deactivate department Inst 1
    res_deact = client.post(f"/api/v1/institution/departments/{dept1_id}/deactivate", headers=headers1)
    assert res_deact.status_code == 200


def test_student_membership_invite_and_deactivation():
    # Setup verified institution
    inst_token = get_token_for_user("student_mgr_inst@ayurveda.com", role="INSTITUTION")
    headers = {"Authorization": f"Bearer {inst_token}"}

    res_prof = client.get("/api/v1/institution/profile", headers=headers)
    inst_id = res_prof.json()["id"]

    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    client.patch(
        f"/api/v1/admin/institutions/{inst_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 1. Setup registered student
    student_email = "membership_student@ayurveda.com"
    get_token_for_user(student_email, role="STUDENT")

    # 2. Invite / Link student
    res_invite = client.post(
        "/api/v1/institution/students/invite",
        json={"email": student_email, "student_identifier": "AYUR-2026-101"},
        headers=headers
    )
    assert res_invite.status_code == 200
    assert res_invite.json()["status"] in ["ASSOCIATED", "INVITATION_SENT"]

    # 3. List students in institution
    res_students = client.get("/api/v1/institution/students", headers=headers)
    assert res_students.status_code == 200
    items = res_students.json()["items"]
    assert len(items) > 0
    target_student = next((s for s in items if s["email"] == student_email), None)
    assert target_student is not None
    student_id = target_student["id"]

    # 4. Get student detail
    res_detail = client.get(f"/api/v1/institution/students/{student_id}", headers=headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["email"] == student_email
    assert "readiness_indicators" in detail
    # Privacy check: Ensure password/hash not exposed
    assert "password" not in detail
    assert "hashed_password" not in detail

    # 5. Deactivate student membership (data preservation check)
    res_deact = client.delete(f"/api/v1/institution/students/{student_id}/membership", headers=headers)
    assert res_deact.status_code == 200
    assert res_deact.json()["status"] == "INACTIVE"


def test_institution_opportunity_and_application_monitoring():
    inst_token = get_token_for_user("monitoring_inst@ayurveda.com", role="INSTITUTION")
    headers = {"Authorization": f"Bearer {inst_token}"}

    res_prof = client.get("/api/v1/institution/profile", headers=headers)
    inst_id = res_prof.json()["id"]

    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    client.patch(
        f"/api/v1/admin/institutions/{inst_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 1. Read-only opportunity discovery
    res_opps = client.get("/api/v1/institution/opportunities", headers=headers)
    assert res_opps.status_code == 200
    assert isinstance(res_opps.json(), list)

    # 2. Read-only application monitoring
    res_apps = client.get("/api/v1/institution/applications", headers=headers)
    assert res_apps.status_code == 200
    assert isinstance(res_apps.json(), list)


def test_institution_analytics():
    inst_token = get_token_for_user("analytics_inst@ayurveda.com", role="INSTITUTION")
    headers = {"Authorization": f"Bearer {inst_token}"}

    res_prof = client.get("/api/v1/institution/profile", headers=headers)
    inst_id = res_prof.json()["id"]

    admin_token = get_token_for_user("admin_user@ayurveda.com", role="ADMIN")
    client.patch(
        f"/api/v1/admin/institutions/{inst_id}/verification",
        json={"verification_status": "VERIFIED"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 1. Dashboard overview
    res_dash = client.get("/api/v1/institution/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash = res_dash.json()
    assert "total_students" in dash
    assert "assessment_completion_rate" in dash

    # 2. Analytics detail
    res_analytics = client.get("/api/v1/institution/analytics?period=30d", headers=headers)
    assert res_analytics.status_code == 200
    an = res_analytics.json()
    assert "pipeline_funnel" in an
    assert "common_skill_gaps" in an
    assert "career_distribution" in an
    assert "demand_vs_supply" in an
