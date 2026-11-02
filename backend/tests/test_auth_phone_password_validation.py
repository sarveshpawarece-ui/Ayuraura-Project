import pytest
import uuid
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_registration_valid_10_digit_phone_and_password():
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"validuser_{unique_suffix}@gmail.com"
    payload = {
        "email": email,
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Valid Test User",
        "phone": "9876543210"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["email"] == email
    assert data["role"] == "STUDENT"


def test_registration_rejects_phone_fewer_than_10_digits():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"shortphone_{unique_suffix}@gmail.com",
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Short Phone User",
        "phone": "987654321"  # 9 digits
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"
    detail = str(res.json())
    assert "10" in detail or "phone" in detail.lower()


def test_registration_rejects_phone_more_than_10_digits():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"longphone_{unique_suffix}@gmail.com",
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Long Phone User",
        "phone": "98765432101"  # 11 digits
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"
    detail = str(res.json())
    assert "10" in detail or "phone" in detail.lower()


def test_registration_rejects_phone_with_letters():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"alphaphone_{unique_suffix}@gmail.com",
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Alpha Phone User",
        "phone": "98765ABC10"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"
    detail = str(res.json())
    assert "numeric" in detail.lower() or "digit" in detail.lower() or "phone" in detail.lower()


def test_registration_rejects_phone_with_special_characters():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"symphone_{unique_suffix}@gmail.com",
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Symbol Phone User",
        "phone": "98765-43210"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"


def test_registration_rejects_password_shorter_than_8_chars():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"shortpass_{unique_suffix}@gmail.com",
        "password": "short7",  # 6 chars
        "role": "STUDENT",
        "full_name": "Short Password User",
        "phone": "9876543210"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"
    detail = str(res.json())
    assert "8" in detail or "password" in detail.lower()


def test_registration_rejects_empty_password():
    unique_suffix = uuid.uuid4().hex[:6]
    payload = {
        "email": f"emptypass_{unique_suffix}@gmail.com",
        "password": "    ",
        "role": "STUDENT",
        "full_name": "Empty Pass User",
        "phone": "9876543210"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in [400, 422], f"Expected 400/422, got {res.status_code}: {res.text}"


def test_registration_rejects_duplicate_email():
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"dupuser_{unique_suffix}@gmail.com"
    payload = {
        "email": email,
        "password": "SecurePassword123!",
        "role": "STUDENT",
        "full_name": "Original User",
        "phone": "9876543210"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code in [200, 201]

    # Duplicate registration attempt
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "registered" in res2.json()["detail"].lower() or "already" in res2.json()["detail"].lower()


def test_login_with_correct_and_incorrect_password():
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"loginuser_{unique_suffix}@gmail.com"
    correct_pwd = "CorrectPassword123!"
    wrong_pwd = "WrongPassword123!"

    # 1. Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": correct_pwd,
            "role": "STUDENT",
            "full_name": "Login Test User",
            "phone": "9876543210"
        }
    )
    assert reg.status_code in [200, 201]

    # 2. Login with incorrect password
    wrong_login = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": wrong_pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert wrong_login.status_code in [400, 401], f"Expected 400/401 for wrong pwd, got {wrong_login.status_code}"

    # 3. Login with correct password and bypass OTP header for test environment
    correct_login = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": correct_pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded", "X-Bypass-OTP": "true"}
    )
    assert correct_login.status_code == 200
    token_data = correct_login.json()
    assert "access_token" in token_data
    assert token_data["access_token"] is not None
    assert token_data["role"] == "STUDENT"


def test_two_factor_auth_challenge_issued_and_verified_with_mock_smtp():
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"otpuser_{unique_suffix}@gmail.com"
    pwd = "SecureOtpPassword123!"

    # 1. Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": pwd,
            "role": "DOCTOR",
            "full_name": "Dr. OTP User",
            "phone": "9876543210",
            "qualification": "BAMS (Bachelor of Ayurvedic Medicine & Surgery)",
            "specialization": "Kayachikitsa (General Medicine)",
            "state_medical_council": "Maharashtra Council"
        }
    )
    assert reg.status_code in [200, 201]

    # Mock EmailService.send_login_otp_email to avoid live network delay
    with patch("app.services.email_service.EmailService.send_login_otp_email", return_value=True):
        login_res = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": pwd},
            headers={"Content-Type": "application/x-www-form-urlencoded", "X-Require-OTP": "true"}
        )
        assert login_res.status_code == 200
        data = login_res.json()
        assert data.get("otp_required") is True
        assert "challenge_token" in data
        challenge_token = data["challenge_token"]

        # Reject invalid OTP
        invalid_res = client.post(
            "/api/v1/auth/verify-login-otp",
            json={"challenge_token": challenge_token, "otp": "000000"}
        )
        assert invalid_res.status_code == 400
