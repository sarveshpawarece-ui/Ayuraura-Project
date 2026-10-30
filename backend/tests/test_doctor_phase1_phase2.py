import pytest
import uuid
from datetime import date
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
            "qualification": "BAMS, MD Ayurveda",
            "specialization": "Kayachikitsa & Panchakarma",
            "years_of_experience": 8,
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


def test_doctor_full_profile_and_completion():
    doc_email = f"dr_ayush_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    headers = {"Authorization": f"Bearer {doc_token}"}

    # 1. Get Doctor Profile Me
    res = client.get("/api/v1/doctors/profile/me", headers=headers)
    assert res.status_code == 200
    profile = res.json()
    assert profile["email"] == doc_email
    assert "profile_completion_percentage" in profile
    assert profile["profile_completion_percentage"] > 0

    # 2. Update Doctor Profile Partial
    update_payload = {
        "bio": "Senior Ayurvedic Physician specializing in clinical panchakarma protocols and metabolic wellness.",
        "designation": "Chief Ayurvedic Consultant",
        "areas_of_expertise": ["Panchakarma", "Vamana", "Basti", "Pulse Diagnosis (Nadi Pariksha)"],
        "gender": "Male",
        "date_of_birth": "1988-06-15",
        "clinic_address": "AyurSetu Wellness Clinic, FC Road, Pune"
    }
    update_res = client.put("/api/v1/doctors/profile/me", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["designation"] == "Chief Ayurvedic Consultant"
    assert len(updated["areas_of_expertise"]) == 4
    assert updated["gender"] == "Male"
    assert updated["profile_completion_percentage"] >= 80

    # 3. Public Doctor Profile View
    pub_res = client.get(f"/api/v1/doctors/{updated['id']}")
    assert pub_res.status_code == 200
    assert pub_res.json()["full_name"] == updated["full_name"]


def test_doctor_verification_workflow_and_documents():
    doc_email = f"dr_verif_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    admin_email = f"admin_doc_{uuid.uuid4().hex[:6]}@ayursetu.org"
    admin_token = get_token_for_user(admin_email, role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Check initial verification status
    status_res = client.get("/api/v1/doctors/verification/me", headers=doc_headers)
    assert status_res.status_code == 200
    verif_data = status_res.json()
    assert verif_data["verification_status"] in ["PENDING", "UNVERIFIED"]

    # 2. Upload verification document
    doc_payload = {
        "document_type": "MEDICAL_REGISTRATION_CERTIFICATE",
        "document_name": "State Medical Council Registration Certificate 2026",
        "file_url": "https://ayursetu.in/storage/certificates/reg_cert.pdf",
        "file_name": "reg_cert.pdf",
        "file_size_bytes": 1048576,
        "mime_type": "application/pdf"
    }
    upload_res = client.post("/api/v1/doctors/documents", json=doc_payload, headers=doc_headers)
    assert upload_res.status_code == 200
    uploaded_doc = upload_res.json()
    assert uploaded_doc["verification_status"] == "PENDING"
    assert uploaded_doc["document_type"] == "MEDICAL_REGISTRATION_CERTIFICATE"

    # 3. Submit verification
    submit_res = client.post("/api/v1/doctors/verification/submit", json={"notes": "Please verify my NCISM credentials."}, headers=doc_headers)
    assert submit_res.status_code == 200
    assert len(submit_res.json()["documents"]) >= 1

    # 4. Admin verifies doctor
    doc_profile = client.get("/api/v1/doctors/profile/me", headers=doc_headers).json()
    admin_verify_res = client.post(
        f"/api/v1/doctors/{doc_profile['id']}/verify?approve=true&remarks=Verified+against+NCISM+Registry",
        headers=admin_headers
    )
    assert admin_verify_res.status_code == 200
    assert admin_verify_res.json()["verification_status"] == "VERIFIED"

    # 5. Delete document
    del_res = client.delete(f"/api/v1/doctors/documents/{uploaded_doc['id']}", headers=doc_headers)
    assert del_res.status_code == 204


def test_doctor_clinic_management():
    doc_email = f"dr_clinic_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    headers = {"Authorization": f"Bearer {doc_token}"}

    # 1. Create Clinic
    clinic_payload = {
        "name": "AyurSanjeevani Panchakarma Hospital",
        "organization_type": "AYURVEDIC_PANCHAKARMA_CENTRE",
        "description": "Comprehensive 10-bed Ayurvedic hospital offering classical Shodhana and Rasayana therapies.",
        "address": "45/A Shivaji Nagar",
        "city": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "pincode": "411005",
        "phone": "+919876543210",
        "email": "contact@ayursanjeevani.com",
        "website_url": "https://ayursanjeevani.com",
        "services_offered": ["Vamana", "Virechana", "Shirodhara", "Kati Basti", "Janu Basti"],
        "facilities": ["Panchakarma Theater", "In-house Ayurvedic Pharmacy", "IPD Ward", "Herbal Garden"],
        "working_hours": "Mon-Sat: 08:30 AM - 08:00 PM",
        "bed_capacity": 10
    }
    create_res = client.post("/api/v1/doctors/clinics", json=clinic_payload, headers=headers)
    assert create_res.status_code == 200
    clinic = create_res.json()
    assert clinic["name"] == "AyurSanjeevani Panchakarma Hospital"
    assert len(clinic["services_offered"]) == 5
    assert clinic["bed_capacity"] == 10

    # 2. List Clinics
    list_res = client.get("/api/v1/doctors/clinics/me", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Update Clinic
    update_res = client.put(
        f"/api/v1/doctors/clinics/{clinic['id']}",
        json={"bed_capacity": 15, "working_hours": "Mon-Sun: 08:00 AM - 09:00 PM"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["bed_capacity"] == 15

    # 4. Delete Clinic
    del_res = client.delete(f"/api/v1/doctors/clinics/{clinic['id']}", headers=headers)
    assert del_res.status_code == 204


def test_doctor_dashboard_summary():
    doc_email = f"dr_dash_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    headers = {"Authorization": f"Bearer {doc_token}"}

    res = client.get("/api/v1/doctors/dashboard/summary", headers=headers)
    assert res.status_code == 200
    dash = res.json()
    assert "doctor_name" in dash
    assert "profile_completion_percentage" in dash
    assert "active_internships_count" in dash
    assert "upcoming_sessions_count" in dash
    assert isinstance(dash["recent_applications"], list)
    assert isinstance(dash["upcoming_sessions"], list)
    assert isinstance(dash["recent_messages"], list)


def test_doctor_student_sessions_full_lifecycle():
    doc_email = f"dr_sess_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    doc_me = client.get("/api/v1/auth/me", headers=doc_headers).json()
    doc_user_id = doc_me["id"]

    student_email = f"st_sess_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    student_me = client.get("/api/v1/auth/me", headers=student_headers).json()
    student_user_id = student_me["id"]

    # 1. Doctor creates session for student
    sess_payload = {
        "student_user_id": student_user_id,
        "title": "Ayurvedic Clinical Case Analysis & Mentorship",
        "purpose": "Mentorship",
        "session_type": "Clinical Guidance",
        "meeting_mode": "Online",
        "meeting_link": "https://meet.google.com/ayu-setu-demo",
        "scheduled_date": "2026-11-10",
        "start_time": "10:00 AM",
        "end_time": "10:45 AM",
        "duration_minutes": 45,
        "notes": "Please review the Charaka Samhita Chikitsa Sthana Chapter 3 prior to our discussion."
    }
    create_res = client.post("/api/v1/doctors/sessions", json=sess_payload, headers=doc_headers)
    assert create_res.status_code == 200
    session = create_res.json()
    assert session["status"] == "SCHEDULED"
    assert session["duration_minutes"] == 45

    # 2. Student lists sessions
    st_list_res = client.get("/api/v1/doctors/sessions?status=ALL", headers=student_headers)
    assert st_list_res.status_code == 200
    assert len(st_list_res.json()) >= 1

    # 3. Student confirms session
    confirm_res = client.put(
        f"/api/v1/doctors/sessions/{session['id']}/status",
        json={"status": "CONFIRMED"},
        headers=student_headers
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "CONFIRMED"

    # 4. Doctor completes session
    complete_res = client.put(
        f"/api/v1/doctors/sessions/{session['id']}/status",
        json={"status": "COMPLETED"},
        headers=doc_headers
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "COMPLETED"


def test_doctor_conversations_and_messaging():
    doc_email = f"dr_msg_{uuid.uuid4().hex[:6]}@ayursetu.org"
    doc_token = get_token_for_user(doc_email, role="DOCTOR")
    doc_headers = {"Authorization": f"Bearer {doc_token}"}
    doc_me = client.get("/api/v1/auth/me", headers=doc_headers).json()

    student_email = f"st_msg_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    student_token = get_token_for_user(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    student_me = client.get("/api/v1/auth/me", headers=student_headers).json()

    # 1. Student sends message to Doctor
    msg_res1 = client.post("/api/v1/doctors/messages", json={
        "recipient_id": doc_me["id"],
        "content": "Namaste Doctor, I am interested in your Panchakarma internship posting."
    }, headers=student_headers)
    assert msg_res1.status_code == 200
    assert msg_res1.json()["is_read"] is False

    # 2. Doctor checks conversation list
    convs_res = client.get("/api/v1/doctors/messages/conversations", headers=doc_headers)
    assert convs_res.status_code == 200
    convs = convs_res.json()
    assert len(convs) >= 1
    found = next((c for c in convs if c["other_user_id"] == student_me["id"]), None)
    assert found is not None
    assert found["unread_count"] >= 1

    # 3. Doctor opens conversation and reads message
    read_res = client.get(f"/api/v1/doctors/messages/conversation/{student_me['id']}", headers=doc_headers)
    assert read_res.status_code == 200
    msgs = read_res.json()
    assert len(msgs) >= 1
    assert msgs[-1]["is_read"] is True

    # 4. Doctor replies
    msg_res2 = client.post("/api/v1/doctors/messages", json={
        "recipient_id": student_me["id"],
        "content": "Namaste! We are reviewing BAMS final year applications. Please ensure your skill portfolio is verified."
    }, headers=doc_headers)
    assert msg_res2.status_code == 200
