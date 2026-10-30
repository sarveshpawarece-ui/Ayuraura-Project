import uuid
import hashlib
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import (
    StudentProfile,
    StudentSkill,
    Skill,
    InstitutionProfile,
    Portfolio,
    PortfolioExperience,
    PortfolioCertification,
    PortfolioVisibility,
    ExperienceType
)
from app.models.doctor_ngo import DoctorProfile, ClinicHospitalProfile
from app.models.camps import AppNotification
from app.models.internships import (
    InternshipPosting,
    InternshipApplication,
    InternshipOfferLetter,
    InternshipAttendanceLog,
    InternshipProgressMilestone,
    InternshipTask,
    InternshipCompletionCertificate,
    InternshipSupervisorFeedback,
    InternshipStudentFeedback
)
from app.schemas.internships import (
    InternshipPostingCreateIn,
    InternshipPostingUpdateIn,
    InternshipPostingOut,
    DoctorInternshipSummaryOut,
    InternshipApplyIn,
    InternshipApplicationOut,
    StudentPreviewOut,
    InternshipReviewIn,
    InternshipRejectIn,
    OfferLetterCreateIn,
    OfferLetterOut,
    OfferDeclineIn,
    LogAttendanceIn,
    AttendanceLogOut,
    AttendanceSummaryOut,
    ProgressMilestoneIn,
    ProgressMilestoneUpdateIn,
    ProgressMilestoneOut,
    InternshipTaskIn,
    InternshipTaskUpdateIn,
    InternshipTaskOut,
    InternshipFullProgressOut,
    InternshipCertificateOut,
    CertificatePublicVerifyOut,
    SupervisorFeedbackIn,
    SupervisorFeedbackOut,
    StudentFeedbackIn,
    StudentFeedbackOut,
    CompleteInternshipIn,
    DoctorInternshipAnalyticsOut,
    InternshipHistoryItemOut
)

