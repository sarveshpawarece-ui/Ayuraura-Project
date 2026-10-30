import asyncio
import httpx
import json
import base64
import pytest
from app.main import app
from app.db.init_db import init_db
from app.core.database import AsyncSessionLocal

BASE_URL = "http://testserver/api/v1"

USERS = [
    {
        "role": "STUDENT",
        "email": "student@ayursetu.in",
        "password": "password123",
        "dashboard_endpoints": [
            ("/students/me/profile", "Student Profile Info"),
            ("/students/me/skills", "Student Skills & Ratings"),
            ("/students/me/applications", "Student Applications List"),
            ("/students/me/recommendations", "Personalized Recommendations")
        ]
    },
    {
        "role": "DOCTOR",
        "email": "doctor@ayursetu.in",
        "password": "password123",
        "dashboard_endpoints": [
            ("/doctor/profile/me", "Doctor Profile Info"),
            ("/doctor/dashboard/summary", "Doctor Metrics & KPI Summary"),
            ("/doctor/clinics/me", "Associated Clinical Centers"),
            ("/doctor/internships/analytics", "Doctor Mentorship Analytics")
        ]
    },
    {
        "role": "INDUSTRY",
        "email": "industry@ayursetu.in",
        "password": "password123",
        "dashboard_endpoints": [
            ("/industry/dashboard", "Industry Recruitment KPIs"),
            ("/industry/organization", "Company Profile & Registration"),
            ("/industry/opportunities", "Active Industry Opportunities")
        ]
    },
    {
        "role": "INSTITUTION",
        "email": "institute@ayursetu.in",
        "password": "password123",
        "dashboard_endpoints": [
            ("/institution/dashboard", "Institution Academic KPIs"),
            ("/institution/analytics", "Placement & Skill Analytics"),
            ("/institution/departments", "Active College Departments")
        ]
    },
    {
        "role": "ADMIN",
        "email": "admin@ayursetu.in",
        "password": "password123",
        "dashboard_endpoints": [
            ("/admin/verifications", "Verification Requests Queue"),
            ("/admin/verifications/analytics", "Verification Analytics Overview"),
            ("/admin/organizations", "Pending Organization Approvals"),
            ("/admin/institutions", "Pending Institution Approvals")
        ]
    }
]

def decode_jwt_payload(token):
    try:
        parts = token.split(".")
        if len(parts) >= 2:
            padding = "=" * (4 - len(parts[1]) % 4)
            decoded = base64.b64decode(parts[1] + padding).decode("utf-8")
            return json.loads(decoded)
    except Exception:
        pass
    return {}

@pytest.mark.asyncio
async def test_auth_and_dashboards():
    print("=========================================================")
    print("AUTHENTICATION, SESSION & DASHBOARD DYNAMIC DATA AUDIT")
    print("=========================================================")

    all_passed = True
    async with AsyncSessionLocal() as session:
        await init_db(session)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        for u in USERS:
            role = u["role"]
            email = u["email"]
            pwd = u["password"]
            print(f"\n--- Testing Role: {role} ({email}) ---")
            
            # 1. Login
            res = await client.post(
                "/auth/login",
                data={"username": email, "password": pwd},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if res.status_code != 200:
                print(f"  [FAIL] Login failed: status {res.status_code} - {res.text}")
                all_passed = False
                continue
                
            data = res.json()
            token = data.get("access_token")
            assert token is not None, "Missing access_token"
            
            # Decode session payload
            payload = decode_jwt_payload(token)
            sub = payload.get("sub")
            exp = payload.get("exp")
            print(f"  [PASS] Login Success: HTTP 200 | JWT User Sub: {sub} | Exp: {exp}")
            
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Test Dynamic Dashboard Data Ingestion
            for ep, desc in u["dashboard_endpoints"]:
                try:
                    r = await client.get(ep, headers=headers)
                    if r.status_code == 200:
                        content = r.json()
                        size = len(content) if isinstance(content, (list, dict)) else 0
                        print(f"  [PASS] {desc:32} ({ep:32}) -> 200 OK | Data keys/items: {size}")
                    else:
                        print(f"  [FAIL] {desc:32} ({ep:32}) -> HTTP {r.status_code}: {r.text[:100]}")
                        all_passed = False
                except Exception as e:
                    print(f"  [FAIL] {desc:32} ({ep:32}) -> Exception: {e}")
                    all_passed = False

    print("\n=========================================================")
    if all_passed:
        print("[SUCCESS] ALL AUTHENTICATION & DASHBOARD DYNAMIC DATA FLOWS PASSED!")
    else:
        print("[!] SOME DASHBOARD FLOWS ENCOUNTERED ISSUES.")
    print("=========================================================")
    assert all_passed, "Some authentication or dashboard flows failed."

if __name__ == "__main__":
    asyncio.run(test_auth_and_dashboards())
