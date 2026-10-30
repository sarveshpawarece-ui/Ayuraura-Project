import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Float, Text, Enum as SQLEnum, ForeignKey, JSON, Table, UniqueConstraint

from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    SUSPENDED = "SUSPENDED"

class VerificationSubjectType(str, enum.Enum):
    USER = "USER"
    STUDENT = "STUDENT"
    INSTITUTION = "INSTITUTION"
    INDUSTRY = "INDUSTRY"
    DOCTOR = "DOCTOR"
    NGO = "NGO"
    DOCUMENT = "DOCUMENT"
    CERTIFICATE = "CERTIFICATE"
    EDUCATION = "EDUCATION"
    CERTIFICATION = "CERTIFICATION"
    EXPERIENCE = "EXPERIENCE"
    ACHIEVEMENT = "ACHIEVEMENT"
    PORTFOLIO = "PORTFOLIO"
    SKILL_EVIDENCE = "SKILL_EVIDENCE"

class VerificationType(str, enum.Enum):
    IDENTITY = "IDENTITY"
    INSTITUTION = "INSTITUTION"
    ORGANIZATION = "ORGANIZATION"
    DOCTOR_LICENSE = "DOCTOR_LICENSE"
    NGO_DARPAN = "NGO_DARPAN"
    DOCUMENT_INTEGRITY = "DOCUMENT_INTEGRITY"
    CERTIFICATE_CREDENTIAL = "CERTIFICATE_CREDENTIAL"
    EDUCATION = "EDUCATION"
    CERTIFICATION = "CERTIFICATION"
    EXPERIENCE = "EXPERIENCE"
    ACHIEVEMENT = "ACHIEVEMENT"
    PORTFOLIO = "PORTFOLIO"
    SKILL_EVIDENCE = "SKILL_EVIDENCE"


class OrganizationType(str, enum.Enum):
    PHARMA = "PHARMA"
    AYURVEDIC_COMPANY = "AYURVEDIC_COMPANY"
    RESEARCH_INSTITUTE = "RESEARCH_INSTITUTE"
    HOSPITAL = "HOSPITAL"
    STARTUP = "STARTUP"
    EDUCATIONAL_INSTITUTION = "EDUCATIONAL_INSTITUTION"
    NGO = "NGO"
    GOVERNMENT = "GOVERNMENT"
    OTHER = "OTHER"

class InstitutionType(str, enum.Enum):
    COLLEGE = "COLLEGE"
    UNIVERSITY = "UNIVERSITY"
    INSTITUTE = "INSTITUTE"
    RESEARCH_INSTITUTE = "RESEARCH_INSTITUTE"
    MEDICAL_COLLEGE = "MEDICAL_COLLEGE"
    AYURVEDIC_COLLEGE = "AYURVEDIC_COLLEGE"
    PHARMACY_COLLEGE = "PHARMACY_COLLEGE"
    OTHER = "OTHER"

class MembershipStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    GRADUATED = "GRADUATED"
    SUSPENDED = "SUSPENDED"
    ALUMNI = "ALUMNI"


class ProficiencyLevel(str, enum.Enum):
    NOVICE = "NOVICE"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

class SkillSource(str, enum.Enum):
    SELF_DECLARED = "SELF_DECLARED"
    ASSESSMENT_VERIFIED = "ASSESSMENT_VERIFIED"

class ExperienceType(str, enum.Enum):
    INTERNSHIP = "INTERNSHIP"
    PROJECT = "PROJECT"
    RESEARCH = "RESEARCH"
    WORK = "WORK"
    VOLUNTEERING = "VOLUNTEERING"
    OTHER = "OTHER"

class OpportunityType(str, enum.Enum):
    JOB = "JOB"
    INTERNSHIP = "INTERNSHIP"
    RESEARCH = "RESEARCH"
    APPRENTICESHIP = "APPRENTICESHIP"
    PROJECT = "PROJECT"
    WORKSHOP = "WORKSHOP"
    FELLOWSHIP = "FELLOWSHIP"
    SCHOLARSHIP = "SCHOLARSHIP"
    ABROAD = "ABROAD"
    INTERNATIONAL_INTERNSHIP = "INTERNATIONAL_INTERNSHIP"
    RESEARCH_COLLABORATION = "RESEARCH_COLLABORATION"
    GOVERNMENT = "GOVERNMENT"

class OpportunityStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    EXPIRED = "EXPIRED"
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    PAUSED = "PAUSED"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    FILLED = "FILLED"



class WorkMode(str, enum.Enum):
    ONSITE = "ONSITE"
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    UNKNOWN = "UNKNOWN"

