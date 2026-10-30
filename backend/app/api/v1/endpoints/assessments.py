import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker
from app.schemas.assessment import (
    AssessmentQuestionOut,
    AssessmentOptionOut,
    AssessmentStartOut,
    AssessmentAnswerSave,
    AssessmentResultOut,
    AssessmentHistoryItem,
    CareerRoleSimple,
)
from app.services.assessment_service import assessment_service

router = APIRouter()

def build_question_out(question) -> AssessmentQuestionOut:
    options_out = [
        AssessmentOptionOut(
            id=opt.id,
            option_text=opt.option_text,
            option_order=opt.option_order
        )
        for opt in question.options
    ]
    options_out.sort(key=lambda x: x.option_order)

    return AssessmentQuestionOut(
        id=question.id,
        question_text=question.question_text,
        question_type=question.question_type,
        category=question.category,
        difficulty=question.difficulty,
        weight=question.weight or 1.0,
        options=options_out
    )

@router.post("/start", response_model=AssessmentStartOut)
async def start_assessment(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    attempt = await assessment_service.start_assessment(db, current_user.id)
    questions_out = [build_question_out(aq.question) for aq in attempt.attempt_questions]

    return AssessmentStartOut(
        attempt_id=attempt.id,
        career_role=CareerRoleSimple.model_validate(attempt.career_role),
        questions=questions_out,
        started_at=attempt.started_at,
        total_questions=len(questions_out),
        status=attempt.status
    )

@router.get("/current", response_model=Optional[AssessmentStartOut])
async def get_current_assessment(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    attempt = await assessment_service.get_current_assessment(db, current_user.id)
    if not attempt:
        return None

    questions_out = [build_question_out(aq.question) for aq in attempt.attempt_questions]

    return AssessmentStartOut(
        attempt_id=attempt.id,
        career_role=CareerRoleSimple.model_validate(attempt.career_role),
        questions=questions_out,
        started_at=attempt.started_at,
        total_questions=len(questions_out),
        status=attempt.status
    )

@router.get("/history", response_model=List[AssessmentHistoryItem])
async def get_assessment_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    attempts = await assessment_service.get_assessment_history(db, current_user.id)
    return [
        AssessmentHistoryItem(
            attempt_id=att.id,
            career_role=CareerRoleSimple.model_validate(att.career_role),
            overall_score=att.overall_score,
            status=att.status,
            started_at=att.started_at,
            submitted_at=att.submitted_at
        )
        for att in attempts
    ]

@router.get("/{attempt_id}", response_model=AssessmentStartOut)
async def get_assessment_attempt(
    attempt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    attempt = await assessment_service.get_attempt_by_id(db, attempt_id, current_user.id)
    questions_out = [build_question_out(aq.question) for aq in attempt.attempt_questions]

    return AssessmentStartOut(
        attempt_id=attempt.id,
        career_role=CareerRoleSimple.model_validate(attempt.career_role),
        questions=questions_out,
        started_at=attempt.started_at,
        total_questions=len(questions_out),
        status=attempt.status
    )

@router.post("/{attempt_id}/answers")
async def save_answer(
    attempt_id: uuid.UUID,
    body: AssessmentAnswerSave,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    ans = await assessment_service.save_answer(
        db,
        current_user.id,
        attempt_id,
        body.question_id,
        body.selected_option_id
    )
    return {"message": "Answer saved successfully", "question_id": ans.question_id, "selected_option_id": ans.selected_option_id}

@router.post("/{attempt_id}/submit", response_model=AssessmentResultOut)
async def submit_assessment(
    attempt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    res = await assessment_service.submit_assessment(db, current_user.id, attempt_id)
    return AssessmentResultOut(
        attempt_id=res["attempt_id"],
        career_role=CareerRoleSimple.model_validate(res["career_role"]),
        overall_score=res["overall_score"],
        categories=res["categories"],
        skills=res["skills"],
        strengths=res["strengths"],
        weaknesses=res["weaknesses"],
        started_at=res["started_at"],
        submitted_at=res["submitted_at"]
    )

@router.get("/{attempt_id}/result", response_model=AssessmentResultOut)
async def get_assessment_result(
    attempt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT]))
):
    res = await assessment_service.get_assessment_result(db, current_user.id, attempt_id)
    return AssessmentResultOut(
        attempt_id=res["attempt_id"],
        career_role=CareerRoleSimple.model_validate(res["career_role"]),
        overall_score=res["overall_score"],
        categories=res["categories"],
        skills=res["skills"],
        strengths=res["strengths"],
        weaknesses=res["weaknesses"],
        started_at=res["started_at"],
        submitted_at=res["submitted_at"]
    )
