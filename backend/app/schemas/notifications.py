import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4

# ============================================================
# 1. NOTIFICATION ITEM SCHEMAS
# ============================================================

class NotificationItemOut(BaseModel):
    id: UUID4
    recipient_id: UUID4
    title: str
    message: str
    notification_type: str # ACADEMIC, STUDY_REMINDER, EXAM_ALERT, TIMETABLE, FACULTY_ANNOUNCEMENT, RESOURCE, CAREER, COMMUNITY, SYSTEM_ALERT
    category: str # Derived or categorized for UI tabs
    action_url: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    total_count: int
    unread_count: int
    notifications: List[NotificationItemOut]

# ============================================================
# 2. NOTIFICATION PREFERENCES SCHEMAS
# ============================================================

class NotificationPreferencesIn(BaseModel):
    faculty_replies: Optional[bool] = None
    session_announcements: Optional[bool] = None
    session_reminders: Optional[bool] = None
    study_group_activity: Optional[bool] = None
    discussion_replies: Optional[bool] = None
    available_recordings: Optional[bool] = None

    # Academic & Student Learning Categories
    academic_announcements: Optional[bool] = None
    study_reminders: Optional[bool] = None
    exam_alerts: Optional[bool] = None
    timetable_updates: Optional[bool] = None
    career_updates: Optional[bool] = None
    learning_resource_alerts: Optional[bool] = None

    # Channels & Cadence
    email_channel_enabled: Optional[bool] = None
    push_channel_enabled: Optional[bool] = None
    reminder_frequency: Optional[str] = None # IMMEDIATE, DAILY_DIGEST

class NotificationPreferencesOut(BaseModel):
    id: UUID4
    user_id: UUID4
    faculty_replies: bool
    session_announcements: bool
    session_reminders: bool
    study_group_activity: bool
    discussion_replies: bool
    available_recordings: bool

    academic_announcements: bool
    study_reminders: bool
    exam_alerts: bool
    timetable_updates: bool
    career_updates: bool
    learning_resource_alerts: bool

    email_channel_enabled: bool
    push_channel_enabled: bool
    reminder_frequency: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 3. PERSONALIZED STUDENT REMINDERS
# ============================================================

class StudentReminderIn(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    reminder_type: str = Field("STUDY_SESSION", max_length=50) # STUDY_SESSION, EXAM_REVISION, PRACTICAL_WORK, GOAL_DEADLINE, TIMETABLE_ALERT
    subject: Optional[str] = Field(None, max_length=100)
    scheduled_time: str = Field(..., max_length=50)
    recurrence: str = Field("ONCE", max_length=50) # ONCE, DAILY, WEEKLY
    action_url: Optional[str] = None

class StudentReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reminder_type: Optional[str] = None
    subject: Optional[str] = None
    scheduled_time: Optional[str] = None
    recurrence: Optional[str] = None
    is_completed: Optional[bool] = None
    is_active: Optional[bool] = None
    action_url: Optional[str] = None

class StudentReminderOut(BaseModel):
    id: UUID4
    user_id: UUID4
    title: str
    description: Optional[str] = None
    reminder_type: str
    subject: Optional[str] = None
    scheduled_time: str
    recurrence: str
    is_completed: bool
    is_active: bool
    action_url: Optional[str] = None
    ai_generated: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 4. FACULTY & ADMIN ANNOUNCEMENTS
# ============================================================

class AcademicAnnouncementCreate(BaseModel):
    title: str = Field(..., max_length=255)
    content: str
    category: str = Field("ACADEMIC", max_length=50) # ACADEMIC, EXAM, TIMETABLE, RESOURCE, FACULTY, CAREER
    target_audience: str = Field("ALL_STUDENTS", max_length=50) # ALL_STUDENTS, 1ST_PROF, 2ND_PROF, 3RD_PROF, 4TH_PROF, INTERNS
    is_urgent: bool = False
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None

class AcademicAnnouncementOut(BaseModel):
    id: UUID4
    author_id: Optional[UUID4] = None
    author_name: str
    author_role: str
    title: str
    content: str
    category: str
    target_audience: str
    is_urgent: bool
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 5. AI-POWERED SMART REMINDERS
# ============================================================

class AISmartReminderGenerateIn(BaseModel):
    include_weak_topics: bool = True
    include_exam_countdown: bool = True
    include_unfinished_activities: bool = True

class AISmartReminderItem(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    title: str
    description: str
    category: str # REVISION, WEAK_TOPIC, EXAM_PREP, TIMETABLE, UNFINISHED_ACTIVITY
    subject: Optional[str] = None
    suggested_time: str
    action_url: str
    priority: str # HIGH, MEDIUM, LOW
    rationale: str

class AISmartReminderGenerateOut(BaseModel):
    total_generated: int
    student_stage: str
    reminders: List[AISmartReminderItem]
    helpful_tips: List[str]

# ============================================================
# 6. BATCH ACTIONS
# ============================================================

class NotificationBatchActionIn(BaseModel):
    notification_ids: List[UUID4]
