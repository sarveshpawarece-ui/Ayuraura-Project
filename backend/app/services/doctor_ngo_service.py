import uuid
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import VerificationStatus, StudentProfile
from app.models.doctor_ngo import (
    DoctorProfile,
    DoctorVerificationDocument,
    ClinicHospitalProfile,
    DoctorMessage,
    DoctorStudentSession,
    NGOProfile
)
from app.models.internships import (
    InternshipPosting,
    InternshipApplication
)
from app.models.camps import AppNotification
from app.schemas.doctor_ngo import (
    DoctorProfileCreateIn,
    DoctorProfileUpdateIn,
    DoctorProfileOut,
    DoctorVerificationDocumentIn,
    DoctorVerificationDocumentOut,
    DoctorVerificationStatusOut,
    DoctorVerificationSubmitIn,
    ClinicProfileCreateIn,
    ClinicProfileUpdateIn,
    ClinicProfileOut,
    DoctorMessageIn,
    DoctorMessageOut,
    ConversationSummaryOut,
    DoctorSessionCreateIn,
    DoctorSessionRequestIn,
    DoctorSessionStatusUpdateIn,
    DoctorSessionOut,
    DoctorDashboardSummaryOut,
    RecentApplicationSummary,
    UpcomingSessionSummary,
    RecentMessageSummary,
    NGOProfileCreateIn,
    NGOProfileOut
)


