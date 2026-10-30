import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.topic_quiz import QuizDifficulty, QuizQuestionType, QuizAttemptStatus

# ============================================================
# SUBJECT / TOPIC / SUBTOPIC SCHEMAS
# ============================================================

class TopicQuizSubtopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    topic_id: uuid.UUID
    name: str
    description: Optional[str] = None
    display_order: int = 0


class TopicQuizTopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject_id: uuid.UUID
    name: str
    description: Optional[str] = None
    display_order: int = 0
    questions_count: int = 0
    subtopics: List[TopicQuizSubtopicOut] = []


class TopicQuizSubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    icon: str
    description: Optional[str] = None
    display_order: int = 0
    topics: List[TopicQuizTopicOut] = []


# ============================================================
# QUESTION DISPLAY SCHEMAS (EXAM MODE)
# ============================================================

class QuizOptionOut(BaseModel):
    id: str
    text: str


class QuizQuestionOut(BaseModel):
    id: uuid.UUID
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty: QuizDifficulty
    question_type: QuizQuestionType
    question_text: str
    options: List[QuizOptionOut]
    tags: List[str] = []


# ============================================================
# QUIZ GENERATION & ATTEMPT
# ============================================================

class QuizGenerateRequest(BaseModel):
    subject_id: Optional[uuid.UUID] = None
    subject_name: Optional[str] = None
    topic_id: Optional[uuid.UUID] = None
    topic_name: Optional[str] = None
    subtopic_id: Optional[uuid.UUID] = None
    subtopic_name: Optional[str] = None
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM
    limit: int = 10  # 5, 10, 20, 30, 50


class QuizGenerateResponse(BaseModel):
    attempt_id: uuid.UUID
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty_mode: str
    total_questions: int
    questions: List[QuizQuestionOut]
    started_at: datetime


# ============================================================
# QUIZ SUBMISSION & RESULTS
# ============================================================

class AnswerItem(BaseModel):
    question_id: uuid.UUID
    selected_option: str  # e.g. "A" or "True"


class QuizSubmitRequest(BaseModel):
    answers: List[AnswerItem]
    time_taken_seconds: int = 0


class QuizEvaluatedQuestionOut(BaseModel):
    question_id: uuid.UUID
    question_text: str
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty: str
    options: List[QuizOptionOut]
    student_answer: Optional[str] = None
    correct_answer: str
    is_correct: bool
    explanation: str
    clinical_pearl: Optional[str] = None


class RecommendedExpertSummary(BaseModel):
    expert_id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    specialization: str
    institution: Optional[str] = None
    average_rating: float
    total_ratings: int
    bayesian_score: float
    total_points: int = 0
    current_streak: int = 0
    regularity_score: float = 100.0
    reason: str


class RecommendedLearningResource(BaseModel):
    id: str
    title: str
    resource_type: str
    category: str
    url: Optional[str] = None
    description: Optional[str] = None


class QuizResultResponse(BaseModel):
    attempt_id: uuid.UUID
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty_mode: str
    total_questions: int
    correct_count: int
    incorrect_count: int
    score_percentage: float
    time_taken_seconds: int
    status: str
    evaluated_questions: List[QuizEvaluatedQuestionOut]
    weak_topics_detected: List[str]
    recommended_experts: List[RecommendedExpertSummary]
    recommended_learning_resources: List[RecommendedLearningResource]
    submitted_at: datetime


# ============================================================
# TOPIC PERFORMANCE & ANALYTICS
# ============================================================

class StudentTopicPerformanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subject_name: str
    topic_name: str
    total_questions_answered: int
    total_correct: int
    mastery_percentage: float
    is_weak_area: bool
    quizzes_taken_count: int
    last_practiced_at: datetime


class StudentTopicAnalyticsResponse(BaseModel):
    overall_mastery: float
    total_quizzes_taken: int
    total_questions_practiced: int
    strong_topics: List[StudentTopicPerformanceOut]
    weak_topics: List[StudentTopicPerformanceOut]
    topic_breakdown: List[StudentTopicPerformanceOut]


class PersonalizedQuizRecommendationOut(BaseModel):
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty: str
    recommendation_reason: str
    weak_mastery_pct: Optional[float] = None
    icon: str = "Sparkles"


# ============================================================
# ADMIN QUESTION MANAGEMENT SCHEMAS
# ============================================================

class AdminQuestionCreateRequest(BaseModel):
    subject_id: uuid.UUID
    topic_id: uuid.UUID
    subtopic_id: Optional[uuid.UUID] = None
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM
    question_type: QuizQuestionType = QuizQuestionType.MCQ
    question_text: str
    options: List[Dict[str, Any]]  # [{"id": "A", "text": "...", "is_correct": true}, ...]
    correct_answer: str
    explanation: str
    clinical_pearl: Optional[str] = None
    tags: List[str] = []


class AdminQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject_id: uuid.UUID
    topic_id: uuid.UUID
    subtopic_id: Optional[uuid.UUID] = None
    subject_name: str
    topic_name: str
    subtopic_name: Optional[str] = None
    difficulty: QuizDifficulty
    question_type: QuizQuestionType
    question_text: str
    options: List[Dict[str, Any]]
    correct_answer: str
    explanation: str
    clinical_pearl: Optional[str] = None
    tags: List[str] = []
    is_active: bool
    created_at: datetime
