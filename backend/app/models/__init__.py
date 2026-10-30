from app.models.user import User, UserRole
from app.models.refresh_token import RefreshToken
from app.models.domain import (
    VerificationStatus,
    OrganizationType,
    ProficiencyLevel,
    SkillSource,
    ExperienceType,
    OpportunityType,
    OpportunityStatus,
    WorkMode,
    EmploymentType,
    ExperienceLevel,
    OpportunitySourceType,
    MatchClassification,
    MatchPriority,
    MatchStatus,
    ApplicationStatus,
    CoverLetterStatus,
    ApplicationStatusHistory,
    ApplicationInternalNote,
    IndustryAuditLog,
    InstitutionType,
    MembershipStatus,
    Department,
    StudentInstitutionMembership,
    InstitutionAuditLog,
    PortfolioVisibility,
    Portfolio,
    PortfolioProject,
    PortfolioExperience,
    PortfolioCertification,
    PortfolioAchievement,
    PortfolioEducation,
    VerificationSubjectType,
    VerificationType,
    VerificationRequest,
    VerificationEvidence,
    VerificationAudit,




    SkillCategory,
    CareerCategory,
    QuestionCategory,
    QuestionDifficulty,
    QuestionType,
    AttemptStatus,
    ResourceType,
    ResourcePriceType,
    RecommendationStatus,
    InstitutionProfile,
    StudentProfile,
    StudentExperience,
    StudentProject,
    FacultyProfile,
    IndustryProfile,
    Skill,
    StudentSkill,
    CareerPath,
    CareerRole,
    CareerSkillRequirement,
    Opportunity,
    OpportunitySkill,
    Application,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    AssessmentAttemptQuestion,
    AssessmentAnswer,
    AssessmentSkillScore,
    AssessmentCategoryScore,
    StudentSkillScore,
    RoleRequiredSkill,
    SkillGapSnapshot,
    SkillGapSnapshotItem,
    LearningResource,
    LearningResourceSkill,
    LearningResourceCareer,
    Recommendation,
    IndustryOpportunity,
    OpportunityRequiredSkill,
    OpportunityCareerRole,
    OpportunityMatch,
    InstitutionInvitation,
    EducationalResource,
    LectureSchedule,
)


__all__ = [
    "User",
    "UserRole",
    "RefreshToken",
    "VerificationStatus",
    "ProficiencyLevel",
    "SkillSource",
    "ExperienceType",
    "OpportunityType",
    "OpportunityStatus",
    "WorkMode",
    "EmploymentType",
    "ExperienceLevel",
    "OpportunitySourceType",
    "MatchClassification",
    "MatchPriority",
    "MatchStatus",
    "ApplicationStatus",
    "CoverLetterStatus",
    "ApplicationStatusHistory",
    "SkillCategory",

    "CareerCategory",
    "QuestionCategory",
    "QuestionDifficulty",
    "QuestionType",
    "AttemptStatus",
    "ResourceType",
    "ResourcePriceType",
    "RecommendationStatus",
    "InstitutionProfile",
    "StudentProfile",
    "StudentExperience",
    "StudentProject",
    "FacultyProfile",
    "IndustryProfile",
    "Skill",
    "StudentSkill",
    "CareerPath",
    "CareerRole",
    "CareerSkillRequirement",
    "Opportunity",
    "OpportunitySkill",
    "Application",
    "AssessmentQuestion",
    "AssessmentOption",
    "AssessmentAttempt",
    "AssessmentAttemptQuestion",
    "AssessmentAnswer",
    "AssessmentSkillScore",
    "AssessmentCategoryScore",
    "StudentSkillScore",
    "RoleRequiredSkill",
    "SkillGapSnapshot",
    "SkillGapSnapshotItem",
    "LearningResource",
    "LearningResourceSkill",
    "LearningResourceCareer",
    "Recommendation",
    "IndustryOpportunity",
    "OpportunityRequiredSkill",
    "OpportunityCareerRole",
    "OpportunityMatch",
    "OrganizationType",
    "ApplicationInternalNote",
    "IndustryAuditLog",
    "InstitutionType",
    "MembershipStatus",
    "Department",
    "StudentInstitutionMembership",
    "InstitutionAuditLog",
]

