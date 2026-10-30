from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, UUID4
from app.models.domain import SkillCategory, ProficiencyLevel, OpportunityType, OpportunityStatus, ApplicationStatus

class SkillBase(BaseModel):
    name: str
    category: SkillCategory
    description: Optional[str] = None
    weight_factor: float = 1.0

class SkillOut(SkillBase):
    id: UUID4

    class Config:
        from_attributes = True

class StudentSkillUpdate(BaseModel):
    skill_id: UUID4
    proficiency_level: ProficiencyLevel

class OpportunitySkillCreate(BaseModel):
    skill_id: UUID4
    min_proficiency: ProficiencyLevel = ProficiencyLevel.NOVICE
    is_mandatory: bool = True

class OpportunityCreate(BaseModel):
    title: str
    opportunity_type: OpportunityType
    description: str
    location: str
    stipend_or_salary: Optional[str] = None
    required_skills: List[OpportunitySkillCreate] = []

class OpportunityOut(BaseModel):
    id: UUID4
    title: str
    opportunity_type: OpportunityType
    description: str
    location: str
    stipend_or_salary: Optional[str]
    status: OpportunityStatus
    created_at: datetime
    company_name: Optional[str] = None
    match_score: Optional[float] = None

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    opportunity_id: UUID4

class ApplicationOut(BaseModel):
    id: UUID4
    opportunity_id: UUID4
    opportunity_title: str
    company_name: str
    fit_score: float
    status: ApplicationStatus
    applied_at: datetime

    class Config:
        from_attributes = True

class SkillGapReport(BaseModel):
    overall_match_score: float
    target_career_title: str
    acquired_skills: List[Any]
    missing_skills: List[Any]
    recommended_actions: List[str]
    explainability_summary: str
