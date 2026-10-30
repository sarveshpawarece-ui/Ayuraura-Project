import pytest
import uuid
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, role: str = "STUDENT", password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"{role.title()} User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_submit_verification_request_and_duplicate_prevention():
    student_email = f"verif_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    cert_id = str(uuid.uuid4())

    # 1. Submit verification request
    res = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": cert_id,
            "verification_type": "CERTIFICATION",
            "evidence_summary": "GMP Ayush Certification from Quality Council",
            "evidence": {
                "evidence_type": "CREDENTIAL_URL",
                "issuer_name": "Ayush Quality Council",
                "credential_id": "GMP-2026-99",
                "verification_url": "https://ayush.gov.in/verify/GMP-2026-99",
                "description": "Official accreditation certificate for Ayurvedic formulation quality assurance."
            },
            "is_public_badge": True
        },
        headers=headers
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "PENDING"
    assert data["subject_id"] == cert_id
    assert "public_token" in data

    # 2. Duplicate active request prevention
    res_dup = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": cert_id,
            "verification_type": "CERTIFICATION",
            "evidence_summary": "Duplicate request"
        },
        headers=headers
    )
    assert res_dup.status_code == 400


def test_admin_approval_and_self_approval_protection():
    student_email = f"student_verif_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token_for_user(student_email, role="STUDENT")

    admin_email = f"admin_verif_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token_for_user(admin_email, role="ADMIN")

    exp_id = str(uuid.uuid4())

    # 1. Student submits request
    res_sub = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "EXPERIENCE",
            "subject_id": exp_id,
            "verification_type": "EXPERIENCE",
            "evidence_summary": "Ayurvedic R&D Internship at Dabur",
            "evidence": {
                "evidence_type": "ISSUER_INFO",
                "issuer_name": "Dabur Research Foundation",
                "description": "6 months clinical research internship"
            }
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_sub.status_code == 201
    req_id = res_sub.json()["id"]

    # 2. Self-approval protection: Student cannot approve their own request
    res_self_appr = client.post(
        f"/api/v1/admin/verifications/{req_id}/approve",
        json={"review_notes": "Trying to self approve"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_self_appr.status_code == 403

    # 3. Admin approves request
    res_appr = client.post(
        f"/api/v1/admin/verifications/{req_id}/approve",
        json={"review_notes": "Verified against Dabur HR records.", "verification_method": "MANUAL_REVIEW"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_appr.status_code == 200
    appr_data = res_appr.json()
    assert appr_data["status"] == "VERIFIED"
    assert appr_data["reviewed_by"] is not None
    assert len(appr_data["audits"]) >= 2


def test_admin_rejection_and_resubmission():
    student_email = f"reject_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token_for_user(student_email, role="STUDENT")

    admin_email = f"admin_reviewer_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token_for_user(admin_email, role="ADMIN")

    edu_id = str(uuid.uuid4())

    # 1. Student submits
    res_sub = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "EDUCATION",
            "subject_id": edu_id,
            "verification_type": "EDUCATION",
            "evidence_summary": "BAMS Degree Certificate"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_sub.status_code == 201
    req_id = res_sub.json()["id"]

    # 2. Admin rejects request
    res_rej = client.post(
        f"/api/v1/admin/verifications/{req_id}/reject",
        json={"rejection_reason": "Credential image is blurry and unreadable. Please provide a clear copy."},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_rej.status_code == 200
    rej_data = res_rej.json()
    assert rej_data["status"] == "REJECTED"
    assert rej_data["rejection_reason"] is not None

    # 3. Student resubmits request (REJECTED -> PENDING)
    res_resub = client.post(
        f"/api/v1/student/verifications/{req_id}/resubmit",
        json={
            "evidence_summary": "High-resolution scan of BAMS Degree Certificate",
            "evidence": {
                "evidence_type": "FILE",
                "issuer_name": "National Institute of Ayurveda",
                "description": "Verified high resolution scan."
            }
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_resub.status_code == 200
    resub_data = res_resub.json()
    assert resub_data["status"] == "PENDING"
    assert resub_data["rejection_reason"] is None


def test_admin_revocation():
    student_email = f"revoke_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token_for_user(student_email, role="STUDENT")

    admin_email = f"admin_revoker_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token_for_user(admin_email, role="ADMIN")

    ach_id = str(uuid.uuid4())

    # 1. Student submits & Admin approves
    res_sub = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "ACHIEVEMENT",
            "subject_id": ach_id,
            "verification_type": "ACHIEVEMENT",
            "evidence_summary": "SIH 2026 Winner Certificate"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    req_id = res_sub.json()["id"]

    client.post(
        f"/api/v1/admin/verifications/{req_id}/approve",
        json={"review_notes": "Approved"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 2. Admin revokes verification
    res_rev = client.post(
        f"/api/v1/admin/verifications/{req_id}/revoke",
        json={"revocation_reason": "Credential revoked due to official event authority correction."},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_rev.status_code == 200
    rev_data = res_rev.json()
    assert rev_data["status"] == "REVOKED"
    assert rev_data["revocation_reason"] is not None


def test_public_verification_proof_token_and_privacy():
    student_email = f"pub_proof_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token_for_user(student_email, role="STUDENT")

    admin_email = f"admin_pub_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token_for_user(admin_email, role="ADMIN")

    cert_id = str(uuid.uuid4())

    # 1. Submit & approve
    res_sub = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": cert_id,
            "verification_type": "CERTIFICATION",
            "evidence_summary": "Public Cert Test",
            "evidence": {
                "evidence_type": "CREDENTIAL_URL",
                "issuer_name": "Ayush Council",
                "credential_id": "CERT-100",
                "verification_url": "https://ayush.gov.in/verify/100"
            },
            "is_public_badge": True
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    data = res_sub.json()
    req_id = data["id"]
    token = data["public_token"]

    client.post(
        f"/api/v1/admin/verifications/{req_id}/approve",
        json={"review_notes": "Approved internally"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 2. Unauthenticated Public Verification Proof Lookup
    res_pub = client.get(f"/api/v1/public/verifications/{token}")
    assert res_pub.status_code == 200
    pub = res_pub.json()
    assert pub["public_token"] == token
    assert pub["status"] == "VERIFIED"
    assert pub["is_valid"] is True
    assert pub["badge_label"] == "Certificate Verified"

    # Privacy checks: ensure internal notes and file URLs are NOT present
    assert "review_notes" not in pub
    assert "file_url" not in pub
    assert "evidence_summary" not in pub


def test_idor_and_privacy_isolation():
    student1_email = f"idor1_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token1 = get_token_for_user(student1_email, role="STUDENT")

    student2_email = f"idor2_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token2 = get_token_for_user(student2_email, role="STUDENT")

    # Student 1 submits request
    res_sub = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "STUDENT",
            "subject_id": str(uuid.uuid4()),
            "verification_type": "IDENTITY",
            "evidence_summary": "Student Identity Card"
        },
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res_sub.status_code == 201
    req_id = res_sub.json()["id"]


    # Student 2 tries to access Student 1's request detail (IDOR check)
    res_idor = client.get(
        f"/api/v1/student/verifications/{req_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res_idor.status_code == 403