class EmploymentType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"
    FELLOWSHIP = "FELLOWSHIP"
    PROJECT_BASED = "PROJECT_BASED"
    UNKNOWN = "UNKNOWN"

class ExperienceLevel(str, enum.Enum):
    ENTRY = "ENTRY"
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERIENCED = "EXPERIENCED"
    STUDENT = "STUDENT"
    FRESHER = "FRESHER"
    UNKNOWN = "UNKNOWN"

class OpportunitySourceType(str, enum.Enum):
    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"
    DEMO = "DEMO"

class MatchClassification(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    PARTIAL = "PARTIAL"
    LOW = "LOW"

class MatchPriority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class MatchStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DISMISSED = "DISMISSED"
    OUTDATED = "OUTDATED"
    EXPIRED = "EXPIRED"


class ApplicationStatus(str, enum.Enum):
    SAVED = "SAVED"
    PLANNED = "PLANNED"
    APPLIED = "APPLIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    INTERVIEWED = "INTERVIEWED"
    OFFERED = "OFFERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"
    EXPIRED = "EXPIRED"
    CLOSED = "CLOSED"


class CoverLetterStatus(str, enum.Enum):
    NOT_REQUIRED = "NOT_REQUIRED"
    NOT_STARTED = "NOT_STARTED"
    DRAFTED = "DRAFTED"
    READY = "READY"
    SUBMITTED = "SUBMITTED"


class SkillCategory(str, enum.Enum):
    CLINICAL = "CLINICAL"
    PHARMA_R_AND_D = "PHARMA_R_AND_D"
    RAW_MATERIAL_QC = "RAW_MATERIAL_QC"
    REGULATORY = "REGULATORY"
    DIGITAL_HEALTH = "DIGITAL_HEALTH"
    RESEARCH_METHODOLOGY = "RESEARCH_METHODOLOGY"
    SOFT_SKILL = "SOFT_SKILL"
    AYURVEDA_DOMAIN = "AYURVEDA_DOMAIN"
    TECHNICAL = "TECHNICAL"

class CareerCategory(str, enum.Enum):
    AYURVEDA_CLINICAL = "AYURVEDA_CLINICAL"
    AYURVEDA_RESEARCH = "AYURVEDA_RESEARCH"
    AYURVEDA_PHARMACEUTICAL = "AYURVEDA_PHARMACEUTICAL"
    AYURVEDA_MANUFACTURING = "AYURVEDA_MANUFACTURING"
    AYURVEDA_QUALITY = "AYURVEDA_QUALITY"
    AYURVEDA_EDUCATION = "AYURVEDA_EDUCATION"
    AYURVEDA_PUBLIC_HEALTH = "AYURVEDA_PUBLIC_HEALTH"
    AYUSH_TECHNOLOGY = "AYUSH_TECHNOLOGY"
    HEALTHCARE = "HEALTHCARE"
    RESEARCH = "RESEARCH"
    OTHER = "OTHER"

class QuestionCategory(str, enum.Enum):
    TECHNICAL = "TECHNICAL"
    DOMAIN = "DOMAIN"
    SOFT_SKILL = "SOFT_SKILL"

class QuestionDifficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    EXPIRED = "EXPIRED"
    ABANDONED = "ABANDONED"

class ResourceType(str, enum.Enum):
    COURSE = "COURSE"
    CERTIFICATION = "CERTIFICATION"
    PROJECT = "PROJECT"
    WORKSHOP = "WORKSHOP"
    BOOK = "BOOK"
    ARTICLE = "ARTICLE"
    VIDEO = "VIDEO"
    DOCUMENTATION = "DOCUMENTATION"

class ResourcePriceType(str, enum.Enum):
    FREE = "FREE"
    PAID = "PAID"
    MIXED = "MIXED"
    UNKNOWN = "UNKNOWN"

class RecommendationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DISMISSED = "DISMISSED"
    OUTDATED = "OUTDATED"
    COMPLETED = "COMPLETED"


class InstitutionProfile(Base):
    __tablename__ = "institution_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    institution_name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    aishe_code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    institution_type = Column(SQLEnum(InstitutionType), default=InstitutionType.AYURVEDIC_COLLEGE, nullable=False)
    website_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_person_prefix = Column(String(50), nullable=True)
    contact_person_first_name = Column(String(150), nullable=True)
    contact_person_middle_name = Column(String(150), nullable=True)
    contact_person_last_name = Column(String(150), nullable=True)
    contact_person_name = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    state = Column(String(100))
    city = Column(String(100))
    country = Column(String(100), default="India")
    logo_url = Column(String(500), nullable=True)
    accreditation_status = Column(String(100))
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    ncism_approval_number = Column(String(100), nullable=True)
    university_affiliation = Column(String(255), nullable=True)
    verification_documents = Column(JSON, default=list, nullable=True)
    verification_submitted_at = Column(DateTime(timezone=True), nullable=True)
    verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="institution_profile")
    students = relationship("StudentProfile", back_populates="institution")
    faculty = relationship("FacultyProfile", back_populates="institution")
    departments = relationship("Department", back_populates="institution", cascade="all, delete-orphan")
    memberships = relationship("StudentInstitutionMembership", back_populates="institution", cascade="all, delete-orphan")
    audit_logs = relationship("InstitutionAuditLog", back_populates="institution", cascade="all, delete-orphan")
    invitations = relationship("InstitutionInvitation", back_populates="institution", cascade="all, delete-orphan")
    educational_resources = relationship("EducationalResource", back_populates="institution", cascade="all, delete-orphan")
    lecture_schedules = relationship("LectureSchedule", back_populates="institution", cascade="all, delete-orphan")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    category = Column(SQLEnum(CareerCategory), nullable=False, default=CareerCategory.AYURVEDA_PHARMACEUTICAL)
    domain = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    students = relationship("StudentProfile", back_populates="target_career_role")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="career_role")
    required_skills = relationship("RoleRequiredSkill", back_populates="career_role", cascade="all, delete-orphan")



