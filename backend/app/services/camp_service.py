import uuid
import hashlib
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.camps import (
    HealthcareCamp,
    CampAttendeeRegistration,
    CampVolunteerApplication,
    CampScheduleItem,
    CampAttendanceRecord,
    CampParticipationCertificate,
    FinalCampReport,
    CampVolunteerEvaluation,
    CampStudentReview,
    CampCoordinationTask,
    CampBroadcastMessage,
    AppNotification
)
from app.schemas.camps import (
    CampCreateIn,
    CampUpdateIn,
    CampRegisterAttendeeIn,
    VolunteerApplyIn,
    VolunteerReviewIn,
    ScheduleItemIn,
    AttendanceLogItemIn,
    FinalCampReportIn,
    CoordinationTaskIn,
    BroadcastMessageIn
)

ALLOWED_CAMP_SERVICES = {
    "General health checkup",
    "Ayurveda consultation",
    "Panchakarma awareness",
    "Lifestyle counselling",
    "Yoga/wellness",
    "Nadi Pariksha examination",
    "Suvarnaprashan administration",
    "Herbal formulation distribution",
    "Prakriti analysis"
}

PROHIBITED_KEYWORDS = ["surgery", "invasive", "allopathic injection", "allopathic prescription", "clinical trial without ethics"]

