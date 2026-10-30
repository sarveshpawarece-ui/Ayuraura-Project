import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.domain import CareerRole, CareerCategory, StudentProfile

class CareerRoleService:

    async def get_career_roles(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = True
    ) -> List[CareerRole]:
        query = select(CareerRole)

        if is_active is not None:
            query = query.where(CareerRole.is_active == is_active)

        if category:
            query = query.where(CareerRole.category == category)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.where(
                (CareerRole.name.ilike(term)) |
                (CareerRole.short_description.ilike(term)) |
                (CareerRole.description.ilike(term)) |
                (CareerRole.domain.ilike(term))
            )

        query = query.order_by(CareerRole.display_order.asc(), CareerRole.name.asc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_career_role_by_id_or_slug(self, db: AsyncSession, role_id_or_slug: str) -> Optional[CareerRole]:
        # Try parsing as UUID
        try:
            role_id = uuid.UUID(role_id_or_slug)
            result = await db.execute(select(CareerRole).where(CareerRole.id == role_id))
            role = result.scalars().first()
            if role:
                return role
        except ValueError:
            pass

        # Try matching slug
        result = await db.execute(select(CareerRole).where(CareerRole.slug == role_id_or_slug))
        return result.scalars().first()

    async def get_student_target_career(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[CareerRole]:
        result = await db.execute(
            select(StudentProfile)
            .options(selectinload(StudentProfile.target_career_role))
            .where(StudentProfile.user_id == user_id)
        )
        profile = result.scalars().first()
        if not profile:
            return None
        return profile.target_career_role

    async def set_student_target_career(
        self, db: AsyncSession, user_id: uuid.UUID, career_role_id: uuid.UUID
    ) -> CareerRole:
        # 1. Verify target career role exists and is active
        res_role = await db.execute(select(CareerRole).where(CareerRole.id == career_role_id))
        role = res_role.scalars().first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career role with ID '{career_role_id}' not found"
            )
        if not role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected career role is currently inactive"
            )

        # 2. Get or create student profile
        res_prof = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user_id))
        profile = res_prof.scalars().first()
        if not profile:
            profile = StudentProfile(user_id=user_id, full_name="")
            db.add(profile)
            await db.flush()

        # 3. Update target career reference
        profile.target_career_id = role.id
        await db.commit()
        await db.refresh(profile)

        return role

    async def clear_student_target_career(self, db: AsyncSession, user_id: uuid.UUID) -> bool:
        res_prof = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user_id))
        profile = res_prof.scalars().first()
        if profile:
            profile.target_career_id = None
            await db.commit()
        return True

career_role_service = CareerRoleService()
