// AyurSetu Realistic Demonstration Data Store
// Strictly isolated from production database records

export interface DemoStudentProfile {
  name: string;
  role: string;
  avatarUrl: string;
  bannerUrl: string;
  ayushId: string;
  motto: string;
  education: {
    degree: string;
    professionalYear: string;
    college: string;
    university: string;
    city: string;
    state: string;
    graduationYear: number;
    cgpa: number;
    rank: string;
    attendance: number;
  };
  subjects: {
    code: string;
    name: string;
    sanskritName: string;
    year: number;
    progress: number;
    grade: string;
    clinicalHours: number;
    status: "COMPLETED" | "IN_PROGRESS" | "UPCOMING";
  }[];
  skills: {
    id: string;
    name: string;
    category: string;
    proficiency: "NOVICE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    verified: boolean;
    levelPercentage: number;
    endorsedBy: string;
  }[];
  career: {
    goal: string;
    shortDescription: string;
    targetDomain: string;
    readinessScore: number;
    readinessClassification: string;
    fitTier: string;
    roadmapSteps: {
      stage: number;
      title: string;
      timeline: string;
      status: "COMPLETED" | "CURRENT" | "UPCOMING";
      description: string;
      competencies: string[];
    }[];
  };
  readinessBreakdown: {
    domain: string;
    score: number;
    benchmark: number;
    status: "EXEMPLARY" | "READY" | "DEVELOPING";
  }[];
  skillGaps: {
    skill: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    currentScore: number;
    requiredScore: number;
    actionItem: string;
    recommendedModule: string;
  }[];
  learningPath: {
    unit: string;
    title: string;
    duration: string;
    progress: number;
    topicsCount: number;
    completedTopics: number;
    status: "COMPLETED" | "IN_PROGRESS" | "UPCOMING";
  }[];
  assessments: {
    id: string;
    title: string;
    category: string;
    dateCompleted: string;
    score: number;
    maxScore: number;
    percentile: number;
    status: "PASSED" | "EXCELLENT" | "NEEDS_IMPROVEMENT";
    certificateUrl?: string;
  }[];
  applications: {
    id: string;
    roleTitle: string;
    organization: string;
    type: "INTERNSHIP" | "RESEARCH_FELLOWSHIP" | "CLINICAL_CLERKSHIP" | "JOB";
    appliedDate: string;
    status: "SELECTED" | "SHORTLISTED" | "UNDER_REVIEW" | "COMPLETED";
    statusColor: string;
    stipend: string;
    location: string;
  }[];
  opportunities: {
    id: string;
    title: string;
    organization: string;
    type: "INTERNSHIP" | "JOB" | "FELLOWSHIP" | "SCHOLARSHIP" | "CLINICAL_CLERKSHIP";
    location: string;
    stipend: string;
    deadline: string;
    tags: string[];
    matchScore: number;
  }[];
  research: {
    id: string;
    title: string;
    journal: string;
    year: number;
    doi: string;
    role: string;
    abstract: string;
  }[];
  scholarships: {
    title: string;
    awardingBody: string;
    amount: string;
    year: string;
    status: string;
  }[];
  aiRecommendations: {
    type: "SKILL" | "INTERNSHIP" | "RESEARCH" | "EXAM";
    headline: string;
    reason: string;
    actionLabel: string;
    targetRoute: string;
  }[];
  resume: {
    headline: string;
    summary: string;
    clinicalRotations: string[];
    certifications: string[];
    languages: string[];
  };
  portfolio: {
    slug: string;
    headline: string;
    clinicalCasesCount: number;
    publishedHerbaria: number;
    verifiedBadgesCount: number;
    publicUrl: string;
  };
  learningResources: {
    title: string;
    author: string;
    format: "CLASSICAL_TEXT" | "DIGITAL_COMPENDIUM" | "INTERACTIVE_3D" | "VIDEO_LECTURE";
    subject: string;
    link: string;
  }[];
  bamsSyllabusProgress: {
    overallPercentage: number;
    year1: number;
    year2: number;
    year3: number;
    year4: number;
  };
  examPreparation: {
    targetExam: string;
    predictedScore: number;
    targetScore: number;
    totalMockTests: number;
    avgAccuracy: number;
    highYieldTopicsMastered: number;
    nextMockDate: string;
  };
  quizHistory: {
    id: string;
    topic: string;
    questionsCount: number;
    scorePercentage: number;
    date: string;
    prakritiMatch: string;
  }[];
  caseStudies: {
    id: string;
    title: string;
    disease: string;
    sanskritName: string;
    patientAge: number;
    patientGender: string;
    prakriti: string;
    doshaImbalance: string;
    lineOfTreatment: string;
    outcome: string;
  }[];
  timetable: {
    day: string;
    slots: {
      time: string;
      subject: string;
      type: "CLINICAL_OPD" | "THEORY_LECTURE" | "DISSECTION" | "PHARMACY_LAB" | "SELF_STUDY";
      location: string;
    }[];
  }[];
  expertSessions: {
    id: string;
    doctorName: string;
    doctorQualification: string;
    title: string;
    dateTime: string;
    meetingMode: "LIVE_STREAM" | "RECORDED_LECTURE";
    duration: string;
    status: "UPCOMING" | "RECORDED";
    rating: number;
    recordingUrl?: string;
  }[];
  followedExperts: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
    rating: number;
    menteesCount: number;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    timeAgo: string;
    type: "OPPORTUNITY" | "SESSION" | "ASSESSMENT" | "CAMP" | "ACADEMIC";
    read: boolean;
  }[];
  eventsAndCamps: {
    id: string;
    title: string;
    ngoName: string;
    date: string;
    location: string;
    role: string;
    expectedBeneficiaries: number;
  }[];
  certificates: {
    id: string;
    title: string;
    issuer: string;
    issueDate: string;
    credentialId: string;
    verificationUrl: string;
  }[];
  achievements: {
    icon: string;
    title: string;
    description: string;
    date: string;
  }[];
}