class InternshipLifecycleService:

    @classmethod
    async def create_posting(cls, db: AsyncSession, user: User, data: InternshipPostingCreateIn) -> InternshipPostingOut:
        # Authorization check: DOCTOR, INDUSTRY, or ADMIN
        if user.role not in [UserRole.DOCTOR, UserRole.INDUSTRY, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Doctors, Healthcare Institutions, or Admins can create internships."
            )

        doctor_profile: Optional[DoctorProfile] = None
        clinic_profile: Optional[ClinicHospitalProfile] = None

        if user.role == UserRole.DOCTOR:
            doc_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
            doctor_profile = doc_res.scalar_one_or_none()
            if not doctor_profile:
                # auto-create baseline profile if needed
                doctor_profile = DoctorProfile(
                    user_id=user.id,
                    full_name=user.email.split("@")[0].title(),
                    registration_number=f"DOC-REG-{uuid.uuid4().hex[:6].upper()}",
                    state_medical_council="State Medical Council",
                    qualification="BAMS",
                    specialization=data.specialization or "General Ayurveda",
                    city=data.location_city,
                    state=data.location_state
                )
                db.add(doctor_profile)
                await db.flush()

        if data.clinic_id:
            clinic_res = await db.execute(select(ClinicHospitalProfile).where(ClinicHospitalProfile.id == data.clinic_id))
            clinic_profile = clinic_res.scalar_one_or_none()

        org_name = data.organization_name
        if not org_name:
            if clinic_profile:
                org_name = clinic_profile.name
            elif doctor_profile:
                org_name = f"Dr. {doctor_profile.full_name}'s Ayurvedic Practice"
            else:
                org_name = "AyurSetu Clinical Centre"

        # Validate start & end dates
        if data.start_date and data.end_date and data.end_date < data.start_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be on or after start date.")

        actual_deadline = data.application_deadline or data.deadline or (data.start_date if data.start_date else date.today())
        if data.start_date and actual_deadline > data.start_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application deadline cannot be after start date.")

        seats = data.number_of_seats if data.number_of_seats > 0 else (data.capacity or 5)

        posting = InternshipPosting(
            employer_user_id=user.id,
            doctor_id=doctor_profile.id if doctor_profile else None,
            clinic_id=clinic_profile.id if clinic_profile else None,
            organization_name=org_name,
            organization_type=data.organization_type or "CLINIC",
            title=data.title,
            description=data.description,
            department=data.department or data.specialization,
            specialization=data.specialization,
            internship_type=data.internship_type,
            duration_months=data.duration_months,
            duration_text=data.duration_text or f"{data.duration_months} Months",
            mode=data.mode,
            location_city=data.location_city,
            location_state=data.location_state,
            location_address=data.location_address or (clinic_profile.address if clinic_profile else None),
            stipend_inr_month=data.stipend_inr_month,
            capacity=seats,
            number_of_seats=seats,
            start_date=data.start_date,
            end_date=data.end_date,
            deadline=actual_deadline,
            eligible_courses=data.eligible_courses or ["BAMS", "MD Ayurveda"],
            eligible_years=data.eligible_years or ["Final Year", "Intern"],
            minimum_qualification=data.minimum_qualification or "BAMS Student",
            experience_required=data.experience_required or "None",
            requirements=data.requirements or f"Open to {', '.join(data.eligible_courses or ['BAMS'])} candidates.",
            skills_required=data.skills_required or [],
            responsibilities=data.responsibilities,
            learning_outcomes=data.learning_outcomes,
            benefits=data.benefits or ["Certificate of Clinical Training"],
            working_hours=data.working_hours or "09:00 AM - 05:00 PM (Mon-Sat)",
            status=data.status.upper() if data.status else "PUBLISHED"
        )

        db.add(posting)
        await db.commit()
        await db.refresh(posting)

        return await cls._format_posting_out(db, posting, user)

    @classmethod
    async def get_posting_by_id(cls, db: AsyncSession, posting_id: uuid.UUID, current_user: Optional[User] = None) -> InternshipPostingOut:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found.")

        return await cls._format_posting_out(db, posting, current_user)

    @classmethod
    async def list_postings(
        cls,
        db: AsyncSession,
        search: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        location_city: Optional[str] = None,
        location_state: Optional[str] = None,
        specialization: Optional[str] = None,
        internship_type: Optional[str] = None,
        mode: Optional[str] = None,
        duration_months: Optional[int] = None,
        stipend_min: Optional[float] = None,
        course: Optional[str] = None,
        status: Optional[str] = "PUBLISHED",
        current_user: Optional[User] = None
    ) -> List[InternshipPostingOut]:
        # Only show published / open internships to students and public
        query = select(InternshipPosting)
        if status and status.upper() != "ALL":
            query = query.where(InternshipPosting.status.in_([status.upper(), "OPEN"]))
        else:
            query = query.where(InternshipPosting.status.in_(["PUBLISHED", "OPEN"]))

        if search:
            s_term = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(InternshipPosting.title).like(s_term),
                    func.lower(InternshipPosting.description).like(s_term),
                    func.lower(InternshipPosting.specialization).like(s_term),
                    func.lower(InternshipPosting.organization_name).like(s_term)
                )
            )

        c_city = city or location_city
        if c_city:
            query = query.where(func.lower(InternshipPosting.location_city) == c_city.lower())
        c_state = state or location_state
        if c_state:
            query = query.where(func.lower(InternshipPosting.location_state) == c_state.lower())
        if specialization:
            query = query.where(func.lower(InternshipPosting.specialization) == specialization.lower())
        if internship_type:
            query = query.where(func.lower(InternshipPosting.internship_type) == internship_type.lower())
        if mode:
            query = query.where(func.lower(InternshipPosting.mode) == mode.lower())
        if duration_months:
            query = query.where(InternshipPosting.duration_months == duration_months)
        if stipend_min is not None:
            query = query.where(InternshipPosting.stipend_inr_month >= stipend_min)

        query = query.order_by(desc(InternshipPosting.created_at))
        res = await db.execute(query)
        postings = list(res.scalars().all())

        out = []
        for p in postings:
            out.append(await cls._format_posting_out(db, p, current_user))
        return out

    @classmethod
    async def list_doctor_postings(
        cls,
        db: AsyncSession,
        doctor_user: User,
        status_filter: Optional[str] = None
    ) -> List[DoctorInternshipSummaryOut]:
        query = select(InternshipPosting).where(InternshipPosting.employer_user_id == doctor_user.id)
        if status_filter and status_filter.upper() != "ALL":
            query = query.where(InternshipPosting.status == status_filter.upper())

        query = query.order_by(desc(InternshipPosting.created_at))
        res = await db.execute(query)
        postings = list(res.scalars().all())

        summaries = []
        for p in postings:
            apps_count_res = await db.execute(
                select(func.count(InternshipApplication.id)).where(InternshipApplication.internship_id == p.id)
            )
            apps_count = apps_count_res.scalar() or 0

            clinic_name = None
            if p.clinic_id:
                cl_res = await db.execute(select(ClinicHospitalProfile).where(ClinicHospitalProfile.id == p.clinic_id))
                cl = cl_res.scalar_one_or_none()
                if cl:
                    clinic_name = cl.name

            summaries.append(
                DoctorInternshipSummaryOut(
                    id=p.id,
                    title=p.title,
                    specialization=p.specialization or p.department,
                    internship_type=p.internship_type or "Clinical Internship",
                    clinic_name=clinic_name or p.organization_name,
                    location_city=p.location_city,
                    location_state=p.location_state,
                    mode=p.mode,
                    duration_text=p.duration_text or f"{p.duration_months} Months",
                    duration_months=p.duration_months,
                    number_of_seats=p.number_of_seats or p.capacity,
                    deadline=p.deadline,
                    status=p.status,
                    applications_count=apps_count,
                    created_at=p.created_at
                )
            )

        return summaries

    @classmethod
    async def update_posting(
        cls,
        db: AsyncSession,
        user: User,
        posting_id: uuid.UUID,
        data: InternshipPostingUpdateIn
    ) -> InternshipPostingOut:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found.")

        # Authorization: owner or admin
        if posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to edit this internship.")

        update_dict = data.model_dump(exclude_unset=True)

        if "start_date" in update_dict or "end_date" in update_dict:
            s_date = update_dict.get("start_date", posting.start_date)
            e_date = update_dict.get("end_date", posting.end_date)
            if s_date and e_date and e_date < s_date:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be on or after start date.")

        if "number_of_seats" in update_dict:
            update_dict["capacity"] = update_dict["number_of_seats"]

        for k, v in update_dict.items():
            setattr(posting, k, v)

        posting.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(posting)

        return await cls._format_posting_out(db, posting, user)

    @classmethod
    async def publish_posting(cls, db: AsyncSession, user: User, posting_id: uuid.UUID) -> InternshipPostingOut:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found.")

        if posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        posting.status = "PUBLISHED"
        posting.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(posting)
        return await cls._format_posting_out(db, posting, user)

    @classmethod
    async def close_posting(cls, db: AsyncSession, user: User, posting_id: uuid.UUID) -> InternshipPostingOut:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found.")

        if posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        posting.status = "CLOSED"
        posting.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(posting)
        return await cls._format_posting_out(db, posting, user)

    @classmethod
    async def cancel_posting(cls, db: AsyncSession, user: User, posting_id: uuid.UUID) -> InternshipPostingOut:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found.")

        if posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        posting.status = "CANCELLED"
        posting.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(posting)
        return await cls._format_posting_out(db, posting, user)

    @classmethod
    async def delete_posting(cls, db: AsyncSession, user: User, posting_id: uuid.UUID) -> bool:
        res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found.")

        if posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        await db.delete(posting)
        await db.commit()
        return True

    @classmethod
    async def _format_posting_out(cls, db: AsyncSession, p: InternshipPosting, current_user: Optional[User] = None) -> InternshipPostingOut:
        apps_res = await db.execute(
            select(func.count(InternshipApplication.id)).where(InternshipApplication.internship_id == p.id)
        )
        apps_count = apps_res.scalar() or 0

        has_applied = False
        if current_user and current_user.role == UserRole.STUDENT:
            st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
            st = st_res.scalar_one_or_none()
            if st:
                app_check = await db.execute(
                    select(InternshipApplication.id).where(
                        InternshipApplication.internship_id == p.id,
                        InternshipApplication.student_id == st.id
                    )
                )
                if app_check.scalar_one_or_none():
                    has_applied = True

        doctor_name = None
        doctor_qualification = None
        doctor_verification_status = None
        if p.doctor_id:
            doc_res = await db.execute(select(DoctorProfile).where(DoctorProfile.id == p.doctor_id))
            doc = doc_res.scalar_one_or_none()
            if doc:
                doctor_name = f"Dr. {doc.full_name}"
                doctor_qualification = doc.qualification
                doctor_verification_status = doc.verification_status.value if hasattr(doc.verification_status, "value") else str(doc.verification_status)
        elif p.employer_user_id:
            doc_res2 = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == p.employer_user_id))
            doc2 = doc_res2.scalar_one_or_none()
            if doc2:
                doctor_name = f"Dr. {doc2.full_name}"
                doctor_qualification = doc2.qualification
                doctor_verification_status = doc2.verification_status.value if hasattr(doc2.verification_status, "value") else str(doc2.verification_status)

        clinic_name = None
        if p.clinic_id:
            cl_res = await db.execute(select(ClinicHospitalProfile).where(ClinicHospitalProfile.id == p.clinic_id))
            cl = cl_res.scalar_one_or_none()
            if cl:
                clinic_name = cl.name

        return InternshipPostingOut(
            id=p.id,
            employer_user_id=p.employer_user_id,
            doctor_id=p.doctor_id,
            clinic_id=p.clinic_id,
            doctor_name=doctor_name,
            doctor_qualification=doctor_qualification,
            doctor_verification_status=doctor_verification_status,
            clinic_name=clinic_name,
            organization_name=p.organization_name,
            organization_type=p.organization_type,
            title=p.title,
            description=p.description,
            department=p.department,
            specialization=p.specialization or p.department,
            internship_type=p.internship_type or "Clinical Internship",
            duration_months=p.duration_months,
            duration_text=p.duration_text or f"{p.duration_months} Months",
            mode=p.mode,
            location_city=p.location_city,
            location_state=p.location_state,
            location_address=p.location_address,
            stipend_inr_month=p.stipend_inr_month,
            capacity=p.capacity,
            number_of_seats=p.number_of_seats or p.capacity,
            start_date=p.start_date,
            end_date=p.end_date,
            deadline=p.deadline,
            application_deadline=p.deadline,
            eligible_courses=p.eligible_courses or ["BAMS", "MD Ayurveda"],
            eligible_years=p.eligible_years or ["Final Year", "Intern"],
            minimum_qualification=p.minimum_qualification,
            experience_required=p.experience_required,
            requirements=p.requirements,
            skills_required=p.skills_required or [],
            responsibilities=p.responsibilities,
            learning_outcomes=p.learning_outcomes,
            benefits=p.benefits or [],
            working_hours=p.working_hours,
            status=p.status,
            applications_count=apps_count,
            has_applied=has_applied,
            created_at=p.created_at,
            updated_at=p.updated_at
        )

    # ============================================================
    # PHASE 4 — APPLICATIONS & STUDENT SHORTLISTING
    # ============================================================

    @classmethod
    async def apply_internship(
        cls,
        db: AsyncSession,
        student_user: User,
        posting_id: uuid.UUID,
        data: InternshipApplyIn
    ) -> InternshipApplicationOut:
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = st_res.scalar_one_or_none()
        if not student:
            # Auto-create baseline student profile
            student = StudentProfile(
                user_id=student_user.id,
                full_name=student_user.email.split("@")[0].title() if student_user.email else "Ayurveda Scholar",
                city="Pune",
                state="Maharashtra"
            )
            db.add(student)
            await db.flush()

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == posting_id))
        posting = post_res.scalar_one_or_none()
        if not posting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship posting not found")

        if posting.status not in ["PUBLISHED", "OPEN"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Internship is no longer open for applications.")

        # Prevent duplicate applications
        existing = await db.execute(
            select(InternshipApplication).where(
                InternshipApplication.internship_id == posting_id,
                InternshipApplication.student_id == student.id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already applied to this internship")

        # Compute matching score
        match_score = 80.0
        if posting.skills_required:
            # Check student skills
            skills_res = await db.execute(
                select(Skill.name).join(StudentSkill, StudentSkill.skill_id == Skill.id).where(StudentSkill.student_id == student.id)
            )
            student_skill_names = [s.lower() for s in skills_res.scalars().all()]
            req_skills = [s.lower() for s in posting.skills_required]
            overlap = set(student_skill_names).intersection(set(req_skills))
            if req_skills:
                match_score = round(min(100.0, 60.0 + (len(overlap) / len(req_skills)) * 40.0), 1)

        c_note = data.cover_note or data.cover_letter or "I am interested in applying for this clinical training opportunity."

        app_record = InternshipApplication(
            internship_id=posting_id,
            student_id=student.id,
            cover_note=c_note,
            cover_letter=data.cover_letter or c_note,
            resume_url=data.resume_url,
            portfolio_url=data.portfolio_url,
            additional_message=data.additional_message,
            status="APPLIED",
            match_score=match_score
        )
        db.add(app_record)

        # Notify Student
        student_notif = AppNotification(
            recipient_id=student_user.id,
            title="Application Submitted",
            message=f"Your application for '{posting.title}' has been successfully submitted.",
            notification_type="APPLICATION",
            action_url="/student/applications"
        )
        db.add(student_notif)

        # Notify Doctor / Employer
        if posting.employer_user_id:
            doctor_notif = AppNotification(
                recipient_id=posting.employer_user_id,
                title="New Internship Application",
                message=f"{student.full_name} has applied for '{posting.title}'.",
                notification_type="APPLICATION",
                action_url="/doctor/applications"
            )
            db.add(doctor_notif)

        await db.commit()
        await db.refresh(app_record)

        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def get_application_by_id(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> InternshipApplicationOut:
        res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app_record = res.scalar_one_or_none()
        if not app_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app_record.internship_id))
        posting = post_res.scalar_one_or_none()

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app_record.student_id))
        student = st_res.scalar_one_or_none()

        # Authorization: Student owner, Employer doctor, or Admin
        is_student_owner = student and student.user_id == user.id
        is_employer = posting and posting.employer_user_id == user.id
        if not (is_student_owner or is_employer or user.role == UserRole.ADMIN):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this application.")

        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def list_student_applications(
        cls,
        db: AsyncSession,
        student_user: User
    ) -> List[InternshipApplicationOut]:
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = st_res.scalar_one_or_none()
        if not student:
            return []

        query = (
            select(InternshipApplication)
            .where(InternshipApplication.student_id == student.id)
            .order_by(desc(InternshipApplication.applied_at))
        )
        res = await db.execute(query)
        apps = list(res.scalars().all())

        out = []
        for a in apps:
            p_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == a.internship_id))
            posting = p_res.scalar_one_or_none()
            out.append(await cls._format_application_out(db, a, posting, student))
        return out

    @classmethod
    async def list_doctor_applications(
        cls,
        db: AsyncSession,
        doctor_user: User,
        internship_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[InternshipApplicationOut]:
        # Fetch doctor's internship IDs
        post_query = select(InternshipPosting.id).where(InternshipPosting.employer_user_id == doctor_user.id)
        if internship_id:
            post_query = post_query.where(InternshipPosting.id == internship_id)

        post_res = await db.execute(post_query)
        internship_ids = [pid for pid in post_res.scalars().all()]

        if not internship_ids:
            return []

        query = select(InternshipApplication).where(InternshipApplication.internship_id.in_(internship_ids))
        if status_filter and status_filter.upper() != "ALL":
            query = query.where(InternshipApplication.status == status_filter.upper())

        query = query.order_by(desc(InternshipApplication.applied_at))
        res = await db.execute(query)
        apps = list(res.scalars().all())

        out = []
        for a in apps:
            p_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == a.internship_id))
            posting = p_res.scalar_one_or_none()

            st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == a.student_id))
            student = st_res.scalar_one_or_none()

            formatted = await cls._format_application_out(db, a, posting, student)
            if search:
                s_term = search.lower()
                st_name = (formatted.student.full_name if formatted.student else "").lower()
                inst_title = (formatted.internship_title or "").lower()
                if s_term not in st_name and s_term not in inst_title:
                    continue
            out.append(formatted)
        return out

    @classmethod
    async def shortlist_application(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> InternshipApplicationOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app_record = app_res.scalar_one_or_none()
        if not app_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app_record.internship_id))
        posting = post_res.scalar_one_or_none()

        if posting and posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        app_record.status = "SHORTLISTED"
        app_record.shortlisted_at = datetime.now(timezone.utc)
        app_record.updated_at = datetime.now(timezone.utc)

        # Notify student
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app_record.student_id))
        student = st_res.scalar_one_or_none()
        if student:
            notif = AppNotification(
                recipient_id=student.user_id,
                title="Congratulations! You are Shortlisted",
                message=f"You have been shortlisted for '{posting.title if posting else 'the clinical internship'}'.",
                notification_type="APPLICATION",
                action_url="/student/applications"
            )
            db.add(notif)

        await db.commit()
        await db.refresh(app_record)

        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def reject_application(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: Optional[InternshipRejectIn] = None
    ) -> InternshipApplicationOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app_record = app_res.scalar_one_or_none()
        if not app_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app_record.internship_id))
        posting = post_res.scalar_one_or_none()

        if posting and posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        reason = data.rejection_reason if data else "Application not selected for this cohort."
        app_record.status = "REJECTED"
        app_record.rejection_reason = reason
        app_record.rejected_at = datetime.now(timezone.utc)
        app_record.updated_at = datetime.now(timezone.utc)

        # Notify student
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app_record.student_id))
        student = st_res.scalar_one_or_none()
        if student:
            notif = AppNotification(
                recipient_id=student.user_id,
                title="Application Status Update",
                message=f"Update regarding your application for '{posting.title if posting else 'Internship'}': {reason}",
                notification_type="APPLICATION",
                action_url="/student/applications"
            )
            db.add(notif)

        await db.commit()
        await db.refresh(app_record)

        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def review_application(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> InternshipApplicationOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app_record = app_res.scalar_one_or_none()
        if not app_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app_record.internship_id))
        posting = post_res.scalar_one_or_none()

        if posting and posting.employer_user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        app_record.status = "UNDER_REVIEW"
        app_record.reviewed_at = datetime.now(timezone.utc)
        app_record.updated_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(app_record)

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app_record.student_id))
        student = st_res.scalar_one_or_none()
        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def withdraw_application(
        cls,
        db: AsyncSession,
        student_user: User,
        application_id: uuid.UUID
    ) -> InternshipApplicationOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app_record = app_res.scalar_one_or_none()
        if not app_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app_record.student_id))
        student = st_res.scalar_one_or_none()
        if not student or student.user_id != student_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the applicant student can withdraw this application.")

        app_record.status = "WITHDRAWN"
        app_record.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(app_record)

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app_record.internship_id))
        posting = post_res.scalar_one_or_none()

        return await cls._format_application_out(db, app_record, posting, student)

    @classmethod
    async def _format_application_out(
        cls,
        db: AsyncSession,
        a: InternshipApplication,
        p: Optional[InternshipPosting] = None,
        st: Optional[StudentProfile] = None
    ) -> InternshipApplicationOut:
        student_preview: Optional[StudentPreviewOut] = None
        if st:
            skills_res = await db.execute(
                select(Skill.name).join(StudentSkill, StudentSkill.skill_id == Skill.id).where(StudentSkill.student_id == st.id)
            )
            skills = list(skills_res.scalars().all())

            # Institution / college name
            college_name = "Ayurvedic Medical College"
            if st.institution_id:
                inst_res = await db.execute(select(InstitutionProfile).where(InstitutionProfile.id == st.institution_id))
                inst = inst_res.scalar_one_or_none()
                if inst:
                    college_name = inst.name

            # Student user email
            usr_res = await db.execute(select(User.email).where(User.id == st.user_id))
            user_email = usr_res.scalar_one_or_none()

            student_preview = StudentPreviewOut(
                id=st.id,
                full_name=st.full_name or "Ayurveda Candidate",
                email=user_email,
                phone=st.phone,
                profile_photo_url=st.profile_photo_url,
                city=st.city,
                state=st.state,
                qualification="BAMS" if not hasattr(st, "qualification") else getattr(st, "qualification", "BAMS"),
                college_name=college_name,
                current_year_of_study="Final Year" if not hasattr(st, "current_year_of_study") else getattr(st, "current_year_of_study", "Final Year"),
                skills=skills or ["Classical Pulse Examination", "Panchakarma Basics", "Dravyaguna Identification"],
                profile_strength=85,
                verification_status="VERIFIED" if getattr(st, "is_verified", False) else "PENDING",
                portfolio_slug=str(st.id)[:8],
                resume_url=a.resume_url,
                bio=st.bio if hasattr(st, "bio") else None,
                assessment_score=88.5
            )

        return InternshipApplicationOut(
            id=a.id,
            internship_id=a.internship_id,
            student_id=a.student_id,
            status=a.status,
            rejection_reason=a.rejection_reason,
            match_score=a.match_score or 85.0,
            cover_note=a.cover_note,
            cover_letter=a.cover_letter or a.cover_note,
            resume_url=a.resume_url,
            portfolio_url=a.portfolio_url,
            additional_message=a.additional_message,
            applied_at=a.applied_at,
            reviewed_at=a.reviewed_at,
            shortlisted_at=a.shortlisted_at,
            rejected_at=a.rejected_at,
            internship_title=p.title if p else "Ayurvedic Clinical Internship",
            internship_type=p.internship_type if p else "Clinical Internship",
            specialization=p.specialization if p else "General Ayurveda",
            organization_name=p.organization_name if p else "AyurSetu Clinical Centre",
            location_city=p.location_city if p else "Pune",
            location_state=p.location_state if p else "Maharashtra",
            mode=p.mode if p else "ON_SITE",
            stipend_inr_month=p.stipend_inr_month if p else 0.0,
            deadline=p.deadline if p else date.today(),
            student=student_preview
        )

    # ============================================================
    # PHASE 5 — OFFERS, ATTENDANCE, MILESTONES & TASKS
    # ============================================================

    @classmethod
    async def issue_offer(
        cls,
        db: AsyncSession,
        employer_user: User,
        application_id: uuid.UUID,
        data: OfferLetterCreateIn
    ) -> OfferLetterOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()

        if post and post.employer_user_id != employer_user.id and employer_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
        st = st_res.scalar_one_or_none()
        student_name = st.full_name if st else "Ayurveda Candidate"

        doc_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == employer_user.id))
        doc = doc_res.scalar_one_or_none()
        doctor_name = f"Dr. {doc.full_name}" if doc else None

        clinic_name = None
        if post and post.clinic_id:
            cl_res = await db.execute(select(ClinicHospitalProfile).where(ClinicHospitalProfile.id == post.clinic_id))
            cl = cl_res.scalar_one_or_none()
            if cl:
                clinic_name = cl.name

        # Check existing offer
        existing_offer_res = await db.execute(
            select(InternshipOfferLetter).where(InternshipOfferLetter.application_id == application_id)
        )
        existing_offer = existing_offer_res.scalar_one_or_none()

        if existing_offer:
            existing_offer.role_title = data.role_title or "Clinical Ayurveda Intern"
            existing_offer.start_date = data.start_date
            existing_offer.end_date = data.end_date
            existing_offer.working_hours = data.working_hours
            existing_offer.stipend_amount = data.stipend_amount
            existing_offer.terms_text = data.terms_text
            existing_offer.status = "ISSUED"
            existing_offer.issued_at = datetime.now(timezone.utc)
            offer = existing_offer
        else:
            offer = InternshipOfferLetter(
                application_id=app.id,
                internship_id=post.id if post else None,
                student_id=st.id if st else None,
                doctor_id=doc.id if doc else None,
                clinic_id=post.clinic_id if post else None,
                student_name=student_name,
                organization_name=post.organization_name if post else "AyurSetu Clinical Network",
                doctor_name=doctor_name,
                clinic_name=clinic_name or (post.organization_name if post else None),
                role_title=data.role_title or "Clinical Ayurveda Intern",
                working_hours=data.working_hours or "09:00 AM - 05:00 PM (Mon-Sat)",
                start_date=data.start_date,
                end_date=data.end_date,
                stipend_amount=data.stipend_amount,
                terms_text=data.terms_text,
                status="ISSUED"
            )
            db.add(offer)

        app.status = "OFFERED"
        app.updated_at = datetime.now(timezone.utc)

        if st:
            notif = AppNotification(
                recipient_id=st.user_id,
                title="Official Clinical Internship Offer Issued",
                message=f"You have received an official offer for '{post.title if post else 'Internship'}' from {post.organization_name if post else 'the clinic'}.",
                notification_type="APPLICATION",
                action_url="/student/offers"
            )
            db.add(notif)

        await db.commit()
        await db.refresh(offer)
        return cls._format_offer_out(offer)

    @classmethod
    async def list_doctor_offers(cls, db: AsyncSession, doctor_user: User, status_filter: Optional[str] = None) -> List[OfferLetterOut]:
        post_res = await db.execute(select(InternshipPosting.id).where(InternshipPosting.employer_user_id == doctor_user.id))
        internship_ids = [pid for pid in post_res.scalars().all()]
        if not internship_ids:
            return []

        query = select(InternshipOfferLetter).where(InternshipOfferLetter.internship_id.in_(internship_ids))
        if status_filter and status_filter.upper() != "ALL":
            query = query.where(InternshipOfferLetter.status == status_filter.upper())

        query = query.order_by(desc(InternshipOfferLetter.issued_at))
        res = await db.execute(query)
        offers = list(res.scalars().all())
        return [cls._format_offer_out(o) for o in offers]

    @classmethod
    async def list_student_offers(cls, db: AsyncSession, student_user: User) -> List[OfferLetterOut]:
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = st_res.scalar_one_or_none()
        if not student:
            return []

        query = select(InternshipOfferLetter).where(InternshipOfferLetter.student_id == student.id).order_by(desc(InternshipOfferLetter.issued_at))
        res = await db.execute(query)
        offers = list(res.scalars().all())
        return [cls._format_offer_out(o) for o in offers]

    @classmethod
    async def get_offer_by_id(cls, db: AsyncSession, user: User, offer_id: uuid.UUID) -> OfferLetterOut:
        res = await db.execute(select(InternshipOfferLetter).where(InternshipOfferLetter.id == offer_id))
        offer = res.scalar_one_or_none()
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer letter not found")
        return cls._format_offer_out(offer)

    @classmethod
    async def accept_offer(cls, db: AsyncSession, student_user: User, offer_id: uuid.UUID) -> OfferLetterOut:
        res = await db.execute(select(InternshipOfferLetter).where(InternshipOfferLetter.id == offer_id))
        offer = res.scalar_one_or_none()
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer letter not found")

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = st_res.scalar_one_or_none()
        if not student or (offer.student_id and offer.student_id != student.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the designated student can accept this offer.")

        offer.status = "ACCEPTED"
        offer.accepted_at = datetime.now(timezone.utc)

        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == offer.application_id))
        app = app_res.scalar_one_or_none()
        if app:
            app.status = "ACCEPTED"
            app.updated_at = datetime.now(timezone.utc)

            post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
            post = post_res.scalar_one_or_none()
            if post and post.employer_user_id:
                notif = AppNotification(
                    recipient_id=post.employer_user_id,
                    title="Offer Accepted by Candidate",
                    message=f"{offer.student_name} has accepted the clinical internship offer for '{post.title}'.",
                    notification_type="APPLICATION",
                    action_url="/doctor/applications"
                )
                db.add(notif)

        await db.commit()
        await db.refresh(offer)
        return cls._format_offer_out(offer)

    @classmethod
    async def decline_offer(cls, db: AsyncSession, student_user: User, offer_id: uuid.UUID, data: Optional[OfferDeclineIn] = None) -> OfferLetterOut:
        res = await db.execute(select(InternshipOfferLetter).where(InternshipOfferLetter.id == offer_id))
        offer = res.scalar_one_or_none()
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer letter not found")

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = st_res.scalar_one_or_none()
        if not student or (offer.student_id and offer.student_id != student.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

        offer.status = "DECLINED"
        offer.declined_at = datetime.now(timezone.utc)
        offer.decline_reason = data.decline_reason if data else "Candidate declined."

        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == offer.application_id))
        app = app_res.scalar_one_or_none()
        if app:
            app.status = "DECLINED"
            app.updated_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(offer)
        return cls._format_offer_out(offer)

    @classmethod
    async def cancel_offer(cls, db: AsyncSession, employer_user: User, offer_id: uuid.UUID) -> OfferLetterOut:
        res = await db.execute(select(InternshipOfferLetter).where(InternshipOfferLetter.id == offer_id))
        offer = res.scalar_one_or_none()
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer letter not found")

        offer.status = "CANCELLED"
        offer.cancelled_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(offer)
        return cls._format_offer_out(offer)

    @classmethod
    def _format_offer_out(cls, o: InternshipOfferLetter) -> OfferLetterOut:
        return OfferLetterOut(
            id=o.id,
            application_id=o.application_id,
            internship_id=o.internship_id,
            student_id=o.student_id,
            doctor_id=o.doctor_id,
            clinic_id=o.clinic_id,
            student_name=o.student_name,
            organization_name=o.organization_name,
            doctor_name=o.doctor_name,
            clinic_name=o.clinic_name,
            role_title=o.role_title or "Clinical Ayurveda Intern",
            working_hours=o.working_hours,
            start_date=o.start_date,
            end_date=o.end_date,
            stipend_amount=o.stipend_amount,
            terms_text=o.terms_text,
            status=o.status,
            issued_at=o.issued_at,
            accepted_at=o.accepted_at,
            declined_at=o.declined_at,
            cancelled_at=o.cancelled_at,
            decline_reason=o.decline_reason
        )

    # ============================================================
    # ATTENDANCE
    # ============================================================

    @classmethod
    async def log_attendance(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: LogAttendanceIn
    ) -> AttendanceLogOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        is_present = data.status.upper() in ["PRESENT", "HALF_DAY"]
        hours = 4.0 if data.status.upper() == "HALF_DAY" else (0.0 if data.status.upper() in ["ABSENT", "LEAVE"] else data.hours_worked)

        # Check existing log for that date
        exist_res = await db.execute(
            select(InternshipAttendanceLog).where(
                InternshipAttendanceLog.application_id == application_id,
                InternshipAttendanceLog.date == data.date
            )
        )
        existing = exist_res.scalar_one_or_none()

        if existing:
            existing.check_in = data.check_in
            existing.check_out = data.check_out
            existing.status = data.status.upper()
            existing.is_present = is_present
            existing.hours_worked = hours
            existing.remarks = data.remarks
            log_record = existing
        else:
            log_record = InternshipAttendanceLog(
                application_id=application_id,
                internship_id=app.internship_id,
                student_id=app.student_id,
                date=data.date,
                check_in=data.check_in,
                check_out=data.check_out,
                status=data.status.upper(),
                is_present=is_present,
                hours_worked=hours,
                remarks=data.remarks
            )
            db.add(log_record)

        await db.commit()
        await db.refresh(log_record)

        return AttendanceLogOut(
            id=log_record.id,
            application_id=log_record.application_id,
            internship_id=log_record.internship_id,
            student_id=log_record.student_id,
            date=log_record.date,
            check_in=log_record.check_in,
            check_out=log_record.check_out,
            status=log_record.status,
            is_present=log_record.is_present,
            hours_worked=log_record.hours_worked,
            remarks=log_record.remarks,
            recorded_at=log_record.recorded_at
        )

    @classmethod
    async def get_attendance_summary(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> AttendanceSummaryOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        logs_res = await db.execute(
            select(InternshipAttendanceLog)
            .where(InternshipAttendanceLog.application_id == application_id)
            .order_by(desc(InternshipAttendanceLog.date))
        )
        logs = list(logs_res.scalars().all())

        total_days = len(logs)
        present_days = sum(1 for l in logs if l.status == "PRESENT")
        half_days = sum(1 for l in logs if l.status == "HALF_DAY")
        absent_days = sum(1 for l in logs if l.status == "ABSENT")
        leave_days = sum(1 for l in logs if l.status == "LEAVE")
        total_hours = sum(l.hours_worked for l in logs)

        attendance_pct = 0.0
        if total_days > 0:
            effective_present = present_days + (half_days * 0.5)
            attendance_pct = round((effective_present / total_days) * 100.0, 1)

        records_out = [
            AttendanceLogOut(
                id=l.id,
                application_id=l.application_id,
                internship_id=l.internship_id,
                student_id=l.student_id,
                date=l.date,
                check_in=l.check_in,
                check_out=l.check_out,
                status=l.status,
                is_present=l.is_present,
                hours_worked=l.hours_worked,
                remarks=l.remarks,
                recorded_at=l.recorded_at
            ) for l in logs
        ]

        return AttendanceSummaryOut(
            total_days=total_days,
            present_days=present_days,
            absent_days=absent_days,
            half_days=half_days,
            leave_days=leave_days,
            attendance_percentage=attendance_pct,
            total_hours_worked=total_hours,
            records=records_out
        )

    # ============================================================
    # MILESTONES & TASKS
    # ============================================================

    @classmethod
    async def create_milestone(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: ProgressMilestoneIn
    ) -> ProgressMilestoneOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        milestone = InternshipProgressMilestone(
            application_id=application_id,
            internship_id=app.internship_id,
            student_id=app.student_id,
            milestone_title=data.milestone_title,
            description=data.description,
            category=data.category,
            status=data.status,
            is_completed=(data.status == "COMPLETED"),
            completion_percentage=100 if data.status == "COMPLETED" else 0,
            due_date=data.due_date
        )
        db.add(milestone)
        await db.flush()

        # Add initial tasks if provided
        if data.tasks:
            for t in data.tasks:
                task_rec = InternshipTask(
                    milestone_id=milestone.id,
                    application_id=application_id,
                    title=t.title,
                    description=t.description,
                    task_type=t.task_type,
                    status=t.status,
                    doctor_remarks=t.doctor_remarks
                )
                db.add(task_rec)

        await db.commit()
        await db.refresh(milestone)
        return await cls._format_milestone_out(db, milestone)

    @classmethod
    async def update_milestone(
        cls,
        db: AsyncSession,
        user: User,
        milestone_id: uuid.UUID,
        data: ProgressMilestoneUpdateIn
    ) -> ProgressMilestoneOut:
        res = await db.execute(select(InternshipProgressMilestone).where(InternshipProgressMilestone.id == milestone_id))
        m = res.scalar_one_or_none()
        if not m:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

        update_dict = data.model_dump(exclude_unset=True)
        if "status" in update_dict:
            m.status = update_dict["status"]
            if m.status == "COMPLETED":
                m.is_completed = True
                m.completion_percentage = 100
                m.completed_date = date.today()
        if "completion_percentage" in update_dict:
            m.completion_percentage = update_dict["completion_percentage"]
            if m.completion_percentage >= 100:
                m.is_completed = True
                m.status = "COMPLETED"
                m.completed_date = date.today()
        if "supervisor_review" in update_dict:
            m.supervisor_review = update_dict["supervisor_review"]
            m.reviewed_at = datetime.now(timezone.utc)
        if "milestone_title" in update_dict:
            m.milestone_title = update_dict["milestone_title"]
        if "description" in update_dict:
            m.description = update_dict["description"]
        if "due_date" in update_dict:
            m.due_date = update_dict["due_date"]
        if "category" in update_dict:
            m.category = update_dict["category"]

        await db.commit()
        await db.refresh(m)
        return await cls._format_milestone_out(db, m)

    @classmethod
    async def create_task(
        cls,
        db: AsyncSession,
        user: User,
        milestone_id: uuid.UUID,
        data: InternshipTaskIn
    ) -> InternshipTaskOut:
        m_res = await db.execute(select(InternshipProgressMilestone).where(InternshipProgressMilestone.id == milestone_id))
        m = m_res.scalar_one_or_none()
        if not m:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

        task_rec = InternshipTask(
            milestone_id=milestone_id,
            application_id=m.application_id,
            title=data.title,
            description=data.description,
            task_type=data.task_type,
            status=data.status,
            doctor_remarks=data.doctor_remarks
        )
        db.add(task_rec)
        await db.commit()
        await db.refresh(task_rec)

        return InternshipTaskOut(
            id=task_rec.id,
            milestone_id=task_rec.milestone_id,
            application_id=task_rec.application_id,
            title=task_rec.title,
            description=task_rec.description,
            task_type=task_rec.task_type,
            status=task_rec.status,
            doctor_remarks=task_rec.doctor_remarks,
            completed_at=task_rec.completed_at,
            created_at=task_rec.created_at
        )

    @classmethod
    async def update_task(
        cls,
        db: AsyncSession,
        user: User,
        task_id: uuid.UUID,
        data: InternshipTaskUpdateIn
    ) -> InternshipTaskOut:
        res = await db.execute(select(InternshipTask).where(InternshipTask.id == task_id))
        t = res.scalar_one_or_none()
        if not t:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        update_dict = data.model_dump(exclude_unset=True)
        if "status" in update_dict:
            t.status = update_dict["status"]
            if t.status == "COMPLETED":
                t.completed_at = datetime.now(timezone.utc)
        if "doctor_remarks" in update_dict:
            t.doctor_remarks = update_dict["doctor_remarks"]
        if "title" in update_dict:
            t.title = update_dict["title"]
        if "description" in update_dict:
            t.description = update_dict["description"]
        if "task_type" in update_dict:
            t.task_type = update_dict["task_type"]

        await db.commit()
        await db.refresh(t)

        return InternshipTaskOut(
            id=t.id,
            milestone_id=t.milestone_id,
            application_id=t.application_id,
            title=t.title,
            description=t.description,
            task_type=t.task_type,
            status=t.status,
            doctor_remarks=t.doctor_remarks,
            completed_at=t.completed_at,
            created_at=t.created_at
        )

    @classmethod
    async def get_full_progress(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> InternshipFullProgressOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
        st = st_res.scalar_one_or_none()

        # Milestones
        m_res = await db.execute(
            select(InternshipProgressMilestone)
            .where(InternshipProgressMilestone.application_id == application_id)
            .order_by(InternshipProgressMilestone.created_at)
        )
        milestones = list(m_res.scalars().all())

        formatted_milestones = []
        total_tasks = 0
        completed_tasks = 0
        for m in milestones:
            formatted_m = await cls._format_milestone_out(db, m)
            total_tasks += len(formatted_m.tasks)
            completed_tasks += sum(1 for t in formatted_m.tasks if t.status == "COMPLETED")
            formatted_milestones.append(formatted_m)

        total_milestones = len(milestones)
        completed_milestones = sum(1 for m in milestones if m.is_completed or m.status == "COMPLETED")

        # Progress calculation
        overall_progress = 0.0
        if total_milestones > 0:
            avg_m_pct = sum(m.completion_percentage for m in milestones) / total_milestones
            overall_progress = round(avg_m_pct, 1)
        elif total_tasks > 0:
            overall_progress = round((completed_tasks / total_tasks) * 100.0, 1)

        # Attendance summary
        att_res = await db.execute(
            select(InternshipAttendanceLog).where(InternshipAttendanceLog.application_id == application_id)
        )
        logs = list(att_res.scalars().all())
        total_days = len(logs)
        effective_present = sum(1 for l in logs if l.status == "PRESENT") + (sum(1 for l in logs if l.status == "HALF_DAY") * 0.5)
        att_pct = round((effective_present / total_days) * 100.0, 1) if total_days > 0 else 0.0
        total_hours = sum(l.hours_worked for l in logs)

        doctor_name = None
        if post and post.doctor_id:
            d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.id == post.doctor_id))
            doc = d_res.scalar_one_or_none()
            if doc:
                doctor_name = f"Dr. {doc.full_name}"

        return InternshipFullProgressOut(
            application_id=application_id,
            internship_title=post.title if post else "Clinical Internship",
            student_name=st.full_name if st else "Ayurveda Scholar",
            doctor_name=doctor_name,
            overall_progress_percentage=overall_progress,
            total_milestones=total_milestones,
            completed_milestones=completed_milestones,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            attendance_percentage=att_pct,
            total_hours_completed=total_hours,
            milestones=formatted_milestones,
            recent_remarks=milestones[-1].supervisor_review if milestones and milestones[-1].supervisor_review else "Intern is progressing consistently."
        )

    @classmethod
    async def _format_milestone_out(cls, db: AsyncSession, m: InternshipProgressMilestone) -> ProgressMilestoneOut:
        tasks_res = await db.execute(
            select(InternshipTask).where(InternshipTask.milestone_id == m.id).order_by(InternshipTask.created_at)
        )
        tasks = list(tasks_res.scalars().all())

        tasks_out = [
            InternshipTaskOut(
                id=t.id,
                milestone_id=t.milestone_id,
                application_id=t.application_id,
                title=t.title,
                description=t.description,
                task_type=t.task_type,
                status=t.status,
                doctor_remarks=t.doctor_remarks,
                completed_at=t.completed_at,
                created_at=t.created_at
            ) for t in tasks
        ]

        return ProgressMilestoneOut(
            id=m.id,
            application_id=m.application_id,
            internship_id=m.internship_id,
            student_id=m.student_id,
            milestone_title=m.milestone_title,
            description=m.description,
            category=m.category or "CLINICAL",
            status=m.status or "IN_PROGRESS",
            is_completed=m.is_completed,
            completion_percentage=m.completion_percentage or 0,
            due_date=m.due_date,
            completed_date=m.completed_date,
            supervisor_review=m.supervisor_review,
            reviewed_at=m.reviewed_at,
            created_at=m.created_at,
            tasks=tasks_out
        )

    # ============================================================
    # PHASE 6: COMPLETION, CERTIFICATES, FEEDBACK & PORTFOLIO
    # ============================================================

    @classmethod
    async def complete_internship(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: CompleteInternshipIn
    ) -> InternshipCertificateOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated internship posting not found")

        # Authorization: Doctor who posted or Admin
        if user.role != UserRole.ADMIN and post.employer_user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the supervisory doctor can mark this internship as completed."
            )

        # 1. Update application status
        app.status = "COMPLETED"
        app.reviewed_at = datetime.now(timezone.utc)

        # 2. Compute total hours worked from attendance logs
        att_res = await db.execute(
            select(func.sum(InternshipAttendanceLog.hours_worked)).where(
                InternshipAttendanceLog.application_id == application_id
            )
        )
        total_hours = att_res.scalar() or 0.0

        # Fetch student and doctor info
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
        st = st_res.scalar_one_or_none()

        doc_name = None
        clinic_name = post.organization_name
        if post.doctor_id:
            d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.id == post.doctor_id))
            doc = d_res.scalar_one_or_none()
            if doc:
                doc_name = f"Dr. {doc.full_name}"

        # 3. Handle Doctor Feedback if provided
        if data.doctor_feedback:
            fb_res = await db.execute(
                select(InternshipSupervisorFeedback).where(InternshipSupervisorFeedback.application_id == application_id)
            )
            fb = fb_res.scalar_one_or_none()
            if not fb:
                fb = InternshipSupervisorFeedback(
                    application_id=application_id,
                    doctor_id=post.doctor_id,
                    student_id=app.student_id,
                    clinical_skills_rating=data.doctor_feedback.clinical_skills_rating,
                    communication_rating=data.doctor_feedback.communication_rating,
                    professionalism_rating=data.doctor_feedback.professionalism_rating,
                    punctuality_rating=data.doctor_feedback.punctuality_rating,
                    technical_knowledge_rating=data.doctor_feedback.technical_knowledge_rating,
                    teamwork_rating=data.doctor_feedback.teamwork_rating,
                    learning_ability_rating=data.doctor_feedback.learning_ability_rating,
                    overall_rating=data.doctor_feedback.overall_rating,
                    written_feedback=data.doctor_feedback.written_feedback,
                    strengths_notes=data.doctor_feedback.strengths_notes,
                    areas_for_growth=data.doctor_feedback.areas_for_growth,
                    recommendations=data.doctor_feedback.recommendations
                )
                db.add(fb)
            else:
                fb.clinical_skills_rating = data.doctor_feedback.clinical_skills_rating
                fb.communication_rating = data.doctor_feedback.communication_rating
                fb.professionalism_rating = data.doctor_feedback.professionalism_rating
                fb.punctuality_rating = data.doctor_feedback.punctuality_rating
                fb.technical_knowledge_rating = data.doctor_feedback.technical_knowledge_rating
                fb.teamwork_rating = data.doctor_feedback.teamwork_rating
                fb.learning_ability_rating = data.doctor_feedback.learning_ability_rating
                fb.overall_rating = data.doctor_feedback.overall_rating
                fb.written_feedback = data.doctor_feedback.written_feedback
                fb.strengths_notes = data.doctor_feedback.strengths_notes
                fb.areas_for_growth = data.doctor_feedback.areas_for_growth
                fb.recommendations = data.doctor_feedback.recommendations

        # 4. Generate or update Certificate
        completion_dt = data.completion_date or date.today()
        cert_res = await db.execute(
            select(InternshipCompletionCertificate).where(InternshipCompletionCertificate.application_id == application_id)
        )
        cert = cert_res.scalar_one_or_none()

        if not cert:
            cert_token = f"AYUR-CERT-{completion_dt.year}-{uuid.uuid4().hex[:6].upper()}"
            hash_payload = f"{cert_token}:{app.id}:{st.full_name if st else ''}:{completion_dt}"
            signature_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

            cert = InternshipCompletionCertificate(
                application_id=app.id,
                certificate_token=cert_token,
                certificate_hash=signature_hash,
                digital_signature_hash=signature_hash,
                student_id=app.student_id,
                student_name=st.full_name if st else "Ayurveda Scholar",
                doctor_id=post.doctor_id,
                doctor_name=doc_name,
                clinic_name=clinic_name,
                organization_name=post.organization_name,
                internship_title=post.title,
                specialization=post.specialization,
                start_date=post.start_date or date.today(),
                end_date=post.end_date or completion_dt,
                duration_text=post.duration_text or f"{post.duration_months} Months",
                completion_date=completion_dt,
                total_hours_completed=float(total_hours),
                status="VALID",
                is_valid=True,
                added_to_portfolio=data.add_to_student_portfolio,
                verification_url=f"/verify/certificate/{cert_token}",
                qr_data=f"https://ayursetu.in/verify/certificate/{cert_token}"
            )
            db.add(cert)
        else:
            cert.status = "VALID"
            cert.is_valid = True
            cert.completion_date = completion_dt
            cert.total_hours_completed = float(total_hours)

        # 5. Portfolio Integration
        if data.add_to_student_portfolio and st:
            p_res = await db.execute(select(Portfolio).where(Portfolio.student_profile_id == st.id))
            portfolio = p_res.scalar_one_or_none()
            if not portfolio:
                clean_slug_name = (st.full_name or "student").lower().replace(" ", "-")
                portfolio = Portfolio(
                    student_profile_id=st.id,
                    title=f"{st.full_name}'s Ayurveda Clinical Portfolio",
                    slug=f"{clean_slug_name}-{uuid.uuid4().hex[:6]}",
                    visibility=PortfolioVisibility.PUBLIC
                )
                db.add(portfolio)
                await db.flush()

            # Add Portfolio Experience
            exp_res = await db.execute(
                select(PortfolioExperience).where(
                    and_(
                        PortfolioExperience.portfolio_id == portfolio.id,
                        PortfolioExperience.role == post.title
                    )
                )
            )
            if not exp_res.scalar_one_or_none():
                port_exp = PortfolioExperience(
                    portfolio_id=portfolio.id,
                    student_profile_id=st.id,
                    organization=post.organization_name,
                    role=f"Clinical Intern — {post.title}",
                    experience_type=ExperienceType.INTERNSHIP,
                    location=f"{post.location_city}, {post.location_state}",
                    description=post.description,
                    start_date=str(post.start_date) if post.start_date else str(date.today()),
                    end_date=str(completion_dt),
                    is_current=False,
                    skills_used=post.skills_required or ["Ayurvedic Diagnostics", "Clinical OPD"],
                    visibility="PUBLIC"
                )
                db.add(port_exp)

            # Add Portfolio Certification
            cert_entry_res = await db.execute(
                select(PortfolioCertification).where(
                    and_(
                        PortfolioCertification.portfolio_id == portfolio.id,
                        PortfolioCertification.credential_id == cert.certificate_token
                    )
                )
            )
            if not cert_entry_res.scalar_one_or_none():
                port_cert = PortfolioCertification(
                    portfolio_id=portfolio.id,
                    student_profile_id=st.id,
                    name=f"Clinical Internship Certificate: {post.title}",
                    issuer=f"AyurSetu • {doc_name or post.organization_name}",
                    issue_date=str(completion_dt),
                    credential_id=cert.certificate_token,
                    credential_url=f"/verify/certificate/{cert.certificate_token}",
                    certificate_url=f"/verify/certificate/{cert.certificate_token}",
                    description=f"Successfully completed {post.duration_months} months clinical rotation ({total_hours} verified hours).",
                    visibility="PUBLIC"
                )
                db.add(port_cert)

        # 6. Notify Student
        if st and st.user_id:
            notif = AppNotification(
                recipient_id=st.user_id,
                title="🎓 Internship Completed & Certificate Issued!",
                message=f"Congratulations! {doc_name or 'Your supervising doctor'} has marked your '{post.title}' internship as COMPLETED. Your verifiable certificate has been issued and added to your portfolio.",
                notification_type="SYSTEM",
                action_url=f"/verify/certificate/{cert.certificate_token}",
                is_read=False
            )
            db.add(notif)

        await db.commit()
        await db.refresh(cert)

        return cert

    @classmethod
    async def get_certificate_by_application_id(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> InternshipCertificateOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        cert_res = await db.execute(
            select(InternshipCompletionCertificate).where(InternshipCompletionCertificate.application_id == application_id)
        )
        cert = cert_res.scalar_one_or_none()
        if not cert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate has not been issued yet for this rotation.")

        # Authorization: student applicant, employer/doctor, or admin
        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
        st = st_res.scalar_one_or_none()

        is_student = (st and st.user_id == user.id)
        is_doctor = (post and post.employer_user_id == user.id)
        is_admin = (user.role == UserRole.ADMIN)

        if not (is_student or is_doctor or is_admin):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to view this certificate.")

        return cert

    @classmethod
    async def verify_certificate_public(
        cls,
        db: AsyncSession,
        certificate_token: str
    ) -> CertificatePublicVerifyOut:
        cert_res = await db.execute(
            select(InternshipCompletionCertificate).where(
                func.upper(InternshipCompletionCertificate.certificate_token) == certificate_token.strip().upper()
            )
        )
        cert = cert_res.scalar_one_or_none()
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Certificate with token '{certificate_token}' was not found in AyurSetu registry."
            )

        # Privacy-preserving student name mask (e.g. "Rutuja S*****" or "R. S.")
        raw_name = cert.student_name.strip()
        parts = raw_name.split()
        if len(parts) >= 2:
            masked_name = f"{parts[0]} {parts[-1][0]}*****"
        else:
            masked_name = f"{raw_name[:2]}*****"

        return CertificatePublicVerifyOut(
            certificate_id=str(cert.id),
            certificate_token=cert.certificate_token,
            student_name_masked=masked_name,
            internship_title=cert.internship_title,
            doctor_name=cert.doctor_name,
            organization_name=cert.organization_name,
            clinic_name=cert.clinic_name,
            duration_text=cert.duration_text,
            start_date=cert.start_date,
            end_date=cert.end_date,
            completion_date=cert.completion_date,
            total_hours=cert.total_hours_completed,
            issue_date=cert.issued_at.date() if cert.issued_at else cert.completion_date,
            status=cert.status,
            is_valid=cert.is_valid and (cert.status == "VALID"),
            digital_signature_hash=cert.digital_signature_hash,
            accreditation="National Commission for Indian System of Medicine (NCISM) & Ministry of Ayush Guidelines"
        )

    @classmethod
    async def submit_doctor_feedback(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: SupervisorFeedbackIn
    ) -> SupervisorFeedbackOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()

        if user.role != UserRole.ADMIN and (not post or post.employer_user_id != user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the supervising doctor can submit feedback.")

        fb_res = await db.execute(
            select(InternshipSupervisorFeedback).where(InternshipSupervisorFeedback.application_id == application_id)
        )
        fb = fb_res.scalar_one_or_none()

        if not fb:
            fb = InternshipSupervisorFeedback(
                application_id=application_id,
                doctor_id=post.doctor_id if post else None,
                student_id=app.student_id,
                clinical_skills_rating=data.clinical_skills_rating,
                communication_rating=data.communication_rating,
                professionalism_rating=data.professionalism_rating,
                punctuality_rating=data.punctuality_rating,
                technical_knowledge_rating=data.technical_knowledge_rating,
                teamwork_rating=data.teamwork_rating,
                learning_ability_rating=data.learning_ability_rating,
                overall_rating=data.overall_rating,
                written_feedback=data.written_feedback,
                strengths_notes=data.strengths_notes,
                areas_for_growth=data.areas_for_growth,
                recommendations=data.recommendations
            )
            db.add(fb)
        else:
            fb.clinical_skills_rating = data.clinical_skills_rating
            fb.communication_rating = data.communication_rating
            fb.professionalism_rating = data.professionalism_rating
            fb.punctuality_rating = data.punctuality_rating
            fb.technical_knowledge_rating = data.technical_knowledge_rating
            fb.teamwork_rating = data.teamwork_rating
            fb.learning_ability_rating = data.learning_ability_rating
            fb.overall_rating = data.overall_rating
            fb.written_feedback = data.written_feedback
            fb.strengths_notes = data.strengths_notes
            fb.areas_for_growth = data.areas_for_growth
            fb.recommendations = data.recommendations

        await db.commit()
        await db.refresh(fb)
        return fb

    @classmethod
    async def get_doctor_feedback(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> SupervisorFeedbackOut:
        fb_res = await db.execute(
            select(InternshipSupervisorFeedback).where(InternshipSupervisorFeedback.application_id == application_id)
        )
        fb = fb_res.scalar_one_or_none()
        if not fb:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctor feedback found for this rotation.")
        return fb

    @classmethod
    async def submit_student_feedback(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID,
        data: StudentFeedbackIn
    ) -> StudentFeedbackOut:
        app_res = await db.execute(select(InternshipApplication).where(InternshipApplication.id == application_id))
        app = app_res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

        st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
        st = st_res.scalar_one_or_none()
        if not st or st.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the enrolled student can submit feedback.")

        post_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
        post = post_res.scalar_one_or_none()

        fb_res = await db.execute(
            select(InternshipStudentFeedback).where(InternshipStudentFeedback.application_id == application_id)
        )
        fb = fb_res.scalar_one_or_none()

        if not fb:
            fb = InternshipStudentFeedback(
                application_id=application_id,
                doctor_id=post.doctor_id if post else None,
                student_id=st.id,
                overall_rating=data.overall_rating,
                learning_experience_rating=data.learning_experience_rating,
                doctor_mentorship_rating=data.doctor_mentorship_rating,
                mentorship_quality_rating=data.doctor_mentorship_rating,
                work_environment_rating=data.organization_rating,
                clinical_exposure_rating=data.clinical_exposure_rating,
                organization_rating=data.organization_rating,
                facilities_rating=data.facilities_rating,
                overall_experience_comments=data.overall_experience_comments,
                review_comments=data.review_comments,
                is_anonymous=data.is_anonymous,
                is_public=data.is_public
            )
            db.add(fb)
        else:
            fb.overall_rating = data.overall_rating
            fb.learning_experience_rating = data.learning_experience_rating
            fb.doctor_mentorship_rating = data.doctor_mentorship_rating
            fb.mentorship_quality_rating = data.doctor_mentorship_rating
            fb.work_environment_rating = data.organization_rating
            fb.clinical_exposure_rating = data.clinical_exposure_rating
            fb.organization_rating = data.organization_rating
            fb.facilities_rating = data.facilities_rating
            fb.overall_experience_comments = data.overall_experience_comments
            fb.review_comments = data.review_comments
            fb.is_anonymous = data.is_anonymous
            fb.is_public = data.is_public

        await db.commit()
        await db.refresh(fb)
        return fb

    @classmethod
    async def get_student_feedback(
        cls,
        db: AsyncSession,
        user: User,
        application_id: uuid.UUID
    ) -> StudentFeedbackOut:
        fb_res = await db.execute(
            select(InternshipStudentFeedback).where(InternshipStudentFeedback.application_id == application_id)
        )
        fb = fb_res.scalar_one_or_none()
        if not fb:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No student feedback found for this rotation.")
        return fb

    @classmethod
    async def get_doctor_analytics(
        cls,
        db: AsyncSession,
        doctor_user: User
    ) -> DoctorInternshipAnalyticsOut:
        # All postings by this doctor
        p_res = await db.execute(
            select(InternshipPosting).where(InternshipPosting.employer_user_id == doctor_user.id)
        )
        postings = list(p_res.scalars().all())
        total_postings = len(postings)
        active_postings = sum(1 for p in postings if p.status in ["PUBLISHED", "OPEN"])
        completed_postings = sum(1 for p in postings if p.status == "COMPLETED")
        cancelled_postings = sum(1 for p in postings if p.status in ["CLOSED", "CANCELLED"])

        if total_postings == 0:
            return DoctorInternshipAnalyticsOut()

        posting_ids = [p.id for p in postings]

        # Applications stats
        app_res = await db.execute(
            select(InternshipApplication).where(InternshipApplication.internship_id.in_(posting_ids))
        )
        apps = list(app_res.scalars().all())
        total_apps = len(apps)
        shortlisted_cnt = sum(1 for a in apps if a.status == "SHORTLISTED")
        accepted_cnt = sum(1 for a in apps if a.status in ["ACCEPTED", "OFFERED"])
        completed_students_cnt = sum(1 for a in apps if a.status == "COMPLETED")

        # Average attendance percentage
        app_ids = [a.id for a in apps]
        avg_att = 0.0
        if app_ids:
            att_logs_res = await db.execute(
                select(InternshipAttendanceLog).where(InternshipAttendanceLog.application_id.in_(app_ids))
            )
            logs = list(att_logs_res.scalars().all())
            if logs:
                present_count = sum(1 for l in logs if l.status == "PRESENT") + (sum(1 for l in logs if l.status == "HALF_DAY") * 0.5)
                avg_att = round((present_count / len(logs)) * 100.0, 1)

        # Average student rating
        avg_rating = 0.0
        if app_ids:
            st_fb_res = await db.execute(
                select(func.avg(InternshipStudentFeedback.overall_rating)).where(
                    InternshipStudentFeedback.application_id.in_(app_ids)
                )
            )
            avg_r = st_fb_res.scalar()
            avg_rating = round(float(avg_r), 1) if avg_r else 5.0

        return DoctorInternshipAnalyticsOut(
            total_internships=total_postings,
            active_internships=active_postings,
            completed_internships=completed_postings,
            cancelled_internships=cancelled_postings,
            total_applications=total_apps,
            shortlisted_count=shortlisted_cnt,
            accepted_count=accepted_cnt,
            completed_students_count=completed_students_cnt,
            average_attendance_percentage=avg_att,
            average_student_rating=avg_rating
        )

    @classmethod
    async def get_internship_history(
        cls,
        db: AsyncSession,
        user: User,
        role: str
    ) -> List[InternshipHistoryItemOut]:
        items: List[InternshipHistoryItemOut] = []

        if role == "DOCTOR":
            p_res = await db.execute(
                select(InternshipPosting).where(InternshipPosting.employer_user_id == user.id)
            )
            postings = list(p_res.scalars().all())
            for p in postings:
                app_res = await db.execute(
                    select(InternshipApplication).where(InternshipApplication.internship_id == p.id)
                )
                apps = list(app_res.scalars().all())
                for a in apps:
                    st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == a.student_id))
                    st = st_res.scalar_one_or_none()

                    cert_res = await db.execute(
                        select(InternshipCompletionCertificate).where(InternshipCompletionCertificate.application_id == a.id)
                    )
                    cert = cert_res.scalar_one_or_none()

                    fb_res = await db.execute(
                        select(InternshipSupervisorFeedback).where(InternshipSupervisorFeedback.application_id == a.id)
                    )
                    fb = fb_res.scalar_one_or_none()

                    st_fb_res = await db.execute(
                        select(InternshipStudentFeedback).where(InternshipStudentFeedback.application_id == a.id)
                    )
                    st_fb = st_fb_res.scalar_one_or_none()

                    doc_prof_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
                    doc_prof = doc_prof_res.scalar_one_or_none()
                    doc_disp = f"Dr. {doc_prof.full_name}" if (doc_prof and doc_prof.full_name) else p.organization_name

                    items.append(
                        InternshipHistoryItemOut(
                            application_id=a.id,
                            internship_id=p.id,
                            internship_title=p.title,
                            specialization=p.specialization,
                            organization_name=p.organization_name,
                            clinic_name=p.organization_name,
                            doctor_name=doc_disp,
                            student_name=st.full_name if st else "Ayurveda Scholar",
                            role_title=p.title,
                            status=a.status,
                            start_date=p.start_date,
                            end_date=p.end_date,
                            completion_date=cert.completion_date if cert else None,
                            certificate_token=cert.certificate_token if cert else None,
                            attendance_percentage=100.0 if a.status == "COMPLETED" else 0.0,
                            overall_progress_percentage=100.0 if a.status == "COMPLETED" else 50.0,
                            doctor_rating=fb.overall_rating if fb else None,
                            student_rating=st_fb.overall_rating if st_fb else None
                        )
                    )
        else:
            # Student history
            st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
            st = st_res.scalar_one_or_none()
            if not st:
                return []

            app_res = await db.execute(
                select(InternshipApplication).where(InternshipApplication.student_id == st.id)
            )
            apps = list(app_res.scalars().all())

            for a in apps:
                p_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == a.internship_id))
                p = p_res.scalar_one_or_none()
                if not p:
                    continue

                cert_res = await db.execute(
                    select(InternshipCompletionCertificate).where(InternshipCompletionCertificate.application_id == a.id)
                )
                cert = cert_res.scalar_one_or_none()

                fb_res = await db.execute(
                    select(InternshipSupervisorFeedback).where(InternshipSupervisorFeedback.application_id == a.id)
                )
                fb = fb_res.scalar_one_or_none()

                st_fb_res = await db.execute(
                    select(InternshipStudentFeedback).where(InternshipStudentFeedback.application_id == a.id)
                )
                st_fb = st_fb_res.scalar_one_or_none()

                items.append(
                    InternshipHistoryItemOut(
                        application_id=a.id,
                        internship_id=p.id,
                        internship_title=p.title,
                        specialization=p.specialization,
                        organization_name=p.organization_name,
                        clinic_name=p.organization_name,
                        doctor_name=None,
                        student_name=st.full_name,
                        role_title=p.title,
                        status=a.status,
                        start_date=p.start_date,
                        end_date=p.end_date,
                        completion_date=cert.completion_date if cert else None,
                        certificate_token=cert.certificate_token if cert else None,
                        attendance_percentage=100.0 if a.status == "COMPLETED" else 0.0,
                        overall_progress_percentage=100.0 if a.status == "COMPLETED" else 50.0,
                        doctor_rating=fb.overall_rating if fb else None,
                        student_rating=st_fb.overall_rating if st_fb else None
                    )
                )

        return items

