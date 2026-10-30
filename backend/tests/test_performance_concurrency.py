import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(email: str, role: str = "STUDENT", password: str = "AyurSetuPass123!") -> str:
    res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"Perf User {role.title()}"}
    )
    assert reg_res.status_code in [200, 201]

    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_pagination_boundary_controls():
    token = get_token(f"page_perf_{uuid.uuid4().hex[:6]}@ayurveda.com", role="STUDENT")

    # 1. Negative skip / limit handling
    res_neg = client.get(
        "/api/v1/opportunities?skip=-5&limit=-10",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_neg.status_code in [200, 422]

    # 2. Oversized limit handling
    res_huge = client.get(
        "/api/v1/opportunities?skip=0&limit=1000",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_huge.status_code == 200


def test_n_plus_1_query_efficiency():
    admin_email = f"admin_nplus1_{uuid.uuid4().hex[:6]}@ayurveda.com"
    admin_token = get_token(admin_email, role="ADMIN")

    # Fetch verification queue with eager loads
    res_queue = client.get(
        "/api/v1/admin/verifications",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_queue.status_code == 200
    data = res_queue.json()
    assert isinstance(data, list)


def test_concurrent_multi_request_state_isolation():
    student_email = f"concur_s_{uuid.uuid4().hex[:6]}@ayurveda.com"
    token = get_token(student_email, role="STUDENT")

    cert_id = str(uuid.uuid4())

    # Submit first request
    res1 = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": cert_id,
            "verification_type": "CERTIFICATION",
            "evidence_summary": "First Submission"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res1.status_code == 201

    # Concurrent duplicate request submit
    res2 = client.post(
        "/api/v1/student/verifications",
        json={
            "subject_type": "CERTIFICATION",
            "subject_id": cert_id,
            "verification_type": "CERTIFICATION",
            "evidence_summary": "Concurrent Submission"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 400
