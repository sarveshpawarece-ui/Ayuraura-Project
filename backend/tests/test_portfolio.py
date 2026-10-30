import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_student(email: str, password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "STUDENT", "full_name": "Ayurvedic Student"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_get_or_create_portfolio_default_state():
    student_email = f"portfolio_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_student(student_email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get portfolio (auto-initializes default draft state)
    res = client.get("/api/v1/student/portfolio", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["visibility"] == "PRIVATE"
    assert data["is_published"] is False
    assert "slug" in data
    assert data["slug"] != ""


def test_update_portfolio_headline_summary_slug():
    student_email = f"portfolio_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_student(student_email)
    headers = {"Authorization": f"Bearer {token}"}

    custom_slug = f"aadi-ayurvedic-rd-{uuid.uuid4().hex[:6]}"

    # 1. Update portfolio
    res_patch = client.patch(
        "/api/v1/student/portfolio",
        json={
            "headline": "Aspiring Ayurvedic Pharmaceutical R&D Professional",
            "summary": "Dedicated BAMS researcher focusing on herbal standardization and GMP quality control.",
            "slug": custom_slug,
            "contact_email_public": True,
            "show_skill_scores": True
        },
        headers=headers
    )
    assert res_patch.status_code == 200
    updated = res_patch.json()
    assert updated["headline"] == "Aspiring Ayurvedic Pharmaceutical R&D Professional"
    assert updated["slug"] == custom_slug
    assert updated["contact_email_public"] is True

    # 2. Security Test: Reject reserved slug (e.g. "admin")
    res_reserved = client.patch(
        "/api/v1/student/portfolio",
        json={"slug": "admin"},
        headers=headers
    )
    assert res_reserved.status_code == 400


def test_publish_and_unpublish_portfolio():
    student_email = f"portfolio_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_student(student_email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Publish portfolio
    res_pub = client.post("/api/v1/student/portfolio/publish", headers=headers)
    assert res_pub.status_code == 200
    pub_data = res_pub.json()
    assert pub_data["is_published"] is True
    assert pub_data["visibility"] == "PUBLIC"
    assert pub_data["published_at"] is not None

    # 2. Unpublish portfolio
    res_unpub = client.post("/api/v1/student/portfolio/unpublish", headers=headers)
    assert res_unpub.status_code == 200
    unpub_data = res_unpub.json()
    assert unpub_data["is_published"] is False
    assert unpub_data["visibility"] == "PRIVATE"


def test_project_crud_and_idor_protection():
    student1_email = f"student1_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token1 = get_token_for_student(student1_email)
    headers1 = {"Authorization": f"Bearer {token1}"}

    student2_email = f"student2_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token2 = get_token_for_student(student2_email)
    headers2 = {"Authorization": f"Bearer {token2}"}

    # 1. Add project in Student 1
    res_proj = client.post(
        "/api/v1/student/portfolio/projects",
        json={
            "title": "Ayurvedic Herbal Standardization Pipeline",
            "description": "Developed HPLC analysis protocol for polyherbal Ayurvedic formulations.",
            "role": "Lead Researcher",
            "technologies": ["Python", "HPLC", "GMP QC"],
            "project_url": "https://github.com/ayursetu/herbal-qc",
            "is_featured": True
        },
        headers=headers1
    )
    assert res_proj.status_code == 201
    proj1_id = res_proj.json()["id"]

    # 2. IDOR Security Test: Student 2 cannot modify Student 1's project
    res_idor = client.patch(
        f"/api/v1/student/portfolio/projects/{proj1_id}",
        json={"title": "Hacked Title"},
        headers=headers2
    )
    assert res_idor.status_code == 404

    # 3. Delete project Student 1
    res_del = client.delete(f"/api/v1/student/portfolio/projects/{proj1_id}", headers=headers1)
    assert res_del.status_code == 200


def test_experience_certification_achievement_education_crud():
    student_email = f"sections_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_student(student_email)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add Education
    res_edu = client.post(
        "/api/v1/student/portfolio/education",
        json={
            "institution": "National Institute of Ayurveda",
            "degree": "BAMS",
            "field_of_study": "Ayurvedic Medicine & Surgery",
            "start_year": 2022,
            "end_year": 2027
        },
        headers=headers
    )
    assert res_edu.status_code == 201

    # 2. Add Experience
    res_exp = client.post(
        "/api/v1/student/portfolio/experience",
        json={
            "organization": "Dabur Research Foundation",
            "role": "Ayurvedic Formulation Intern",
            "experience_type": "INTERNSHIP",
            "start_date": "2025-06",
            "end_date": "2025-12",
            "description": "Assisted in clinical trial protocol design and GMP compliance documentation."
        },
        headers=headers
    )
    assert res_exp.status_code == 201

    # 3. Add Certification
    res_cert = client.post(
        "/api/v1/student/portfolio/certifications",
        json={
            "name": "Good Manufacturing Practice (GMP) in Ayush Formulations",
            "issuer": "Ayush Quality Council of India",
            "issue_date": "2025-10",
            "credential_url": "https://ayush.gov.in/credentials/gmp-101"
        },
        headers=headers
    )
    assert res_cert.status_code == 201

    # 4. Add Achievement
    res_ach = client.post(
        "/api/v1/student/portfolio/achievements",
        json={
            "title": "Smart India Hackathon 2026 Winner - Ayush AI Category",
            "issuer": "Ministry of Education & Ministry of Ayush",
            "date": "2026-08",
            "description": "Built AyurSetu Skill Intelligence & Career Platform."
        },
        headers=headers
    )
    assert res_ach.status_code == 201


def test_unauthenticated_public_portfolio_resolution_and_privacy():
    student_email = f"public_student_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token_for_student(student_email)
    headers = {"Authorization": f"Bearer {token}"}

    custom_slug = f"public-demo-{uuid.uuid4().hex[:6]}"

    # Setup profile & portfolio
    client.patch(
        "/api/v1/student/portfolio",
        json={
            "headline": "Ayurvedic Clinical Researcher",
            "summary": "Focusing on evidence-based Ayush medicine.",
            "slug": custom_slug,
            "contact_email_public": True,
            "show_skill_gaps": False  # Hidden by default
        },
        headers=headers
    )

    # 1. Access before publish returns 404
    res_pre = client.get(f"/api/v1/public/portfolio/{custom_slug}")
    assert res_pre.status_code == 404

    # 2. Publish portfolio
    client.post("/api/v1/student/portfolio/publish", headers=headers)

    # 3. Unauthenticated public resolution works
    res_pub = client.get(f"/api/v1/public/portfolio/{custom_slug}")
    assert res_pub.status_code == 200
    pub = res_pub.json()
    assert pub["slug"] == custom_slug
    assert pub["headline"] == "Ayurvedic Clinical Researcher"
    assert pub["public_email"] == student_email

    # Privacy verification: verify password / internal keys not present
    assert "password" not in pub
    assert "hashed_password" not in pub
    assert "missing_skills" not in pub
