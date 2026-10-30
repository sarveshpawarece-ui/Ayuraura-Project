import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(email: str, role: str = "STUDENT", password: str = "AyurSetuPass123!") -> str:
    res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"Security Test {role.title()}"}
    )
    assert reg_res.status_code in [200, 201]

    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_jwt_auth_security_and_invalid_tokens():
    # 1. Missing token
    res_no_token = client.get("/api/v1/students/me/profile")
    assert res_no_token.status_code == 401

    # 2. Tampered JWT token
    res_fake_token = client.get(
        "/api/v1/students/me/profile",
        headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.fakesignature"}
    )
    assert res_fake_token.status_code == 401


def test_rbac_role_escalation_protection():
    student_email = f"sec_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token(student_email, role="STUDENT")

    ind_email = f"sec_ind_{uuid.uuid4().hex[:6]}@ayurveda.com"
    ind_token = get_token(ind_email, role="INDUSTRY")

    inst_email = f"sec_inst_{uuid.uuid4().hex[:6]}@ayurveda.com"
    inst_token = get_token(inst_email, role="INSTITUTION")

    # 1. Student attempting Admin endpoint
    res1 = client.get(
        "/api/v1/admin/verifications",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res1.status_code == 403

    # 2. Industry attempting Admin endpoint
    res2 = client.get(
        "/api/v1/admin/verifications",
        headers={"Authorization": f"Bearer {ind_token}"}
    )
    assert res2.status_code == 403

    # 3. Institution attempting Admin endpoint
    res3 = client.get(
        "/api/v1/admin/verifications",
        headers={"Authorization": f"Bearer {inst_token}"}
    )
    assert res3.status_code == 403


def test_idor_application_privacy_isolation():
    student1_email = f"app_privacy_s1_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token1 = get_token(student1_email, role="STUDENT")

    student2_email = f"app_privacy_s2_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token2 = get_token(student2_email, role="STUDENT")

    fake_app_id = str(uuid.uuid4())
    res_idor = client.get(
        f"/api/v1/applications/{fake_app_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res_idor.status_code in [403, 404]


def test_privacy_public_portfolio_sanitization():
    student_email = f"pub_sanit_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Fetch & Auto-create portfolio
    get_res = client.get("/api/v1/student/portfolio", headers=headers)
    assert get_res.status_code == 200

    # 2. Update portfolio slug & visibility via PATCH
    custom_slug = f"student-{uuid.uuid4().hex[:6]}"
    res_update = client.patch(
        "/api/v1/student/portfolio",
        json={
            "slug": custom_slug,
            "title": "Ayurvedic R&D Specialist",
            "visibility": "PUBLIC",
            "headline": "Specialized in Dravyaguna & Pharmacovigilance"
        },
        headers=headers
    )
    assert res_update.status_code == 200

    # Publish portfolio so public resolution is accessible
    client.post("/api/v1/student/portfolio/publish", headers=headers)

    # 3. Fetch public portfolio without authentication
    res_pub = client.get(f"/api/v1/public/portfolio/{custom_slug}")
    assert res_pub.status_code == 200
    data = res_pub.json()
    assert data["slug"] == custom_slug
    
    # Assert private fields are NOT exposed in public payload
    assert "email" not in data
    assert "applications" not in data
    assert "reviewer_notes" not in data
    assert "verification_evidence" not in data


def test_xss_and_sql_injection_parameterization_safety():
    student_email = f"xss_test_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. XSS payload test in profile headline
    xss_payload = "<script>alert('XSS')</script>"
    res_prof = client.put(
        "/api/v1/students/me/profile",
        json={
            "full_name": "Safe Student Name",
            "headline": xss_payload,
            "bio": "Testing input escaping"
        },
        headers=headers
    )
    assert res_prof.status_code == 200

    # 2. SQL injection payload test in search endpoint
    sql_payload = "' OR '1'='1' --"
    res_search = client.get(
        f"/api/v1/opportunities?search={sql_payload}",
        headers=headers
    )
    assert res_search.status_code == 200
