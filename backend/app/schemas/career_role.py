from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4
from app.models.domain import CareerCategory

class CareerRoleBase(BaseModel):
    name: str = Field(..., max_length=150)
    slug: str = Field(..., max_length=150)
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: CareerCategory = CareerCategory.AYURVEDA_PHARMACEUTICAL
    domain: Optional[str] = Field(None, max_length=100)
    is_active: bool = True
    display_order: int = 0

class CareerRoleCreate(CareerRoleBase):
    pass

class CareerRoleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    slug: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: Optional[CareerCategory] = None
    domain: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class CareerRoleOut(CareerRoleBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TargetCareerSet(BaseModel):
    career_role_id: UUID4

class TargetCareerResponse(BaseModel):
    target_career: Optional[CareerRoleOut] = None
