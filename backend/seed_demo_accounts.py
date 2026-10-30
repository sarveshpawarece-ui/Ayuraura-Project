import asyncio
import uuid
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.domain import (
    StudentProfile,
    IndustryProfile,
    InstitutionProfile,
    FacultyProfile,
    OrganizationType,
    VerificationStatus,
    InstitutionType,
)

DEMO_USERS = [
    {
        "email": "student@ayursetu.in",
        "password": "password123",
        "role": UserRole.STUDENT,
        "full_name": "Priya Sharma",
        "degree": "BAMS 4th Year",
        "college": "National Institute of Ayurveda, Jaipur",
        "city": "Jaipur",
        "state": "Rajasthan"
    },
    {
        "email": "doctor@ayursetu.in",
        "password": "password123",
        "role": UserRole.DOCTOR,
        "full_name": "Dr. Rajesh Varma, BAMS, MD",
        "specialization": "Kayachikitsa & Panchakarma",
        "city": "New Delhi",
        "state": "Delhi"
    },
    {
        "email": "industry@ayursetu.in",
        "password": "password123",
        "role": UserRole.INDUSTRY,
        "company_name": "Himalaya Wellness Research Labs",
        "registration_number": "CIN-U24233KA1930PTC001234",
        "domain": "Ayurvedic Herbal Research & Standardization",
        "location": "Bengaluru, Karnataka"
    },
    {
        "email": "institute@ayursetu.in",
        "password": "password123",
        "role": UserRole.INSTITUTION,
        "institution_name": "National Institute of Ayurveda, Jaipur",
        "aishe_code": "AISHE-C-24150",
        "state": "Rajasthan",
        "city": "Jaipur"
    },
    {
        "email": "admin@ayursetu.in",
        "password": "password123",
        "role": UserRole.ADMIN,
        "full_name": "AyurSetu Platform Administrator",
        "city": "New Delhi",
        "state": "Delhi"
    }
]

from app.models.doctor_ngo import DoctorProfile

async def seed():
    async with AsyncSessionLocal() as session:
        print("[+] Seeding demo accounts into database...")
        for u_data in DEMO_USERS:
            res = await session.execute(select(User).where(User.email == u_data["email"]))
            existing = res.scalars().first()
            if existing:
                print(f"  Updating password/status for existing user: {u_data['email']}")
                existing.hashed_password = get_password_hash(u_data["password"])
                existing.is_active = True
                existing.is_verified = True
                continue

            user = User(
                id=uuid.uuid4(),
                email=u_data["email"],
                hashed_password=get_password_hash(u_data["password"]),
                role=u_data["role"],
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            await session.flush()

            if u_data["role"] == UserRole.STUDENT:
                prof = StudentProfile(
                    user_id=user.id,
                    full_name=u_data["full_name"],
                    first_name=u_data["full_name"].split()[0],
                    last_name=" ".join(u_data["full_name"].split()[1:]) if len(u_data["full_name"].split()) > 1 else "",
                    degree_program=u_data.get("degree", "BAMS"),
                    college_name=u_data.get("college", "Ayurvedic Medical College"),
                    city=u_data.get("city", "Jaipur"),
                    state=u_data.get("state", "Rajasthan"),
                )
                session.add(prof)
            elif u_data["role"] == UserRole.INDUSTRY:
                prof = IndustryProfile(
                    user_id=user.id,
                    company_name=u_data["company_name"],
                    registration_number=u_data.get("registration_number", "CIN-IND-1001"),
                    industry_domain=u_data.get("domain", "Herbal R&D"),
                    location=u_data.get("location", "Bengaluru"),
                    organization_type=OrganizationType.AYURVEDIC_COMPANY,
                    verification_status=VerificationStatus.VERIFIED,
                )
                session.add(prof)
            elif u_data["role"] == UserRole.INSTITUTION:
                prof = InstitutionProfile(
                    user_id=user.id,
                    institution_name=u_data["institution_name"],
                    aishe_code=u_data.get("aishe_code", "AISHE-10101"),
                    institution_type=InstitutionType.INSTITUTE,
                    city=u_data.get("city", "Jaipur"),
                    state=u_data.get("state", "Rajasthan"),
                    verification_status=VerificationStatus.VERIFIED,
                )
                session.add(prof)
            elif u_data["role"] == UserRole.DOCTOR:
                prof = DoctorProfile(
                    user_id=user.id,
                    full_name=u_data["full_name"],
                    registration_number=f"DOC-{user.id.hex[:6].upper()}",
                    state_medical_council="Delhi Bharatiya Chikitsa Parishad",
                    qualification="BAMS, MD (Ayurveda)",
                    specialization=u_data.get("specialization", "Kayachikitsa & Panchakarma"),
                    years_of_experience=8,
                    city=u_data.get("city", "New Delhi"),
                    state=u_data.get("state", "Delhi"),
                    verification_status=VerificationStatus.VERIFIED,
                )
                session.add(prof)

            print(f"  [OK] Created demo user: {u_data['email']} ({u_data['role'].value})")

        await session.commit()
        print("[SUCCESS] Demo accounts seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
