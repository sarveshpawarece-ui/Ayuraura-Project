import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.community_extended_service import CommunityExtendedService
from app.schemas.community_events_more import (
    MentorshipRequestIn,
    EventOut,
    PrivacySettingsUpdateIn,
    PrivacySettingsOut,
    MedicinalPlantOut,
    ForumPostCreateIn,
    ForumPostOut,
    NGOVolunteerOppCreateIn,
    NGOVolunteerOppOut
)

router = APIRouter()

# Mentorship
@router.post("/mentorship/request")
async def request_mentorship(
    data: MentorshipRequestIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    eng = await CommunityExtendedService.request_mentorship(db, current_user, data)
    return {"id": str(eng.id), "status": eng.status, "topic": eng.topic}

# Events
@router.get("/events", response_model=List[EventOut])
async def list_events(
    event_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await CommunityExtendedService.list_events(db, event_type)

@router.post("/events/{event_id}/register")
async def register_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = await CommunityExtendedService.register_event(db, current_user, event_id)
    return {"id": str(reg.id), "status": reg.status}

# Privacy
@router.get("/privacy/settings", response_model=PrivacySettingsOut)
async def get_privacy_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityExtendedService.get_or_create_privacy_settings(db, current_user)

@router.put("/privacy/settings", response_model=PrivacySettingsOut)
async def update_privacy_settings(
    data: PrivacySettingsUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityExtendedService.update_privacy_settings(db, current_user, data)

# Herbs
@router.get("/herbs", response_model=List[MedicinalPlantOut])
async def list_herbs(
    search: Optional[str] = Query(None),
    virya: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await CommunityExtendedService.list_herbs(db, search, virya)

# Forum
@router.get("/forum/posts", response_model=List[ForumPostOut])
async def list_forum_posts(
    category_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await CommunityExtendedService.list_forum_posts(db, category_id)

@router.post("/forum/posts", response_model=ForumPostOut, status_code=status.HTTP_201_CREATED)
async def create_forum_post(
    data: ForumPostCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityExtendedService.create_forum_post(db, current_user, data)

# NGO Volunteers
@router.post("/ngo-volunteers/opportunities", response_model=NGOVolunteerOppOut, status_code=status.HTTP_201_CREATED)
async def create_ngo_volunteer_opp(
    data: NGOVolunteerOppCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityExtendedService.create_ngo_volunteer_opp(db, current_user, data)

@router.post("/ngo-volunteers/opportunities/{opp_id}/apply")
async def apply_ngo_volunteer(
    opp_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = await CommunityExtendedService.apply_ngo_volunteer(db, current_user, opp_id)
    return {"id": str(app.id), "status": app.status}
