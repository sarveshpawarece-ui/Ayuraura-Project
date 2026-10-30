from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, UUID4, Field
from app.models.domain import QuestionCategory, QuestionDifficulty, QuestionType, AttemptStatus

class AssessmentOptionOut(BaseModel):
    id: UUID4
    option_text: str
    option_order: int

    class Config:
        from_attributes = True

class AssessmentQuestionOut(BaseModel):
    id: UUID4
    question_text: str
    question_type: QuestionType
    category: QuestionCategory
    difficulty: QuestionDifficulty
    weight: float
    options: List[AssessmentOptionOut]

    class Config:
        from_attributes = True

class CareerRoleSimple(BaseModel):
    id: UUID4
    name: str
    category: Optional[str] = None
    domain: Optional[str] = None

    class Config:
        from_attributes = True

class AssessmentStartOut(BaseModel):
    attempt_id: UUID4
    career_role: CareerRoleSimple
    questions: List[AssessmentQuestionOut]
    started_at: datetime
    total_questions: int
    status: AttemptStatus

class AssessmentAnswerSave(BaseModel):
    question_id: UUID4
    selected_option_id: Optional[UUID4] = None

class SkillScoreOut(BaseModel):
    skill_id: UUID4
    skill_name: str
    earned_weight: float
    available_weight: float
    score: float
    proficiency: str

class CategoryScoreOut(BaseModel):
    category: QuestionCategory
    earned_weight: float
    available_weight: float
    score: float
    proficiency: str

class AssessmentResultOut(BaseModel):
    attempt_id: UUID4
    career_role: CareerRoleSimple
    overall_score: float
    categories: List[CategoryScoreOut]
    skills: List[SkillScoreOut]
    strengths: List[str]
    weaknesses: List[str]
    started_at: datetime
    submitted_at: datetime

class AssessmentHistoryItem(BaseModel):
    attempt_id: UUID4
    career_role: CareerRoleSimple
    overall_score: Optional[float] = None
    status: AttemptStatus
    started_at: datetime
    submitted_at: Optional[datetime] = None