class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id"), nullable=True)

    # Personal Information
    name_prefix = Column(String(50), nullable=True)
    first_name = Column(String(150), nullable=True)
    middle_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    full_name = Column(String(255), nullable=False, default="")
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # Academic Information
    college_name = Column(String(255), nullable=True)
    enrollment_number = Column(String(100), nullable=True)
    course = Column(String(100), nullable=True)
    degree_program = Column(String(100), nullable=True)
    specialization = Column(String(150), nullable=True)
    current_year = Column(Integer, nullable=True)
    academic_year = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)

    # Location Information
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")

    # Professional Social Links
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)

    # Interests (stored as JSON array)
    interests = Column(JSON, default=list)

    target_career_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id"), nullable=True)
    resume_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
    institution = relationship("InstitutionProfile", back_populates="students")
    target_career_role = relationship("CareerRole", back_populates="students")
    target_career = relationship("CareerRole", overlaps="students,target_career_role")
    student_skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    experiences = relationship("StudentExperience", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("StudentProject", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", foreign_keys="[Application.student_profile_id]")
    portfolio = relationship("Portfolio", uselist=False, back_populates="student_profile", cascade="all, delete-orphan")


    assessment_attempts = relationship("AssessmentAttempt", back_populates="student_profile", cascade="all, delete-orphan")


class StudentExperience(Base):
    __tablename__ = "student_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False)
    experience_type = Column(SQLEnum(ExperienceType), default=ExperienceType.INTERNSHIP)
    description = Column(Text, nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="experiences")


class StudentProject(Base):
    __tablename__ = "student_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String(255), nullable=True)
    role = Column(String(150), nullable=True)
    project_url = Column(String(500), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="projects")


class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id"), nullable=False)
    name_prefix = Column(String(50), nullable=True, default="Prof.")
    first_name = Column(String(150), nullable=True)
    middle_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    full_name = Column(String(255), nullable=False)
    department = Column(String(150))
    designation = Column(String(100))
    qualifications = Column(String(255), nullable=True)
    specialization = Column(String(255), nullable=True)
    assigned_subjects = Column(JSON, default=list, nullable=True)
    assigned_academic_years = Column(JSON, default=list, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="faculty_profile")
    institution = relationship("InstitutionProfile", back_populates="faculty")
    educational_resources = relationship("EducationalResource", back_populates="faculty", cascade="all, delete-orphan")
    lecture_schedules = relationship("LectureSchedule", back_populates="faculty", cascade="all, delete-orphan")


class IndustryProfile(Base):
    __tablename__ = "industry_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), nullable=True)
    industry_domain = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    organization_type = Column(SQLEnum(OrganizationType), default=OrganizationType.AYURVEDIC_COMPANY, nullable=True)
    website_url = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="industry_profile")
    opportunities = relationship("IndustryOpportunity", back_populates="organization", cascade="all, delete-orphan")
    legacy_opportunities = relationship("Opportunity", back_populates="industry")



class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), unique=True, nullable=False)
    category = Column(SQLEnum(SkillCategory), nullable=False)
    description = Column(Text)
    weight_factor = Column(Float, default=1.0)

    assessment_questions = relationship("AssessmentQuestion", back_populates="skill")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(SQLEnum(ProficiencyLevel), default=ProficiencyLevel.NOVICE)
    source = Column(SQLEnum(SkillSource), default=SkillSource.SELF_DECLARED)
    verified_by_assessment = Column(Boolean, default=False)
    last_evaluated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="student_skills")
    skill = relationship("Skill")


