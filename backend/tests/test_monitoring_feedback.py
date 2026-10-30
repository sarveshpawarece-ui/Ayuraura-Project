import pytest
import httpx
from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.db.init_db import init_db

BASE_URL = "http://testserver/api/v1"


async def setup_test_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await init_db(session)


async def login_user(client: httpx.AsyncClient, email: str, password: str = "password123") -> str:
    res = await client.post(
        "/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded", "X-Bypass-OTP": "true"}
    )
    if res.status_code != 200:
        # Fallback to capital case password if needed
        res = await client.post(
            "/auth/login",
            data={"username": email, "password": password.capitalize()},
            headers={"Content-Type": "application/x-www-form-urlencoded", "X-Bypass-OTP": "true"}
        )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_feedback_submission_and_privacy():
    await setup_test_database()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # 1. Login as Student
        student_token = await login_user(client, "student@ayursetu.in", "password123")
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # 2. Submit Bug Report
        bug_payload = {
            "feedback_type": "BUG_REPORT",
            "category": "3D_ANATOMY",
            "title": "3D Canvas lag on mobile orientation change",
            "description": "When rotating device into landscape mode, the 3D model canvas takes 2-3 seconds to resize properly.",
            "page_url": "/anatomy",
            "device_info": "Chrome Mobile 120 / Android 14",
            "priority": "MEDIUM"
        }
        res_submit = await client.post("/monitoring/feedback", json=bug_payload, headers=student_headers)
        assert res_submit.status_code == 201
        issue_data = res_submit.json()
        assert issue_data["title"] == "3D Canvas lag on mobile orientation change"
        assert issue_data["status"] == "OPEN"
        assert issue_data["priority"] == "MEDIUM"
        issue_id = issue_data["id"]

        # 3. View my submitted issues
        res_my = await client.get("/monitoring/feedback/my", headers=student_headers)
        assert res_my.status_code == 200
        my_issues = res_my.json()
        assert any(i["id"] == issue_id for i in my_issues)

        # 4. Login as Doctor & Verify privacy (Doctor cannot see student's private feedback in my_feedback)
        doctor_token = await login_user(client, "doctor@ayursetu.in", "password123")
        doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
        res_doc_my = await client.get("/monitoring/feedback/my", headers=doctor_headers)
        assert res_doc_my.status_code == 200
        assert not any(i["id"] == issue_id for i in res_doc_my.json())

        # 5. Non-admin forbidden from admin endpoints
        res_forbidden = await client.get("/monitoring/admin/issues", headers=student_headers)
        assert res_forbidden.status_code == 403


@pytest.mark.asyncio
async def test_client_error_ingestion_and_redaction():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # Ingest error containing potential credential strings
        error_payload = {
            "error_type": "AI_TIMEOUT",
            "severity": "WARNING",
            "endpoint": "/api/v1/ai-ecosystem/chat",
            "status_code": 504,
            "error_message": "Upstream LLM gateway timed out with token Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and secret sk-1234567890abcdef12345678",
            "technical_context": {
                "component": "AIChatDrawer",
                "gemini_api_key": "AIzaSyFakeKeyDoNotLeak1234567890",
                "user_input": "Summarize Dosha imbalance"
            }
        }
        res = await client.post("/monitoring/client-errors", json=error_payload)
        assert res.status_code == 201
        err_data = res.json()
        # Verify credential was sanitized/redacted
        assert "Bearer eyJhbGci" not in err_data["error_message"]
        assert "[REDACTED" in err_data["error_message"]
        assert err_data["technical_context"]["gemini_api_key"] == "[REDACTED]"
        assert err_data["occurrence_count"] >= 1

        # Post duplicate error to test deduplication
        res_dup = await client.post("/monitoring/client-errors", json=error_payload)
        assert res_dup.status_code == 201
        dup_data = res_dup.json()
        assert dup_data["id"] == err_data["id"]
        assert dup_data["occurrence_count"] > err_data["occurrence_count"]


@pytest.mark.asyncio
async def test_extended_health_telemetry():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        res = await client.get("/monitoring/health/extended")
        assert res.status_code == 200
        telemetry = res.json()
        assert telemetry["status"] in {"HEALTHY", "DEGRADED"}
        assert "database" in telemetry
        assert telemetry["database"]["connected"] is True
        assert "ai_service" in telemetry
        assert "auth_service" in telemetry
        assert "learning_workflows" in telemetry


@pytest.mark.asyncio
async def test_admin_issue_and_error_triage():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        admin_token = await login_user(client, "admin@ayursetu.in", "password123")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. List all issues
        res_issues = await client.get("/monitoring/admin/issues", headers=admin_headers)
        assert res_issues.status_code == 200
        issues = res_issues.json()
        assert len(issues) > 0
        target_issue = issues[0]

        # 2. Update issue to IN_PROGRESS with admin notes
        update_payload = {
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "admin_notes": "Assigned to frontend performance sprint."
        }
        res_update = await client.patch(
            f"/monitoring/admin/issues/{target_issue['id']}",
            json=update_payload,
            headers=admin_headers
        )
        assert res_update.status_code == 200
        updated_data = res_update.json()
        assert updated_data["status"] == "IN_PROGRESS"
        assert updated_data["priority"] == "HIGH"
        assert updated_data["admin_notes"] == "Assigned to frontend performance sprint."

        # 3. List all errors
        res_errors = await client.get("/monitoring/admin/errors", headers=admin_headers)
        assert res_errors.status_code == 200
        errors = res_errors.json()
        assert len(errors) > 0
        target_err = errors[0]

        # 4. Mark error as RESOLVED
        res_err_update = await client.patch(
            f"/monitoring/admin/errors/{target_err['id']}",
            json={"status": "RESOLVED"},
            headers=admin_headers
        )
        assert res_err_update.status_code == 200
        assert res_err_update.json()["status"] == "RESOLVED"
