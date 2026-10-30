from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import uuid

# ============================================================
# PHASE 3, 23, 24 — INTERNSHIP SCHEMAS & VALIDATORS
# ============================================================

INTERNSHIP_TYPES = [
  "Clinical Internship",
  "Research Internship",
  "Hospital Internship",
  "Ayurveda Practice",
  "Panchakarma",
  "Pharmacy",
  "Wellness",
  "Teaching",
  "Healthcare Camp",
  "Other"
]

INTERNSHIP_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "OPEN",
  "CLOSED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED"
]

class InternshipPostingCreateIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    specialization: str = "General Ayurveda"
    internship_type: str = "Clinical Internship"
    clinic_id: Optional[uuid.UUID] = None
    organization_name: Optional[str] = None
    organization_type: str = "CLINIC"
    department: Optional[str] = None

    location_city: str = Field(..., min_length=2)
    location_state: str = Field(..., min_length=2)
    location_address: Optional[str] = None
    mode: str = "ON_SITE"  # ON_SITE, HYBRID, REMOTE

    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_months: int = Field(default=6, ge=1, le=36)
    duration_text: Optional[str] = None
    number_of_seats: int = Field(default=5, ge=1, le=500)
    capacity: Optional[int] = None
    application_deadline: Optional[date] = None
    deadline: Optional[date] = None

    # Eligibility
    eligible_courses: List[str] = Field(default_factory=lambda: ["BAMS", "MD Ayurveda"])
    eligible_years: List[str] = Field(default_factory=lambda: ["Final Year", "Intern"])
    minimum_qualification: Optional[str] = "BAMS Student / Graduate"
    experience_required: Optional[str] = "None"
    skills_required: List[str] = Field(default_factory=list)
    requirements: Optional[str] = None

    # Content
    responsibilities: Optional[str] = None
    learning_outcomes: Optional[str] = None
    benefits: List[str] = Field(default_factory=lambda: ["Certificate of Clinical Training", "Direct Case Mentorship"])
    working_hours: Optional[str] = "09:00 AM - 05:00 PM (Mon-Sat)"
    stipend_inr_month: float = Field(default=0.0, ge=0.0)

    # Status
    status: str = "PUBLISHED"  # DRAFT or PUBLISHED

    @model_validator(mode="after")
    def validate_dates_and_fields(self):
        # Synchronize deadline
        actual_deadline = self.application_deadline or self.deadline
        if not actual_deadline and self.start_date:
            actual_deadline = self.start_date

        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("End date must be greater than or equal to start date.")

        if actual_deadline and self.start_date:
            if actual_deadline > self.start_date:
                raise ValueError("Application deadline cannot be after the internship start date.")

        if self.capacity is None:
            self.capacity = self.number_of_seats
        if self.number_of_seats <= 0:
            raise ValueError("Number of seats must be at least 1.")

        if not self.department:
            self.department = self.specialization

        if not self.requirements:
            self.requirements = f"Open to {', '.join(self.eligible_courses)} students."

        if not self.deadline:
            self.deadline = actual_deadline or date.today()

        return self


class InternshipPostingUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    specialization: Optional[str] = None
    internship_type: Optional[str] = None
    clinic_id: Optional[uuid.UUID] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    department: Optional[str] = None

    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_address: Optional[str] = None
    mode: Optional[str] = None

    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_months: Optional[int] = None
    duration_text: Optional[str] = None
    number_of_seats: Optional[int] = None
    capacity: Optional[int] = None
    application_deadline: Optional[date] = None
    deadline: Optional[date] = None

    eligible_courses: Optional[List[str]] = None
    eligible_years: Optional[List[str]] = None
    minimum_qualification: Optional[str] = None
    experience_required: Optional[str] = None
    skills_required: Optional[List[str]] = None
    requirements: Optional[str] = None

    responsibilities: Optional[str] = None
    learning_outcomes: Optional[str] = None
    benefits: Optional[List[str]] = None
    working_hours: Optional[str] = None
    stipend_inr_month: Optional[float] = None
    status: Optional[str] = None


class InternshipStatusUpdateIn(BaseModel):
    status: str = Field(..., description="DRAFT, PUBLISHED, OPEN, CLOSED, CANCELLED, COMPLETED")
    reason: Optional[str] = None


class InternshipPostingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employer_user_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    clinic_id: Optional[uuid.UUID] = None

    doctor_name: Optional[str] = None
    doctor_qualification: Optional[str] = None
    doctor_verification_status: Optional[str] = None
    clinic_name: Optional[str] = None

    organization_name: str
    organization_type: str
    title: str
    description: str
    department: str
    specialization: str
    internship_type: str

    duration_months: int
    duration_text: Optional[str] = None
    mode: str
    location_city: str
    location_state: str
    location_address: Optional[str] = None

    stipend_inr_month: float
    capacity: int
    number_of_seats: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    deadline: date
    application_deadline: Optional[date] = None

    eligible_courses: List[str]
    eligible_years: List[str]
    minimum_qualification: Optional[str] = None
    experience_required: Optional[str] = None
    requirements: str
    skills_required: List[str]

    responsibilities: Optional[str] = None
    learning_outcomes: Optional[str] = None
    benefits: List[str]
    working_hours: Optional[str] = None
    status: str

    applications_count: int = 0
    has_applied: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None


class DoctorInternshipSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    specialization: str
    internship_type: str
    clinic_name: Optional[str] = None
    location_city: str
    location_state: str
    mode: str
    duration_text: Optional[str] = None
    duration_months: int
    number_of_seats: int
    deadline: date
    status: str
    applications_count: int
    created_at: datetime


# ============================================================
# APPLICATION & CERTIFICATE LIFECYCLE SCHEMAS
# ============================================================

class InternshipApplyIn(BaseModel):
    cover_letter: Optional[str] = None
    cover_note: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    additional_message: Optional[str] = None


