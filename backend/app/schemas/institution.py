import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.domain import VerificationStatus, InstitutionType, MembershipStatus

class InstitutionProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    institution_name: str
    code: Optional[str] = None
    aishe_code: str
    description: Optional[str] = None
    institution_type: str
    website_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_person_prefix: Optional[str] = None
    contact_person_first_name: Optional[str] = None
    contact_person_middle_name: Optional[str] = None
    contact_person_last_name: Optional[str] = None
    contact_person_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    logo_url: Optional[str] = None
    accreditation_status: Optional[str] = None
    verification_status: str

    model_config = ConfigDict(from_attributes=True)

class InstitutionProfileUpdate(BaseModel):
    institution_name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    institution_type: Optional[InstitutionType] = None
    website_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    contact_person_prefix: Optional[str] = None
    contact_person_first_name: Optional[str] = None
    contact_person_middle_name: Optional[str] = None
    contact_person_last_name: Optional[str] = None
    contact_person_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    accreditation_status: Optional[str] = None

class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class DepartmentOut(BaseModel):
    id: str
    institution_id: str
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    student_count: int = 0
    average_skill_score: float = 0.0
    assessment_completion_rate: float = 0.0
    skill_gap_count: int = 0
    application_count: int = 0
    interview_count: int = 0
    offer_count: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StudentMembershipInviteIn(BaseModel):
    email: EmailStr
    student_identifier: Optional[str] = None
    department_id: Optional[str] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None

class StudentMembershipUpdateIn(BaseModel):
    department_id: Optional[str] = None
    student_identifier: Optional[str] = None
    membership_status: Optional[MembershipStatus] = None
    graduation_year: Optional[int] = None

class StudentMembershipOut(BaseModel):
    id: str
    student_profile_id: str
    institution_id: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    student_identifier: Optional[str] = None
    enrollment_year: Optional[int] = None
    graduation_year: Optional[int] = None
    membership_status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StudentSummaryOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    degree_program: Optional[str] = None
    current_year: Optional[int] = None
    profile_completion_pct: float = 0.0
    assessment_completed: bool = False
    average_skill_score: float = 0.0
    critical_gap_count: int = 0
    total_applications_count: int = 0
    membership_status: str = "ACTIVE"

    model_config = ConfigDict(from_attributes=True)

class CareerReadinessIndicatorsOut(BaseModel):
    profile_completion_pct: float = 0.0
    assessment_status: str = "NOT_STARTED"
    skill_alignment_score: float = 0.0
    critical_gap_count: int = 0
    career_alignment_level: str = "MEDIUM"
    readiness_level: str = "DEVELOPING"
    summary_notes: List[str] = []

class StudentDetailOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    bio: Optional[str] = None
    degree_program: Optional[str] = None
    current_year: Optional[int] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    membership_status: str = "ACTIVE"
    student_identifier: Optional[str] = None
    target_career_id: Optional[str] = None
    target_career_title: Optional[str] = None
    readiness_indicators: CareerReadinessIndicatorsOut
    evaluated_skills: List[Dict[str, Any]] = []
    skill_gaps: List[Dict[str, Any]] = []
    recommendations: List[Dict[str, Any]] = []
    applications: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)

class InstitutionOpportunityOut(BaseModel):
    id: str
    title: str
    organization_name: str
    opportunity_type: str
    work_mode: str
    employment_type: str
    location_text: Optional[str] = None
    application_deadline: Optional[datetime] = None
    status: str
    required_skills: List[Dict[str, Any]] = []
    institution_applicant_count: int = 0
    average_institution_match: float = 0.0

class InstitutionApplicationOut(BaseModel):
    id: str
    student_profile_id: str
    student_name: str
    opportunity_id: str
    opportunity_title: str
    organization_name: str
    department_name: Optional[str] = None
    match_score: float
    status: str
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    status_history: List[Dict[str, Any]] = []

class InstitutionDashboardSummaryOut(BaseModel):
    total_students: int = 0
    active_students: int = 0
    assessed_students: int = 0
    assessment_completion_rate: float = 0.0
    average_skill_score: float = 0.0
    students_with_gaps: int = 0
    total_applications: int = 0
    interview_count: int = 0
    offer_count: int = 0
    accepted_count: int = 0
    verification_status: str = "PENDING"
    department_count: int = 0
    recent_alerts: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]] = []

class InstitutionAnalyticsOut(BaseModel):
    period: str = "30d"
    total_students: int = 0
    assessed_students_pct: float = 0.0
    profile_completion_avg: float = 0.0
    average_skill_score: float = 0.0
    average_gap_count: float = 0.0
    pipeline_funnel: Dict[str, int] = {}
    top_skills: List[Dict[str, Any]] = []
    common_skill_gaps: List[Dict[str, Any]] = []
    career_distribution: List[Dict[str, Any]] = []
    department_metrics: List[Dict[str, Any]] = []
    demand_vs_supply: List[Dict[str, Any]] = []


# =============================================================
# INSTITUTION VERIFICATION & INVITATION SCHEMAS
# =============================================================

class InstitutionVerificationSubmitIn(BaseModel):
    ncism_approval_number: str = Field(..., min_length=3, max_length=100)
    university_affiliation: str = Field(..., min_length=3, max_length=255)
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    contact_person_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    remarks: Optional[str] = None

class InstitutionVerificationStatusOut(BaseModel):
    institution_id: str
    institution_name: str
    aishe_code: str
    ncism_approval_number: Optional[str] = None
    university_affiliation: Optional[str] = None
    verification_status: str
    verification_submitted_at: Optional[datetime] = None
    verification_documents: List[Dict[str, Any]] = []
    verification_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class InstitutionInvitationCreateIn(BaseModel):
    email: EmailStr
    role: str = Field(default="FACULTY", pattern="^(FACULTY|STUDENT)$")
    invited_name: Optional[str] = None
    department_id: Optional[str] = None
    designation: Optional[str] = None
    academic_year: Optional[str] = None
    assigned_subjects: Optional[List[Dict[str, Any]]] = None

class InstitutionInvitationOut(BaseModel):
    id: str
    institution_id: str
    institution_name: str
    email: str
    role: str
    invited_name: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = None
    academic_year: Optional[str] = None
    assigned_subjects: List[Any] = []
    invitation_token: str
    invite_url: str
    status: str
    expires_at: datetime
    created_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

