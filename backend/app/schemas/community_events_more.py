from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 38-50 — INSTITUTION, ALUMNI, EVENTS, FORUM, WELLNESS, HERBS, VOLUNTEERS SCHEMAS
# ============================================================

class AlumniProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    graduation_year: int
    institution_name: str
    degree: str
    current_role_title: str
    current_organization: str
    city: str
    state: str
    domain_expertise: List[str]
    mentorship_available: bool

class MentorshipRequestIn(BaseModel):
    mentor_user_id: uuid.UUID
    topic: str
    message: str
    preferred_date: Optional[date] = None

class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    event_type: str
    speaker_name: str
    speaker_title: str
    speaker_organization: Optional[str] = None
    event_date: date
    start_time: str
    end_time: str
    is_online: bool
    location_venue: Optional[str] = None
    meeting_url: Optional[str] = None
    capacity: int
    registered_count: int
    status: str

class EventCertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    certificate_token: str
    certificate_hash: str
    attendee_name: str
    event_title: str
    event_type: str
    issued_at: datetime
    is_valid: bool

class PrivacySettingsUpdateIn(BaseModel):
    profile_visibility: Optional[str] = None
    portfolio_visibility: Optional[str] = None
    contact_email_visible: Optional[bool] = None
    contact_phone_visible: Optional[bool] = None
    show_assessment_scores: Optional[bool] = None
    show_volunteer_hours: Optional[bool] = None

class PrivacySettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    profile_visibility: str
    portfolio_visibility: str
    contact_email_visible: bool
    contact_phone_visible: bool
    show_assessment_scores: bool
    show_volunteer_hours: bool

class ModerationReportIn(BaseModel):
    reported_user_id: uuid.UUID
    reason_category: str
    description: str
    evidence_url: Optional[str] = None

class WellnessResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: str
    target_focus: str
    suitable_for_prakriti: List[str]
    difficulty_level: str
    duration_minutes: int
    content_html: str
    steps: List[Dict[str, Any]]
    contraindications_text: Optional[str] = None
    classical_citations: List[str]
    video_demonstration_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class Ayurveda3DModelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    model_code: str
    title: str
    category: str
    description: str
    curriculum_level: str
    body_region: str
    hotspots_data: List[Dict[str, Any]]
    learning_points: List[str]
    classical_citations: List[str]
    thumbnail_url: Optional[str] = None

class MedicinalPlantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    common_name: str
    sanskrit_name: str
    sanskrit_devanagari: str
    botanical_name: str
    family: str
    synonyms: List[str]
    rasa: List[str]
    guna: List[str]
    virya: str
    vipaka: str
    prabhava: Optional[str] = None
    doshakarma: str
    parts_used: List[str]
    classical_formulations: List[str]
    phytochemical_markers: List[str]
    classical_citations: List[str]
    image_url: Optional[str] = None
    description: str

class ResearchPaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    authors: List[str]
    journal_name: str
    publication_year: int
    doi_url: Optional[str] = None
    abstract: str
    study_type: str
    linked_herb_names: List[str]

class StudentProjectShowcaseIn(BaseModel):
    title: str
    description: str
    abstract: str
    project_category: str
    skills_demonstrated: List[str]
    media_urls: List[str] = []
    document_url: Optional[str] = None

class StudentProjectShowcaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    title: str
    description: str
    abstract: str
    project_category: str
    skills_demonstrated: List[str]
    media_urls: List[str]
    document_url: Optional[str] = None
    is_verified: bool
    moderation_status: str
    created_at: datetime

class ForumPostCreateIn(BaseModel):
    category_id: uuid.UUID
    title: str = Field(..., min_length=3)
    content: str = Field(..., min_length=5)
    tags: List[str] = []

class ForumPostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    author_id: uuid.UUID
    title: str
    content: str
    tags: List[str]
    views_count: int
    upvotes_count: int
    comments_count: int
    is_pinned: bool
    is_locked: bool
    is_solved: bool
    created_at: datetime

class ForumCommentCreateIn(BaseModel):
    content: str = Field(..., min_length=1)
    parent_comment_id: Optional[uuid.UUID] = None

class ForumCommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    post_id: uuid.UUID
    author_id: uuid.UUID
    parent_comment_id: Optional[uuid.UUID] = None
    content: str
    upvotes_count: int
    is_accepted_answer: bool
    created_at: datetime

class NGOVolunteerOppCreateIn(BaseModel):
    title: str
    description: str
    skills_required: List[str]
    location_city: str
    location_state: str
    venue_address: str
    start_date: date
    end_date: date
    estimated_hours: float
    capacity: int = 15
    requirements_text: str

class NGOVolunteerOppOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ngo_id: uuid.UUID
    ngo_name: str
    ngo_darpan_id: Optional[str] = None
    title: str
    description: str
    skills_required: List[str]
    location_city: str
    location_state: str
    venue_address: str
    start_date: date
    end_date: date
    estimated_hours: float
    capacity: int
    selected_count: int
    requirements_text: str
    status: str
    created_at: datetime

class NGOVolunteerCertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    certificate_token: str
    certificate_hash: str
    student_name: str
    ngo_name: str
    opportunity_title: str
    hours_served: float
    issued_at: datetime
    is_valid: bool
