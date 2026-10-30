import pytest
import uuid
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.future import select

from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.domain import StudentProfile, Portfolio, PortfolioExperience, PortfolioCertification
from app.models.doctor_ngo import DoctorProfile, VerificationStatus
from app.models.internships import (
    InternshipPosting,
    InternshipApplication,
    InternshipOfferLetter,
    InternshipAttendanceLog,
    InternshipCompletionCertificate,
    InternshipSupervisorFeedback,
    InternshipStudentFeedback
)
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)


@pytest.mark.asyncio
async def test_internship_phase6_completion_certificate_feedback_and_portfolio():
    async with AsyncSessionLocal() as db:
        unique_suffix = uuid.uuid4().hex[:6]

        # 1. Doctor setup
        doc_email = f"doctor_p6_{unique_suffix}@ayursetu.in"
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
            full_name="Aarav Deshmukh",
            registration_number=f"AY-P6-{unique_suffix}",
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
        st_email = f"student_p6_{unique_suffix}@ayursetu.in"
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
            full_name="Rutuja Shinde",
            city="Pune",
            state="Maharashtra",
            course="BAMS",
            degree_program="BAMS Final Year",
            college_name="Tilak Ayurveda Mahavidyalaya",
            current_year=4
        )
        db.add(st_profile)
        await db.flush()

        # 3. Create Posting directly
        today = date.today()
        start_date = today + timedelta(days=5)
        end_date = start_date + timedelta(days=90)
        deadline = today + timedelta(days=3)

        posting = InternshipPosting(
            employer_user_id=doc_user.id,
            doctor_id=doc_profile.id,
            organization_name="AyurSetu Clinical Academy",
            title="Hospital Panchakarma Clinical Rotation",
            description="Comprehensive clinical internship in OPD diagnosis and classical Panchakarma therapies.",
            specialization="Panchakarma",
            internship_type="Clinical Internship",
            location_city="Pune",
            location_state="Maharashtra",
            mode="ON_SITE",
            duration_months=3,
            duration_text="3 Months",
            stipend_inr_month=18000,
            number_of_seats=2,
            capacity=2,
            start_date=start_date,
            end_date=end_date,
            deadline=deadline,
            eligible_courses=["BAMS"],
            eligible_years=["Final Year", "Intern"],
            skills_required=["Nadi Pariksha", "Snehan", "Swedan"],
            benefits=["Certificate", "Stipend"],
            requirements="Full time clinical attendance",
            status="PUBLISHED"
        )
        db.add(posting)
        await db.flush()

        # 4. Create Application directly
        app_rec = InternshipApplication(
            internship_id=posting.id,
            student_id=st_profile.id,
            status="ACCEPTED",
            cover_letter="Passionate about Panchakarma.",
            resume_url="https://ayursetu.in/resumes/rutuja.pdf"
        )
        db.add(app_rec)
        await db.flush()

        # 5. Log Attendance
        att_log = InternshipAttendanceLog(
            application_id=app_rec.id,
            internship_id=posting.id,
            student_id=st_profile.id,
            date=today,
            check_in="09:00",
            check_out="17:00",
            status="PRESENT",
            hours_worked=8.0,
            remarks="Full day clinical rotation observed."
        )
        db.add(att_log)
        await db.commit()

        doc_token = create_access_token(subject=str(doc_user.id), role="DOCTOR")
        doc_headers = {"Authorization": f"Bearer {doc_token}"}

        st_token = create_access_token(subject=str(st_user.id), role="STUDENT")
        st_headers = {"Authorization": f"Bearer {st_token}"}

        # 6. Doctor Completes Internship & Issues Certificate
        complete_res = client.post(
            f"/api/v1/internships/applications/{app_rec.id}/complete",
            headers=doc_headers,
            json={
                "completion_date": str(today),
                "generate_certificate": True,
                "add_to_student_portfolio": True,
                "doctor_feedback": {
                    "clinical_skills_rating": 5,
                    "communication_rating": 5,
                    "professionalism_rating": 5,
                    "punctuality_rating": 5,
                    "technical_knowledge_rating": 5,
                    "teamwork_rating": 5,
                    "learning_ability_rating": 5,
                    "overall_rating": 5,
                    "written_feedback": "Exceptional clinical dedication and precise pulse diagnosis.",
                    "strengths_notes": "Strong patient rapport and Shodhana procedure adherence.",
                    "areas_for_growth": "Continue advancing in specialized Rasashastra formulations.",
                    "recommendations": "Highly recommended for clinical PG residency in Panchakarma."
                }
            }
        )
        assert complete_res.status_code == 200
        cert_data = complete_res.json()
        assert cert_data["status"] == "VALID"
        assert cert_data["is_valid"] is True
        assert cert_data["certificate_token"].startswith("AYUR-CERT-")
        assert cert_data["total_hours_completed"] == 8.0
        certificate_token = cert_data["certificate_token"]

        # 7. Student/Doctor can fetch certificate
        cert_view_res = client.get(
            f"/api/v1/internships/applications/{app_rec.id}/certificate",
            headers=st_headers
        )
        assert cert_view_res.status_code == 200
        assert cert_view_res.json()["certificate_token"] == certificate_token

        # 8. Public Verification Endpoint (No auth needed)
        verify_res = client.get(f"/api/v1/internships/certificates/verify/{certificate_token}")
        assert verify_res.status_code == 200
        v_data = verify_res.json()
        assert v_data["certificate_token"] == certificate_token
        assert v_data["is_valid"] is True
        assert v_data["status"] == "VALID"
        assert "NCISM" in v_data["accreditation"]
        # Check that privacy masking is applied
        assert "*" in v_data["student_name_masked"]

        # 9. Student Submits Rotation Feedback
        st_fb_res = client.post(
            f"/api/v1/internships/applications/{app_rec.id}/feedback/student",
            headers=st_headers,
            json={
                "overall_rating": 5,
                "learning_experience_rating": 5,
                "doctor_mentorship_rating": 5,
                "clinical_exposure_rating": 5,
                "organization_rating": 5,
                "facilities_rating": 5,
                "overall_experience_comments": "Transformative clinical mentorship experience.",
                "review_comments": "Dr. Deshmukh provided deep practical insights into classical Charaka protocols.",
                "is_anonymous": False,
                "is_public": True
            }
        )
        assert st_fb_res.status_code == 200
        assert st_fb_res.json()["overall_rating"] == 5

        # 10. Doctor Internship Analytics
        analytics_res = client.get("/api/v1/internships/doctor/analytics", headers=doc_headers)
        assert analytics_res.status_code == 200
        analytics_data = analytics_res.json()
        assert analytics_data["total_internships"] >= 1
        assert analytics_data["completed_students_count"] >= 1
        assert analytics_data["average_attendance_percentage"] == 100.0
        assert analytics_data["average_student_rating"] == 5.0

        # 11. History endpoints
        doc_hist_res = client.get("/api/v1/internships/doctor/history", headers=doc_headers)
        assert doc_hist_res.status_code == 200
        assert len(doc_hist_res.json()) >= 1
        assert doc_hist_res.json()[0]["status"] == "COMPLETED"

        st_hist_res = client.get("/api/v1/internships/student/history", headers=st_headers)
        assert st_hist_res.status_code == 200
        assert len(st_hist_res.json()) >= 1
        assert st_hist_res.json()[0]["status"] == "COMPLETED"
