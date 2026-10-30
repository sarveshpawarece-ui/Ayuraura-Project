import asyncio
import sqlite3
import uuid
import sys
import os
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.domain import (
    StudentProfile,
    IndustryProfile,
    InstitutionProfile,
    Opportunity,
    OpportunityType,
    OpportunityStatus,
    Application,
    ApplicationStatus,
    Skill,
    SkillCategory,
    ProficiencyLevel
)
from app.models.doctor_ngo import DoctorProfile, ClinicHospitalProfile, VerificationStatus
from app.models.camps import HealthcareCamp
from app.models.topic_quiz import TopicQuizSubject, TopicQuizTopic
from app.core.security import get_password_hash, verify_password
from sqlalchemy.future import select
from sqlalchemy import text

DB_FILE = "ayursetu_dev.db"

def test_sqlite_integrity():
    print("\n--- 1.1 SQLite Pragma & Foreign Key Validation ---")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Check integrity
    cursor.execute("PRAGMA integrity_check;")
    integrity = cursor.fetchall()
    print(f"[*] PRAGMA integrity_check: {integrity[0][0] if integrity else 'None'}")
    assert integrity[0][0] == "ok", f"Integrity check failed: {integrity}"
    
    # Check foreign keys
    cursor.execute("PRAGMA foreign_key_check;")
    fk_violations = cursor.fetchall()
    print(f"[*] PRAGMA foreign_key_check violations found: {len(fk_violations)}")
    if fk_violations:
        print(f"    Sample violations: {fk_violations[:5]}")
    
    # List all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"[*] Total Tables in SQLite: {len(tables)}")
    conn.close()
    return tables, fk_violations

import pytest

@pytest.mark.asyncio
async def test_crud_lifecycle():
    print("\n--- 1.2 Asynchronous SQLAlchemy Core CRUD Lifecycle ---")
    async with AsyncSessionLocal() as session:
        test_suffix = uuid.uuid4().hex[:8]
        test_email = f"e2e_test_{test_suffix}@ayursetu.org"
        test_raw_pwd = "SecureTestPassword@123"
        hashed_pwd = get_password_hash(test_raw_pwd)
        
        # 1. CREATE USER
        user = User(
            email=test_email,
            hashed_password=hashed_pwd,
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"[+] CREATE: User created with ID: {user.id}, email: {user.email}")
        assert user.id is not None
        assert verify_password(test_raw_pwd, user.hashed_password)
        
        # 2. CREATE STUDENT PROFILE
        student_profile = StudentProfile(
            user_id=user.id,
            first_name="TestFirstName",
            last_name="TestLastName",
            college_name="National Institute of Ayurveda",
            current_year=4,
            graduation_year=2026,
            specialization="Kayachikitsa"
        )
        session.add(student_profile)
        await session.commit()
        await session.refresh(student_profile)
        print(f"[+] CREATE: StudentProfile created with ID: {student_profile.id}")
        assert student_profile.user_id == user.id
        
        # 3. READ & UPDATE STUDENT PROFILE
        stmt = select(StudentProfile).where(StudentProfile.user_id == user.id)
        res = await session.execute(stmt)
        fetched_profile = res.scalar_one_or_none()
        assert fetched_profile is not None
        fetched_profile.specialization = "Shalya Tantra"
        fetched_profile.bio = "Updated bio for E2E testing"
        await session.commit()
        await session.refresh(fetched_profile)
        print(f"[+] UPDATE: StudentProfile updated specialization: {fetched_profile.specialization}")
        assert fetched_profile.specialization == "Shalya Tantra"
        
        # 4. CREATE DOCTOR PROFILE & CLINIC
        doc_user = User(
            email=f"doc_test_{test_suffix}@ayursetu.org",
            hashed_password=hashed_pwd,
            role=UserRole.DOCTOR,
            is_active=True,
            is_verified=True
        )
        session.add(doc_user)
        await session.commit()
        await session.refresh(doc_user)
        
        doc_profile = DoctorProfile(
            user_id=doc_user.id,
            full_name="Dr. E2E Test Physician",
            registration_number=f"REG-{test_suffix}",
            state_medical_council="Delhi Bharatiya Chikitsa Parishad",
            qualification="BAMS, MD (Ayu)",
            specialization="Panchakarma",
            years_of_experience=12,
            city="New Delhi",
            state="Delhi",
            verification_status=VerificationStatus.VERIFIED
        )
        session.add(doc_profile)
        await session.commit()
        await session.refresh(doc_profile)
        print(f"[+] CREATE: DoctorProfile created with ID: {doc_profile.id}")
        
        clinic = ClinicHospitalProfile(
            owner_doctor_id=doc_profile.id,
            name="AyurSetu E2E Clinical Center",
            address="123 Health Avenue, New Delhi",
            city="New Delhi",
            state="Delhi",
            pincode="110001",
            phone="+919876543210",
            email=f"clinic_{test_suffix}@ayursetu.org"
        )
        session.add(clinic)
        await session.commit()
        await session.refresh(clinic)
        print(f"[+] CREATE: ClinicHospitalProfile created with ID: {clinic.id}")
        
        # 5. CREATE HEALTHCARE CAMP
        camp = HealthcareCamp(
            organizer_id=doc_user.id,
            organizer_name="Dr. E2E Test Physician",
            organizer_type="DOCTOR",
            title="Free Ayurvedic Pulse & Health Camp",
            description="Complete E2E checkup camp",
            camp_date=(datetime.now(timezone.utc) + timedelta(days=7)).date(),
            start_time="09:00 AM",
            end_time="05:00 PM",
            venue_name="Community Hall 4",
            address="Sector 12, RK Puram",
            city="New Delhi",
            state="Delhi",
            pincode="110001",
            capacity=300,
            contact_phone="+919876543210",
            contact_email="camp@ayursetu.org",
            status="UPCOMING"
        )
        session.add(camp)
        await session.commit()
        await session.refresh(camp)
        print(f"[+] CREATE: HealthcareCamp created with ID: {camp.id}")
        
        # 6. DELETE / CLEANUP CREATED ENTITIES
        await session.delete(camp)
        await session.delete(clinic)
        await session.delete(doc_profile)
        await session.delete(doc_user)
        await session.delete(student_profile)
        await session.delete(user)
        await session.commit()
        print("[+] DELETE: Successfully deleted test records, confirming transactional clean-up.")
        
        # Verify deletion
        stmt_verify = select(User).where(User.id == user.id)
        res_verify = await session.execute(stmt_verify)
        assert res_verify.scalar_one_or_none() is None
        print("[*] Verification: Deleted records successfully purged from database.")

async def main():
    print("==================================================")
    print("AYURSETU DATABASE INTEGRITY & CRUD E2E TEST SUITE")
    print("==================================================")
    tables, fk_violations = test_sqlite_integrity()
    await test_crud_lifecycle()
    print("\n[SUCCESS] ALL DATABASE INTEGRITY & CRUD TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
