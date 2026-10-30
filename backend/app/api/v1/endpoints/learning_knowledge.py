import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.learning_knowledge_service import LearningKnowledgeService
from app.schemas.learning_hub import (
    ClassicalShlokaOut,
    StudyNoteCreateIn,
    StudyNoteOut,
    CourseCertificateOut,
    ScholarshipOut
)

router = APIRouter()

@router.get("/shlokas", response_model=List[ClassicalShlokaOut])
async def list_shlokas(
    treatise: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await LearningKnowledgeService.list_shlokas(db, treatise, subject, search)

@router.post("/notes", response_model=StudyNoteOut, status_code=status.HTTP_201_CREATED)
async def create_study_note(
    data: StudyNoteCreateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await LearningKnowledgeService.create_study_note(db, current_user, data)

@router.get("/notes", response_model=List[StudyNoteOut])
async def list_study_notes(
    subject: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await LearningKnowledgeService.list_study_notes(db, current_user, subject, search)

@router.post("/courses/{course_id}/certificate", response_model=CourseCertificateOut)
async def issue_course_certificate(
    course_id: uuid.UUID,
    score: float = Query(85.0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await LearningKnowledgeService.issue_course_certificate(db, current_user, course_id, score)

@router.get("/scholarships", response_model=List[ScholarshipOut])
async def list_scholarships(
    search: Optional[str] = Query(None),
    provider_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await LearningKnowledgeService.list_scholarships(db, search, provider_type)