export const DEMO_STUDENT: DemoStudentProfile = {
  name: "Aarav Sharma",
  role: "STUDENT",
  avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
  bannerUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  ayushId: "AYU-BAMS-2023-8824",
  motto: "हिताहितं सुखं दुःखमायुस्तस्य हिताहितम्। मानं च तच्च यत्रोक्तमायुर्वेदः स उच्यते॥",
  education: {
    degree: "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
    professionalYear: "Final Professional Year (Year 4)",
    college: "National Institute of Ayurveda (Deemed to be University)",
    university: "Ministry of AYUSH, Govt. of India",
    city: "Jaipur",
    state: "Rajasthan",
    graduationYear: 2027,
    cgpa: 8.92,
    rank: "Rank 3 in Department of Dravyaguna",
    attendance: 94.6,
  },
  subjects: [
    { code: "BAMS-401", name: "Kayachikitsa (Internal Medicine)", sanskritName: "कायचिकित्सा", year: 4, progress: 88, grade: "A+", clinicalHours: 160, status: "IN_PROGRESS" },
    { code: "BAMS-402", name: "Panchakarma (Detoxification Therapy)", sanskritName: "पञ्चकर्म", year: 4, progress: 92, grade: "O", clinicalHours: 140, status: "IN_PROGRESS" },
    { code: "BAMS-403", name: "Shalya Tantra (Surgical Principles & Ksharasutra)", sanskritName: "शल्यतन्त्र", year: 4, progress: 84, grade: "A", clinicalHours: 110, status: "IN_PROGRESS" },
    { code: "BAMS-404", name: "Shalakya Tantra (ENT & Ophthalmology)", sanskritName: "शालाक्यतन्त्र", year: 4, progress: 79, grade: "B+", clinicalHours: 85, status: "IN_PROGRESS" },
    { code: "BAMS-301", name: "Dravyaguna Vigyan (Materia Medica & Pharmacology)", sanskritName: "द्रव्यगुण विज्ञान", year: 3, progress: 96, grade: "O", clinicalHours: 180, status: "COMPLETED" },
    { code: "BAMS-302", name: "Rasashastra & Bhaishajya Kalpana (Pharmaceutics)", sanskritName: "रसशास्त्र एवं भैषज्य कल्पना", year: 3, progress: 94, grade: "O", clinicalHours: 150, status: "COMPLETED" },
    { code: "BAMS-201", name: "Rog Nidan & Vikriti Vigyan (Diagnostics & Pathology)", sanskritName: "रोग निदान एवं विकृति विज्ञान", year: 2, progress: 91, grade: "A+", clinicalHours: 120, status: "COMPLETED" },
    { code: "BAMS-101", name: "Kriya Sharir (Ayurvedic Human Physiology)", sanskritName: "क्रिया शारीर", year: 1, progress: 95, grade: "O", clinicalHours: 100, status: "COMPLETED" },
  ],
  skills: [
    { id: "sk-1", name: "Botanical Marker Extraction & HPLC", category: "Pharmacognosy", proficiency: "ADVANCED", verified: true, levelPercentage: 92, endorsedBy: "Himalaya Wellness R&D" },
    { id: "sk-2", name: "Janu Basti & Kati Basti Protocols", category: "Panchakarma", proficiency: "EXPERT", verified: true, levelPercentage: 95, endorsedBy: "National Institute of Ayurveda" },
    { id: "sk-3", name: "Nadi Pariksha (Pulse Diagnosis)", category: "Clinical Diagnostics", proficiency: "ADVANCED", verified: true, levelPercentage: 86, endorsedBy: "Dr. Rajesh Varma, MD" },
    { id: "sk-4", name: "Ayurvedic Pharmacopoeia (API) Standardization", category: "Pharmacology", proficiency: "ADVANCED", verified: true, levelPercentage: 89, endorsedBy: "Ministry of AYUSH Board" },
    { id: "sk-5", name: "Ksharasutra Preparation & Anorectal Care", category: "Shalya Tantra", proficiency: "INTERMEDIATE", verified: true, levelPercentage: 78, endorsedBy: "Dept. of Surgery, NIA" },
    { id: "sk-6", name: "Classical Sanskrit Caraka Samhita Exegesis", category: "Samhita & Siddhanta", proficiency: "ADVANCED", verified: true, levelPercentage: 90, endorsedBy: "All India Ayurveda Congress" },
    { id: "sk-7", name: "Clinical Case Documentation (GCP Compliant)", category: "Research", proficiency: "ADVANCED", verified: true, levelPercentage: 88, endorsedBy: "AyurSetu Clinical Registry" },
  ],
  career: {
    goal: "Ayurvedic Pharmaceutical R&D & Clinical Standardization Specialist",
    shortDescription: "Bridging classical botanical wisdom with modern chromatographic assays, GMP standardization, and clinical efficacy trials.",
    targetDomain: "Pharmaceutical Research & Formulation Development",
    readinessScore: 86,
    readinessClassification: "High Career Fit • Tier-1 Ready",
    fitTier: "Tier 1 (Top 6%)",
    roadmapSteps: [
      {
        stage: 1,
        title: "BAMS Classical Foundations & Botany",
        timeline: "Years 1–2",
        status: "COMPLETED",
        description: "Mastered Sanskrit verses of Caraka, Sushruta, and fundamental concepts of Tridosha, Dhatu, and Mala.",
        competencies: ["Rachana Sharir", "Kriya Sharir", "Dravyaguna Identification"],
      },
      {
        stage: 2,
        title: "Pharmacognosy & Clinical Rotations",
        timeline: "Years 3–4",
        status: "CURRENT",
        description: "Advanced lab work in TLC, HPLC, Rasashastra mineral processing, and IPD clinical rotations.",
        competencies: ["Bhaishajya Kalpana", "Pulse Diagnosis", "Standardization Lab"],
      },
      {
        stage: 3,
        title: "Industrial R&D Internship & Clinical Clerkship",
        timeline: "Post-BAMS (Internship Year)",
        status: "UPCOMING",
        description: "6 months hospital residency followed by 6 months pharmacognosy R&D residency in leading herbal formulation unit.",
        competencies: ["GCP Clinical Trials", "Regulatory Dossier Prep", "IPD Ward Management"],
      },
      {
        stage: 4,
        title: "MD (Ayu) / AYUSH Fellowship & Research Lead",
        timeline: "Postgraduate & Beyond",
        status: "UPCOMING",
        description: "Postgraduate specialization in Dravyaguna or Rasashastra with senior leadership at AYUSH research center.",
        competencies: ["Principal Investigator Certification", "Formulation Patenting"],
      },
    ],
  },
  readinessBreakdown: [
    { domain: "Classical Ayurvedic Theory", score: 92, benchmark: 80, status: "EXEMPLARY" },
    { domain: "Botanical & Chemical Assays", score: 88, benchmark: 75, status: "EXEMPLARY" },
    { domain: "Clinical Diagnostics & Nadi", score: 84, benchmark: 75, status: "READY" },
    { domain: "Regulatory & GCP Guidelines", score: 79, benchmark: 70, status: "READY" },
    { domain: "Pharmaceutical Documentation", score: 86, benchmark: 72, status: "EXEMPLARY" },
  ],
  skillGaps: [
    {
      skill: "High-Performance Thin-Layer Chromatography (HPTLC)",
      priority: "HIGH",
      currentScore: 68,
      requiredScore: 85,
      actionItem: "Complete the 10-hour virtual simulation on HPTLC botanical fingerprinting in Learning Hub.",
      recommendedModule: "Advanced Phytochemical Marker Profiling (Mod-4)",
    },
    {
      skill: "ICH-GCP Guidelines for AYUSH Clinical Trials",
      priority: "MEDIUM",
      currentScore: 72,
      requiredScore: 80,
      actionItem: "Review Ministry of AYUSH Good Clinical Practice guidelines and submit self-assessment.",
      recommendedModule: "AYUSH Regulatory Compliance (Mod-2)",
    },
  ],
  learningPath: [
    { unit: "Unit 1", title: "Phytochemistry & Botanical Chromatography", duration: "18 Hours", progress: 100, topicsCount: 12, completedTopics: 12, status: "COMPLETED" },
    { unit: "Unit 2", title: "Advanced Nadi Pariksha & Pulse Oscillometry", duration: "14 Hours", progress: 85, topicsCount: 10, completedTopics: 8, status: "IN_PROGRESS" },
    { unit: "Unit 3", title: "Panchakarma Protocol Design for Metabolic Disorders", duration: "16 Hours", progress: 60, topicsCount: 8, completedTopics: 5, status: "IN_PROGRESS" },
    { unit: "Unit 4", title: "Regulatory Documentation for Herbal Formulations", duration: "12 Hours", progress: 0, topicsCount: 6, completedTopics: 0, status: "UPCOMING" },
  ],
  assessments: [
    { id: "ass-1", title: "Ayurvedic Pharmacognosy & Phytochemistry Benchmark", category: "Dravyaguna", dateCompleted: "28 Feb 2026", score: 88, maxScore: 100, percentile: 94.5, status: "EXCELLENT", certificateUrl: "/verify/certificate/AYU-CERT-9482" },
    { id: "ass-2", title: "Kayachikitsa Differential Diagnostics Assessment", category: "Clinical Medicine", dateCompleted: "15 Jan 2026", score: 84, maxScore: 100, percentile: 90.2, status: "PASSED", certificateUrl: "/verify/certificate/AYU-CERT-9120" },
    { id: "ass-3", title: "Panchakarma Protocol & Basti Competency Evaluation", category: "Panchakarma", dateCompleted: "10 Nov 2025", score: 92, maxScore: 100, percentile: 98.1, status: "EXCELLENT", certificateUrl: "/verify/certificate/AYU-CERT-8812" },
  ],
  applications: [
    { id: "app-101", roleTitle: "Herbal Formulation & Standardization Intern", organization: "Himalaya Wellness Research Labs", type: "INTERNSHIP", appliedDate: "02 Mar 2026", status: "SELECTED", statusColor: "emerald", stipend: "₹22,000 / month", location: "Bengaluru, Karnataka" },
    { id: "app-102", roleTitle: "Clinical Panchakarma Research Fellow", organization: "All India Institute of Ayurveda (AIIA)", type: "CLINICAL_CLERKSHIP", appliedDate: "18 Feb 2026", status: "SHORTLISTED", statusColor: "blue", stipend: "₹25,000 / month", location: "New Delhi" },
    { id: "app-103", roleTitle: "Quality Control & Botanical Assay Analyst", organization: "Dabur Ayush Research Center", type: "INTERNSHIP", appliedDate: "05 Feb 2026", status: "UNDER_REVIEW", statusColor: "amber", stipend: "₹18,000 / month", location: "Ghaziabad, UP" },
    { id: "app-104", roleTitle: "AYUSH Rural Health Fellowship", organization: "CCRAS Regional Research Institute", type: "RESEARCH_FELLOWSHIP", appliedDate: "12 Dec 2025", status: "COMPLETED", statusColor: "purple", stipend: "₹20,000 / month", location: "Jaipur, Rajasthan" },
  ],
  opportunities: [
    { id: "opp-1", title: "Ayurvedic Pharmaceutical R&D Trainee", organization: "Himalaya Wellness Research Labs", type: "INTERNSHIP", location: "Bengaluru, KA", stipend: "₹22,000/mo", deadline: "15 Apr 2026", tags: ["HPLC", "Dravyaguna", "R&D"], matchScore: 96 },
    { id: "opp-2", title: "Junior Clinical Research Associate (Panchakarma)", organization: "All India Institute of Ayurveda (AIIA)", type: "CLINICAL_CLERKSHIP", location: "New Delhi", stipend: "₹25,000/mo", deadline: "30 Apr 2026", tags: ["Clinical", "Panchakarma", "GCP"], matchScore: 92 },
    { id: "opp-3", title: "Botanical Standardisation & Pharmacognosy Officer", organization: "Patanjali Research Foundation", type: "JOB", location: "Haridwar, UK", stipend: "₹4.8 - 6.0 LPA", deadline: "20 May 2026", tags: ["Pharmacopoeia", "Quality Control"], matchScore: 88 },
    { id: "opp-4", title: "National AYUSH Undergraduate Research Fellowship", organization: "Ministry of AYUSH", type: "SCHOLARSHIP", location: "Pan-India", stipend: "₹50,000 Grant", deadline: "01 Jun 2026", tags: ["Research", "Scholarship"], matchScore: 95 },
  ],
  research: [
    {
      id: "res-1",
      title: "Quantitative HPTLC Fingerprinting of Withanolide-A in Hydro-Alcoholic Extracts of Withania Somnifera",
      journal: "Journal of Ayurveda and Integrative Medicine (JAIM)",
      year: 2025,
      doi: "10.1016/j.jaim.2025.100912",
      role: "Lead Student Author",
      abstract: "Demonstrated reproducible chromatographic separation of active steroidal lactones with 98.2% recovery, establishing simplified quality control protocols for cottage-scale Ayurvedic pharmacies.",
    },
    {
      id: "res-2",
      title: "Comparative Clinical Assessment of Janu Basti with Sahacharadi Taila vs Conventional NSAIDs in Osteoarthritis",
      journal: "International Journal of Ayurvedic Medicine",
      year: 2025,
      doi: "10.47552/ijam.v16i2.4109",
      role: "Co-Investigator",
      abstract: "Evaluated 60 knee osteoarthritis patients across a 6-week protocol. Observed statistically significant 42% reduction in WOMAC pain indices with zero adverse gastrointestinal effects.",
    },
  ],
  scholarships: [
    {
      title: "AYUSH National Undergraduate Merit Scholarship",
      awardingBody: "Central Council for Research in Ayurvedic Sciences (CCRAS)",
      amount: "₹60,000 / Academic Year",
      year: "2024–2026",
      status: "ACTIVE • RENEWED",
    },
  ],
  aiRecommendations: [
    {
      type: "SKILL",
      headline: "Accelerate your HPTLC proficiency",
      reason: "Matched with 3 top pharma R&D openings requiring botanical fingerprint verification.",
      actionLabel: "Launch Virtual Assay Lab",
      targetRoute: "/student/skills",
    },
    {
      type: "INTERNSHIP",
      headline: "96% match with Himalaya Wellness R&D posting",
      reason: "Your high Dravyaguna score and research paper make you an ideal candidate.",
      actionLabel: "View Application Details",
      targetRoute: "/student/opportunities",
    },
    {
      type: "EXAM",
      headline: "AIAPGET Kayachikitsa high-yield revision recommended",
      reason: "Next practice mock scheduled in 4 days. 12 weak sub-topics identified.",
      actionLabel: "Start Practice Quiz",
      targetRoute: "/student/quiz",
    },
  ],
  resume: {
    headline: "BAMS Scholar & Herbal R&D Enthusiast • NIA Jaipur",
    summary: "Dedicated Final Year BAMS scholar with hands-on proficiency in botanical standardization, clinical Panchakarma procedures, and chromatographic marker analysis. Recipient of CCRAS National Merit Fellowship.",
    clinicalRotations: [
      "Department of Kayachikitsa (NIA Hospital) - 160 Hours",
      "Panchakarma In-Patient Dept. - 140 Hours",
      "Shalya Tantra Minor OT & Anorectal Unit - 110 Hours",
    ],
    certifications: [
      "AyurSetu Certified Pharmacognosy Specialist (2026)",
      "AYUSH GCP Clinical Trial Practice (2025)",
      "Basic Life Support (BLS) Healthcare Provider (2024)",
    ],
    languages: ["English (Fluent)", "Hindi (Native)", "Sanskrit (Classical & Clinical)"],
  },
  portfolio: {
    slug: "aarav-sharma-bams",
    headline: "Ayurvedic Medical Portfolio & Research Dossier",
    clinicalCasesCount: 14,
    publishedHerbaria: 38,
    verifiedBadgesCount: 6,
    publicUrl: "/portfolio/aarav-sharma-bams",
  },
  learningResources: [
    { title: "Caraka Samhita with Cakrapani Ayurveda Dipika Commentary", author: "Agnivesha / Caraka", format: "CLASSICAL_TEXT", subject: "Siddhanta", link: "/learning-hub" },
    { title: "Illustrated Dravyaguna Vigyan Compendium (Vols I & II)", author: "Prof. P.V. Sharma", format: "DIGITAL_COMPENDIUM", subject: "Dravyaguna", link: "/learning-hub" },
    { title: "3D Interactive Human Musculoskeletal & Marma Anatomy", author: "AyurSetu Visualizer", format: "INTERACTIVE_3D", subject: "Rachana Sharir", link: "/interactive-3d" },
    { title: "Standard Operating Procedures for Classical Panchakarma Formulations", author: "National Institute of Ayurveda", format: "VIDEO_LECTURE", subject: "Panchakarma", link: "/student/sessions" },
  ],
  bamsSyllabusProgress: {
    overallPercentage: 86,
    year1: 100,
    year2: 100,
    year3: 94,
    year4: 76,
  },
  examPreparation: {
    targetExam: "AIAPGET (All India AYUSH Post Graduate Entrance Test)",
    predictedScore: 382,
    targetScore: 400,
    totalMockTests: 8,
    avgAccuracy: 84.8,
    highYieldTopicsMastered: 42,
    nextMockDate: "12 Mar 2026",
  },
  quizHistory: [
    { id: "qz-1", topic: "Dravyaguna - Rasa, Guna, Virya, Vipaka", questionsCount: 25, scorePercentage: 92, date: "02 Mar 2026", prakritiMatch: "Kapha-Pitta" },
    { id: "qz-2", topic: "Panchakarma - Sneha & Sveda Classifications", questionsCount: 20, scorePercentage: 85, date: "24 Feb 2026", prakritiMatch: "Vata-Kapha" },
    { id: "qz-3", topic: "Kayachikitsa - Jwara & Amavata Nidana", questionsCount: 30, scorePercentage: 88, date: "16 Feb 2026", prakritiMatch: "Vata-Pitta" },
    { id: "qz-4", topic: "Shalya - Ksharasutra Preparation & Ashtavidha Shastra Karma", questionsCount: 15, scorePercentage: 80, date: "08 Feb 2026", prakritiMatch: "Pitta" },
    { id: "qz-5", topic: "Bhaishajya Kalpana - Asava, Arishta & Avaleha", questionsCount: 20, scorePercentage: 95, date: "29 Jan 2026", prakritiMatch: "Tridoshic" },
  ],
  caseStudies: [
    {
      id: "cs-1",
      title: "Management of Chronic Amavata (Rheumatoid Arthritis) via Baluka Sveda & Simhanada Guggulu",
      disease: "Amavata",
      sanskritName: "आमवात",
      patientAge: 48,
      patientGender: "Female",
      prakriti: "Vata-Kapha",
      doshaImbalance: "Vata & Ama in Sandhi-sthana",
      lineOfTreatment: "Deepana-Pachana, Rooksha Sveda (Baluka), Virechana, followed by Rasayana therapy.",
      outcome: "Marked relief in morning stiffness from 90 mins to 15 mins. ESR dropped from 68 to 24 mm/hr over 8 weeks.",
    },
    {
      id: "cs-2",
      title: "Integrated Ayurvedic Protocol for Tamaka Shwasa (Bronchial Asthma) with Kantakaryavaleha",
      disease: "Tamaka Shwasa",
      sanskritName: "तमक श्वास",
      patientAge: 34,
      patientGender: "Male",
      prakriti: "Kapha-Vata",
      doshaImbalance: "Prana Vaha Srotas obstruction by Kapha",
      lineOfTreatment: "Vamana Karma, Swasahara Kashaya, Shringyadi Churna, and Pranayama lifestyle modification.",
      outcome: "Peak Expiratory Flow Rate (PEFR) improved by 34%. Inhaler frequency reduced by 80%.",
    },
    {
      id: "cs-3",
      title: "Clinical Remediation of Grahani Dosha (Irritable Bowel Syndrome) using Takrarishta & Bilvadi Gutika",
      disease: "Grahani Roga",
      sanskritName: "ग्रहणी रोग",
      patientAge: 29,
      patientGender: "Male",
      prakriti: "Pitta-Vata",
      doshaImbalance: "Agnimandya & Sama-Kapha in Pitta-dhara Kala",
      lineOfTreatment: "Takra Kalpana, Deepana, Pachana, and Gut-Brain axis counseling.",
      outcome: "Bowel frequency normalized to once daily; patient reported 90% reduction in post-prandial abdominal discomfort.",
    },
  ],
  timetable: [
    {
      day: "Monday",
      slots: [
        { time: "08:30 AM - 11:30 AM", subject: "Kayachikitsa IPD Ward Clinical Rounds", type: "CLINICAL_OPD", location: "NIA Hospital Ward 4" },
        { time: "11:45 AM - 01:00 PM", subject: "Dravyaguna Vigyan Advanced Lab (HPLC Analysis)", type: "PHARMACY_LAB", location: "Herbal Formulation Unit" },
        { time: "02:00 PM - 03:30 PM", subject: "Panchakarma Lecture (Snehana & Basti Protocols)", type: "THEORY_LECTURE", location: "Hall A, Academic Block" },
        { time: "04:00 PM - 05:30 PM", subject: "Caraka Samhita Sloka Chanting & Clinical Exegesis", type: "SELF_STUDY", location: "Central Library Reading Room" },
      ],
    },
    {
      day: "Tuesday",
      slots: [
        { time: "08:30 AM - 11:30 AM", subject: "Panchakarma Therapy Unit (Basti, Nasya Administration)", type: "CLINICAL_OPD", location: "Panchakarma Block" },
        { time: "11:45 AM - 01:00 PM", subject: "Shalya Tantra Anorectal Clinic & Ksharasutra Demo", type: "CLINICAL_OPD", location: "Minor OT Complex" },
        { time: "02:00 PM - 03:30 PM", subject: "Rog Nidan Pathology & Nadi Pariksha Practical", type: "PHARMACY_LAB", location: "Diagnostic Laboratory" },
        { time: "04:00 PM - 05:30 PM", subject: "AIAPGET Mock Practice Test & High-Yield Quiz", type: "SELF_STUDY", location: "AyurSetu Digital Lab" },
      ],
    },
    {
      day: "Wednesday",
      slots: [
        { time: "08:30 AM - 11:30 AM", subject: "Community AYUSH Health Camp (Rural Outreach)", type: "CLINICAL_OPD", location: "Khed Gram Panchayat Center" },
        { time: "01:30 PM - 03:00 PM", subject: "Rasashastra Bhasma Preparation & Metallurgy Lab", type: "PHARMACY_LAB", location: "Rasashastra Workshop" },
        { time: "03:30 PM - 05:00 PM", subject: "Expert Mentorship Session with Dr. Rajesh Varma", type: "THEORY_LECTURE", location: "Virtual Seminar Room" },
      ],
    },
    {
      day: "Thursday",
      slots: [
        { time: "08:30 AM - 11:30 AM", subject: "General OPD Diagnosis & Pulse Evaluation", type: "CLINICAL_OPD", location: "OPD Complex Room 12" },
        { time: "11:45 AM - 01:00 PM", subject: "Ayurvedic Medical Jurisprudence (Agada Tantra)", type: "THEORY_LECTURE", location: "Lecture Hall B" },
        { time: "02:00 PM - 04:00 PM", subject: "Herbarium Botanical Garden Specimen Collection", type: "PHARMACY_LAB", location: "NIA Botanical Reserve" },
      ],
    },
    {
      day: "Friday",
      slots: [
        { time: "08:30 AM - 11:30 AM", subject: "Prasuti Tantra & Pediatric Kaumarbhritya Ward", type: "CLINICAL_OPD", location: "Maternal Care Unit" },
        { time: "11:45 AM - 01:00 PM", subject: "Evidence-Based Ayurvedic Case Presentation", type: "THEORY_LECTURE", location: "Auditorium Hall" },
        { time: "02:00 PM - 04:30 PM", subject: "Himalaya Wellness Internship Project Work", type: "PHARMACY_LAB", location: "R&D Collaborative Lab" },
      ],
    },
  ],
  expertSessions: [
    {
      id: "sess-1",
      doctorName: "Dr. Rajesh Varma, BAMS, MD (Ayu)",
      doctorQualification: "Senior Physician & Panchakarma Specialist",
      title: "Evidence-Based Pulse Diagnosis (Nadi Pariksha) in Complex Autoimmune Disorders",
      dateTime: "14 Mar 2026 • 06:00 PM IST",
      meetingMode: "LIVE_STREAM",
      duration: "90 mins",
      status: "UPCOMING",
      rating: 4.95,
      recordingUrl: "https://meet.google.com/ayu-setu-demo",
    },
    {
      id: "sess-2",
      doctorName: "Dr. Priya Nambiar, MD (Dravyaguna)",
      doctorQualification: "Head of Phytochemistry, Kerala Ayurveda Institute",
      title: "Standardization of Medhya Rasayana Herbs for Neuro-Degenerative Care",
      dateTime: "20 Mar 2026 • 05:30 PM IST",
      meetingMode: "LIVE_STREAM",
      duration: "75 mins",
      status: "UPCOMING",
      rating: 4.88,
      recordingUrl: "https://meet.google.com/ayu-setu-demo",
    },
    {
      id: "sess-3",
      doctorName: "Dr. Anand Joshi, MS (Shalya Tantra)",
      doctorQualification: "Consultant Surgeon, NIA Jaipur",
      title: "Masterclass: Standard Ksharasutra Ligation for Complex Fistula-in-Ano",
      dateTime: "15 Feb 2026 • Recorded",
      meetingMode: "RECORDED_LECTURE",
      duration: "110 mins",
      status: "RECORDED",
      rating: 4.98,
      recordingUrl: "https://ayursetu.in/lectures/ksharasutra-masterclass",
    },
  ],
  followedExperts: [
    { id: "exp-1", name: "Dr. Rajesh Varma, BAMS, MD", specialization: "Kayachikitsa & Panchakarma", hospital: "Varma Ayurvedic Hospital, New Delhi", rating: 4.9, menteesCount: 12 },
    { id: "exp-2", name: "Dr. Priya Nambiar, MD", specialization: "Dravyaguna & Botanical Assays", hospital: "Kerala Ayurveda Research Institute", rating: 4.8, menteesCount: 8 },
    { id: "exp-3", name: "Dr. Anand Joshi, MS (Ayu)", specialization: "Shalya Tantra & Ksharasutra", hospital: "National Institute of Ayurveda, Jaipur", rating: 4.95, menteesCount: 15 },
  ],
  notifications: [
    { id: "notif-1", title: "Internship Selected!", message: "Congratulations! Himalaya Wellness Research Labs has accepted your application for Herbal Formulation Trainee.", timeAgo: "2 hours ago", type: "OPPORTUNITY", read: false },
    { id: "notif-2", title: "Upcoming Live Session", message: "Dr. Rajesh Varma's Masterclass on Nadi Pariksha starts on 14 Mar at 06:00 PM. Access link ready.", timeAgo: "1 day ago", type: "SESSION", read: false },
    { id: "notif-3", title: "Verified Certificate Generated", message: "Your certificate for 'Ayurvedic Pharmacognosy Benchmark' (Score: 88/100) has been cryptographically signed.", timeAgo: "3 days ago", type: "ASSESSMENT", read: true },
    { id: "notif-4", title: "Suvarnaprashan Health Camp", message: "You are assigned as Student Lead Coordinator for the Pune Rural Camp on 15 Oct 2026.", timeAgo: "5 days ago", type: "CAMP", read: true },
  ],
  eventsAndCamps: [
    { id: "camp-1", title: "Mega AYUSH Rural Wellness & Janu Basti Camp", ngoName: "Arogya Seva AYUSH Foundation", date: "15 Oct 2026", location: "Khed, Pune Rural", role: "Student Coordinator", expectedBeneficiaries: 250 },
    { id: "camp-2", title: "Global AYUSH Research & Industry Expo 2026", ngoName: "Ministry of AYUSH", date: "12 Nov 2026", location: "Pragati Maidan, New Delhi", role: "Paper Presenter", expectedBeneficiaries: 1200 },
  ],
  certificates: [
    { id: "cert-1", title: "AyurSetu Verified Pharmacognosy & Phytochemistry Specialist", issuer: "AyurSetu Central Academic Board", issueDate: "28 Feb 2026", credentialId: "AYU-CERT-9482-BAMS", verificationUrl: "/verify/certificate/AYU-CERT-9482" },
    { id: "cert-2", title: "Good Clinical Practice (GCP) for AYUSH Investigators", issuer: "CCRAS / Ministry of AYUSH", issueDate: "15 Jan 2026", credentialId: "AYU-CERT-9120-GCP", verificationUrl: "/verify/certificate/AYU-CERT-9120" },
    { id: "cert-3", title: "Certificate of Clinical Excellence in Panchakarma Procedures", issuer: "National Institute of Ayurveda", issueDate: "10 Nov 2025", credentialId: "AYU-CERT-8812-PK", verificationUrl: "/verify/certificate/AYU-CERT-8812" },
  ],
  achievements: [
    { icon: "Award", title: "National Merit Fellow", description: "Awarded CCRAS National Undergraduate Merit Scholarship 2024–2026.", date: "Dec 2024" },
    { icon: "Sparkles", title: "Top 5% Diagnostic Score", description: "Scored 94th percentile in Central Dravyaguna Standardization Exam.", date: "Feb 2026" },
    { icon: "CheckCircle2", title: "100+ Clinical OPD Hours", description: "Logged over 160 hours in Kayachikitsa hospital ward rounds.", date: "Jan 2026" },
    { icon: "ShieldCheck", title: "Verified Student Status", description: "Identity and academic enrollment authenticated by Central Board.", date: "Aug 2023" },
  ],
};

