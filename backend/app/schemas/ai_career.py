from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 17, 18, 19, 20, 31, 32 — AI, CAREER & COACHING SCHEMAS
# ============================================================

class AIChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None

class AIChatResponseOut(BaseModel):
    session_id: str
    reply: str
    suggested_followups: List[str] = []
    context_used: Dict[str, Any] = {}

class CareerRoadmapOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    target_career_title: str
    current_readiness_score: float
    stages: List[Dict[str, Any]]
    skill_milestones: List[Dict[str, Any]]

class CareerGoalCreateIn(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    target_date: date
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, URGENT
    milestones: List[str] = []

class CareerGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    title: str
    description: Optional[str] = None
    target_date: date
    priority: str
    progress_percentage: int
    is_completed: bool
    created_at: datetime

class ResumeBuilderSaveIn(BaseModel):
    title: str = "My Professional Resume"
    template_name: str = "CLASSICAL_AYURVEDIC"
    resume_data: Dict[str, Any]

class ResumeAnalysisOut(BaseModel):
    ats_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    formatting_warnings: List[str]
    improvement_suggestions: List[str]

class MockInterviewStartIn(BaseModel):
    career_role_title: str
    category: str = "AYURVEDA_DOMAIN"

class MockInterviewAnswerIn(BaseModel):
    answer: str = Field(..., min_length=2)

class MockInterviewReportOut(BaseModel):
    overall_score: float
    communication_score: float
    technical_score: float
    confidence_score: float
    answer_relevance: float
    strengths: List[str]
    areas_for_growth: List[str]
    safety_disclaimer: str = "AI-generated evaluations are strictly educational and do not constitute clinical or professional licensing certification."

class AICareerRecommendationItemOut(BaseModel):
    career_role_id: uuid.UUID
    career_title: str
    match_score_pct: float
    why_recommended: str
    matching_factors: List[str]
    missing_requirements: List[str]
    confidence_score_pct: float

class InterviewCoachIn(BaseModel):
    question: str
    answer: str

class InterviewCoachOut(BaseModel):
    clarity_score: float
    structure_star_feedback: str
    ayurvedic_terminology_review: str
    suggested_improved_response: str
    clinical_safety_note: str

class PortfolioReviewOut(BaseModel):
    overall_grade: str  # A+, A, B, C
    completeness_score: float
    clarity_score: float
    skills_alignment_score: float
    projects_depth_score: float
    presentation_score: float
    actionable_checklist: List[str]

class StudyAssistantIn(BaseModel):
    question: str

class StudyAssistantOut(BaseModel):
    answer: str
    classical_citations: List[str]
    curriculum_topic: str
    medical_disclaimer: str = "This educational study assistance is for academic learning only and never constitutes medical diagnosis or treatment advice."