class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)
    domain = Column(String(100))
    description = Column(Text)

    requirements = relationship("CareerSkillRequirement", back_populates="career_path")


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    career_id = Column(UUID(as_uuid=True), ForeignKey("career_paths.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    required_proficiency = Column(SQLEnum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE)
    importance_weight = Column(Float, default=1.0)

    career_path = relationship("CareerPath", back_populates="requirements")
    skill = relationship("Skill")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    industry_id = Column(UUID(as_uuid=True), ForeignKey("industry_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    opportunity_type = Column(SQLEnum(OpportunityType), nullable=False)
    description = Column(Text)
    location = Column(String(150))
    stipend_or_salary = Column(String(100))
    status = Column(SQLEnum(OpportunityStatus), default=OpportunityStatus.OPEN)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime(timezone=True), nullable=True)

    industry = relationship("IndustryProfile", back_populates="legacy_opportunities")

    required_skills = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")



class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    min_proficiency = Column(SQLEnum(ProficiencyLevel), default=ProficiencyLevel.NOVICE)
    is_mandatory = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="required_skills")
    skill = relationship("Skill")


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("industry_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)

    match_id = Column(UUID(as_uuid=True), ForeignKey("opportunity_matches.id", ondelete="SET NULL"), nullable=True)

    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.SAVED, nullable=False, index=True)
    applied_at = Column(DateTime(timezone=True), nullable=True, index=True)
    application_deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    application_url = Column(String(500), nullable=True)

    # Snapshots (preserves historical record when applied)
    title_snapshot = Column(String(255), nullable=True)
    organization_snapshot = Column(String(255), nullable=True)
    match_score_snapshot = Column(Float, nullable=True)
    skill_match_snapshot = Column(Float, nullable=True)
    career_match_snapshot = Column(Float, nullable=True)
    coverage_snapshot = Column(Float, nullable=True)
    experience_fit_snapshot = Column(Float, nullable=True)
    matching_algorithm_version = Column(String(20), nullable=True)

    # User Notes & Custom Metadata
    notes = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    cover_letter_status = Column(SQLEnum(CoverLetterStatus), default=CoverLetterStatus.NOT_REQUIRED, nullable=False)
    resume_version = Column(String(100), nullable=True)

    last_status_change_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        UniqueConstraint("student_profile_id", "opportunity_id", name="uq_student_opportunity_app"),
    )

    student = relationship("StudentProfile", back_populates="applications", foreign_keys=[student_profile_id])

    opportunity = relationship("IndustryOpportunity")
    match = relationship("OpportunityMatch")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationStatusHistory.changed_at")
    internal_notes = relationship("ApplicationInternalNote", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationInternalNote.created_at")



class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    changed_by = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="status_history")



# =============================================================
# PHASE 5 — ASSESSMENT DOMAIN MODELS
# =============================================================

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), default=QuestionType.MCQ)
    category = Column(SQLEnum(QuestionCategory), nullable=False, index=True)
    difficulty = Column(SQLEnum(QuestionDifficulty), default=QuestionDifficulty.MEDIUM)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False, index=True)
    weight = Column(Float, default=1.0)
    explanation = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    skill = relationship("Skill", back_populates="assessment_questions")
    options = relationship("AssessmentOption", back_populates="question", cascade="all, delete-orphan", order_by="AssessmentOption.option_order")


