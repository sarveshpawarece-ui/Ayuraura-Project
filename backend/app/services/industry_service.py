import re
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, desc, asc
from sqlalchemy.orm import selectinload

from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import (
    IndustryProfile,
    IndustryOpportunity,
    OpportunityRequiredSkill,
    OpportunityCareerRole,
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    ApplicationInternalNote,
    IndustryAuditLog,
    VerificationStatus,
    OpportunityStatus,
    StudentProfile,
    StudentSkillScore,
    CareerRole,
    Skill,
    OpportunityMatch,
    MatchClassification
)

from app.schemas.industry import (
    OrganizationProfileUpdate,
    IndustryOpportunityCreate,
    IndustryOpportunityUpdate,
    OpportunityRequirementIn,
    ApplicationStatusUpdateIn,
    InternalNoteCreate
)
from app.services.matching_engine import MatchingEngine



def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def sanitize_text(text: Optional[str]) -> Optional[str]:
    if not text:
        return text
    # Strip dangerous HTML tags
    cleaned = re.sub(r'<script[^>]*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<[^>]*?>', '', cleaned)
    return cleaned.strip()


class IndustryService:

    @staticmethod
    async def get_or_create_industry_profile(db: AsyncSession, user: User) -> IndustryProfile:
        """Fetch or automatically create IndustryProfile for an INDUSTRY user."""
        if user.role != UserRole.INDUSTRY and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to Industry or Admin users"
            )

        stmt = select(IndustryProfile).where(IndustryProfile.user_id == user.id)
        res = await db.execute(stmt)
        profile = res.scalars().first()

        if not profile:
            company_name = user.email.split("@")[0].replace(".", " ").title() + " Org"
            profile = IndustryProfile(
                user_id=user.id,
                company_name=company_name,
                contact_email=user.email,
                verification_status=VerificationStatus.PENDING
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

        return profile

    @staticmethod
    async def update_organization_profile(
        db: AsyncSession, org: IndustryProfile, update_data: OrganizationProfileUpdate
    ) -> IndustryProfile:
        """Update organization profile data."""
        if update_data.company_name is not None:
            org.company_name = sanitize_text(update_data.company_name)
        if update_data.registration_number is not None:
            org.registration_number = sanitize_text(update_data.registration_number)
        if update_data.industry_domain is not None:
            org.industry_domain = sanitize_text(update_data.industry_domain)
        if update_data.description is not None:
            org.description = sanitize_text(update_data.description)
        if update_data.organization_type is not None:
            org.organization_type = update_data.organization_type
        if update_data.website_url is not None:
            if update_data.website_url and not (update_data.website_url.startswith("http://") or update_data.website_url.startswith("https://")):
                raise HTTPException(status_code=400, detail="Website URL must start with http:// or https://")
            org.website_url = update_data.website_url.strip()
        if update_data.logo_url is not None:
            org.logo_url = update_data.logo_url.strip() if update_data.logo_url else None
        if update_data.contact_email is not None:
            org.contact_email = update_data.contact_email
        if update_data.contact_phone is not None:
            org.contact_phone = sanitize_text(update_data.contact_phone)
        if update_data.location is not None:
            org.location = sanitize_text(update_data.location)

        org.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(org)
        return org

    @staticmethod
    async def list_opportunities(
        db: AsyncSession,
        org_id: uuid.UUID,
        status_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[IndustryOpportunity]:
        """List opportunities belonging strictly to org_id."""
        stmt = (
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(IndustryOpportunity.applications)
            )
            .where(IndustryOpportunity.organization_id == org_id)
        )

        if status_filter:
            try:
                opp_status = OpportunityStatus(status_filter.upper())
                stmt = stmt.where(IndustryOpportunity.status == opp_status)
            except ValueError:
                pass

        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    IndustryOpportunity.title.ilike(search_pattern),
                    IndustryOpportunity.description.ilike(search_pattern)
                )
            )

        stmt = stmt.order_by(desc(IndustryOpportunity.created_at))
        res = await db.execute(stmt)
        return res.scalars().all()

    @staticmethod
    async def get_opportunity(
        db: AsyncSession, org_id: uuid.UUID, opp_id: uuid.UUID
    ) -> IndustryOpportunity:
        """Fetch an opportunity belonging strictly to org_id."""
        stmt = (
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(IndustryOpportunity.career_roles).selectinload(OpportunityCareerRole.career_role),
                selectinload(IndustryOpportunity.applications)
            )
            .where(
                and_(
                    IndustryOpportunity.id == opp_id,
                    IndustryOpportunity.organization_id == org_id
                )
            )
        )
        res = await db.execute(stmt)
        opp = res.scalars().first()
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found or access denied")
        return opp

    @staticmethod
    async def create_opportunity(
        db: AsyncSession,
        org: IndustryProfile,
        user_id: uuid.UUID,
        opp_in: IndustryOpportunityCreate
    ) -> IndustryOpportunity:
        """Create a new opportunity as DRAFT or PUBLISHED (if verified)."""

        # Enforce verification check if trying to publish immediately
        if opp_in.status == OpportunityStatus.PUBLISHED or opp_in.status == OpportunityStatus.ACTIVE or opp_in.status == OpportunityStatus.OPEN:
            if org.verification_status != VerificationStatus.VERIFIED:
                raise HTTPException(
                    status_code=403,
                    detail="Organization must be VERIFIED before publishing opportunities. Saved as DRAFT instead."
                )
            if opp_in.application_deadline:
                deadline_utc = ensure_utc(opp_in.application_deadline)
                if deadline_utc and deadline_utc < datetime.now(timezone.utc):
                    raise HTTPException(status_code=400, detail="Application deadline must be in the future")

        opp = IndustryOpportunity(
            organization_id=org.id,
            created_by_user_id=user_id,
            title=sanitize_text(opp_in.title),
            description=sanitize_text(opp_in.description),
            responsibilities=sanitize_text(opp_in.responsibilities),
            requirements=sanitize_text(opp_in.requirements),
            opportunity_type=opp_in.opportunity_type,
            organization_name=org.company_name,
            organization_description=org.description,
            location_text=sanitize_text(opp_in.location_text),
            city=sanitize_text(opp_in.city),
            state=sanitize_text(opp_in.state),
            country=opp_in.country,
            work_mode=opp_in.work_mode,
            employment_type=opp_in.employment_type,
            experience_level=opp_in.experience_level,
            application_deadline=ensure_utc(opp_in.application_deadline),
            salary_min=opp_in.salary_min,
            salary_max=opp_in.salary_max,
            salary_currency=opp_in.salary_currency,
            is_salary_disclosed=opp_in.is_salary_disclosed,
            status=OpportunityStatus.DRAFT if org.verification_status != VerificationStatus.VERIFIED else opp_in.status
        )
        db.add(opp)
        await db.flush()

        # Add skill requirements
        if opp_in.required_skills:
            for skill_req in opp_in.required_skills:
                req_obj = OpportunityRequiredSkill(
                    opportunity_id=opp.id,
                    skill_id=skill_req.skill_id,
                    required_score=skill_req.required_score,
                    importance=skill_req.importance,
                    is_required=skill_req.is_required
                )
                db.add(req_obj)

        # Add target career roles
        if opp_in.career_role_ids:
            for role_id in opp_in.career_role_ids:
                c_role_obj = OpportunityCareerRole(
                    opportunity_id=opp.id,
                    career_role_id=role_id,
                    relevance_weight=1.0
                )
                db.add(c_role_obj)

        # Audit log
        audit = IndustryAuditLog(
            organization_id=org.id,
            user_id=user_id,
            action="CREATE_OPPORTUNITY",
            entity_type="INDUSTRY_OPPORTUNITY",
            entity_id=str(opp.id),
            metadata_json={"title": opp.title, "status": opp.status.value}
        )
        db.add(audit)

        await db.commit()

        # Re-fetch complete opportunity
        return await IndustryService.get_opportunity(db, org.id, opp.id)

    @staticmethod
    async def update_opportunity(
        db: AsyncSession,
        org: IndustryProfile,
        opp_id: uuid.UUID,
        opp_in: IndustryOpportunityUpdate
    ) -> IndustryOpportunity:
        """Update opportunity details and requirements."""
        opp = await IndustryService.get_opportunity(db, org.id, opp_id)

        if opp_in.title is not None:
            opp.title = sanitize_text(opp_in.title)
        if opp_in.description is not None:
            opp.description = sanitize_text(opp_in.description)
        if opp_in.responsibilities is not None:
            opp.responsibilities = sanitize_text(opp_in.responsibilities)
        if opp_in.requirements is not None:
            opp.requirements = sanitize_text(opp_in.requirements)
        if opp_in.opportunity_type is not None:
            opp.opportunity_type = opp_in.opportunity_type
        if opp_in.work_mode is not None:
            opp.work_mode = opp_in.work_mode
        if opp_in.employment_type is not None:
            opp.employment_type = opp_in.employment_type
        if opp_in.experience_level is not None:
            opp.experience_level = opp_in.experience_level
        if opp_in.location_text is not None:
            opp.location_text = sanitize_text(opp_in.location_text)
        if opp_in.city is not None:
            opp.city = sanitize_text(opp_in.city)
        if opp_in.state is not None:
            opp.state = sanitize_text(opp_in.state)
        if opp_in.country is not None:
            opp.country = opp_in.country
        if opp_in.application_deadline is not None:
            opp.application_deadline = ensure_utc(opp_in.application_deadline)
        if opp_in.salary_min is not None:
            opp.salary_min = opp_in.salary_min
        if opp_in.salary_max is not None:
            opp.salary_max = opp_in.salary_max
        if opp_in.salary_currency is not None:
            opp.salary_currency = opp_in.salary_currency
        if opp_in.is_salary_disclosed is not None:
            opp.is_salary_disclosed = opp_in.is_salary_disclosed

        # Requirements update if provided
        if opp_in.required_skills is not None:
            await db.execute(
                OpportunityRequiredSkill.__table__.delete().where(
                    OpportunityRequiredSkill.opportunity_id == opp.id
                )
            )
            for skill_req in opp_in.required_skills:
                req_obj = OpportunityRequiredSkill(
                    opportunity_id=opp.id,
                    skill_id=skill_req.skill_id,
                    required_score=skill_req.required_score,
                    importance=skill_req.importance,
                    is_required=skill_req.is_required
                )
                db.add(req_obj)

        opp.updated_at = datetime.now(timezone.utc)
        await db.commit()
        return await IndustryService.get_opportunity(db, org.id, opp.id)

    @staticmethod
    async def publish_opportunity(
        db: AsyncSession, org: IndustryProfile, user_id: uuid.UUID, opp_id: uuid.UUID
    ) -> IndustryOpportunity:
        """Publish a draft or paused opportunity."""
        if org.verification_status != VerificationStatus.VERIFIED:
            raise HTTPException(
                status_code=403,
                detail="Organization profile must be VERIFIED before publishing opportunities."
            )

        opp = await IndustryService.get_opportunity(db, org.id, opp_id)

        # Validation check
        if not opp.title or len(opp.title.strip()) < 3:
            raise HTTPException(status_code=400, detail="Opportunity must have a valid title")
        if not opp.description or len(opp.description.strip()) < 10:
            raise HTTPException(status_code=400, detail="Opportunity description must be at least 10 characters")

        if opp.application_deadline:
            deadline_utc = ensure_utc(opp.application_deadline)
            if deadline_utc and deadline_utc < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Cannot publish opportunity with past deadline")

        opp.status = OpportunityStatus.PUBLISHED
        opp.updated_at = datetime.now(timezone.utc)

        audit = IndustryAuditLog(
            organization_id=org.id,
            user_id=user_id,
            action="PUBLISH_OPPORTUNITY",
            entity_type="INDUSTRY_OPPORTUNITY",
            entity_id=str(opp.id)
        )
        db.add(audit)

        await db.commit()
        return opp

    @staticmethod
    async def pause_opportunity(
        db: AsyncSession, org: IndustryProfile, user_id: uuid.UUID, opp_id: uuid.UUID
    ) -> IndustryOpportunity:
        """Pause a published opportunity."""
        opp = await IndustryService.get_opportunity(db, org.id, opp_id)
        opp.status = OpportunityStatus.PAUSED
        opp.updated_at = datetime.now(timezone.utc)

        audit = IndustryAuditLog(
            organization_id=org.id,
            user_id=user_id,
            action="PAUSE_OPPORTUNITY",
            entity_type="INDUSTRY_OPPORTUNITY",
            entity_id=str(opp.id)
        )
        db.add(audit)

        await db.commit()
        return opp

    @staticmethod
    async def resume_opportunity(
        db: AsyncSession, org: IndustryProfile, user_id: uuid.UUID, opp_id: uuid.UUID
    ) -> IndustryOpportunity:
        """Resume a paused opportunity."""
        if org.verification_status != VerificationStatus.VERIFIED:
            raise HTTPException(status_code=403, detail="Organization must be VERIFIED to resume opportunities.")
        return await IndustryService.publish_opportunity(db, org, user_id, opp_id)

    @staticmethod
    async def close_opportunity(
        db: AsyncSession, org: IndustryProfile, user_id: uuid.UUID, opp_id: uuid.UUID
    ) -> IndustryOpportunity:
        """Close an opportunity to new applications."""
        opp = await IndustryService.get_opportunity(db, org.id, opp_id)
        opp.status = OpportunityStatus.CLOSED
        opp.updated_at = datetime.now(timezone.utc)

        audit = IndustryAuditLog(
            organization_id=org.id,
            user_id=user_id,
            action="CLOSE_OPPORTUNITY",
            entity_type="INDUSTRY_OPPORTUNITY",
            entity_id=str(opp.id)
        )
        db.add(audit)

        await db.commit()
        return opp

    @staticmethod
    async def list_applicants(
        db: AsyncSession,
        org_id: uuid.UUID,
        opp_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        min_match_score: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = "applied_at"
    ) -> List[Dict[str, Any]]:
        """List candidate applications for organization's opportunities."""
        stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .join(StudentProfile, Application.student_profile_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .options(
                selectinload(Application.opportunity),
                selectinload(Application.student).selectinload(StudentProfile.institution),
                selectinload(Application.student).selectinload(StudentProfile.user)

            )
            .where(IndustryOpportunity.organization_id == org_id)
        )

        if opp_id:
            stmt = stmt.where(Application.opportunity_id == opp_id)

        if status_filter:
            try:
                app_status = ApplicationStatus(status_filter.upper())
                stmt = stmt.where(Application.status == app_status)
            except ValueError:
                pass

        if min_match_score is not None:
            stmt = stmt.where(Application.match_score_snapshot >= min_match_score)

        if search:
            pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    StudentProfile.full_name.ilike(pattern),
                    User.email.ilike(pattern),
                    IndustryOpportunity.title.ilike(pattern)
                )
            )

        if sort_by == "match_score":
            stmt = stmt.order_by(desc(Application.match_score_snapshot))
        else:
            stmt = stmt.order_by(desc(Application.applied_at))

        res = await db.execute(stmt)
        applications = res.scalars().all()

        result_list = []
        for app in applications:
            student = app.student
            user_email = student.user.email if student and student.user else "Candidate"
            score = app.match_score_snapshot or 0.0
            if score >= 85:
                classification = MatchClassification.EXCELLENT
            elif score >= 70:
                classification = MatchClassification.GOOD
            elif score >= 50:
                classification = MatchClassification.PARTIAL
            else:
                classification = MatchClassification.LOW

            result_list.append({
                "id": app.id,
                "opportunity_id": app.opportunity_id,
                "opportunity_title": app.opportunity.title if app.opportunity else "Opportunity",
                "student_profile_id": app.student_profile_id,
                "student_name": student.full_name if student else "Candidate",
                "student_email": user_email,
                "college_name": student.institution.institution_name if (student and student.institution) else None,
                "status": app.status,
                "applied_at": app.applied_at,
                "match_score": score,
                "match_classification": classification
            })
        return result_list


    @staticmethod
    async def get_applicant_detail(
        db: AsyncSession, org_id: uuid.UUID, application_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Fetch candidate application details, match breakdown, skills, timeline, and internal notes."""
        stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .join(StudentProfile, Application.student_profile_id == StudentProfile.id)
            .options(
                selectinload(Application.opportunity).selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(Application.student).selectinload(StudentProfile.institution),
                selectinload(Application.student).selectinload(StudentProfile.user),
                selectinload(Application.student).selectinload(StudentProfile.target_career),
                selectinload(Application.status_history),
                selectinload(Application.internal_notes)

            )
            .where(
                and_(
                    Application.id == application_id,
                    IndustryOpportunity.organization_id == org_id
                )
            )
        )
        res = await db.execute(stmt)
        app = res.scalars().first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found or access denied")

        student = app.student
        opp = app.opportunity

        # Calculate or fetch Phase 10 match details
        match_breakdown = {
            "match_score": app.match_score_snapshot or 0.0,
            "match_classification": "PARTIAL",
            "priority": "MEDIUM",
            "skill_match_score": app.skill_match_snapshot or 0.0,
            "career_match_score": app.career_match_snapshot or 0.0,
            "required_skill_coverage": app.coverage_snapshot or 0.0,
            "experience_fit": app.experience_fit_snapshot or 0.0,
            "matched_skill_count": 0,
            "partial_skill_count": 0,
            "missing_skill_count": 0,
            "critical_missing_skill_count": 0,
            "reason": "Match breakdown generated from submitted application skills."
        }

        # Query dynamic match if target career exists
        if student and student.target_career_id and opp:
            try:
                dyn_match = await MatchingEngine.calculate_opportunity_match(

                    db=db,
                    student_profile_id=student.id,
                    opportunity_id=opp.id,
                    career_role_id=student.target_career_id
                )
                match_breakdown = {
                    "match_score": dyn_match.match_score,
                    "match_classification": dyn_match.match_classification,
                    "priority": dyn_match.priority,
                    "skill_match_score": dyn_match.skill_match_score,
                    "career_match_score": dyn_match.career_match_score,
                    "required_skill_coverage": dyn_match.required_skill_coverage,
                    "experience_fit": dyn_match.experience_fit,
                    "matched_skill_count": dyn_match.matched_skill_count,
                    "partial_skill_count": dyn_match.partial_skill_count,
                    "missing_skill_count": dyn_match.missing_skill_count,
                    "critical_missing_skill_count": dyn_match.critical_missing_skill_count,
                    "reason": dyn_match.reason
                }
            except Exception:
                pass

        # Fetch student skill scores
        skills_stmt = (
            select(StudentSkillScore)
            .options(selectinload(StudentSkillScore.skill))
            .where(StudentSkillScore.student_profile_id == student.id)
        )
        skills_res = await db.execute(skills_stmt)
        student_skills_raw = skills_res.scalars().all()
        student_skills = [
            {
                "skill_id": s.skill_id,
                "skill_name": s.skill.name if s.skill else "Skill",
                "category": s.skill.category.value if s.skill else "TECHNICAL",
                "score": s.score,
                "proficiency_level": s.proficiency_level
            }
            for s in student_skills_raw
        ]

        # Status timeline history
        history_list = [
            {
                "old_status": h.old_status,
                "new_status": h.new_status,
                "changed_at": h.changed_at,
                "changed_by": h.changed_by,
                "notes": h.notes
            }
            for h in (app.status_history or [])
        ]

        # Internal notes
        internal_notes_list = [
            {
                "id": n.id,
                "application_id": n.application_id,
                "organization_id": n.organization_id,
                "author_user_id": n.author_user_id,
                "author_name": n.author_name or "Reviewer",
                "note": n.note,
                "created_at": n.created_at,
                "updated_at": n.updated_at
            }
            for n in (app.internal_notes or [])
        ]

        user_email = student.user.email if student and student.user else "Candidate"

        return {
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "opportunity_title": opp.title if opp else "Opportunity",
            "student_profile_id": app.student_profile_id,
            "student_name": student.full_name if student else "Candidate",
            "student_email": user_email,
            "college_name": student.institution.institution_name if (student and student.institution) else None,
            "degree": student.degree_program if student else None,
            "year_of_study": (student.current_year or student.academic_year) if student else None,
            "target_career_title": (student.target_career.name if hasattr(student.target_career, "name") else getattr(student.target_career, "title", None)) if (student and student.target_career) else None,


            "status": app.status,
            "applied_at": app.applied_at,
            "application_deadline": app.application_deadline,
            "cover_letter_status": app.cover_letter_status.value if app.cover_letter_status else "NOT_REQUIRED",
            "notes_user": app.notes,
            "resume_version": app.resume_version,
            "match_breakdown": match_breakdown,
            "student_skills": student_skills,
            "status_history": history_list,
            "internal_notes": internal_notes_list
        }

    @staticmethod
    async def update_applicant_status(
        db: AsyncSession,
        org_id: uuid.UUID,
        user_id: uuid.UUID,
        application_id: uuid.UUID,
        status_update: ApplicationStatusUpdateIn
    ) -> Dict[str, Any]:
        """Update application review status and log transition history."""
        stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .where(
                and_(
                    Application.id == application_id,
                    IndustryOpportunity.organization_id == org_id
                )
            )
        )
        res = await db.execute(stmt)
        app = res.scalars().first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found or access denied")

        old_status = app.status.value
        new_status = status_update.status

        app.status = new_status
        app.updated_at = datetime.now(timezone.utc)

        # Log history
        history = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_status,
            new_status=new_status.value,
            changed_by=str(user_id),
            notes=sanitize_text(status_update.note)
        )
        db.add(history)

        # Audit log
        audit = IndustryAuditLog(
            organization_id=org_id,
            user_id=user_id,
            action=f"UPDATE_APPLICATION_STATUS_{new_status.value}",
            entity_type="APPLICATION",
            entity_id=str(app.id),
            metadata_json={"old_status": old_status, "new_status": new_status.value}
        )
        db.add(audit)

        await db.commit()

        return await IndustryService.get_applicant_detail(db, org_id, application_id)

    @staticmethod
    async def add_internal_note(
        db: AsyncSession,
        org_id: uuid.UUID,
        user_id: uuid.UUID,
        user_email: str,
        application_id: uuid.UUID,
        note_in: InternalNoteCreate
    ) -> ApplicationInternalNote:
        """Add an internal review note private to organization users."""
        # Verify app belongs to org
        stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .where(
                and_(
                    Application.id == application_id,
                    IndustryOpportunity.organization_id == org_id
                )
            )
        )
        res = await db.execute(stmt)
        app = res.scalars().first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found or access denied")

        author_name = user_email.split("@")[0].title()
        note_obj = ApplicationInternalNote(
            application_id=application_id,
            organization_id=org_id,
            author_user_id=user_id,
            author_name=author_name,
            note=sanitize_text(note_in.note)
        )
        db.add(note_obj)
        await db.commit()
        await db.refresh(note_obj)
        return note_obj

    @staticmethod
    async def list_internal_notes(
        db: AsyncSession, org_id: uuid.UUID, application_id: uuid.UUID
    ) -> List[ApplicationInternalNote]:
        """List internal notes for an application."""
        stmt = (
            select(ApplicationInternalNote)
            .where(
                and_(
                    ApplicationInternalNote.application_id == application_id,
                    ApplicationInternalNote.organization_id == org_id
                )
            )
            .order_by(asc(ApplicationInternalNote.created_at))
        )
        res = await db.execute(stmt)
        return res.scalars().all()

    @staticmethod
    async def delete_internal_note(
        db: AsyncSession, org_id: uuid.UUID, note_id: uuid.UUID
    ) -> bool:
        """Delete an internal note."""
        stmt = select(ApplicationInternalNote).where(
            and_(
                ApplicationInternalNote.id == note_id,
                ApplicationInternalNote.organization_id == org_id
            )
        )
        res = await db.execute(stmt)
        note_obj = res.scalars().first()
        if not note_obj:
            raise HTTPException(status_code=404, detail="Note not found or access denied")

        await db.delete(note_obj)
        await db.commit()
        return True

    @staticmethod
    async def get_dashboard_summary(
        db: AsyncSession, org: IndustryProfile
    ) -> Dict[str, Any]:
        """Get summary statistics and recent lists for the Industry Dashboard."""
        org_id = org.id

        # Opportunities stats
        opps_stmt = select(IndustryOpportunity).where(IndustryOpportunity.organization_id == org_id)
        opps_res = await db.execute(opps_stmt)
        opps = opps_res.scalars().all()

        total_opps = len(opps)
        published_opps = sum(1 for o in opps if o.status in [OpportunityStatus.PUBLISHED, OpportunityStatus.ACTIVE, OpportunityStatus.OPEN])
        draft_opps = sum(1 for o in opps if o.status == OpportunityStatus.DRAFT)
        closed_opps = sum(1 for o in opps if o.status == OpportunityStatus.CLOSED)

        # Applications stats
        apps_stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .where(IndustryOpportunity.organization_id == org_id)
        )
        apps_res = await db.execute(apps_stmt)
        apps = apps_res.scalars().all()

        total_apps = len(apps)
        under_review = sum(1 for a in apps if a.status == ApplicationStatus.UNDER_REVIEW)
        shortlisted = sum(1 for a in apps if a.status == ApplicationStatus.SHORTLISTED)
        interview = sum(1 for a in apps if a.status in [ApplicationStatus.INTERVIEW, ApplicationStatus.INTERVIEWED])
        offered = sum(1 for a in apps if a.status == ApplicationStatus.OFFERED)
        accepted = sum(1 for a in apps if a.status == ApplicationStatus.ACCEPTED)
        rejected = sum(1 for a in apps if a.status == ApplicationStatus.REJECTED)

        # Recent opportunities (top 5)
        recent_opps = await IndustryService.list_opportunities(db, org_id)
        recent_opps_out = recent_opps[:5]

        # Recent applications (top 5)
        recent_apps_out = await IndustryService.list_applicants(db, org_id, sort_by="applied_at")
        recent_apps_out = recent_apps_out[:5]

        return {
            "total_opportunities": total_opps,
            "published_opportunities": published_opps,
            "draft_opportunities": draft_opps,
            "closed_opportunities": closed_opps,
            "total_applications": total_apps,
            "under_review_applications": under_review,
            "shortlisted_applications": shortlisted,
            "interview_applications": interview,
            "offered_applications": offered,
            "accepted_applications": accepted,
            "rejected_applications": rejected,
            "recent_opportunities": recent_opps_out,
            "recent_applications": recent_apps_out,
            "verification_status": org.verification_status
        }

    @staticmethod
    async def get_industry_analytics(
        db: AsyncSession, org: IndustryProfile, period: str = "30d"
    ) -> Dict[str, Any]:
        """Get pipeline funnel, conversion rates, and match score distribution."""
        org_id = org.id

        apps_stmt = (
            select(Application)
            .join(IndustryOpportunity, Application.opportunity_id == IndustryOpportunity.id)
            .where(IndustryOpportunity.organization_id == org_id)
        )
        apps_res = await db.execute(apps_stmt)
        apps = apps_res.scalars().all()

        total_apps = len(apps)
        shortlisted = sum(1 for a in apps if a.status in [ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, ApplicationStatus.INTERVIEWED, ApplicationStatus.OFFERED, ApplicationStatus.ACCEPTED])
        interview = sum(1 for a in apps if a.status in [ApplicationStatus.INTERVIEW, ApplicationStatus.INTERVIEWED, ApplicationStatus.OFFERED, ApplicationStatus.ACCEPTED])
        offered = sum(1 for a in apps if a.status in [ApplicationStatus.OFFERED, ApplicationStatus.ACCEPTED])
        accepted = sum(1 for a in apps if a.status == ApplicationStatus.ACCEPTED)

        interview_rate = round((interview / total_apps * 100), 1) if total_apps > 0 else 0.0
        offer_rate = round((offered / total_apps * 100), 1) if total_apps > 0 else 0.0

        # Match score distribution buckets
        dist = {"90-100%": 0, "75-89%": 0, "60-74%": 0, "Below 60%": 0}
        for a in apps:
            score = a.match_score_snapshot or 0.0
            if score >= 90:
                dist["90-100%"] += 1
            elif score >= 75:
                dist["75-89%"] += 1
            elif score >= 60:
                dist["60-74%"] += 1
            else:
                dist["Below 60%"] += 1

        # Demanded skills
        skill_req_stmt = (
            select(Skill.name, func.count(OpportunityRequiredSkill.id).label("cnt"))
            .join(OpportunityRequiredSkill, OpportunityRequiredSkill.skill_id == Skill.id)
            .join(IndustryOpportunity, OpportunityRequiredSkill.opportunity_id == IndustryOpportunity.id)
            .where(IndustryOpportunity.organization_id == org_id)
            .group_by(Skill.name)
            .order_by(desc("cnt"))
            .limit(5)
        )
        skill_res = await db.execute(skill_req_stmt)
        top_skills = [{"skill_name": r[0], "count": r[1]} for r in skill_res.all()]

        return {
            "period": period,
            "total_opportunities": len(await IndustryService.list_opportunities(db, org_id)),
            "published_opportunities": len([o for o in await IndustryService.list_opportunities(db, org_id) if o.status in [OpportunityStatus.PUBLISHED, OpportunityStatus.ACTIVE]]),
            "total_applications": total_apps,
            "pipeline_funnel": {
                "applied": total_apps,
                "shortlisted": shortlisted,
                "interview": interview,
                "offered": offered,
                "accepted": accepted
            },
            "interview_conversion_rate": interview_rate,
            "offer_conversion_rate": offer_rate,
            "match_score_distribution": dist,
            "top_skill_demands": top_skills
        }
