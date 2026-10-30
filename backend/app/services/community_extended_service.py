import uuid
import hashlib
from datetime import datetime, timezone, date
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import StudentProfile, IndustryOpportunity, OpportunityType, VerificationStatus, Portfolio
from app.models.mentorship import AlumniProfile, MentorshipEngagement
from app.models.events import PlatformEvent, EventRegistration, EventCertificate
from app.models.security_privacy import UserPrivacySettings, UserModerationReport, UserBlock, SecurityAuditLog
from app.models.wellness import WellnessResource, StudentWellnessBookmark
from app.models.interactive_3d import Ayurveda3DModel
from app.models.herbs_research import MedicinalPlant, AyushResearchPaper, StudentProjectShowcase
from app.models.forum import ForumCategory, ForumPost, ForumComment, ForumPostReaction, ForumReport
from app.models.ngo_volunteers import NGOVolunteerOpportunity, NGOVolunteerApplication, NGOVolunteerCertificate
from app.schemas.community_events_more import (
    MentorshipRequestIn,
    PrivacySettingsUpdateIn,
    ModerationReportIn,
    ForumPostCreateIn,
    ForumCommentCreateIn,
    StudentProjectShowcaseIn,
    NGOVolunteerOppCreateIn
)

class CommunityExtendedService:

    # 1. Alumni Mentorship
    @classmethod
    async def request_mentorship(cls, db: AsyncSession, student_user: User, data: MentorshipRequestIn) -> MentorshipEngagement:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

        eng = MentorshipEngagement(
            student_id=student.id,
            mentor_user_id=data.mentor_user_id,
            mentor_role=UserRole.ALUMNI,
            topic=data.topic,
            message=data.message,
            status="REQUESTED"
        )
        db.add(eng)
        await db.commit()
        await db.refresh(eng)
        return eng

    # 2. Events & Registrations
    @classmethod
    async def list_events(cls, db: AsyncSession, event_type: Optional[str] = None) -> List[PlatformEvent]:
        query = select(PlatformEvent)
        if event_type:
            query = query.where(PlatformEvent.event_type == event_type.upper())
        result = await db.execute(query.order_by(PlatformEvent.event_date.asc()))
        return list(result.scalars().all())

    @classmethod
    async def register_event(cls, db: AsyncSession, user: User, event_id: uuid.UUID) -> EventRegistration:
        res = await db.execute(select(PlatformEvent).where(PlatformEvent.id == event_id))
        evt = res.scalar_one_or_none()
        if not evt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

        existing = await db.execute(
            select(EventRegistration).where(
                and_(EventRegistration.event_id == event_id, EventRegistration.user_id == user.id)
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already registered for this event")

        if evt.registered_count >= evt.capacity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event has reached maximum capacity")

        reg = EventRegistration(
            event_id=evt.id,
            user_id=user.id,
            status="REGISTERED"
        )
        db.add(reg)
        evt.registered_count += 1
        await db.commit()
        await db.refresh(reg)
        return reg

    # 3. Privacy & Moderation
    @classmethod
    async def get_or_create_privacy_settings(cls, db: AsyncSession, user: User) -> UserPrivacySettings:
        res = await db.execute(select(UserPrivacySettings).where(UserPrivacySettings.user_id == user.id))
        settings = res.scalar_one_or_none()
        if not settings:
            settings = UserPrivacySettings(user_id=user.id)
            db.add(settings)
            await db.commit()
            await db.refresh(settings)
        return settings

    @classmethod
    async def update_privacy_settings(cls, db: AsyncSession, user: User, data: PrivacySettingsUpdateIn) -> UserPrivacySettings:
        settings = await cls.get_or_create_privacy_settings(db, user)
        if data.profile_visibility:
            settings.profile_visibility = data.profile_visibility.upper()
        if data.portfolio_visibility:
            settings.portfolio_visibility = data.portfolio_visibility.upper()
        if data.contact_email_visible is not None:
            settings.contact_email_visible = data.contact_email_visible
        if data.contact_phone_visible is not None:
            settings.contact_phone_visible = data.contact_phone_visible
        if data.show_assessment_scores is not None:
            settings.show_assessment_scores = data.show_assessment_scores
        if data.show_volunteer_hours is not None:
            settings.show_volunteer_hours = data.show_volunteer_hours

        await db.commit()
        await db.refresh(settings)
        return settings

    # 4. Medicinal Plants & Research Papers
    @classmethod
    async def list_herbs(cls, db: AsyncSession, search: Optional[str] = None, virya: Optional[str] = None) -> List[MedicinalPlant]:
        query = select(MedicinalPlant)
        filters = []
        if virya:
            filters.append(MedicinalPlant.virya == virya.upper())
        if search:
            filters.append(
                or_(
                    MedicinalPlant.common_name.ilike(f"%{search}%"),
                    MedicinalPlant.sanskrit_name.ilike(f"%{search}%"),
                    MedicinalPlant.botanical_name.ilike(f"%{search}%")
                )
            )
        if filters:
            query = query.where(and_(*filters))

        result = await db.execute(query.order_by(MedicinalPlant.common_name.asc()))
        return list(result.scalars().all())

    # 5. Forum Discussions
    @classmethod
    async def list_forum_posts(cls, db: AsyncSession, category_id: Optional[uuid.UUID] = None) -> List[ForumPost]:
        query = select(ForumPost).where(ForumPost.moderation_status == "PUBLISHED")
        if category_id:
            query = query.where(ForumPost.category_id == category_id)
        result = await db.execute(query.order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc()))
        return list(result.scalars().all())

    @classmethod
    async def create_forum_post(cls, db: AsyncSession, user: User, data: ForumPostCreateIn) -> ForumPost:
        # Sanitize
        clean_title = data.title.replace("<script>", "").replace("</script>", "")
        clean_content = data.content.replace("<script>", "").replace("</script>", "")

        post = ForumPost(
            category_id=data.category_id,
            author_id=user.id,
            title=clean_title,
            content=clean_content,
            tags=data.tags,
            moderation_status="PUBLISHED"
        )
        db.add(post)
        await db.commit()
        await db.refresh(post)
        return post

    # 6. NGO Volunteer Opportunities
    @classmethod
    async def create_ngo_volunteer_opp(cls, db: AsyncSession, user: User, data: NGOVolunteerOppCreateIn) -> NGOVolunteerOpportunity:
        opp = NGOVolunteerOpportunity(
            ngo_id=user.id,
            ngo_name=user.email.split("@")[0].title(),
            title=data.title,
            description=data.description,
            skills_required=data.skills_required,
            location_city=data.location_city,
            location_state=data.location_state,
            venue_address=data.venue_address,
            start_date=data.start_date,
            end_date=data.end_date,
            estimated_hours=data.estimated_hours,
            capacity=data.capacity,
            requirements_text=data.requirements_text,
            status="OPEN"
        )
        db.add(opp)
        await db.commit()
        await db.refresh(opp)
        return opp

    @classmethod
    async def apply_ngo_volunteer(cls, db: AsyncSession, student_user: User, opp_id: uuid.UUID) -> NGOVolunteerApplication:
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user.id))
        student = res.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

        existing = await db.execute(
            select(NGOVolunteerApplication).where(
                and_(NGOVolunteerApplication.opportunity_id == opp_id, NGOVolunteerApplication.student_id == student.id)
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already applied for this volunteer opportunity")

        app = NGOVolunteerApplication(
            opportunity_id=opp_id,
            student_id=student.id,
            applicant_name=student_user.email.split("@")[0].title(),
            email=student_user.email,
            phone="9876543210",
            status="APPLIED"
        )
        db.add(app)
        await db.commit()
        await db.refresh(app)
        return app
