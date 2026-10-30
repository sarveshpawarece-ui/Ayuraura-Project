import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.assessment import CareerRoleSimple

class LearningResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: Optional[str] = None
    resource_type: str
    provider: str
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty: Optional[str] = "MEDIUM"
    estimated_hours: Optional[int] = 10
    price_type: Optional[str] = "FREE"
    language: str = "English"

class RecommendationItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    skill_id: uuid.UUID
    skill_name: str
    current_score: Optional[float] = None
    required_score: float
    gap: float
    classification: str
    priority: str
    relevance_score: float
    reason: str
    resource: LearningResourceOut
    status: str
    generated_at: datetime

class RecommendationSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_recommendations: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0

class StudentRecommendationsReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    career_role: Optional[CareerRoleSimple] = None
    summary: RecommendationSummaryOut
    recommendations: List[RecommendationItemOut] = []
    generated_at: datetime
