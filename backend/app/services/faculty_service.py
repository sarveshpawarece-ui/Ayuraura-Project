import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload, joinedload
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import (
    FacultyProfile,
    InstitutionProfile,
    Department,
    EducationalResource,
    LectureSchedule,
    StudentProfile,
    StudentInstitutionMembership,
    MembershipStatus,
    VerificationStatus
)
from app.schemas.faculty import (
    FacultyProfileUpdateIn,
    FacultySubjectAssignIn,
    EducationalResourceCreateIn,
    EducationalResourceUpdateIn,
    LectureScheduleCreateIn,
    LectureScheduleUpdateIn
)

def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


class FacultyService:

    @classmethod
    async def get_or_create_faculty_profile(
        cls, db: AsyncSession, user: User, institution_id: Optional[Any] = None
    ) -> FacultyProfile:
        stmt = select(FacultyProfile).options(
            selectinload(FacultyProfile.institution),
            selectinload(FacultyProfile.user)
        ).where(FacultyProfile.user_id == user.id)
        profile = (await db.execute(stmt)).scalar_one_or_none()

        if not profile:
            # If user has no faculty profile yet, check for an existing institution or first institution
            inst_uuid = None
            if institution_id:
                inst_uuid = _to_uuid(institution_id)
            else:
                first_inst = (await db.execute(select(InstitutionProfile))).scalars().first()
                if first_inst:
                    inst_uuid = first_inst.id
                else:
                    # Create default institution if none exists in dev
                    default_inst = InstitutionProfile(
                        user_id=user.id,
                        institution_name="National Institute of Ayurveda & BAMS College",
                        aishe_code="AISHE-DEFAULT-01",
                        state="Rajasthan",
                        city="Jaipur",
                        verification_status=VerificationStatus.VERIFIED
                    )
                    db.add(default_inst)
                    await db.commit()
                    await db.refresh(default_inst)
                    inst_uuid = default_inst.id

            email_name = user.email.split("@")[0].replace(".", " ").title()
            default_subjects = [
                {"id": "rachana_sharir", "name": "Rachana Sharir (Anatomy)", "academic_year": "1st Year"},
                {"id": "kriya_sharir", "name": "Kriya Sharir (Physiology)", "academic_year": "1st Year"},
                {"id": "dravyaguna", "name": "Dravyaguna Vijnana (Pharmacology)", "academic_year": "2nd Year"}
            ]
            profile = FacultyProfile(
                user_id=user.id,
                institution_id=inst_uuid,
                name_prefix="Prof.",
                full_name=f"Prof. {email_name}",
                department="Department of Samhita & Siddhanta",
                designation="Associate Professor",
                qualifications="MD (Ayurveda), BAMS",
                specialization="Ayurvedic Diagnostics & Brihat-trayi",
                assigned_subjects=default_subjects,
                assigned_academic_years=["1st Year", "2nd Year"],
                contact_email=user.email,
                is_active=True
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

        return profile

    @classmethod
    async def get_dashboard(cls, db: AsyncSession, user: User) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        inst_stmt = select(InstitutionProfile).where(InstitutionProfile.id == profile.institution_id)
        inst = (await db.execute(inst_stmt)).scalar_one_or_none()

        # Metrics
        res_count_stmt = select(func.count(EducationalResource.id)).where(EducationalResource.faculty_id == profile.id)
        total_resources = (await db.execute(res_count_stmt)).scalar() or 0

        lec_count_stmt = select(func.count(LectureSchedule.id)).where(
            LectureSchedule.faculty_id == profile.id,
            LectureSchedule.status == "SCHEDULED"
        )
        upcoming_lectures_count = (await db.execute(lec_count_stmt)).scalar() or 0

        # Enrolled students count in assigned academic years
        years = profile.assigned_academic_years or ["1st Year", "2nd Year"]
        stu_count_stmt = select(func.count(StudentProfile.id)).where(
            StudentProfile.institution_id == profile.institution_id
        )
        students_count = (await db.execute(stu_count_stmt)).scalar() or 0

        # Upcoming lectures
        lectures_stmt = (
            select(LectureSchedule)
            .where(LectureSchedule.faculty_id == profile.id)
            .order_by(LectureSchedule.scheduled_date.asc(), LectureSchedule.start_time.asc())
            .limit(5)
        )
        upcoming_lectures_raw = (await db.execute(lectures_stmt)).scalars().all()
        upcoming_lectures = [
            {
                "id": str(l.id),
                "institution_id": str(l.institution_id),
                "institution_name": inst.institution_name if inst else "Ayurvedic College",
                "faculty_id": str(l.faculty_id),
                "faculty_name": profile.full_name,
                "title": l.title,
                "subject_id": l.subject_id,
                "subject_name": l.subject_name,
                "academic_year": l.academic_year,
                "topic": l.topic,
                "session_type": l.session_type,
                "scheduled_date": str(l.scheduled_date),
                "start_time": l.start_time,
                "end_time": l.end_time,
                "venue_or_link": l.venue_or_link,
                "session_link": l.session_link,
                "recording_url": l.recording_url,
                "announcement": l.announcement,
                "status": l.status,
                "created_at": l.created_at
            }
            for l in upcoming_lectures_raw
        ]

        # Recent shared resources
        resources_stmt = (
            select(EducationalResource)
            .where(EducationalResource.faculty_id == profile.id)
            .order_by(EducationalResource.created_at.desc())
            .limit(6)
        )
        recent_resources_raw = (await db.execute(resources_stmt)).scalars().all()
        recent_resources = [
            {
                "id": str(r.id),
                "institution_id": str(r.institution_id),
                "institution_name": inst.institution_name if inst else "Ayurvedic College",
                "faculty_id": str(r.faculty_id),
                "faculty_name": profile.full_name,
                "title": r.title,
                "description": r.description,
                "resource_type": r.resource_type,
                "academic_year": r.academic_year,
                "subject_id": r.subject_id,
                "subject_name": r.subject_name,
                "unit_number": r.unit_number,
                "unit_name": r.unit_name,
                "topic_id": r.topic_id,
                "topic_name": r.topic_name,
                "class_or_batch": r.class_or_batch,
                "file_url": r.file_url,
                "content_text": r.content_text,
                "is_published": r.is_published,
                "is_ai_generated": r.is_ai_generated,
                "ai_disclaimer": r.ai_disclaimer,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            }
            for r in recent_resources_raw
        ]

        announcements = [
            {
                "id": "ann-1",
                "title": "NCISM Winter Examination Schedule & Practical Guidelines Released",
                "date": "2026-10-25",
                "department": "Academic Secretariat",
                "priority": "HIGH"
            },
            {
                "id": "ann-2",
                "title": "BAMS 2nd Year Dravyaguna Herbal Garden Field Posting",
                "date": "2026-10-28",
                "department": "Dravyaguna Department",
                "priority": "NORMAL"
            }
        ]

        faculty_profile_out = {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "institution_id": str(profile.institution_id),
            "institution_name": inst.institution_name if inst else "Ayurvedic Institution",
            "full_name": profile.full_name,
            "name_prefix": profile.name_prefix,
            "first_name": profile.first_name,
            "middle_name": profile.middle_name,
            "last_name": profile.last_name,
            "department": profile.department,
            "designation": profile.designation,
            "qualifications": profile.qualifications,
            "specialization": profile.specialization,
            "assigned_subjects": profile.assigned_subjects or [],
            "assigned_academic_years": profile.assigned_academic_years or [],
            "contact_email": profile.contact_email or user.email,
            "contact_phone": profile.contact_phone,
            "bio": profile.bio,
            "is_active": profile.is_active,
            "created_at": profile.created_at
        }

        return {
            "faculty_profile": faculty_profile_out,
            "institution": {
                "id": str(inst.id) if inst else "",
                "name": inst.institution_name if inst else "Ayurvedic College",
                "aishe_code": inst.aishe_code if inst else "",
                "verification_status": inst.verification_status.value if inst and hasattr(inst.verification_status, "value") else "PENDING"
            },
            "metrics": {
                "assigned_subjects_count": len(profile.assigned_subjects or []),
                "total_resources_count": total_resources,
                "upcoming_lectures_count": upcoming_lectures_count,
                "students_count": students_count
            },
            "assigned_subjects": profile.assigned_subjects or [],
            "upcoming_lectures": upcoming_lectures,
            "recent_resources": recent_resources,
            "announcements": announcements
        }

    @classmethod
    async def update_profile(
        cls, db: AsyncSession, user: User, update_data: FacultyProfileUpdateIn
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        if update_data.full_name is not None:
            profile.full_name = update_data.full_name.strip()
        if update_data.name_prefix is not None:
            profile.name_prefix = update_data.name_prefix.strip()
        if update_data.first_name is not None:
            profile.first_name = update_data.first_name.strip()
        if update_data.middle_name is not None:
            profile.middle_name = update_data.middle_name.strip()
        if update_data.last_name is not None:
            profile.last_name = update_data.last_name.strip()
        if update_data.department is not None:
            profile.department = update_data.department.strip()
        if update_data.designation is not None:
            profile.designation = update_data.designation.strip()
        if update_data.qualifications is not None:
            profile.qualifications = update_data.qualifications.strip()
        if update_data.specialization is not None:
            profile.specialization = update_data.specialization.strip()
        if update_data.contact_email is not None:
            profile.contact_email = str(update_data.contact_email)
        if update_data.contact_phone is not None:
            profile.contact_phone = update_data.contact_phone.strip()
        if update_data.bio is not None:
            profile.bio = update_data.bio.strip()

        profile.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "institution_id": str(profile.institution_id),
            "full_name": profile.full_name,
            "name_prefix": profile.name_prefix,
            "department": profile.department,
            "designation": profile.designation,
            "qualifications": profile.qualifications,
            "specialization": profile.specialization,
            "assigned_subjects": profile.assigned_subjects or [],
            "assigned_academic_years": profile.assigned_academic_years or [],
            "contact_email": profile.contact_email,
            "contact_phone": profile.contact_phone,
            "bio": profile.bio,
            "is_active": profile.is_active,
            "created_at": profile.created_at
        }

    # --- EDUCATIONAL MATERIAL SHARING (PHASE 3) ---
    @classmethod
    async def create_resource(
        cls, db: AsyncSession, user: User, data: EducationalResourceCreateIn
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        disclaimer = None
        if data.is_ai_generated:
            disclaimer = data.ai_disclaimer or "Generated with Aayuraura AI Faculty Assistant. Faculty reviewed for NCISM syllabus alignment."

        wf_status = (data.workflow_status.upper() if data.workflow_status else None) or ("PUBLISHED" if data.is_published else "DRAFT")
        is_pub = (wf_status == "PUBLISHED")

        resource = EducationalResource(
            institution_id=profile.institution_id,
            faculty_id=profile.id,
            title=data.title.strip(),
            description=data.description.strip() if data.description else None,
            resource_type=data.resource_type.upper(),
            academic_year=data.academic_year.strip(),
            subject_id=data.subject_id.strip(),
            subject_name=data.subject_name.strip(),
            unit_number=data.unit_number,
            unit_name=data.unit_name.strip() if data.unit_name else None,
            topic_id=data.topic_id.strip() if data.topic_id else None,
            topic_name=data.topic_name.strip() if data.topic_name else None,
            class_or_batch=data.class_or_batch.strip() if data.class_or_batch else "All",
            file_url=data.file_url.strip() if data.file_url else None,
            content_text=data.content_text,
            is_published=is_pub,
            is_ai_generated=data.is_ai_generated,
            ai_disclaimer=disclaimer
        )
        db.add(resource)
        await db.commit()
        await db.refresh(resource)

        inst_stmt = select(InstitutionProfile.institution_name).where(InstitutionProfile.id == profile.institution_id)
        inst_name = (await db.execute(inst_stmt)).scalar() or "Ayurvedic Institution"

        return {
            "id": str(resource.id),
            "institution_id": str(resource.institution_id),
            "institution_name": inst_name,
            "faculty_id": str(resource.faculty_id),
            "faculty_name": profile.full_name,
            "title": resource.title,
            "description": resource.description,
            "resource_type": resource.resource_type,
            "academic_year": resource.academic_year,
            "subject_id": resource.subject_id,
            "subject_name": resource.subject_name,
            "unit_number": resource.unit_number,
            "unit_name": resource.unit_name,
            "topic_id": resource.topic_id,
            "topic_name": resource.topic_name,
            "class_or_batch": resource.class_or_batch,
            "file_url": resource.file_url,
            "content_text": resource.content_text,
            "is_published": resource.is_published,
            "workflow_status": wf_status,
            "is_ai_generated": resource.is_ai_generated,
            "ai_disclaimer": resource.ai_disclaimer,
            "created_at": resource.created_at,
            "updated_at": resource.updated_at
        }

    @classmethod
    async def get_faculty_resources(
        cls,
        db: AsyncSession,
        user: User,
        academic_year: Optional[str] = None,
        subject_id: Optional[str] = None,
        resource_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        stmt = (
            select(EducationalResource, InstitutionProfile.institution_name)
            .join(InstitutionProfile, EducationalResource.institution_id == InstitutionProfile.id)
            .where(EducationalResource.faculty_id == profile.id)
            .order_by(EducationalResource.created_at.desc())
        )
        if academic_year:
            stmt = stmt.where(EducationalResource.academic_year == academic_year.strip())
        if subject_id:
            stmt = stmt.where(EducationalResource.subject_id == subject_id.strip())
        if resource_type:
            stmt = stmt.where(EducationalResource.resource_type == resource_type.upper().strip())

        rows = (await db.execute(stmt)).all()
        results = []
        for r, inst_name in rows:
            results.append({
                "id": str(r.id),
                "institution_id": str(r.institution_id),
                "institution_name": inst_name,
                "faculty_id": str(r.faculty_id),
                "faculty_name": profile.full_name,
                "title": r.title,
                "description": r.description,
                "resource_type": r.resource_type,
                "academic_year": r.academic_year,
                "subject_id": r.subject_id,
                "subject_name": r.subject_name,
                "unit_number": r.unit_number,
                "unit_name": r.unit_name,
                "topic_id": r.topic_id,
                "topic_name": r.topic_name,
                "class_or_batch": r.class_or_batch,
                "file_url": r.file_url,
                "content_text": r.content_text,
                "is_published": r.is_published,
                "is_ai_generated": r.is_ai_generated,
                "ai_disclaimer": r.ai_disclaimer,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            })
        return results

    @classmethod
    async def update_resource(
        cls, db: AsyncSession, user: User, resource_id: Any, update_data: EducationalResourceUpdateIn
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)
        r_id = _to_uuid(resource_id)

        stmt = select(EducationalResource).where(
            EducationalResource.id == r_id,
            EducationalResource.faculty_id == profile.id
        )
        resource = (await db.execute(stmt)).scalar_one_or_none()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or unauthorized")

        if update_data.title is not None:
            resource.title = update_data.title.strip()
        if update_data.description is not None:
            resource.description = update_data.description.strip()
        if update_data.resource_type is not None:
            resource.resource_type = update_data.resource_type.upper().strip()
        if update_data.academic_year is not None:
            resource.academic_year = update_data.academic_year.strip()
        if update_data.subject_id is not None:
            resource.subject_id = update_data.subject_id.strip()
        if update_data.subject_name is not None:
            resource.subject_name = update_data.subject_name.strip()
        if update_data.unit_number is not None:
            resource.unit_number = update_data.unit_number
        if update_data.unit_name is not None:
            resource.unit_name = update_data.unit_name.strip()
        if update_data.topic_name is not None:
            resource.topic_name = update_data.topic_name.strip()
        if update_data.class_or_batch is not None:
            resource.class_or_batch = update_data.class_or_batch.strip()
        if update_data.file_url is not None:
            resource.file_url = update_data.file_url.strip()
        if update_data.content_text is not None:
            resource.content_text = update_data.content_text
        if update_data.is_published is not None:
            resource.is_published = update_data.is_published

        resource.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(resource)

        return {"message": "Resource updated successfully.", "id": str(resource.id)}

    @classmethod
    async def update_resource_workflow(
        cls, db: AsyncSession, user: User, resource_id: Any, workflow_status: str, reviewer_feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        r_id = _to_uuid(resource_id)
        stmt = select(EducationalResource).where(EducationalResource.id == r_id)
        resource = (await db.execute(stmt)).scalar_one_or_none()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

        valid_statuses = {"DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"}
        status_clean = workflow_status.upper().strip()
        if status_clean not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid workflow status. Must be one of {valid_statuses}")

        resource.is_published = (status_clean == "PUBLISHED" or status_clean == "APPROVED")
        resource.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(resource)
        return {
            "id": str(resource.id),
            "workflow_status": status_clean,
            "is_published": resource.is_published,
            "reviewer_feedback": reviewer_feedback,
            "message": f"Resource workflow transitioned to {status_clean}"
        }

    @classmethod
    async def delete_resource(
        cls, db: AsyncSession, user: User, resource_id: Any
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)
        r_id = _to_uuid(resource_id)

        stmt = select(EducationalResource).where(
            EducationalResource.id == r_id,
            EducationalResource.faculty_id == profile.id
        )
        resource = (await db.execute(stmt)).scalar_one_or_none()
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or unauthorized")

        await db.delete(resource)
        await db.commit()
        return {"message": "Resource deleted successfully.", "id": str(r_id)}

    # --- LECTURE & SESSION MANAGEMENT (PHASE 4) ---
    @classmethod
    async def schedule_lecture(
        cls, db: AsyncSession, user: User, data: LectureScheduleCreateIn
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        lecture = LectureSchedule(
            institution_id=profile.institution_id,
            faculty_id=profile.id,
            title=data.title.strip(),
            subject_id=data.subject_id.strip(),
            subject_name=data.subject_name.strip(),
            academic_year=data.academic_year.strip(),
            topic=data.topic.strip() if data.topic else None,
            session_type=data.session_type.upper().strip(),
            scheduled_date=data.scheduled_date,
            start_time=data.start_time.strip(),
            end_time=data.end_time.strip(),
            venue_or_link=data.venue_or_link.strip() if data.venue_or_link else None,
            session_link=data.session_link.strip() if data.session_link else None,
            recording_url=data.recording_url.strip() if data.recording_url else None,
            announcement=data.announcement.strip() if data.announcement else None,
            status="SCHEDULED"
        )
        db.add(lecture)
        await db.commit()
        await db.refresh(lecture)

        return {
            "id": str(lecture.id),
            "institution_id": str(lecture.institution_id),
            "faculty_id": str(lecture.faculty_id),
            "faculty_name": profile.full_name,
            "title": lecture.title,
            "subject_id": lecture.subject_id,
            "subject_name": lecture.subject_name,
            "academic_year": lecture.academic_year,
            "topic": lecture.topic,
            "session_type": lecture.session_type,
            "scheduled_date": str(lecture.scheduled_date),
            "start_time": lecture.start_time,
            "end_time": lecture.end_time,
            "venue_or_link": lecture.venue_or_link,
            "session_link": lecture.session_link,
            "recording_url": lecture.recording_url,
            "announcement": lecture.announcement,
            "status": lecture.status,
            "created_at": lecture.created_at
        }

    @classmethod
    async def get_lectures(
        cls,
        db: AsyncSession,
        user: User,
        academic_year: Optional[str] = None,
        subject_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        stmt = (
            select(LectureSchedule, InstitutionProfile.institution_name)
            .join(InstitutionProfile, LectureSchedule.institution_id == InstitutionProfile.id)
            .where(LectureSchedule.faculty_id == profile.id)
            .order_by(LectureSchedule.scheduled_date.asc(), LectureSchedule.start_time.asc())
        )
        if academic_year:
            stmt = stmt.where(LectureSchedule.academic_year == academic_year.strip())
        if subject_id:
            stmt = stmt.where(LectureSchedule.subject_id == subject_id.strip())

        rows = (await db.execute(stmt)).all()
        results = []
        for l, inst_name in rows:
            results.append({
                "id": str(l.id),
                "institution_id": str(l.institution_id),
                "institution_name": inst_name,
                "faculty_id": str(l.faculty_id),
                "faculty_name": profile.full_name,
                "title": l.title,
                "subject_id": l.subject_id,
                "subject_name": l.subject_name,
                "academic_year": l.academic_year,
                "topic": l.topic,
                "session_type": l.session_type,
                "scheduled_date": str(l.scheduled_date),
                "start_time": l.start_time,
                "end_time": l.end_time,
                "venue_or_link": l.venue_or_link,
                "session_link": l.session_link,
                "recording_url": l.recording_url,
                "announcement": l.announcement,
                "status": l.status,
                "created_at": l.created_at
            })
        return results

    @classmethod
    async def update_lecture(
        cls, db: AsyncSession, user: User, lecture_id: Any, update_data: LectureScheduleUpdateIn
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)
        l_id = _to_uuid(lecture_id)

        stmt = select(LectureSchedule).where(
            LectureSchedule.id == l_id,
            LectureSchedule.faculty_id == profile.id
        )
        lecture = (await db.execute(stmt)).scalar_one_or_none()
        if not lecture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found or unauthorized")

        if update_data.title is not None:
            lecture.title = update_data.title.strip()
        if update_data.topic is not None:
            lecture.topic = update_data.topic.strip()
        if update_data.session_type is not None:
            lecture.session_type = update_data.session_type.upper().strip()
        if update_data.scheduled_date is not None:
            lecture.scheduled_date = update_data.scheduled_date
        if update_data.start_time is not None:
            lecture.start_time = update_data.start_time.strip()
        if update_data.end_time is not None:
            lecture.end_time = update_data.end_time.strip()
        if update_data.venue_or_link is not None:
            lecture.venue_or_link = update_data.venue_or_link.strip()
        if update_data.session_link is not None:
            lecture.session_link = update_data.session_link.strip()
        if update_data.recording_url is not None:
            lecture.recording_url = update_data.recording_url.strip()
        if update_data.announcement is not None:
            lecture.announcement = update_data.announcement.strip()
        if update_data.status is not None:
            lecture.status = update_data.status.upper().strip()

        lecture.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(lecture)

        return {"message": "Lecture updated successfully.", "id": str(lecture.id)}

    @classmethod
    async def delete_lecture(
        cls, db: AsyncSession, user: User, lecture_id: Any
    ) -> Dict[str, Any]:
        profile = await cls.get_or_create_faculty_profile(db, user)
        l_id = _to_uuid(lecture_id)

        stmt = select(LectureSchedule).where(
            LectureSchedule.id == l_id,
            LectureSchedule.faculty_id == profile.id
        )
        lecture = (await db.execute(stmt)).scalar_one_or_none()
        if not lecture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found or unauthorized")

        await db.delete(lecture)
        await db.commit()
        return {"message": "Lecture deleted successfully.", "id": str(l_id)}

    # --- STUDENT LEARNING ACTIVITIES & PRIVACY-COMPLIANT ROSTER ---
    @classmethod
    async def get_class_roster(
        cls, db: AsyncSession, user: User, academic_year: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        profile = await cls.get_or_create_faculty_profile(db, user)

        stmt = (
            select(StudentProfile)
            .options(selectinload(StudentProfile.user))
            .where(StudentProfile.institution_id == profile.institution_id)
            .order_by(StudentProfile.full_name.asc())
        )
        students = (await db.execute(stmt)).scalars().all()

        results = []
        for s in students:
            # Map integer year or string
            stu_year = f"{s.current_year}st Year" if s.current_year == 1 else (
                f"{s.current_year}nd Year" if s.current_year == 2 else (
                    f"{s.current_year}rd Year" if s.current_year == 3 else f"{s.current_year}th Year"
                )
            ) if s.current_year else "1st Year"

            if academic_year and stu_year != academic_year.strip():
                continue

            # PRIVACY PRESERVATION: Never expose private student notes or personal AI chat messages!
            results.append({
                "student_id": str(s.id),
                "full_name": s.full_name or "BAMS Scholar",
                "email": s.user.email if s.user else None,
                "academic_year": stu_year,
                "degree_program": s.degree_program or "BAMS",
                "enrollment_number": s.enrollment_number,
                "attendance_status": "REGULAR"
            })
        return results

    # --- STUDENT ACCESS TO INSTITUTIONAL MATERIALS & LECTURES ---
    @classmethod
    async def get_student_institutional_resources(
        cls, db: AsyncSession, student_user: User, subject_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student_user.id)
        student = (await db.execute(prof_stmt)).scalar_one_or_none()

        if not student or not student.institution_id:
            # If student has not set institution yet, check membership
            mem_stmt = select(StudentInstitutionMembership).where(
                StudentInstitutionMembership.student_profile_id == (student.id if student else student_user.id),
                StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
            )
            mem = (await db.execute(mem_stmt)).scalar_one_or_none()
            if not mem and not (student and student.institution_id):
                return []
            inst_id = mem.institution_id if mem else student.institution_id
        else:
            inst_id = student.institution_id

        stmt = (
            select(EducationalResource, FacultyProfile.full_name, InstitutionProfile.institution_name)
            .join(FacultyProfile, EducationalResource.faculty_id == FacultyProfile.id)
            .join(InstitutionProfile, EducationalResource.institution_id == InstitutionProfile.id)
            .where(
                EducationalResource.institution_id == inst_id,
                EducationalResource.is_published == True
            )
            .order_by(EducationalResource.created_at.desc())
        )
        if subject_id:
            stmt = stmt.where(EducationalResource.subject_id == subject_id.strip())

        rows = (await db.execute(stmt)).all()
        results = []
        for r, fac_name, inst_name in rows:
            results.append({
                "id": str(r.id),
                "institution_id": str(r.institution_id),
                "institution_name": inst_name,
                "faculty_id": str(r.faculty_id),
                "faculty_name": fac_name,
                "title": r.title,
                "description": r.description,
                "resource_type": r.resource_type,
                "academic_year": r.academic_year,
                "subject_id": r.subject_id,
                "subject_name": r.subject_name,
                "unit_number": r.unit_number,
                "unit_name": r.unit_name,
                "topic_id": r.topic_id,
                "topic_name": r.topic_name,
                "class_or_batch": r.class_or_batch,
                "file_url": r.file_url,
                "content_text": r.content_text,
                "is_published": r.is_published,
                "is_ai_generated": r.is_ai_generated,
                "ai_disclaimer": r.ai_disclaimer,
                "created_at": r.created_at
            })
        return results

    @classmethod
    async def get_student_institutional_lectures(
        cls, db: AsyncSession, student_user: User
    ) -> List[Dict[str, Any]]:
        prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student_user.id)
        student = (await db.execute(prof_stmt)).scalar_one_or_none()

        inst_id = student.institution_id if student else None
        if not inst_id:
            mem_stmt = select(StudentInstitutionMembership.institution_id).where(
                StudentInstitutionMembership.student_profile_id == (student.id if student else student_user.id),
                StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
            )
            inst_id = (await db.execute(mem_stmt)).scalar_one_or_none()

        if not inst_id:
            return []

        stmt = (
            select(LectureSchedule, FacultyProfile.full_name, InstitutionProfile.institution_name)
            .join(FacultyProfile, LectureSchedule.faculty_id == FacultyProfile.id)
            .join(InstitutionProfile, LectureSchedule.institution_id == InstitutionProfile.id)
            .where(
                LectureSchedule.institution_id == inst_id,
                LectureSchedule.status != "CANCELLED"
            )
            .order_by(LectureSchedule.scheduled_date.asc(), LectureSchedule.start_time.asc())
        )
        rows = (await db.execute(stmt)).all()
        results = []
        for l, fac_name, inst_name in rows:
            results.append({
                "id": str(l.id),
                "institution_id": str(l.institution_id),
                "institution_name": inst_name,
                "faculty_id": str(l.faculty_id),
                "faculty_name": fac_name,
                "title": l.title,
                "subject_id": l.subject_id,
                "subject_name": l.subject_name,
                "academic_year": l.academic_year,
                "topic": l.topic,
                "session_type": l.session_type,
                "scheduled_date": str(l.scheduled_date),
                "start_time": l.start_time,
                "end_time": l.end_time,
                "venue_or_link": l.venue_or_link,
                "session_link": l.session_link,
                "recording_url": l.recording_url,
                "announcement": l.announcement,
                "status": l.status,
                "created_at": l.created_at
            })
        return results