# Extended Models Import
from app.models.camps import (
    HealthcareCamp,
    CampAttendeeRegistration,
    CampVolunteerApplication,
    CampScheduleItem,
    CampAttendanceRecord,
    CampParticipationCertificate,
    FinalCampReport,
    CampVolunteerEvaluation,
    CampStudentReview,
    CampCoordinationTask,
    CampBroadcastMessage,
    AppNotification
)
from app.models.doctor_ngo import (
    DoctorProfile,
    ClinicHospitalProfile,
    DoctorMessage,
    DoctorStudentSession,
    DoctorVerificationDocument,
    NGOProfile
)
from app.models.internships import (
    InternshipPosting,
    InternshipApplication,
    InternshipOfferLetter,
    InternshipAttendanceLog,
    InternshipProgressMilestone,
    InternshipCompletionCertificate,
    InternshipSupervisorFeedback,
    InternshipStudentFeedback
)
from app.models.ai_career import (
    AIAssistantChat,
    CareerRoadmap,
    CareerGoal,
    CareerGoalMilestone,
    StudentResume,
    MockInterviewSession
)
from app.models.learning_hub import (
    ResourceBookmark,
    ResourceViewHistory,
    ResourceRating,
    BookMarketplaceItem,
    ClassicalTreatise,
    ClassicalShloka,
    SubjectStudyModule,
    StudentStudyNote,
    PracticeSession
)
from app.models.courses_tests import (
    ExamMockTest,
    ExamMockAttempt,
    CertificateCourse,
    CourseEnrollment,
    CourseCertificate
)
from app.models.scholarships import (
    ScholarshipListing,
    StudentScholarshipBookmark
)
from app.models.mentorship import (
    AlumniProfile,
    MentorshipEngagement
)
from app.models.opportunity_extended import StudentOpportunityBookmark
from app.models.events import (
    PlatformEvent,
    EventRegistration,
    EventCertificate
)
from app.models.security_privacy import (
    UserPrivacySettings,
    UserModerationReport,
    UserBlock,
    SecurityAuditLog
)
from app.models.wellness import (
    WellnessResource,
    StudentWellnessBookmark
)
from app.models.interactive_3d import Ayurveda3DModel
from app.models.herbs_research import (
    MedicinalPlant,
    AyushResearchPaper,
    StudentProjectShowcase
)
from app.models.forum import (
    ForumCategory,
    ForumPost,
    ForumComment,
    ForumPostReaction,
    ForumReport
)
from app.models.ngo_volunteers import (
    NGOVolunteerOpportunity,
    NGOVolunteerApplication,
    NGOVolunteerCertificate
)
from app.models.expert_guidance import (
    SessionType,
    SessionLevel,
    SessionStatus,
    SessionVisibility,
    ExpertProfile,
    ExpertSession,
    SessionParticipant,
    SessionRating,
    ExpertFollow,
    SessionQuestion,
    SessionReminder
)
from app.models.topic_quiz import (
    QuizDifficulty,
    QuizQuestionType,
    QuizAttemptStatus,
    TopicQuizSubject,
    TopicQuizTopic,
    TopicQuizSubtopic,
    TopicQuizQuestion,
    StudentTopicPerformance,
    TopicQuizAttempt
)
from app.models.bams_ecosystem import (
    GuidanceMode,
    GuidanceFeeType,
    GuidanceRequestStatus,
    CaseDifficulty,
    BamsCaseStudy,
    DoctorGuidanceRequest,
    StudentTimetablePreference,
    StudentRemediationLog,
    StudentBamsProgress
)
from app.models.ai_ecosystem import (
    AIChatRole,
    NoteTransformType,
    AIQuestionFormat,
    FacultyToolType,
    AIChatSession,
    AIChatMessage,
    AINote,
    AINoteVersion,
    AIGeneratedQuiz,
    AIQuizAttempt,
    AIStudySchedule,
    AIAnswerEvaluation,
    AIFacultyLog
)
from app.models.community_collaboration import (
    DiscussionBookmark,
    FacultyQuestion,
    StudyGroup,
    StudyGroupMember,
    StudyGroupDiscussion,
    EducationalFeedback,
    CommunityModerationAction,
    UserRestriction,
    UserNotificationPreference
)
from app.models.career_guidance import (
    StudentCareerGoal,
    StudentCareerBookmark,
    CareerGuidanceResource
)
from app.models.notifications import (
    StudentReminder,
    AcademicAnnouncement
)
from app.models.monitoring_feedback import (
    PlatformIssueReport,
    SystemErrorLog
)
from app.models.security_privacy import (
    UserPrivacySettings,
    UserModerationReport,
    UserBlock,
    SecurityAuditLog,
    LoginOtpChallenge
)