// DOCTOR DEMO DATA
export const DEMO_DOCTOR = {
  name: "Dr. Rajesh Varma",
  prefix: "Dr.",
  qualification: "BAMS, MD (Ayurveda - Kayachikitsa)",
  specialization: "Kayachikitsa & Panchakarma",
  yearsOfExperience: 14,
  verificationStatus: "VERIFIED",
  verificationBadge: true,
  stateMedicalCouncil: "Delhi Bharatiya Chikitsa Parishad (DBCP)",
  registrationNumber: "DBCP-AYU-2012-4091",
  clinic: {
    name: "Varma Ayurvedic Hospital & Panchakarma Research Center",
    address: "B-42, Institutional Area, Hauz Khas",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2658 9100",
    email: "clinic@varmaayurveda.in",
    bedCapacity: 25,
    servicesOffered: [
      "Virechana & Vamana Therapy",
      "Janu Basti & Kati Basti",
      "Shirodhara & Takradhara",
      "Nadi Pariksha & Dietetics",
      "Chronic Arthritic Care",
    ],
  },
  stats: {
    totalStudentsMentored: 128,
    activeInternshipsCount: 4,
    liveSessionsHosted: 24,
    recordedLectures: 18,
    averageRating: 4.92,
    followersCount: 1240,
    expertPoints: 850,
    performanceTier: "Top 1% Mentor",
  },
  internships: [
    { id: "dr-int-1", title: "Clinical Panchakarma Immersion Residency", duration: "6 Months", seats: 4, applicationsCount: 22, status: "OPEN" },
    { id: "dr-int-2", title: "Pulse Diagnosis (Nadi) Clerkship", duration: "3 Months", seats: 2, applicationsCount: 16, status: "OPEN" },
  ],
  sessions: [
    { title: "Evidence-Based Pulse Diagnosis in Autoimmune Disorders", date: "14 Mar 2026 • 06:00 PM IST", mode: "LIVE", attendees: 48 },
    { title: "Managing Severe Sandhivata with Taila Dhara", date: "Recorded • 90 mins", mode: "RECORDED", views: 420 },
  ],
};

