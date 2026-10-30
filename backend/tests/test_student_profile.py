import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token_for_user(email: str, password: str = "AyurSetu@2026", role: str = "STUDENT") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code != 200:
        # Register user dynamically
        client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": password,
                "role": role,
                "full_name": email.split("@")[0].replace("_", " ").title(),
            }
        )
        response = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]

def test_get_student_profile_authenticated_student():
    email = f"test_student_get_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/students/me/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "user_id" in data
    assert "profile_completion_percentage" in data
    assert "profile_status" in data
    assert isinstance(data["interests"], list)
    assert isinstance(data["skills"], list)

def test_update_student_profile():
    email = f"test_student_upd_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "first_name": "Aarav",
        "last_name": "Sharma",
        "phone": "+91 9876543210",
        "city": "Jaipur",
        "state": "Rajasthan",
        "college_name": "National Institute of Ayurveda",
        "course": "BAMS",
        "specialization": "Dravyaguna",
        "current_year": 4,
        "graduation_year": 2027,
        "cgpa": 8.7,
        "bio": "Passionate about Ayurvedic pharmacology and herbal extraction QC.",
        "interests": ["Pharmaceutical R&D", "Clinical Research"]
    }
    
    response = client.put("/api/v1/students/me/profile", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Aarav"
    assert data["last_name"] == "Sharma"
    assert data["college_name"] == "National Institute of Ayurveda"
    assert data["course"] == "BAMS"
    assert data["current_year"] == 4
    assert data["profile_completion_percentage"] > 0

def test_add_and_delete_student_experience():
    email = f"test_student_exp_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    exp_payload = {
        "title": "Herbal Formulation Intern",
        "organization": "Patanjali Research Institute",
        "experience_type": "INTERNSHIP",
        "description": "Marker compound analysis and extract standardization.",
        "start_date": "2025-06-01",
        "end_date": "2025-12-31",
        "is_current": False
    }
    
    res_add = client.post("/api/v1/students/me/experiences", json=exp_payload, headers=headers)
    assert res_add.status_code == 201
    exp_data = res_add.json()
    assert exp_data["title"] == "Herbal Formulation Intern"
    exp_id = exp_data["id"]
    
    res_del = client.delete(f"/api/v1/students/me/experiences/{exp_id}", headers=headers)
    assert res_del.status_code == 204

def test_add_and_delete_student_project():
    email = f"test_student_proj_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_payload = {
        "title": "HPLC Standardization of Curcumin Marker",
        "description": "Method development and validation for botanical quality control.",
        "technologies": "HPLC, UV-Vis Spectrophotometry",
        "role": "Lead Student Researcher"
    }
    
    res_add = client.post("/api/v1/students/me/projects", json=proj_payload, headers=headers)
    assert res_add.status_code == 201
    proj_data = res_add.json()
    assert proj_data["title"] == "HPLC Standardization of Curcumin Marker"
    proj_id = proj_data["id"]
    
    res_del = client.delete(f"/api/v1/students/me/projects/{proj_id}", headers=headers)
    assert res_del.status_code == 204

def test_add_and_delete_self_declared_skill():
    email = f"test_student_skill_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    skill_payload = {
        "skill_name_or_id": "GMP Quality Control",
        "proficiency_level": "ADVANCED"
    }
    
    res_add = client.post("/api/v1/students/me/skills", json=skill_payload, headers=headers)
    assert res_add.status_code == 201
    profile_data = res_add.json()
    
    matched_skills = [s for s in profile_data["skills"] if s["skill_name"] == "GMP Quality Control"]
    assert len(matched_skills) > 0
    skill_id = matched_skills[0]["id"]
    
    res_del = client.delete(f"/api/v1/students/me/skills/{skill_id}", headers=headers)
    assert res_del.status_code == 204

def test_student_profile_rbac_access_denied_for_other_roles():
    # 1. Unauthenticated -> 401
    res_unauth = client.get("/api/v1/students/me/profile")
    assert res_unauth.status_code == 401
    
    # 2. Faculty -> 403
    fac_email = f"test_faculty_rbac_{uuid.uuid4().hex[:6]}@example.com"
    token_faculty = get_token_for_user(fac_email, role="FACULTY")
    res_fac = client.get("/api/v1/students/me/profile", headers={"Authorization": f"Bearer {token_faculty}"})
    assert res_fac.status_code == 403
    
    # 3. Industry -> 403
    ind_email = f"test_ind_rbac_{uuid.uuid4().hex[:6]}@example.com"
    token_ind = get_token_for_user(ind_email, role="INDUSTRY")
    res_ind = client.get("/api/v1/students/me/profile", headers={"Authorization": f"Bearer {token_ind}"})
    assert res_ind.status_code == 403
    
    # 4. Institution -> 403
    inst_email = f"test_inst_rbac_{uuid.uuid4().hex[:6]}@example.com"
    token_inst = get_token_for_user(inst_email, role="INSTITUTION")
    res_inst = client.get("/api/v1/students/me/profile", headers={"Authorization": f"Bearer {token_inst}"})
    assert res_inst.status_code == 403
