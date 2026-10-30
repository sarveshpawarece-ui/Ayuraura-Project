from fastapi import APIRouter, Depends
from app.models.user import User, UserRole
from app.api.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/student")
async def demo_student_rbac(current_user: User = Depends(RoleChecker([UserRole.STUDENT]))):
    return {"message": "Access granted to Student resource", "user_id": str(current_user.id), "role": current_user.role.value}

@router.get("/faculty")
async def demo_faculty_rbac(current_user: User = Depends(RoleChecker([UserRole.FACULTY]))):
    return {"message": "Access granted to Faculty resource", "user_id": str(current_user.id), "role": current_user.role.value}

@router.get("/industry")
async def demo_industry_rbac(current_user: User = Depends(RoleChecker([UserRole.INDUSTRY]))):
    return {"message": "Access granted to Industry resource", "user_id": str(current_user.id), "role": current_user.role.value}

@router.get("/institution")
async def demo_institution_rbac(current_user: User = Depends(RoleChecker([UserRole.INSTITUTION]))):
    return {"message": "Access granted to Institution resource", "user_id": str(current_user.id), "role": current_user.role.value}

@router.get("/admin")
async def demo_admin_rbac(current_user: User = Depends(RoleChecker([UserRole.ADMIN]))):
    return {"message": "Access granted to Admin resource", "user_id": str(current_user.id), "role": current_user.role.value}
