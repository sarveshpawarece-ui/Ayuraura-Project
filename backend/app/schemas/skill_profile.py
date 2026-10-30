import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.assessment import CareerRoleSimple

class SkillScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: uuid.UUID
    skill_name: str
    score: Optional[float] = None
    proficiency: str
    source: str = "ASSESSMENT"

class CategoryScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    score: float
    proficiency: str

class StudentSkillProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_score: Optional[float] = None
    target_career: Optional[CareerRoleSimple] = None
    last_assessed_at: Optional[datetime] = None
    skills: List[SkillScoreOut] = []
    categories: List[CategoryScoreOut] = []
    strengths: List[str] = []
    areas_to_improve: List[str] = []
    updated_at: Optional[datetime] = None

class SkillDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: uuid.UUID
    skill_name: str
    category: str
    description: Optional[str] = None
    score: Optional[float] = None
    proficiency: str
    source: str = "ASSESSMENT"
    assessment_attempt_id: Optional[uuid.UUID] = None
    calculated_at: Optional[datetime] = None

class SkillHistoryAttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: uuid.UUID
    submitted_at: datetime
    score: float
    proficiency: str

class SkillHistoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: uuid.UUID
    skill_name: str
    attempts: List[SkillHistoryAttemptOut] = []
