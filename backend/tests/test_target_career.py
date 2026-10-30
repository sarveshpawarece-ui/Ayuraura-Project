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


def seed_test_career_roles_if_empty():
    res = client.get("/api/v1/career-roles")
    roles = res.json()
    if not roles:
        from app.core.database import AsyncSessionLocal
        from app.db.init_db import init_db
        import asyncio
        async def run_seed():
            async with AsyncSessionLocal() as db:
                await init_db(db)
        asyncio.run(run_seed())


def test_list_career_roles_and_filtering():
    seed_test_career_roles_if_empty()
    response = client.get("/api/v1/career-roles")
    assert response.status_code == 200
    roles = response.json()
    assert isinstance(roles, list)
    assert len(roles) >= 1

    first_role = roles[0]
    assert "id" in first_role
    assert "name" in first_role
    assert "slug" in first_role
    assert "category" in first_role

    # Filter by category
    category = first_role["category"]
    res_cat = client.get(f"/api/v1/career-roles?category={category}")
    assert res_cat.status_code == 200
    cat_roles = res_cat.json()
    assert all(r["category"] == category for r in cat_roles)

    # Search keyword
    res_search = client.get("/api/v1/career-roles?search=Ayurvedic")
    assert res_search.status_code == 200
    assert isinstance(res_search.json(), list)


def test_get_career_role_by_id_and_slug():
    seed_test_career_roles_if_empty()
    res_list = client.get("/api/v1/career-roles")
    roles = res_list.json()
    sample_role = roles[0]

    # By ID
    res_id = client.get(f"/api/v1/career-roles/{sample_role['id']}")
    assert res_id.status_code == 200
    assert res_id.json()["name"] == sample_role["name"]

    # By Slug
    res_slug = client.get(f"/api/v1/career-roles/{sample_role['slug']}")
    assert res_slug.status_code == 200
    assert res_slug.json()["id"] == sample_role["id"]

    # Non-existent
    res_fake = client.get(f"/api/v1/career-roles/non-existent-role-slug-999")
    assert res_fake.status_code == 404


def test_student_target_career_crud_lifecycle():
    seed_test_career_roles_if_empty()
    email = f"test_target_career_student_{uuid.uuid4().hex[:6]}@example.com"
    token = get_token_for_user(email, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch initially (may be None)
    res_get_init = client.get("/api/v1/students/me/target-career", headers=headers)
    assert res_get_init.status_code == 200
    assert "target_career" in res_get_init.json()

    # 2. Get active career roles
    roles = client.get("/api/v1/career-roles").json()
    role_1 = roles[0]
    role_2 = roles[1] if len(roles) > 1 else roles[0]

    # Check profile completion before setting target career
    prof_before = client.get("/api/v1/students/me/profile", headers=headers).json()
    score_before = prof_before["profile_completion_percentage"]

    # 3. Set target career
    res_set = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": role_1["id"]},
        headers=headers
    )
    assert res_set.status_code == 200
    assert res_set.json()["target_career"]["id"] == role_1["id"]

    # Verify profile completion percentage increased (+10%)
    prof_after = client.get("/api/v1/students/me/profile", headers=headers).json()
    score_after = prof_after["profile_completion_percentage"]
    assert score_after >= score_before + 10 or score_after == 100

    # 4. Verify GET returns updated target career
    res_get = client.get("/api/v1/students/me/target-career", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["target_career"]["id"] == role_1["id"]

    # 5. Change target career to role_2
    res_change = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": role_2["id"]},
        headers=headers
    )
    assert res_change.status_code == 200
    assert res_change.json()["target_career"]["id"] == role_2["id"]

    # 6. Clear target career
    res_clear = client.delete("/api/v1/students/me/target-career", headers=headers)
    assert res_clear.status_code == 200
    assert res_clear.json()["target_career"] is None

    # 7. Verify GET returns None after clearing
    res_get_cleared = client.get("/api/v1/students/me/target-career", headers=headers)
    assert res_get_cleared.status_code == 200
    assert res_get_cleared.json()["target_career"] is None


def test_ownership_isolation_between_students():
    seed_test_career_roles_if_empty()
    email_a = f"student_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"student_b_{uuid.uuid4().hex[:6]}@example.com"

    token_a = get_token_for_user(email_a, role="STUDENT")
    token_b = get_token_for_user(email_b, role="STUDENT")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    roles = client.get("/api/v1/career-roles").json()
    role_a = roles[0]
    role_b = roles[1] if len(roles) > 1 else roles[0]

    # Student A sets role_a
    client.put("/api/v1/students/me/target-career", json={"career_role_id": role_a["id"]}, headers=headers_a)

    # Student B sets role_b
    client.put("/api/v1/students/me/target-career", json={"career_role_id": role_b["id"]}, headers=headers_b)

    # Verify Student A's target career is role_a and Student B's target career is role_b
    res_a = client.get("/api/v1/students/me/target-career", headers=headers_a).json()
    res_b = client.get("/api/v1/students/me/target-career", headers=headers_b).json()

    assert res_a["target_career"]["id"] == role_a["id"]
    assert res_b["target_career"]["id"] == role_b["id"]


def test_target_career_rbac_and_validation():
    seed_test_career_roles_if_empty()
    # 1. Unauthenticated -> 401
    res_unauth = client.get("/api/v1/students/me/target-career")
    assert res_unauth.status_code == 401

    # 2. Non-student (Faculty) -> 403
    fac_email = f"test_fac_target_{uuid.uuid4().hex[:6]}@example.com"
    token_fac = get_token_for_user(fac_email, role="FACULTY")
    roles = client.get("/api/v1/career-roles").json()
    role_id = roles[0]["id"]

    res_fac_set = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": role_id},
        headers={"Authorization": f"Bearer {token_fac}"}
    )
    assert res_fac_set.status_code == 403

    # 3. Invalid career_role_id -> 404
    stud_email = f"test_stud_invalid_{uuid.uuid4().hex[:6]}@example.com"
    token_stud = get_token_for_user(stud_email, role="STUDENT")
    fake_role_id = str(uuid.uuid4())

    res_invalid = client.put(
        "/api/v1/students/me/target-career",
        json={"career_role_id": fake_role_id},
        headers={"Authorization": f"Bearer {token_stud}"}
    )
    assert res_invalid.status_code == 404
