from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 1 & 2 — DOCTOR, CLINIC, VERIFICATION, MESSAGING & SESSIONS
# ============================================================

# 1. Doctor Profile Schemas
class DoctorProfileCreateIn(BaseModel):
    name_prefix: Optional[str] = "Dr."
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str = Field(..., min_length=2)
    registration_number: str = Field(..., min_length=3)
    state_medical_council: str = Field(..., min_length=3)
    qualification: str = Field(..., min_length=2)  # BAMS, MD (Ayu), MS (Ayu), Ph.D
    specialization: str = Field(..., min_length=2)  # Panchakarma, Kayachikitsa, Dravyaguna
    years_of_experience: int = 0
    designation: Optional[str] = None
    areas_of_expertise: List[str] = []
    bio: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_photo_url: Optional[str] = None
    city: str
    state: str
    country: str = "India"
    pincode: Optional[str] = None
    clinic_address: Optional[str] = None


class DoctorProfileUpdateIn(BaseModel):
    name_prefix: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    registration_number: Optional[str] = None
    state_medical_council: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None
    designation: Optional[str] = None
    areas_of_expertise: Optional[List[str]] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_photo_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    clinic_address: Optional[str] = None


class DoctorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name_prefix: Optional[str] = "Dr."
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: str
    registration_number: str
    state_medical_council: str
    qualification: str
    specialization: str
    years_of_experience: int
    designation: Optional[str] = None
    areas_of_expertise: List[str] = []
    bio: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_photo_url: Optional[str] = None
    city: str
    state: str
    country: str = "India"
    pincode: Optional[str] = None
    clinic_address: Optional[str] = None
    verification_status: str
    verification_remarks: Optional[str] = None
    verified_at: Optional[datetime] = None
    profile_completion_percentage: Optional[int] = 0
    email: Optional[str] = None
    created_at: datetime


# 2. Doctor Verification & Documents
class DoctorVerificationDocumentIn(BaseModel):
    document_type: str = Field(..., min_length=2)  # MEDICAL_REGISTRATION_CERTIFICATE, DEGREE_CERTIFICATE, IDENTITY_PROOF, CLINIC_HOSPITAL_PROOF, OTHER
    document_name: str = Field(..., min_length=2)
    file_url: str = Field(..., min_length=5)
    file_name: str
    file_size_bytes: int = 0
    mime_type: str = "application/pdf"


class DoctorVerificationDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    doctor_id: uuid.UUID
    document_type: str
    document_name: str
    file_url: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    verification_status: str
    rejection_reason: Optional[str] = None
    uploaded_at: datetime
    verified_at: Optional[datetime] = None


class DoctorVerificationStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    doctor_id: uuid.UUID
    verification_status: str
    verification_remarks: Optional[str] = None
    verified_at: Optional[datetime] = None
    documents: List[DoctorVerificationDocumentOut] = []


class DoctorVerificationSubmitIn(BaseModel):
    notes: Optional[str] = None


# 3. Clinic / Hospital Profiles
class ClinicProfileCreateIn(BaseModel):
    name: str = Field(..., min_length=2)
    organization_type: str = "CLINIC"  # CLINIC, HOSPITAL, WELLNESS_CENTER, AYURVEDIC_PANCHAKARMA_CENTRE
    description: Optional[str] = None
    address: str
    city: str
    state: str
    country: str = "India"
    pincode: str
    phone: str
    email: str
    website_url: Optional[str] = None
    services_offered: List[str] = []
    facilities: List[str] = []
    working_hours: Optional[str] = "Mon-Sat: 09:00 AM - 07:00 PM"
    bed_capacity: int = 0


class ClinicProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    organization_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website_url: Optional[str] = None
    services_offered: Optional[List[str]] = None
    facilities: Optional[List[str]] = None
    working_hours: Optional[str] = None
    bed_capacity: Optional[int] = None


class ClinicProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_doctor_id: uuid.UUID
    name: str
    organization_type: str
    description: Optional[str] = None
    address: str
    city: str
    state: str
    country: str = "India"
    pincode: str
    phone: str
    email: str
    website_url: Optional[str] = None
    services_offered: List[str] = []
    facilities: List[str] = []
    working_hours: Optional[str] = None
    bed_capacity: int = 0
    is_verified: bool = False
    created_at: datetime


