import pytest
import uuid
from datetime import date, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.domain import StudentProfile
from app.models.doctor_ngo import DoctorProfile, VerificationStatus
from app.models.internships import InternshipPosting, InternshipApplication, InternshipOfferLetter
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.mark.asyncio
async def test_internship_phase5_offers_attendance_and_progress():
    async with AsyncSessionLocal() as db:
        unique_suffix = uuid.uuid4().hex[:6]
        
        # 1. Doctor setup
        doc_email = f"doctor_p5_{unique_suffix}@ayursetu.in"
        doc_user = User(
            email=doc_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.DOCTOR,
            is_active=True
        )
        db.add(doc_user)
        await db.flush()

        doc_profile = DoctorProfile(
            user_id=doc_user.id,
            full_name="Vaidya Phase5 Mentor",
            registration_number=f"AY-P5-{unique_suffix}",
            state_medical_council="Maharashtra Council of Indian Medicine",
            qualification="BAMS, MD Panchakarma",
            specialization="Panchakarma",
            years_of_experience=12,
            city="Pune",
            state="Maharashtra",
            verification_status=VerificationStatus.VERIFIED
        )
        db.add(doc_profile)
        await db.flush()

        # 2. Student setup
        st_email = f"student_p5_{unique_suffix}@ayursetu.in"
        st_user = User(
            email=st_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(st_user)
        await db.flush()

        st_profile = StudentProfile(
            user_id=st_user.id,
            full_name="Pooja Kulkarni",
            city="Pune",
            state="Maharashtra",
            course="BAMS",
            degree_program="BAMS Final Year",
            college_name="Tilak Ayurveda Mahavidyalaya",
            current_year=4
        )
        db.add(st_profile)
        await db.flush()

        # 3. Internship Posting
        posting = InternshipPosting(
            employer_user_id=doc_user.id,
            doctor_id=doc_profile.id,
            organization_name="AyurSetu Clinical Academy",
            title="Clinical Panchakarma Residency Cohort",
            description="Intensive practical Panchakarma clinical training.",
            specialization="Panchakarma",
            internship_type="Clinical Internship",
            duration_months=6,
            mode="ON_SITE",
            location_city="Pune",
            location_state="Maharashtra",
            stipend_inr_month=15000.0,
            number_of_seats=4,
            deadline=date.today() + timedelta(days=30),
            requirements="Basic knowledge of Ayurvedic physiology and pulse diagnosis.",
            status="PUBLISHED"
        )
        db.add(posting)
        await db.flush()

        # 4. Student Application
        application = InternshipApplication(
            internship_id=posting.id,
            student_id=st_profile.id,
            cover_note="Dedicated to clinical excellence in Panchakarma.",
            cover_letter="I am eager to train under Dr. Mentor.",
            status="SHORTLISTED",
            match_score=92.0
        )
        db.add(application)
        await db.commit()
        await db.refresh(posting)
        await db.refresh(application)

        doc_token = create_access_token(str(doc_user.id), role="DOCTOR")
        st_token = create_access_token(str(st_user.id), role="STUDENT")

    doc_headers = {"Authorization": f"Bearer {doc_token}"}
    st_headers = {"Authorization": f"Bearer {st_token}"}

    # ============================================================
    # 1. DOCTOR CREATES & ISSUES OFFER LETTER
    # ============================================================
    offer_payload = {
        "role_title": "Senior Clinical Panchakarma Resident Intern",
        "start_date": str(date.today() + timedelta(days=7)),
        "end_date": str(date.today() + timedelta(days=187)),
        "working_hours": "09:00 AM - 05:00 PM (Mon-Sat)",
        "stipend_amount": 15000.0,
        "terms_text": "Intern agrees to abide by clinical ethics, patient confidentiality, and hospital SOPs."
    }

    resp_offer = client.post(
        f"/api/v1/internships/applications/{application.id}/offer",
        json=offer_payload,
        headers=doc_headers
    )
    assert resp_offer.status_code == 200, resp_offer.text
    offer_data = resp_offer.json()
    assert offer_data["status"] == "ISSUED"
    assert offer_data["student_name"] == "Pooja Kulkarni"
    assert offer_data["stipend_amount"] == 15000.0
    offer_id = offer_data["id"]

    # Doctor verifies in list
    resp_doc_offers = client.get("/api/v1/doctor/offers", headers=doc_headers)
    assert resp_doc_offers.status_code == 200
    assert any(o["id"] == offer_id for o in resp_doc_offers.json())

    # ============================================================
    # 2. STUDENT VIEWS & ACCEPTS OFFER LETTER
    # ============================================================
    resp_st_offers = client.get("/api/v1/student/offers", headers=st_headers)
    assert resp_st_offers.status_code == 200
    assert any(o["id"] == offer_id for o in resp_st_offers.json())

    # Student accepts offer
    resp_accept = client.post(f"/api/v1/offers/{offer_id}/accept", headers=st_headers)
    assert resp_accept.status_code == 200
    assert resp_accept.json()["status"] == "ACCEPTED"

    # Verify application status also updated to ACCEPTED
    resp_app = client.get(f"/api/v1/applications/{application.id}", headers=doc_headers)
    assert resp_app.status_code == 200
    assert resp_app.json()["status"] == "ACCEPTED"

    # ============================================================
    # 3. DOCTOR RECORDS ATTENDANCE & VERIFIES CALCULATIONS
    # ============================================================
    # Day 1: Present (8 hrs)
    client.post(
        f"/api/v1/internships/applications/{application.id}/attendance",
        json={"date": str(date.today() - timedelta(days=2)), "status": "PRESENT", "hours_worked": 8.0, "remarks": "OPD Consultation & Nadi Pariksha"},
        headers=doc_headers
    )
    # Day 2: Half Day (4 hrs)
    client.post(
        f"/api/v1/internships/applications/{application.id}/attendance",
        json={"date": str(date.today() - timedelta(days=1)), "status": "HALF_DAY", "hours_worked": 4.0, "remarks": "Morning Abhyanga session"},
        headers=doc_headers
    )
    # Day 3: Present (8 hrs)
    client.post(
        f"/api/v1/internships/applications/{application.id}/attendance",
        json={"date": str(date.today()), "status": "PRESENT", "hours_worked": 8.0, "remarks": "Shirodhara & Basti karma"},
        headers=doc_headers
    )

    # Fetch attendance summary
    resp_att = client.get(f"/api/v1/internships/applications/{application.id}/attendance", headers=doc_headers)
    assert resp_att.status_code == 200
    att_summary = resp_att.json()
    assert att_summary["total_days"] == 3
    assert att_summary["present_days"] == 2
    assert att_summary["half_days"] == 1
    # Effective present = 2 + 0.5 = 2.5 / 3 = 83.3%
    assert 80.0 <= att_summary["attendance_percentage"] <= 85.0
    assert att_summary["total_hours_worked"] == 20.0

    # Student also sees same attendance
    resp_st_att = client.get(f"/api/v1/internships/applications/{application.id}/attendance", headers=st_headers)
    assert resp_st_att.status_code == 200
    assert resp_st_att.json()["total_days"] == 3

    # ============================================================
    # 4. MILESTONES & TASKS TRACKING
    # ============================================================
    # Doctor creates Milestone 1: Panchakarma Fundamentals
    m1_payload = {
        "milestone_title": "Milestone 1: Panchakarma Purvakarma & Snehana",
        "description": "Mastering preparatory oil therapies and patient assessment.",
        "category": "CLINICAL",
        "status": "IN_PROGRESS",
        "due_date": str(date.today() + timedelta(days=30)),
        "tasks": [
            {"title": "Perform 10 Abhyanga procedures", "task_type": "CLINICAL_ACTIVITY", "status": "COMPLETED", "doctor_remarks": "Excellent technique"},
            {"title": "Prepare Kwatha formulation", "task_type": "LEARNING_OBJECTIVE", "status": "IN_PROGRESS"}
        ]
    }
    resp_m1 = client.post(
        f"/api/v1/internships/applications/{application.id}/milestones",
        json=m1_payload,
        headers=doc_headers
    )
    assert resp_m1.status_code == 200, resp_m1.text
    m1_data = resp_m1.json()
    m1_id = m1_data["id"]
    assert len(m1_data["tasks"]) == 2

    # Doctor adds Task 3 to Milestone 1
    resp_task3 = client.post(
        f"/api/v1/milestones/{m1_id}/tasks",
        json={"title": "Document 5 Case Studies on Vamana Therapy", "task_type": "RESEARCH_ACTIVITY", "status": "NOT_STARTED"},
        headers=doc_headers
    )
    assert resp_task3.status_code == 200
    task3_id = resp_task3.json()["id"]

    # Doctor updates Task 3 to COMPLETED
    resp_up_t3 = client.put(
        f"/api/v1/tasks/{task3_id}",
        json={"status": "COMPLETED", "doctor_remarks": "Detailed analysis of Dosha stages."},
        headers=doc_headers
    )
    assert resp_up_t3.status_code == 200
    assert resp_up_t3.json()["status"] == "COMPLETED"

    # Doctor updates Milestone 1 status to 80% completion with review
    resp_up_m1 = client.put(
        f"/api/v1/milestones/{m1_id}",
        json={"completion_percentage": 80, "supervisor_review": "Demonstrating high diligence in clinical rounds."},
        headers=doc_headers
    )
    assert resp_up_m1.status_code == 200
    assert resp_up_m1.json()["completion_percentage"] == 80

    # ============================================================
    # 5. FULL PROGRESS DASHBOARD
    # ============================================================
    resp_prog = client.get(f"/api/v1/internships/applications/{application.id}/progress", headers=st_headers)
    assert resp_prog.status_code == 200, resp_prog.text
    prog_data = resp_prog.json()
    assert prog_data["overall_progress_percentage"] == 80.0
    assert prog_data["total_milestones"] == 1
    assert prog_data["total_tasks"] == 3
    assert prog_data["completed_tasks"] == 2
    assert prog_data["attendance_percentage"] >= 80.0
    assert "diligence" in prog_data["recent_remarks"]
