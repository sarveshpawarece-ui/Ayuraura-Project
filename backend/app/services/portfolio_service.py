import re
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.user import User
from app.models.domain import (
    StudentProfile,
    CareerRole,
    StudentSkillScore,
    AssessmentAttempt,
    Recommendation,
    Application,
    ApplicationStatus,
    Portfolio,
    PortfolioVisibility,
    PortfolioProject,
    PortfolioExperience,
    PortfolioCertification,
    PortfolioAchievement,
    PortfolioEducation
)
from app.schemas.portfolio import (
    PortfolioUpdateIn,
    ProjectCreate,
    ProjectUpdate,
    ExperienceCreate,
    ExperienceUpdate,
    CertificationCreate,
    CertificationUpdate,
    AchievementCreate,
    AchievementUpdate,
    EducationCreate,
    EducationUpdate
)

RESERVED_SLUGS = {
    "admin", "api", "login", "register", "student", "industry", "institution",
    "portfolio", "dashboard", "settings", "null", "undefined", "public", "auth"
}

def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))

def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

class PortfolioService:

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
        lower = url_str.lower()
        if any(bad in lower for bad in ["javascript:", "data:", "vbscript:"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsafe protocol in {field_name}"
            )

    @classmethod
    async def _generate_unique_slug(cls, db: AsyncSession, base_text: str, student_id: uuid.UUID) -> str:
        clean_base = _slugify(base_text)
        if not clean_base or clean_base in RESERVED_SLUGS:
            clean_base = "student-portfolio"

        slug_candidate = clean_base
        counter = 1

        while True:
            # Check if slug exists for another portfolio
            stmt = select(Portfolio).where(Portfolio.slug == slug_candidate, Portfolio.student_profile_id != student_id)
            existing = (await db.execute(stmt)).scalar_one_or_none()
            if not existing and slug_candidate not in RESERVED_SLUGS:
                return slug_candidate
            
            slug_candidate = f"{clean_base}-{counter}"
            counter += 1

    @classmethod
    async def get_or_create_portfolio(cls, db: AsyncSession, student_profile_id: Any) -> Portfolio:
        s_id = _to_uuid(student_profile_id)
        
        stmt = (
            select(Portfolio)
            .options(
                selectinload(Portfolio.projects),
                selectinload(Portfolio.experiences),
                selectinload(Portfolio.certifications),
                selectinload(Portfolio.achievements),
                selectinload(Portfolio.educations)
            )
            .where(Portfolio.student_profile_id == s_id)
        )
        res = await db.execute(stmt)
        portfolio = res.scalar_one_or_none()

        if not portfolio:
            # Fetch student profile for default slug
            stud_stmt = select(StudentProfile).where(StudentProfile.id == s_id)
            student = (await db.execute(stud_stmt)).scalar_one_or_none()
            
            base_name = student.full_name if (student and student.full_name) else "ayurvedic-student"
            slug = await cls._generate_unique_slug(db, base_name, s_id)

            portfolio = Portfolio(
                student_profile_id=s_id,
                title=f"{student.full_name or 'Student'}'s Portfolio",
                headline=f"Aspiring {student.degree_program or 'Ayurvedic'} Professional",
                summary=student.bio if student else None,
                slug=slug,
                visibility=PortfolioVisibility.PRIVATE,
                is_published=False,
                contact_email_public=False,
                show_skill_scores=True,
                show_skill_gaps=False,
                section_config={
                    "about": {"visible": True, "order": 1},
                    "career": {"visible": True, "order": 2},
                    "skills": {"visible": True, "order": 3},
                    "projects": {"visible": True, "order": 4},
                    "education": {"visible": True, "order": 5},
                    "experience": {"visible": True, "order": 6},
                    "certifications": {"visible": True, "order": 7},
                    "achievements": {"visible": True, "order": 8},
                    "contact": {"visible": True, "order": 9}
                }
            )
            db.add(portfolio)
            await db.commit()

        # Re-fetch with selectinload for all relationships to avoid MissingGreenlet
        res = await db.execute(stmt)
        return res.scalar_one()

    @classmethod
    async def update_portfolio(
        cls, db: AsyncSession, student_profile_id: Any, update_in: PortfolioUpdateIn
    ) -> Portfolio:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        if update_in.slug is not None:
            clean_slug = _slugify(update_in.slug)
            if clean_slug in RESERVED_SLUGS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Slug '{clean_slug}' is reserved and cannot be used."
                )
            stmt = select(Portfolio).where(Portfolio.slug == clean_slug, Portfolio.student_profile_id != s_id)
            if (await db.execute(stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Slug '{clean_slug}' is already taken."
                )
            portfolio.slug = clean_slug

        if update_in.title is not None:
            portfolio.title = update_in.title
        if update_in.headline is not None:
            portfolio.headline = update_in.headline
        if update_in.summary is not None:
            portfolio.summary = update_in.summary
        if update_in.visibility is not None:
            portfolio.visibility = update_in.visibility
        if update_in.contact_email_public is not None:
            portfolio.contact_email_public = update_in.contact_email_public
        if update_in.contact_phone_public is not None:
            portfolio.contact_phone_public = update_in.contact_phone_public
        if update_in.show_skill_scores is not None:
            portfolio.show_skill_scores = update_in.show_skill_scores
        if update_in.show_skill_gaps is not None:
            portfolio.show_skill_gaps = update_in.show_skill_gaps
        if update_in.show_assessments is not None:
            portfolio.show_assessments = update_in.show_assessments
        if update_in.show_recommendations is not None:
            portfolio.show_recommendations = update_in.show_recommendations
        if update_in.show_applications is not None:
            portfolio.show_applications = update_in.show_applications

        portfolio.updated_at = datetime.now(timezone.utc)
        await db.commit()

        return await cls.get_or_create_portfolio(db, s_id)

    @classmethod
    async def publish_portfolio(cls, db: AsyncSession, student_profile_id: Any) -> Portfolio:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        portfolio.is_published = True
        portfolio.published_at = datetime.now(timezone.utc)
        if portfolio.visibility == PortfolioVisibility.PRIVATE:
            portfolio.visibility = PortfolioVisibility.PUBLIC

        portfolio.updated_at = datetime.now(timezone.utc)
        await db.commit()

        return await cls.get_or_create_portfolio(db, s_id)

    @classmethod
    async def unpublish_portfolio(cls, db: AsyncSession, student_profile_id: Any) -> Portfolio:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        portfolio.is_published = False
        portfolio.visibility = PortfolioVisibility.PRIVATE
        portfolio.updated_at = datetime.now(timezone.utc)
        await db.commit()

        return await cls.get_or_create_portfolio(db, s_id)


    # --- PROJECT CRUD ---
    @classmethod
    async def create_project(cls, db: AsyncSession, student_profile_id: Any, data: ProjectCreate) -> PortfolioProject:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        if data.project_url:
            cls._validate_url(data.project_url, "project_url")
        if data.repository_url:
            cls._validate_url(data.repository_url, "repository_url")
        if data.image_url:
            cls._validate_url(data.image_url, "image_url")

        project = PortfolioProject(
            portfolio_id=portfolio.id,
            student_profile_id=s_id,
            title=data.title,
            description=data.description,
            role=data.role,
            technologies=data.technologies,
            skills_used=data.skills_used,
            project_url=data.project_url,
            repository_url=data.repository_url,
            image_url=data.image_url,
            start_date=data.start_date,
            end_date=data.end_date,
            is_featured=data.is_featured,
            visibility=data.visibility,
            sort_order=data.sort_order
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @classmethod
    async def update_project(cls, db: AsyncSession, student_profile_id: Any, project_id: Any, data: ProjectUpdate) -> PortfolioProject:
        s_id = _to_uuid(student_profile_id)
        p_id = _to_uuid(project_id)

        stmt = select(PortfolioProject).where(PortfolioProject.id == p_id, PortfolioProject.student_profile_id == s_id)
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied.")

        if data.project_url is not None:
            cls._validate_url(data.project_url, "project_url")
            project.project_url = data.project_url
        if data.repository_url is not None:
            cls._validate_url(data.repository_url, "repository_url")
            project.repository_url = data.repository_url
        if data.image_url is not None:
            cls._validate_url(data.image_url, "image_url")
            project.image_url = data.image_url

        if data.title is not None: project.title = data.title
        if data.description is not None: project.description = data.description
        if data.role is not None: project.role = data.role
        if data.technologies is not None: project.technologies = data.technologies
        if data.skills_used is not None: project.skills_used = data.skills_used
        if data.start_date is not None: project.start_date = data.start_date
        if data.end_date is not None: project.end_date = data.end_date
        if data.is_featured is not None: project.is_featured = data.is_featured
        if data.visibility is not None: project.visibility = data.visibility
        if data.sort_order is not None: project.sort_order = data.sort_order

        project.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(project)
        return project

    @classmethod
    async def delete_project(cls, db: AsyncSession, student_profile_id: Any, project_id: Any) -> None:
        s_id = _to_uuid(student_profile_id)
        p_id = _to_uuid(project_id)

        stmt = select(PortfolioProject).where(PortfolioProject.id == p_id, PortfolioProject.student_profile_id == s_id)
        project = (await db.execute(stmt)).scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or access denied.")

        await db.delete(project)
        await db.commit()

    # --- EXPERIENCE CRUD ---
    @classmethod
    async def create_experience(cls, db: AsyncSession, student_profile_id: Any, data: ExperienceCreate) -> PortfolioExperience:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        exp = PortfolioExperience(
            portfolio_id=portfolio.id,
            student_profile_id=s_id,
            organization=data.organization,
            role=data.role,
            experience_type=data.experience_type,
            location=data.location,
            description=data.description,
            start_date=data.start_date,
            end_date=data.end_date,
            is_current=data.is_current,
            skills_used=data.skills_used,
            visibility=data.visibility,
            sort_order=data.sort_order
        )
        db.add(exp)
        await db.commit()
        await db.refresh(exp)
        return exp

    @classmethod
    async def update_experience(cls, db: AsyncSession, student_profile_id: Any, exp_id: Any, data: ExperienceUpdate) -> PortfolioExperience:
        s_id = _to_uuid(student_profile_id)
        e_id = _to_uuid(exp_id)

        stmt = select(PortfolioExperience).where(PortfolioExperience.id == e_id, PortfolioExperience.student_profile_id == s_id)
        exp = (await db.execute(stmt)).scalar_one_or_none()
        if not exp:
            raise HTTPException(status_code=404, detail="Experience record not found or access denied.")

        if data.organization is not None: exp.organization = data.organization
        if data.role is not None: exp.role = data.role
        if data.experience_type is not None: exp.experience_type = data.experience_type
        if data.location is not None: exp.location = data.location
        if data.description is not None: exp.description = data.description
        if data.start_date is not None: exp.start_date = data.start_date
        if data.end_date is not None: exp.end_date = data.end_date
        if data.is_current is not None: exp.is_current = data.is_current
        if data.skills_used is not None: exp.skills_used = data.skills_used
        if data.visibility is not None: exp.visibility = data.visibility
        if data.sort_order is not None: exp.sort_order = data.sort_order

        exp.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(exp)
        return exp

    @classmethod
    async def delete_experience(cls, db: AsyncSession, student_profile_id: Any, exp_id: Any) -> None:
        s_id = _to_uuid(student_profile_id)
        e_id = _to_uuid(exp_id)

        stmt = select(PortfolioExperience).where(PortfolioExperience.id == e_id, PortfolioExperience.student_profile_id == s_id)
        exp = (await db.execute(stmt)).scalar_one_or_none()
        if not exp:
            raise HTTPException(status_code=404, detail="Experience record not found or access denied.")

        await db.delete(exp)
        await db.commit()

    # --- CERTIFICATION CRUD ---
    @classmethod
    async def create_certification(cls, db: AsyncSession, student_profile_id: Any, data: CertificationCreate) -> PortfolioCertification:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        if data.credential_url:
            cls._validate_url(data.credential_url, "credential_url")
        if data.certificate_url:
            cls._validate_url(data.certificate_url, "certificate_url")

        cert = PortfolioCertification(
            portfolio_id=portfolio.id,
            student_profile_id=s_id,
            name=data.name,
            issuer=data.issuer,
            issue_date=data.issue_date,
            expiry_date=data.expiry_date,
            credential_id=data.credential_id,
            credential_url=data.credential_url,
            certificate_url=data.certificate_url,
            description=data.description,
            visibility=data.visibility,
            sort_order=data.sort_order
        )
        db.add(cert)
        await db.commit()
        await db.refresh(cert)
        return cert

    @classmethod
    async def update_certification(cls, db: AsyncSession, student_profile_id: Any, cert_id: Any, data: CertificationUpdate) -> PortfolioCertification:
        s_id = _to_uuid(student_profile_id)
        c_id = _to_uuid(cert_id)

        stmt = select(PortfolioCertification).where(PortfolioCertification.id == c_id, PortfolioCertification.student_profile_id == s_id)
        cert = (await db.execute(stmt)).scalar_one_or_none()
        if not cert:
            raise HTTPException(status_code=404, detail="Certification not found or access denied.")

        if data.credential_url is not None:
            cls._validate_url(data.credential_url, "credential_url")
            cert.credential_url = data.credential_url
        if data.certificate_url is not None:
            cls._validate_url(data.certificate_url, "certificate_url")
            cert.certificate_url = data.certificate_url

        if data.name is not None: cert.name = data.name
        if data.issuer is not None: cert.issuer = data.issuer
        if data.issue_date is not None: cert.issue_date = data.issue_date
        if data.expiry_date is not None: cert.expiry_date = data.expiry_date
        if data.credential_id is not None: cert.credential_id = data.credential_id
        if data.description is not None: cert.description = data.description
        if data.visibility is not None: cert.visibility = data.visibility
        if data.sort_order is not None: cert.sort_order = data.sort_order

        cert.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(cert)
        return cert

    @classmethod
    async def delete_certification(cls, db: AsyncSession, student_profile_id: Any, cert_id: Any) -> None:
        s_id = _to_uuid(student_profile_id)
        c_id = _to_uuid(cert_id)

        stmt = select(PortfolioCertification).where(PortfolioCertification.id == c_id, PortfolioCertification.student_profile_id == s_id)
        cert = (await db.execute(stmt)).scalar_one_or_none()
        if not cert:
            raise HTTPException(status_code=404, detail="Certification not found or access denied.")

        await db.delete(cert)
        await db.commit()

    # --- ACHIEVEMENT CRUD ---
    @classmethod
    async def create_achievement(cls, db: AsyncSession, student_profile_id: Any, data: AchievementCreate) -> PortfolioAchievement:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        if data.credential_url:
            cls._validate_url(data.credential_url, "credential_url")

        ach = PortfolioAchievement(
            portfolio_id=portfolio.id,
            student_profile_id=s_id,
            title=data.title,
            issuer=data.issuer,
            date=data.date,
            description=data.description,
            credential_url=data.credential_url,
            visibility=data.visibility,
            sort_order=data.sort_order
        )
        db.add(ach)
        await db.commit()
        await db.refresh(ach)
        return ach

    @classmethod
    async def update_achievement(cls, db: AsyncSession, student_profile_id: Any, ach_id: Any, data: AchievementUpdate) -> PortfolioAchievement:
        s_id = _to_uuid(student_profile_id)
        a_id = _to_uuid(ach_id)

        stmt = select(PortfolioAchievement).where(PortfolioAchievement.id == a_id, PortfolioAchievement.student_profile_id == s_id)
        ach = (await db.execute(stmt)).scalar_one_or_none()
        if not ach:
            raise HTTPException(status_code=404, detail="Achievement not found or access denied.")

        if data.credential_url is not None:
            cls._validate_url(data.credential_url, "credential_url")
            ach.credential_url = data.credential_url

        if data.title is not None: ach.title = data.title
        if data.issuer is not None: ach.issuer = data.issuer
        if data.date is not None: ach.date = data.date
        if data.description is not None: ach.description = data.description
        if data.visibility is not None: ach.visibility = data.visibility
        if data.sort_order is not None: ach.sort_order = data.sort_order

        ach.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(ach)
        return ach

    @classmethod
    async def delete_achievement(cls, db: AsyncSession, student_profile_id: Any, ach_id: Any) -> None:
        s_id = _to_uuid(student_profile_id)
        a_id = _to_uuid(ach_id)

        stmt = select(PortfolioAchievement).where(PortfolioAchievement.id == a_id, PortfolioAchievement.student_profile_id == s_id)
        ach = (await db.execute(stmt)).scalar_one_or_none()
        if not ach:
            raise HTTPException(status_code=404, detail="Achievement not found or access denied.")

        await db.delete(ach)
        await db.commit()

    # --- EDUCATION CRUD ---
    @classmethod
    async def create_education(cls, db: AsyncSession, student_profile_id: Any, data: EducationCreate) -> PortfolioEducation:
        s_id = _to_uuid(student_profile_id)
        portfolio = await cls.get_or_create_portfolio(db, s_id)

        edu = PortfolioEducation(
            portfolio_id=portfolio.id,
            student_profile_id=s_id,
            institution=data.institution,
            degree=data.degree,
            field_of_study=data.field_of_study,
            start_year=data.start_year,
            end_year=data.end_year,
            grade=data.grade,
            description=data.description,
            sort_order=data.sort_order
        )
        db.add(edu)
        await db.commit()
        await db.refresh(edu)
        return edu

    @classmethod
    async def update_education(cls, db: AsyncSession, student_profile_id: Any, edu_id: Any, data: EducationUpdate) -> PortfolioEducation:
        s_id = _to_uuid(student_profile_id)
        e_id = _to_uuid(edu_id)

        stmt = select(PortfolioEducation).where(PortfolioEducation.id == e_id, PortfolioEducation.student_profile_id == s_id)
        edu = (await db.execute(stmt)).scalar_one_or_none()
        if not edu:
            raise HTTPException(status_code=404, detail="Education record not found or access denied.")

        if data.institution is not None: edu.institution = data.institution
        if data.degree is not None: edu.degree = data.degree
        if data.field_of_study is not None: edu.field_of_study = data.field_of_study
        if data.start_year is not None: edu.start_year = data.start_year
        if data.end_year is not None: edu.end_year = data.end_year
        if data.grade is not None: edu.grade = data.grade
        if data.description is not None: edu.description = data.description
        if data.sort_order is not None: edu.sort_order = data.sort_order

        edu.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(edu)
        return edu

    @classmethod
    async def delete_education(cls, db: AsyncSession, student_profile_id: Any, edu_id: Any) -> None:
        s_id = _to_uuid(student_profile_id)
        e_id = _to_uuid(edu_id)

        stmt = select(PortfolioEducation).where(PortfolioEducation.id == e_id, PortfolioEducation.student_profile_id == s_id)
        edu = (await db.execute(stmt)).scalar_one_or_none()
        if not edu:
            raise HTTPException(status_code=404, detail="Education record not found or access denied.")

        await db.delete(edu)
        await db.commit()

    # --- PUBLIC PORTFOLIO RESOLUTION ---
    @classmethod
    async def get_public_portfolio(cls, db: AsyncSession, slug: str) -> Dict[str, Any]:
        clean_slug = _slugify(slug)
        stmt = (
            select(Portfolio)
            .options(
                selectinload(Portfolio.projects),
                selectinload(Portfolio.experiences),
                selectinload(Portfolio.certifications),
                selectinload(Portfolio.achievements),
                selectinload(Portfolio.educations)
            )
            .where(Portfolio.slug == clean_slug)
        )
        res = await db.execute(stmt)
        portfolio = res.scalar_one_or_none()

        # Enforce published & visibility (PUBLIC or UNLISTED)
        if not portfolio or not portfolio.is_published or portfolio.visibility == PortfolioVisibility.PRIVATE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found or is currently private."
            )

        # Increment view_count safely
        portfolio.view_count += 1
        await db.commit()

        # Fetch student profile & target career
        stud_stmt = (
            select(StudentProfile)
            .options(selectinload(StudentProfile.user), selectinload(StudentProfile.target_career))
            .where(StudentProfile.id == portfolio.student_profile_id)
        )
        student = (await db.execute(stud_stmt)).scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found.")

        # Fetch evaluated skills
        skills_stmt = (
            select(StudentSkillScore)
            .options(selectinload(StudentSkillScore.skill))
            .where(StudentSkillScore.student_profile_id == student.id)
        )
        scores_raw = (await db.execute(skills_stmt)).scalars().all()
        skills_list = []
        for s in scores_raw:
            item = {
                "skill_name": s.skill.name if s.skill else "Skill",
                "proficiency_level": s.proficiency_level
            }
            if portfolio.show_skill_scores:
                item["score"] = s.score
            skills_list.append(item)

        # Filter content items (only PUBLIC or PORTFOLIO_ONLY)
        pub_projects = [p for p in portfolio.projects if p.visibility != "PRIVATE"]
        pub_exp = [e for e in portfolio.experiences if e.visibility != "PRIVATE"]
        pub_certs = [c for c in portfolio.certifications if c.visibility != "PRIVATE"]
        pub_ach = [a for a in portfolio.achievements if a.visibility != "PRIVATE"]
        pub_edu = [ed for ed in portfolio.educations if ed.visibility != "PRIVATE"]

        # Build sanitized public object
        return {
            "title": portfolio.title,
            "headline": portfolio.headline,
            "summary": portfolio.summary,
            "slug": portfolio.slug,
            "visibility": portfolio.visibility.value if hasattr(portfolio.visibility, "value") else str(portfolio.visibility),
            "published_at": portfolio.published_at,
            "student_name": student.full_name or "Ayurvedic Practitioner",
            "profile_photo_url": student.profile_photo_url,
            "college_name": student.college_name,
            "degree_program": student.degree_program,
            "city": student.city,
            "state": student.state,
            "country": student.country or "India",
            "public_email": student.user.email if (student.user and portfolio.contact_email_public) else None,
            "public_phone": student.phone if portfolio.contact_phone_public else None,
            "linkedin_url": student.linkedin_url,
            "github_url": student.github_url,
            "website_url": student.website_url,
            "target_career_title": student.target_career.name if student.target_career else None,
            "target_career_category": None,
            "career_interests": student.interests or [],
            "skills": skills_list,
            "projects": pub_projects,
            "experiences": pub_exp,
            "certifications": pub_certs,
            "achievements": pub_ach,
            "educations": pub_edu,
            "assessments": [],
            "recommendations": [],
            "selected_applications": []
        }
