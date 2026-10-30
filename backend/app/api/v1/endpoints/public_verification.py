from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.verification_service import VerificationService
from app.schemas.verification import PublicVerificationOut

router = APIRouter()

@router.get("/verifications/{public_token}", response_model=PublicVerificationOut)
async def get_public_verification_proof(
    public_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve safe public verification proof by public_token.
    
    No authentication required. Strict allowlist output (zero private files or reviewer notes).
    """
    return await VerificationService.get_public_verification(db, public_token)
