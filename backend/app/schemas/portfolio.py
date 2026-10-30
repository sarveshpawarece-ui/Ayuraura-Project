import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from app.models.domain import PortfolioVisibility, ExperienceType

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=10, max_length=2000)
    role: Optional[str] = Field(None, max_length=100)
    technologies: List[str] = []
    skills_used: List[str] = []
    project_url: Optional[str] = None
    repository_url: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_featured: bool = False
    visibility: str = "PORTFOLIO_ONLY"
    sort_order: int = 0

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    role: Optional[str] = None
    technologies: Optional[List[str]] = None
    skills_used: Optional[List[str]] = None
    project_url: Optional[str] = None
    repository_url: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_featured: Optional[bool] = None
    visibility: Optional[str] = None
    sort_order: Optional[int] = None

class ProjectOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    student_profile_id: uuid.UUID
    title: str
    description: str
    role: Optional[str] = None
    technologies: List[str] = []
    skills_used: List[str] = []
    project_url: Optional[str] = None
    repository_url: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_featured: bool
    visibility: str
    sort_order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ExperienceCreate(BaseModel):
    organization: str = Field(..., min_length=2, max_length=255)
    role: str = Field(..., min_length=2, max_length=150)
    experience_type: ExperienceType = ExperienceType.INTERNSHIP
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: str = Field(..., min_length=2, max_length=50)
    end_date: Optional[str] = None
    is_current: bool = False
    skills_used: List[str] = []
    visibility: str = "PORTFOLIO_ONLY"
    sort_order: int = 0

class ExperienceUpdate(BaseModel):
    organization: Optional[str] = None
    role: Optional[str] = None
    experience_type: Optional[ExperienceType] = None
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    skills_used: Optional[List[str]] = None
    visibility: Optional[str] = None
    sort_order: Optional[int] = None

class ExperienceOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    student_profile_id: uuid.UUID
    organization: str
    role: str
    experience_type: str
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool
    skills_used: List[str] = []
    visibility: str
    sort_order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CertificationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    issuer: str = Field(..., min_length=2, max_length=255)
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    certificate_url: Optional[str] = None
    description: Optional[str] = None
    visibility: str = "PORTFOLIO_ONLY"
    sort_order: int = 0

class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    certificate_url: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    sort_order: Optional[int] = None

class CertificationOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    student_profile_id: uuid.UUID
    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    certificate_url: Optional[str] = None
    description: Optional[str] = None
    visibility: str
    sort_order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AchievementCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    issuer: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    visibility: str = "PORTFOLIO_ONLY"
    sort_order: int = 0

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    visibility: Optional[str] = None
    sort_order: Optional[int] = None

class AchievementOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    student_profile_id: uuid.UUID
    title: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    visibility: str
    sort_order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EducationCreate(BaseModel):
    institution: str = Field(..., min_length=2, max_length=255)
    degree: str = Field(..., min_length=2, max_length=150)
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0

class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None

class EducationOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    student_profile_id: uuid.UUID
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    sort_order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PortfolioUpdateIn(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    headline: Optional[str] = Field(None, max_length=120)
    summary: Optional[str] = Field(None, max_length=1000)
    slug: Optional[str] = Field(None, min_length=3, max_length=150)
    visibility: Optional[PortfolioVisibility] = None
    contact_email_public: Optional[bool] = None
    contact_phone_public: Optional[bool] = None
    show_skill_scores: Optional[bool] = None
    show_skill_gaps: Optional[bool] = None
    show_assessments: Optional[bool] = None
    show_recommendations: Optional[bool] = None
    show_applications: Optional[bool] = None

class PortfolioOut(BaseModel):
    id: uuid.UUID
    student_profile_id: uuid.UUID
    title: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    slug: str
    visibility: str
    is_published: bool
    published_at: Optional[datetime] = None
    contact_email_public: bool
    contact_phone_public: bool
    show_skill_scores: bool
    show_skill_gaps: bool
    show_assessments: bool
    show_recommendations: bool
    show_applications: bool
    section_config: Dict[str, Any] = {}
    completion_pct: float = 0.0
    view_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Aggregated content sections for builder
    projects: List[ProjectOut] = []
    experiences: List[ExperienceOut] = []
    certifications: List[CertificationOut] = []
    achievements: List[AchievementOut] = []
    educations: List[EducationOut] = []

    model_config = ConfigDict(from_attributes=True)

class PublicPortfolioOut(BaseModel):
    title: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    slug: str
    visibility: str
    published_at: Optional[datetime] = None
    
    # Sanitized Public Student Profile Header
    student_name: str
    profile_photo_url: Optional[str] = None
    college_name: Optional[str] = None
    degree_program: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    
    # Public Contacts (if enabled)
    public_email: Optional[str] = None
    public_phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None

    # Target Career
    target_career_title: Optional[str] = None
    target_career_category: Optional[str] = None
    career_interests: List[str] = []

    # Curated Sections
    skills: List[Dict[str, Any]] = []
    projects: List[ProjectOut] = []
    experiences: List[ExperienceOut] = []
    certifications: List[CertificationOut] = []
    achievements: List[AchievementOut] = []
    educations: List[EducationOut] = []
    assessments: List[Dict[str, Any]] = []
    recommendations: List[Dict[str, Any]] = []
    selected_applications: List[Dict[str, Any]] = []
