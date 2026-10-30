import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.assessment import CareerRoleSimple

class RequiredSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: uuid.UUID
    skill_name: str
    required_score: float
    importance: str
    is_required: bool = True

class CareerRoleRequiredSkillsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    career_role: CareerRoleSimple
    skills: List[RequiredSkillOut] = []

class SkillGapItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: uuid.UUID
    skill_name: str
    category: str
    current_score: Optional[float] = None
    required_score: float
    gap: float
    classification: str  # MASTERED, ADEQUATE, WEAK, MISSING
    priority: str        # NONE, LOW, MEDIUM, HIGH, CRITICAL
    importance: str      # CRITICAL, HIGH, MEDIUM, LOW
    is_required: bool = True

class SkillGapSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_required_skills: int = 0
    mastered: int = 0
    adequate: int = 0
    weak: int = 0
    missing: int = 0
    critical_gaps: int = 0
    high_priority_gaps: int = 0
    overall_gap_percentage: float = 0.0

class StudentSkillGapReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    career_role: Optional[CareerRoleSimple] = None
    summary: SkillGapSummaryOut
    skills: List[SkillGapItemOut] = []
    generated_at: datetime

class SkillGapHistoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    snapshot_id: uuid.UUID
    generated_at: datetime
    career_role_name: str
    overall_gap_percentage: float
    mastered: int
    adequate: int
    weak: int
    missing: int