class AssessmentOption(Base):
    __tablename__ = "assessment_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("assessment_questions.id"), nullable=False, index=True)
    option_text = Column(String(500), nullable=False)
    option_order = Column(Integer, default=0)
    is_correct = Column(Boolean, default=False)

    question = relationship("AssessmentQuestion", back_populates="options")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id"), nullable=False, index=True)
    status = Column(SQLEnum(AttemptStatus), default=AttemptStatus.IN_PROGRESS, index=True)
    overall_score = Column(Float, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile", back_populates="assessment_attempts")
    career_role = relationship("CareerRole", back_populates="assessment_attempts")
    attempt_questions = relationship("AssessmentAttemptQuestion", back_populates="attempt", cascade="all, delete-orphan", order_by="AssessmentAttemptQuestion.question_order")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")
    skill_scores = relationship("AssessmentSkillScore", back_populates="attempt", cascade="all, delete-orphan")
    category_scores = relationship("AssessmentCategoryScore", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAttemptQuestion(Base):
    __tablename__ = "assessment_attempt_questions"
    __table_args__ = (UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("assessment_questions.id"), nullable=False, index=True)
    question_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    attempt = relationship("AssessmentAttempt", back_populates="attempt_questions")
    question = relationship("AssessmentQuestion")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    __table_args__ = (UniqueConstraint("attempt_id", "question_id", name="uq_attempt_answer"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("assessment_questions.id"), nullable=False, index=True)
    selected_option_id = Column(UUID(as_uuid=True), ForeignKey("assessment_options.id"), nullable=True)
    is_correct = Column(Boolean, default=False)
    raw_score = Column(Float, default=0.0)
    weighted_score = Column(Float, default=0.0)
    answered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("AssessmentQuestion")
    selected_option = relationship("AssessmentOption")


class AssessmentSkillScore(Base):
    __tablename__ = "assessment_skill_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    earned_weight = Column(Float, default=0.0)
    available_weight = Column(Float, default=0.0)
    normalized_score = Column(Float, default=0.0)
    proficiency_level = Column(String(50), nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="skill_scores")
    skill = relationship("Skill")


class AssessmentCategoryScore(Base):
    __tablename__ = "assessment_category_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id"), nullable=False, index=True)
    category = Column(SQLEnum(QuestionCategory), nullable=False)
    earned_weight = Column(Float, default=0.0)
    available_weight = Column(Float, default=0.0)
    normalized_score = Column(Float, default=0.0)
    proficiency_level = Column(String(50), nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="category_scores")


class StudentSkillScore(Base):
    __tablename__ = "student_skill_scores"
    __table_args__ = (
        UniqueConstraint("student_profile_id", "skill_id", name="uq_student_skill_score"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    proficiency_level = Column(String(50), nullable=False)
    source = Column(String(50), nullable=False, default="ASSESSMENT", index=True)
    assessment_attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id", ondelete="SET NULL"), nullable=True, index=True)
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")
    skill = relationship("Skill")
    assessment_attempt = relationship("AssessmentAttempt")


class RoleRequiredSkill(Base):
    __tablename__ = "role_required_skills"
    __table_args__ = (
        UniqueConstraint("career_role_id", "skill_id", name="uq_role_required_skill"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_score = Column(Float, nullable=False, default=75.0)
    importance = Column(String(50), nullable=False, default="HIGH")
    is_required = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    career_role = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill")


class SkillGapSnapshot(Base):
    __tablename__ = "skill_gap_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_attempt_id = Column(UUID(as_uuid=True), ForeignKey("assessment_attempts.id", ondelete="SET NULL"), nullable=True, index=True)
    overall_gap_percentage = Column(Float, nullable=False, default=0.0)
    total_required_skills = Column(Integer, default=0)
    mastered_count = Column(Integer, default=0)
    adequate_count = Column(Integer, default=0)
    weak_count = Column(Integer, default=0)
    missing_count = Column(Integer, default=0)
    critical_gaps_count = Column(Integer, default=0)
    high_priority_gaps_count = Column(Integer, default=0)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")
    career_role = relationship("CareerRole")
    assessment_attempt = relationship("AssessmentAttempt")
    items = relationship("SkillGapSnapshotItem", back_populates="snapshot", cascade="all, delete-orphan")


class SkillGapSnapshotItem(Base):
    __tablename__ = "skill_gap_snapshot_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    snapshot_id = Column(UUID(as_uuid=True), ForeignKey("skill_gap_snapshots.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    current_score = Column(Float, nullable=True)
    required_score = Column(Float, nullable=False)
    gap = Column(Float, nullable=False)
    classification = Column(String(50), nullable=False)
    priority = Column(String(50), nullable=False)
    importance = Column(String(50), nullable=False)
    is_required = Column(Boolean, nullable=False, default=True)

    snapshot = relationship("SkillGapSnapshot", back_populates="items")
    skill = relationship("Skill")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(SQLEnum(ResourceType), nullable=False, default=ResourceType.COURSE, index=True)
    provider = Column(String(150), nullable=False, default="Internal Learning Hub")
    url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    difficulty = Column(SQLEnum(QuestionDifficulty), default=QuestionDifficulty.MEDIUM)
    estimated_hours = Column(Integer, nullable=True, default=10)
    price_type = Column(SQLEnum(ResourcePriceType), default=ResourcePriceType.FREE)
    language = Column(String(50), nullable=False, default="English")
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    skill_mappings = relationship("LearningResourceSkill", back_populates="learning_resource", cascade="all, delete-orphan")
    career_mappings = relationship("LearningResourceCareer", back_populates="learning_resource", cascade="all, delete-orphan")


class LearningResourceSkill(Base):
    __tablename__ = "learning_resource_skills"
    __table_args__ = (
        UniqueConstraint("learning_resource_id", "skill_id", name="uq_resource_skill"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    learning_resource = relationship("LearningResource", back_populates="skill_mappings")
    skill = relationship("Skill")


class LearningResourceCareer(Base):
    __tablename__ = "learning_resource_careers"
    __table_args__ = (
        UniqueConstraint("learning_resource_id", "career_role_id", name="uq_resource_career"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    learning_resource = relationship("LearningResource", back_populates="career_mappings")
    career_role = relationship("CareerRole")


class Recommendation(Base):
    __tablename__ = "recommendations"
    __table_args__ = (
        UniqueConstraint("student_profile_id", "learning_resource_id", "skill_id", "career_role_id", name="uq_student_rec"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    learning_resource_id = Column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_score = Column(Float, nullable=False, default=0.0)
    priority = Column(String(50), nullable=False, default="HIGH")
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(RecommendationStatus), default=RecommendationStatus.ACTIVE, nullable=False, index=True)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")
    learning_resource = relationship("LearningResource")
    skill = relationship("Skill")
    career_role = relationship("CareerRole")


class IndustryOpportunity(Base):
    __tablename__ = "industry_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    opportunity_type = Column(SQLEnum(OpportunityType), nullable=False, default=OpportunityType.JOB, index=True)
    organization_name = Column(String(255), nullable=False)
    organization_description = Column(Text, nullable=True)
    location_text = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    work_mode = Column(SQLEnum(WorkMode), nullable=False, default=WorkMode.ONSITE, index=True)
    employment_type = Column(SQLEnum(EmploymentType), nullable=False, default=EmploymentType.FULL_TIME)
    experience_level = Column(SQLEnum(ExperienceLevel), nullable=False, default=ExperienceLevel.FRESHER)
    application_url = Column(String(500), nullable=True)
    source_name = Column(String(150), nullable=False, default="AyurSetu Platform")
    source_url = Column(String(500), nullable=True)
    source_type = Column(SQLEnum(OpportunitySourceType), nullable=False, default=OpportunitySourceType.DEMO)
    application_deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), nullable=False, default="INR")
    is_salary_disclosed = Column(Boolean, nullable=False, default=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("industry_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(SQLEnum(OpportunityStatus), nullable=False, default=OpportunityStatus.ACTIVE, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("IndustryProfile", back_populates="opportunities")
    required_skills = relationship("OpportunityRequiredSkill", back_populates="opportunity", cascade="all, delete-orphan")
    career_roles = relationship("OpportunityCareerRole", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")


class ApplicationInternalNote(Base):
    __tablename__ = "application_internal_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("industry_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    author_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author_name = Column(String(255), nullable=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    application = relationship("Application", back_populates="internal_notes")
    organization = relationship("IndustryProfile")
    author_user = relationship("User")


class IndustryAuditLog(Base):
    __tablename__ = "industry_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("industry_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    organization = relationship("IndustryProfile")
    user = relationship("User")




class OpportunityRequiredSkill(Base):
    __tablename__ = "opportunity_required_skills"
    __table_args__ = (
        UniqueConstraint("opportunity_id", "skill_id", name="uq_opp_required_skill"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("industry_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_score = Column(Float, nullable=False, default=70.0)
    importance = Column(String(50), nullable=False, default="HIGH")
    is_required = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    opportunity = relationship("IndustryOpportunity", back_populates="required_skills")
    skill = relationship("Skill")


class OpportunityCareerRole(Base):
    __tablename__ = "opportunity_career_roles"
    __table_args__ = (
        UniqueConstraint("opportunity_id", "career_role_id", name="uq_opp_career_role"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("industry_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    opportunity = relationship("IndustryOpportunity", back_populates="career_roles")
    career_role = relationship("CareerRole")


class OpportunityMatch(Base):
    __tablename__ = "opportunity_matches"
    __table_args__ = (
        UniqueConstraint("student_profile_id", "opportunity_id", "career_role_id", name="uq_student_opp_match"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("industry_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(UUID(as_uuid=True), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, nullable=False, default=0.0, index=True)
    match_classification = Column(SQLEnum(MatchClassification), nullable=False, default=MatchClassification.PARTIAL)
    priority = Column(SQLEnum(MatchPriority), nullable=False, default=MatchPriority.MEDIUM)
    skill_match_score = Column(Float, nullable=False, default=0.0)
    career_match_score = Column(Float, nullable=False, default=0.0)
    required_skill_coverage = Column(Float, nullable=False, default=0.0)
    experience_fit = Column(Float, nullable=False, default=0.0)
    matched_skill_count = Column(Integer, default=0)
    partial_skill_count = Column(Integer, default=0)
    missing_skill_count = Column(Integer, default=0)
    critical_missing_skill_count = Column(Integer, default=0)
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(MatchStatus), nullable=False, default=MatchStatus.ACTIVE, index=True)
    matching_algorithm_version = Column(String(20), nullable=False, default="v1")
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile")
    opportunity = relationship("IndustryOpportunity")
    career_role = relationship("CareerRole")


class Department(Base):
    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("institution_id", "code", name="uq_institution_department_code"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("InstitutionProfile", back_populates="departments")
    memberships = relationship("StudentInstitutionMembership", back_populates="department")


class StudentInstitutionMembership(Base):
    __tablename__ = "student_institution_memberships"
    __table_args__ = (
        UniqueConstraint("institution_id", "student_profile_id", name="uq_institution_student_membership"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    student_identifier = Column(String(100), nullable=True)
    enrollment_year = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    membership_status = Column(SQLEnum(MembershipStatus), default=MembershipStatus.ACTIVE, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile")
    institution = relationship("InstitutionProfile", back_populates="memberships")
    department = relationship("Department", back_populates="memberships")


class InstitutionAuditLog(Base):
    __tablename__ = "institution_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    institution = relationship("InstitutionProfile", back_populates="audit_logs")
    actor = relationship("User")


# ============================================================
# PHASE 14 — STUDENT PORTFOLIO MODELS
# ============================================================

class PortfolioVisibility(str, enum.Enum):
    PRIVATE = "PRIVATE"
    UNLISTED = "UNLISTED"
    PUBLIC = "PUBLIC"


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    title = Column(String(150), nullable=False, default="My Professional Portfolio")
    headline = Column(String(120), nullable=True)
    summary = Column(Text, nullable=True)
    slug = Column(String(150), unique=True, index=True, nullable=False)

    visibility = Column(SQLEnum(PortfolioVisibility), default=PortfolioVisibility.PRIVATE, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Privacy Switches
    contact_email_public = Column(Boolean, default=False, nullable=False)
    contact_phone_public = Column(Boolean, default=False, nullable=False)
    show_skill_scores = Column(Boolean, default=True, nullable=False)
    show_skill_gaps = Column(Boolean, default=False, nullable=False)
    show_assessments = Column(Boolean, default=False, nullable=False)
    show_recommendations = Column(Boolean, default=False, nullable=False)
    show_applications = Column(Boolean, default=False, nullable=False)

    # Section Config & Ordering (JSON map of section -> {visible: bool, order: int})
    section_config = Column(JSON, default=dict)
    view_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("StudentProfile", back_populates="portfolio")
    projects = relationship("PortfolioProject", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioProject.sort_order")
    experiences = relationship("PortfolioExperience", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioExperience.sort_order")
    certifications = relationship("PortfolioCertification", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioCertification.sort_order")
    achievements = relationship("PortfolioAchievement", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioAchievement.sort_order")
    educations = relationship("PortfolioEducation", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioEducation.sort_order")


class PortfolioProject(Base):
    __tablename__ = "portfolio_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    role = Column(String(100), nullable=True)
    technologies = Column(JSON, default=list)
    skills_used = Column(JSON, default=list)
    project_url = Column(String(500), nullable=True)
    repository_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    visibility = Column(String(50), default="PORTFOLIO_ONLY", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    portfolio = relationship("Portfolio", back_populates="projects")


class PortfolioExperience(Base):
    __tablename__ = "portfolio_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    organization = Column(String(255), nullable=False)
    role = Column(String(150), nullable=False)
    experience_type = Column(SQLEnum(ExperienceType), default=ExperienceType.INTERNSHIP, nullable=False)
    location = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)
    skills_used = Column(JSON, default=list)
    visibility = Column(String(50), default="PORTFOLIO_ONLY", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    portfolio = relationship("Portfolio", back_populates="experiences")


class PortfolioCertification(Base):
    __tablename__ = "portfolio_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    credential_id = Column(String(150), nullable=True)
    credential_url = Column(String(500), nullable=True)
    certificate_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    visibility = Column(String(50), default="PORTFOLIO_ONLY", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    portfolio = relationship("Portfolio", back_populates="certifications")


class PortfolioAchievement(Base):
    __tablename__ = "portfolio_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=True)
    date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    credential_url = Column(String(500), nullable=True)
    visibility = Column(String(50), default="PORTFOLIO_ONLY", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    portfolio = relationship("Portfolio", back_populates="achievements")


class PortfolioEducation(Base):
    __tablename__ = "portfolio_education"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_profile_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    institution = Column(String(255), nullable=False)
    degree = Column(String(150), nullable=False)
    field_of_study = Column(String(150), nullable=True)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    grade = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    portfolio = relationship("Portfolio", back_populates="educations")


# ============================================================
# PHASE 15 — VERIFICATION SYSTEM MODELS
# ============================================================

class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_token = Column(String(100), unique=True, index=True, nullable=False, default=lambda: f"vkn-{uuid.uuid4().hex[:16]}")

    subject_type = Column(SQLEnum(VerificationSubjectType), nullable=False, index=True)
    subject_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    verification_type = Column(SQLEnum(VerificationType), nullable=False, index=True)

    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False, index=True)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    verification_method = Column(String(100), default="MANUAL_REVIEW", nullable=False)
    evidence_summary = Column(Text, nullable=True)
    review_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    revocation_reason = Column(Text, nullable=True)
    is_public_badge = Column(Boolean, default=True, nullable=False)

    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    evidences = relationship("VerificationEvidence", back_populates="request", cascade="all, delete-orphan")
    audits = relationship("VerificationAudit", back_populates="request", cascade="all, delete-orphan")
    submitter = relationship("User", foreign_keys=[submitted_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


class VerificationEvidence(Base):
    __tablename__ = "verification_evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    verification_request_id = Column(UUID(as_uuid=True), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, index=True)

    evidence_type = Column(String(50), default="FILE", nullable=False)
    file_url = Column(String(500), nullable=True)
    credential_id = Column(String(150), nullable=True)
    issuer_name = Column(String(255), nullable=True)
    verification_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    evidence_hash = Column(String(128), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request = relationship("VerificationRequest", back_populates="evidences")


class VerificationAudit(Base):
    __tablename__ = "verification_audits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    verification_request_id = Column(UUID(as_uuid=True), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action = Column(String(50), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request = relationship("VerificationRequest", back_populates="audits")
    actor = relationship("User")


# =============================================================
# INSTITUTION INVITATIONS & FACULTY SYSTEM MODELS
# =============================================================

class InstitutionInvitation(Base):
    __tablename__ = "institution_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), nullable=False, default="FACULTY")
    invited_name = Column(String(255), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    department_name = Column(String(150), nullable=True)
    designation = Column(String(100), nullable=True)
    academic_year = Column(String(50), nullable=True)
    assigned_subjects = Column(JSON, default=list, nullable=True)
    invitation_token = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(50), default="PENDING", nullable=False, index=True)
    invited_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    institution = relationship("InstitutionProfile", back_populates="invitations")
    department = relationship("Department")
    invited_by = relationship("User")


class EducationalResource(Base):
    __tablename__ = "educational_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String(50), nullable=False, default="NOTES", index=True)
    academic_year = Column(String(50), nullable=False, index=True)
    subject_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(255), nullable=False)
    unit_number = Column(Integer, nullable=True)
    unit_name = Column(String(255), nullable=True)
    topic_id = Column(String(100), nullable=True)
    topic_name = Column(String(255), nullable=True)
    class_or_batch = Column(String(100), default="All", nullable=True)
    file_url = Column(String(500), nullable=True)
    content_text = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False, index=True)
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    ai_disclaimer = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("InstitutionProfile", back_populates="educational_resources")
    faculty = relationship("FacultyProfile", back_populates="educational_resources")


class LectureSchedule(Base):
    __tablename__ = "lecture_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institution_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(255), nullable=False)
    academic_year = Column(String(50), nullable=False, index=True)
    topic = Column(String(255), nullable=True)
    session_type = Column(String(50), default="LECTURE", nullable=False)
    scheduled_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)
    venue_or_link = Column(String(255), nullable=True)
    session_link = Column(String(500), nullable=True)
    recording_url = Column(String(500), nullable=True)
    announcement = Column(Text, nullable=True)
    status = Column(String(50), default="SCHEDULED", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("InstitutionProfile", back_populates="lecture_schedules")
    faculty = relationship("FacultyProfile", back_populates="lecture_schedules")







