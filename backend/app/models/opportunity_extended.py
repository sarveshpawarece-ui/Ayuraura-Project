import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 40 — EXTENDED OPPORTUNITY BOOKMARKS MODEL
# ============================================================

class StudentOpportunityBookmark(Base):
    __tablename__ = "student_opportunity_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("industry_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("student_id", "opportunity_id", name="uq_student_opportunity_bookmark"),)