class CampService:

    @classmethod
    def validate_services(cls, services: List[str]):
        for s in services:
            lower_s = s.lower()
            for bad in PROHIBITED_KEYWORDS:
                if bad in lower_s:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Prohibited medical service detected: '{s}'. Only approved AYUSH preventive consultations are permitted."
                    )

    @classmethod
    async def create_camp(cls, db: AsyncSession, user: User, data: CampCreateIn) -> HealthcareCamp:
        cls.validate_services(data.services_offered)

        camp = HealthcareCamp(
            organizer_id=user.id,
            organizer_name=data.venue_name if not user.email else user.email.split("@")[0].title(),
            organizer_type="NGO" if user.role == UserRole.NGO else "DOCTOR" if user.role == UserRole.DOCTOR else "INSTITUTION",
            title=data.title,
            description=data.description,
            camp_date=data.camp_date,
            start_time=data.start_time,
            end_time=data.end_time,
            venue_name=data.venue_name,
            address=data.address,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            capacity=data.capacity,
            services_offered=data.services_offered,
            doctors_attending=data.doctors_attending,
            contact_phone=data.contact_phone,
            contact_email=data.contact_email,
            status="UPCOMING"
        )
        db.add(camp)
        await db.commit()
        await db.refresh(camp)
        return camp

    @classmethod
    async def list_camps(
        cls,
        db: AsyncSession,
        city: Optional[str] = None,
        state: Optional[str] = None,
        status_filter: Optional[str] = None,
        service: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[HealthcareCamp]:
        query = select(HealthcareCamp)
        filters = []
        if city:
            filters.append(func.lower(HealthcareCamp.city) == city.lower())
        if state:
            filters.append(func.lower(HealthcareCamp.state) == state.lower())
        if status_filter:
            filters.append(HealthcareCamp.status == status_filter.upper())
        if search:
            filters.append(HealthcareCamp.title.ilike(f"%{search}%"))

        if filters:
            query = query.where(and_(*filters))

        query = query.order_by(HealthcareCamp.camp_date.asc())
        result = await db.execute(query)
        camps = result.scalars().all()

        if service:
            camps = [c for c in camps if any(service.lower() in s.lower() for s in (c.services_offered or []))]

        return list(camps)

    @classmethod
    async def get_camp(cls, db: AsyncSession, camp_id: uuid.UUID) -> HealthcareCamp:
        result = await db.execute(select(HealthcareCamp).where(HealthcareCamp.id == camp_id))
        camp = result.scalar_one_or_none()
        if not camp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Healthcare camp not found")
        return camp

    @classmethod
    async def register_attendee(cls, db: AsyncSession, camp_id: uuid.UUID, data: CampRegisterAttendeeIn) -> CampAttendeeRegistration:
        camp = await cls.get_camp(db, camp_id)
        if camp.status != "UPCOMING" and camp.status != "ONGOING":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot register for camp with status {camp.status}")

        if camp.registered_attendees_count >= camp.capacity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Camp has reached maximum attendee capacity")

        reg = CampAttendeeRegistration(
            camp_id=camp.id,
            attendee_name=data.attendee_name,
            phone=data.phone,
            email=data.email,
            age=data.age,
            gender=data.gender,
            preferred_service=data.preferred_service
        )
        db.add(reg)
        camp.registered_attendees_count += 1
        await db.commit()
        await db.refresh(reg)
        return reg

    @classmethod
    async def apply_volunteer(cls, db: AsyncSession, user: User, camp_id: uuid.UUID, data: VolunteerApplyIn) -> CampVolunteerApplication:
        camp = await cls.get_camp(db, camp_id)
        
        # Check existing application
        existing = await db.execute(
            select(CampVolunteerApplication).where(
                and_(CampVolunteerApplication.camp_id == camp_id, CampVolunteerApplication.user_id == user.id)
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already applied/registered for this camp")

        app = CampVolunteerApplication(
            camp_id=camp.id,
            user_id=user.id,
            user_role=user.role,
            applicant_name=data.applicant_name,
            email=data.email,
            phone=data.phone,
            specialization_or_course=data.specialization_or_course,
            role_applied_for=data.role_applied_for,
            motivation_note=data.motivation_note,
            status="APPLIED"
        )
        db.add(app)
        await db.commit()
        await db.refresh(app)
        return app

    @classmethod
    async def review_volunteer(cls, db: AsyncSession, reviewer: User, app_id: uuid.UUID, data: VolunteerReviewIn) -> CampVolunteerApplication:
        result = await db.execute(select(CampVolunteerApplication).where(CampVolunteerApplication.id == app_id))
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer application not found")

        app.status = data.decision.upper()
        if data.assigned_duty:
            app.assigned_duty = data.assigned_duty
        if data.rejection_reason:
            app.rejection_reason = data.rejection_reason
        app.reviewed_by = reviewer.id
        app.reviewed_at = datetime.now(timezone.utc)

        # Dispatch in-app notification
        notif = AppNotification(
            recipient_id=app.user_id,
            title=f"Camp Application {app.status.title()}",
            message=f"Your volunteer application for camp duty has been {app.status.lower()}.",
            notification_type="CAMP_SELECTION" if app.status == "SELECTED" else "CAMP_REJECTION",
            action_url=f"/camps/{app.camp_id}"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(app)
        return app

    @classmethod
    async def record_attendance(cls, db: AsyncSession, user: User, camp_id: uuid.UUID, data: AttendanceLogItemIn) -> CampAttendanceRecord:
        camp = await cls.get_camp(db, camp_id)
        if camp.organizer_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the camp organizer or admin can log volunteer attendance")

        # Anti-self-attendance guard
        if data.user_id == user.id and user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organizers/supervisors cannot record their own student attendance")

        record = CampAttendanceRecord(
            camp_id=camp.id,
            user_id=data.user_id,
            volunteer_name=data.volunteer_name,
            date=data.date,
            check_in_time=data.check_in_time,
            check_out_time=data.check_out_time,
            verified_hours=max(data.verified_hours, 0.0),
            attendance_status=data.attendance_status,
            supervisor_notes=data.supervisor_notes,
            verified_by_user_id=user.id
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    @classmethod
    async def issue_certificate(cls, db: AsyncSession, organizer: User, camp_id: uuid.UUID, user_id: uuid.UUID, recipient_name: str, role_performed: str, hours: float) -> CampParticipationCertificate:
        camp = await cls.get_camp(db, camp_id)
        token = f"camp-cert-{uuid.uuid4().hex[:12]}"
        raw_payload = f"{camp.title}:{recipient_name}:{hours}:{token}:{datetime.now(timezone.utc).isoformat()}"
        cert_hash = hashlib.sha256(raw_payload.encode()).hexdigest()

        cert = CampParticipationCertificate(
            camp_id=camp.id,
            user_id=user_id,
            certificate_token=token,
            certificate_hash=cert_hash,
            recipient_name=recipient_name,
            camp_title=camp.title,
            organizer_name=camp.organizer_name,
            role_performed=role_performed,
            hours_served=hours,
            is_valid=True
        )
        db.add(cert)

        # Notify student
        notif = AppNotification(
            recipient_id=user_id,
            title="Camp Participation Certificate Ready!",
            message=f"Your verified certificate for {camp.title} ({hours} hours) is now available.",
            notification_type="CERTIFICATE_AVAILABLE",
            action_url="/volunteer/certificates"
        )
        db.add(notif)

        await db.commit()
        await db.refresh(cert)
        return cert

    @classmethod
    async def submit_final_report(cls, db: AsyncSession, organizer: User, camp_id: uuid.UUID, data: FinalCampReportIn) -> FinalCampReport:
        camp = await cls.get_camp(db, camp_id)
        if camp.organizer_id != organizer.id and organizer.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the camp organizer can submit the final camp report")

        report = FinalCampReport(
            camp_id=camp.id,
            total_beneficiaries_served=data.total_beneficiaries_served,
            men_count=data.men_count,
            women_count=data.women_count,
            children_count=data.children_count,
            seniors_count=data.seniors_count,
            services_delivered_breakdown=data.services_delivered_breakdown,
            common_diagnoses=data.common_diagnoses,
            total_doctors_participated=data.total_doctors_participated,
            total_volunteers_participated=data.total_volunteers_participated,
            total_volunteer_hours_logged=data.total_volunteer_hours_logged,
            executive_summary=data.executive_summary,
            challenges_faced=data.challenges_faced,
            followup_recommendations=data.followup_recommendations,
            evidence_photo_urls=data.evidence_photo_urls
        )
        db.add(report)
        camp.status = "COMPLETED"
        await db.commit()
        await db.refresh(report)
        return report
