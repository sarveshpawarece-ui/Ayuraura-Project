import uuid
import hashlib
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User
from app.models.domain import StudentProfile
from app.models.learning_hub import (
    ResourceBookmark,
    ResourceViewHistory,
    ResourceRating,
    BookMarketplaceItem,
    ClassicalTreatise,
    ClassicalShloka,
    SubjectStudyModule,
    StudentStudyNote,
    PracticeSession
)
from app.models.courses_tests import (
    ExamMockTest,
    ExamMockAttempt,
    CertificateCourse,
    CourseEnrollment,
    CourseCertificate
)
from app.models.scholarships import (
    ScholarshipListing,
    StudentScholarshipBookmark
)
from app.schemas.learning_hub import (
    StudyNoteCreateIn,
    PracticeSubmitIn,
    CourseEnrollIn
)

class LearningKnowledgeService:

    @classmethod
    async def list_shlokas(
        cls,
        db: AsyncSession,
        treatise: Optional[str] = None,
        subject: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ClassicalShloka]:
        query = select(ClassicalShloka)
        filters = []
        if treatise:
            filters.append(ClassicalShloka.treatise_name.ilike(f"%{treatise}%"))
        if subject:
            filters.append(ClassicalShloka.subject.ilike(f"%{subject}%"))
        if search:
            filters.append(
                or_(
                    ClassicalShloka.sanskrit_devanagari.ilike(f"%{search}%"),
                    ClassicalShloka.iast_transliteration.ilike(f"%{search}%"),
                    ClassicalShloka.english_meaning.ilike(f"%{search}%")
                )
            )

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query.order_by(ClassicalShloka.chapter_number.asc()))
        return list(result.scalars().all())

    @classmethod
    async def create_study_note(cls, db: AsyncSession, student_user: User, data: StudyNoteCreateIn) -> StudentStudyNote:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            student = StudentProfile(
                user_id=student_user.id,
                full_name=student_user.full_name or "AyurSetu Student",
                current_year="BAMS 3rd Year",
                degree_program="BAMS"
            )
            db.add(student)
            await db.commit()
            await db.refresh(student)

        note = StudentStudyNote(
            student_id=student.id,
            title=data.title,
            content=data.content,
            subject=data.subject,
            folder_name=data.folder_name,
            tags=data.tags,
            color_code=data.color_code,
            is_pinned=data.is_pinned
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)
        return note

    @classmethod
    async def list_study_notes(cls, db: AsyncSession, student_user: User, subject: Optional[str] = None, search: Optional[str] = None) -> List[StudentStudyNote]:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            return []

        query = select(StudentStudyNote).where(StudentStudyNote.student_id == student.id)
        filters = []
        if subject:
            filters.append(StudentStudyNote.subject.ilike(f"%{subject}%"))
        if search:
            filters.append(
                or_(
                    StudentStudyNote.title.ilike(f"%{search}%"),
                    StudentStudyNote.content.ilike(f"%{search}%")
                )
            )

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query.order_by(StudentStudyNote.is_pinned.desc(), StudentStudyNote.created_at.desc()))
        return list(result.scalars().all())

    @classmethod
    async def enroll_course(cls, db: AsyncSession, student_user: User, course_id: uuid.UUID) -> CourseEnrollment:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

        # Check existing enrollment
        existing = await db.execute(
            select(CourseEnrollment).where(
                and_(CourseEnrollment.course_id == course_id, CourseEnrollment.student_id == student.id)
            )
        )
        enr = existing.scalar_one_or_none()
        if enr:
            return enr

        enr = CourseEnrollment(
            course_id=course_id,
            student_id=student.id,
            status="ENROLLED",
            progress_percentage=0,
            completed_module_ids=[]
        )
        db.add(enr)
        await db.commit()
        await db.refresh(enr)
        return enr

    @classmethod
    async def issue_course_certificate(cls, db: AsyncSession, student_user: User, course_id: uuid.UUID, score: float) -> CourseCertificate:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

        res_course = await db.execute(select(CertificateCourse).where(CertificateCourse.id == course_id))
        course = res_course.scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if score < course.passing_score_pct:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Score {score}% is below passing threshold of {course.passing_score_pct}%")

        res_enr = await db.execute(
            select(CourseEnrollment).where(
                and_(CourseEnrollment.course_id == course_id, CourseEnrollment.student_id == student.id)
            )
        )
        enr = res_enr.scalar_one_or_none()
        if not enr:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must be enrolled in course to receive certificate")

        token = f"ayur-course-cert-{uuid.uuid4().hex[:12]}"
        raw = f"{course.title}:{student.id}:{score}:{token}:{datetime.now(timezone.utc).isoformat()}"
        chash = hashlib.sha256(raw.encode()).hexdigest()

        cert = CourseCertificate(
            enrollment_id=enr.id,
            course_id=course.id,
            student_id=student.id,
            certificate_token=token,
            certificate_hash=chash,
            student_name="AyurSetu Scholar",
            course_title=course.title,
            score_achieved=score,
            is_valid=True
        )
        db.add(cert)
        enr.status = "COMPLETED"
        enr.progress_percentage = 100
        enr.exit_quiz_score_pct = score
        await db.commit()
        await db.refresh(cert)
        return cert

    @classmethod
    async def list_scholarships(cls, db: AsyncSession, search: Optional[str] = None, provider_type: Optional[str] = None) -> List[ScholarshipListing]:
        query = select(ScholarshipListing).where(ScholarshipListing.status == "ACTIVE")
        filters = []
        if provider_type:
            filters.append(ScholarshipListing.provider_type.ilike(f"%{provider_type}%"))
        if search:
            filters.append(
                or_(
                    ScholarshipListing.name.ilike(f"%{search}%"),
                    ScholarshipListing.description.ilike(f"%{search}%")
                )
            )

        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query.order_by(ScholarshipListing.deadline.asc()))
        return list(result.scalars().all())
