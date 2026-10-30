import pytest
import httpx
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.db.init_db import init_db
from app.models.user import User, UserRole
from app.models.security_privacy import LoginOtpChallenge
from app.api.v1.endpoints.auth import validate_gmail_address, hash_otp_code
from app.core.security import create_access_token

BASE_URL = "http://testserver/api/v1"


async def setup_test_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await init_db(session)


# -------------------------------------------------------------
# 1. SUCCESSFUL GMAIL REGISTRATION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_01_successful_gmail_registration():
    """Verify that email registration succeeds for a valid, normalized @gmail.com address."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        test_email = f"ayur.student.{uid}@gmail.com"
        res = await client.post(
            "/auth/register",
            json={
                "email": f"  {test_email.upper()}  ",  # Tests trimming & lowercasing
                "password": "Password123!",
                "role": "STUDENT",
                "first_name": "Ayur",
                "last_name": "Veda",
                "full_name": "Ayur Veda"
            }
        )
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == test_email.lower()
        assert data["role"] == "STUDENT"


# -------------------------------------------------------------
# 2. SUCCESSFUL GMAIL LOGIN
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_02_successful_gmail_login():
    """Verify that a registered Gmail user can successfully log in with password."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        test_email = f"login.test.{uid}@gmail.com"
        # Register
        reg_res = await client.post(
            "/auth/register",
            json={
                "email": test_email,
                "password": "SecurePassword123!",
                "role": "STUDENT",
                "first_name": "Login",
                "last_name": "Student",
                "full_name": "Login Student"
            }
        )
        assert reg_res.status_code == 201

        # Login with X-Bypass-OTP to test credentials authentication
        res = await client.post(
            "/auth/login",
            data={"username": test_email, "password": "SecurePassword123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded", "X-Bypass-OTP": "true"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["email"] == test_email


# -------------------------------------------------------------
# 3. SUCCESSFUL GOOGLE SIGN-IN
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_03_successful_google_signin():
    """Verify Google Sign-In automatically creates a student account when user does not exist."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        new_email = f"google.student.{uid}@gmail.com"
        gsub = f"gsub_{uid}"
        mock_token = f"mock_google_token:{new_email}:Google Student:{gsub}"

        res = await client.post(
            "/auth/google",
            json={"id_token": mock_token, "role": "STUDENT"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == new_email
        assert "access_token" in data
        assert data["role"] == "STUDENT"

        # Verify DB persistence
        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.email == new_email)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            assert user is not None
            assert user.google_id == gsub
            assert user.auth_provider == "GOOGLE"
            assert user.is_verified is True


# -------------------------------------------------------------
# 4. INVALID GOOGLE TOKEN
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_04_invalid_google_token():
    """Verify invalid or unverified Google token is rejected with HTTP 400."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        res = await client.post(
            "/auth/google",
            json={"id_token": "mock_google_token_invalid_format"}
        )
        assert res.status_code == 400
        assert "Google authentication failed" in res.json()["detail"]


# -------------------------------------------------------------
# 5. NON-GMAIL ACCOUNT REJECTION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_05_non_gmail_account_rejection():
    """Verify registration and Google Sign-In reject non-Gmail accounts."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # 1. Email registration rejection
        res_email = await client.post(
            "/auth/register",
            json={
                "email": "doctor@yahoo.com",
                "password": "Password123!",
                "role": "DOCTOR",
                "first_name": "Doctor",
                "last_name": "Yahoo",
                "full_name": "Dr. Doctor Yahoo"
            }
        )
        assert res_email.status_code == 400
        assert "@gmail.com" in res_email.json()["detail"]

        # 2. Google token claiming non-Gmail address
        mock_token = f"mock_google_token:student@outlook.com:Outlook User:gsub_outlook_123"
        res_google = await client.post(
            "/auth/google",
            json={"id_token": mock_token}
        )
        assert res_google.status_code == 400
        assert "@gmail.com" in res_google.json()["detail"]


# -------------------------------------------------------------
# 6. UNVERIFIED EMAIL REJECTION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_06_unverified_email_rejection():
    """Verify Google token with unverified email is rejected."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        mock_token = f"mock_google_token?email=unverified@gmail.com&email_verified=false"
        res = await client.post(
            "/auth/google",
            json={"id_token": mock_token}
        )
        assert res.status_code == 400
        assert "not verified by Google" in res.json()["detail"]


# -------------------------------------------------------------
# 7. DUPLICATE ACCOUNT PREVENTION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_07_duplicate_account_prevention():
    """Verify duplicate email registration is rejected with HTTP 400."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        dup_email = f"dup.check.{uid}@gmail.com"

        reg1 = await client.post(
            "/auth/register",
            json={
                "email": dup_email,
                "password": "Password123!",
                "role": "STUDENT",
                "first_name": "Dup",
                "last_name": "One",
                "full_name": "Dup One"
            }
        )
        assert reg1.status_code == 201

        reg2 = await client.post(
            "/auth/register",
            json={
                "email": dup_email,
                "password": "Password123!",
                "role": "STUDENT",
                "first_name": "Dup",
                "last_name": "Two",
                "full_name": "Dup Two"
            }
        )
        assert reg2.status_code == 400
        assert "already" in reg2.json()["detail"].lower()


# -------------------------------------------------------------
# 8. ACCOUNT LINKING
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_08_account_linking():
    """Verify Google Sign-In links to an existing verified user account without duplicates."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        link_email = f"link.user.{uid}@gmail.com"
        gsub = f"gsub_link_{uid}"

        # 1. Register user locally first
        res_reg = await client.post(
            "/auth/register",
            json={
                "email": link_email,
                "password": "SecurePassword123!",
                "role": "STUDENT",
                "first_name": "Link",
                "last_name": "User",
                "full_name": "Link User"
            }
        )
        assert res_reg.status_code == 201
        registered_id = res_reg.json()["id"]

        # 2. Authenticate with Google using same email
        mock_token = f"mock_google_token:{link_email}:Link User:{gsub}"
        res_google = await client.post(
            "/auth/google",
            json={"id_token": mock_token}
        )
        assert res_google.status_code == 200
        data = res_google.json()
        assert data["email"] == link_email
        assert data["user_id"] == registered_id

        # 3. Check DB to ensure linked, and no duplicate user was created
        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.email == link_email)
            result = await session.execute(stmt)
            users = result.scalars().all()
            assert len(users) == 1
            assert users[0].google_id == gsub


