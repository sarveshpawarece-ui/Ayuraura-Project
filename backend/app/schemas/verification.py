import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from app.models.domain import VerificationStatus, VerificationSubjectType, VerificationType

class EvidenceIn(BaseModel):
    evidence_type: str = Field("FILE", max_length=50)
    file_url: Optional[str] = None
    credential_id: Optional[str] = Field(None, max_length=150)
    issuer_name: Optional[str] = Field(None, max_length=255)
    verification_url: Optional[str] = None
    description: Optional[str] = Field(None, max_length=1000)

class EvidenceOut(BaseModel):
    id: uuid.UUID
    verification_request_id: uuid.UUID
    evidence_type: str
    file_url: Optional[str] = None
    credential_id: Optional[str] = None
    issuer_name: Optional[str] = None
    verification_url: Optional[str] = None
    description: Optional[str] = None
    evidence_hash: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class VerificationAuditOut(BaseModel):
    id: uuid.UUID
    actor_id: uuid.UUID
    actor_email: Optional[str] = None
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class VerificationRequestCreate(BaseModel):
    subject_type: VerificationSubjectType
    subject_id: uuid.UUID
    verification_type: VerificationType
    evidence_summary: Optional[str] = Field(None, max_length=1000)
    evidence: Optional[EvidenceIn] = None
    is_public_badge: bool = True

class VerificationResubmitIn(BaseModel):
    evidence_summary: Optional[str] = Field(None, max_length=1000)
    evidence: EvidenceIn

class AdminApproveIn(BaseModel):
    expires_at: Optional[datetime] = None
    review_notes: Optional[str] = Field(None, max_length=1000)
    verification_method: Optional[str] = "MANUAL_REVIEW"

class AdminRejectIn(BaseModel):
    rejection_reason: str = Field(..., min_length=5, max_length=1000)
    review_notes: Optional[str] = Field(None, max_length=1000)

class AdminRevokeIn(BaseModel):
    revocation_reason: str = Field(..., min_length=5, max_length=1000)
    review_notes: Optional[str] = Field(None, max_length=1000)

class VerificationRequestOut(BaseModel):
    id: uuid.UUID
    public_token: str
    subject_type: str
    subject_id: uuid.UUID
    verification_type: str
    status: str
    submitted_by: uuid.UUID
    submitter_name: Optional[str] = None
    reviewed_by: Optional[uuid.UUID] = None
    reviewer_name: Optional[str] = None
    verification_method: str
    evidence_summary: Optional[str] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    revocation_reason: Optional[str] = None
    is_public_badge: bool
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    evidences: List[EvidenceOut] = []
    audits: List[VerificationAuditOut] = []

    model_config = ConfigDict(from_attributes=True)

class PublicVerificationOut(BaseModel):
    public_token: str
    subject_type: str
    verification_type: str
    status: str
    verification_method: str
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_valid: bool
    badge_label: str

class VerificationAnalyticsOut(BaseModel):
    total_requests: int
    pending_count: int
    approved_count: int
    rejected_count: int
    revoked_count: int
    expired_count: int
    approval_rate_pct: float
