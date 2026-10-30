import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class FacultyProfileOut(BaseModel):
    id: str
    user_id: str
    institution_id: str
    institution_name: Optional[str] = None
    full_name: str
    name_prefix: Optional[str] = "Prof."
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    qualifications: Optional[str] = None
    specialization: Optional[str] = None
    assigned_subjects: List[Any] = []
    assigned_academic_years: List[str] = []
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FacultyProfileUpdateIn(BaseModel):
    full_name: Optional[str] = None
    name_prefix: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    qualifications: Optional[str] = None
    specialization: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    bio: Optional[str] = None

class FacultySubjectAssignIn(BaseModel):
    assigned_subjects: List[Dict[str, Any]]
    assigned_academic_years: Optional[List[str]] = None

class EducationalResourceCreateIn(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    resource_type: str = Field(default="NOTES", description="NOTES, DOCUMENT, STUDY_MATERIAL, REVISION_RESOURCE, PRACTICE_QUESTIONS, LECTURE_RECORDING, ASSIGNMENT")
    academic_year: str = Field(..., description="1st Year, 2nd Year, 3rd Year, 4th Year")
    subject_id: str
    subject_name: str
    unit_number: Optional[int] = None
    unit_name: Optional[str] = None
    topic_id: Optional[str] = None
    topic_name: Optional[str] = None
    class_or_batch: Optional[str] = "All"
    file_url: Optional[str] = None
    content_text: Optional[str] = None
    is_published: bool = True
    workflow_status: Optional[str] = None
    is_ai_generated: bool = False
    ai_disclaimer: Optional[str] = None

class EducationalResourceUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    academic_year: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    unit_number: Optional[int] = None
    unit_name: Optional[str] = None
    topic_name: Optional[str] = None
    class_or_batch: Optional[str] = None
    file_url: Optional[str] = None
    content_text: Optional[str] = None
    is_published: Optional[bool] = None
    workflow_status: Optional[str] = None
    reviewer_feedback: Optional[str] = None

class ResourceWorkflowUpdateIn(BaseModel):
    workflow_status: str = Field(..., description="DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, PUBLISHED, REJECTED, ARCHIVED")
    reviewer_feedback: Optional[str] = None

class EducationalResourceOut(BaseModel):
    id: str
    institution_id: str
    institution_name: Optional[str] = None
    faculty_id: str
    faculty_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    resource_type: str
    academic_year: str
    subject_id: str
    subject_name: str
    unit_number: Optional[int] = None
    unit_name: Optional[str] = None
    topic_id: Optional[str] = None
    topic_name: Optional[str] = None
    class_or_batch: Optional[str] = "All"
    file_url: Optional[str] = None
    content_text: Optional[str] = None
    is_published: bool
    workflow_status: Optional[str] = "PUBLISHED"
    reviewer_feedback: Optional[str] = None
    is_ai_generated: bool
    ai_disclaimer: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LectureScheduleCreateIn(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    subject_id: str
    subject_name: str
    academic_year: str
    topic: Optional[str] = None
    session_type: str = "LECTURE"
    scheduled_date: date
    start_time: str
    end_time: str
    venue_or_link: Optional[str] = None
    session_link: Optional[str] = None
    recording_url: Optional[str] = None
    announcement: Optional[str] = None

class LectureScheduleUpdateIn(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    session_type: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue_or_link: Optional[str] = None
    session_link: Optional[str] = None
    recording_url: Optional[str] = None
    announcement: Optional[str] = None
    status: Optional[str] = None

class LectureScheduleOut(BaseModel):
    id: str
    institution_id: str
    institution_name: Optional[str] = None
    faculty_id: str
    faculty_name: Optional[str] = None
    title: str
    subject_id: str
    subject_name: str
    academic_year: str
    topic: Optional[str] = None
    session_type: str
    scheduled_date: str
    start_time: str
    end_time: str
    venue_or_link: Optional[str] = None
    session_link: Optional[str] = None
    recording_url: Optional[str] = None
    announcement: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FacultyDashboardOut(BaseModel):
    faculty_profile: FacultyProfileOut
    institution: Dict[str, Any]
    metrics: Dict[str, Any]
    assigned_subjects: List[Dict[str, Any]]
    upcoming_lectures: List[LectureScheduleOut]
    recent_resources: List[EducationalResourceOut]
    announcements: List[Dict[str, Any]]