# -------------------------------------------------------------
# 9. OTP VERIFICATION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_09_otp_verification():
    """Verify Google Sign-In respects OTP 2FA challenge when required."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=20.0) as client:
        uid = uuid.uuid4().hex[:8]
        otp_email = f"otp.google.{uid}@gmail.com"
        gsub = f"gsub_otp_{uid}"
        mock_token = f"mock_google_token:{otp_email}:OTP User:{gsub}"

        # Request with X-Require-OTP header
        res_google = await client.post(
            "/auth/google",
            json={"id_token": mock_token},
            headers={"X-Require-OTP": "true"}
        )
        assert res_google.status_code == 200
        otp_challenge = res_google.json()
        assert otp_challenge["otp_required"] is True
        assert "challenge_token" in otp_challenge
        challenge_token = otp_challenge["challenge_token"]

        # Retrieve challenge and simulate correct OTP input
        simulated_otp = "654321"
        hashed = hash_otp_code(simulated_otp, challenge_token)
        async with AsyncSessionLocal() as session:
            stmt = select(LoginOtpChallenge).where(LoginOtpChallenge.challenge_token == challenge_token)
            challenge = (await session.execute(stmt)).scalar_one()
            challenge.hashed_otp = hashed
            await session.commit()

        # Submit OTP to complete 2FA
        res_verify = await client.post(
            "/auth/verify-login-otp",
            json={"challenge_token": challenge_token, "otp": simulated_otp}
        )
        assert res_verify.status_code == 200
        auth_data = res_verify.json()
        assert auth_data["email"] == otp_email
        assert "access_token" in auth_data


# -------------------------------------------------------------
# 10. SECURE LOGOUT & UNAUTHORIZED ACCESS
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_10_secure_logout_and_unauthorized_access():
    """Verify protected endpoints reject requests without a valid session token."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # Attempt to access protected endpoint without Authorization header
        res_unauth = await client.get("/auth/me")
        assert res_unauth.status_code == 401

        # Attempt to access with malformed header
        res_invalid = await client.get("/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
        assert res_invalid.status_code == 401


# -------------------------------------------------------------
# 11. ROLE-BASED ACCESS & PRIVILEGE ESCALATION PREVENTION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_11_role_security_and_privilege_escalation_prevention():
    """Verify Google Sign-In defaults strictly to STUDENT role and cannot self-grant ADMIN or DOCTOR."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        admin_email = f"attempt.admin.{uid}@gmail.com"
        gsub = f"gsub_admin_attempt_{uid}"
        mock_token = f"mock_google_token:{admin_email}:Privilege Attempter:{gsub}"

        # Attempt to sign up requesting ADMIN role
        res = await client.post(
            "/auth/google",
            json={"id_token": mock_token, "role": "ADMIN"}
        )
        assert res.status_code == 200
        data = res.json()
        # Role must be strictly STUDENT - self-elevation prohibited
        assert data["role"] == "STUDENT"

        # Verify DB role is STUDENT
        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.email == admin_email)
            user = (await session.execute(stmt)).scalar_one()
            assert user.role == UserRole.STUDENT


# -------------------------------------------------------------
# 12. PROTECTED PAGE ACCESS
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_12_protected_page_access():
    """Verify that an authenticated Google user can access protected endpoints."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        uid = uuid.uuid4().hex[:8]
        email = f"protected.access.{uid}@gmail.com"
        mock_token = f"mock_google_token:{email}:Protected User:gsub_{uid}"

        # 1. Sign in with Google
        res_login = await client.post("/auth/google", json={"id_token": mock_token})
        assert res_login.status_code == 200
        token = res_login.json()["access_token"]

        # 2. Access protected /auth/me
        res_me = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res_me.status_code == 200
        user_info = res_me.json()
        assert user_info["email"] == email


# -------------------------------------------------------------
# 13. SESSION EXPIRATION
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_13_session_expiration():
    """Verify expired access token is rejected with HTTP 401."""
    await setup_test_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL, timeout=15.0) as client:
        # Create an expired token (expires_delta = -10 minutes)
        expired_token = create_access_token(
            subject=uuid.uuid4(),
            role="STUDENT",
            expires_delta=timedelta(minutes=-10)
        )

        res = await client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert res.status_code == 401
        assert "Could not validate credentials" in res.json()["detail"]


# -------------------------------------------------------------
# 14. FRONTEND AND BACKEND VALIDATION RULES
# -------------------------------------------------------------
def test_14_frontend_and_backend_validation():
    """Verify email normalization, character rules, and Gmail domain checks."""
    # Valid Gmail variations
    assert validate_gmail_address("Student.Ayur@Gmail.com") == "student.ayur@gmail.com"
    assert validate_gmail_address("  faculty.ayush+tag@gmail.com  ") == "faculty.ayush+tag@gmail.com"
    assert validate_gmail_address("researcher123@gmail.com") == "researcher123@gmail.com"

    # Non-Gmail domains rejected
    with pytest.raises(Exception) as exc1:
        validate_gmail_address("student@yahoo.com")
    assert "@gmail.com" in str(exc1.value)

    with pytest.raises(Exception) as exc2:
        validate_gmail_address("faculty@outlook.com")
    assert "@gmail.com" in str(exc2.value)

    with pytest.raises(Exception):
        validate_gmail_address("admin@ayursetu.edu.invalid")

    with pytest.raises(Exception):
        validate_gmail_address("invalid-email")
