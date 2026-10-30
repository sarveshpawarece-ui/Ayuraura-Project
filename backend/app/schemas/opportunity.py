import uuid
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.assessment import CareerRoleSimple

class OpportunityRequiredSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    skill_id: uuid.UUID
    skill_name: str
    required_score: float
    importance: str
    is_required: bool

class IndustryOpportunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    opportunity_type: str
    organization_name: str
    organization_description: Optional[str] = None
    location_text: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    work_mode: str
    employment_type: str
    experience_level: str
    application_url: Optional[str] = None
    source_name: str
    source_type: str
    application_deadline: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "INR"
    is_salary_disclosed: bool = True
    status: str
    required_skills: List[OpportunityRequiredSkillOut] = []

class OpportunityMatchBreakdownOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_match_score: float
    career_match_score: float
    required_skill_coverage: float
    experience_fit: float
    overall_match_score: float

class OpportunityMatchItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    opportunity: IndustryOpportunityOut
    match_score: float
    match_classification: str
    priority: str
    breakdown: OpportunityMatchBreakdownOut
    matched_skills: List[str] = []
    partial_skills: List[str] = []
    missing_skills: List[str] = []
    critical_missing_skills: List[str] = []
    reason: str
    status: str
    generated_at: datetime

class OpportunityMatchSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_opportunities: int = 0
    excellent: int = 0
    good: int = 0
    partial: int = 0
    low: int = 0
    internships: int = 0
    jobs: int = 0
    research: int = 0

class StudentOpportunitiesReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    target_career: Optional[CareerRoleSimple] = None
    summary: OpportunityMatchSummaryOut
    opportunities: List[OpportunityMatchItemOut] = []
    generated_at: datetime
