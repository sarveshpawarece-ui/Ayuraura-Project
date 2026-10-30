import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(email: str, role: str = "STUDENT", password: str = "AyurSetuE2E@2026") -> str:
    res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"E2E {role.title()} User"}
    )
    assert reg_res.status_code in [200, 201]

    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_full_sih_26044_end_to_end_user_journey():
    # -------------------------------------------------------------
    # STEP 1: Student Setup, Profile & Target Career
    # -------------------------------------------------------------
    student_email = f"e2e_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    student_token = get_token(student_email, role="STUDENT")
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Update Student Profile
    prof_res = client.put(
        "/api/v1/students/me/profile",
        json={
            "full_name": "Aarav Sharma",
            "bio": "BAMS Final Year Scholar passionate about Ayurvedic Formulations & Clinical Trials.",
            "specialization": "Dravyaguna Vigyan",
            "education_level": "BAMS",
            "graduation_year": 2026,
            "headline": "Ayurvedic R&D Specialist Candidate"
        },
        headers=student_headers
    )
    assert prof_res.status_code == 200

    # Select Target Career Role
    roles_res = client.get("/api/v1/career-roles", headers=student_headers)
    assert roles_res.status_code == 200
    roles = roles_res.json()
    assert len(roles) > 0
    target_role_id = roles[0]["id"]

    select_role_res = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": target_role_id},
        headers=student_headers
    )
    assert select_role_res.status_code == 200

    # -------------------------------------------------------------
    # STEP 2: Assessment & Skill Gap Engine
    # -------------------------------------------------------------
    # Start MCQ Assessment attempt
    assess_res = client.post("/api/v1/assessments/start", headers=student_headers)
    assert assess_res.status_code == 200
    assess_data = assess_res.json()
    assert "questions" in assess_data

    # Skill Gap & Recommendations
    gap_res = client.get(
        f"/api/v1/skills/gap-analysis?career_role_id={target_role_id}",
        headers=student_headers
    )
    assert gap_res.status_code == 200

    recs_res = client.get("/api/v1/students/me/recommendations", headers=student_headers)
    assert recs_res.status_code == 200

    # -------------------------------------------------------------
    # STEP 3: Industry Organization & Opportunity Posting
    # -------------------------------------------------------------
    ind_email = f"e2e_dabur_{uuid.uuid4().hex[:6]}@ayurveda.com"
    ind_token = get_token(ind_email, role="INDUSTRY")
    ind_headers = {"Authorization": f"Bearer {ind_token}"}

    # Fetch & Update Industry Profile
    get_org_res = client.get("/api/v1/industry/organization", headers=ind_headers)
    assert get_org_res.status_code == 200

    org_res = client.patch(
        "/api/v1/industry/organization",
        json={
            "company_name": "Dabur AyurResearch Labs",
            "website_url": "https://dabur.example.com",
            "description": "Leading Ayurvedic healthcare and R&D organization."
        },
        headers=ind_headers
    )
    assert org_res.status_code == 200

    # Post Opportunity
    opp_res = client.post(
        "/api/v1/industry/opportunities",
        json={
            "title": "Ayurvedic Clinical Formulations Intern",
            "opportunity_type": "INTERNSHIP",
            "location": "New Delhi / Remote",
            "description": "6 months research internship in Ayurvedic drug standardization.",
            "status": "DRAFT"
        },
        headers=ind_headers
    )
    assert opp_res.status_code in [200, 201]
    opp_id = opp_res.json()["id"]

    # -------------------------------------------------------------
    # STEP 4: Matching Engine & Application Submission
    # -------------------------------------------------------------
    match_res = client.get(
        f"/api/v1/opportunities/{opp_id}/matching-score",
        headers=student_headers
    )
    assert match_res.status_code in [200, 404]

    apply_res = client.post(
        "/api/v1/students/me/applications",
        json={
            "opportunity_id": opp_id,
            "status": "APPLIED",
            "notes": "I have extensive research coursework in Dravyaguna Vigyan and standardization."
        },
        headers=student_headers
    )
    assert apply_res.status_code in [200, 201]
    app_id = apply_res.json()["id"]

    # Industry updates application status
    status_update_res = client.patch(
        f"/api/v1/industry/applications/{app_id}/status",
        json={"status": "SHORTLISTED", "notes": "Strong candidate with solid Dravyaguna background."},
        headers=ind_headers
    )
    assert status_update_res.status_code in [200, 201]

    # -------------------------------------------------------------
    # STEP 5: Student Portfolio System
    # -------------------------------------------------------------
    # Fetch/init default portfolio
    port_init_res = client.get("/api/v1/student/portfolio", headers=student_headers)
    assert port_init_res.status_code == 200

    portfolio_slug = f"aarav-sharma-{uuid.uuid4().hex[:6]}"
    port_res = client.patch(
        "/api/v1/student/portfolio",
        json={
            "slug": portfolio_slug,
            "title": "Aarav Sharma — AyurSetu Portfolio",
            "visibility": "PUBLIC",
            "headline": "Ayurvedic R&D Specialist",
            "summary": "Verified Ayush clinical researcher portfolio."
        },
        headers=student_headers
    )
    assert port_res.status_code == 200

    # Publish portfolio
    pub_res = client.post("/api/v1/student/portfolio/publish", headers=student_headers)
    assert pub_res.status_code == 200

    # -------------------------------------------------------------
    # STEP 6: Verification System & Admin Approval
    # -------------------------------------------------------------
    verif_sub_res = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": str(uuid.uuid4()),
            "verification_type": "CERTIFICATION",
            "evidence_summary": "SIH 2026 Winner Certificate — Ayush Domain",
            "is_public_badge": True,
            "evidence": {
                "evidence_type": "CREDENTIAL_URL",
                "issuer_name": "Ministry of Ayush / SIH 2026",
                "credential_id": "SIH-26044-2026",
                "verification_url": "https://ayush.gov.in/verify/SIH-26044"
            }
        },
        headers=student_headers
    )
    assert verif_sub_res.status_code == 201
    verif_data = verif_sub_res.json()
    verif_id = verif_data["id"]
    public_token = verif_data["public_token"]

    # Admin Setup & Approval
    admin_email = f"e2e_admin_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token(admin_email, role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    approve_res = client.post(
        f"/api/v1/admin/verifications/{verif_id}/approve",
        json={"review_notes": "Verified against SIH 2026 Ministry of Ayush award registry."},
        headers=admin_headers
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "VERIFIED"

    # Unauthenticated Public Verification Proof Lookup
    pub_proof_res = client.get(f"/api/v1/public/verifications/{public_token}")
    assert pub_proof_res.status_code == 200
    assert pub_proof_res.json()["is_valid"] is True

    # -------------------------------------------------------------
    # STEP 7: Institution Dashboard Monitoring
    # -------------------------------------------------------------
    inst_email = f"e2e_inst_{uuid.uuid4().hex[:6]}@ayurveda.com"
    inst_token = get_token(inst_email, role="INSTITUTION")
    inst_headers = {"Authorization": f"Bearer {inst_token}"}

    inst_dash_res = client.get("/api/v1/institution/dashboard", headers=inst_headers)
    assert inst_dash_res.status_code in [200, 201]
