import uuid
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import (
    VerificationStatus,
    VerificationSubjectType,
    VerificationType,
    VerificationRequest,
    VerificationEvidence,
    VerificationAudit,
    InstitutionProfile,
    IndustryProfile,
    StudentProfile
)
from app.schemas.verification import (
    VerificationRequestCreate,
    VerificationResubmitIn,
    AdminApproveIn,
    AdminRejectIn,
    AdminRevokeIn
)

def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    try:
        return uuid.UUID(str(val))
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid verification request ID format."
        )


class VerificationService:

    @staticmethod
    def _validate_https_url(url_str: Optional[str], field_name: str) -> None:
        if not url_str:
            return
        url_str = url_str.strip()
        if not url_str.startswith("https://"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must use secure HTTPS protocol (e.g. https://...)"
            )
        lower = url_str.lower()
        if any(bad in lower for bad in ["javascript:", "data:", "vbscript:"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsafe protocol in {field_name}"
            )

    @classmethod
    async def submit_request(
        cls, db: AsyncSession, user: User, data: VerificationRequestCreate
    ) -> VerificationRequest:
        sub_id = _to_uuid(data.subject_id)

        # 1. Prevent duplicate active (PENDING) verification requests for the same entity & type
        dup_stmt = select(VerificationRequest).where(
            VerificationRequest.subject_type == data.subject_type,
            VerificationRequest.subject_id == sub_id,
            VerificationRequest.verification_type == data.verification_type,
            VerificationRequest.status == VerificationStatus.PENDING
        )
        existing_active = (await db.execute(dup_stmt)).scalar_one_or_none()
        if existing_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active verification request is already pending review for this item."
            )

        # Validate URL in evidence if provided
        if data.evidence and data.evidence.verification_url:
            cls._validate_https_url(data.evidence.verification_url, "verification_url")

        # 2. Create VerificationRequest
        token = f"vkn-{uuid.uuid4().hex[:16]}"
        v_req = VerificationRequest(
            public_token=token,
            subject_type=data.subject_type,
            subject_id=sub_id,
            verification_type=data.verification_type,
            status=VerificationStatus.PENDING,
            submitted_by=user.id,
            evidence_summary=data.evidence_summary,
            is_public_badge=data.is_public_badge,
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(v_req)
        await db.flush()

        # 3. Create Evidence if provided
        if data.evidence:
            raw_hash_input = f"{user.id}:{sub_id}:{data.evidence.credential_id}:{data.evidence.verification_url}"
            e_hash = hashlib.sha256(raw_hash_input.encode('utf-8')).hexdigest()

            evidence = VerificationEvidence(
                verification_request_id=v_req.id,
                evidence_type=data.evidence.evidence_type,
                file_url=data.evidence.file_url,
                credential_id=data.evidence.credential_id,
                issuer_name=data.evidence.issuer_name,
                verification_url=data.evidence.verification_url,
                description=data.evidence.description,
                evidence_hash=e_hash
            )
            db.add(evidence)

        # 4. Create Audit entry
        audit = VerificationAudit(
            verification_request_id=v_req.id,
            actor_id=user.id,
            action="SUBMITTED",
            previous_status=VerificationStatus.UNVERIFIED.value,
            new_status=VerificationStatus.PENDING.value,
            reason="Verification request submitted by user."
        )
        db.add(audit)

        await db.commit()
        return await cls.get_request_by_id(db, v_req.id)

    @classmethod
    async def get_request_by_id(cls, db: AsyncSession, request_id: Any) -> VerificationRequest:
        r_id = _to_uuid(request_id)
        stmt = (
            select(VerificationRequest)
            .options(
                selectinload(VerificationRequest.evidences),
                selectinload(VerificationRequest.audits).selectinload(VerificationAudit.actor),
                selectinload(VerificationRequest.submitter),
                selectinload(VerificationRequest.reviewer)
            )
            .execution_options(populate_existing=True)
            .where(VerificationRequest.id == r_id)
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()
        if not req:
            raise HTTPException(status_code=404, detail="Verification request not found.")

        # Evaluate expiration on read
        if req.status == VerificationStatus.VERIFIED and req.expires_at:
            if req.expires_at < datetime.now(timezone.utc):
                req.status = VerificationStatus.EXPIRED
                audit = VerificationAudit(
                    verification_request_id=req.id,
                    actor_id=req.submitted_by,
                    action="EXPIRED",
                    previous_status=VerificationStatus.VERIFIED.value,
                    new_status=VerificationStatus.EXPIRED.value,
                    reason="Verification evidence validity period expired."
                )
                db.add(audit)
                await db.commit()

        return req


    @classmethod
    async def approve_request(
        cls, db: AsyncSession, reviewer: User, request_id: Any, approve_in: AdminApproveIn
    ) -> VerificationRequest:
        v_req = await cls.get_request_by_id(db, request_id)

        # State machine check
        if v_req.status != VerificationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve request in '{v_req.status}' state. Status must be PENDING."
            )

        # Self-approval protection
        if v_req.submitted_by == reviewer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Separation of Duties violation: Reviewer cannot approve their own verification request."
            )

        prev_status = v_req.status.value if hasattr(v_req.status, "value") else str(v_req.status)

        v_req.status = VerificationStatus.VERIFIED
        v_req.reviewed_by = reviewer.id
        v_req.reviewed_at = datetime.now(timezone.utc)
        v_req.review_notes = approve_in.review_notes
        if approve_in.verification_method:
            v_req.verification_method = approve_in.verification_method
        if approve_in.expires_at:
            v_req.expires_at = approve_in.expires_at

        # Update entity status if INSTITUTION or INDUSTRY
        if v_req.subject_type == VerificationSubjectType.INSTITUTION:
            inst_stmt = select(InstitutionProfile).where(InstitutionProfile.id == v_req.subject_id)
            inst = (await db.execute(inst_stmt)).scalar_one_or_none()
            if inst:
                inst.verification_status = VerificationStatus.VERIFIED
        elif v_req.subject_type == VerificationSubjectType.INDUSTRY:
            ind_stmt = select(IndustryProfile).where(IndustryProfile.id == v_req.subject_id)
            ind = (await db.execute(ind_stmt)).scalar_one_or_none()
            if ind:
                ind.verification_status = VerificationStatus.VERIFIED

        # Audit entry
        audit = VerificationAudit(
            verification_request_id=v_req.id,
            actor_id=reviewer.id,
            action="APPROVED",
            previous_status=prev_status,
            new_status=VerificationStatus.VERIFIED.value,
            reason=approve_in.review_notes or "Verification approved by Administrator."
        )
        db.add(audit)

        await db.commit()
        return await cls.get_request_by_id(db, v_req.id)

    @classmethod
    async def reject_request(
        cls, db: AsyncSession, reviewer: User, request_id: Any, reject_in: AdminRejectIn
    ) -> VerificationRequest:
        v_req = await cls.get_request_by_id(db, request_id)

        if v_req.status != VerificationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject request in '{v_req.status}' state. Status must be PENDING."
            )

        prev_status = v_req.status.value if hasattr(v_req.status, "value") else str(v_req.status)

        v_req.status = VerificationStatus.REJECTED
        v_req.reviewed_by = reviewer.id
        v_req.reviewed_at = datetime.now(timezone.utc)
        v_req.rejection_reason = reject_in.rejection_reason
        v_req.review_notes = reject_in.review_notes

        # Update entity status if INSTITUTION or INDUSTRY
        if v_req.subject_type == VerificationSubjectType.INSTITUTION:
            inst_stmt = select(InstitutionProfile).where(InstitutionProfile.id == v_req.subject_id)
            inst = (await db.execute(inst_stmt)).scalar_one_or_none()
            if inst:
                inst.verification_status = VerificationStatus.REJECTED
        elif v_req.subject_type == VerificationSubjectType.INDUSTRY:
            ind_stmt = select(IndustryProfile).where(IndustryProfile.id == v_req.subject_id)
            ind = (await db.execute(ind_stmt)).scalar_one_or_none()
            if ind:
                ind.verification_status = VerificationStatus.REJECTED

        audit = VerificationAudit(
            verification_request_id=v_req.id,
            actor_id=reviewer.id,
            action="REJECTED",
            previous_status=prev_status,
            new_status=VerificationStatus.REJECTED.value,
            reason=reject_in.rejection_reason
        )
        db.add(audit)

        await db.commit()
        return await cls.get_request_by_id(db, v_req.id)

    @classmethod
    async def revoke_request(
        cls, db: AsyncSession, reviewer: User, request_id: Any, revoke_in: AdminRevokeIn
    ) -> VerificationRequest:
        v_req = await cls.get_request_by_id(db, request_id)

        if v_req.status != VerificationStatus.VERIFIED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot revoke request in '{v_req.status}' state. Status must be VERIFIED."
            )

        prev_status = v_req.status.value if hasattr(v_req.status, "value") else str(v_req.status)

        v_req.status = VerificationStatus.REVOKED
        v_req.reviewed_by = reviewer.id
        v_req.revoked_at = datetime.now(timezone.utc)
        v_req.revocation_reason = revoke_in.revocation_reason
        v_req.review_notes = revoke_in.review_notes

        if v_req.subject_type == VerificationSubjectType.INSTITUTION:
            inst_stmt = select(InstitutionProfile).where(InstitutionProfile.id == v_req.subject_id)
            inst = (await db.execute(inst_stmt)).scalar_one_or_none()
            if inst:
                inst.verification_status = VerificationStatus.REJECTED
        elif v_req.subject_type == VerificationSubjectType.INDUSTRY:
            ind_stmt = select(IndustryProfile).where(IndustryProfile.id == v_req.subject_id)
            ind = (await db.execute(ind_stmt)).scalar_one_or_none()
            if ind:
                ind.verification_status = VerificationStatus.SUSPENDED

        audit = VerificationAudit(
            verification_request_id=v_req.id,
            actor_id=reviewer.id,
            action="REVOKED",
            previous_status=prev_status,
            new_status=VerificationStatus.REVOKED.value,
            reason=revoke_in.revocation_reason
        )
        db.add(audit)

        await db.commit()
        return await cls.get_request_by_id(db, v_req.id)

    @classmethod
    async def resubmit_request(
        cls, db: AsyncSession, user: User, request_id: Any, resubmit_in: VerificationResubmitIn
    ) -> VerificationRequest:
        v_req = await cls.get_request_by_id(db, request_id)

        if v_req.submitted_by != user.id:
            raise HTTPException(status_code=403, detail="Access denied. Cannot resubmit another user's request.")

        if v_req.status != VerificationStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot resubmit request in '{v_req.status}' state. Only REJECTED requests can be resubmitted."
            )

        if resubmit_in.evidence.verification_url:
            cls._validate_https_url(resubmit_in.evidence.verification_url, "verification_url")

        prev_status = v_req.status.value if hasattr(v_req.status, "value") else str(v_req.status)

        v_req.status = VerificationStatus.PENDING
        v_req.rejection_reason = None
        v_req.evidence_summary = resubmit_in.evidence_summary or v_req.evidence_summary
        v_req.submitted_at = datetime.now(timezone.utc)

        raw_hash_input = f"{user.id}:{v_req.subject_id}:{resubmit_in.evidence.credential_id}:{resubmit_in.evidence.verification_url}"
        e_hash = hashlib.sha256(raw_hash_input.encode('utf-8')).hexdigest()

        evidence = VerificationEvidence(
            verification_request_id=v_req.id,
            evidence_type=resubmit_in.evidence.evidence_type,
            file_url=resubmit_in.evidence.file_url,
            credential_id=resubmit_in.evidence.credential_id,
            issuer_name=resubmit_in.evidence.issuer_name,
            verification_url=resubmit_in.evidence.verification_url,
            description=resubmit_in.evidence.description,
            evidence_hash=e_hash
        )
        db.add(evidence)

        audit = VerificationAudit(
            verification_request_id=v_req.id,
            actor_id=user.id,
            action="RESUBMITTED",
            previous_status=prev_status,
            new_status=VerificationStatus.PENDING.value,
            reason="User resubmitted updated verification evidence."
        )
        db.add(audit)

        await db.commit()
        return await cls.get_request_by_id(db, v_req.id)



    @classmethod
    async def get_public_verification(cls, db: AsyncSession, public_token: str) -> Dict[str, Any]:
        stmt = (
            select(VerificationRequest)
            .where(VerificationRequest.public_token == public_token)
        )
        res = await db.execute(stmt)
        req = res.scalar_one_or_none()

        if not req or not req.is_public_badge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification proof not found or is currently private."
            )

        # Check expiration
        is_expired = False
        if req.expires_at and req.expires_at < datetime.now(timezone.utc):
            is_expired = True

        is_valid = (req.status == VerificationStatus.VERIFIED) and not is_expired

        badge_type_map = {
            "IDENTITY": "Identity Verified",
            "INSTITUTION": "Institution Verified",
            "ORGANIZATION": "Organization Verified",
            "EDUCATION": "Credential Verified",
            "CERTIFICATION": "Certificate Verified",
            "EXPERIENCE": "Experience Verified",
            "ACHIEVEMENT": "Achievement Verified",
            "PORTFOLIO": "Profile Verified",
            "SKILL_EVIDENCE": "Verified Skill Evidence"
        }

        v_type_str = req.verification_type.value if hasattr(req.verification_type, "value") else str(req.verification_type)
        status_str = req.status.value if hasattr(req.status, "value") else str(req.status)
        badge_label = badge_type_map.get(v_type_str, "Verified Record")

        return {
            "public_token": req.public_token,
            "subject_type": req.subject_type.value if hasattr(req.subject_type, "value") else str(req.subject_type),
            "verification_type": v_type_str,
            "status": status_str if not is_expired else "EXPIRED",
            "verification_method": req.verification_method,
            "verified_at": req.reviewed_at,
            "expires_at": req.expires_at,
            "is_valid": is_valid,
            "badge_label": badge_label
        }
