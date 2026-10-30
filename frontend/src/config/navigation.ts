import {
  LayoutDashboard,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Briefcase,
  FileText,
  History,
  ShieldCheck,
  Calendar,
  MessageSquare,
  User,
  Stethoscope,
  Building2,
  Users,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Sprout,
  BarChart3,
  Search,
  CheckSquare,
  PlusCircle,
  Bot,
  Brain,
  BrainCircuit,
  GraduationCap,
  FileCheck,
  Globe,
  Video,
  Bell,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

export type UserRole =
  | "STUDENT"
  | "DOCTOR"
  | "FACULTY"
  | "INSTITUTION"
  | "INDUSTRY"
  | "NGO"
  | "ADMIN"
  | "GUEST";

export interface NavBadge {
  text: string;
  variant?: "emerald" | "amber" | "blue" | "rose" | "teal" | "purple";
}

export interface NavItem {
  /** Display label for the navigation item */
  label: string;
  /** Primary target route link */
  route: string;
  /** Associated Lucide icon component */
  icon?: LucideIcon;
  /** Roles allowed to view this navigation item */
  requiredRole?: UserRole | UserRole[];
  /** Optional granular permission key */
  permission?: string;
  /** Optional badge indicator */
  badge?: NavBadge;
  /** If true, indicates this is a known platform feature that does not have an existing route yet */
  isMissing?: boolean;
  /** Optional reason explaining why the route is marked missing */
  missingReason?: string;
  /** Submenu navigation items */
  children?: NavItem[];
}

export interface RoleNavigationConfig {
  guest: NavItem[];
  student: NavItem[];
  doctor: NavItem[];
  faculty: NavItem[];
  institution: NavItem[];
  industry: NavItem[];
  ngo: NavItem[];
  admin: NavItem[];
}

export const navigationConfig: RoleNavigationConfig = {
  // ==========================================
  // 1. GUEST / PUBLIC NAVIGATION
  // ==========================================
  guest: [
    {
      label: "Home",
      route: "/",
      icon: Compass,
      requiredRole: "GUEST",
    },
    {
      label: "About Us",
      route: "/#about",
      icon: Compass,
      requiredRole: "GUEST",
    },
    {
      label: "Features",
      route: "/#features",
      icon: Sparkles,
      requiredRole: "GUEST",
    },
    {
      label: "Institute",
      route: "/institution/dashboard",
      icon: Building2,
      requiredRole: "GUEST",
    },
    {
      label: "Marketplace",
      route: "/learning-hub",
      icon: Briefcase,
      requiredRole: "GUEST",
    },
    {
      label: "Resources",
      route: "/learning-hub",
      icon: BookOpen,
      requiredRole: "GUEST",
      children: [
        {
          label: "Learning Hub",
          route: "/learning-hub",
          icon: BookOpen,
          requiredRole: "GUEST",
        },
        {
          label: "Herbs & Research",
          route: "/herbs-research",
          icon: Sprout,
          requiredRole: "GUEST",
        },
        {
          label: "3D Anatomy",
          route: "/interactive-3d",
          icon: Layers,
          requiredRole: "GUEST",
        },
        {
          label: "Health Camps",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "GUEST",
        },
        {
          label: "AI Career Studio",
          route: "/ai-career",
          icon: Sparkles,
          requiredRole: "GUEST",
        },
        {
          label: "Master AI Learning Studio",
          route: "/ai",
          icon: BrainCircuit,
          requiredRole: "GUEST",
          badge: { text: "AI", variant: "emerald" },
        },
      ],
    },
    {
      label: "Contact",
      route: "/#contact",
      icon: HeartHandshake,
      requiredRole: "GUEST",
    },
  ],

  // ==========================================
  // 2. STUDENT NAVBAR
  // Main visible: Dashboard | Career | Opportunities | AI | Learning | Portfolio | More
  // ==========================================
  student: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/student/dashboard",
      icon: LayoutDashboard,
      requiredRole: "STUDENT",
    },

    // 2. Career (Dropdown)
    {
      label: "Career",
      route: "/student/career",
      icon: Target,
      requiredRole: "STUDENT",
      children: [
        {
          label: "Career Goal",
          route: "/student/career",
          icon: Target,
          requiredRole: "STUDENT",
        },
        {
          label: "Career Roadmap",
          route: "/student/career?view=roadmap",
          icon: Compass,
          requiredRole: "STUDENT",
        },
        {
          label: "Career Readiness",
          route: "/student/ecosystem?tab=readiness",
          icon: Award,
          requiredRole: "STUDENT",
        },
        {
          label: "Skill Progress",
          route: "/student/skills",
          icon: Layers,
          requiredRole: "STUDENT",
        },
        {
          label: "Skill Gap",
          route: "/student/skill-gap",
          icon: TrendingUp,
          requiredRole: "STUDENT",
          badge: { text: "Engine", variant: "amber" },
        },
        {
          label: "Learning Path",
          route: "/student/recommendations",
          icon: BookOpen,
          requiredRole: "STUDENT",
        },
      ],
    },

    // 3. Opportunities (Dropdown)
    {
      label: "Opportunities",
      route: "/student/opportunities",
      icon: Briefcase,
      requiredRole: "STUDENT",
      children: [
        {
          label: "Jobs",
          route: "/student/opportunities?type=JOB",
          icon: Briefcase,
          requiredRole: "STUDENT",
        },
        {
          label: "Internships",
          route: "/internships",
          icon: Search,
          requiredRole: "STUDENT",
          badge: { text: "Active", variant: "emerald" },
        },
        {
          label: "Research",
          route: "/student/opportunities?type=RESEARCH",
          icon: Sprout,
          requiredRole: "STUDENT",
        },
        {
          label: "Fellowships",
          route: "/student/opportunities?type=FELLOWSHIP",
          icon: Award,
          requiredRole: "STUDENT",
        },
        {
          label: "Scholarships",
          route: "/student/opportunities?type=SCHOLARSHIP",
          icon: GraduationCap,
          requiredRole: "STUDENT",
        },
        {
          label: "Government Opportunities",
          route: "/student/opportunities?type=GOVERNMENT",
          icon: Building2,
          requiredRole: "STUDENT",
        },
        {
          label: "Abroad Education",
          route: "/student/opportunities?type=ABROAD",
          icon: Globe,
          requiredRole: "STUDENT",
        },
        {
          label: "International Internships",
          route: "/internships?type=INTERNATIONAL",
          icon: Globe,
          requiredRole: "STUDENT",
        },
      ],
    },

    // 4. AI (Dropdown)
    {
      label: "AI",
      route: "/ai",
      icon: Sparkles,
      requiredRole: "STUDENT",
      badge: { text: "Studio", variant: "purple" },
      children: [
        {
          label: "Master AI Studio",
          route: "/ai",
          icon: Sparkles,
          requiredRole: "STUDENT",
          badge: { text: "Unified", variant: "emerald" },
        },
        {
          label: "AI Notes Assistant",
          route: "/ai?tab=notes",
          icon: FileText,
          requiredRole: "STUDENT",
        },
        {
          label: "AI Quiz Generator",
          route: "/ai?tab=quiz",
          icon: Award,
          requiredRole: "STUDENT",
        },
        {
          label: "AI Study Planner",
          route: "/ai?tab=planner",
          icon: Calendar,
          requiredRole: "STUDENT",
        },
        {
          label: "AI Answer Feedback",
          route: "/ai?tab=feedback",
          icon: FileCheck,
          requiredRole: "STUDENT",
        },
        {
          label: "AI Career Studio",
          route: "/ai-career?tab=assistant",
          icon: Bot,
          requiredRole: "STUDENT",
        },
        {
          label: "Resume Builder",
          route: "/student/portfolio",
          icon: FileText,
          requiredRole: "STUDENT",
        },
        {
          label: "Resume Analyzer",
          route: "/ai-career?tab=resume",
          icon: BrainCircuit,
          requiredRole: "STUDENT",
        },
        {
          label: "ATS Score",
          route: "/ai-career?tab=resume",
          icon: Award,
          requiredRole: "STUDENT",
        },
        {
          label: "Interview Coach",
          route: "/ai-career?tab=interview",
          icon: MessageSquare,
          requiredRole: "STUDENT",
        },
        {
          label: "Mock Interview",
          route: "/ai-career?tab=interview",
          icon: Video,
          requiredRole: "STUDENT",
        },
        {
          label: "Study Assistant",
          route: "/ai-career?tab=study",
          icon: BookOpen,
          requiredRole: "STUDENT",
        },
        {
          label: "Portfolio Review",
          route: "/student/portfolio/preview",
          icon: Compass,
          requiredRole: "STUDENT",
        },
      ],
    },

    // 5. Learning (Dropdown)
    {
      label: "Learning",
      route: "/learning-hub",
      icon: BookOpen,
      requiredRole: "STUDENT",
      children: [
        {
          label: "BAMS Learning Hub",
          route: "/student/ecosystem",
          icon: Brain,
          requiredRole: "STUDENT",
          badge: { text: "Hub", variant: "emerald" },
        },
        {
          label: "BAMS Syllabus & Subjects",
          route: "/student/ecosystem?tab=syllabus",
          icon: BookOpen,
          requiredRole: "STUDENT",
          badge: { text: "NCISM", variant: "emerald" },
        },
        {
          label: "Active Recall Flashcards",
          route: "/bams/flashcards",
          icon: Brain,
          requiredRole: "STUDENT",
          badge: { text: "Spaced", variant: "amber" },
        },

        {
          label: "Exam Prep & NEXT",
          route: "/student/ecosystem?tab=examprep",
          icon: Target,
          requiredRole: "STUDENT",
          badge: { text: "Viva", variant: "teal" },
        },
        {
          label: "Practical & Clinical Logbook",
          route: "/student/ecosystem?tab=internship",
          icon: GraduationCap,
          requiredRole: "STUDENT",
        },
        {
          label: "Case Studies",
          route: "/student/ecosystem?tab=cases",
          icon: Sparkles,
          requiredRole: "STUDENT",
        },
        {
          label: "Smart Timetable",
          route: "/student/ecosystem?tab=timetable",
          icon: Clock,
          requiredRole: "STUDENT",
        },
        {
          label: "Topic Quiz / MCQ",
          route: "/student/quiz",
          icon: CheckSquare,
          requiredRole: "STUDENT",
          badge: { text: "Adaptive", variant: "emerald" },
        },
        {
          label: "Learning Analytics & Insights",
          route: "/student/analytics",
          icon: TrendingUp,
          requiredRole: "STUDENT",
          badge: { text: "Insights", variant: "emerald" },
        },
        {
          label: "Mock Tests",
          route: "/student/assessments",
          icon: CheckSquare,
          requiredRole: "STUDENT",
        },
        {
          label: "Live Masterclasses",
          route: "/student/sessions",
          icon: Video,
          requiredRole: "STUDENT",
          badge: { text: "Live", variant: "amber" },
        },
        {
          label: "Learning Resources",
          route: "/learning-hub",
          icon: BookOpen,
          requiredRole: "STUDENT",
        },
        {
          label: "Shloka Library",
          route: "/learning-hub",
          icon: Sparkles,
          requiredRole: "STUDENT",
        },
        {
          label: "Articles & Research",
          route: "/herbs-research",
          icon: Sprout,
          requiredRole: "STUDENT",
        },
        {
          label: "Courses & Pathways",
          route: "/student/recommendations",
          icon: GraduationCap,
          requiredRole: "STUDENT",
        },
      ],
    },

    // 6. Portfolio (Dropdown)
    {
      label: "Portfolio",
      route: "/student/portfolio",
      icon: User,
      requiredRole: "STUDENT",
      children: [
        {
          label: "My Portfolio",
          route: "/student/portfolio",
          icon: User,
          requiredRole: "STUDENT",
        },
        {
          label: "Projects",
          route: "/student/portfolio",
          icon: Layers,
          requiredRole: "STUDENT",
        },
        {
          label: "Certificates",
          route: "/student/verification",
          icon: ShieldCheck,
          requiredRole: "STUDENT",
        },
        {
          label: "Internship Experience",
          route: "/student/history",
          icon: History,
          requiredRole: "STUDENT",
        },
        {
          label: "Offer Letters",
          route: "/student/offers",
          icon: Award,
          requiredRole: "STUDENT",
          badge: { text: "Official", variant: "emerald" },
        },
        {
          label: "Volunteer Experience",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "STUDENT",
        },
      ],
    },

    // 7. More (Dropdown)
    {
      label: "More",
      route: "/student/dashboard",
      icon: MoreHorizontal,
      requiredRole: "STUDENT",
      children: [
        {
          label: "Assessment",
          route: "/student/assessments",
          icon: CheckSquare,
          requiredRole: "STUDENT",
        },
        {
          label: "My Scores",
          route: "/student/assessments/history",
          icon: Award,
          requiredRole: "STUDENT",
          badge: { text: "Results", variant: "emerald" },
        },
        {
          label: "Applications",
          route: "/student/applications",
          icon: FileText,
          requiredRole: "STUDENT",
        },
        {
          label: "Internship History",
          route: "/student/history",
          icon: Briefcase,
          requiredRole: "STUDENT",
        },
        {
          label: "NGO / Camps",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "STUDENT",
        },
        {
          label: "Events",
          route: "/community-forum",
          icon: Calendar,
          requiredRole: "STUDENT",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "STUDENT",
        },
        {
          label: "Feedback & Issues",
          route: "/feedback",
          icon: MessageSquare,
          requiredRole: "STUDENT",
          badge: { text: "Support", variant: "emerald" },
        },
        {
          label: "Account",
          route: "/student/profile",
          icon: User,
          requiredRole: "STUDENT",
        },
      ],
    },
  ],

  // ==========================================
  // 3. DOCTOR NAVBAR
  // Main visible: Dashboard | Students | Internships | Sessions | Camps | More
  // ==========================================
  doctor: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/doctor/dashboard",
      icon: LayoutDashboard,
      requiredRole: "DOCTOR",
    },

    // 2. Students (Dropdown)
    {
      label: "Students",
      route: "/doctor/applications",
      icon: Users,
      requiredRole: "DOCTOR",
      children: [
        {
          label: "Student Directory",
          route: "/doctor/applications",
          icon: Users,
          requiredRole: "DOCTOR",
        },
        {
          label: "Student Profiles",
          route: "/doctor/applications",
          icon: User,
          requiredRole: "DOCTOR",
        },
        {
          label: "Student Skills",
          route: "/doctor/applications",
          icon: Layers,
          requiredRole: "DOCTOR",
        },
        {
          label: "Student Portfolios",
          route: "/doctor/applications",
          icon: Compass,
          requiredRole: "DOCTOR",
        },
        {
          label: "Shortlisted Students",
          route: "/doctor/applications",
          icon: CheckCircle2,
          requiredRole: "DOCTOR",
          badge: { text: "Shortlist", variant: "emerald" },
        },
      ],
    },

    // 3. Internships (Dropdown)
    {
      label: "Internships",
      route: "/doctor/internships",
      icon: Briefcase,
      requiredRole: "DOCTOR",
      children: [
        {
          label: "Create Internship",
          route: "/doctor/internships/new",
          icon: PlusCircle,
          requiredRole: "DOCTOR",
        },
        {
          label: "My Internships",
          route: "/doctor/internships",
          icon: Briefcase,
          requiredRole: "DOCTOR",
        },
        {
          label: "Applications",
          route: "/doctor/applications",
          icon: FileText,
          requiredRole: "DOCTOR",
        },
        {
          label: "Shortlisted Students",
          route: "/doctor/applications",
          icon: CheckCircle2,
          requiredRole: "DOCTOR",
        },
        {
          label: "Offers",
          route: "/doctor/offers",
          icon: Award,
          requiredRole: "DOCTOR",
          badge: { text: "Offers", variant: "emerald" },
        },
        {
          label: "Attendance",
          route: "/doctor/attendance",
          icon: CheckCircle2,
          requiredRole: "DOCTOR",
          badge: { text: "Daily", variant: "emerald" },
        },
        {
          label: "Progress",
          route: "/doctor/history",
          icon: TrendingUp,
          requiredRole: "DOCTOR",
        },
        {
          label: "Certificates",
          route: "/doctor/history",
          icon: ShieldCheck,
          requiredRole: "DOCTOR",
        },
        {
          label: "Feedback",
          route: "/doctor/history",
          icon: MessageSquare,
          requiredRole: "DOCTOR",
        },
      ],
    },

    // 4. Sessions (Dropdown)
    {
      label: "Sessions",
      route: "/doctor/sessions",
      icon: Calendar,
      requiredRole: "DOCTOR",
      children: [
        {
          label: "Live Lecture Studio",
          route: "/doctor/sessions?tab=live",
          icon: Video,
          requiredRole: "DOCTOR",
          badge: { text: "Live", variant: "amber" },
        },
        {
          label: "Recorded Lectures",
          route: "/doctor/sessions?tab=recorded",
          icon: Video,
          requiredRole: "DOCTOR",
        },
        {
          label: "1-on-1 Mentorship",
          route: "/doctor/sessions?tab=mentorship",
          icon: Calendar,
          requiredRole: "DOCTOR",
        },
        {
          label: "Upcoming Sessions",
          route: "/doctor/sessions?tab=upcoming",
          icon: Clock,
          requiredRole: "DOCTOR",
        },
        {
          label: "Past Sessions & History",
          route: "/doctor/sessions?tab=past",
          icon: History,
          requiredRole: "DOCTOR",
        },
        {
          label: "Doctor–Student Messaging",
          route: "/doctor/messages",
          icon: MessageSquare,
          requiredRole: "DOCTOR",
          badge: { text: "Chat", variant: "blue" },
        },
      ],
    },

    // 5. Camps (Dropdown)
    {
      label: "Camps",
      route: "/camps",
      icon: HeartHandshake,
      requiredRole: "DOCTOR",
      badge: { text: "Camps", variant: "emerald" },
      children: [
        {
          label: "Healthcare Camps",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "DOCTOR",
        },
        {
          label: "Create Camp",
          route: "/camps?tab=create",
          icon: PlusCircle,
          requiredRole: "DOCTOR",
        },
        {
          label: "Camp Management",
          route: "/camps",
          icon: Layers,
          requiredRole: "DOCTOR",
        },
        {
          label: "Students",
          route: "/camps?tab=volunteer",
          icon: GraduationCap,
          requiredRole: "DOCTOR",
        },
        {
          label: "Doctors",
          route: "/camps?tab=doctors",
          icon: Stethoscope,
          requiredRole: "DOCTOR",
        },
        {
          label: "Attendance",
          route: "/doctor/attendance",
          icon: CheckCircle2,
          requiredRole: "DOCTOR",
        },
        {
          label: "Certificates",
          route: "/verify/certificate",
          icon: Award,
          requiredRole: "DOCTOR",
        },
      ],
    },

    // 6. More (Dropdown)
    {
      label: "More",
      route: "/doctor/profile",
      icon: MoreHorizontal,
      requiredRole: "DOCTOR",
      children: [
        {
          label: "Profile",
          route: "/doctor/profile",
          icon: User,
          requiredRole: "DOCTOR",
        },
        {
          label: "Verification",
          route: "/doctor/verification",
          icon: ShieldCheck,
          requiredRole: "DOCTOR",
          badge: { text: "NCISM", variant: "amber" },
        },
        {
          label: "Documents",
          route: "/doctor/verification",
          icon: FileCheck,
          requiredRole: "DOCTOR",
        },
        {
          label: "Clinic / Hospital",
          route: "/doctor/clinics",
          icon: Building2,
          requiredRole: "DOCTOR",
        },
        {
          label: "Opportunities",
          route: "/doctor/internships",
          icon: Briefcase,
          requiredRole: "DOCTOR",
        },
        {
          label: "Events",
          route: "/community-forum",
          icon: Calendar,
          requiredRole: "DOCTOR",
        },
        {
          label: "Messages",
          route: "/doctor/messages",
          icon: MessageSquare,
          requiredRole: "DOCTOR",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "DOCTOR",
        },
        {
          label: "Master AI & Faculty Studio",
          route: "/ai",
          icon: Sparkles,
          requiredRole: "DOCTOR",
          badge: { text: "AI", variant: "emerald" },
        },
        {
          label: "Feedback & Support",
          route: "/feedback",
          icon: MessageSquare,
          requiredRole: "DOCTOR",
        },
        {
          label: "Account",
          route: "/doctor/profile",
          icon: User,
          requiredRole: "DOCTOR",
        },
      ],
    },
  ],

  // ==========================================
  // 4. INSTITUTION NAVBAR
  // Main visible: Dashboard | Students | Internships | Placements | Analytics | More
  // ==========================================
  institution: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/institution/dashboard",
      icon: LayoutDashboard,
      requiredRole: "INSTITUTION",
    },

    // 2. Students (Dropdown)
    {
      label: "Students",
      route: "/institution/students",
      icon: Users,
      requiredRole: "INSTITUTION",
      children: [
        {
          label: "Student Directory",
          route: "/institution/students",
          icon: Users,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Student Profiles",
          route: "/institution/students",
          icon: User,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Student Performance",
          route: "/institution/students",
          icon: Award,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Skill Analytics",
          route: "/institution/analytics",
          icon: TrendingUp,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Career Progress",
          route: "/institution/analytics",
          icon: Compass,
          requiredRole: "INSTITUTION",
        },
      ],
    },

    // 3. Internships (Dropdown)
    {
      label: "Internships",
      route: "/institution/opportunities",
      icon: Briefcase,
      requiredRole: "INSTITUTION",
      children: [
        {
          label: "Internship Opportunities",
          route: "/institution/opportunities",
          icon: Briefcase,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Internship Analytics",
          route: "/institution/analytics",
          icon: BarChart3,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Student Internship Status",
          route: "/institution/applications",
          icon: FileText,
          requiredRole: "INSTITUTION",
        },
      ],
    },

    // 4. Placements (Dropdown)
    {
      label: "Placements",
      route: "/institution/analytics",
      icon: Award,
      requiredRole: "INSTITUTION",
      children: [
        {
          label: "Placement Dashboard",
          route: "/institution/analytics",
          icon: LayoutDashboard,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Placement Analytics",
          route: "/institution/analytics",
          icon: BarChart3,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Placement Readiness",
          route: "/institution/analytics",
          icon: TrendingUp,
          requiredRole: "INSTITUTION",
          badge: { text: "Readiness", variant: "emerald" },
        },
      ],
    },

    // 5. Analytics (Dropdown)
    {
      label: "Analytics",
      route: "/institution/analytics",
      icon: BarChart3,
      requiredRole: "INSTITUTION",
      badge: { text: "Insights", variant: "teal" },
      children: [
        {
          label: "Student Analytics",
          route: "/institution/analytics",
          icon: Users,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Skill Analytics",
          route: "/institution/analytics",
          icon: TrendingUp,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Placement Analytics",
          route: "/institution/analytics",
          icon: BarChart3,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Internship Analytics",
          route: "/institution/analytics",
          icon: Briefcase,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Career Outcomes",
          route: "/institution/analytics",
          icon: Compass,
          requiredRole: "INSTITUTION",
        },
      ],
    },

    // 6. More (Dropdown)
    {
      label: "More",
      route: "/institution/profile",
      icon: MoreHorizontal,
      requiredRole: "INSTITUTION",
      children: [
        {
          label: "Institution Profile",
          route: "/institution/profile",
          icon: Building2,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Industry Opportunities",
          route: "/institution/opportunities",
          icon: Building2,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Alumni Network",
          route: "/community-forum",
          icon: GraduationCap,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Faculty & Departments",
          route: "/institution/departments",
          icon: User,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Scholarships",
          route: "/institution/opportunities",
          icon: Award,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Events",
          route: "/community-forum",
          icon: Calendar,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "INSTITUTION",
        },
        {
          label: "Account",
          route: "/institution/profile",
          icon: User,
          requiredRole: "INSTITUTION",
        },
      ],
    },
  ],

  // ==========================================
  // 5. INDUSTRY NAVBAR
  // Main visible: Dashboard | Opportunities | Talent | Applications | Matching | More
  // ==========================================
  industry: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/industry/dashboard",
      icon: LayoutDashboard,
      requiredRole: "INDUSTRY",
    },

    // 2. Opportunities (Dropdown)
    {
      label: "Opportunities",
      route: "/industry/opportunities",
      icon: Briefcase,
      requiredRole: "INDUSTRY",
      children: [
        {
          label: "Create Job",
          route: "/industry/opportunities/new",
          icon: PlusCircle,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Jobs",
          route: "/industry/opportunities?type=JOB",
          icon: Briefcase,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Create Internship",
          route: "/industry/opportunities/new",
          icon: PlusCircle,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Internships",
          route: "/industry/opportunities?type=INTERNSHIP",
          icon: Search,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Research Opportunities",
          route: "/industry/opportunities?type=RESEARCH",
          icon: Sprout,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Fellowship Opportunities",
          route: "/industry/opportunities?type=FELLOWSHIP",
          icon: Award,
          requiredRole: "INDUSTRY",
        },
      ],
    },

    // 3. Talent (Dropdown)
    {
      label: "Talent",
      route: "/industry/applications",
      icon: Users,
      requiredRole: "INDUSTRY",
      children: [
        {
          label: "Student Directory",
          route: "/industry/applications",
          icon: Users,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Search Students",
          route: "/industry/applications",
          icon: Search,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Skill-based Search",
          route: "/industry/analytics",
          icon: TrendingUp,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Student Profiles",
          route: "/industry/applications",
          icon: User,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Portfolios",
          route: "/industry/applications",
          icon: Compass,
          requiredRole: "INDUSTRY",
        },
      ],
    },

    // 4. Applications (Dropdown)
    {
      label: "Applications",
      route: "/industry/applications",
      icon: FileText,
      requiredRole: "INDUSTRY",
      badge: { text: "Pipeline", variant: "blue" },
      children: [
        {
          label: "All Applications",
          route: "/industry/applications",
          icon: FileText,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Shortlisted Candidates",
          route: "/industry/applications?status=SHORTLISTED",
          icon: CheckCircle2,
          requiredRole: "INDUSTRY",
          badge: { text: "Shortlist", variant: "emerald" },
        },
        {
          label: "Interview Candidates",
          route: "/industry/applications?status=INTERVIEW",
          icon: Calendar,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Selected Candidates",
          route: "/industry/applications?status=SELECTED",
          icon: Award,
          requiredRole: "INDUSTRY",
        },
      ],
    },

    // 5. Matching (Dropdown)
    {
      label: "Matching",
      route: "/industry/applications",
      icon: Sparkles,
      requiredRole: "INDUSTRY",
      badge: { text: "AI 94%", variant: "amber" },
      children: [
        {
          label: "AI Candidate Matching",
          route: "/industry/applications?tab=matching",
          icon: Bot,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Skill Matching",
          route: "/industry/applications?tab=matching",
          icon: TrendingUp,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Career Matching",
          route: "/industry/analytics",
          icon: Compass,
          requiredRole: "INDUSTRY",
        },
      ],
    },

    // 6. More (Dropdown)
    {
      label: "More",
      route: "/industry/organization",
      icon: MoreHorizontal,
      requiredRole: "INDUSTRY",
      children: [
        {
          label: "Company Profile",
          route: "/industry/organization",
          icon: Building2,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Hiring Analytics",
          route: "/industry/analytics",
          icon: BarChart3,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Events",
          route: "/community-forum",
          icon: Calendar,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Messaging",
          route: "/industry/applications",
          icon: MessageSquare,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "INDUSTRY",
        },
        {
          label: "Account",
          route: "/industry/organization",
          icon: User,
          requiredRole: "INDUSTRY",
        },
      ],
    },
  ],

  // ==========================================
  // 6. NGO NAVBAR
  // Main visible: Dashboard | Camps | Doctors | Students | Coordination | More
  // ==========================================
  ngo: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/ngo/dashboard",
      icon: LayoutDashboard,
      requiredRole: "NGO",
    },

    // 2. Camps (Dropdown)
    {
      label: "Camps",
      route: "/camps",
      icon: HeartHandshake,
      requiredRole: "NGO",
      badge: { text: "Active", variant: "emerald" },
      children: [
        {
          label: "Healthcare Camps",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "NGO",
        },
        {
          label: "Create Camp",
          route: "/camps?tab=create",
          icon: PlusCircle,
          requiredRole: "NGO",
        },
        {
          label: "Camp Management",
          route: "/camps",
          icon: Layers,
          requiredRole: "NGO",
        },
        {
          label: "Camp History",
          route: "/camps",
          icon: History,
          requiredRole: "NGO",
        },
        {
          label: "Upcoming Camps",
          route: "/camps",
          icon: Calendar,
          requiredRole: "NGO",
        },
        {
          label: "Camp Calendar",
          route: "/camps",
          icon: Calendar,
          requiredRole: "NGO",
        },
        {
          label: "Camp Capacity",
          route: "/camps",
          icon: Users,
          requiredRole: "NGO",
        },
        {
          label: "Camp Team",
          route: "/camps",
          icon: Stethoscope,
          requiredRole: "NGO",
        },
        {
          label: "Camp Schedule",
          route: "/camps",
          icon: Clock,
          requiredRole: "NGO",
        },
      ],
    },

    // 3. Doctors (Dropdown)
    {
      label: "Doctors",
      route: "/camps?tab=doctors",
      icon: Stethoscope,
      requiredRole: "NGO",
      children: [
        {
          label: "Register Doctors",
          route: "/camps?tab=doctors",
          icon: PlusCircle,
          requiredRole: "NGO",
        },
        {
          label: "Doctor Applications",
          route: "/camps?tab=doctors",
          icon: FileText,
          requiredRole: "NGO",
        },
        {
          label: "Doctor Team",
          route: "/camps?tab=doctors",
          icon: Stethoscope,
          requiredRole: "NGO",
        },
        {
          label: "Doctor Coordination",
          route: "/community-forum",
          icon: MessageSquare,
          requiredRole: "NGO",
        },
      ],
    },

    // 4. Students (Dropdown)
    {
      label: "Students",
      route: "/camps?tab=volunteer",
      icon: GraduationCap,
      requiredRole: "NGO",
      children: [
        {
          label: "Volunteer Applications",
          route: "/camps?tab=volunteer",
          icon: FileText,
          requiredRole: "NGO",
        },
        {
          label: "Student Volunteers",
          route: "/camps?tab=volunteer",
          icon: Users,
          requiredRole: "NGO",
        },
        {
          label: "Volunteer Selection",
          route: "/camps?tab=volunteer",
          icon: CheckCircle2,
          requiredRole: "NGO",
        },
        {
          label: "Volunteer Hours",
          route: "/camps?tab=volunteer",
          icon: Clock,
          requiredRole: "NGO",
        },
        {
          label: "Student Feedback",
          route: "/community-forum",
          icon: MessageSquare,
          requiredRole: "NGO",
        },
      ],
    },

    // 5. Coordination (Dropdown)
    {
      label: "Coordination",
      route: "/community-forum",
      icon: MessageSquare,
      requiredRole: "NGO",
      children: [
        {
          label: "NGO ↔ Doctor",
          route: "/community-forum",
          icon: Stethoscope,
          requiredRole: "NGO",
        },
        {
          label: "NGO ↔ Student",
          route: "/community-forum",
          icon: GraduationCap,
          requiredRole: "NGO",
        },
        {
          label: "Messages",
          route: "/community-forum",
          icon: MessageSquare,
          requiredRole: "NGO",
        },
      ],
    },

    // 6. More (Dropdown)
    {
      label: "More",
      route: "/camps",
      icon: MoreHorizontal,
      requiredRole: "NGO",
      children: [
        {
          label: "NGO Profile",
          route: "/camps",
          icon: Building2,
          requiredRole: "NGO",
        },
        {
          label: "Camp Management",
          route: "/camps",
          icon: Layers,
          requiredRole: "NGO",
        },
        {
          label: "Camp History",
          route: "/camps",
          icon: History,
          requiredRole: "NGO",
        },
        {
          label: "Reports",
          route: "/camps",
          icon: BarChart3,
          requiredRole: "NGO",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "NGO",
        },
        {
          label: "Account",
          route: "/camps",
          icon: User,
          requiredRole: "NGO",
        },
      ],
    },
  ],

  // ==========================================
  // 7. ADMIN NAVBAR
  // Main visible: Dashboard | Users | Verification | Opportunities | Analytics | More
  // ==========================================
  admin: [
    // 1. Dashboard
    {
      label: "Dashboard",
      route: "/admin/dashboard",
      icon: LayoutDashboard,
      requiredRole: "ADMIN",
    },

    // 2. Users (Dropdown)
    {
      label: "Users",
      route: "/admin/verifications?tab=users",
      icon: Users,
      requiredRole: "ADMIN",
      children: [
        {
          label: "All Users",
          route: "/admin/verifications?tab=users",
          icon: Users,
          requiredRole: "ADMIN",
        },
        {
          label: "Students",
          route: "/institution/students",
          icon: GraduationCap,
          requiredRole: "ADMIN",
        },
        {
          label: "Doctors",
          route: "/doctor/applications",
          icon: Stethoscope,
          requiredRole: "ADMIN",
        },
        {
          label: "Institutions",
          route: "/institution/dashboard",
          icon: Building2,
          requiredRole: "ADMIN",
        },
        {
          label: "Industry",
          route: "/industry/dashboard",
          icon: Briefcase,
          requiredRole: "ADMIN",
        },
        {
          label: "NGOs",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "ADMIN",
        },
      ],
    },

    // 3. Verification (Dropdown)
    {
      label: "Verification",
      route: "/admin/verifications?tab=verifications",
      icon: ShieldCheck,
      requiredRole: "ADMIN",
      badge: { text: "Audit", variant: "amber" },
      children: [
        {
          label: "Verification Queue",
          route: "/admin/verifications?tab=verifications",
          icon: ShieldCheck,
          requiredRole: "ADMIN",
        },
        {
          label: "Student Verification",
          route: "/student/verification",
          icon: GraduationCap,
          requiredRole: "ADMIN",
        },
        {
          label: "Doctor Verification",
          route: "/admin/verifications?tab=verifications",
          icon: Stethoscope,
          requiredRole: "ADMIN",
          badge: { text: "NCISM", variant: "amber" },
        },
        {
          label: "NGO Verification",
          route: "/admin/verifications?tab=verifications",
          icon: HeartHandshake,
          requiredRole: "ADMIN",
          badge: { text: "Darpan", variant: "amber" },
        },
        {
          label: "Document Verification",
          route: "/admin/verifications?tab=verifications",
          icon: FileCheck,
          requiredRole: "ADMIN",
        },
        {
          label: "Certificate Verification",
          route: "/verify/certificate",
          icon: Award,
          requiredRole: "ADMIN",
        },
      ],
    },

    // 4. Opportunities (Dropdown)
    {
      label: "Opportunities",
      route: "/industry/opportunities",
      icon: Briefcase,
      requiredRole: "ADMIN",
      children: [
        {
          label: "Jobs",
          route: "/industry/opportunities",
          icon: Briefcase,
          requiredRole: "ADMIN",
        },
        {
          label: "Internships",
          route: "/internships",
          icon: Search,
          requiredRole: "ADMIN",
        },
        {
          label: "Research",
          route: "/herbs-research",
          icon: Sprout,
          requiredRole: "ADMIN",
        },
        {
          label: "Fellowships",
          route: "/industry/opportunities",
          icon: Award,
          requiredRole: "ADMIN",
        },
        {
          label: "Scholarships",
          route: "/industry/opportunities",
          icon: GraduationCap,
          requiredRole: "ADMIN",
        },
      ],
    },

    // 5. Analytics (Dropdown)
    {
      label: "Analytics",
      route: "/institution/analytics",
      icon: BarChart3,
      requiredRole: "ADMIN",
      badge: { text: "Overview", variant: "teal" },
      children: [
        {
          label: "Platform Analytics",
          route: "/admin/analytics",
          icon: BarChart3,
          requiredRole: "ADMIN",
          badge: { text: "Telemetry", variant: "emerald" },
        },
        {
          label: "User Analytics",
          route: "/institution/analytics",
          icon: Users,
          requiredRole: "ADMIN",
        },
        {
          label: "Opportunity Analytics",
          route: "/industry/analytics",
          icon: Briefcase,
          requiredRole: "ADMIN",
        },
        {
          label: "Internship Analytics",
          route: "/industry/analytics",
          icon: Briefcase,
          requiredRole: "ADMIN",
        },
        {
          label: "NGO/Camp Analytics",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "ADMIN",
        },
        {
          label: "Career Outcomes",
          route: "/student/career",
          icon: Compass,
          requiredRole: "ADMIN",
        },
      ],
    },

    // 6. More (Dropdown)
    {
      label: "More",
      route: "/admin/verifications",
      icon: MoreHorizontal,
      requiredRole: "ADMIN",
      children: [
        {
          label: "Internships",
          route: "/internships",
          icon: Briefcase,
          requiredRole: "ADMIN",
        },
        {
          label: "NGO / Camps",
          route: "/camps",
          icon: HeartHandshake,
          requiredRole: "ADMIN",
          badge: { text: "Camps", variant: "emerald" },
        },
        {
          label: "Learning Hub",
          route: "/learning-hub",
          icon: BookOpen,
          requiredRole: "ADMIN",
        },
        {
          label: "Master AI Studio",
          route: "/ai",
          icon: Sparkles,
          requiredRole: "ADMIN",
          badge: { text: "AI", variant: "emerald" },
        },
        {
          label: "Marketplace",
          route: "/marketplace",
          icon: Layers,
          requiredRole: "ADMIN",
        },
        {
          label: "Events",
          route: "/community-forum",
          icon: Calendar,
          requiredRole: "ADMIN",
        },
        {
          label: "Reports",
          route: "/admin/verifications?tab=reports",
          icon: FileText,
          requiredRole: "ADMIN",
        },
        {
          label: "Audit Logs",
          route: "/admin/verifications?tab=audit",
          icon: History,
          requiredRole: "ADMIN",
          badge: { text: "Audit", variant: "amber" },
        },
        {
          label: "Security",
          route: "/admin/verifications?tab=security",
          icon: ShieldCheck,
          requiredRole: "ADMIN",
        },
        {
          label: "System Settings",
          route: "/admin/verifications?tab=settings",
          icon: Compass,
          requiredRole: "ADMIN",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "ADMIN",
        },
      ],
    },
  ],

  // ==========================================
  // 8. FACULTY NAVBAR
  // Main visible: Dashboard | Teaching Materials | Lecture Planner | AI Assistant | Students | More
  // ==========================================
  faculty: [
    {
      label: "Dashboard",
      route: "/faculty/dashboard",
      icon: LayoutDashboard,
      requiredRole: "FACULTY",
    },
    {
      label: "Teaching Materials",
      route: "/faculty/materials",
      icon: BookOpen,
      requiredRole: "FACULTY",
    },
    {
      label: "Lecture Planner",
      route: "/faculty/lectures",
      icon: Calendar,
      requiredRole: "FACULTY",
    },
    {
      label: "AI Faculty Assistant",
      route: "/faculty/ai-assistant",
      icon: Sparkles,
      requiredRole: "FACULTY",
      badge: { text: "AI", variant: "emerald" },
    },
    {
      label: "Class Students",
      route: "/faculty/students",
      icon: Users,
      requiredRole: "FACULTY",
    },
    {
      label: "Cohort Analytics",
      route: "/faculty/analytics",
      icon: TrendingUp,
      requiredRole: "FACULTY",
      badge: { text: "Insights", variant: "emerald" },
    },
    {
      label: "More",
      route: "#",
      icon: MoreHorizontal,
      requiredRole: "FACULTY",
      children: [
        {
          label: "Faculty Profile",
          route: "/faculty/profile",
          icon: User,
          requiredRole: "FACULTY",
        },
        {
          label: "BAMS Curriculum",
          route: "/learning-hub",
          icon: BookOpen,
          requiredRole: "FACULTY",
        },
        {
          label: "Herbs & Research",
          route: "/herbs-research",
          icon: Sprout,
          requiredRole: "FACULTY",
        },
        {
          label: "3D Anatomy Lab",
          route: "/interactive-3d",
          icon: Layers,
          requiredRole: "FACULTY",
        },
        {
          label: "Community Forum",
          route: "/community-forum",
          icon: MessageSquare,
          requiredRole: "FACULTY",
        },
        {
          label: "Notifications",
          route: "/notifications",
          icon: Bell,
          requiredRole: "FACULTY",
        },
        {
          label: "Feedback & Support",
          route: "/feedback",
          icon: MessageSquare,
          requiredRole: "FACULTY",
        },
      ],
    },
  ],
};

