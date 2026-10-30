import uuid
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, model_validator

# ============================================================
# PHASE 1 — COMMUNITY & DISCUSSION SCHEMAS
# ============================================================

class DiscussionCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: str
    topics_count: int = 0
    posts_count: int = 0

    class Config:
        from_attributes = True


class DiscussionPostCreateIn(BaseModel):
    category_id: Optional[Union[uuid.UUID, str]] = None
    category_slug: Optional[str] = None
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    topic: Optional[str] = None
    academic_year: Optional[str] = "1st Year"
    post_type: str = Field("DISCUSSION", description="QUESTION, DISCUSSION, STUDY_TIP, EXAM_PREP, RESOURCE_SHARE")
    resource_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class DiscussionCommentCreateIn(BaseModel):
    content: str = Field(..., min_length=2)
    parent_comment_id: Optional[uuid.UUID] = None


class DiscussionCommentOut(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    author_role: str
    content: str
    upvotes_count: int = 0
    is_accepted_answer: bool = False
    is_faculty_answer: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class DiscussionPostOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    category_name: Optional[str] = None
    author_id: uuid.UUID
    author_name: str
    author_role: str
    title: str
    content: str
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    topic: Optional[str] = None
    academic_year: Optional[str] = None
    post_type: str
    resource_url: Optional[str] = None
    tags: List[str] = []
    views_count: int = 0
    upvotes_count: int = 0
    comments_count: int = 0
    bookmarks_count: int = 0
    is_pinned: bool = False
    is_solved: bool = False
    is_bookmarked_by_user: bool = False
    is_upvoted_by_user: bool = False
    ai_summary: Optional[str] = None
    ai_followups: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiscussionPostDetailOut(DiscussionPostOut):
    is_bookmarked: Optional[bool] = None
    comments: List[DiscussionCommentOut] = []

    @model_validator(mode="after")
    def populate_bookmark(self):
        if self.is_bookmarked is None:
            self.is_bookmarked = self.is_bookmarked_by_user
        return self


class DiscussionBookmarkToggleOut(BaseModel):
    post_id: str
    is_bookmarked: bool
    bookmarked: Optional[bool] = None
    bookmarks_count: int

    @model_validator(mode="after")
    def sync_bookmarked(self):
        if self.bookmarked is None:
            self.bookmarked = self.is_bookmarked
        return self


# ============================================================
# PHASE 2 — FACULTY Q&A SCHEMAS
# ============================================================

class FacultyQuestionCreateIn(BaseModel):
    subject_id: Optional[str] = None
    subject_name: Optional[str] = "Ayurvedic Medicine"
    topic: Optional[str] = None
    academic_year: Optional[str] = "1st Year"
    title: str = Field(..., min_length=5, max_length=255)
    question_text: str = Field(..., min_length=10)
    faculty_id: Optional[uuid.UUID] = None
    is_anonymous_to_peers: bool = False

    @model_validator(mode="after")
    def ensure_subject_id(self):
        if not self.subject_id and self.subject_name:
            self.subject_id = self.subject_name.lower().replace(" ", "-")
        return self


class FacultyAnswerSubmitIn(BaseModel):
    answer: Optional[str] = None
    faculty_answer: Optional[str] = None
    reference_text: Optional[str] = None

    @model_validator(mode="after")
    def sync_answer(self):
        if not self.answer and self.faculty_answer:
            self.answer = self.faculty_answer
        return self


class FacultyQuestionOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    student_display_name: str
    author_name: Optional[str] = None
    is_anonymous: Optional[bool] = False
    subject_id: Optional[str] = None
    subject_name: str
    topic: Optional[str] = None
    academic_year: Optional[str] = None
    title: str
    question_text: str
    is_anonymous_to_peers: bool
    status: str
    faculty_id: Optional[uuid.UUID] = None
    faculty_name: Optional[str] = None
    faculty_answer: Optional[str] = None
    reference_text: Optional[str] = None
    answered_at: Optional[datetime] = None
    ai_simplified_explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="after")
    def sync_author_and_anonymity(self):
        if not self.author_name:
            self.author_name = self.student_display_name
        if self.is_anonymous_to_peers:
            self.is_anonymous = True
        return self

    class Config:
        from_attributes = True


# ============================================================
# PHASE 4 — STUDENT STUDY GROUPS & COLLABORATION SCHEMAS
# ============================================================

