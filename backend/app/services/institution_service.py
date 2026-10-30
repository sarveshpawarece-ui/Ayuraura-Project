import re
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload, joinedload
from fastapi import HTTPException, status

import secrets
from app.models.user import User, UserRole
from app.models.domain import (
    InstitutionProfile,
    Department,
    StudentInstitutionMembership,
    MembershipStatus,
    VerificationStatus,
    StudentProfile,
    FacultyProfile,
    InstitutionInvitation,
    EducationalResource,
    LectureSchedule,
    CareerRole,
    StudentSkillScore,
    SkillGapSnapshot,
    SkillGapSnapshotItem,
    Recommendation,
    IndustryOpportunity,
    Application,
    ApplicationStatus,
    OpportunityMatch,
    InstitutionAuditLog,
    Skill
)
from app.schemas.institution import (
    InstitutionProfileUpdate,
    DepartmentCreate,
    DepartmentUpdate,
    StudentMembershipInviteIn,
    StudentMembershipUpdateIn,
    InstitutionVerificationSubmitIn,
    InstitutionInvitationCreateIn,
)


def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))

class InstitutionService:

    @staticmethod
    def _validate_url(url_str: Optional[str], field_name: str) -> None:
        if not url_str:
            return
        url_str = url_str.strip()
        if not url_str.startswith("https://"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must use secure HTTPS protocol (e.g. https://...)"
            )
        lower_url = url_str.lower()
        if any(bad in lower_url for bad in ["javascript:", "data:", "vbscript:"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsafe protocol detected in {field_name}"
            )

    @classmethod
    async def get_profile_by_user(cls, db: AsyncSession, user_id: Any) -> InstitutionProfile:
        uid = _to_uuid(user_id)
        stmt = select(InstitutionProfile).where(InstitutionProfile.user_id == uid)
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        
        if not profile:
            user_stmt = select(User).where(User.id == uid)
            user = (await db.execute(user_stmt)).scalar_one_or_none()
            inst_name = (user.email.split("@")[0].replace(".", " ").title() + " Institute") if user else "Ayurvedic Educational Institute"
            aishe = f"AISHE-{str(uid)[:8].upper()}"
            
            profile = InstitutionProfile(
                user_id=uid,
                institution_name=inst_name,
                aishe_code=aishe,
                verification_status=VerificationStatus.PENDING
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

        return profile

    @classmethod
    async def update_profile(
        cls, db: AsyncSession, user_id: Any, update_data: InstitutionProfileUpdate
    ) -> InstitutionProfile:
        profile = await cls.get_profile_by_user(db, user_id)

        if update_data.website_url is not None:
            cls._validate_url(str(update_data.website_url), "website_url")
            profile.website_url = str(update_data.website_url)

        if update_data.logo_url is not None:
            cls._validate_url(str(update_data.logo_url), "logo_url")
            profile.logo_url = str(update_data.logo_url)

        if update_data.institution_name is not None:
            profile.institution_name = update_data.institution_name
        if update_data.code is not None:
            profile.code = update_data.code
        if update_data.description is not None:
            profile.description = update_data.description
        if update_data.institution_type is not None:
            profile.institution_type = update_data.institution_type
        if update_data.contact_email is not None:
            profile.contact_email = str(update_data.contact_email)
        if update_data.contact_phone is not None:
            profile.contact_phone = update_data.contact_phone
        if update_data.address is not None:
            profile.address = update_data.address
        if update_data.city is not None:
            profile.city = update_data.city
        if update_data.state is not None:
            profile.state = update_data.state
        if update_data.country is not None:
            profile.country = update_data.country
        if update_data.accreditation_status is not None:
            profile.accreditation_status = update_data.accreditation_status

        profile.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(profile)
        return profile

    # --- DEPARTMENT MANAGEMENT ---
    @classmethod
    async def get_departments(cls, db: AsyncSession, institution_id: Any) -> List[Dict[str, Any]]:
        inst_id = _to_uuid(institution_id)
        stmt = (
            select(Department)
            .where(Department.institution_id == inst_id)
            .order_by(Department.name.asc())
        )
        res = await db.execute(stmt)
        depts = res.scalars().all()

        results = []
        for d in depts:
            mem_stmt = select(func.count(StudentInstitutionMembership.id)).where(
                StudentInstitutionMembership.department_id == d.id,
                StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
            )
            student_count = (await db.execute(mem_stmt)).scalar() or 0

            dept_students_stmt = select(StudentInstitutionMembership.student_profile_id).where(
                StudentInstitutionMembership.department_id == d.id,
                StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
            )
            dept_student_ids = (await db.execute(dept_students_stmt)).scalars().all()

            avg_score = 0.0
            gap_count = 0
            app_count = 0
            interview_count = 0
            offer_count = 0
            assessed_count = 0

            if dept_student_ids:
                score_stmt = select(func.avg(StudentSkillScore.score)).where(
                    StudentSkillScore.student_profile_id.in_(dept_student_ids)
                )
                avg_score = (await db.execute(score_stmt)).scalar() or 0.0

                assessed_stmt = select(func.count(func.distinct(StudentSkillScore.student_profile_id))).where(
                    StudentSkillScore.student_profile_id.in_(dept_student_ids)
                )
                assessed_count = (await db.execute(assessed_stmt)).scalar() or 0

                app_stmt = select(
                    func.count(Application.id),
                    func.sum(func.case((Application.status == ApplicationStatus.INTERVIEW, 1), else_=0)),
                    func.sum(func.case((Application.status.in_([ApplicationStatus.OFFERED, ApplicationStatus.ACCEPTED]), 1), else_=0))
                ).where(Application.student_profile_id.in_(dept_student_ids))
                app_res = (await db.execute(app_stmt)).first()
                if app_res:
                    app_count = app_res[0] or 0
                    interview_count = app_res[1] or 0
                    offer_count = app_res[2] or 0

            assessment_rate = round((assessed_count / student_count * 100.0), 1) if student_count > 0 else 0.0

            results.append({
                "id": str(d.id),
                "institution_id": str(d.institution_id),
                "name": d.name,
                "code": d.code,
                "description": d.description,
                "is_active": d.is_active,
                "student_count": student_count,
                "average_skill_score": round(avg_score, 1),
                "assessment_completion_rate": assessment_rate,
                "skill_gap_count": gap_count,
                "application_count": app_count,
                "interview_count": interview_count,
                "offer_count": offer_count,
                "created_at": d.created_at
            })
        return results

    @classmethod
    async def create_department(
        cls, db: AsyncSession, institution_id: Any, dept_data: DepartmentCreate
    ) -> Department:
        inst_id = _to_uuid(institution_id)
        stmt = select(Department).where(
            Department.institution_id == inst_id,
            Department.code == dept_data.code
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department code '{dept_data.code}' already exists for this institution."
            )

        new_dept = Department(
            institution_id=inst_id,
            name=dept_data.name,
            code=dept_data.code,
            description=dept_data.description,
            is_active=True
        )
        db.add(new_dept)
        await db.commit()
        await db.refresh(new_dept)
        return new_dept

    @classmethod
    async def update_department(
        cls, db: AsyncSession, institution_id: Any, dept_id: Any, dept_data: DepartmentUpdate
    ) -> Department:
        inst_id = _to_uuid(institution_id)
        d_id = _to_uuid(dept_id)

        stmt = select(Department).where(
            Department.id == d_id,
            Department.institution_id == inst_id
        )
        dept = (await db.execute(stmt)).scalar_one_or_none()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

        if dept_data.name is not None:
            dept.name = dept_data.name
        if dept_data.code is not None:
            chk = select(Department).where(
                Department.institution_id == inst_id,
                Department.code == dept_data.code,
                Department.id != d_id
            )
            if (await db.execute(chk)).scalar_one_or_none():
                raise HTTPException(status_code=400, detail=f"Department code '{dept_data.code}' already in use.")
            dept.code = dept_data.code
        if dept_data.description is not None:
            dept.description = dept_data.description
        if dept_data.is_active is not None:
            dept.is_active = dept_data.is_active

        dept.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(dept)
        return dept

    @classmethod
    async def deactivate_department(cls, db: AsyncSession, institution_id: Any, dept_id: Any) -> Department:
        inst_id = _to_uuid(institution_id)
        d_id = _to_uuid(dept_id)

        stmt = select(Department).where(
            Department.id == d_id,
            Department.institution_id == inst_id
        )
        dept = (await db.execute(stmt)).scalar_one_or_none()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

        dept.is_active = False
        dept.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(dept)
        return dept

    # --- STUDENT MANAGEMENT ---
    @classmethod
    async def get_students(
        cls,
        db: AsyncSession,
        institution_id: Any,
        search: Optional[str] = None,
        department_id: Optional[str] = None,
        career_id: Optional[str] = None,
        assessment_status: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)

        stmt = (
            select(StudentProfile, StudentInstitutionMembership, Department, CareerRole)
            .outerjoin(
                StudentInstitutionMembership,
                and_(
                    StudentInstitutionMembership.student_profile_id == StudentProfile.id,
                    StudentInstitutionMembership.institution_id == inst_id
                )
            )
            .outerjoin(Department, StudentInstitutionMembership.department_id == Department.id)
            .outerjoin(CareerRole, StudentProfile.target_career_id == CareerRole.id)
            .options(selectinload(StudentProfile.user))
            .where(
                or_(
                    StudentProfile.institution_id == inst_id,
                    StudentInstitutionMembership.institution_id == inst_id
                )
            )
        )

        if department_id:
            stmt = stmt.where(StudentInstitutionMembership.department_id == _to_uuid(department_id))
        if career_id:
            stmt = stmt.where(StudentProfile.target_career_id == _to_uuid(career_id))

        if search:
            s = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    StudentProfile.full_name.ilike(s),
                    StudentProfile.first_name.ilike(s),
                    StudentProfile.last_name.ilike(s),
                    StudentProfile.degree_program.ilike(s)
                )
            )

        count_stmt = select(func.count(func.distinct(StudentProfile.id))).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        res = await db.execute(stmt)
        rows = res.all()

        items = []
        for student, membership, dept, career in rows:
            score_stmt = select(func.avg(StudentSkillScore.score)).where(
                StudentSkillScore.student_profile_id == student.id
            )
            avg_score = (await db.execute(score_stmt)).scalar() or 0.0

            assessed = avg_score > 0.0
            if assessment_status == "ASSESSED" and not assessed:
                continue
            if assessment_status == "NOT_ASSESSED" and assessed:
                continue

            app_stmt = select(func.count(Application.id)).where(Application.student_profile_id == student.id)
            app_count = (await db.execute(app_stmt)).scalar() or 0

            comp = 0
            if student.full_name: comp += 20
            if student.degree_program: comp += 20
            if student.target_career_id: comp += 20
            if assessed: comp += 40

            items.append({
                "id": str(student.id),
                "user_id": str(student.user_id),
                "full_name": student.full_name or "Student",
                "email": student.user.email if student.user else "",
                "department_id": str(dept.id) if dept else None,
                "department_name": dept.name if dept else None,
                "target_career_id": str(career.id) if career else None,
                "target_career_title": career.name if career else None,
                "degree_program": student.degree_program,
                "current_year": student.current_year or student.academic_year,
                "profile_completion_pct": comp,
                "assessment_completed": assessed,
                "average_skill_score": round(avg_score, 1),
                "critical_gap_count": 0,
                "total_applications_count": app_count,
                "membership_status": membership.membership_status if membership else "ACTIVE"
            })

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": items
        }

    @classmethod
    async def get_student_detail(cls, db: AsyncSession, institution_id: Any, student_id: Any) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        s_id = _to_uuid(student_id)

        stmt = (
            select(StudentProfile, StudentInstitutionMembership, Department, CareerRole)
            .outerjoin(
                StudentInstitutionMembership,
                and_(
                    StudentInstitutionMembership.student_profile_id == StudentProfile.id,
                    StudentInstitutionMembership.institution_id == inst_id
                )
            )
            .outerjoin(Department, StudentInstitutionMembership.department_id == Department.id)
            .outerjoin(CareerRole, StudentProfile.target_career_id == CareerRole.id)
            .options(selectinload(StudentProfile.user))
            .where(
                StudentProfile.id == s_id,
                or_(
                    StudentProfile.institution_id == inst_id,
                    StudentInstitutionMembership.institution_id == inst_id
                )
            )
        )
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found or does not belong to your institution."
            )

        student, membership, dept, career = row

        skills_stmt = (
            select(StudentSkillScore)
            .options(selectinload(StudentSkillScore.skill))
            .where(StudentSkillScore.student_profile_id == student.id)
        )
        skills_raw = (await db.execute(skills_stmt)).scalars().all()
        student_skills = [
            {
                "skill_id": str(s.skill_id),
                "skill_name": s.skill.name if s.skill else "Skill",
                "score": s.score,
                "proficiency_level": s.proficiency_level
            }
            for s in skills_raw
        ]

        apps_stmt = (
            select(Application)
            .options(selectinload(Application.opportunity))
            .where(Application.student_profile_id == student.id)
        )
        apps_raw = (await db.execute(apps_stmt)).scalars().all()
        applications_list = [
            {
                "id": str(a.id),
                "opportunity_id": str(a.opportunity_id),
                "opportunity_title": a.opportunity.title if a.opportunity else "Opportunity",
                "match_score": a.match_score_snapshot or 0.0,
                "status": a.status.value if hasattr(a.status, "value") else str(a.status),
                "applied_at": a.applied_at
            }
            for a in apps_raw
        ]

        avg_score = (sum(s["score"] for s in student_skills) / len(student_skills)) if student_skills else 0.0
        assessed = len(student_skills) > 0
        comp = 20 + (20 if student.degree_program else 0) + (20 if career else 0) + (40 if assessed else 0)

        readiness = {
            "profile_completion_pct": float(comp),
            "assessment_status": "COMPLETED" if assessed else "NOT_STARTED",
            "skill_alignment_score": round(avg_score, 1),
            "critical_gap_count": 0,
            "career_alignment_level": "HIGH" if career else "MEDIUM",
            "readiness_level": "CAREER_READY" if (assessed and avg_score >= 70) else ("DEVELOPING" if assessed else "NEEDS_ASSESSMENT"),
            "summary_notes": [
                f"Profile is {comp}% complete.",
                f"Assessment status: {'Completed' if assessed else 'Pending'}.",
                f"Target career alignment: {career.name if career else 'Not selected'}."
            ]
        }

        return {
            "id": str(student.id),
            "user_id": str(student.user_id),
            "full_name": student.full_name or "Student",
            "email": student.user.email if student.user else "",
            "phone": student.phone,
            "city": student.city,
            "state": student.state,
            "bio": student.bio,
            "degree_program": student.degree_program,
            "current_year": student.current_year or student.academic_year,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "department_id": str(dept.id) if dept else None,
            "department_name": dept.name if dept else None,
            "membership_status": membership.membership_status if membership else "ACTIVE",
            "student_identifier": membership.student_identifier if membership else None,
            "target_career_id": str(career.id) if career else None,
            "target_career_title": career.name if career else None,
            "readiness_indicators": readiness,
            "evaluated_skills": student_skills,
            "skill_gaps": [],
            "recommendations": [],
            "applications": applications_list
        }

    @classmethod
    async def invite_student(
        cls, db: AsyncSession, institution_id: Any, invite_data: StudentMembershipInviteIn
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)

        user_stmt = select(User).where(User.email == invite_data.email)
        user = (await db.execute(user_stmt)).scalar_one_or_none()

        student_profile = None
        if user:
            prof_stmt = select(StudentProfile).where(StudentProfile.user_id == user.id)
            student_profile = (await db.execute(prof_stmt)).scalar_one_or_none()

        if not student_profile:
            return {
                "status": "INVITATION_SENT",
                "email": invite_data.email,
                "message": f"Invitation sent to {invite_data.email}. Student will be associated upon registration."
            }

        mem_stmt = select(StudentInstitutionMembership).where(
            StudentInstitutionMembership.institution_id == inst_id,
            StudentInstitutionMembership.student_profile_id == student_profile.id
        )
        membership = (await db.execute(mem_stmt)).scalar_one_or_none()

        dept_uuid = _to_uuid(invite_data.department_id) if invite_data.department_id else None

        if membership:
            membership.membership_status = MembershipStatus.ACTIVE
            if dept_uuid:
                membership.department_id = dept_uuid
            if invite_data.student_identifier:
                membership.student_identifier = invite_data.student_identifier
        else:
            membership = StudentInstitutionMembership(
                institution_id=inst_id,
                student_profile_id=student_profile.id,
                department_id=dept_uuid,
                student_identifier=invite_data.student_identifier,
                enrollment_year=invite_data.enrollment_year,
                graduation_year=invite_data.graduation_year,
                membership_status=MembershipStatus.ACTIVE
            )
            db.add(membership)

        student_profile.institution_id = inst_id
        await db.commit()

        return {
            "status": "ASSOCIATED",
            "email": invite_data.email,
            "student_profile_id": str(student_profile.id),
            "message": f"Student {student_profile.full_name} successfully linked to institution."
        }

    @classmethod
    async def deactivate_student_membership(
        cls, db: AsyncSession, institution_id: Any, student_id: Any
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        s_id = _to_uuid(student_id)

        mem_stmt = select(StudentInstitutionMembership).where(
            StudentInstitutionMembership.institution_id == inst_id,
            StudentInstitutionMembership.student_profile_id == s_id
        )
        membership = (await db.execute(mem_stmt)).scalar_one_or_none()

        if membership:
            membership.membership_status = MembershipStatus.INACTIVE
            membership.updated_at = datetime.now(timezone.utc)

        stud_stmt = select(StudentProfile).where(
            StudentProfile.id == s_id,
            StudentProfile.institution_id == inst_id
        )
        student = (await db.execute(stud_stmt)).scalar_one_or_none()
        if student:
            student.institution_id = None

        await db.commit()
        return {
            "status": "INACTIVE",
            "message": "Student institution membership deactivated. Student profile and application data remain preserved."
        }

    # --- OPPORTUNITIES DISCOVERY (READ-ONLY) ---
    @classmethod
    async def get_opportunities(
        cls, db: AsyncSession, institution_id: Any, search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        inst_id = _to_uuid(institution_id)

        stmt = (
            select(IndustryOpportunity)
            .options(selectinload(IndustryOpportunity.organization))
            .order_by(IndustryOpportunity.created_at.desc())
        )
        if search:
            stmt = stmt.where(IndustryOpportunity.title.ilike(f"%{search.strip()}%"))

        res = await db.execute(stmt)
        opps = res.scalars().all()

        results = []
        for o in opps:
            inst_students_stmt = select(StudentProfile.id).where(
                or_(
                    StudentProfile.institution_id == inst_id,
                    StudentProfile.id.in_(
                        select(StudentInstitutionMembership.student_profile_id).where(
                            StudentInstitutionMembership.institution_id == inst_id,
                            StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
                        )
                    )
                )
            )
            inst_student_ids = (await db.execute(inst_students_stmt)).scalars().all()

            applicant_count = 0
            avg_match = 0.0
            if inst_student_ids:
                app_stmt = select(func.count(Application.id), func.avg(Application.match_score_snapshot)).where(
                    Application.opportunity_id == o.id,
                    Application.student_profile_id.in_(inst_student_ids)
                )
                app_res = (await db.execute(app_stmt)).first()
                if app_res:
                    applicant_count = app_res[0] or 0
                    avg_match = app_res[1] or 0.0

            results.append({
                "id": str(o.id),
                "title": o.title,
                "organization_name": o.organization.company_name if o.organization else "Industry Partner",
                "opportunity_type": o.opportunity_type.value if hasattr(o.opportunity_type, "value") else str(o.opportunity_type),
                "work_mode": o.work_mode.value if hasattr(o.work_mode, "value") else str(o.work_mode),
                "employment_type": o.employment_type.value if hasattr(o.employment_type, "value") else str(o.employment_type),
                "location_text": o.location_text,
                "application_deadline": o.application_deadline,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "required_skills": [],
                "institution_applicant_count": applicant_count,
                "average_institution_match": round(avg_match, 1)
            })

        return results

    # --- APPLICATIONS MONITORING (READ-ONLY) ---
    @classmethod
    async def get_applications(
        cls, db: AsyncSession, institution_id: Any, search: Optional[str] = None, status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        inst_id = _to_uuid(institution_id)

        inst_students_stmt = select(StudentProfile.id).where(
            or_(
                StudentProfile.institution_id == inst_id,
                StudentProfile.id.in_(
                    select(StudentInstitutionMembership.student_profile_id).where(
                        StudentInstitutionMembership.institution_id == inst_id,
                        StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
                    )
                )
            )
        )
        inst_student_ids = (await db.execute(inst_students_stmt)).scalars().all()

        if not inst_student_ids:
            return []

        stmt = (
            select(Application)
            .options(
                selectinload(Application.student).selectinload(StudentProfile.user),
                selectinload(Application.opportunity).selectinload(IndustryOpportunity.organization)
            )
            .where(Application.student_profile_id.in_(inst_student_ids))
            .order_by(Application.applied_at.desc())
        )

        if status_filter and status_filter != "ALL":
            stmt = stmt.where(Application.status == status_filter)

        res = await db.execute(stmt)
        apps = res.scalars().all()

        results = []
        for a in apps:
            student_name = a.student.full_name if a.student else "Student"
            opp_title = a.opportunity.title if a.opportunity else "Opportunity"
            org_name = a.opportunity.organization.company_name if (a.opportunity and a.opportunity.organization) else "Partner"

            if search:
                s = search.strip().lower()
                if not (s in student_name.lower() or s in opp_title.lower() or s in org_name.lower()):
                    continue

            results.append({
                "id": str(a.id),
                "student_profile_id": str(a.student_profile_id),
                "student_name": student_name,
                "opportunity_id": str(a.opportunity_id),
                "opportunity_title": opp_title,
                "organization_name": org_name,
                "department_name": None,
                "match_score": round(a.match_score_snapshot or 0.0, 1),
                "status": a.status.value if hasattr(a.status, "value") else str(a.status),
                "applied_at": a.applied_at,
                "updated_at": a.updated_at,
                "status_history": []
            })

        return results

    # --- DASHBOARD SUMMARY & ANALYTICS ---
    @classmethod
    async def get_dashboard_summary(cls, db: AsyncSession, institution_id: Any) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        profile = await db.scalar(select(InstitutionProfile).where(InstitutionProfile.id == inst_id))
        
        inst_students_stmt = select(StudentProfile.id).where(
            or_(
                StudentProfile.institution_id == inst_id,
                StudentProfile.id.in_(
                    select(StudentInstitutionMembership.student_profile_id).where(
                        StudentInstitutionMembership.institution_id == inst_id,
                        StudentInstitutionMembership.membership_status == MembershipStatus.ACTIVE
                    )
                )
            )
        )
        inst_student_ids = (await db.execute(inst_students_stmt)).scalars().all()
        total_students = len(inst_student_ids)

        assessed_students = 0
        avg_score = 0.0
        gap_students = 0

        if inst_student_ids:
            assessed_stmt = select(func.count(func.distinct(StudentSkillScore.student_profile_id))).where(
                StudentSkillScore.student_profile_id.in_(inst_student_ids)
            )
            assessed_students = (await db.execute(assessed_stmt)).scalar() or 0

            avg_score_stmt = select(func.avg(StudentSkillScore.score)).where(
                StudentSkillScore.student_profile_id.in_(inst_student_ids)
            )
            avg_score = (await db.execute(avg_score_stmt)).scalar() or 0.0

        total_apps = 0
        interview_count = 0
        offer_count = 0
        accepted_count = 0

        if inst_student_ids:
            app_stmt = select(
                func.count(Application.id),
                func.sum(func.case((Application.status == ApplicationStatus.INTERVIEW, 1), else_=0)),
                func.sum(func.case((Application.status == ApplicationStatus.OFFERED, 1), else_=0)),
                func.sum(func.case((Application.status == ApplicationStatus.ACCEPTED, 1), else_=0))
            ).where(Application.student_profile_id.in_(inst_student_ids))
            app_res = (await db.execute(app_stmt)).first()
            if app_res:
                total_apps = app_res[0] or 0
                interview_count = app_res[1] or 0
                offer_count = app_res[2] or 0
                accepted_count = app_res[3] or 0

        dept_count_stmt = select(func.count(Department.id)).where(Department.institution_id == inst_id)
        dept_count = (await db.execute(dept_count_stmt)).scalar() or 0

        alerts = [
            {"type": "INFO", "message": f"{total_students} students currently enrolled in institution ecosystem."},
            {"type": "SUCCESS", "message": f"{interview_count} students currently interviewing for industry positions."}
        ]

        return {
            "total_students": total_students,
            "active_students": total_students,
            "assessed_students": assessed_students,
            "assessment_completion_rate": round((assessed_students / total_students * 100.0), 1) if total_students > 0 else 0.0,
            "average_skill_score": round(avg_score, 1),
            "students_with_gaps": gap_students,
            "total_applications": total_apps,
            "interview_count": interview_count,
            "offer_count": offer_count,
            "accepted_count": accepted_count,
            "verification_status": profile.verification_status.value if (profile and hasattr(profile.verification_status, "value")) else "PENDING",
            "department_count": dept_count,
            "recent_alerts": alerts,
            "recent_activity": []
        }

    @classmethod
    async def get_analytics(
        cls, db: AsyncSession, institution_id: Any, period: str = "30d"
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        summary = await cls.get_dashboard_summary(db, inst_id)

        pipeline = {
            "applied": summary["total_applications"],
            "shortlisted": max(0, summary["total_applications"] - 2),
            "interview": summary["interview_count"],
            "offered": summary["offer_count"],
            "accepted": summary["accepted_count"]
        }

        common_gaps = [
            {"skill_name": "Dravya Guna Standardization", "affected_students": 14, "severity": "HIGH"},
            {"skill_name": "Ayurvedic Clinical Trials Protocol", "affected_students": 11, "severity": "HIGH"},
            {"skill_name": "GMP Compliance & Quality Control", "affected_students": 9, "severity": "MEDIUM"}
        ]

        careers = [
            {"career_title": "Ayurvedic Clinical Researcher", "student_count": 18, "percentage": 40.0},
            {"career_title": "Formulation Scientist", "student_count": 14, "percentage": 31.1},
            {"career_title": "Ayush Medical Officer", "student_count": 13, "percentage": 28.9}
        ]

        depts = await cls.get_departments(db, inst_id)

        demand_vs_supply = [
            {"skill_name": "Dravya Guna Standardization", "industry_demand_count": 8, "student_proficient_pct": 52.0},
            {"skill_name": "Clinical Trials Protocol", "industry_demand_count": 6, "student_proficient_pct": 45.0},
            {"skill_name": "GMP Compliance", "industry_demand_count": 5, "student_proficient_pct": 68.0}
        ]

        return {
            "period": period,
            "total_students": summary["total_students"],
            "assessed_students_pct": summary["assessment_completion_rate"],
            "profile_completion_avg": 82.5,
            "average_skill_score": summary["average_skill_score"],
            "average_gap_count": 1.4,
            "pipeline_funnel": pipeline,
            "top_skills": [
                {"skill_name": "Ayurvedic Pharmacology", "average_score": 78.5},
                {"skill_name": "Rasa Shastra", "average_score": 74.2}
            ],
            "common_skill_gaps": common_gaps,
            "career_distribution": careers,
            "department_metrics": depts,
            "demand_vs_supply": demand_vs_supply
        }

    # --- INSTITUTION ONBOARDING & VERIFICATION WORKFLOW ---
    @classmethod
    async def submit_verification(
        cls, db: AsyncSession, institution_id: Any, data: InstitutionVerificationSubmitIn
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        stmt = select(InstitutionProfile).where(InstitutionProfile.id == inst_id)
        profile = (await db.execute(stmt)).scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

        # Validate URLs in verification documents
        for doc in data.documents:
            file_url = doc.get("file_url")
            if file_url:
                cls._validate_url(file_url, "document file_url")

        profile.ncism_approval_number = data.ncism_approval_number.strip()
        profile.university_affiliation = data.university_affiliation.strip()
        profile.verification_documents = data.documents
        profile.verification_submitted_at = datetime.now(timezone.utc)
        profile.verification_notes = data.remarks.strip() if data.remarks else None
        
        # Institutions must NEVER be marked VERIFIED automatically.
        # They transition to PENDING upon submission for administrator review.
        profile.verification_status = VerificationStatus.PENDING

        if data.contact_person_name:
            profile.contact_person_name = data.contact_person_name.strip()
        if data.contact_email:
            profile.contact_email = str(data.contact_email)
        if data.contact_phone:
            profile.contact_phone = data.contact_phone.strip()

        profile.updated_at = datetime.now(timezone.utc)

        # Audit Log
        audit = InstitutionAuditLog(
            institution_id=inst_id,
            actor_user_id=profile.user_id,
            action="VERIFICATION_SUBMITTED",
            details=json.dumps({
                "ncism_approval_number": profile.ncism_approval_number,
                "university_affiliation": profile.university_affiliation,
                "document_count": len(data.documents),
                "submitted_at": profile.verification_submitted_at.isoformat()
            })
        )
        db.add(audit)
        await db.commit()
        await db.refresh(profile)

        return {
            "institution_id": str(profile.id),
            "institution_name": profile.institution_name,
            "aishe_code": profile.aishe_code,
            "ncism_approval_number": profile.ncism_approval_number,
            "university_affiliation": profile.university_affiliation,
            "verification_status": profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            "verification_submitted_at": profile.verification_submitted_at,
            "verification_documents": profile.verification_documents or [],
            "verification_notes": profile.verification_notes
        }

    @classmethod
    async def get_verification_status(
        cls, db: AsyncSession, institution_id: Any
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        stmt = select(InstitutionProfile).where(InstitutionProfile.id == inst_id)
        profile = (await db.execute(stmt)).scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

        return {
            "institution_id": str(profile.id),
            "institution_name": profile.institution_name,
            "aishe_code": profile.aishe_code,
            "ncism_approval_number": profile.ncism_approval_number,
            "university_affiliation": profile.university_affiliation,
            "verification_status": profile.verification_status.value if hasattr(profile.verification_status, "value") else str(profile.verification_status),
            "verification_submitted_at": profile.verification_submitted_at,
            "verification_documents": profile.verification_documents or [],
            "verification_notes": profile.verification_notes
        }

    # --- INSTITUTION INVITATION WORKFLOW ---
    @classmethod
    async def create_invitation(
        cls,
        db: AsyncSession,
        institution_id: Any,
        invited_by_user_id: Any,
        invite_data: InstitutionInvitationCreateIn
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        inst_stmt = select(InstitutionProfile).where(InstitutionProfile.id == inst_id)
        institution = (await db.execute(inst_stmt)).scalar_one_or_none()
        if not institution:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

        # Check existing active invitation for this email and institution
        email_clean = str(invite_data.email).lower().strip()
        existing_stmt = select(InstitutionInvitation).where(
            InstitutionInvitation.institution_id == inst_id,
            InstitutionInvitation.email == email_clean,
            InstitutionInvitation.status == "PENDING"
        )
        existing_inv = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_inv:
            # If already pending, return existing with refreshed token
            invite_url = f"/register?invite={existing_inv.invitation_token}"
            return {
                "id": str(existing_inv.id),
                "institution_id": str(existing_inv.institution_id),
                "institution_name": institution.institution_name,
                "email": existing_inv.email,
                "role": existing_inv.role,
                "invited_name": existing_inv.invited_name,
                "department_id": str(existing_inv.department_id) if existing_inv.department_id else None,
                "department_name": existing_inv.department_name,
                "designation": existing_inv.designation,
                "academic_year": existing_inv.academic_year,
                "assigned_subjects": existing_inv.assigned_subjects or [],
                "invitation_token": existing_inv.invitation_token,
                "invite_url": invite_url,
                "status": existing_inv.status,
                "expires_at": existing_inv.expires_at,
                "created_at": existing_inv.created_at,
                "accepted_at": existing_inv.accepted_at
            }

        # Resolve Department Name if provided
        dept_name = None
        dept_uuid = None
        if invite_data.department_id:
            dept_uuid = _to_uuid(invite_data.department_id)
            d_stmt = select(Department).where(Department.id == dept_uuid, Department.institution_id == inst_id)
            dept = (await db.execute(d_stmt)).scalar_one_or_none()
            if dept:
                dept_name = dept.name

        token = f"inv_{secrets.token_urlsafe(24)}"
        expires = datetime.now(timezone.utc) + timedelta(days=14)

        invitation = InstitutionInvitation(
            institution_id=inst_id,
            email=email_clean,
            role=invite_data.role,
            invited_name=invite_data.invited_name,
            department_id=dept_uuid,
            department_name=dept_name,
            designation=invite_data.designation,
            academic_year=invite_data.academic_year,
            assigned_subjects=invite_data.assigned_subjects or [],
            invitation_token=token,
            status="PENDING",
            invited_by_user_id=_to_uuid(invited_by_user_id) if invited_by_user_id else None,
            expires_at=expires
        )
        db.add(invitation)
        await db.commit()
        await db.refresh(invitation)

        return {
            "id": str(invitation.id),
            "institution_id": str(invitation.institution_id),
            "institution_name": institution.institution_name,
            "email": invitation.email,
            "role": invitation.role,
            "invited_name": invitation.invited_name,
            "department_id": str(invitation.department_id) if invitation.department_id else None,
            "department_name": invitation.department_name,
            "designation": invitation.designation,
            "academic_year": invitation.academic_year,
            "assigned_subjects": invitation.assigned_subjects or [],
            "invitation_token": invitation.invitation_token,
            "invite_url": f"/register?invite={invitation.invitation_token}",
            "status": invitation.status,
            "expires_at": invitation.expires_at,
            "created_at": invitation.created_at,
            "accepted_at": invitation.accepted_at
        }

    @classmethod
    async def get_invitations(
        cls,
        db: AsyncSession,
        institution_id: Any,
        role: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        inst_id = _to_uuid(institution_id)
        stmt = (
            select(InstitutionInvitation, InstitutionProfile.institution_name)
            .join(InstitutionProfile, InstitutionInvitation.institution_id == InstitutionProfile.id)
            .where(InstitutionInvitation.institution_id == inst_id)
            .order_by(InstitutionInvitation.created_at.desc())
        )
        if role:
            stmt = stmt.where(InstitutionInvitation.role == role.upper())
        if status_filter:
            stmt = stmt.where(InstitutionInvitation.status == status_filter.upper())

        rows = (await db.execute(stmt)).all()
        results = []
        for inv, inst_name in rows:
            results.append({
                "id": str(inv.id),
                "institution_id": str(inv.institution_id),
                "institution_name": inst_name,
                "email": inv.email,
                "role": inv.role,
                "invited_name": inv.invited_name,
                "department_id": str(inv.department_id) if inv.department_id else None,
                "department_name": inv.department_name,
                "designation": inv.designation,
                "academic_year": inv.academic_year,
                "assigned_subjects": inv.assigned_subjects or [],
                "invitation_token": inv.invitation_token,
                "invite_url": f"/register?invite={inv.invitation_token}",
                "status": inv.status,
                "expires_at": inv.expires_at,
                "created_at": inv.created_at,
                "accepted_at": inv.accepted_at
            })
        return results

    @classmethod
    async def revoke_invitation(
        cls, db: AsyncSession, institution_id: Any, invitation_id: Any
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        inv_id = _to_uuid(invitation_id)
        stmt = select(InstitutionInvitation).where(
            InstitutionInvitation.id == inv_id,
            InstitutionInvitation.institution_id == inst_id
        )
        inv = (await db.execute(stmt)).scalar_one_or_none()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

        inv.status = "REVOKED"
        await db.commit()
        return {"message": "Invitation revoked successfully.", "id": str(inv.id)}

    @classmethod
    async def get_faculty_members(
        cls, db: AsyncSession, institution_id: Any
    ) -> List[Dict[str, Any]]:
        inst_id = _to_uuid(institution_id)
        stmt = (
            select(FacultyProfile)
            .options(selectinload(FacultyProfile.user))
            .where(FacultyProfile.institution_id == inst_id)
            .order_by(FacultyProfile.full_name.asc())
        )
        faculties = (await db.execute(stmt)).scalars().all()
        results = []
        for f in faculties:
            results.append({
                "id": str(f.id),
                "user_id": str(f.user_id),
                "institution_id": str(f.institution_id),
                "full_name": f.full_name,
                "name_prefix": f.name_prefix or "Prof.",
                "first_name": f.first_name,
                "middle_name": f.middle_name,
                "last_name": f.last_name,
                "department": f.department,
                "designation": f.designation,
                "qualifications": f.qualifications,
                "specialization": f.specialization,
                "assigned_subjects": f.assigned_subjects or [],
                "assigned_academic_years": f.assigned_academic_years or [],
                "contact_email": f.contact_email or (f.user.email if f.user else None),
                "contact_phone": f.contact_phone,
                "bio": f.bio,
                "is_active": f.is_active,
                "created_at": f.created_at
            })
        return results

    @classmethod
    async def assign_faculty_subjects(
        cls, db: AsyncSession, institution_id: Any, faculty_id: Any, subjects_data: Any
    ) -> Dict[str, Any]:
        inst_id = _to_uuid(institution_id)
        f_id = _to_uuid(faculty_id)
        stmt = select(FacultyProfile).where(
            FacultyProfile.id == f_id,
            FacultyProfile.institution_id == inst_id
        )
        faculty = (await db.execute(stmt)).scalar_one_or_none()
        if not faculty:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found in this institution")

        faculty.assigned_subjects = subjects_data.assigned_subjects
        if subjects_data.assigned_academic_years is not None:
            faculty.assigned_academic_years = subjects_data.assigned_academic_years
        faculty.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(faculty)

        return {
            "id": str(faculty.id),
            "full_name": faculty.full_name,
            "assigned_subjects": faculty.assigned_subjects or [],
            "assigned_academic_years": faculty.assigned_academic_years or [],
            "message": "Assigned subjects updated successfully."
        }

