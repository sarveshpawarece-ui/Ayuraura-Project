import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, UUID4

# ============================================================
# 1. BAMS CAREER PATHWAYS SCHEMAS
# ============================================================

class CareerPathwayMilestone(BaseModel):
    title: str
    target_stage: str # e.g. "2nd-3rd Year BAMS", "Internship Year", "Post-Graduation"
    description: str

class CareerPathwayOut(BaseModel):
    id: str
    title: str
    slug: str
    category: str # CLINICAL, ACADEMIC, RESEARCH, PUBLIC_HEALTH, MANAGEMENT, ENTREPRENEURSHIP, HIGHER_EDUCATION
    short_summary: str
    full_description: str
    eligibility_requirements: List[str]
    core_responsibilities: List[str]
    suggested_specializations: List[str]
    recommended_bams_subjects: List[str]
    certifications_and_trainings: List[str]
    typical_work_environments: List[str]
    educational_milestones: List[CareerPathwayMilestone]
    transparent_disclaimer: str = (
        "Educational career overview for planning purposes. Licensure, statutory registration with state Ayush councils, "
        "and institutional admissions depend on NCISM guidelines and respective state and central regulatory frameworks."
    )

# ============================================================
# 2. STUDENT CAREER GOALS & ACTION PLANS SCHEMAS
# ============================================================

class GoalMilestoneItem(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    title: str
    completed: bool = False
    target_date: Optional[str] = None

class StudentCareerGoalIn(BaseModel):
    title: str = Field(..., max_length=255)
    pathway_id: str = Field(..., max_length=100)
    target_date: Optional[str] = None
    priority: str = Field("MEDIUM", max_length=20) # HIGH, MEDIUM, LOW
    status: str = Field("NOT_STARTED", max_length=30) # NOT_STARTED, IN_PROGRESS, COMPLETED
    milestones: List[GoalMilestoneItem] = []
    notes: Optional[str] = None

class StudentCareerGoalUpdate(BaseModel):
    title: Optional[str] = None
    pathway_id: Optional[str] = None
    target_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    milestones: Optional[List[GoalMilestoneItem]] = None
    notes: Optional[str] = None

class StudentCareerGoalOut(BaseModel):
    id: UUID4
    user_id: UUID4
    title: str
    pathway_id: str
    target_date: Optional[str] = None
    priority: str
    status: str
    milestones: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 3. CAREER PATHWAY BOOKMARKS
# ============================================================

class CareerBookmarkIn(BaseModel):
    pathway_id: str
    pathway_title: str
    notes: Optional[str] = None

class CareerBookmarkOut(BaseModel):
    id: UUID4
    user_id: UUID4
    pathway_id: str
    pathway_title: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 4. CAREER GUIDANCE RESOURCES (FACULTY & ADMIN MANAGED)
# ============================================================

class CareerResourceCreate(BaseModel):
    title: str = Field(..., max_length=255)
    slug: Optional[str] = None
    category: str = Field(..., max_length=50) # ARTICLE, INTERNSHIP_GUIDE, INTERVIEW_PREP, HIGHER_EDUCATION, DEVELOPMENT_CHECKLIST, ANNOUNCEMENT
    summary: str
    content: str
    tags: List[str] = []
    target_year: str = "All Years"
    is_published: bool = True

class CareerResourceUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    target_year: Optional[str] = None
    is_published: Optional[bool] = None

class CareerResourceOut(BaseModel):
    id: UUID4
    title: str
    slug: str
    category: str
    summary: str
    content: str
    tags: List[str] = []
    target_year: str
    author_name: str
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# 5. AI CAREER GUIDANCE SCHEMAS
# ============================================================

class AICareerQAIn(BaseModel):
    question: str
    pathway_id: Optional[str] = None
    current_year: Optional[str] = "4th Prof"
    interests: Optional[List[str]] = []

class AICareerQAOut(BaseModel):
    question: str
    answer: str
    key_takeaways: List[str]
    suggested_actions: List[str]
    follow_up_questions: List[str]
    ncism_guidelines_reference: Optional[str] = None
    regulatory_disclaimer: str = (
        "This response provides academic and professional orientation under general NCISM curricular standards. "
        "Always cross-reference statutory circulars issued by NCISM, CCRAS, and state Ayush licensing boards."
    )

class AICareerPlanIn(BaseModel):
    pathway_id: str
    current_year: Optional[str] = "3rd Prof"
    primary_interests: Optional[List[str]] = []
    weekly_prep_hours: Optional[int] = 5

class AICareerMilestone(BaseModel):
    phase: str # e.g. "Academic Preparation", "Clinical Mastery", "Licensing & Entrance"
    title: str
    timeline: str
    actions: List[str]
    suggested_bams_focus: List[str]

class AICareerPlanOut(BaseModel):
    pathway_title: str
    summary: str
    readiness_assessment: str
    roadmap_phases: List[AICareerMilestone]
    high_yield_recommendations: List[str]
    recommended_certifications: List[str]

class AIInterviewPrepIn(BaseModel):
    role_or_pathway: str # e.g. "Hospital Resident Medical Officer (RMO)", "Panchakarma Consultant", "Junior Clinical Research Associate"
    experience_level: Optional[str] = "Fresh BAMS Graduate / Intern"

class InterviewQuestionItem(BaseModel):
    question: str
    question_type: str # Clinical Scenario, Classical Rationale, Behavioral, Pharmacology
    sample_response_framework: str
    evaluator_lookout: str

class AIInterviewPrepOut(BaseModel):
    role_or_pathway: str
    overview: str
    interview_questions: List[InterviewQuestionItem]
    clinical_scenarios: List[str]
    tips_for_success: List[str]

class AIChecklistIn(BaseModel):
    pathway_id: str
    stage: Optional[str] = "Final Year & Internship"

class AIChecklistItem(BaseModel):
    id: str
    category: str # Clinical Competency, Statutory Formalities, Professional Portfolio, Academic Exams
    task: str
    priority: str # Essential, Recommended, Value-Add

class AIChecklistOut(BaseModel):
    pathway_id: str
    pathway_title: str
    stage: str
    checklist_items: List[AIChecklistItem]
    disclaimer: str

# ============================================================
# 6. CAREER RECOMMENDATIONS FOR STUDENT
# ============================================================

class StudentCareerRecommendationOut(BaseModel):
    pathway_id: str
    title: str
    match_score: int # 0-100%
    match_reasons: List[str]
    key_prerequisites: List[str]
    action_url: str
