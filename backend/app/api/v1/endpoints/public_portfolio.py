from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.portfolio_service import PortfolioService
from app.schemas.portfolio import PublicPortfolioOut

router = APIRouter()

@router.get("/portfolio/{slug}", response_model=PublicPortfolioOut)
async def get_public_portfolio(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve published public or unlisted portfolio by slug.
    
    No authentication required. Returns 404 if private or unpublished.
    """
    return await PortfolioService.get_public_portfolio(db, slug)