class DoctorNGOService:

    @classmethod
    def calculate_profile_completion(cls, profile: Optional[DoctorProfile]) -> int:
        if not profile:
            return 0
        fields = [
            bool(profile.full_name),
            bool(profile.registration_number),
            bool(profile.state_medical_council),
            bool(profile.qualification),
            bool(profile.specialization),
            profile.years_of_experience > 0,
            bool(profile.designation),
            bool(profile.areas_of_expertise and len(profile.areas_of_expertise) > 0),
            bool(profile.bio),
            bool(profile.phone),
            bool(profile.gender),
            bool(profile.date_of_birth),
            bool(profile.city),
            bool(profile.state),
            bool(profile.clinic_address),
        ]
        completed = sum(1 for f in fields if f)
        return int((completed / len(fields)) * 100)

    @classmethod
    async def get_or_create_doctor_profile(cls, db: AsyncSession, user: User) -> DoctorProfile:
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = DoctorProfile(
                user_id=user.id,
                full_name=user.email.split("@")[0].replace(".", " ").title(),
                registration_number=f"DOC-{user.id.hex[:6].upper()}",
                state_medical_council="State Council of Indian Medicine",
                qualification="BAMS",
                specialization="General Ayurveda",
                years_of_experience=1,
                city="New Delhi",
                state="Delhi",
                verification_status=VerificationStatus.UNVERIFIED
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return profile

    @classmethod
    async def get_doctor_profile_me(cls, db: AsyncSession, user: User) -> DoctorProfileOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        completion = cls.calculate_profile_completion(profile)
        
        return DoctorProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            name_prefix=getattr(profile, "name_prefix", None) or "Dr.",
            first_name=getattr(profile, "first_name", None),
            middle_name=getattr(profile, "middle_name", None),
            last_name=getattr(profile, "last_name", None),
            full_name=profile.full_name,
            registration_number=profile.registration_number,
            state_medical_council=profile.state_medical_council,
            qualification=profile.qualification,
            specialization=profile.specialization,
            years_of_experience=profile.years_of_experience,
            designation=profile.designation,
            areas_of_expertise=profile.areas_of_expertise or [],
            bio=profile.bio,
            phone=profile.phone,
            gender=profile.gender,
            date_of_birth=profile.date_of_birth,
            profile_photo_url=profile.profile_photo_url,
            city=profile.city,
            state=profile.state,
            country=profile.country or "India",
            pincode=profile.pincode,
            clinic_address=profile.clinic_address,
            verification_status=profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            verification_remarks=profile.verification_remarks,
            verified_at=profile.verified_at,
            profile_completion_percentage=completion,
            email=user.email,
            created_at=profile.created_at
        )

    @classmethod
    async def create_or_update_doctor_profile(cls, db: AsyncSession, user: User, data: DoctorProfileCreateIn) -> DoctorProfileOut:
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
        profile = result.scalar_one_or_none()

        name_parts = [p for p in [data.name_prefix or (profile.name_prefix if profile else "Dr."), data.first_name, data.middle_name, data.last_name] if p and p.strip()]
        computed_full_name = " ".join(name_parts) if (data.first_name or data.last_name) else data.full_name

        if profile:
            profile.name_prefix = data.name_prefix or profile.name_prefix or "Dr."
            profile.first_name = data.first_name
            profile.middle_name = data.middle_name
            profile.last_name = data.last_name
            profile.full_name = computed_full_name
            profile.registration_number = data.registration_number
            profile.state_medical_council = data.state_medical_council
            profile.qualification = data.qualification
            profile.specialization = data.specialization
            profile.years_of_experience = data.years_of_experience
            profile.designation = data.designation
            profile.areas_of_expertise = data.areas_of_expertise
            profile.bio = data.bio
            profile.phone = data.phone
            profile.gender = data.gender
            profile.date_of_birth = data.date_of_birth
            profile.profile_photo_url = data.profile_photo_url
            profile.city = data.city
            profile.state = data.state
            profile.country = data.country
            profile.pincode = data.pincode
            profile.clinic_address = data.clinic_address
        else:
            profile = DoctorProfile(
                user_id=user.id,
                name_prefix=data.name_prefix or "Dr.",
                first_name=data.first_name,
                middle_name=data.middle_name,
                last_name=data.last_name,
                full_name=computed_full_name,
                registration_number=data.registration_number,
                state_medical_council=data.state_medical_council,
                qualification=data.qualification,
                specialization=data.specialization,
                years_of_experience=data.years_of_experience,
                designation=data.designation,
                areas_of_expertise=data.areas_of_expertise,
                bio=data.bio,
                phone=data.phone,
                gender=data.gender,
                date_of_birth=data.date_of_birth,
                profile_photo_url=data.profile_photo_url,
                city=data.city,
                state=data.state,
                country=data.country,
                pincode=data.pincode,
                clinic_address=data.clinic_address,
                verification_status=VerificationStatus.PENDING
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)
        return await cls.get_doctor_profile_me(db, user)

    @classmethod
    async def update_doctor_profile_partial(cls, db: AsyncSession, user: User, data: DoctorProfileUpdateIn) -> DoctorProfileOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        # If any name component updated, keep full_name synchronized
        name_parts = [p for p in [profile.name_prefix or "Dr.", profile.first_name, profile.middle_name, profile.last_name] if p and p.strip()]
        if (data.first_name is not None or data.last_name is not None or data.name_prefix is not None) and name_parts:
            profile.full_name = " ".join(name_parts).strip()
        elif data.full_name:
            profile.full_name = data.full_name
        await db.commit()
        await db.refresh(profile)
        return await cls.get_doctor_profile_me(db, user)

    @classmethod
    async def get_doctor_by_id(cls, db: AsyncSession, doctor_id: uuid.UUID) -> DoctorProfileOut:
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.id == doctor_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
        
        user_res = await db.execute(select(User).where(User.id == profile.user_id))
        user = user_res.scalar_one_or_none()
        completion = cls.calculate_profile_completion(profile)

        return DoctorProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            name_prefix=getattr(profile, "name_prefix", None) or "Dr.",
            first_name=getattr(profile, "first_name", None),
            middle_name=getattr(profile, "middle_name", None),
            last_name=getattr(profile, "last_name", None),
            full_name=profile.full_name,
            registration_number=profile.registration_number,
            state_medical_council=profile.state_medical_council,
            qualification=profile.qualification,
            specialization=profile.specialization,
            years_of_experience=profile.years_of_experience,
            designation=profile.designation,
            areas_of_expertise=profile.areas_of_expertise or [],
            bio=profile.bio,
            phone=profile.phone,
            gender=profile.gender,
            date_of_birth=profile.date_of_birth,
            profile_photo_url=profile.profile_photo_url,
            city=profile.city,
            state=profile.state,
            country=profile.country or "India",
            pincode=profile.pincode,
            clinic_address=profile.clinic_address,
            verification_status=profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            verification_remarks=profile.verification_remarks,
            verified_at=profile.verified_at,
            profile_completion_percentage=completion,
            email=user.email if user else None,
            created_at=profile.created_at
        )

    # ============================================================
    # VERIFICATION & DOCUMENTS
    # ============================================================
    @classmethod
    async def get_doctor_verification_status(cls, db: AsyncSession, user: User) -> DoctorVerificationStatusOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        docs_res = await db.execute(
            select(DoctorVerificationDocument)
            .where(DoctorVerificationDocument.doctor_id == profile.id)
            .order_by(DoctorVerificationDocument.uploaded_at.desc())
        )
        docs = list(docs_res.scalars().all())

        return DoctorVerificationStatusOut(
            doctor_id=profile.id,
            verification_status=profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            verification_remarks=profile.verification_remarks,
            verified_at=profile.verified_at,
            documents=[
                DoctorVerificationDocumentOut(
                    id=d.id,
                    doctor_id=d.doctor_id,
                    document_type=d.document_type,
                    document_name=d.document_name,
                    file_url=d.file_url,
                    file_name=d.file_name,
                    file_size_bytes=d.file_size_bytes,
                    mime_type=d.mime_type,
                    verification_status=d.verification_status.value if hasattr(d.verification_status, "value") else str(d.verification_status),
                    rejection_reason=d.rejection_reason,
                    uploaded_at=d.uploaded_at,
                    verified_at=d.verified_at
                ) for d in docs
            ]
        )

    @classmethod
    async def upload_doctor_document(cls, db: AsyncSession, user: User, data: DoctorVerificationDocumentIn) -> DoctorVerificationDocumentOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        doc = DoctorVerificationDocument(
            doctor_id=profile.id,
            document_type=data.document_type,
            document_name=data.document_name,
            file_url=data.file_url,
            file_name=data.file_name,
            file_size_bytes=data.file_size_bytes,
            mime_type=data.mime_type,
            verification_status=VerificationStatus.PENDING
        )
        db.add(doc)
        
        # Auto advance doctor profile state if unverified
        if profile.verification_status in [VerificationStatus.UNVERIFIED, VerificationStatus.REJECTED]:
            profile.verification_status = VerificationStatus.PENDING
            
        await db.commit()
        await db.refresh(doc)
        
        return DoctorVerificationDocumentOut(
            id=doc.id,
            doctor_id=doc.doctor_id,
            document_type=doc.document_type,
            document_name=doc.document_name,
            file_url=doc.file_url,
            file_name=doc.file_name,
            file_size_bytes=doc.file_size_bytes,
            mime_type=doc.mime_type,
            verification_status=doc.verification_status.value if hasattr(doc.verification_status, "value") else str(doc.verification_status),
            rejection_reason=doc.rejection_reason,
            uploaded_at=doc.uploaded_at,
            verified_at=doc.verified_at
        )

    @classmethod
    async def delete_doctor_document(cls, db: AsyncSession, user: User, doc_id: uuid.UUID) -> bool:
        profile = await cls.get_or_create_doctor_profile(db, user)
        res = await db.execute(
            select(DoctorVerificationDocument).where(
                DoctorVerificationDocument.id == doc_id,
                DoctorVerificationDocument.doctor_id == profile.id
            )
        )
        doc = res.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        await db.delete(doc)
        await db.commit()
        return True

    @classmethod
    async def submit_doctor_verification(cls, db: AsyncSession, user: User, data: DoctorVerificationSubmitIn) -> DoctorVerificationStatusOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        profile.verification_status = VerificationStatus.PENDING
        if data.notes:
            profile.verification_remarks = f"Doctor Submission Note: {data.notes}"
        await db.commit()
        await db.refresh(profile)
        return await cls.get_doctor_verification_status(db, user)

    @classmethod
    async def verify_doctor(cls, db: AsyncSession, admin_user: User, doctor_profile_id: uuid.UUID, approve: bool, remarks: Optional[str] = None) -> DoctorProfileOut:
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can verify doctors")

        result = await db.execute(select(DoctorProfile).where(DoctorProfile.id == doctor_profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")

        # Anti-self-verification guard
        if profile.user_id == admin_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctors cannot verify their own profile")

        profile.verification_status = VerificationStatus.VERIFIED if approve else VerificationStatus.REJECTED
        profile.verified_at = datetime.now(timezone.utc)
        profile.verified_by_user_id = admin_user.id
        if remarks:
            profile.verification_remarks = remarks

        # Update all pending documents
        docs_res = await db.execute(
            select(DoctorVerificationDocument).where(DoctorVerificationDocument.doctor_id == profile.id)
        )
        for d in docs_res.scalars().all():
            if d.verification_status == VerificationStatus.PENDING:
                d.verification_status = VerificationStatus.VERIFIED if approve else VerificationStatus.REJECTED
                d.verified_at = datetime.now(timezone.utc)
                if not approve and remarks:
                    d.rejection_reason = remarks

        await db.commit()
        await db.refresh(profile)
        
        user_res = await db.execute(select(User).where(User.id == profile.user_id))
        doc_user = user_res.scalar_one_or_none()
        if doc_user:
            return await cls.get_doctor_profile_me(db, doc_user)
        return await cls.get_doctor_by_id(db, profile.id)

    # ============================================================
    # CLINIC & HOSPITAL MANAGEMENT
    # ============================================================
    @classmethod
    async def list_doctor_clinics(cls, db: AsyncSession, user: User) -> List[ClinicProfileOut]:
        profile = await cls.get_or_create_doctor_profile(db, user)
        res = await db.execute(
            select(ClinicHospitalProfile)
            .where(ClinicHospitalProfile.owner_doctor_id == profile.id)
            .order_by(ClinicHospitalProfile.created_at.desc())
        )
        clinics = list(res.scalars().all())
        return [
            ClinicProfileOut(
                id=c.id,
                owner_doctor_id=c.owner_doctor_id,
                name=c.name,
                organization_type=c.organization_type,
                description=c.description,
                address=c.address,
                city=c.city,
                state=c.state,
                country=c.country or "India",
                pincode=c.pincode,
                phone=c.phone,
                email=c.email,
                website_url=c.website_url,
                services_offered=c.services_offered or [],
                facilities=c.facilities or [],
                working_hours=c.working_hours,
                bed_capacity=c.bed_capacity,
                is_verified=c.is_verified,
                created_at=c.created_at
            ) for c in clinics
        ]

    @classmethod
    async def create_clinic(cls, db: AsyncSession, user: User, data: ClinicProfileCreateIn) -> ClinicProfileOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        clinic = ClinicHospitalProfile(
            owner_doctor_id=profile.id,
            name=data.name,
            organization_type=data.organization_type,
            description=data.description,
            address=data.address,
            city=data.city,
            state=data.state,
            country=data.country,
            pincode=data.pincode,
            phone=data.phone,
            email=data.email,
            website_url=data.website_url,
            services_offered=data.services_offered,
            facilities=data.facilities,
            working_hours=data.working_hours,
            bed_capacity=data.bed_capacity,
            is_verified=True if profile.verification_status == VerificationStatus.VERIFIED else False
        )
        db.add(clinic)
        await db.commit()
        await db.refresh(clinic)
        return ClinicProfileOut(
            id=clinic.id,
            owner_doctor_id=clinic.owner_doctor_id,
            name=clinic.name,
            organization_type=clinic.organization_type,
            description=clinic.description,
            address=clinic.address,
            city=clinic.city,
            state=clinic.state,
            country=clinic.country,
            pincode=clinic.pincode,
            phone=clinic.phone,
            email=clinic.email,
            website_url=clinic.website_url,
            services_offered=clinic.services_offered,
            facilities=clinic.facilities,
            working_hours=clinic.working_hours,
            bed_capacity=clinic.bed_capacity,
            is_verified=clinic.is_verified,
            created_at=clinic.created_at
        )

    @classmethod
    async def update_clinic(cls, db: AsyncSession, user: User, clinic_id: uuid.UUID, data: ClinicProfileUpdateIn) -> ClinicProfileOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        res = await db.execute(
            select(ClinicHospitalProfile).where(
                ClinicHospitalProfile.id == clinic_id,
                ClinicHospitalProfile.owner_doctor_id == profile.id
            )
        )
        clinic = res.scalar_one_or_none()
        if not clinic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic profile not found")

        update_dict = data.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            setattr(clinic, k, v)

        await db.commit()
        await db.refresh(clinic)
        return ClinicProfileOut(
            id=clinic.id,
            owner_doctor_id=clinic.owner_doctor_id,
            name=clinic.name,
            organization_type=clinic.organization_type,
            description=clinic.description,
            address=clinic.address,
            city=clinic.city,
            state=clinic.state,
            country=clinic.country,
            pincode=clinic.pincode,
            phone=clinic.phone,
            email=clinic.email,
            website_url=clinic.website_url,
            services_offered=clinic.services_offered,
            facilities=clinic.facilities,
            working_hours=clinic.working_hours,
            bed_capacity=clinic.bed_capacity,
            is_verified=clinic.is_verified,
            created_at=clinic.created_at
        )

    @classmethod
    async def delete_clinic(cls, db: AsyncSession, user: User, clinic_id: uuid.UUID) -> bool:
        profile = await cls.get_or_create_doctor_profile(db, user)
        res = await db.execute(
            select(ClinicHospitalProfile).where(
                ClinicHospitalProfile.id == clinic_id,
                ClinicHospitalProfile.owner_doctor_id == profile.id
            )
        )
        clinic = res.scalar_one_or_none()
        if not clinic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
        
        await db.delete(clinic)
        await db.commit()
        return True

    # ============================================================
    # DASHBOARD SUMMARY
    # ============================================================
    @classmethod
    async def get_doctor_dashboard_summary(cls, db: AsyncSession, user: User) -> DoctorDashboardSummaryOut:
        profile = await cls.get_or_create_doctor_profile(db, user)
        completion = cls.calculate_profile_completion(profile)

        # 1. Real database queries for statistics
        # Internships
        internships_res = await db.execute(
            select(InternshipPosting).where(InternshipPosting.employer_user_id == user.id)
        )
        internships = list(internships_res.scalars().all())
        total_internships = len(internships)
        active_internships = sum(1 for i in internships if i.status == "OPEN")
        completed_internships = sum(1 for i in internships if i.status in ["CLOSED", "FILLED"])

        internship_ids = [i.id for i in internships]

        # Applications
        applications = []
        if internship_ids:
            apps_res = await db.execute(
                select(InternshipApplication)
                .where(InternshipApplication.internship_id.in_(internship_ids))
                .order_by(InternshipApplication.applied_at.desc())
            )
            applications = list(apps_res.scalars().all())

        total_apps = len(applications)
        shortlisted_apps = sum(1 for a in applications if a.status == "SHORTLISTED")
        active_students = sum(1 for a in applications if a.status in ["SELECTED", "IN_PROGRESS", "ACCEPTED"])

        # Sessions
        sessions_res = await db.execute(
            select(DoctorStudentSession)
            .where(DoctorStudentSession.doctor_user_id == user.id)
            .order_by(DoctorStudentSession.scheduled_date.asc())
        )
        sessions = list(sessions_res.scalars().all())
        today = date.today()
        upcoming_sessions_list = [s for s in sessions if s.status in ["SCHEDULED", "CONFIRMED"] and s.scheduled_date >= today]
        upcoming_sessions_count = len(upcoming_sessions_list)

        # Clinics
        clinics_res = await db.execute(
            select(func.count(ClinicHospitalProfile.id)).where(ClinicHospitalProfile.owner_doctor_id == profile.id)
        )
        clinics_count = clinics_res.scalar() or 0

        # Recent Applications formatting
        recent_apps_out = []
        for app in applications[:5]:
            # Fetch student profile name
            st_res = await db.execute(select(StudentProfile).where(StudentProfile.id == app.student_id))
            st = st_res.scalar_one_or_none()
            
            # Fetch internship title
            int_res = await db.execute(select(InternshipPosting).where(InternshipPosting.id == app.internship_id))
            int_post = int_res.scalar_one_or_none()

            recent_apps_out.append(
                RecentApplicationSummary(
                    id=app.id,
                    student_name=st.full_name if st else "Ayurveda Student",
                    student_college=getattr(st, "college_name", None) if st else None,
                    internship_title=int_post.title if int_post else "Clinical Internship",
                    applied_at=app.applied_at,
                    status=app.status
                )
            )

        # Upcoming Sessions formatting
        upcoming_sessions_out = []
        for s in upcoming_sessions_list[:5]:
            st_user_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == s.student_user_id))
            st_profile = st_user_res.scalar_one_or_none()
            upcoming_sessions_out.append(
                UpcomingSessionSummary(
                    id=s.id,
                    student_name=st_profile.full_name if st_profile else "Mentee Student",
                    session_title=s.title,
                    scheduled_date=s.scheduled_date,
                    start_time=s.start_time,
                    session_type=s.session_type,
                    meeting_mode=s.meeting_mode,
                    status=s.status
                )
            )

        # Recent Messages
        recent_msgs_res = await db.execute(
            select(DoctorMessage)
            .where(DoctorMessage.recipient_id == user.id)
            .order_by(DoctorMessage.created_at.desc())
            .limit(5)
        )
        recent_msgs = list(recent_msgs_res.scalars().all())
        recent_msgs_out = []
        for m in recent_msgs:
            sender_res = await db.execute(select(User).where(User.id == m.sender_id))
            snd = sender_res.scalar_one_or_none()
            sender_name = snd.email.split("@")[0].title() if snd else "User"
            
            # check student profile
            st_p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == m.sender_id))
            st_p = st_p_res.scalar_one_or_none()
            if st_p:
                sender_name = st_p.full_name

            recent_msgs_out.append(
                RecentMessageSummary(
                    id=m.id,
                    sender_name=sender_name,
                    content=m.content,
                    created_at=m.created_at,
                    is_read=m.is_read
                )
            )

        return DoctorDashboardSummaryOut(
            doctor_id=profile.id,
            doctor_name=profile.full_name,
            qualification=profile.qualification,
            specialization=profile.specialization,
            years_of_experience=profile.years_of_experience,
            profile_completion_percentage=completion,
            verification_status=profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            active_internships_count=active_internships,
            total_internships_count=total_internships,
            applications_count=total_apps,
            shortlisted_students_count=shortlisted_apps,
            active_students_count=active_students,
            upcoming_sessions_count=upcoming_sessions_count,
            completed_internships_count=completed_internships,
            clinics_count=clinics_count,
            recent_applications=recent_apps_out,
            upcoming_sessions=upcoming_sessions_out,
            recent_messages=recent_msgs_out
        )

    # ============================================================
    # MESSAGING
    # ============================================================
    @classmethod
    async def send_doctor_message(cls, db: AsyncSession, sender: User, data: DoctorMessageIn) -> DoctorMessageOut:
        msg = DoctorMessage(
            sender_id=sender.id,
            recipient_id=data.recipient_id,
            content=data.content,
            is_read=False
        )
        db.add(msg)

        # Create in-app notification for recipient
        sender_name = sender.email.split("@")[0].title()
        if sender.role == UserRole.DOCTOR:
            doc_p = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == sender.id))
            doc = doc_p.scalar_one_or_none()
            if doc:
                sender_name = f"Dr. {doc.full_name}"
        elif sender.role == UserRole.STUDENT:
            st_p = await db.execute(select(StudentProfile).where(StudentProfile.user_id == sender.id))
            st = st_p.scalar_one_or_none()
            if st:
                sender_name = st.full_name

        notif = AppNotification(
            recipient_id=data.recipient_id,
            title=f"New message from {sender_name}",
            message=data.content[:120] + ("..." if len(data.content) > 120 else ""),
            notification_type="MESSAGE",
            action_url="/doctor/messages" if sender.role == UserRole.STUDENT else "/student/messages"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(msg)
        return DoctorMessageOut(
            id=msg.id,
            sender_id=msg.sender_id,
            recipient_id=msg.recipient_id,
            content=msg.content,
            is_read=msg.is_read,
            read_at=msg.read_at,
            created_at=msg.created_at
        )

    @classmethod
    async def list_conversations(cls, db: AsyncSession, current_user: User) -> List[ConversationSummaryOut]:
        # Get all distinct conversation partners
        messages_res = await db.execute(
            select(DoctorMessage).where(
                or_(
                    DoctorMessage.sender_id == current_user.id,
                    DoctorMessage.recipient_id == current_user.id
                )
            ).order_by(DoctorMessage.created_at.desc())
        )
        all_msgs = list(messages_res.scalars().all())

        partner_ids = set()
        partner_last_msg: Dict[uuid.UUID, DoctorMessage] = {}
        unread_map: Dict[uuid.UUID, int] = {}

        for m in all_msgs:
            partner_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
            if partner_id not in partner_ids:
                partner_ids.add(partner_id)
                partner_last_msg[partner_id] = m
                unread_map[partner_id] = 0

            if m.recipient_id == current_user.id and not m.is_read:
                unread_map[partner_id] = unread_map.get(partner_id, 0) + 1

        conversations = []
        for pid in partner_ids:
            u_res = await db.execute(select(User).where(User.id == pid))
            partner_user = u_res.scalar_one_or_none()
            if not partner_user:
                continue

            name = partner_user.email.split("@")[0].title()
            subtitle = partner_user.role.value
            avatar = None

            if partner_user.role == UserRole.DOCTOR:
                d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == pid))
                dp = d_res.scalar_one_or_none()
                if dp:
                    name = f"Dr. {dp.full_name}"
                    subtitle = f"{dp.qualification} • {dp.specialization}"
                    avatar = dp.profile_photo_url
            elif partner_user.role == UserRole.STUDENT:
                s_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == pid))
                sp = s_res.scalar_one_or_none()
                if sp:
                    name = sp.full_name
                    subtitle = getattr(sp, "degree_program", None) or getattr(sp, "course", None) or "BAMS Student"
                    avatar = getattr(sp, "profile_photo_url", None)

            last_m = partner_last_msg[pid]
            conversations.append(
                ConversationSummaryOut(
                    other_user_id=pid,
                    other_user_name=name,
                    other_user_role=partner_user.role.value,
                    other_user_avatar=avatar,
                    other_user_subtitle=subtitle,
                    last_message=last_m.content,
                    last_message_at=last_m.created_at,
                    unread_count=unread_map.get(pid, 0)
                )
            )

        return sorted(conversations, key=lambda c: c.last_message_at, reverse=True)

    @classmethod
    async def list_conversation(cls, db: AsyncSession, user_a: uuid.UUID, user_b: uuid.UUID) -> List[DoctorMessageOut]:
        query = select(DoctorMessage).where(
            or_(
                and_(DoctorMessage.sender_id == user_a, DoctorMessage.recipient_id == user_b),
                and_(DoctorMessage.sender_id == user_b, DoctorMessage.recipient_id == user_a)
            )
        ).order_by(DoctorMessage.created_at.asc())
        result = await db.execute(query)
        messages = list(result.scalars().all())

        # Mark messages received by user_a as read
        now = datetime.now(timezone.utc)
        updated = False
        for m in messages:
            if m.recipient_id == user_a and not m.is_read:
                m.is_read = True
                m.read_at = now
                updated = True
        
        if updated:
            await db.commit()

        return [
            DoctorMessageOut(
                id=m.id,
                sender_id=m.sender_id,
                recipient_id=m.recipient_id,
                content=m.content,
                is_read=m.is_read,
                read_at=m.read_at,
                created_at=m.created_at
            ) for m in messages
        ]

    # ============================================================
    # SESSIONS
    # ============================================================
    @classmethod
    async def create_session(cls, db: AsyncSession, current_user: User, data: DoctorSessionCreateIn) -> DoctorSessionOut:
        # If doctor creating session with student
        doctor_user_id = data.doctor_user_id or current_user.id
        student_user_id = data.student_user_id

        if not student_user_id and current_user.role == UserRole.STUDENT:
            student_user_id = current_user.id
        elif not student_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student user ID is required")

        sess = DoctorStudentSession(
            doctor_user_id=doctor_user_id,
            student_user_id=student_user_id,
            title=data.title,
            purpose=data.purpose,
            session_type=data.session_type,
            meeting_mode=data.meeting_mode,
            meeting_link=data.meeting_link,
            location=data.location,
            scheduled_date=data.scheduled_date,
            start_time=data.start_time,
            end_time=data.end_time,
            duration_minutes=data.duration_minutes,
            notes=data.notes,
            status="SCHEDULED" if current_user.role == UserRole.DOCTOR else "REQUESTED"
        )
        db.add(sess)

        # Notify recipient
        recipient_id = student_user_id if current_user.id == doctor_user_id else doctor_user_id
        notif = AppNotification(
            recipient_id=recipient_id,
            title=f"New Mentorship Session Scheduled: {data.title}",
            message=f"Date: {data.scheduled_date} at {data.start_time} ({data.meeting_mode})",
            notification_type="SESSION",
            action_url="/doctor/sessions" if recipient_id == doctor_user_id else "/student/sessions"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(sess)
        return await cls._format_session_out(db, sess)

    @classmethod
    async def request_session(cls, db: AsyncSession, student: User, data: DoctorSessionRequestIn) -> DoctorSessionOut:
        sess = DoctorStudentSession(
            doctor_user_id=data.doctor_user_id,
            student_user_id=student.id,
            title=f"Clinical Mentorship - {data.purpose}",
            purpose=data.purpose,
            session_type=data.session_type or "Clinical Mentorship",
            meeting_mode=data.meeting_mode or "Online",
            scheduled_date=data.scheduled_date,
            start_time=data.start_time,
            duration_minutes=data.duration_minutes,
            notes=data.notes,
            status="REQUESTED"
        )
        db.add(sess)

        notif = AppNotification(
            recipient_id=data.doctor_user_id,
            title="New Mentorship Request Received",
            message=f"Student requested session for {data.purpose} on {data.scheduled_date}",
            notification_type="SESSION_REQUEST",
            action_url="/doctor/sessions"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(sess)
        return await cls._format_session_out(db, sess)

    @classmethod
    async def list_sessions(cls, db: AsyncSession, current_user: User, status_filter: Optional[str] = None) -> List[DoctorSessionOut]:
        query = select(DoctorStudentSession).where(
            or_(
                DoctorStudentSession.doctor_user_id == current_user.id,
                DoctorStudentSession.student_user_id == current_user.id
            )
        )
        if status_filter and status_filter != "ALL":
            query = query.where(DoctorStudentSession.status == status_filter)

        query = query.order_by(DoctorStudentSession.scheduled_date.desc(), DoctorStudentSession.created_at.desc())
        res = await db.execute(query)
        sessions = list(res.scalars().all())

        out = []
        for s in sessions:
            out.append(await cls._format_session_out(db, s))
        return out

    @classmethod
    async def update_session_status(cls, db: AsyncSession, current_user: User, session_id: uuid.UUID, data: DoctorSessionStatusUpdateIn) -> DoctorSessionOut:
        res = await db.execute(select(DoctorStudentSession).where(DoctorStudentSession.id == session_id))
        sess = res.scalar_one_or_none()
        if not sess:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        if current_user.id not in [sess.doctor_user_id, sess.student_user_id] and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify this session")

        sess.status = data.status
        if data.cancellation_reason:
            sess.cancellation_reason = data.cancellation_reason
        if data.meeting_link:
            sess.meeting_link = data.meeting_link

        # Notify other party
        other_user_id = sess.student_user_id if current_user.id == sess.doctor_user_id else sess.doctor_user_id
        notif = AppNotification(
            recipient_id=other_user_id,
            title=f"Session Update: {sess.title} is now {data.status}",
            message=f"Status changed to {data.status}. " + (f"Reason: {data.cancellation_reason}" if data.cancellation_reason else ""),
            notification_type="SESSION_UPDATE",
            action_url="/doctor/sessions" if other_user_id == sess.doctor_user_id else "/student/sessions"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(sess)
        return await cls._format_session_out(db, sess)

    @classmethod
    async def _format_session_out(cls, db: AsyncSession, s: DoctorStudentSession) -> DoctorSessionOut:
        doc_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == s.doctor_user_id))
        doc = doc_res.scalar_one_or_none()
        
        st_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == s.student_user_id))
        st = st_res.scalar_one_or_none()

        return DoctorSessionOut(
            id=s.id,
            doctor_user_id=s.doctor_user_id,
            student_user_id=s.student_user_id,
            doctor_name=f"Dr. {doc.full_name}" if doc else "Ayurvedic Doctor",
            student_name=st.full_name if st else "Ayurveda Student",
            title=s.title,
            purpose=s.purpose,
            session_type=s.session_type,
            meeting_mode=s.meeting_mode,
            meeting_link=s.meeting_link,
            location=s.location,
            scheduled_date=s.scheduled_date,
            start_time=s.start_time,
            end_time=s.end_time,
            duration_minutes=s.duration_minutes,
            notes=s.notes,
            status=s.status,
            cancellation_reason=s.cancellation_reason,
            created_at=s.created_at
        )

    # ============================================================
    # NGO LOGIC (Preserved)
    # ============================================================
    @classmethod
    async def create_or_update_ngo_profile(cls, db: AsyncSession, user: User, data: NGOProfileCreateIn) -> NGOProfile:
        result = await db.execute(select(NGOProfile).where(NGOProfile.user_id == user.id))
        profile = result.scalar_one_or_none()

        if profile:
            profile.name = data.name
            profile.darpan_id = data.darpan_id
            profile.registration_number = data.registration_number
            profile.description = data.description
            profile.service_areas = data.service_areas
            profile.contact_person = data.contact_person
            profile.email = data.email
            profile.phone = data.phone
            profile.website_url = data.website_url
            profile.city = data.city
            profile.state = data.state
            profile.address = data.address
            profile.pincode = data.pincode
        else:
            profile = NGOProfile(
                user_id=user.id,
                name=data.name,
                darpan_id=data.darpan_id,
                registration_number=data.registration_number,
                description=data.description,
                service_areas=data.service_areas,
                contact_person=data.contact_person,
                email=data.email,
                phone=data.phone,
                website_url=data.website_url,
                city=data.city,
                state=data.state,
                address=data.address,
                pincode=data.pincode,
                verification_status=VerificationStatus.PENDING
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)
        return profile

    @classmethod
    async def get_ngo_profile_me(cls, db: AsyncSession, user: User) -> NGOProfile:
        result = await db.execute(select(NGOProfile).where(NGOProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO profile not found.")
        return profile

    @classmethod
    async def verify_ngo(cls, db: AsyncSession, admin_user: User, ngo_profile_id: uuid.UUID, approve: bool) -> NGOProfile:
        if admin_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can verify NGOs")

        result = await db.execute(select(NGOProfile).where(NGOProfile.id == ngo_profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO profile not found")

        if profile.user_id == admin_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="NGO founders cannot verify their own NGO profile")

        profile.verification_status = VerificationStatus.VERIFIED if approve else VerificationStatus.REJECTED
        profile.verified_at = datetime.now(timezone.utc)
        profile.verified_by_user_id = admin_user.id

        await db.commit()
        await db.refresh(profile)
        return profile
