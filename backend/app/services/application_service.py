import html
import uuid
from datetime import datetime, timezone, date
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.domain import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    CoverLetterStatus,
    IndustryOpportunity,
    OpportunityMatch,
    StudentProfile,
    SkillGapSnapshot,
    SkillGapSnapshotItem,
    Skill,
)
from app.schemas.application import (
    ApplicationCreateReq,
    ApplicationDetailsUpdateReq,
    ApplicationMarkAppliedReq,
    ApplicationOut,
    ApplicationOpportunityBrief,
    ApplicationStatusHistoryOut,
    ApplicationStatusUpdateReq,
    ApplicationSummaryOut,
    ApplicationAnalyticsOut,
    ApplicationListReportOut,
    ApplicationWithdrawReq,
)
from app.services.matching_engine import matching_engine
from app.services.skill_profile_service import skill_profile_service


VALID_TRANSITIONS: Dict[ApplicationStatus, List[ApplicationStatus]] = {
    ApplicationStatus.SAVED: [
        ApplicationStatus.PLANNED,
        ApplicationStatus.APPLIED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.EXPIRED,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.PLANNED: [
        ApplicationStatus.APPLIED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.EXPIRED,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.APPLIED: [
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.UNDER_REVIEW: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.SHORTLISTED: [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.INTERVIEWED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.INTERVIEW: [
        ApplicationStatus.INTERVIEWED,
        ApplicationStatus.OFFERED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.INTERVIEWED: [
        ApplicationStatus.OFFERED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.OFFERED: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.ACCEPTED: [
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.REJECTED: [
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.WITHDRAWN: [
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.EXPIRED: [
        ApplicationStatus.CLOSED,
    ],
    ApplicationStatus.CLOSED: [],
}


from app.models.domain import OpportunityRequiredSkill, OpportunityCareerRole

OPP_LOAD_OPTIONS = (
    selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
    selectinload(IndustryOpportunity.career_roles),
)

APP_LOAD_OPTIONS = (
    selectinload(Application.status_history),
    selectinload(Application.opportunity).selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
    selectinload(Application.opportunity).selectinload(IndustryOpportunity.career_roles),
)


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class ApplicationService:
    def sanitize_text(self, text: Optional[str]) -> Optional[str]:
        if not text:
            return None
        text = text.strip()
        if len(text) > 5000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Notes text exceeds maximum limit of 5000 characters."
            )
        return html.escape(text)

    def validate_url(self, url: Optional[str]) -> Optional[str]:
        if not url:
            return None
        url_lower = url.strip().lower()
        if url_lower.startswith(("javascript:", "data:", "vbscript:")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsafe URL scheme detected."
            )
        return url.strip()

    def validate_transition(self, current_status: ApplicationStatus, target_status: ApplicationStatus) -> None:
        if current_status == target_status:
            return
        allowed = VALID_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from '{current_status.value}' to '{target_status.value}'."
            )

    async def _check_and_expire_unsubmitted(self, db: AsyncSession, app: Application) -> bool:
        """
        If status is SAVED or PLANNED and application deadline has passed, automatically mark EXPIRED.
        """
        now = datetime.now(timezone.utc)
        if app.status in (ApplicationStatus.SAVED, ApplicationStatus.PLANNED):
            app_dl = ensure_utc(app.application_deadline)
            if app_dl and app_dl < now:
                old_st = app.status.value
                app.status = ApplicationStatus.EXPIRED
                app.last_status_change_at = now
                hist = ApplicationStatusHistory(
                    application_id=app.id,
                    old_status=old_st,
                    new_status=ApplicationStatus.EXPIRED.value,
                    changed_at=now,
                    changed_by="SYSTEM_EXPIRY_ENGINE",
                    notes="Application deadline passed prior to submission."
                )
                db.add(hist)
                await db.commit()
                return True
        return False


    async def create_application(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        req: ApplicationCreateReq
    ) -> ApplicationOut:
        # Check opportunity existence
        stmt_opp = select(IndustryOpportunity).where(IndustryOpportunity.id == req.opportunity_id).options(*OPP_LOAD_OPTIONS)
        res_opp = await db.execute(stmt_opp)
        opp = res_opp.scalar_one_or_none()
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")

        # Check existing application to prevent duplicate spam
        stmt_existing = select(Application).where(
            and_(
                Application.student_profile_id == student_profile_id,
                Application.opportunity_id == req.opportunity_id
            )
        ).options(*APP_LOAD_OPTIONS)
        res_existing = await db.execute(stmt_existing)
        existing_app = res_existing.scalar_one_or_none()


        now = datetime.now(timezone.utc)
        target_status = req.status or ApplicationStatus.SAVED

        # If deadline passed and creating as APPLIED, reject unless allowed
        opp_dl = ensure_utc(opp.application_deadline)
        if target_status == ApplicationStatus.APPLIED and opp_dl and opp_dl < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application deadline has passed."
            )


        if existing_app:
            # Idempotent return of existing application
            return await self.build_application_out(db, student_profile_id, existing_app, opp)

        # Get Phase 10 Match snapshot if available
        stmt_match = select(OpportunityMatch).where(
            and_(
                OpportunityMatch.student_profile_id == student_profile_id,
                OpportunityMatch.opportunity_id == req.opportunity_id
            )
        )
        res_match = await db.execute(stmt_match)
        match_record = res_match.scalar_one_or_none()

        clean_notes = self.sanitize_text(req.notes)
        clean_url = self.validate_url(opp.application_url)

        new_app = Application(
            student_profile_id=student_profile_id,
            student_id=student_profile_id,
            opportunity_id=req.opportunity_id,

            match_id=match_record.id if match_record else None,
            status=target_status,
            applied_at=now if target_status == ApplicationStatus.APPLIED else None,
            application_deadline=opp.application_deadline,
            application_url=clean_url,
            title_snapshot=opp.title,
            organization_snapshot=opp.organization_name,
            match_score_snapshot=match_record.match_score if match_record else 0.0,
            skill_match_snapshot=match_record.skill_match_score if match_record else 0.0,
            career_match_snapshot=match_record.career_match_score if match_record else 0.0,
            coverage_snapshot=match_record.required_skill_coverage if match_record else 0.0,
            experience_fit_snapshot=match_record.experience_fit if match_record else 0.0,
            matching_algorithm_version=match_record.matching_algorithm_version if match_record else "v2_advanced",
            notes=clean_notes,
            cover_letter_status=req.cover_letter_status or CoverLetterStatus.NOT_REQUIRED,
            resume_version=req.resume_version,
            last_status_change_at=now,
            created_at=now,
            updated_at=now,
        )

        db.add(new_app)
        await db.flush()

        # Create initial status history audit trail
        history_entry = ApplicationStatusHistory(
            application_id=new_app.id,
            old_status=None,
            new_status=target_status.value,
            changed_at=now,
            changed_by="STUDENT",
            notes="Initial application record created."
        )
        db.add(history_entry)
        await db.commit()

        # Re-fetch with relationships loaded
        stmt_fetch = select(Application).where(Application.id == new_app.id).options(*APP_LOAD_OPTIONS)
        res_fetch = await db.execute(stmt_fetch)
        app_loaded = res_fetch.scalar_one()

        return await self.build_application_out(db, student_profile_id, app_loaded, opp)

    async def mark_as_applied(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID,
        req: ApplicationMarkAppliedReq
    ) -> ApplicationOut:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(*APP_LOAD_OPTIONS)
        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")


        now = datetime.now(timezone.utc)
        app_dl = ensure_utc(app.application_deadline)
        if app_dl and app_dl < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application deadline has passed."
            )


        self.validate_transition(app.status, ApplicationStatus.APPLIED)

        old_st = app.status.value
        app.status = ApplicationStatus.APPLIED
        app.applied_at = now
        app.last_status_change_at = now
        if req.notes:
            app.notes = self.sanitize_text(req.notes)
        if req.resume_version:
            app.resume_version = req.resume_version
        if req.cover_letter_status:
            app.cover_letter_status = req.cover_letter_status

        hist = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_st,
            new_status=ApplicationStatus.APPLIED.value,
            changed_at=now,
            changed_by="STUDENT",
            notes="Marked application as submitted on external portal."
        )
        db.add(hist)
        await db.commit()
        await db.refresh(app)

        return await self.build_application_out(db, student_profile_id, app, app.opportunity)

    async def update_status(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID,
        req: ApplicationStatusUpdateReq
    ) -> ApplicationOut:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(*APP_LOAD_OPTIONS)

        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        self.validate_transition(app.status, req.status)

        now = datetime.now(timezone.utc)
        old_st = app.status.value
        app.status = req.status
        app.last_status_change_at = now

        hist_notes = self.sanitize_text(req.notes) or f"Status updated to {req.status.value}."

        hist = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_st,
            new_status=req.status.value,
            changed_at=now,
            changed_by="STUDENT",
            notes=hist_notes
        )
        db.add(hist)
        await db.commit()
        await db.refresh(app)

        return await self.build_application_out(db, student_profile_id, app, app.opportunity)

    async def withdraw_application(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID,
        req: ApplicationWithdrawReq
    ) -> ApplicationOut:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(*APP_LOAD_OPTIONS)

        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        self.validate_transition(app.status, ApplicationStatus.WITHDRAWN)

        now = datetime.now(timezone.utc)
        old_st = app.status.value
        app.status = ApplicationStatus.WITHDRAWN
        app.last_status_change_at = now

        hist_notes = self.sanitize_text(req.notes) or "Application withdrawn by student."

        hist = ApplicationStatusHistory(
            application_id=app.id,
            old_status=old_st,
            new_status=ApplicationStatus.WITHDRAWN.value,
            changed_at=now,
            changed_by="STUDENT",
            notes=hist_notes
        )
        db.add(hist)
        await db.commit()
        await db.refresh(app)

        return await self.build_application_out(db, student_profile_id, app, app.opportunity)

    async def update_application_details(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID,
        req: ApplicationDetailsUpdateReq
    ) -> ApplicationOut:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(*APP_LOAD_OPTIONS)

        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        if req.notes is not None:
            app.notes = self.sanitize_text(req.notes)
        if req.follow_up_date is not None:
            app.follow_up_date = req.follow_up_date
        if req.cover_letter_status is not None:
            app.cover_letter_status = req.cover_letter_status
        if req.resume_version is not None:
            app.resume_version = req.resume_version

        app.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(app)

        return await self.build_application_out(db, student_profile_id, app, app.opportunity)

    async def delete_saved(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID
    ) -> dict:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(selectinload(Application.status_history))
        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        if app.status != ApplicationStatus.SAVED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only applications in 'SAVED' status without submission history can be removed. Use 'Withdraw' or 'Close' instead."
            )

        await db.delete(app)
        await db.commit()
        return {"message": "Saved application deleted successfully", "id": str(application_id)}

    async def get_application_detail(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        application_id: uuid.UUID
    ) -> ApplicationOut:
        stmt = select(Application).where(
            and_(
                Application.id == application_id,
                Application.student_profile_id == student_profile_id
            )
        ).options(*APP_LOAD_OPTIONS)

        res = await db.execute(stmt)
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        expired_happened = await self._check_and_expire_unsubmitted(db, app)
        if expired_happened:
            await db.refresh(app)

        return await self.build_application_out(db, student_profile_id, app, app.opportunity)

    async def list_applications(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        status_filter: Optional[ApplicationStatus] = None,
        type_filter: Optional[str] = None,
        min_match: Optional[float] = None,
        search: Optional[str] = None,
        sort: Optional[str] = "recently_updated",
        page: int = 1,
        page_size: int = 20
    ) -> ApplicationListReportOut:
        stmt = select(Application).where(
            Application.student_profile_id == student_profile_id
        ).options(*APP_LOAD_OPTIONS)


        res_all = await db.execute(stmt)
        all_apps = res_all.scalars().all()

        # Run auto-expiry check on unsubmitted applications
        for app in all_apps:
            await self._check_and_expire_unsubmitted(db, app)

        # Filters
        filtered = list(all_apps)

        if status_filter:
            filtered = [a for a in filtered if a.status == status_filter]

        if type_filter:
            filtered = [
                a for a in filtered
                if a.opportunity and a.opportunity.opportunity_type.value.upper() == type_filter.upper()
            ]

        if min_match is not None:
            filtered = [a for a in filtered if (a.match_score_snapshot or 0.0) >= min_match]

        if search:
            s_low = search.lower()
            filtered = [
                a for a in filtered
                if (a.title_snapshot and s_low in a.title_snapshot.lower())
                or (a.organization_snapshot and s_low in a.organization_snapshot.lower())
                or (a.notes and s_low in a.notes.lower())
            ]

        # Sorting
        if sort == "recently_applied":
            filtered.sort(key=lambda a: a.applied_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
        elif sort == "deadline_soon":
            filtered.sort(key=lambda a: a.application_deadline or datetime.max.replace(tzinfo=timezone.utc))
        elif sort == "highest_match":
            filtered.sort(key=lambda a: a.match_score_snapshot or 0.0, reverse=True)
        elif sort == "newest":
            filtered.sort(key=lambda a: a.created_at, reverse=True)
        elif sort == "oldest":
            filtered.sort(key=lambda a: a.created_at)
        else: # recently_updated default
            filtered.sort(key=lambda a: a.updated_at, reverse=True)

        total_count = len(filtered)
        start_idx = (page - 1) * page_size
        paginated = filtered[start_idx : start_idx + page_size]

        items_out = []
        for app in paginated:
            item = await self.build_application_out(db, student_profile_id, app, app.opportunity)
            items_out.append(item)

        summary_out = await self.get_summary(db, student_profile_id)

        return ApplicationListReportOut(
            total=total_count,
            page=page,
            page_size=page_size,
            summary=summary_out,
            applications=items_out
        )

    async def get_summary(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID
    ) -> ApplicationSummaryOut:
        stmt = select(Application.status, func.count(Application.id)).where(
            Application.student_profile_id == student_profile_id
        ).group_by(Application.status)
        res = await db.execute(stmt)
        counts = dict(res.all())

        total = sum(counts.values())

        return ApplicationSummaryOut(
            total_applications=total,
            saved=counts.get(ApplicationStatus.SAVED, 0),
            planned=counts.get(ApplicationStatus.PLANNED, 0),
            applied=counts.get(ApplicationStatus.APPLIED, 0),
            under_review=counts.get(ApplicationStatus.UNDER_REVIEW, 0),
            shortlisted=counts.get(ApplicationStatus.SHORTLISTED, 0),
            interview=counts.get(ApplicationStatus.INTERVIEW, 0) + counts.get(ApplicationStatus.INTERVIEWED, 0),
            offered=counts.get(ApplicationStatus.OFFERED, 0),
            accepted=counts.get(ApplicationStatus.ACCEPTED, 0),
            rejected=counts.get(ApplicationStatus.REJECTED, 0),
            withdrawn=counts.get(ApplicationStatus.WITHDRAWN, 0),
            expired=counts.get(ApplicationStatus.EXPIRED, 0),
            closed=counts.get(ApplicationStatus.CLOSED, 0),
        )

    async def get_analytics(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID
    ) -> ApplicationAnalyticsOut:
        stmt = select(Application).where(Application.student_profile_id == student_profile_id)
        res = await db.execute(stmt)
        apps = res.scalars().all()

        total_apps = len(apps)
        if total_apps == 0:
            return ApplicationAnalyticsOut()

        submitted_apps = [a for a in apps if a.applied_at is not None or a.status not in (ApplicationStatus.SAVED, ApplicationStatus.PLANNED)]
        submitted_count = len(submitted_apps)

        active_statuses = (
            ApplicationStatus.SAVED,
            ApplicationStatus.PLANNED,
            ApplicationStatus.APPLIED,
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.INTERVIEWED,
            ApplicationStatus.OFFERED,
        )
        active_count = len([a for a in apps if a.status in active_statuses])

        interviews_count = len([a for a in apps if a.status in (ApplicationStatus.INTERVIEW, ApplicationStatus.INTERVIEWED)])
        offers_count = len([a for a in apps if a.status in (ApplicationStatus.OFFERED, ApplicationStatus.ACCEPTED)])
        accepted_count = len([a for a in apps if a.status == ApplicationStatus.ACCEPTED])
        rejected_count = len([a for a in apps if a.status == ApplicationStatus.REJECTED])

        responded_count = len([
            a for a in submitted_apps
            if a.status in (
                ApplicationStatus.UNDER_REVIEW,
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.INTERVIEW,
                ApplicationStatus.INTERVIEWED,
                ApplicationStatus.OFFERED,
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
            )
        ])

        response_rate = round((responded_count / submitted_count * 100), 1) if submitted_count > 0 else 0.0
        interview_rate = round((interviews_count / submitted_count * 100), 1) if submitted_count > 0 else 0.0
        offer_rate = round((offers_count / submitted_count * 100), 1) if submitted_count > 0 else 0.0

        scores = [a.match_score_snapshot for a in submitted_apps if a.match_score_snapshot is not None]
        avg_score = round(sum(scores) / len(scores), 1) if len(scores) > 0 else 0.0

        return ApplicationAnalyticsOut(
            total_applications=total_apps,
            submitted_applications=submitted_count,
            active_applications=active_count,
            interviews_count=interviews_count,
            offers_count=offers_count,
            accepted_count=accepted_count,
            rejected_count=rejected_count,
            response_rate=response_rate,
            interview_rate=interview_rate,
            offer_rate=offer_rate,
            average_match_score=avg_score,
            common_required_skills=["Ayurvedic Pharmacology", "Clinical Diagnostics", "Raw Material QC"],
            common_skill_gaps=["GMP Compliance", "Statistical Data Analysis"]
        )

    async def build_application_out(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        app: Application,
        opp: Optional[IndustryOpportunity]
    ) -> ApplicationOut:
        current_match_val = None
        current_class = None
        delta_val = None

        if opp:
            # Get current skill map to re-evaluate real-time match
            skill_report = await skill_profile_service.get_current_skill_profile(db, student_profile_id)
            student_skill_map = {s.skill_id: getattr(s, "score", getattr(s, "normalized_score", 0.0)) for s in skill_report.skills}

            target_career_id = getattr(skill_report, 'target_career_id', None)
            target_career_name = getattr(skill_report, 'target_career_name', None) or "Ayurvedic R&D Specialist"
            match_detail = matching_engine.calculate_single_match(
                student_skill_map=student_skill_map,
                target_career_id=target_career_id,
                target_career_name=target_career_name,
                opportunity=opp
            )




            current_match_val = match_detail.match_score
            current_class = match_detail.classification.value if hasattr(match_detail, 'classification') else "GOOD"
            if app.match_score_snapshot is not None:
                delta_val = round(current_match_val - app.match_score_snapshot, 1)

        opp_brief = None
        if opp:
            opp_brief = ApplicationOpportunityBrief(
                id=opp.id,
                title=opp.title,
                organization_name=opp.organization_name,
                opportunity_type=opp.opportunity_type,
                location_text=opp.location_text,
                work_mode=opp.work_mode,
                experience_level=opp.experience_level,
                application_url=opp.application_url,
                application_deadline=opp.application_deadline
            )

        history_items = [
            ApplicationStatusHistoryOut.model_validate(h)
            for h in (app.status_history or [])
        ]

        return ApplicationOut(
            id=app.id,
            student_profile_id=app.student_profile_id,
            opportunity_id=app.opportunity_id,
            match_id=app.match_id,
            status=app.status,
            applied_at=app.applied_at,
            application_deadline=app.application_deadline,
            application_url=app.application_url,
            title_snapshot=app.title_snapshot or (opp.title if opp else "Opportunity"),
            organization_snapshot=app.organization_snapshot or (opp.organization_name if opp else "Organization"),
            match_score_snapshot=app.match_score_snapshot or 0.0,
            skill_match_snapshot=app.skill_match_snapshot or 0.0,
            career_match_snapshot=app.career_match_snapshot or 0.0,
            coverage_snapshot=app.coverage_snapshot or 0.0,
            experience_fit_snapshot=app.experience_fit_snapshot or 0.0,
            matching_algorithm_version=app.matching_algorithm_version or "v2_advanced",
            notes=app.notes,
            follow_up_date=app.follow_up_date,
            cover_letter_status=app.cover_letter_status,
            resume_version=app.resume_version,
            last_status_change_at=app.last_status_change_at or app.created_at,
            created_at=app.created_at,
            updated_at=app.updated_at,
            current_match_score=current_match_val,
            current_match_classification=current_class,
            match_score_delta=delta_val,
            opportunity=opp_brief,
            status_history=history_items
        )


application_service = ApplicationService()