// INSTITUTION DEMO DATA
export const DEMO_INSTITUTION = {
  name: "National Institute of Ayurveda (Deemed to be University)",
  aisheCode: "AISHE-C-24150",
  type: "Deemed to be University (Govt. of India)",
  city: "Jaipur",
  state: "Rajasthan",
  stats: {
    enrolledStudents: 480,
    activeDepartments: 8,
    placementRate: 94.2,
    industryTieUps: 36,
    activeInternships: 48,
    facultyCount: 64,
    guidanceRequestsPending: 12,
  },
  departments: [
    "Department of Kayachikitsa",
    "Department of Dravyaguna Vigyan",
    "Department of Panchakarma",
    "Department of Shalya Tantra",
    "Department of Shalakya Tantra",
    "Department of Rasashastra & Bhaishajya Kalpana",
    "Department of Rog Nidan",
    "Department of Samhita & Siddhanta",
  ],
  placements: [
    { company: "Himalaya Wellness", hired: 14, avgPackage: "₹6.2 LPA" },
    { company: "Dabur India Ltd", hired: 11, avgPackage: "₹5.8 LPA" },
    { company: "Patanjali Research Foundation", hired: 9, avgPackage: "₹5.4 LPA" },
    { company: "Kerala Ayurveda", hired: 8, avgPackage: "₹6.0 LPA" },
  ],
};

