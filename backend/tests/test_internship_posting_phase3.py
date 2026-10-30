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

    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": role,
            "full_name": f"{role.title()} User",
            "qualification": "BAMS, MD Panchakarma",
            "specialization": "Panchakarma & Clinical Medicine",
            "years_of_experience": 6,
            "state_medical_council": "Maharashtra Council of Indian Medicine",
            "code_or_reg_number": f"AYUR-REG-{uuid.uuid4().hex[:6].upper()}",
            "city": "Pune",
            "state": "Maharashtra"
        }
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_doctor_create_and_manage_internship_lifecycle():
    doc_email = f"dr_internship_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    today = date.today()
    start_date = today + timedelta(days=15)
    end_date = start_date + timedelta(days=180)
    deadline = today + timedelta(days=10)

    # 1. Create a Published Internship
    payload = {
        "title": "Clinical Panchakarma & Metabolic Disorders Internship",
        "description": "Intensive 6-month clinical rotation covering classical Shodhana protocols, Vamana, Virechana, and patient case evaluations under senior Ayurvedic consultants.",
        "specialization": "Panchakarma & Detoxification",
        "internship_type": "Clinical Internship",
        "location_city": "Pune",
        "location_state": "Maharashtra",
        "location_address": "AyurSetu Wellness Centre, Shivaji Nagar",
        "mode": "ON_SITE",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "duration_months": 6,
        "duration_text": "6 Months Full-Time",
        "number_of_seats": 4,
        "application_deadline": str(deadline),
        "eligible_courses": ["BAMS", "MD Ayurveda (Kayachikitsa/Panchakarma)"],
        "eligible_years": ["Final Year", "Intern", "Fresh Graduate"],
        "minimum_qualification": "BAMS Student / Graduate",
        "experience_required": "Basic pulse examination familiarity",
        "skills_required": ["Nadi Pariksha", "Snehan", "Swedan", "Shirodhara", "Case History Recording"],
        "responsibilities": "Assisting senior physician in OPD, documenting daily Panchakarma therapies, observing Vamana procedures.",
        "learning_outcomes": "Mastery of 5 classical Shodhana karma, independent Nadi diagnosis, formulation selection.",
        "benefits": ["NCISM Verified Certificate", "Monthly Clinical Stipend", "Job Recommendation Letter"],
        "working_hours": "09:00 AM - 05:00 PM (Mon-Sat)",
        "stipend_inr_month": 12000.0,
        "status": "PUBLISHED"
    }

    create_res = client.post("/api/v1/internships", json=payload, headers=doc_headers)
    assert create_res.status_code == 201
    internship = create_res.json()
    assert internship["title"] == payload["title"]
    assert internship["status"] == "PUBLISHED"
    assert internship["number_of_seats"] == 4
    assert internship["stipend_inr_month"] == 12000.0
    internship_id = internship["id"]

    # 2. Get Internship Detail by ID
    get_res = client.get(f"/api/v1/internships/{internship_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == internship_id
    assert "doctor_name" in get_res.json()

    # 3. Edit Internship
    edit_payload = {
        "stipend_inr_month": 15000.0,
        "number_of_seats": 6,
        "working_hours": "09:30 AM - 05:30 PM (Mon-Sat)"
    }
    edit_res = client.put(f"/api/v1/internships/{internship_id}", json=edit_payload, headers=doc_headers)
    assert edit_res.status_code == 200
    assert edit_res.json()["stipend_inr_month"] == 15000.0
    assert edit_res.json()["number_of_seats"] == 6

    # 4. Close Internship
    close_res = client.post(f"/api/v1/internships/{internship_id}/close", headers=doc_headers)
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "CLOSED"

    # 5. Doctor lists their own internships
    list_res = client.get("/api/v1/internships/doctor/me?status=ALL", headers=doc_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_doctor_save_draft_and_publish():
    doc_email = f"dr_draft_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    today = date.today()
    start_date = today + timedelta(days=20)
    end_date = start_date + timedelta(days=90)
    deadline = today + timedelta(days=15)

    # 1. Create a DRAFT Internship
    draft_payload = {
        "title": "Ayurvedic Drug Formulation & Standardization Research",
        "description": "3-month research internship focusing on classical Bhaishajya Kalpana decoctions, microbial testing, and chromatographic TLC profiling.",
        "specialization": "Dravyaguna & Rasa Shastra",
        "internship_type": "Research Internship",
        "location_city": "Mumbai",
        "location_state": "Maharashtra",
        "mode": "HYBRID",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "duration_months": 3,
        "number_of_seats": 2,
        "application_deadline": str(deadline),
        "status": "DRAFT"
    }

    create_res = client.post("/api/v1/internships", json=draft_payload, headers=doc_headers)
    assert create_res.status_code == 201
    draft_item = create_res.json()
    assert draft_item["status"] == "DRAFT"
    draft_id = draft_item["id"]

    # 2. Verify draft is NOT listed in public search
    pub_res = client.get("/api/v1/internships?search=Standardization")
    assert pub_res.status_code == 200
    found_in_public = any(p["id"] == draft_id for p in pub_res.json())
    assert not found_in_public

    # 3. Publish the draft
    pub_action_res = client.post(f"/api/v1/internships/{draft_id}/publish", headers=doc_headers)
    assert pub_action_res.status_code == 200
    assert pub_action_res.json()["status"] == "PUBLISHED"

    # 4. Verify now visible in public search
    pub_res2 = client.get("/api/v1/internships?search=Standardization")
    assert pub_res2.status_code == 200
    found_in_public2 = any(p["id"] == draft_id for p in pub_res2.json())
    assert found_in_public2


def test_internship_date_and_seats_validation():
    doc_email = f"dr_val_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    today = date.today()

    # Case A: End date before start date
    invalid_payload_1 = {
        "title": "Invalid Date Internship",
        "description": "Testing date validation for end date before start date.",
        "location_city": "Delhi",
        "location_state": "Delhi",
        "start_date": str(today + timedelta(days=20)),
        "end_date": str(today + timedelta(days=10)),  # Earlier than start date!
        "number_of_seats": 2
    }
    res1 = client.post("/api/v1/internships", json=invalid_payload_1, headers=doc_headers)
    assert res1.status_code == 422

    # Case B: Deadline after start date
    invalid_payload_2 = {
        "title": "Invalid Deadline Internship",
        "description": "Testing deadline validation for deadline after start date.",
        "location_city": "Delhi",
        "location_state": "Delhi",
        "start_date": str(today + timedelta(days=10)),
        "end_date": str(today + timedelta(days=40)),
        "application_deadline": str(today + timedelta(days=15)),  # After start date!
        "number_of_seats": 2
    }
    res2 = client.post("/api/v1/internships", json=invalid_payload_2, headers=doc_headers)
    assert res2.status_code == 422

    # Case C: Negative or zero seats
    invalid_payload_3 = {
        "title": "Invalid Seats Internship",
        "description": "Testing seat count validation.",
        "location_city": "Delhi",
        "location_state": "Delhi",
        "number_of_seats": 0
    }
    res3 = client.post("/api/v1/internships", json=invalid_payload_3, headers=doc_headers)
    assert res3.status_code == 422


def test_student_browse_and_filter_internships():
    student_email = f"st_intern_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Public list with filter
    res = client.get("/api/v1/internships?mode=ON_SITE")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
