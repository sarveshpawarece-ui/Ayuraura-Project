from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_assistant_service import AIAssistantService
from app.schemas.ai_career import (
    AIChatMessageIn,
    AIChatResponseOut,
    ResumeAnalysisOut,
    InterviewCoachIn,
    InterviewCoachOut,
    StudyAssistantIn,
    StudyAssistantOut
)

router = APIRouter()

@router.post("/chat", response_model=AIChatResponseOut)
async def ai_chat(
    data: AIChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIAssistantService.chat(db, current_user, data.message, data.session_id)

@router.post("/resume-analysis", response_model=ResumeAnalysisOut)
async def analyze_resume(
    resume_text: str = Query(...),
    target_role: str = Query("Clinical Ayurvedic Specialist"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIAssistantService.analyze_resume(db, current_user, resume_text, target_role)

@router.post("/interview-coach", response_model=InterviewCoachOut)
async def interview_coach(
    data: InterviewCoachIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AIAssistantService.coach_interview_answer(db, data.question, data.answer)

@router.post("/study-assistant", response_model=StudyAssistantOut)
async def study_assistant(
    data: StudyAssistantIn,
    db: AsyncSession = Depends(get_db)
):
    return await AIAssistantService.study_assistant(db, data.question)
