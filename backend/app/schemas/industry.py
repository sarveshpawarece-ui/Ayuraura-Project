from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, UUID4, Field, ConfigDict
from app.models.domain import (
    VerificationStatus,
    OrganizationType,
    OpportunityType,
    WorkMode,
    EmploymentType,
    ExperienceLevel,
    OpportunityStatus,
    ApplicationStatus,
    MatchClassification,
    MatchPriority
)


# ==========================================
# ORGANIZATION PROFILE SCHEMAS
# ==========================================

class OrganizationProfileOut(BaseModel):
    id: UUID4
    user_id: UUID4
    company_name: str
    registration_number: Optional[str] = None
    industry_domain: Optional[str] = None
    description: Optional[str] = None
    organization_type: Optional[OrganizationType] = OrganizationType.AYURVEDIC_COMPANY
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    location: Optional[str] = None
    verification_status: VerificationStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OrganizationProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    registration_number: Optional[str] = None
    industry_domain: Optional[str] = None
    description: Optional[str] = None
    organization_type: Optional[OrganizationType] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    location: Optional[str] = None


# ==========================================
# OPPORTUNITY & REQUIREMENT SCHEMAS
# ==========================================

class OpportunityRequirementIn(BaseModel):
    skill_id: UUID4
    required_score: float = Field(70.0, ge=0.0, le=100.0)
    importance: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    is_required: bool = True


class OpportunityRequirementOut(BaseModel):
    id: UUID4
    opportunity_id: UUID4
    skill_id: UUID4
    skill_name: Optional[str] = None
    skill_category: Optional[str] = None
    required_score: float
    importance: str
    is_required: bool

    model_config = ConfigDict(from_attributes=True)


class IndustryOpportunityCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    opportunity_type: OpportunityType = OpportunityType.JOB
    work_mode: WorkMode = WorkMode.ONSITE
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    experience_level: ExperienceLevel = ExperienceLevel.FRESHER
    location_text: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    application_deadline: Optional[datetime] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "INR"
    is_salary_disclosed: bool = True
    required_skills: Optional[List[OpportunityRequirementIn]] = Field(default_factory=list)
    career_role_ids: Optional[List[UUID4]] = Field(default_factory=list)
    status: OpportunityStatus = OpportunityStatus.DRAFT


class IndustryOpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    opportunity_type: Optional[OpportunityType] = None
    work_mode: Optional[WorkMode] = None
    employment_type: Optional[EmploymentType] = None
    experience_level: Optional[ExperienceLevel] = None
    location_text: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    application_deadline: Optional[datetime] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    is_salary_disclosed: Optional[bool] = None
    status: Optional[OpportunityStatus] = None
    required_skills: Optional[List[OpportunityRequirementIn]] = None
    career_role_ids: Optional[List[UUID4]] = None


class IndustryOpportunityOut(BaseModel):
    id: UUID4
    organization_id: Optional[UUID4] = None
    organization_name: str
    title: str
    description: str
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    opportunity_type: OpportunityType
    work_mode: WorkMode
    employment_type: EmploymentType
    experience_level: ExperienceLevel
    location_text: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str
    application_deadline: Optional[datetime] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str
    is_salary_disclosed: bool
    status: OpportunityStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    required_skills: List[OpportunityRequirementOut] = Field(default_factory=list)
    applicant_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# APPLICATION & REVIEW SCHEMAS
# ==========================================

class InternalNoteCreate(BaseModel):
    note: str = Field(..., min_length=1, max_length=2000)


class InternalNoteOut(BaseModel):
    id: UUID4
    application_id: UUID4
    organization_id: UUID4
    author_user_id: Optional[UUID4] = None
    author_name: Optional[str] = None
    note: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicantMatchBreakdownOut(BaseModel):
    match_score: float
    match_classification: MatchClassification
    priority: MatchPriority
    skill_match_score: float
    career_match_score: float
    required_skill_coverage: float
    experience_fit: float
    matched_skill_count: int
    partial_skill_count: int
    missing_skill_count: int
    critical_missing_skill_count: int
    reason: str


class StudentSkillItemOut(BaseModel):
    skill_id: UUID4
    skill_name: str
    category: str
    score: float
    proficiency_level: str


class ApplicationStatusUpdateIn(BaseModel):
    status: ApplicationStatus
    note: Optional[str] = None


class ApplicantSummaryOut(BaseModel):
    id: UUID4
    opportunity_id: UUID4
    opportunity_title: str
    student_profile_id: UUID4
    student_name: str
    student_email: str
    college_name: Optional[str] = None
    status: ApplicationStatus
    applied_at: Optional[datetime] = None
    match_score: float
    match_classification: MatchClassification

    model_config = ConfigDict(from_attributes=True)


class ApplicantDetailOut(BaseModel):
    id: UUID4
    opportunity_id: UUID4
    opportunity_title: str
    student_profile_id: UUID4
    student_name: str
    student_email: str
    college_name: Optional[str] = None
    degree: Optional[str] = None
    year_of_study: Optional[int] = None
    target_career_title: Optional[str] = None
    status: ApplicationStatus
    applied_at: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    cover_letter_status: str
    notes_user: Optional[str] = None
    resume_version: Optional[str] = None
    match_breakdown: Optional[ApplicantMatchBreakdownOut] = None
    student_skills: List[StudentSkillItemOut] = Field(default_factory=list)
    status_history: List[dict] = Field(default_factory=list)
    internal_notes: List[InternalNoteOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# DASHBOARD & ANALYTICS SCHEMAS
# ==========================================

class IndustryDashboardSummaryOut(BaseModel):
    total_opportunities: int
    published_opportunities: int
    draft_opportunities: int
    closed_opportunities: int
    total_applications: int
    under_review_applications: int
    shortlisted_applications: int
    interview_applications: int
    offered_applications: int
    accepted_applications: int
    rejected_applications: int
    recent_opportunities: List[IndustryOpportunityOut]
    recent_applications: List[ApplicantSummaryOut]
    verification_status: VerificationStatus


class IndustryAnalyticsOut(BaseModel):
    period: str
    total_opportunities: int
    published_opportunities: int
    total_applications: int
    pipeline_funnel: dict
    interview_conversion_rate: float
    offer_conversion_rate: float
    match_score_distribution: dict
    top_skill_demands: List[dict]


# ==========================================
# ADMIN VERIFICATION SCHEMAS
# ==========================================

class AdminVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    reason: Optional[str] = None
