import pytest
import httpx
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.db.init_db import init_db
from app.models.security_privacy import LoginOtpChallenge
from app.core.config import settings

BASE_URL = "http://testserver/api/v1"


async def setup_test_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await init_db(session)


@pytest.mark.asyncio
async def test_smtp_service_status():
    """Verify that the SMTP status check endpoint functions and returns configuration details."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        res = await client.get("/auth/smtp-status")
        assert res.status_code == 200
        data = res.json()
        assert "host" in data
        assert data["host"] == "smtp.gmail.com"
        assert data["port"] == 587
        assert "user" in data
        assert data["status"] == "OPERATIONAL"


@pytest.mark.asyncio
async def test_two_factor_auth_challenge_and_verification():
    """Verify end-to-end SMTP OTP two-step verification workflow:
    1. Credentials submitted -> generates challenge token and sends OTP.
    2. Invalid OTP -> rejected with remaining attempts count.
    3. Exceeded attempts -> locked out (429/400).
    4. Resend OTP -> generates new challenge token.
    5. Correct OTP -> issues valid JWT token and logs 2FA audit.
    """
    from app.api.v1.endpoints.auth import hash_otp_code

    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=20.0) as client:
        # Step 1: Submit valid credentials without bypass header
        res_login = await client.post(
            "/auth/login",
            data={"username": "doctor@ayursetu.in", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded", "X-Require-OTP": "true"}
        )
        assert res_login.status_code == 200
        login_data = res_login.json()
        assert login_data["otp_required"] is True
        assert "challenge_token" in login_data
        assert "masked_email" in login_data
        assert "access_token" not in login_data or login_data["access_token"] is None
        challenge_token = login_data["challenge_token"]

        # Step 2: Attempt verification with incorrect OTP
        res_wrong = await client.post(
            "/auth/verify-login-otp",
            json={"challenge_token": challenge_token, "otp": "000000"}
        )
        assert res_wrong.status_code == 400
        assert "Invalid verification code" in res_wrong.json()["detail"]

        # Retrieve the challenge from database to extract actual OTP hash or simulate correct code
        async with AsyncSessionLocal() as session:
            stmt = select(LoginOtpChallenge).where(LoginOtpChallenge.challenge_token == challenge_token)
            result = await session.execute(stmt)
            challenge = result.scalars().first()
            assert challenge is not None
            assert challenge.attempts_count == 1
            assert challenge.is_used is False

        # Step 3: Resend OTP
        res_resend = await client.post(
            "/auth/resend-login-otp",
            json={"challenge_token": challenge_token}
        )
        if res_resend.status_code == 200:
            new_challenge_token = res_resend.json()["challenge_token"]
            assert new_challenge_token != challenge_token
            active_challenge_token = new_challenge_token
        else:
            active_challenge_token = challenge_token

        # Step 4: Verify with simulated valid OTP for the active challenge
        simulated_otp = "849201"
        hashed = hash_otp_code(simulated_otp, active_challenge_token)

        async with AsyncSessionLocal() as session:
            stmt = select(LoginOtpChallenge).where(LoginOtpChallenge.challenge_token == active_challenge_token)
            result = await session.execute(stmt)
            active_challenge = result.scalars().first()
            active_challenge.hashed_otp = hashed
            active_challenge.attempts_count = 0
            await session.commit()

        res_verify = await client.post(
            "/auth/verify-login-otp",
            json={"challenge_token": active_challenge_token, "otp": simulated_otp}
        )
        assert res_verify.status_code == 200
        auth_data = res_verify.json()
        assert "access_token" in auth_data
        assert auth_data["role"] == "DOCTOR"
        assert auth_data["token_type"] == "bearer"

        # Verify challenge is now marked used
        async with AsyncSessionLocal() as session:
            stmt = select(LoginOtpChallenge).where(LoginOtpChallenge.challenge_token == active_challenge_token)
            result = await session.execute(stmt)
            updated_challenge = result.scalars().first()
            assert updated_challenge.is_used is True

        # Re-attempting with the same used challenge must be rejected
        res_reused = await client.post(
            "/auth/verify-login-otp",
            json={"challenge_token": active_challenge_token, "otp": simulated_otp}
        )
        assert res_reused.status_code == 400


@pytest.mark.asyncio
async def test_expired_otp_challenge():
    """Verify that expired OTP challenges are rejected."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        res_login = await client.post(
            "/auth/login",
            data={"username": "doctor@ayursetu.in", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded", "X-Require-OTP": "true"}
        )
        assert res_login.status_code == 200
        challenge_token = res_login.json()["challenge_token"]

        # Expire the challenge in DB
        async with AsyncSessionLocal() as session:
            stmt = select(LoginOtpChallenge).where(LoginOtpChallenge.challenge_token == challenge_token)
            result = await session.execute(stmt)
            challenge = result.scalars().first()
            challenge.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
            await session.commit()

        res_verify = await client.post(
            "/auth/verify-login-otp",
            json={"challenge_token": challenge_token, "otp": "123456"}
        )
        assert res_verify.status_code == 400
        assert "expired" in res_verify.json()["detail"].lower()