class StudyGroupCreateIn(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: str = Field(..., min_length=5)
    subject_id: Optional[str] = None
    subject_name: Optional[str] = "Ayurvedic Medicine"
    academic_year: str = "1st Year"
    topic_focus: Optional[str] = None
    max_members: int = Field(15, ge=2, le=50)
    is_private: bool = False
    passcode: Optional[str] = None

    @model_validator(mode="after")
    def sync_name_and_subject(self):
        if not self.name and self.title:
            self.name = self.title
        elif not self.title and self.name:
            self.title = self.name
        if not self.subject_id and self.subject_name:
            self.subject_id = self.subject_name.lower().replace(" ", "-")
        return self


class StudyGroupJoinIn(BaseModel):
    passcode: Optional[str] = None


class StudyGroupResourceAddIn(BaseModel):
    title: str
    url: str
    resource_type: Optional[str] = "NOTES"
    file_type: Optional[str] = None

    @model_validator(mode="after")
    def sync_type(self):
        if not self.resource_type and self.file_type:
            self.resource_type = self.file_type
        return self


class StudyGroupDiscussionCreateIn(BaseModel):
    title: Optional[str] = "Discussion"
    content: str = Field(..., min_length=2)


class StudyGroupMemberOut(BaseModel):
    user_id: uuid.UUID
    user_name: str
    user_role: str
    role_in_group: str
    joined_at: datetime


class StudyGroupDiscussionOut(BaseModel):
    id: uuid.UUID
    group_id: uuid.UUID
    author_id: uuid.UUID
    author_name: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class StudyGroupOut(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    creator_name: str
    name: str
    title: Optional[str] = None
    description: str
    subject_id: Optional[str] = None
    subject_name: str
    academic_year: str
    topic_focus: Optional[str] = None
    max_members: int
    current_members_count: int
    member_count: Optional[int] = None
    is_private: bool
    resources: List[Dict[str, Any]] = []
    is_user_member: bool = False
    created_at: datetime

    @model_validator(mode="after")
    def sync_aliases(self):
        if not self.title:
            self.title = self.name
        if self.member_count is None:
            self.member_count = self.current_members_count
        return self

    class Config:
        from_attributes = True


# ============================================================
# PHASE 5 — EDUCATIONAL FEEDBACK & RATINGS SCHEMAS
# ============================================================

class EducationalFeedbackSubmitIn(BaseModel):
    target_type: str = Field(..., description="SESSION, RESOURCE, STUDY_MATERIAL, ACTIVITY")
    target_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    is_public: bool = True


class EducationalFeedbackOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    user_role: str
    target_type: str
    target_id: str
    rating: int
    review_text: Optional[str] = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EducationalRatingAggregateOut(BaseModel):
    target_type: str
    target_id: str
    average_rating: float
    total_ratings: int
    rating_breakdown: Dict[int, int]
    public_reviews: List[EducationalFeedbackOut] = []


# ============================================================
# PHASE 6 — COMMUNITY MODERATION AND SAFETY SCHEMAS
# ============================================================

class CommunityReportCreateIn(BaseModel):
    target_type: str = Field("POST", description="POST, COMMENT, QUESTION, RESOURCE, USER, DISCUSSION")
    target_id: str
    reason: str = Field("INAPPROPRIATE", description="SPAM, MEDICAL_MISINFORMATION, HARASSMENT, OFF_TOPIC, INAPPROPRIATE")
    details: Optional[str] = None


class CommunityReportOut(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    target_type: str
    target_id: str
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ModerationActionIn(BaseModel):
    target_type: str = Field(..., description="POST, COMMENT, QUESTION, USER, DISCUSSION")
    target_id: str
    action_taken: str = Field(..., description="WARN_USER, HIDE_CONTENT, DELETE_CONTENT, DISMISS_REPORT")
    reason: str
    notes: Optional[str] = None


class UserRestrictionIn(BaseModel):
    target_user_id: uuid.UUID
    restriction_type: str = Field("MUTED", description="MUTED, SUSPENDED_FROM_POSTING")
    duration_days: int = Field(7, ge=1, le=365)
    reason: str


class ModerationAuditOut(BaseModel):
    id: uuid.UUID
    moderator_id: uuid.UUID
    moderator_name: str
    target_type: str
    target_id: str
    action_taken: str
    reason: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# PHASE 7 — AI COMMUNITY INTEGRATION SCHEMAS
# ============================================================

class AICommunitySummarizeIn(BaseModel):
    post_id: Optional[Union[uuid.UUID, str]] = None
    title: Optional[str] = None
    content: Optional[str] = None


class AICommunityFollowupsIn(BaseModel):
    post_id: uuid.UUID


class AICommunitySimplifyIn(BaseModel):
    question_id: Optional[uuid.UUID] = None
    concept_title: Optional[str] = None
    raw_explanation: Optional[str] = None
    sanskrit_or_clinical_concept: Optional[str] = None
    target_audience: Optional[str] = None

    @model_validator(mode="after")
    def sync_concepts(self):
        if not self.concept_title and self.sanskrit_or_clinical_concept:
            self.concept_title = self.sanskrit_or_clinical_concept
        return self


class AICommunityAskTopicIn(BaseModel):
    subject: Optional[str] = "Ayurvedic Medicine"
    topic: str
    query: Optional[str] = None
    context: Optional[str] = None

    @model_validator(mode="after")
    def sync_query(self):
        if not self.query and self.context:
            self.query = self.context
        elif not self.query:
            self.query = f"Explain the core educational concepts and clinical correlation of {self.topic}"
        return self


class AICommunityResponseOut(BaseModel):
    is_ai_generated: bool = True
    mode: str
    title: str
    content: str
    simplified_text: Optional[str] = None
    key_points: Optional[List[str]] = None
    follow_up_questions: Optional[List[str]] = None
    citations: List[str] = []
    advisory: str
    disclaimer: Optional[str] = None
    response_type: Optional[str] = None
    suggested_resources: List[Dict[str, str]] = []

    @model_validator(mode="after")
    def sync_ai_fields(self):
        if not self.simplified_text:
            self.simplified_text = self.content
        if not self.disclaimer:
            self.disclaimer = self.advisory
        if not self.response_type:
            self.response_type = self.mode
        return self


# ============================================================
# PHASE 8 — NOTIFICATION SCHEMAS
# ============================================================

class NotificationOut(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    notification_type: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferencesIn(BaseModel):
    notify_faculty_replies: bool = True
    notify_session_announcements: bool = True
    notify_session_reminders: bool = True
    notify_study_group_activity: bool = True
    notify_discussion_replies: bool = True
    notify_recordings_available: bool = True


class NotificationPreferencesOut(NotificationPreferencesIn):
    id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    updated_at: datetime

    class Config:
        from_attributes = True
