from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4
from app.models.domain import ProficiencyLevel, SkillSource, ExperienceType

class StudentExperienceBase(BaseModel):
    title: str = Field(..., max_length=255)
    organization: str = Field(..., max_length=255)
    experience_type: ExperienceType = ExperienceType.INTERNSHIP
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False

class StudentExperienceCreate(StudentExperienceBase):
    pass

class StudentExperienceOut(StudentExperienceBase):
    id: UUID4
    student_profile_id: UUID4
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentProjectBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    technologies: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=150)
    project_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class StudentProjectCreate(StudentProjectBase):
    pass

class StudentProjectOut(StudentProjectBase):
    id: UUID4
    student_profile_id: UUID4
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SelfDeclaredSkillCreate(BaseModel):
    skill_name_or_id: str
    proficiency_level: ProficiencyLevel = ProficiencyLevel.INTERMEDIATE

class StudentSkillItemOut(BaseModel):
    id: UUID4
    skill_id: UUID4
    skill_name: str
    category: str
    proficiency_level: ProficiencyLevel
    source: SkillSource

    model_config = ConfigDict(from_attributes=True)


class StudentProfileBase(BaseModel):
    name_prefix: Optional[str] = Field(None, max_length=50)
    first_name: Optional[str] = Field(None, max_length=150)
    middle_name: Optional[str] = Field(None, max_length=150)
    last_name: Optional[str] = Field(None, max_length=150)
    date_of_birth: Optional[str] = Field(None, max_length=50)
    gender: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    profile_photo_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None

    college_name: Optional[str] = Field(None, max_length=255)
    course: Optional[str] = Field(None, max_length=100)
    specialization: Optional[str] = Field(None, max_length=150)
    current_year: Optional[int] = Field(None, ge=1, le=10)
    graduation_year: Optional[int] = Field(None, ge=1990, le=2100)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)

    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field("India", max_length=100)

    linkedin_url: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    website_url: Optional[str] = Field(None, max_length=500)

    interests: List[str] = []

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileOut(StudentProfileBase):
    id: UUID4
    user_id: UUID4
    full_name: str
    enrollment_number: Optional[str] = None
    profile_completion_percentage: int = 0
    profile_status: str = "INCOMPLETE"
    skills: List[StudentSkillItemOut] = []
    experiences: List[StudentExperienceOut] = []
    projects: List[StudentProjectOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