// INDUSTRY DEMO DATA
export const DEMO_INDUSTRY = {
  companyName: "Himalaya Wellness Research Labs",
  cin: "CIN-U24233KA1930PTC001234",
  domain: "Ayurvedic Phytochemistry & Herbal Standardization",
  location: "Makali, Bengaluru, Karnataka",
  stats: {
    activePostings: 12,
    totalApplicantsPool: 86,
    shortlistedCandidates: 18,
    hiredScholars: 24,
    interviewPipelines: 6,
  },
  topOpportunities: [
    { title: "Herbal Formulation & Standardization Trainee", applicants: 28, deadline: "15 Apr 2026", status: "ACTIVE" },
    { title: "Quality Control HPLC Marker Analyst", applicants: 19, deadline: "30 Apr 2026", status: "ACTIVE" },
    { title: "Botanical Supply Chain Coordinator", applicants: 14, deadline: "10 May 2026", status: "ACTIVE" },
  ],
};

// NGO DEMO DATA
export const DEMO_NGO = {
  name: "Arogya Seva AYUSH Foundation",
  registrationId: "NGO-MH-2018-00912",
  focusArea: "Rural Healthcare, Suvarnaprashan, & Geriatric Wellness",
  headquarters: "Pune, Maharashtra",
  stats: {
    campsConducted: 42,
    patientsServed: 18450,
    volunteerDoctors: 34,
    studentCoordinators: 85,
    upcomingCamps: 3,
  },
  camps: [
    { title: "Mega Rural Wellness & Janu Basti Camp", date: "15 Oct 2026", venue: "Khed, Pune Rural", targetPatients: 250, registeredDoctors: 6 },
    { title: "Suvarnaprashan Child Immunity Camp", date: "28 Oct 2026", venue: "Alandi Devachi", targetPatients: 500, registeredDoctors: 8 },
    { title: "Geriatric Sandhivata & Rasayana Camp", date: "12 Nov 2026", venue: "Baramati District", targetPatients: 300, registeredDoctors: 5 },
  ],
};

