import pytest
import uuid
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
        json={"email": email, "password": password, "role": role, "full_name": f"{role.title()} User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_doctor_profile_and_admin_verification():
    doc_email = f"vaidya_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    admin_email = f"admin_{uuid.uuid4().hex[:6]}@ayursetu.org"
    admin_token = get_token_for_user(admin_email, role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Doctor creates/updates profile
    doc_profile_data = {
        "full_name": "Vaidya Suresh Joshi",
        "registration_number": f"MAHA-AYU-{uuid.uuid4().hex[:6].upper()}",
        "state_medical_council": "Maharashtra Council of Indian Medicine",
        "qualification": "BAMS, MD (Panchakarma)",
        "specialization": "Panchakarma & Chronic Pain",
        "years_of_experience": 12,
        "bio": "Experienced consultant in classical Vamana, Virechana and Basti protocols.",
        "phone": "+919876543220",
        "city": "Pune",
        "state": "Maharashtra",
        "clinic_address": "AyurShree Healing Clinic, Deccan"
    }
    res = client.post("/api/v1/doctors/profile", json=doc_profile_data, headers=doc_headers)
    assert res.status_code == 200
    doc_profile = res.json()
    assert doc_profile["verification_status"] == "PENDING"

    # 2. Anti-self-verification guard: Doctor cannot approve their own verification
    bad_self = client.post(f"/api/v1/doctors/{doc_profile['id']}/verify?approve=true", headers=doc_headers)
    assert bad_self.status_code in [400, 403]

    # 3. Admin verifies doctor profile
    verify_res = client.post(f"/api/v1/doctors/{doc_profile['id']}/verify?approve=true", headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "VERIFIED"


def test_doctor_student_messaging_and_session():
    doc_email = f"doctor_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # Get doctor user ID
    doc_me = client.get("/api/v1/auth/me", headers=doc_headers).json()
    doc_user_id = doc_me["id"]

    student_email = f"student_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Student requests mentorship session
    session_res = client.post("/api/v1/doctors/sessions/request", json={
        "doctor_user_id": doc_user_id,
        "scheduled_date": "2026-10-25",
        "start_time": "04:00 PM",
        "duration_minutes": 30,
        "purpose": "Guidance on Ayurvedic Clinical Research and AIAPGET Preparation",
        "notes": "Looking forward to learning from your clinical experience."
    }, headers=student_headers)
    assert session_res.status_code == 200
    sess = session_res.json()
    assert sess["status"] == "REQUESTED"

    # 2. Student sends direct message to Doctor
    msg_res = client.post("/api/v1/doctors/messages", json={
        "recipient_id": doc_user_id,
        "content": "Namaste Doctor, I have requested a mentorship slot on October 25th."
    }, headers=student_headers)
    assert msg_res.status_code == 200
    assert msg_res.json()["is_read"] is False

    # 3. Doctor retrieves conversation
    student_me = client.get("/api/v1/auth/me", headers=student_headers).json()
    conv_res = client.get(f"/api/v1/doctors/messages/conversation/{student_me['id']}", headers=doc_headers)
    assert conv_res.status_code == 200
    assert len(conv_res.json()) >= 1


def test_ngo_registration_and_admin_verification():
    ngo_email = f"darpan_ngo_{uuid.uuid4().hex[:6]}@ayursetu.org"
    ngo_token = get_token_for_user(ngo_email, role="NGO")
    ngo_headers = {"Authorization": f"Bearer {ngo_token}"}

    admin_email = f"admin_{uuid.uuid4().hex[:6]}@ayursetu.org"
    admin_token = get_token_for_user(admin_email, role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. NGO profile creation
    darpan_code = f"MH/2026/{uuid.uuid4().hex[:7].upper()}"
    ngo_payload = {
        "name": "Seva Arogya Foundation",
        "darpan_id": darpan_code,
        "registration_number": "TRUST/PUNE/8821/2020",
        "description": "Dedicated to community health camps and herbal plant conservation.",
        "service_areas": ["Free Health Camps", "Herb Conservation", "Tribal AYUSH Outreach"],
        "contact_person": "Ramesh Kulkarni",
        "email": ngo_email,
        "phone": "+919876543230",
        "website_url": "https://seva-arogya.org",
        "city": "Pune",
        "state": "Maharashtra",
        "address": "402 Nariman Point Annex",
        "pincode": "411004"
    }
    res = client.post("/api/v1/ngos/profile", json=ngo_payload, headers=ngo_headers)
    assert res.status_code == 200
    ngo_profile = res.json()
    assert ngo_profile["verification_status"] == "PENDING"

    # 2. Admin verifies NGO
    verif = client.post(f"/api/v1/ngos/{ngo_profile['id']}/verify?approve=true", headers=admin_headers)
    assert verif.status_code == 200
    assert verif.json()["verification_status"] == "VERIFIED"
