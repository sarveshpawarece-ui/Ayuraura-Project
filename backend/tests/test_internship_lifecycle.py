import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, role: str = "INDUSTRY", password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"{role.title()} User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_internship_full_lifecycle():
    emp_email = f"employer_{uuid.uuid4().hex[:6]}@ayurhosp.com"
    emp_token = get_token_for_user(emp_email, role="INDUSTRY")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    student_email = f"intern_student_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Employer creates Internship Posting
    post_data = {
        "title": "Clinical Panchakarma Intern",
        "organization_name": "AyurShree Super-Specialty Hospital",
        "organization_type": "HOSPITAL",
        "description": "Six-month rotational clinical internship in Panchakarma therapies and IPD patient management.",
        "department": "Panchakarma",
        "duration_months": 6,
        "mode": "ON_SITE",
        "location_city": "Pune",
        "location_state": "Maharashtra",
        "stipend_inr_month": 15000.0,
        "capacity": 3,
        "deadline": "2026-11-30",
        "requirements": "Completed 3rd year BAMS or Intern BAMS.",
        "skills_required": ["Panchakarma", "Nadi Pariksha", "Patient History Taking"]
    }
    res = client.post("/api/v1/internships", json=post_data, headers=emp_headers)
    assert res.status_code == 201
    posting = res.json()
    assert posting["title"] == "Clinical Panchakarma Intern"
    assert posting["status"] in ["OPEN", "PUBLISHED"]

    # 2. List Postings
    list_res = client.get("/api/v1/internships?city=Pune")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Student applies for Internship
    apply_res = client.post(
        f"/api/v1/internships/{posting['id']}/apply",
        json={"cover_note": "Extremely motivated to learn clinical therapies under senior Vaidyas."},
        headers=student_headers
    )
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    assert app_data["status"] == "APPLIED"

    # 4. Anti-duplicate application guard
    dup_res = client.post(
        f"/api/v1/internships/{posting['id']}/apply",
        json={"cover_note": "Duplicate application attempt."},
        headers=student_headers
    )
    assert dup_res.status_code == 400
    assert "already applied" in dup_res.json()["detail"].lower()

    # 5. Issue Offer Letter
    offer_res = client.post(
        f"/api/v1/internships/applications/{app_data['id']}/offer",
        json={
            "start_date": "2026-12-01",
            "end_date": "2027-05-31",
            "stipend_amount": 15000.0,
            "terms_text": "Standard clinical internship terms and compliance with hospital safety protocols."
        },
        headers=emp_headers
    )
    assert offer_res.status_code == 200
    assert offer_res.json()["status"] == "ISSUED"

    # 6. Issue Completion Certificate with SHA-256 Hash
    cert_res = client.post(
        f"/api/v1/internships/applications/{app_data['id']}/complete",
        json={"total_hours_completed": 600.0, "final_remarks": "Exemplary clinical performance."},
        headers=emp_headers
    )
    assert cert_res.status_code == 200
    cert = cert_res.json()
    assert "CERT" in cert["certificate_token"]
    assert len(cert["certificate_hash"]) == 64
    assert cert["is_valid"] is True
