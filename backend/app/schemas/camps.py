from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 26–30 — HEALTHCARE CAMPS & COORDINATION SCHEMAS
# ============================================================

class CampCreateIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    camp_date: date
    start_time: str
    end_time: str
    venue_name: str
    address: str
    city: str
    state: str
    pincode: str
    capacity: int = 200
    services_offered: List[str]
    doctors_attending: List[str] = []
    contact_phone: str
    contact_email: str

class CampUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    services_offered: Optional[List[str]] = None
    status: Optional[str] = None
    cancellation_reason: Optional[str] = None

class CampOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organizer_id: uuid.UUID
    organizer_name: str
    organizer_type: str
    title: str
    description: str
    camp_date: date
    start_time: str
    end_time: str
    venue_name: str
    address: str
    city: str
    state: str
    pincode: str
    capacity: int
    registered_attendees_count: int
    services_offered: List[str]
    doctors_attending: List[str]
    contact_phone: str
    contact_email: str
    status: str
    created_at: datetime

class CampRegisterAttendeeIn(BaseModel):
    attendee_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=5)
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_service: Optional[str] = None

class CampAttendeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    attendee_name: str
    phone: str
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    preferred_service: Optional[str] = None
    registered_at: datetime

class VolunteerApplyIn(BaseModel):
    applicant_name: str
    email: str
    phone: str
    specialization_or_course: Optional[str] = None
    role_applied_for: str
    motivation_note: Optional[str] = None

class VolunteerApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    user_id: uuid.UUID
    user_role: str
    applicant_name: str
    email: str
    phone: str
    specialization_or_course: Optional[str] = None
    role_applied_for: str
    assigned_duty: Optional[str] = None
    status: str
    created_at: datetime

class VolunteerReviewIn(BaseModel):
    decision: str  # SELECTED, REJECTED
    assigned_duty: Optional[str] = None
    rejection_reason: Optional[str] = None

class ScheduleItemIn(BaseModel):
    activity_title: str
    start_time: str
    end_time: str
    lead_person: Optional[str] = None
    notes: Optional[str] = None

class ScheduleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    activity_title: str
    start_time: str
    end_time: str
    lead_person: Optional[str] = None
    notes: Optional[str] = None

class AttendanceLogItemIn(BaseModel):
    user_id: uuid.UUID
    volunteer_name: str
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    verified_hours: float
    attendance_status: str = "PRESENT"
    supervisor_notes: Optional[str] = None

class AttendanceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    user_id: uuid.UUID
    volunteer_name: str
    date: date
    verified_hours: float
    attendance_status: str
    supervisor_notes: Optional[str] = None

class CampCertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    certificate_token: str
    certificate_hash: str
    recipient_name: str
    camp_title: str
    organizer_name: str
    role_performed: str
    hours_served: float
    issued_at: datetime
    is_valid: bool

class FinalCampReportIn(BaseModel):
    total_beneficiaries_served: int
    men_count: int = 0
    women_count: int = 0
    children_count: int = 0
    seniors_count: int = 0
    services_delivered_breakdown: Dict[str, int] = {}
    common_diagnoses: List[str] = []
    total_doctors_participated: int = 0
    total_volunteers_participated: int = 0
    total_volunteer_hours_logged: float = 0.0
    executive_summary: str
    challenges_faced: Optional[str] = None
    followup_recommendations: Optional[str] = None
    evidence_photo_urls: List[str] = []

class FinalCampReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    total_beneficiaries_served: int
    men_count: int
    women_count: int
    children_count: int
    seniors_count: int
    services_delivered_breakdown: Dict[str, int]
    common_diagnoses: List[str]
    total_doctors_participated: int
    total_volunteers_participated: int
    total_volunteer_hours_logged: float
    executive_summary: str
    created_at: datetime

class CoordinationTaskIn(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_role: str = "ALL"
    priority: str = "MEDIUM"

class CoordinationTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    title: str
    description: Optional[str] = None
    assigned_role: str
    priority: str
    is_completed: bool
    created_at: datetime

class BroadcastMessageIn(BaseModel):
    title: str
    content: str
    is_urgent: bool = False

class BroadcastMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    camp_id: uuid.UUID
    sender_name: str
    sender_role: str
    title: str
    content: str
    is_urgent: bool
    created_at: datetime

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    recipient_id: uuid.UUID
    title: str
    message: str
    notification_type: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime
