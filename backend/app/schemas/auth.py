from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4, ConfigDict
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    full_name: str
    name_prefix: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    organization_or_institution: Optional[str] = None
    code_or_reg_number: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None
    state_medical_council: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    role: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None

    # Two-step verification OTP challenge fields
    otp_required: bool = False
    challenge_token: Optional[str] = None
    masked_email: Optional[str] = None
    expires_in_seconds: Optional[int] = None
    message: Optional[str] = None


class VerifyLoginOtpIn(BaseModel):
    challenge_token: str
    otp: str


class ResendLoginOtpIn(BaseModel):
    challenge_token: str


class GoogleLoginIn(BaseModel):
    id_token: str
    role: Optional[UserRole] = UserRole.STUDENT

class UserOut(BaseModel):
    id: UUID4
    email: EmailStr
    role: UserRole
    is_active: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

# ---------------------------------------------------------------------------
# FORGOT & RESET PASSWORD SCHEMAS
# ---------------------------------------------------------------------------

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    otp_sent: bool
    dev_mode: bool = False
    debug_otp: Optional[str] = None
    debug_reset_link: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class VerifyOtpResponse(BaseModel):
    valid: bool
    token: Optional[str] = None
    message: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    message: str
    success: bool

class AcceptInvitationIn(BaseModel):
    invitation_token: str
    password: str
    full_name: str
    name_prefix: Optional[str] = "Prof."
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    qualifications: Optional[str] = None
    specialization: Optional[str] = None

class InvitationDetailsOut(BaseModel):
    valid: bool
    email: str
    role: str
    institution_id: str
    institution_name: str
    department_name: Optional[str] = None
    designation: Optional[str] = None
    academic_year: Optional[str] = None
    assigned_subjects: list = []
    expires_at: Optional[str] = None
    status: str

