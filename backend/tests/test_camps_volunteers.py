import pytest
import uuid
from datetime import date
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, role: str = "STUDENT", password: str = "AyurSetu@2026") -> str:
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


def test_camp_creation_and_service_whitelist():
    ngo_email = f"ngo_{uuid.uuid4().hex[:6]}@ayursetu.org"
    token = get_token_for_user(ngo_email, role="NGO")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Valid AYUSH Camp creation
    valid_payload = {
        "title": "Mega AYUSH Rural Wellness Camp",
        "description": "Offering free pulse diagnosis, lifestyle counselling and Suvarnaprashan drops.",
        "camp_date": "2026-10-15",
        "start_time": "09:00 AM",
        "end_time": "04:00 PM",
        "venue_name": "Gram Panchayat Sabhagruh",
        "address": "Main Road, Khed",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "410501",
        "capacity": 150,
        "services_offered": ["General health checkup", "Ayurveda consultation", "Suvarnaprashan administration"],
        "doctors_attending": ["Vaidya Rajesh Sharma, MD (Ayu)"],
        "contact_phone": "+919876543210",
        "contact_email": "camp@ayursetu-ngo.org"
    }
    res = client.post("/api/v1/camps", json=valid_payload, headers=headers)
    assert res.status_code == 201
    camp = res.json()
    assert camp["title"] == "Mega AYUSH Rural Wellness Camp"
    assert camp["status"] == "UPCOMING"
    assert camp["registered_attendees_count"] == 0

    # 2. Rejection of prohibited medical keywords
    prohibited_payload = {
        "title": "Unauthorized Invasive Camp",
        "description": "Prohibited invasive medical treatments.",
        "camp_date": "2026-10-20",
        "start_time": "10:00 AM",
        "end_time": "02:00 PM",
        "venue_name": "Unapproved Venue",
        "address": "Market Yard",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "410501",
        "capacity": 50,
        "services_offered": ["Emergency Surgery", "Allopathic Injection"],
        "doctors_attending": [],
        "contact_phone": "+919876543210",
        "contact_email": "unauth@example.com"
    }
    res_bad = client.post("/api/v1/camps", json=prohibited_payload, headers=headers)
    assert res_bad.status_code == 400
    assert "Prohibited medical service detected" in res_bad.json()["detail"]


def test_camp_attendee_registration_and_capacity_guard():
    ngo_email = f"ngo_{uuid.uuid4().hex[:6]}@ayursetu.org"
    token = get_token_for_user(ngo_email, role="NGO")
    headers = {"Authorization": f"Bearer {token}"}

    # Create camp with strict capacity = 2
    payload = {
        "title": "Suvarnaprashan Wellness Camp",
        "description": "Child immunity drops distribution.",
        "camp_date": "2026-11-01",
        "start_time": "08:00 AM",
        "end_time": "01:00 PM",
        "venue_name": "Primary School Hall",
        "address": "Sector 4",
        "city": "Nashik",
        "state": "Maharashtra",
        "pincode": "422001",
        "capacity": 2,
        "services_offered": ["Suvarnaprashan administration", "Lifestyle counselling"],
        "doctors_attending": [],
        "contact_phone": "+919876543211",
        "contact_email": "nashik@ayursetu-ngo.org"
    }
    camp = client.post("/api/v1/camps", json=payload, headers=headers).json()
    camp_id = camp["id"]

    # Register Attendee 1
    r1 = client.post(
        f"/api/v1/camps/{camp_id}/register-attendee",
        json={"attendee_name": "Aarav Patil", "phone": "9876543210", "age": 6, "gender": "Male"}
    )
    assert r1.status_code == 200

    # Register Attendee 2
    r2 = client.post(
        f"/api/v1/camps/{camp_id}/register-attendee",
        json={"attendee_name": "Ananya Deshmukh", "phone": "9876543212", "age": 8, "gender": "Female"}
    )
    assert r2.status_code == 200

    # Attempt Attendee 3 (Over Capacity Limit)
    r3 = client.post(
        f"/api/v1/camps/{camp_id}/register-attendee",
        json={"attendee_name": "Vihaan Shinde", "phone": "9876543213", "age": 5, "gender": "Male"}
    )
    assert r3.status_code == 400
    assert "maximum attendee capacity" in r3.json()["detail"]


def test_camp_volunteer_lifecycle_and_certificate():
    ngo_email = f"ngo_{uuid.uuid4().hex[:6]}@ayursetu.org"
    ngo_token = get_token_for_user(ngo_email, role="NGO")
    ngo_headers = {"Authorization": f"Bearer {ngo_token}"}

    student_email = f"student_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. NGO creates camp
    camp = client.post("/api/v1/camps", json={
        "title": "Geriatric Ayurveda OPD Camp",
        "description": "Holistic arthritis and joint mobility consultations.",
        "camp_date": "2026-11-10",
        "start_time": "09:00 AM",
        "end_time": "05:00 PM",
        "venue_name": "Senior Citizens Center",
        "address": "Shivaji Nagar",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411005",
        "capacity": 200,
        "services_offered": ["Ayurveda consultation", "Prakriti analysis"],
        "doctors_attending": [],
        "contact_phone": "+919876543214",
        "contact_email": "geriatric@ayursetu-ngo.org"
    }, headers=ngo_headers).json()
    camp_id = camp["id"]

    # 2. Student applies for volunteer role
    app_res = client.post(f"/api/v1/camps/{camp_id}/volunteer", json={
        "applicant_name": "Student Scholar",
        "email": student_email,
        "phone": "9876543299",
        "specialization_or_course": "BAMS Final Year",
        "role_applied_for": "Patient Triage Assistant",
        "motivation_note": "Keen to assist in Prakriti assessments."
    }, headers=student_headers)
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["status"] == "APPLIED"

    # 3. Duplicate application prevention guard
    dup_res = client.post(f"/api/v1/camps/{camp_id}/volunteer", json={
        "applicant_name": "Student Scholar",
        "email": student_email,
        "phone": "9876543299",
        "role_applied_for": "Herbal Dispensary"
    }, headers=student_headers)
    assert dup_res.status_code == 400
    assert "already applied" in dup_res.json()["detail"]

    # 4. NGO selects volunteer
    rev_res = client.patch(f"/api/v1/camps/volunteers/{app_data['id']}/review", json={
        "decision": "SELECTED",
        "assigned_duty": "Patient Registration & Prakriti Triage"
    }, headers=ngo_headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "SELECTED"

    # 5. Issue Verifiable Certificate with SHA-256 Hash
    cert_res = client.post(
        f"/api/v1/camps/{camp_id}/certificates/issue?user_id={app_data['user_id']}&recipient_name=Student+Scholar&role_performed=Patient+Triage+Assistant&hours=8.0",
        headers=ngo_headers
    )
    assert cert_res.status_code == 200
    cert = cert_res.json()
    assert cert["certificate_token"].startswith("camp-cert-")
    assert len(cert["certificate_hash"]) == 64
    assert cert["is_valid"] is True