// ADMIN DEMO DATA
export const DEMO_ADMIN = {
  role: "System Administrator",
  platform: "AyurSetu Central Governance Portal",
  stats: {
    totalRegisteredUsers: 1420,
    studentsCount: 980,
    doctorsCount: 240,
    institutionsCount: 38,
    industryPartnersCount: 52,
    pendingVerifications: 14,
    verifiedRatePercentage: 96.8,
    systemUptime: "99.98%",
  },
  pendingVerificationTypes: [
    { type: "DOCTOR_LICENSE", applicant: "Dr. Rajesh Varma", regNo: "DBCP-AYU-2012-4091", status: "VERIFIED" },
    { type: "COLLEGE_AISHE", applicant: "National Institute of Ayurveda", regNo: "AISHE-C-24150", status: "VERIFIED" },
    { type: "INDUSTRY_CIN", applicant: "Himalaya Wellness", regNo: "CIN-U24233KA1930PTC001234", status: "VERIFIED" },
  ],
};

/**
 * Checks if a given email is associated with a demo account
 */
export function isDemoEmail(email?: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.includes("@ayursetu.local") ||
    lower === "student@ayursetu.in" ||
    lower === "doctor@ayursetu.in" ||
    lower === "industry@ayursetu.in" ||
    lower === "institute@ayursetu.in" ||
    lower === "institution@ayursetu.in" ||
    lower === "admin@ayursetu.in" ||
    lower.startsWith("demo-") ||
    lower.includes("demo")
  );
}
