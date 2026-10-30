from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date
import uuid
from app.models.expert_guidance import SessionType, SessionLevel, SessionStatus, SessionVisibility

# ============================================================
# EXPERT PROFILE SCHEMAS
# ============================================================

class ExpertProfileBase(BaseModel):
    full_name: str
    professional_title: str = "Ayurvedic Consultant & Faculty"
    institution_or_clinic: Optional[str] = None
    qualifications: str = "BAMS, MD (Ayurveda)"
    specialization: str = "Kayachikitsa"
    areas_of_expertise: List[str] = []
    subjects: List[str] = []
    skills: List[str] = []
    languages: List[str] = ["English", "Hindi", "Sanskrit"]
    years_of_experience: int = 5
    bio: Optional[str] = None
    profile_photo_url: Optional[str] = None

class ExpertProfileCreate(ExpertProfileBase):
    pass

class ExpertProfileResponse(ExpertProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    is_verified: bool
    verification_badge_title: str
    average_rating: float
    total_ratings: int
    completed_sessions_count: int
    total_sessions_count: int
    followers_count: int
    bayesian_score: float
    is_following: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# SESSION SCHEMAS
# ============================================================

class SessionCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    session_type: SessionType = SessionType.LIVE_LECTURE
    category: str = "Panchakarma"
    topics: List[str] = []
    level: SessionLevel = SessionLevel.INTERMEDIATE
    scheduled_date: date
    start_time: str
    end_time: Optional[str] = None
    duration_minutes: int = 60
    max_students: int = 200
    language: str = "English / Hindi"
    session_thumbnail: Optional[str] = None
    learning_objectives: List[str] = []
    prerequisites: List[str] = []
    tags: List[str] = []
    visibility: SessionVisibility = SessionVisibility.PUBLIC
    recording_available: bool = True
    live_stream_url: Optional[str] = "https://meet.google.com/ayu-live-stream"

class RecordedSessionUploadRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    category: str = "Kayachikitsa"
    topics: List[str] = []
    level: SessionLevel = SessionLevel.INTERMEDIATE
    duration_minutes: int = 45
    language: str = "English / Hindi"
    session_thumbnail: Optional[str] = None
    video_url: str = Field(..., min_length=5)
    learning_objectives: List[str] = []
    prerequisites: List[str] = []
    tags: List[str] = []
    visibility: SessionVisibility = SessionVisibility.PUBLIC

class SessionStatusUpdateRequest(BaseModel):
    status: SessionStatus
    live_stream_url: Optional[str] = None
    recording_url: Optional[str] = None
    recording_available: Optional[bool] = None

class SessionResponse(BaseModel):
    id: uuid.UUID
    expert_user_id: uuid.UUID
    expert_profile_id: Optional[uuid.UUID] = None
    expert_name: str
    expert_role: str
    institution: Optional[str] = None
    title: str
    description: str
    session_type: SessionType
    category: str
    topics: List[str]
    level: SessionLevel
    scheduled_date: date
    start_time: str
    end_time: Optional[str]
    duration_minutes: int
    max_students: int
    language: str
    session_thumbnail: Optional[str]
    learning_objectives: List[str]
    prerequisites: List[str]
    tags: List[str]
    visibility: SessionVisibility
    status: SessionStatus
    live_stream_url: Optional[str]
    current_live_attendees: int
    recording_available: bool
    recording_url: Optional[str]
    recording_duration: int
    recording_views_count: int
    average_rating: float
    total_ratings: int
    participants_count: int
    is_registered: Optional[bool] = False
    has_attended_live: Optional[bool] = False
    has_watched_recording: Optional[bool] = False
    has_rated: Optional[bool] = False
    is_eligible_to_rate: Optional[bool] = False
    recommendation_score: Optional[float] = None
    recommendation_reasons: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# RATING & REVIEW SCHEMAS
# ============================================================

class SessionRatingCreate(BaseModel):
    overall_rating: float = Field(..., ge=1.0, le=5.0)
    rating_knowledge: int = Field(5, ge=1, le=5)
    rating_teaching_quality: int = Field(5, ge=1, le=5)
    rating_clarity: int = Field(5, ge=1, le=5)
    rating_practical_value: int = Field(5, ge=1, le=5)
    rating_engagement: int = Field(5, ge=1, le=5)
    rating_usefulness: int = Field(5, ge=1, le=5)
    review_text: Optional[str] = None

class SessionRatingResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    expert_user_id: uuid.UUID
    student_user_id: uuid.UUID
    student_name: str
    overall_rating: float
    rating_knowledge: int
    rating_teaching_quality: int
    rating_clarity: int
    rating_practical_value: int
    rating_engagement: int
    rating_usefulness: int
    review_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# Q&A SCHEMAS
# ============================================================

class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=3)

class AnswerCreate(BaseModel):
    answer_text: str = Field(..., min_length=2)

class QuestionResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    user_role: str
    question_text: str
    answer_text: Optional[str]
    answered_by_user_id: Optional[uuid.UUID]
    answered_at: Optional[datetime]
    is_answered: bool
    upvotes_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# DISCOVERY FEED RESPONSE
# ============================================================

class DiscoveryFeedResponse(BaseModel):
    live_now: List[SessionResponse]
    recommended_sessions: List[SessionResponse]
    upcoming_sessions: List[SessionResponse]
    recently_recorded: List[SessionResponse]
    top_experts: List[ExpertProfileResponse]
    followed_experts_sessions: List[SessionResponse]
    career_aligned_sessions: List[SessionResponse]
    popular_topics: List[str]
