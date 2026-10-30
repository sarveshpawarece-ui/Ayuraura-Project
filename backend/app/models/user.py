import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    INDUSTRY = "INDUSTRY"
    INSTITUTION = "INSTITUTION"
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    NGO = "NGO"
    ALUMNI = "ALUMNI"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    auth_provider = Column(String(50), default="LOCAL", nullable=False)  # "LOCAL", "GOOGLE"
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    industry_profile = relationship("IndustryProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_profile = relationship("InstitutionProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, foreign_keys="[DoctorProfile.user_id]", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        try:
            if "student_profile" in self.__dict__ and self.student_profile and hasattr(self.student_profile, "full_name") and self.student_profile.full_name:
                return self.student_profile.full_name
            if "faculty_profile" in self.__dict__ and self.faculty_profile and hasattr(self.faculty_profile, "full_name") and self.faculty_profile.full_name:
                return self.faculty_profile.full_name
        except Exception:
            pass
        if self.email:
            name_part = self.email.split("@")[0]
            return name_part.replace(".", " ").replace("_", " ").title()
        return "Ayurvedic Contributor"
