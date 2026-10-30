import pytest
import uuid
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, role: str = "DOCTOR", password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]

    reg_payload = {
        "email": email,
        "password": password,
        "role": role,
        "full_name": f"{role.title()} User",
        "city": "Pune",
        "state": "Maharashtra"
    }

    if role == "DOCTOR":
        reg_payload.update({
            "qualification": "BAMS, MD Kayachikitsa",
            "specialization": "Kayachikitsa & Pulse Diagnosis",
            "years_of_experience": 8,
            "state_medical_council": "Maharashtra Medical Board",
            "code_or_reg_number": f"DOC-TEST-{uuid.uuid4().hex[:6].upper()}"
        })
    elif role == "STUDENT":
        reg_payload.update({
            "code_or_reg_number": f"STU-REG-{uuid.uuid4().hex[:6].upper()}"
        })

    reg_response = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_internship_application_full_lifecycle():
    # 1. Doctor creates an internship
    doc_email = f"dr_apps_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    today = date.today()
    start_date = today + timedelta(days=20)
    end_date = start_date + timedelta(days=120)
    deadline = today + timedelta(days=15)

    post_payload = {
        "title": "Clinical Kayachikitsa & Chronic Disease Rotation",
        "description": "Comprehensive hands-on OPD rotation focusing on chronic metabolic and autoimmune conditions managed through classical Ayurvedic therapeutics.",
        "specialization": "Kayachikitsa",
        "internship_type": "Clinical Internship",
        "location_city": "Pune",
        "location_state": "Maharashtra",
        "mode": "ON_SITE",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "duration_months": 4,
        "number_of_seats": 3,
        "application_deadline": str(deadline),
        "skills_required": ["Nadi Pariksha", "Classical Herbology", "Case Analysis"],
        "status": "PUBLISHED"
    }
    post_res = client.post("/api/v1/internships", json=post_payload, headers=doc_headers)
    assert post_res.status_code == 201
    internship_id = post_res.json()["id"]

    # 2. Student 1 applies
    st1_email = f"st1_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    st1_token = get_token_for_user(st1_email, role="STUDENT")
    st1_headers = {"Authorization": f"Bearer {st1_token}"}

    apply_payload = {
        "cover_note": "I have completed 4th year BAMS and have a strong interest in classical pulse diagnosis under Dr. guidance.",
        "cover_letter": "I have completed 4th year BAMS and have a strong interest in classical pulse diagnosis under Dr. guidance.",
        "resume_url": "https://ayursetu.in/resumes/student1.pdf",
        "portfolio_url": "https://ayursetu.in/portfolio/student1"
    }

    apply_res = client.post(f"/api/v1/internships/{internship_id}/apply", json=apply_payload, headers=st1_headers)
    assert apply_res.status_code in [200, 201]
    app1 = apply_res.json()
    assert app1["status"] == "APPLIED"
    assert app1["internship_id"] == internship_id
    assert app1["match_score"] >= 60.0
    app1_id = app1["id"]

    # 3. Duplicate application blocked
    dup_res = client.post(f"/api/v1/internships/{internship_id}/apply", json=apply_payload, headers=st1_headers)
    assert dup_res.status_code == 400

    # 4. Student 1 views their applications
    st_apps_res = client.get("/api/v1/student/applications", headers=st1_headers)
    assert st_apps_res.status_code == 200
    st_apps = st_apps_res.json()
    assert len(st_apps) >= 1
    assert any(a["id"] == app1_id for a in st_apps)

    # 5. Doctor views applications dashboard
    doc_apps_res = client.get(f"/api/v1/doctor/applications?internship_id={internship_id}", headers=doc_headers)
    assert doc_apps_res.status_code == 200
    doc_apps = doc_apps_res.json()
    assert len(doc_apps) >= 1
    found_app = next(a for a in doc_apps if a["id"] == app1_id)
    assert found_app["student"] is not None
    assert "full_name" in found_app["student"]

    # 6. Doctor shortlists Student 1
    shortlist_res = client.post(f"/api/v1/applications/{app1_id}/shortlist", headers=doc_headers)
    assert shortlist_res.status_code == 200
    assert shortlist_res.json()["status"] == "SHORTLISTED"

    # 7. Student 2 applies and Doctor rejects with reason
    st2_email = f"st2_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    st2_token = get_token_for_user(st2_email, role="STUDENT")
    st2_headers = {"Authorization": f"Bearer {st2_token}"}

    apply2_res = client.post(f"/api/v1/internships/{internship_id}/apply", json={"cover_note": "Interested in Panckakarma"}, headers=st2_headers)
    assert apply2_res.status_code in [200, 201]
    app2_id = apply2_res.json()["id"]

    reject_res = client.post(
        f"/api/v1/applications/{app2_id}/reject",
        json={"rejection_reason": "Current cohort is filled for this specialization."},
        headers=doc_headers
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"
    assert "Current cohort is filled" in reject_res.json()["rejection_reason"]

    # 8. RBAC: Unauthorized student or doctor cannot shortlist/reject
    unauth_doc_email = f"dr_other_{uuid.uuid4().hex[:6]}@ayursetu.org"
    unauth_doc_token = get_token_for_user(unauth_doc_email, role="DOCTOR")
    unauth_headers = {"Authorization": f"Bearer {unauth_doc_token}"}

    unauth_shortlist = client.post(f"/api/v1/applications/{app1_id}/shortlist", headers=unauth_headers)
    assert unauth_shortlist.status_code == 403


def test_student_withdraw_application():
    doc_email = f"dr_with_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    today = date.today()
    post_res = client.post(
        "/api/v1/internships",
        json={
            "title": "Hospital Ayurveda OPD Fellowship",
            "description": "Hospital OPD training with Panchakarma procedures.",
            "location_city": "Nagpur",
            "location_state": "Maharashtra",
            "deadline": str(today + timedelta(days=20)),
            "status": "PUBLISHED"
        },
        headers=doc_headers
    )
    assert post_res.status_code == 201
    internship_id = post_res.json()["id"]

    st_email = f"st_with_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    st_token = get_token_for_user(st_email, role="STUDENT")
    st_headers = {"Authorization": f"Bearer {st_token}"}

    app_res = client.post(f"/api/v1/internships/{internship_id}/apply", json={"cover_note": "Applying now"}, headers=st_headers)
    assert app_res.status_code in [200, 201]
    app_id = app_res.json()["id"]

    # Student withdraws
    withdraw_res = client.post(f"/api/v1/applications/{app_id}/withdraw", headers=st_headers)
    assert withdraw_res.status_code == 200
    assert withdraw_res.json()["status"] == "WITHDRAWN"