# 4. Doctor-Student Messaging
class DoctorMessageIn(BaseModel):
    recipient_id: uuid.UUID
    content: str = Field(..., min_length=1)


class DoctorMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sender_id: uuid.UUID
    recipient_id: uuid.UUID
    content: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime


class ConversationSummaryOut(BaseModel):
    other_user_id: uuid.UUID
    other_user_name: str
    other_user_role: str
    other_user_avatar: Optional[str] = None
    other_user_subtitle: Optional[str] = None
    last_message: str
    last_message_at: datetime
    unread_count: int = 0


# 5. Doctor-Student Sessions
class DoctorSessionCreateIn(BaseModel):
    student_user_id: Optional[uuid.UUID] = None
    doctor_user_id: Optional[uuid.UUID] = None
    title: str = "Clinical Mentorship Session"
    purpose: str = "Clinical Mentorship"
    session_type: str = "Clinical Guidance"  # Mentorship, Internship Discussion, Career Guidance, Clinical Guidance, Feedback, Other
    meeting_mode: str = "Online"  # Online, Offline
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    scheduled_date: date
    start_time: str
    end_time: Optional[str] = None
    duration_minutes: int = 30
    notes: Optional[str] = None


class DoctorSessionRequestIn(BaseModel):
    doctor_user_id: uuid.UUID
    scheduled_date: date
    start_time: str
    duration_minutes: int = 30
    purpose: str
    session_type: Optional[str] = "Clinical Mentorship"
    meeting_mode: Optional[str] = "Online"
    notes: Optional[str] = None


class DoctorSessionStatusUpdateIn(BaseModel):
    status: str  # SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    cancellation_reason: Optional[str] = None
    meeting_link: Optional[str] = None


class DoctorSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    doctor_user_id: uuid.UUID
    student_user_id: uuid.UUID
    doctor_name: Optional[str] = None
    student_name: Optional[str] = None
    title: str
    purpose: str
    session_type: str
    meeting_mode: str
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    scheduled_date: date
    start_time: str
    end_time: Optional[str] = None
    duration_minutes: int
    notes: Optional[str] = None
    status: str
    cancellation_reason: Optional[str] = None
    created_at: datetime


# 6. Dashboard Summary
class RecentApplicationSummary(BaseModel):
    id: uuid.UUID
    student_name: str
    student_college: Optional[str] = None
    internship_title: str
    applied_at: datetime
    status: str


class UpcomingSessionSummary(BaseModel):
    id: uuid.UUID
    student_name: str
    session_title: str
    scheduled_date: date
    start_time: str
    session_type: str
    meeting_mode: str
    status: str


class RecentMessageSummary(BaseModel):
    id: uuid.UUID
    sender_name: str
    content: str
    created_at: datetime
    is_read: bool


class DoctorDashboardSummaryOut(BaseModel):
    doctor_id: uuid.UUID
    doctor_name: str
    qualification: str
    specialization: str
    years_of_experience: int
    profile_completion_percentage: int
    verification_status: str
    
    # Real metrics
    active_internships_count: int = 0
    total_internships_count: int = 0
    applications_count: int = 0
    shortlisted_students_count: int = 0
    active_students_count: int = 0
    upcoming_sessions_count: int = 0
    completed_internships_count: int = 0
    clinics_count: int = 0

    recent_applications: List[RecentApplicationSummary] = []
    upcoming_sessions: List[UpcomingSessionSummary] = []
    recent_messages: List[RecentMessageSummary] = []


# 7. NGO Schemas (Preserved for full compatibility)
class NGOProfileCreateIn(BaseModel):
    name: str = Field(..., min_length=2)
    darpan_id: Optional[str] = None
    registration_number: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    service_areas: List[str]
    contact_person: str
    email: str
    phone: str
    website_url: Optional[str] = None
    city: str
    state: str
    address: str
    pincode: str


class NGOProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    darpan_id: Optional[str] = None
    registration_number: str
    description: str
    service_areas: List[str]
    contact_person: str
    email: str
    phone: str
    website_url: Optional[str] = None
    city: str
    state: str
    address: str
    pincode: str
    verification_status: str
    verified_at: Optional[datetime] = None
    created_at: datetime
