import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

# ============================================================
# PHASE 46 — 3D AYURVEDA & INTERACTIVE ANATOMY MODELS
# ============================================================

class Ayurveda3DModel(Base):
    __tablename__ = "ayurveda_3d_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_code = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(50), default="MARMA_POINTS", nullable=False, index=True)  # MARMA_POINTS, SROTAS_SYSTEM, DOSHA_SEATS, BOTANICAL_HERB
    description = Column(Text, nullable=False)
    curriculum_level = Column(String(50), default="BAMS_1ST_YEAR", nullable=False)
    body_region = Column(String(50), default="FULL_BODY", nullable=False, index=True)  # HEAD_NECK, THORAX, ABDOMEN, EXTREMITIES, FULL_BODY
    model_asset_url = Column(String(500), nullable=True)
    hotspots_data = Column(JSON, default=list, nullable=False)  # [{name, devanagari, coordinates: [x,y,z], notes, structure}]
    learning_points = Column(JSON, default=list, nullable=False)
    classical_citations = Column(JSON, default=list, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
