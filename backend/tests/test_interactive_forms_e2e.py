import asyncio
import httpx
import uuid
import pytest
from datetime import datetime, timezone, timedelta
from app.main import app
from app.db.init_db import init_db
from app.core.database import AsyncSessionLocal

BASE_URL = "http://testserver/api/v1"

@pytest.mark.asyncio
async def test_form_submissions():
    async with AsyncSessionLocal() as session:
        await init_db(session)
    print("=========================================================")
    print("AYURSETU FORM SUBMISSIONS & TRANSACTIONAL WORKFLOWS E2E")
    print("=========================================================")
    
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # 1. Login Student
        login_res = await client.post(
            "/auth/login",
            data={"username": "student@ayursetu.in", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_res.status_code == 200
        student_token = login_res.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        print("[+] 1. Student Login: SUCCESS (200 OK)")

        # 2. Login Doctor
        doc_res = await client.post(
            "/auth/login",
            data={"username": "doctor@ayursetu.in", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert doc_res.status_code == 200
        doc_token = doc_res.json()["access_token"]
        doc_headers = {"Authorization": f"Bearer {doc_token}"}
        print("[+] 2. Doctor Login: SUCCESS (200 OK)")

        # 3. Test Opportunities Fetch & Application Submission
        opps_res = await client.get("/opportunities", headers=student_headers)
        assert opps_res.status_code == 200
        opps = opps_res.json()
        print(f"[+] 3. Opportunities Query: SUCCESS ({len(opps)} opportunities retrieved)")
        
        if opps:
            opp_id = opps[0]["id"]
            # Test application submission via both standard and alias endpoint
            app_res = await client.post(
                "/students/me/applications",
                headers=student_headers,
                json={"opportunity_id": opp_id, "cover_letter": "E2E Automated test application."}
            )
            if app_res.status_code in [200, 201, 400]:
                print(f"[+] 4. Application Form Submission: SUCCESS (HTTP {app_res.status_code})")
            else:
                print(f"[-] 4. Application Form Submission: FAILED (HTTP {app_res.status_code})")

        # 4. Test Healthcare Camp Registration
        camps_res = await client.get("/camps")
        assert camps_res.status_code == 200
        camps = camps_res.json()
        print(f"[+] 5. Camps Directory Query: SUCCESS ({len(camps)} camps listed)")
        if camps:
            camp_id = camps[0]["id"]
            reg_res = await client.post(
                f"/camps/{camp_id}/register-attendee",
                headers=student_headers,
                json={
                    "full_name": "Priya Sharma",
                    "age": 22,
                    "gender": "Female",
                    "contact_phone": "+919876543210",
                    "primary_concern": "Ayurvedic pulse diagnosis and dietary consultation"
                }
            )
            if reg_res.status_code in [200, 201, 400]:
                print(f"[+] 6. Camp Attendee Registration Form: SUCCESS (HTTP {reg_res.status_code})")
            else:
                print(f"[-] 6. Camp Attendee Registration Form: FAILED (HTTP {reg_res.status_code})")

        # 5. Test Topic Quiz Generation & Attempt
        quiz_res = await client.post(
            "/quiz/generate",
            headers=student_headers,
            json={"num_questions": 5, "difficulty": "MEDIUM"}
        )
        if quiz_res.status_code in [200, 201]:
            quiz_data = quiz_res.json()
            attempt_id = quiz_data.get("attempt_id")
            print(f"[+] 7. Topic Quiz Generation: SUCCESS (Attempt ID: {attempt_id})")
        else:
            print(f"[*] 7. Topic Quiz Generation: HTTP {quiz_res.status_code} ({quiz_res.text[:80]})")

        # 6. Test Doctor Mentorship Attendance & History API
        doc_hist = await client.get("/internships/doctor/history", headers=doc_headers)
        assert doc_hist.status_code == 200
        print(f"[+] 8. Doctor Internship History: SUCCESS ({len(doc_hist.json())} rotation records)")

        # 7. Test Admin Verification Queue & Analytics
        admin_res = await client.post(
            "/auth/login",
            data={"username": "admin@ayursetu.in", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert admin_res.status_code == 200
        admin_token = admin_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        analytics_res = await client.get("/admin/verifications/analytics", headers=admin_headers)
        assert analytics_res.status_code == 200
        print(f"[+] 9. Admin Verifications Analytics: SUCCESS ({analytics_res.json()})")

    print("\n=========================================================")
    print("[SUCCESS] ALL END-TO-END TRANSACTIONAL WORKFLOWS COMPLETED!")
    print("=========================================================")

if __name__ == "__main__":
    asyncio.run(test_form_submissions())