class StudentEducationSummary(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    score: Optional[str] = None


class StudentPreviewOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_photo_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    qualification: Optional[str] = None
    college_name: Optional[str] = None
    current_year_of_study: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    profile_strength: int = 75
    verification_status: str = "PENDING"
    portfolio_slug: Optional[str] = None
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    assessment_score: Optional[float] = None


class InternshipApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    internship_id: uuid.UUID
    student_id: uuid.UUID
    status: str
    rejection_reason: Optional[str] = None
    match_score: float = 0.0

    cover_note: Optional[str] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    additional_message: Optional[str] = None

    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    shortlisted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    # Internship metadata
    internship_title: Optional[str] = None
    internship_type: Optional[str] = None
    specialization: Optional[str] = None
    organization_name: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    mode: Optional[str] = None
    stipend_inr_month: Optional[float] = None
    deadline: Optional[date] = None

    # Student metadata
    student: Optional[StudentPreviewOut] = None


class InternshipReviewIn(BaseModel):
    decision: str  # SHORTLISTED, SELECTED, REJECTED, UNDER_REVIEW
    rejection_reason: Optional[str] = None


class InternshipRejectIn(BaseModel):
    rejection_reason: Optional[str] = "Application profile did not match current clinical requirements."

# ============================================================
# PHASE 5 — OFFERS, ATTENDANCE, MILESTONES & TASKS
# ============================================================

class OfferLetterCreateIn(BaseModel):
    role_title: Optional[str] = "Clinical Ayurveda Intern"
    start_date: date
    end_date: date
    working_hours: Optional[str] = "09:00 AM - 05:00 PM (Mon-Sat)"
    stipend_amount: float = Field(default=0.0, ge=0.0)
    terms_text: str = Field(..., min_length=10)


class OfferDeclineIn(BaseModel):
    decline_reason: Optional[str] = "Accepted another clinical placement or scheduling conflict."


class OfferLetterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    internship_id: Optional[uuid.UUID] = None
    student_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    clinic_id: Optional[uuid.UUID] = None

    student_name: str
    organization_name: str
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    role_title: str
    working_hours: Optional[str] = None

    start_date: date
    end_date: date
    stipend_amount: float
    terms_text: str
    status: str

    issued_at: datetime
    accepted_at: Optional[datetime] = None
    declined_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    decline_reason: Optional[str] = None


class LogAttendanceIn(BaseModel):
    date: date
    check_in: Optional[str] = "09:00 AM"
    check_out: Optional[str] = "05:00 PM"
    status: str = "PRESENT"  # PRESENT, ABSENT, HALF_DAY, LEAVE
    hours_worked: float = Field(default=8.0, ge=0.0, le=24.0)
    remarks: Optional[str] = None


class AttendanceLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    internship_id: Optional[uuid.UUID] = None
    student_id: Optional[uuid.UUID] = None
    date: date
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str
    is_present: bool
    hours_worked: float
    remarks: Optional[str] = None
    recorded_at: datetime


class AttendanceSummaryOut(BaseModel):
    total_days: int = 0
    present_days: int = 0
    absent_days: int = 0
    half_days: int = 0
    leave_days: int = 0
    attendance_percentage: float = 0.0
    total_hours_worked: float = 0.0
    records: List[AttendanceLogOut] = Field(default_factory=list)


class InternshipTaskIn(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    task_type: str = "CLINICAL_ACTIVITY"  # CLINICAL_ACTIVITY, RESEARCH_ACTIVITY, LEARNING_OBJECTIVE, PATIENT_CASE
    status: str = "NOT_STARTED"  # NOT_STARTED, IN_PROGRESS, COMPLETED
    doctor_remarks: Optional[str] = None


class InternshipTaskUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[str] = None
    doctor_remarks: Optional[str] = None


class InternshipTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    milestone_id: uuid.UUID
    application_id: uuid.UUID
    title: str
    description: Optional[str] = None
    task_type: str
    status: str
    doctor_remarks: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class ProgressMilestoneIn(BaseModel):
    milestone_title: str = Field(..., min_length=2)
    description: Optional[str] = None
    category: str = "CLINICAL"  # CLINICAL, RESEARCH, LEARNING, GENERAL
    status: str = "IN_PROGRESS"  # NOT_STARTED, IN_PROGRESS, COMPLETED
    due_date: Optional[date] = None
    tasks: Optional[List[InternshipTaskIn]] = None


class ProgressMilestoneUpdateIn(BaseModel):
    milestone_title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    completion_percentage: Optional[int] = None
    due_date: Optional[date] = None
    supervisor_review: Optional[str] = None


class ProgressMilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    internship_id: Optional[uuid.UUID] = None
    student_id: Optional[uuid.UUID] = None
    milestone_title: str
    description: Optional[str] = None
    category: str
    status: str
    is_completed: bool
    completion_percentage: int
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    supervisor_review: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    tasks: List[InternshipTaskOut] = Field(default_factory=list)


class InternshipFullProgressOut(BaseModel):
    application_id: uuid.UUID
    internship_title: str
    student_name: str
    doctor_name: Optional[str] = None
    overall_progress_percentage: float = 0.0
    total_milestones: int = 0
    completed_milestones: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    attendance_percentage: float = 0.0
    total_hours_completed: float = 0.0
    milestones: List[ProgressMilestoneOut] = Field(default_factory=list)
    recent_remarks: Optional[str] = None


class InternshipCertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    certificate_token: str
    certificate_hash: str
    student_id: Optional[uuid.UUID] = None
    student_name: str
    doctor_id: Optional[uuid.UUID] = None
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    organization_name: str
    internship_title: str
    specialization: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_text: Optional[str] = None
    completion_date: date
    total_hours_completed: float
    status: str = "VALID"
    is_valid: bool = True
    added_to_portfolio: bool = False
    verification_url: Optional[str] = None
    qr_data: Optional[str] = None
    digital_signature_hash: Optional[str] = None
    issued_at: datetime


class CertificatePublicVerifyOut(BaseModel):
    certificate_id: str
    certificate_token: str
    student_name_masked: str
    internship_title: str
    doctor_name: Optional[str] = None
    organization_name: str
    clinic_name: Optional[str] = None
    duration_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    completion_date: date
    total_hours: float
    issue_date: date
    status: str  # VALID, REVOKED, EXPIRED
    is_valid: bool
    digital_signature_hash: Optional[str] = None
    accreditation: str = "National Commission for Indian System of Medicine (NCISM) & Ministry of Ayush Guidelines"


class SupervisorFeedbackIn(BaseModel):
    # 8 Categories (1-5)
    clinical_skills_rating: int = Field(5, ge=1, le=5)
    communication_rating: int = Field(5, ge=1, le=5)
    professionalism_rating: int = Field(5, ge=1, le=5)
    punctuality_rating: int = Field(5, ge=1, le=5)
    technical_knowledge_rating: int = Field(5, ge=1, le=5)
    teamwork_rating: int = Field(5, ge=1, le=5)
    learning_ability_rating: int = Field(5, ge=1, le=5)
    overall_rating: int = Field(5, ge=1, le=5)

    # Written Evaluation
    written_feedback: Optional[str] = None
    strengths_notes: Optional[str] = None
    areas_for_growth: Optional[str] = None
    recommendations: Optional[str] = None


class SupervisorFeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    student_id: Optional[uuid.UUID] = None
    clinical_skills_rating: int
    communication_rating: int
    professionalism_rating: int
    punctuality_rating: int
    technical_knowledge_rating: int
    teamwork_rating: int
    learning_ability_rating: int
    overall_rating: int
    written_feedback: Optional[str] = None
    strengths_notes: Optional[str] = None
    areas_for_growth: Optional[str] = None
    recommendations: Optional[str] = None
    created_at: datetime


class StudentFeedbackIn(BaseModel):
    overall_rating: int = Field(5, ge=1, le=5)
    learning_experience_rating: int = Field(5, ge=1, le=5)
    doctor_mentorship_rating: int = Field(5, ge=1, le=5)
    clinical_exposure_rating: int = Field(5, ge=1, le=5)
    organization_rating: int = Field(5, ge=1, le=5)
    facilities_rating: int = Field(5, ge=1, le=5)
    overall_experience_comments: Optional[str] = None
    review_comments: Optional[str] = None
    is_anonymous: bool = False
    is_public: bool = True


class StudentFeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    application_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    student_id: Optional[uuid.UUID] = None
    overall_rating: int
    learning_experience_rating: int
    doctor_mentorship_rating: int
    clinical_exposure_rating: int
    organization_rating: int
    facilities_rating: int
    overall_experience_comments: Optional[str] = None
    review_comments: Optional[str] = None
    is_anonymous: bool
    is_public: bool
    created_at: datetime


class CompleteInternshipIn(BaseModel):
    completion_date: Optional[date] = None
    doctor_feedback: Optional[SupervisorFeedbackIn] = None
    generate_certificate: bool = True
    add_to_student_portfolio: bool = True


class DoctorInternshipAnalyticsOut(BaseModel):
    total_internships: int = 0
    active_internships: int = 0
    completed_internships: int = 0
    cancelled_internships: int = 0
    total_applications: int = 0
    shortlisted_count: int = 0
    accepted_count: int = 0
    completed_students_count: int = 0
    average_attendance_percentage: float = 0.0
    average_student_rating: float = 0.0


class InternshipHistoryItemOut(BaseModel):
    application_id: uuid.UUID
    internship_id: uuid.UUID
    internship_title: str
    specialization: Optional[str] = None
    organization_name: str
    clinic_name: Optional[str] = None
    doctor_name: Optional[str] = None
    student_name: Optional[str] = None
    role_title: Optional[str] = None
    status: str  # ACTIVE, COMPLETED, CANCELLED, OFFERED, APPLIED
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    completion_date: Optional[date] = None
    certificate_token: Optional[str] = None
    attendance_percentage: float = 0.0
    overall_progress_percentage: float = 0.0
    doctor_rating: Optional[int] = None
    student_rating: Optional[int] = None