// ==========================================
// HELPER FUNCTIONS & SELECTORS
// ==========================================

/**
 * Returns the primary dashboard route for a given user role.
 */
export function getDashboardRouteForRole(role: string | null | undefined): string {
  if (!role) return "/login";
  const normalizedRole = role.trim().toUpperCase();
  switch (normalizedRole) {
    case "STUDENT":
      return "/student/dashboard";
    case "FACULTY":
      return "/faculty/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "INDUSTRY":
      return "/industry/dashboard";
    case "INSTITUTION":
      return "/institution/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "NGO":
      return "/ngo/dashboard";
    default:
      return "/login";
  }
}

/**
 * Returns the navigation items configured for a given user role.
 * Filters out missing routes by default unless includeMissing is true.
 */
export function getNavForRole(
  role: string | null | undefined,
  includeMissing: boolean = false
): NavItem[] {
  if (!role) {
    return navigationConfig.guest;
  }

  const normalizedRole = role.toUpperCase();
  let items: NavItem[] = [];

  switch (normalizedRole) {
    case "STUDENT":
      items = navigationConfig.student;
      break;
    case "FACULTY":
      items = navigationConfig.faculty;
      break;
    case "DOCTOR":
      items = navigationConfig.doctor;
      break;
    case "INDUSTRY":
      items = navigationConfig.industry;
      break;
    case "INSTITUTION":
      items = navigationConfig.institution;
      break;
    case "NGO":
      items = navigationConfig.ngo;
      break;
    case "ADMIN":
      items = navigationConfig.admin;
      break;
    default:
      items = navigationConfig.guest;
  }

  if (includeMissing) {
    return items;
  }

  // Filter out top-level missing items and filter children
  return items
    .filter((item) => !item.isMissing)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => !child.isMissing),
        };
      }
      return item;
    });
}
