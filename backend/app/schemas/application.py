from datetime import datetime, date
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from app.models.domain import ApplicationStatus, CoverLetterStatus, OpportunityType, WorkMode, ExperienceLevel


class ApplicationCreateReq(BaseModel):
    opportunity_id: UUID
    status: Optional[ApplicationStatus] = ApplicationStatus.SAVED
    notes: Optional[str] = Field(None, max_length=5000)
    resume_version: Optional[str] = Field(None, max_length=100)
    cover_letter_status: Optional[CoverLetterStatus] = CoverLetterStatus.NOT_REQUIRED


class ApplicationMarkAppliedReq(BaseModel):
    notes: Optional[str] = Field(None, max_length=5000)
    resume_version: Optional[str] = Field(None, max_length=100)
    cover_letter_status: Optional[CoverLetterStatus] = None


class ApplicationStatusUpdateReq(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = Field(None, max_length=5000)


class ApplicationDetailsUpdateReq(BaseModel):
    notes: Optional[str] = Field(None, max_length=5000)
    follow_up_date: Optional[date] = None
    cover_letter_status: Optional[CoverLetterStatus] = None
    resume_version: Optional[str] = Field(None, max_length=100)


class ApplicationWithdrawReq(BaseModel):
    notes: Optional[str] = Field(None, max_length=1000)


class ApplicationStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    application_id: UUID
    old_status: Optional[str] = None
    new_status: str
    changed_at: datetime
    changed_by: str
    notes: Optional[str] = None


class ApplicationOpportunityBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    organization_name: str
    opportunity_type: OpportunityType
    location_text: Optional[str] = None
    work_mode: WorkMode
    experience_level: ExperienceLevel
    application_url: Optional[str] = None
    application_deadline: Optional[datetime] = None


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_profile_id: UUID
    opportunity_id: UUID
    match_id: Optional[UUID] = None

    status: ApplicationStatus
    applied_at: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    application_url: Optional[str] = None

    title_snapshot: Optional[str] = None
    organization_snapshot: Optional[str] = None
    match_score_snapshot: Optional[float] = None
    skill_match_snapshot: Optional[float] = None
    career_match_snapshot: Optional[float] = None
    coverage_snapshot: Optional[float] = None
    experience_fit_snapshot: Optional[float] = None
    matching_algorithm_version: Optional[str] = None

    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    cover_letter_status: CoverLetterStatus = CoverLetterStatus.NOT_REQUIRED
    resume_version: Optional[str] = None

    last_status_change_at: datetime
    created_at: datetime
    updated_at: datetime

    current_match_score: Optional[float] = None
    current_match_classification: Optional[str] = None
    match_score_delta: Optional[float] = None

    opportunity: Optional[ApplicationOpportunityBrief] = None
    status_history: List[ApplicationStatusHistoryOut] = []


class ApplicationSummaryOut(BaseModel):
    total_applications: int = 0
    saved: int = 0
    planned: int = 0
    applied: int = 0
    under_review: int = 0
    shortlisted: int = 0
    interview: int = 0
    offered: int = 0
    accepted: int = 0
    rejected: int = 0
    withdrawn: int = 0
    expired: int = 0
    closed: int = 0


class ApplicationAnalyticsOut(BaseModel):
    total_applications: int = 0
    submitted_applications: int = 0
    active_applications: int = 0
    interviews_count: int = 0
    offers_count: int = 0
    accepted_count: int = 0
    rejected_count: int = 0
    response_rate: float = 0.0
    interview_rate: float = 0.0
    offer_rate: float = 0.0
    average_match_score: float = 0.0
    common_required_skills: List[str] = []
    common_skill_gaps: List[str] = []


class ApplicationListReportOut(BaseModel):
    total: int
    page: int
    page_size: int
    summary: ApplicationSummaryOut
    applications: List[ApplicationOut]
