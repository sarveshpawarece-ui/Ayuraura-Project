import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(email: str, role: str = "INSTITUTION", password: str = "Aayuraura@2026") -> str:
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if login_res.status_code == 200:
        return login_res.json()["access_token"]

    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": role,
            "full_name": f"Test {role.title()} User",
            "organization_or_institution": f"Test {role.title()} Organization",
            "code_or_reg_number": f"REG-{uuid.uuid4().hex[:6].upper()}"
        }
    )
    assert reg_res.status_code in [200, 201]

    login_res2 = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_res2.status_code == 200
    return login_res2.json()["access_token"]


def test_phase1_institution_onboarding_and_verification_workflow():
    """Phase 1: Institutional onboarding, profile management, and non-automatic verification workflow."""
    inst_email = f"college_admin_{uuid.uuid4().hex[:6]}@nia.edu.in"
    token = get_auth_token(inst_email, role="INSTITUTION")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Inspect initial profile - starts in PENDING status
    prof_res = client.get("/api/v1/institution/profile", headers=headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["verification_status"] == "PENDING"
    assert "aishe_code" in prof

    # 2. Check initial verification status
    status_res = client.get("/api/v1/institution/verification-status", headers=headers)
    assert status_res.status_code == 200
    v_status = status_res.json()
    assert v_status["verification_status"] == "PENDING"

    # 3. Submit verification dossier
    submit_payload = {
        "ncism_approval_number": "NCISM/AYUR/AFF/2026-TEST",
        "university_affiliation": "Rajasthan Ayurved University",
        "contact_person_name": "Dr. Principal Vaidya",
        "contact_email": "principal@nia.edu.in",
        "contact_phone": "+91 141 263155",
        "remarks": "Official NCISM approval gazette dossier attached.",
        "documents": [
          {
            "document_type": "NCISM_APPROVAL_LETTER",
            "document_name": "NCISM 2026 Affiliation Order",
            "file_url": "https://storage.ayuraura.com/ncism_approval.pdf"
          }
        ]
    }
    submit_res = client.post("/api/v1/institution/verification-submit", json=submit_payload, headers=headers)
    assert submit_res.status_code == 200
    data = submit_res.json()
    assert data["ncism_approval_number"] == "NCISM/AYUR/AFF/2026-TEST"
    assert data["university_affiliation"] == "Rajasthan Ayurved University"
    # CRITICAL: Verification MUST NOT be automatically marked VERIFIED
    assert data["verification_status"] == "PENDING"
    assert len(data["verification_documents"]) == 1


def test_phase5_institutional_invitations_and_role_lock():
    """Phase 5: Secure tokenized invitations, verification, and privilege escalation prevention."""
    inst_email = f"dean_{uuid.uuid4().hex[:6]}@ayurcollege.org"
    inst_token = get_auth_token(inst_email, role="INSTITUTION")
    headers = {"Authorization": f"Bearer {inst_token}"}

    invited_fac_email = f"prof_{uuid.uuid4().hex[:6]}@ayurcollege.org"

    # 1. Create a Faculty Invitation
    invite_payload = {
        "email": invited_fac_email,
        "role": "FACULTY",
        "invited_name": "Prof. Ramchandra Shastri",
        "designation": "Associate Professor",
        "assigned_subjects": [
            {"id": "rachana_sharir", "name": "Rachana Sharir"}
        ]
    }
    inv_res = client.post("/api/v1/institution/invitations", json=invite_payload, headers=headers)
    assert inv_res.status_code == 201
    inv_data = inv_res.json()
    assert inv_data["email"] == invited_fac_email.lower()
    assert inv_data["role"] == "FACULTY"
    assert inv_data["status"] == "PENDING"
    token = inv_data["invitation_token"]
    assert token.startswith("inv_")

    # 2. Public / Guest token inspection endpoint
    check_res = client.get(f"/api/v1/auth/invitation/{token}")
    assert check_res.status_code == 200
    details = check_res.json()
    assert details["valid"] is True
    assert details["email"] == invited_fac_email.lower()
    assert details["role"] == "FACULTY"

    # 3. Accept invitation and create account
    accept_res = client.post(
        "/api/v1/auth/accept-invitation",
        json={
            "invitation_token": token,
            "password": "FacultySecurePassword@2026",
            "full_name": "Prof. Ramchandra Shastri",
            "name_prefix": "Prof.",
            "phone": "+91 98765 43210",
            "qualifications": "MD (Ayurveda), BAMS",
            "specialization": "Rachana Sharir Anatomy"
        }
    )
    assert accept_res.status_code == 200
    auth_data = accept_res.json()
    assert auth_data["role"] == "FACULTY"
    assert "access_token" in auth_data
    fac_token = auth_data["access_token"]

    # 4. Token cannot be reused (invitation status is now ACCEPTED)
    reaccept_res = client.post(
        "/api/v1/auth/accept-invitation",
        json={
            "invitation_token": token,
            "password": "AnotherPassword@2026",
            "full_name": "Malicious Attacker"
        }
    )
    assert reaccept_res.status_code == 400


def test_phase2_faculty_dashboard_and_profile():
    """Phase 2: Faculty profile, dashboard overview, assigned subjects, and teaching tools."""
    fac_email = f"faculty_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_auth_token(fac_email, role="FACULTY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch dashboard
    dash_res = client.get("/api/v1/faculty/dashboard", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "faculty_profile" in data
    assert "metrics" in data
    assert "assigned_subjects" in data
    assert "upcoming_lectures" in data
    assert "recent_resources" in data

    # 2. Update faculty profile
    patch_res = client.patch(
        "/api/v1/faculty/profile",
        json={
            "designation": "Professor & Head of Department",
            "specialization": "Brihat-trayi & Panchakarma Therapeutics",
            "bio": "Senior academic clinician with 15 years teaching BAMS undergraduates."
        },
        headers=headers
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["designation"] == "Professor & Head of Department"
    assert updated["specialization"] == "Brihat-trayi & Panchakarma Therapeutics"


def test_phase3_educational_material_sharing():
    """Phase 3: Faculty shares notes, documents, questions, and recordings with students."""
    fac_email = f"faculty_educator_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_auth_token(fac_email, role="FACULTY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Publish educational material
    create_payload = {
        "title": "Comprehensive Marma Points & Clinical Anatomy Compendium",
        "description": "Exhaustive breakdown of 107 Marma locations according to Sushruta Samhita.",
        "resource_type": "NOTES",
        "academic_year": "1st Year",
        "subject_id": "rachana_sharir",
        "subject_name": "Rachana Sharir (Anatomy)",
        "unit_number": 3,
        "unit_name": "Marma Sharir",
        "topic_name": "Trimarma & Sadhyo Pranahara",
        "class_or_batch": "Batch A",
        "file_url": "https://storage.ayuraura.com/marma_compendium.pdf",
        "content_text": "# Marma Sharir\nSushruta Samhita Sharira Sthana Chapter 6",
        "is_published": True,
        "is_ai_generated": True,
        "ai_disclaimer": "AI-Assisted Educational Synthesis, Faculty Verified"
    }
    create_res = client.post("/api/v1/faculty/resources", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    res_data = create_res.json()
    assert res_data["title"] == create_payload["title"]
    assert res_data["resource_type"] == "NOTES"
    resource_id = res_data["id"]

    # 2. List resources with filters
    list_res = client.get("/api/v1/faculty/resources?academic_year=1st%20Year&subject_id=rachana_sharir", headers=headers)
    assert list_res.status_code == 200
    resources = list_res.json()
    assert len(resources) >= 1
    assert any(r["id"] == resource_id for r in resources)

    # 3. Update resource
    put_res = client.put(
        f"/api/v1/faculty/resources/{resource_id}",
        json={"title": "Updated Marma Points Compendium v2"},
        headers=headers
    )
    assert put_res.status_code == 200

    # 4. Student can query institutional resources
    stu_email = f"student_scholar_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    stu_token = get_auth_token(stu_email, role="STUDENT")
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    stu_res = client.get("/api/v1/faculty/student-resources", headers=stu_headers)
    assert stu_res.status_code == 200
    assert isinstance(stu_res.json(), list)

    # 5. Clean up resource
    del_res = client.delete(f"/api/v1/faculty/resources/{resource_id}", headers=headers)
    assert del_res.status_code == 200


def test_phase4_lecture_and_session_management():
    """Phase 4: Scheduling lectures, clinical postings, announcements, and recordings."""
    fac_email = f"faculty_lecturer_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_auth_token(fac_email, role="FACULTY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Schedule lecture session
    lecture_payload = {
        "title": "Sharira Pramana & Clinical Surface Anatomy",
        "subject_id": "rachana_sharir",
        "subject_name": "Rachana Sharir (Anatomy)",
        "academic_year": "1st Year",
        "topic": "Sushruta Samhita Sharira Sthana Ch. 6",
        "session_type": "LECTURE",
        "scheduled_date": "2026-11-05",
        "start_time": "10:00 AM",
        "end_time": "11:30 AM",
        "venue_or_link": "Ayurveda Hall 3B",
        "session_link": "https://meet.google.com/ayur-test-lecture",
        "announcement": "Bring Sanskrit handbook for recitation."
    }
    lec_res = client.post("/api/v1/faculty/lectures", json=lecture_payload, headers=headers)
    assert lec_res.status_code == 201
    lec_data = lec_res.json()
    assert lec_data["title"] == lecture_payload["title"]
    assert lec_data["status"] == "SCHEDULED"
    lecture_id = lec_data["id"]

    # 2. Get lectures
    get_res = client.get("/api/v1/faculty/lectures", headers=headers)
    assert get_res.status_code == 200
    lectures = get_res.json()
    assert any(l["id"] == lecture_id for l in lectures)

    # 3. Update with recording url upon completion
    update_res = client.put(
        f"/api/v1/faculty/lectures/{lecture_id}",
        json={
            "status": "COMPLETED",
            "recording_url": "https://video.ayuraura.com/lectures/marma-recording.mp4"
        },
        headers=headers
    )
    assert update_res.status_code == 200

    # 4. Delete lecture
    del_res = client.delete(f"/api/v1/faculty/lectures/{lecture_id}", headers=headers)
    assert del_res.status_code == 200


def test_phase6_faculty_ai_tools_all_pedagogy_modes():
    """Phase 6: AI Faculty tools with all pedagogical modes and clear AI indicators."""
    fac_email = f"faculty_ai_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    token = get_auth_token(fac_email, role="FACULTY")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Practice questions / Exam paper
    res_exam = client.post(
        "/api/v1/ai-ecosystem/faculty-tool",
        json={
            "tool_type": "PRACTICE_QUESTIONS",
            "subject": "Rachana Sharir",
            "curriculum_level": "BAMS 1st Year",
            "topic": "Srotas Sharir & Marmas",
            "target_duration_minutes": 45
        },
        headers=headers
    )
    assert res_exam.status_code == 200
    data_exam = res_exam.json()
    assert "SECTION A" in data_exam["formatted_markdown"]
    assert "AI Advisory" in data_exam["formatted_markdown"]

    # 2. Lesson outline
    res_outline = client.post(
        "/api/v1/ai-ecosystem/faculty-tool",
        json={
            "tool_type": "LESSON_OUTLINE",
            "subject": "Kriya Sharir",
            "curriculum_level": "BAMS 1st Year",
            "topic": "Dosha Vijnana & Kriya Kala",
            "target_duration_minutes": 45
        },
        headers=headers
    )
    assert res_outline.status_code == 200
    assert "Pedagogical Timeline" in res_outline.json()["formatted_markdown"]

    # 3. Competency Learning Objectives
    res_obj = client.post(
        "/api/v1/ai-ecosystem/faculty-tool",
        json={
            "tool_type": "LEARNING_OBJECTIVES",
            "subject": "Dravyaguna Vijnana",
            "curriculum_level": "BAMS 2nd Year",
            "topic": "Haritaki Rasa Panchaka",
            "target_duration_minutes": 45
        },
        headers=headers
    )
    assert res_obj.status_code == 200
    assert "NCISM Competency-Based" in res_obj.json()["formatted_markdown"]

    # 4. Clinical Case Scenario
    res_case = client.post(
        "/api/v1/ai-ecosystem/faculty-tool",
        json={
            "tool_type": "CASE_SCENARIO",
            "subject": "Kayachikitsa",
            "curriculum_level": "BAMS 3rd Year",
            "topic": "Amavata Clinical Protocol",
            "target_duration_minutes": 45
        },
        headers=headers
    )
    assert res_case.status_code == 200
    assert "Clinical Problem-Based Learning" in str(res_case.json()["content"])


def test_phase7_permissions_and_student_privacy():
    """Phase 7: Backend RBAC, tenant isolation, and strict student privacy protection."""
    # 1. Unauthenticated or student users cannot create faculty resources
    stu_email = f"student_priv_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    stu_token = get_auth_token(stu_email, role="STUDENT")
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    forbidden_res = client.post(
        "/api/v1/faculty/resources",
        json={
            "title": "Hacked Resource",
            "subject_id": "test",
            "subject_name": "Test",
            "academic_year": "1st Year"
        },
        headers=stu_headers
    )
    assert forbidden_res.status_code == 403

    # 2. Students cannot schedule lectures
    forbidden_lec = client.post(
        "/api/v1/faculty/lectures",
        json={
            "title": "Unauthorized Lecture",
            "subject_id": "test",
            "subject_name": "Test",
            "academic_year": "1st Year",
            "scheduled_date": "2026-11-01",
            "start_time": "10:00 AM",
            "end_time": "11:00 AM"
        },
        headers=stu_headers
    )
    assert forbidden_lec.status_code == 403

    # 3. Faculty class roster MUST NOT expose student personal notes or chat histories
    fac_email = f"faculty_priv_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    fac_token = get_auth_token(fac_email, role="FACULTY")
    fac_headers = {"Authorization": f"Bearer {fac_token}"}

    roster_res = client.get("/api/v1/faculty/students", headers=fac_headers)
    assert roster_res.status_code == 200
    roster = roster_res.json()
    for student_entry in roster:
        assert "private_notes" not in student_entry
        assert "chat_history" not in student_entry
        assert "notes" not in student_entry


def test_phase8_educational_resource_workflow_lifecycle():
    """Phase 8: Educational resource publishing workflow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PUBLISHED."""
    fac_email = f"faculty_wf_{uuid.uuid4().hex[:6]}@ayursetu.edu"
    fac_token = get_auth_token(fac_email, role="FACULTY")
    fac_headers = {"Authorization": f"Bearer {fac_token}"}

    # 1. Upload resource (defaults to DRAFT)
    res_upload = client.post(
        "/api/v1/faculty/resources",
        json={
            "title": "Comprehensive Charaka Samhita Sutrasthana Commentary",
            "description": "Peer-reviewed lecture notes on Tridosha Siddhanta",
            "resource_type": "NOTES",
            "subject_id": "charaka_samhita",
            "subject_name": "Charaka Samhita",
            "academic_year": "1st Year",
            "workflow_status": "DRAFT",
            "is_published": False
        },
        headers=fac_headers
    )
    assert res_upload.status_code == 201
    resource = res_upload.json()
    resource_id = resource["id"]
    assert resource["workflow_status"] == "DRAFT"

    # 2. Advance to SUBMITTED
    res_submit = client.patch(
        f"/api/v1/faculty/resources/{resource_id}/workflow",
        json={"workflow_status": "SUBMITTED", "reviewer_notes": "Submitted for faculty board peer-review."},
        headers=fac_headers
    )
    assert res_submit.status_code == 200
    assert res_submit.json()["workflow_status"] == "SUBMITTED"

    # 3. Advance to UNDER_REVIEW
    res_review = client.patch(
        f"/api/v1/faculty/resources/{resource_id}/workflow",
        json={"workflow_status": "UNDER_REVIEW", "reviewer_notes": "Head of Department assigned as reviewer."},
        headers=fac_headers
    )
    assert res_review.status_code == 200
    assert res_review.json()["workflow_status"] == "UNDER_REVIEW"

    # 4. Advance to APPROVED
    res_approve = client.patch(
        f"/api/v1/faculty/resources/{resource_id}/workflow",
        json={"workflow_status": "APPROVED", "reviewer_notes": "Verified authentic BAMS syllabus references."},
        headers=fac_headers
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["workflow_status"] == "APPROVED"

    # 5. Advance to PUBLISHED (available to students)
    res_pub = client.patch(
        f"/api/v1/faculty/resources/{resource_id}/workflow",
        json={"workflow_status": "PUBLISHED", "reviewer_notes": "Published to 1st Year cohort repository."},
        headers=fac_headers
    )
    assert res_pub.status_code == 200
    assert res_pub.json()["workflow_status"] == "PUBLISHED"

    # 6. Verify rejection on invalid transition
    res_bad = client.patch(
        f"/api/v1/faculty/resources/{resource_id}/workflow",
        json={"workflow_status": "INVALID_STATE"},
        headers=fac_headers
    )
    assert res_bad.status_code == 400

