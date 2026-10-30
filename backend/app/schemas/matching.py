import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.opportunity import (
    IndustryOpportunityOut,
    OpportunityMatchBreakdownOut,
    OpportunityMatchItemOut
)

class MatchWeightConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_match_weight: float = Field(0.50, ge=0.0, description="Weight for skill proficiency alignment")
    career_match_weight: float = Field(0.25, ge=0.0, description="Weight for target career relevance")
    required_coverage_weight: float = Field(0.15, ge=0.0, description="Weight for mandatory required skill coverage")
    experience_fit_weight: float = Field(0.10, ge=0.0, description="Weight for candidate experience level fit")


class RecalculateMatchesRequest(BaseModel):
    weights: Optional[MatchWeightConfig] = None

class CandidateRankItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_profile_id: uuid.UUID
    student_name: str
    email: str
    target_career_name: str
    match_score: float
    match_classification: str
    priority: str
    breakdown: OpportunityMatchBreakdownOut
    matched_skills: List[str] = []
    partial_skills: List[str] = []
    missing_skills: List[str] = []
    critical_missing_skills: List[str] = []
    reason: str
    generated_at: datetime

class OpportunityCandidateMatrixOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opportunity_id: uuid.UUID
    opportunity_title: str
    organization_name: str
    total_candidates_evaluated: int = 0
    top_candidates: List[CandidateRankItemOut] = []
    evaluated_at: datetime
