from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    rbac,
    students,
    career_roles,
    assessments,
    skills,
    recommendations,
    opportunities,
    applications,
    analytics,
    industry,
    institution,
    portfolio,
    public_portfolio,
    admin,
    verification,
    admin_verification,
    public_verification,
    camps,
    doctor_ngo,
    internships_extended,
    ai_assistant,
    learning_knowledge,
    community_extended,
    expert_guidance,
    topic_quiz,
    bams_ecosystem,
    ai_ecosystem,
    bams_learning,
    faculty,
    community_collaboration,
    monitoring
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(rbac.router, prefix="/rbac", tags=["RBAC Demonstration"])
api_router.include_router(students.router, prefix="/students", tags=["Student Profile"])
api_router.include_router(career_roles.router, prefix="/career-roles", tags=["Target Career Roles"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Student Skill Assessment"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills & Gap Engine"])
api_router.include_router(recommendations.router, tags=["Recommendation Engine"])
api_router.include_router(opportunities.router, tags=["Industry Opportunities Engine"])

api_router.include_router(applications.router, tags=["Application Management"])
api_router.include_router(industry.router, prefix="/industry", tags=["Industry Dashboard"])
api_router.include_router(institution.router, prefix="/institution", tags=["Institution Dashboard"])
api_router.include_router(portfolio.router, prefix="/student/portfolio", tags=["Student Portfolio"])
api_router.include_router(verification.router, prefix="/student/verifications", tags=["Student Verification System"])
api_router.include_router(public_portfolio.router, prefix="/public", tags=["Public Portfolio"])
api_router.include_router(public_verification.router, prefix="/public", tags=["Public Verification Proof"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Verification"])
api_router.include_router(admin_verification.router, prefix="/admin/verifications", tags=["Admin Verification Queue"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Placement"])

# Extended Phase 17–50 Routers
api_router.include_router(camps.router, prefix="/camps", tags=["Healthcare Camps & Coordination"])
api_router.include_router(doctor_ngo.router, tags=["Doctor & NGO Platform"])
api_router.include_router(internships_extended.router, prefix="/internships", tags=["Internship Lifecycle"])
api_router.include_router(ai_assistant.router, prefix="/ai", tags=["AI Career Assistant & Coaching"])
api_router.include_router(learning_knowledge.router, prefix="/learning", tags=["Learning Hub, Shlokas & Practice"])
api_router.include_router(community_extended.router, tags=["Community, Events, Forum, Herbs & Volunteers"])
api_router.include_router(expert_guidance.router, tags=["Expert Guidance & Live Sessions"])
api_router.include_router(topic_quiz.router, tags=["Topic-Based Quiz System"])
api_router.include_router(bams_ecosystem.router, prefix="/bams-ecosystem", tags=["BAMS Learning Ecosystem & Remediation Engine"])
api_router.include_router(ai_ecosystem.router, prefix="/ai-ecosystem", tags=["Unified AI Ecosystem"])
api_router.include_router(bams_learning.router, prefix="/bams-learning", tags=["BAMS Curriculum & Student Learning System"])
api_router.include_router(faculty.router, prefix="/faculty", tags=["Faculty Dashboard & Learning Management"])
api_router.include_router(community_collaboration.router, tags=["Community, Sessions & Collaboration"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Platform Monitoring, Health & Issue Resolution"])
