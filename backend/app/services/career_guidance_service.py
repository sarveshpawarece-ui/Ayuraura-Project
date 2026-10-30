import re
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_, desc

from app.models.user import User, UserRole
from app.models.domain import StudentProfile, CareerRole
from app.models.bams_ecosystem import StudentBamsProgress
from app.models.career_guidance import (
    StudentCareerGoal,
    StudentCareerBookmark,
    CareerGuidanceResource
)
from app.schemas.career_guidance import (
    CareerPathwayOut,
    CareerPathwayMilestone,
    StudentCareerGoalIn,
    StudentCareerGoalUpdate,
    CareerBookmarkIn,
    CareerResourceCreate,
    CareerResourceUpdate,
    AICareerQAIn,
    AICareerQAOut,
    AICareerPlanIn,
    AICareerPlanOut,
    AICareerMilestone,
    AIInterviewPrepIn,
    AIInterviewPrepOut,
    InterviewQuestionItem,
    AIChecklistIn,
    AIChecklistOut,
    AIChecklistItem,
    StudentCareerRecommendationOut
)

# ============================================================
# COMPREHENSIVE CURATED BAMS CAREER PATHWAYS (8 CORE TRACKS)
# ============================================================

BAMS_CAREER_PATHWAYS: Dict[str, Dict[str, Any]] = {
    "CLINICAL_PRACTICE": {
        "id": "CLINICAL_PRACTICE",
        "title": "Ayurvedic Clinical Practice & Panchakarma",
        "slug": "clinical-practice-panchakarma",
        "category": "CLINICAL",
        "short_summary": "Autonomous clinical consultation, Nadi Pariksha diagnosis, private clinic establishment, and specialized Panchakarma therapeutics.",
        "full_description": (
            "Clinical practice is the cornerstone of Ayurveda. Practitioners evaluate patient Rogi-Roga Pariksha, "
            "prescribe classical herbal formulations (Vati, Asava-Arishta, Churna, Taila), and supervise Panchakarma "
            "bio-cleansing procedures (Vamana, Virechana, Basti, Nasya, Raktamokshana). Career pathways include independent "
            "consultation clinics, polyclinics, specialized Panchakarma centers, and Government Ayurvedic Medical Officer (AMO) posts."
        ),
        "eligibility_requirements": [
            "Valid BAMS Degree recognized by NCISM (National Commission for Indian System of Medicine)",
            "Completion of mandatory 1-year rotatory clinical internship",
            "Permanent registration with State Ayurvedic / Ayush Medical Council or Central Register (NCISM)",
            "Local municipal clinic registration under Clinical Establishments Act"
        ],
        "core_responsibilities": [
            "Comprehensive Ashtavidha & Dashavidha Pariksha (Pulse, Tongue, Eyes, Physical evaluation)",
            "Formulating individualized Chikitsa plans incorporating Ahar (diet), Vihar (lifestyle), and Aushadh (herbs)",
            "Supervising Purvakarma (Snehana-Swedana) and Pradhanakarma procedures in Panchakarma theaters",
            "Managing chronic disorders: metabolic (Prameha/Diabetes), musculoskeletal (Amavata, Sandhigata Vata), skin (Kushtha), gastrointestinal"
        ],
        "suggested_specializations": [
            "Kayachikitsa (Internal Medicine)",
            "Panchakarma (Detoxification & Rejuvenation)",
            "Shalya Tantra (Anorectal & Ksharasutra Therapy)",
            "Prasuti & Stri Roga (Ayurvedic Gynecology & Obstetrics)",
            "Twak Roga & Varnya (Ayurvedic Dermatology)"
        ],
        "recommended_bams_subjects": [
            "Kayachikitsa",
            "Panchakarma",
            "Dravyaguna Vijnana",
            "Bhaishajya Kalpana",
            "Roga Nidana & Vikriti Vijnana"
        ],
        "certifications_and_trainings": [
            "Clinical Panchakarma Hands-on Fellowship",
            "Basic Life Support (BLS) / ACLS Emergency Protocol",
            "NABH Ayush Hospital Quality Standards Orientation",
            "Ksharasutra Anorectal Management Practical Training"
        ],
        "typical_work_environments": [
            "Private Ayurvedic Consultation Clinic",
            "NABH-Accredited Panchakarma Therapy Hospital",
            "Ayush Wellness Center & Integrated Poly-Clinics",
            "State Government Community Health Centers (CHC / PHC)"
        ],
        "educational_milestones": [
            {
                "title": "Clinical Bedside Foundation",
                "target_stage": "3rd & 4th Prof BAMS",
                "description": "Master Ashtavidha Pariksha, classical Rogi assessment, and observation of minimum 50 Panchakarma procedures."
            },
            {
                "title": "Rotatory Internship Mastery",
                "target_stage": "Internship Year",
                "description": "Complete OPD/IPD rotations across Kayachikitsa, Shalya, Shalakya, and Prasuti-Stri Roga. Maintain signed clinical logbook."
            },
            {
                "title": "Licensure & Setup",
                "target_stage": "Post-Graduation (Year 1)",
                "description": "Secure State Medical Registration, obtain Clinical Establishment license, and launch clinical practice or join Ayush hospital."
            }
        ]
    },
    "HOSPITAL_ROLES": {
        "id": "HOSPITAL_ROLES",
        "title": "Hospital Medical Officer & Inpatient Care",
        "slug": "hospital-medical-officer",
        "category": "CLINICAL",
        "short_summary": "Inpatient care management, Resident Medical Officer (RMO) duties, emergency stabilization, and multi-specialty Ayush hospital operations.",
        "full_description": (
            "Hospital-based careers place BAMS doctors in structured inpatient settings. Roles range from Resident Medical "
            "Officers (RMO) overseeing ICU/ward patient monitoring and post-operative Panchakarma recovery to Hospital "
            "Superintendents and Clinical Quality Coordinators ensuring NABH standards compliance."
        ),
        "eligibility_requirements": [
            "Recognized BAMS Degree + Completed 1-year Internship",
            "Valid State Ayush Medical Council Registration",
            "Experience or orientation in Emergency Casualty & Critical Care primary triage",
            "Knowledge of Hospital Management Information Systems (HMIS) and EMR"
        ],
        "core_responsibilities": [
            "Day-to-day IPD ward rounds, patient vitals assessment, and treatment charts monitoring",
            "Administering acute care triage and coordinating emergency cross-referrals with modern medicine departments",
            "Overseeing sterile preparation protocols in Shalya Tantra and Panchakarma procedure suites",
            "Ensuring biomedical waste compliance, documentation integrity, and NABH clinical audit adherence"
        ],
        "suggested_specializations": [
            "Emergency Ayush Care & Shalya Post-Op",
            "Hospital Quality Accreditation (NABH Standards)",
            "Geriatric & Palliative Ayurvedic Care (Jara Chikitsa)",
            "Integrative Medicine Ward Coordination"
        ],
        "recommended_bams_subjects": [
            "Agada Tantra (Toxicology & Medical Jurisprudence)",
            "Shalya Tantra (Surgical Protocols & Trauma)",
            "Kayachikitsa",
            "Swasthavritta (Preventive & Social Medicine)"
        ],
        "certifications_and_trainings": [
            "NABH Accreditation Standards for Ayush Hospitals",
            "Emergency Medical Response & Cardiopulmonary Resuscitation (CPR)",
            "NABH Patient Safety & Infection Control Protocols",
            "Clinical Pharmacology & Drug-Interaction Auditing"
        ],
        "typical_work_environments": [
            "Multi-Specialty Ayush Teaching Hospital",
            "Corporate Integrative Healthcare Centers",
            "Government District Ayurvedic Hospital",
            "Ayurvedic Rehabilitation & Palliative Care Sanitarium"
        ],
        "educational_milestones": [
            {
                "title": "Inpatient Ward Acclimatization",
                "target_stage": "Final Year BAMS",
                "description": "Document 30+ IPD case progress sheets, participate in daily senior rounds, and learn vitals emergency alerts."
            },
            {
                "title": "Night-Duty & Casualty Exposure",
                "target_stage": "Internship Year",
                "description": "Serve active emergency casualty and IPD night shifts under supervision. Learn discharge summary protocols."
            },
            {
                "title": "Staff RMO & Quality Coordinator",
                "target_stage": "Post-Graduation",
                "description": "Join an accredited hospital as Junior RMO; achieve NABH internal auditor certification."
            }
        ]
    },
    "TEACHING_ACADEMIA": {
        "id": "TEACHING_ACADEMIA",
        "title": "Academic Faculty & Teaching Careers",
        "slug": "academic-faculty-teaching",
        "category": "ACADEMIC",
        "short_summary": "Lectureship and professorship in recognized Ayurvedic Medical Colleges under NCISM educational norms.",
        "full_description": (
            "Academic careers offer long-term intellectual fulfillment and societal impact. Under NCISM regulations, "
            "faculty members teach undergraduate (BAMS) and postgraduate (MD/MS) students, guide dissertation research, "
            "author scholarly textbook commentaries, and participate in institutional curriculum development."
        ),
        "eligibility_requirements": [
            "BAMS degree followed by a Post-Graduate degree (MD/MS Ayurveda) in the concerned subject from an NCISM-recognized institution",
            "Permanent registration with State / Central Council",
            "Publications in peer-reviewed journals (UGC-CARE / Scopus-indexed)",
            "Age limit compliance as per state public service commission / college recruitment statutes"
        ],
        "core_responsibilities": [
            "Conducting didactic classroom lectures, Sanskrit shloka recitations, and clinical bed-side demos",
            "Supervising dissection hall demonstrations (Rachana Sharir) and laboratory practicals (Dravyaguna/Rasashastra)",
            "Mentoring undergraduate batches, setting examination papers, and conducting NCISM viva-voce evaluations",
            "Pursuing research projects and publishing academic treatises"
        ],
        "suggested_specializations": [
            "Ayurveda Samhita & Siddhanta (Fundamental Principles)",
            "Rachana Sharira (Anatomy) / Kriya Sharira (Physiology)",
            "Dravyaguna Vijnana (Materia Medica & Pharmacology)",
            "Roga Nidana (Pathology & Diagnostics)"
        ],
        "recommended_bams_subjects": [
            "Ayurveda Samhita & Siddhanta",
            "Rachana Sharira",
            "Kriya Sharira",
            "Dravyaguna Vijnana",
            "Rasashastra & Bhaishajya Kalpana"
        ],
        "certifications_and_trainings": [
            "Medical Education Technology (MET) Faculty Workshop",
            "Research Methodology & Bio-Ethics Certification",
            "Manuscriptology & Classical Sanskrit Translation Workshop",
            "Digital Pedagogy & Smart Classroom Tools Training"
        ],
        "typical_work_environments": [
            "Government Ayurvedic Medical Colleges (GAMC)",
            "Deemed Ayush Universities (e.g. ITRA Jamnagar, NIA Jaipur, AIIA New Delhi)",
            "Private Affiliated Ayush Colleges & Research Institutes",
            "Educational Publishing Houses & EdTech Platforms"
        ],
        "educational_milestones": [
            {
                "title": "Samhita & Theory Deep-Dive",
                "target_stage": "1st-3rd Prof BAMS",
                "description": "Memorize core shlokas from Charaka, Sushruta, and Vagbhata. Deliver student seminars and peer presentations."
            },
            {
                "title": "AIPGET Entrance Clear",
                "target_stage": "Internship Year",
                "description": "Prepare for All India Ayush Post Graduate Entrance Test (AIPGET); secure top rank for MD/MS specialty admission."
            },
            {
                "title": "MD/MS & Faculty Recruitment",
                "target_stage": "Post-MD/MS (3 Years)",
                "description": "Complete 3-year MD/MS thesis, publish minimum 2 papers in UGC-CARE journals, apply for Assistant Professor posts."
            }
        ]
    },
    "RESEARCH": {
        "id": "RESEARCH",
        "title": "Ayush Clinical Research & Drug Discovery",
        "slug": "ayush-clinical-research",
        "category": "RESEARCH",
        "short_summary": "Scientific validation, clinical trials, phytochemical standardization, and research officer positions at CCRAS and ICMR.",
        "full_description": (
            "Modern scientific validation of classical Ayurvedic therapies is a premier national and global priority. "
            "Researchers work in Government premier councils (CCRAS, CSIR, ICMR), academic research units, and "
            "pharmaceutical R&D laboratories, conducting randomized clinical trials, reverse pharmacology, and biomarker studies."
        ),
        "eligibility_requirements": [
            "BAMS degree (MD/MS or M.Sc. Clinical Research / Phytochemistry strongly preferred)",
            "Good Clinical Practice (GCP) certification (ICMR / CDSCO / WHO guidelines)",
            "Proficiency in scientific research methodology, biostatistics, and protocol design",
            "CCRAS / ICMR Research Officer recruitment exam qualification (as per notifications)"
        ],
        "core_responsibilities": [
            "Designing double-blind randomized clinical trial protocols (RCTs) adhering to Ayush ethical norms",
            "Monitoring patient enrollment, adverse event reporting, and pharmacological efficacy data",
            "Collaborating with pharmacologists, biochemists, and botanists on herbal extract standardization",
            "Writing scientific grant proposals for Ayush Extra-Mural Research (EMR) funding"
        ],
        "suggested_specializations": [
            "Dravyaguna & Ethnopharmacology",
            "Rasashastra & Analytical Standardization",
            "Clinical Trial Monitoring & Regulatory Affairs",
            "Bio-informatics & Ayurgenomics (TRISUTRA CSIR initiative)"
        ],
        "recommended_bams_subjects": [
            "Dravyaguna Vijnana",
            "Rasashastra & Bhaishajya Kalpana",
            "Roga Nidana",
            "Agada Tantra (Toxicology)",
            "Research Methodology & Medical Statistics"
        ],
        "certifications_and_trainings": [
            "Good Clinical Practice (GCP) by CDSCO / WHO",
            "Clinical Trial Protocol & Bio-Ethics Training (ICMR-NIE)",
            "High-Performance Liquid Chromatography (HPLC) & HPTLC Analysis",
            "Systematic Reviews & Meta-Analysis (PRISMA guidelines)"
        ],
        "typical_work_environments": [
            "CCRAS Central & Regional Research Institutes",
            "ICMR Integrated Ayush Centers",
            "Contract Research Organizations (CROs) & Pharma R&D Wings",
            "CSIR-Institute of Genomics & Integrative Biology (IGIB)"
        ],
        "educational_milestones": [
            {
                "title": "Research Foundations",
                "target_stage": "3rd & 4th Prof BAMS",
                "description": "Publish a student clinical case report. Master biostatistics fundamentals (p-values, odds ratios, blinding)."
            },
            {
                "title": "GCP & Council Fellowships",
                "target_stage": "Internship Year",
                "description": "Obtain GCP certification. Apply for CCRAS SPARK (Studentship Program for Ayurveda Research Ken)."
            },
            {
                "title": "Junior Research Fellow (JRF) / Ph.D.",
                "target_stage": "Post-Graduation",
                "description": "Join sponsored Ayush clinical trial projects as JRF / Clinical Research Associate; enroll in Ph.D."
            }
        ]
    },
    "PUBLIC_HEALTH": {
        "id": "PUBLIC_HEALTH",
        "title": "Public Health & National AYUSH Mission (NAM)",
        "slug": "public-health-national-ayush-mission",
        "category": "PUBLIC_HEALTH",
        "short_summary": "Community preventive healthcare, epidemic management, National Ayush Mission district coordination, and WHO Ayush initiatives.",
        "full_description": (
            "Public health practitioners scale Ayurvedic preventive and curative wisdom to community populations. "
            "Under the National AYUSH Mission (NAM) and Ayushman Bharat Health & Wellness Centres (AHWCs), BAMS doctors "
            "lead rural health centers, implement nutritional programs (Poshan Abhiyan), and manage non-communicable disease (NCD) screening."
        ),
        "eligibility_requirements": [
            "BAMS degree with completed internship + Council Registration",
            "State / Central Public Health Service Commission qualification (for permanent government MO posts)",
            "Master of Public Health (MPH) is an added advantage for UN / WHO / NGO leadership positions",
            "Proficiency in epidemiological screening and local community health languages"
        ],
        "core_responsibilities": [
            "Managing Ayushman Arogya Mandir (Ayush) primary healthcare outposts",
            "Executing mass Dinacharya, Ritucharya, and Swasthavritta community hygiene programs",
            "Conducting rural geriatric camps, anemia eradication drives, and maternal-child health clinics",
            "Reporting disease incidence data to Integrated Disease Surveillance Programme (IDSP)"
        ],
        "suggested_specializations": [
            "Swasthavritta & Yoga (Preventive Medicine)",
            "Master of Public Health (MPH)",
            "Health Economics & Epidemiology",
            "Maternal & Child Ayush Health (Kaumarbhritya)"
        ],
        "recommended_bams_subjects": [
            "Swasthavritta & Yoga",
            "Kaumarbhritya",
            "Agada Tantra",
            "Kayachikitsa"
        ],
        "certifications_and_trainings": [
            "Epidemiological Surveillance & Disease Outbreak Management",
            "Ayushman Bharat Ayush Health & Wellness Centre Protocols",
            "Community Nutrition & Poshan Abhiyan Modules",
            "Disaster Management & First Responder Coordination"
        ],
        "typical_work_environments": [
            "National AYUSH Mission (NAM) State Directorates",
            "Primary Health Centres (PHC) & Community Health Centres (CHC)",
            "WHO Global Centre for Traditional Medicine (Jamnagar)",
            "Public Health Foundations & International Health NGOs"
        ],
        "educational_milestones": [
            {
                "title": "Community Camps Participation",
                "target_stage": "2nd-4th Prof BAMS",
                "description": "Volunteer in 10+ free rural healthcare camps; document community Prakriti and nutritional surveys."
            },
            {
                "title": "Public Health Rotation",
                "target_stage": "Internship Year",
                "description": "Complete mandatory rural community posting; prepare for State Public Service Commission (PSC) AMO exams."
            },
            {
                "title": "Public Health Cadre Joining",
                "target_stage": "Post-Graduation",
                "description": "Secure appointment as Medical Officer in NAM / NHM or pursue Master of Public Health (MPH)."
            }
        ]
    },
    "HEALTHCARE_ADMIN": {
        "id": "HEALTHCARE_ADMIN",
        "title": "Healthcare Administration & Hospital Operations",
        "slug": "healthcare-administration-management",
        "category": "MANAGEMENT",
        "short_summary": "Ayush hospital operations, clinical governance, TPA insurance claim adjudication, and health informatics.",
        "full_description": (
            "With the expansion of corporate hospital chains and private health insurance coverage for Ayush treatments, "
            "doctors with business acumen and clinical background manage hospital operations, revenue cycle management, "
            "insurance TPA pre-authorization desks, and clinical quality compliance."
        ),
        "eligibility_requirements": [
            "BAMS degree as clinical foundation",
            "MBA in Hospital & Healthcare Management (MHA / MBA) or equivalent certification",
            "Understanding of IRDAI Ayush insurance coverage guidelines and Cashless treatment norms",
            "Proficiency in hospital budgeting, HR management, and statutory healthcare regulations"
        ],
        "core_responsibilities": [
            "Managing clinical workflows, patient admission-discharge cycles, and emergency staffing",
            "Supervising insurance TPA pre-authorization and claims documentation for Ayush coverage",
            "Leading hospital accreditation inspections (NABH, NABL) and internal quality audits",
            "Overseeing pharmacy inventory, biomedical equipment maintenance, and supply chain"
        ],
        "suggested_specializations": [
            "Master of Hospital Administration (MHA)",
            "Health Insurance & Third Party Administration (TPA)",
            "Digital Health Informatics & Ayush EHR Systems",
            "Healthcare Quality Management"
        ],
        "recommended_bams_subjects": [
            "Swasthavritta",
            "Agada Tantra (Medical Jurisprudence & Ethics)",
            "Bhaishajya Kalpana (Pharmacy Inventory)",
            "Kayachikitsa"
        ],
        "certifications_and_trainings": [
            "NABH Implementation & Internal Auditor Certification",
            "Certified Healthcare Quality Professional (CHQP)",
            "Health Insurance TPA Claim Adjudication Course",
            "Healthcare ERP & Supply Chain Management"
        ],
        "typical_work_environments": [
            "Corporate Ayush & Integrative Hospital Chains",
            "Health Insurance Companies & TPA Desks (Ayush division)",
            "Hospital Management Consultancy Firms",
            "Large Multi-Specialty Ayurvedic Clinics Network"
        ],
        "educational_milestones": [
            {
                "title": "Hospital Operations Observation",
                "target_stage": "3rd-4th Prof BAMS",
                "description": "Observe hospital admissions, pharmacy dispatch, and medical records maintenance during clinical postings."
            },
            {
                "title": "Administrative Electives",
                "target_stage": "Internship Year",
                "description": "Spend elective weeks in hospital administration and insurance desks. Prepare for CAT/CMAT for MHA."
            },
            {
                "title": "MHA / Operational Role",
                "target_stage": "Post-Graduation",
                "description": "Complete MHA degree or join hospital network as Assistant Operations Manager / TPA Coordinator."
            }
        ]
    },
    "HIGHER_EDUCATION_MD": {
        "id": "HIGHER_EDUCATION_MD",
        "title": "Postgraduate Specialization (MD / MS Ayurveda & Ph.D.)",
        "slug": "postgraduate-specialization-md-ms",
        "category": "HIGHER_EDUCATION",
        "short_summary": "AIAPGET entrance preparation, 3-year MD/MS clinical and pre-clinical degrees across 14 specialties, and Ph.D. research.",
        "full_description": (
            "Pursuing postgraduate education (MD / MS Ayurveda) enables deep clinical mastery, surgical specialization, "
            "academic eligibility, and higher consultation compensation. Admission is governed nationally via the All India "
            "AYUSH Post Graduate Entrance Test (AIAPGET) conducted by the National Testing Agency (NTA)."
        ),
        "eligibility_requirements": [
            "BAMS degree recognized by NCISM from an accredited college",
            "Completion of 1-year rotatory internship on or before the cut-off date prescribed by NTA / NCISM",
            "Qualifying percentile score in the AIAPGET entrance examination",
            "Permanent or provisional state medical council registration"
        ],
        "core_responsibilities": [
            "Undergoing 3 years of rigorous residency training in specialized clinical wards or laboratories",
            "Conducting independent clinical dissertation research with statistical validation",
            "Performing complex procedures: Ksharasutra ligation (Shalya), Vamana/Basti regimens (Panchakarma), Kriyakalpa (Shalakya)",
            "Conducting bedside teaching and guiding undergraduate junior doctors"
        ],
        "suggested_specializations": [
            "MD Kayachikitsa (Internal Medicine - 3 years)",
            "MS Shalya Tantra (Surgical Techniques & Anorectal - 3 years)",
            "MS Shalakya Tantra (Ophthalmology, ENT & Oro-dental - 3 years)",
            "MD Panchakarma (Bio-cleansing Therapies - 3 years)",
            "MS Prasuti & Stri Roga (Obstetrics & Gynecology - 3 years)",
            "MD Kaumarbhritya (Pediatrics - 3 years)",
            "MD Dravyaguna Vijnana (Materia Medica & Pharmacology)",
            "MD Rasashastra & Bhaishajya Kalpana (Pharmaceutical Science)",
            "MD Roga Nidana (Pathology & Diagnostics)",
            "MD Swasthavritta (Preventive Medicine & Dietetics)"
        ],
        "recommended_bams_subjects": [
            "All 14 Subjects covered in AIAPGET syllabus",
            "Brihat Trayi (Charaka, Sushruta, Ashtanga Hridaya)",
            "Laghu Trayi (Madhava Nidana, Sharngadhara, Bhavaprakasha)",
            "Research Methodology & Statistics"
        ],
        "certifications_and_trainings": [
            "AIAPGET Comprehensive Mock Test Series & Shloka Memorization",
            "Clinical Residency Training at National Institutes (AIIA, NIA, ITRA, BHU)",
            "Dissertation Writing & Academic Ethics",
            "Advanced Operative Surgical Workshops (Shalya)"
        ],
        "typical_work_environments": [
            "National Institute of Ayurveda (NIA Jaipur)",
            "All India Institute of Ayurveda (AIIA New Delhi)",
            "Institute of Teaching and Research in Ayurveda (ITRA Jamnagar)",
            "Faculty of Ayurveda, Banaras Hindu University (BHU Varanasi)",
            "State Government Postgraduate Ayurvedic Colleges"
        ],
        "educational_milestones": [
            {
                "title": "Syllabus Mastery & MCQs",
                "target_stage": "3rd & 4th Prof BAMS",
                "description": "Complete line-by-line reading of Charaka Samhita. Solve 5,000+ AIAPGET subject-wise MCQs."
            },
            {
                "title": "AIAPGET Cracking",
                "target_stage": "Internship Year",
                "description": "Dedicate 3-4 hours daily alongside internship. Take full-length simulated mock tests; participate in AACCC counseling."
            },
            {
                "title": "MD/MS Residency & Thesis",
                "target_stage": "PG Residency (Years 1-3)",
                "description": "Complete 36 months of residency with active IPD duty; submit thesis; graduate as super-specialist Vaidya."
            }
        ]
    },
    "ENTREPRENEURSHIP": {
        "id": "ENTREPRENEURSHIP",
        "title": "Ayush Entrepreneurship & Wellness Startups",
        "slug": "ayush-entrepreneurship-wellness",
        "category": "ENTREPRENEURSHIP",
        "short_summary": "Herbal product formulation, Schedule T GMP manufacturing, wellness retreats, medical tourism, and digital Ayush platforms.",
        "full_description": (
            "The global wellness economy and growing consumer demand for natural healthcare provide expansive opportunities "
            "for BAMS entrepreneurs. Founders establish classical or proprietary ASU (Ayurveda, Siddha, Unani) herbal manufacturing "
            "units, luxury wellness retreats catering to medical tourists, organic herb supply chains, or digital health applications."
        ),
        "eligibility_requirements": [
            "BAMS degree provides recognized technical qualification to hold ASU Manufacturing License",
            "Compliance with Schedule T Good Manufacturing Practices (GMP) under Drugs & Cosmetics Act 1940",
            "Company incorporation (Pvt Ltd / LLP / OPC), GST, MSME / Startup India registration",
            "Ayush Ministry licensing and State Drug Controller manufacturing approvals"
        ],
        "core_responsibilities": [
            "Formulating classical and proprietary Ayurvedic products complying with pharmacopoeia standards",
            "Managing clinical trials, stability testing, and batch quality control testing in certified labs",
            "Designing wellness hospitality packages integrating Panchakarma, Yoga, Sattvic diet, and medical tourism",
            "Navigating brand positioning, digital marketing, export documentation, and regulatory compliance"
        ],
        "suggested_specializations": [
            "Ayurvedic Formulation Science & Schedule T GMP",
            "Ayurvedic Cosmeceuticals & Nutraceuticals",
            "Medical Value Travel & Wellness Resort Architecture",
            "Digital Health & Tele-Ayurveda Services"
        ],
        "recommended_bams_subjects": [
            "Rasashastra & Bhaishajya Kalpana",
            "Dravyaguna Vijnana",
            "Swasthavritta & Yoga",
            "Agada Tantra (Regulatory compliance)"
        ],
        "certifications_and_trainings": [
            "Schedule T GMP Quality Control & ASU Drug Licensing",
            "Export-Import (EXIM) Procedures for Herbal Products",
            "Startup India & MSME Incubation Programs",
            "Digital Marketing & E-Commerce Strategy for Healthcare Brands"
        ],
        "typical_work_environments": [
            "Independent Herbal Pharma Manufacturing Facility",
            "Ayurvedic Wellness Retreats & Heritage Resorts",
            "Ayush Incubation Hubs (e.g. AIIA Incubation Centre)",
            "D2C Ayurvedic Brand Headquarters"
        ],
        "educational_milestones": [
            {
                "title": "Formulation & Quality Foundations",
                "target_stage": "3rd & 4th Prof BAMS",
                "description": "Gain hands-on pharmaceutical lab experience in Rasashastra/Bhaishajya Kalpana; understand GMP Schedule T norms."
            },
            {
                "title": "Business Model & Market Research",
                "target_stage": "Internship Year",
                "description": "Conduct market survey of unmet patient needs. Formulate business plan for product line or clinic chain."
            },
            {
                "title": "Licensing & Launch",
                "target_stage": "Post-Graduation",
                "description": "Incorporate venture; secure Ayush drug manufacturing license or establish clinical wellness resort."
            }
        ]
    }
}

# Initial Curated Career Guidance Resources (Articles & Guides)
INITIAL_CAREER_RESOURCES = [
    {
        "title": "Mastering the AIAPGET 2026: 12-Month Preparation Roadmap",
        "slug": "mastering-aiapget-roadmap",
        "category": "HIGHER_EDUCATION",
        "summary": "Strategic timeline, subject weightage, shloka memorization techniques, and recommended reference texts for cracking AIAPGET.",
        "content": """# Mastering AIAPGET: Step-by-Step Guide for BAMS Students

The All India AYUSH Post Graduate Entrance Test (AIAPGET) is the single national entrance exam for admission to MD/MS Ayurveda seats across India.

### 1. Understanding Exam Pattern
- **Total Questions:** 120 Multiple Choice Questions (MCQs)
- **Duration:** 120 minutes (Computer-Based Test)
- **Marking Scheme:** +4 for correct answer, -1 for incorrect answer
- **Syllabus:** Entire NCISM BAMS Curriculum (1st Prof to Final Prof)

### 2. High-Yield Subjects Breakdown
1. **Charaka Samhita:** Comprises ~30-35% of the total paper. Pay special focus to Sutrasthana (first 30 chapters), Chikitsasthana (especially chapters 1 to 15), and Siddhisthana.
2. **Sushruta Samhita:** Sutrasthana, Sharirasthana, and Chikitsasthana (surgical instruments, Ksharasutra, fracture management).
3. **Ashtanga Hridaya:** Sutrasthana is non-negotiable.
4. **Dravyaguna & Rasashastra:** Botanical names, families, Guna-Karma, shodhana-marana of minerals, Bhasma tests.

### 3. Study Strategy Timeline
- **Months 1-4:** First reading of Brihat Trayi alongside NCISM clinical textbooks.
- **Months 5-8:** Solving subject-wise question banks (minimum 50 questions daily).
- **Months 9-11:** Second comprehensive revision + memorization of key numerical shlokas (Sankhya Sharir, dosage, weights).
- **Final Month:** Simulated full-length mock exams strictly in the 120-minute window.

*Disclaimer: Educational orientation. Exam rules and dates are governed solely by NTA and NCISM notifications.*""",
        "tags": ["AIAPGET", "MD Ayurveda", "Higher Education", "Exam Prep"],
        "target_year": "3rd-4th Year & Interns"
    },
    {
        "title": "Panchakarma Center Setup: Legal, Infrastructure & Clinical Checklist",
        "slug": "panchakarma-center-setup-checklist",
        "category": "INTERNSHIP_GUIDE",
        "summary": "Essential guide covering Droni dimensions, steam chamber setup, Panchakarma staff training, and clinical hygiene protocols.",
        "content": """# Establishing an Ayurvedic Panchakarma Practice

Setting up a dedicated Panchakarma therapy center requires careful blending of classical architectural standards (Shalaturya) with modern medical hygiene.

### 1. Mandatory Statutory Requirements
- **State Council Registration:** Active registration with State Ayush Medical Council.
- **Clinical Establishment Act:** Registration with local District Medical Officer (DMO) / Municipal Corporation.
- **Biomedical Waste Management:** Tie-up with authorized biomedical waste management service for disposable catheters, gloves, and blood-letting waste (Raktamokshana).
- **Trade License & Fire Safety:** Local municipal clearances.

### 2. Spatial Infrastructure
- **Consultation Suite:** Adequate natural lighting, diagnostic instruments, pulse examination table.
- **Therapy Rooms (Minimum 12x10 ft):** Slip-resistant flooring, drainage gradient, hot water showers.
- **Droni (Massage Table):** Classical wood (e.g. Asana, Khadira, or teak) or medical-grade fiber with drainage channels.
- **Swedana Unit:** Standard steam chamber with temperature regulator (maximum 40-42°C).
- **Shirodhara Apparatus:** Oscillating brass/bronze vessel with adjustable stand and oil collecting reservoir.

### 3. Safety & Emergency Protocols
- Keep emergency revival kit accessible: oral rehydration, glucose, herbal cardiac stimulants (e.g. Prabhakara Vati, Kasturyadi), and basic first-aid.
- Always monitor pulse and blood pressure before and after Pradhanakarma therapies.

*Disclaimer: Guidance for educational reference. Follow statutory state guidelines and local municipal building rules.*""",
        "tags": ["Panchakarma", "Clinical Practice", "Clinic Setup", "Infrastructure"],
        "target_year": "Interns & Graduates"
    },
    {
        "title": "CCRAS Research Fellowships: Application Process & Eligibility",
        "slug": "ccras-research-fellowships-guide",
        "category": "DEVELOPMENT_CHECKLIST",
        "summary": "How BAMS graduates can join research projects at the Central Council for Research in Ayurvedic Sciences (CCRAS).",
        "content": """# Navigating Research Fellowships at CCRAS

The Central Council for Research in Ayurvedic Sciences (CCRAS), Ministry of Ayush, regularly recruits Research Associates (RA), Senior Research Fellows (SRF), and Junior Research Fellows (JRF).

### 1. Key Entry Roles
- **Junior Research Fellow (JRF):** Open to BAMS graduates with demonstrable aptitude for clinical research.
- **Senior Research Fellow (SRF):** Requires BAMS + 2 years of documented research experience, OR an MD/MS (Ayurveda) degree.
- **Research Associate (RA):** Requires MD/MS (Ayurveda) or Ph.D. with published papers.

### 2. Core Responsibilities in Projects
- Patient screening according to inclusion/exclusion criteria for clinical trials.
- Case Report Form (CRF) electronic data entry and follow-up tracking.
- Drug dispensing and adherence monitoring under Good Clinical Practice (GCP) guidelines.
- Literature review and compilation of monographs.

### 3. Enhancing Your Selection Profile
1. Obtain **GCP (Good Clinical Practice)** online certification from CDSCO / NPTEL.
2. Publish at least one clinical case report in an indexed peer-reviewed journal during BAMS.
3. Learn basic statistical software (SPSS, R, or Excel advanced data tables).

*Disclaimer: Fellowship availability depends on official CCRAS vacancy advertisements published on ccras.nic.in.*""",
        "tags": ["Research", "CCRAS", "Fellowships", "Clinical Trials"],
        "target_year": "Final Year & Interns"
    },
    {
        "title": "Ace the Hospital RMO Interview: Clinical Scenarios & Classical Defense",
        "slug": "hospital-rmo-interview-prep",
        "category": "INTERVIEW_PREP",
        "summary": "Common interview questions, emergency triage situations, and documentation protocols for hospital Resident Medical Officer posts.",
        "content": """# Interview Preparation: Resident Medical Officer (RMO)

When interviewing for an RMO position at an Ayush or integrative multi-specialty hospital, interviewers evaluate your clinical alertness, patient communication, and documentation precision.

### Top Clinical Scenarios Evaluated
1. **Hypotensive Episode During Virechana:**
   - *Lookout:* Do you know how to stop the bouts? Assess dehydration, check vitals, administer electrolyte rehydration, and prescribe classical anti-diarrheal/carminative decoctions (e.g., Dadimashtaka, Bilva).
2. **Acute Chest Discomfort or Breathlessness:**
   - *Lookout:* Immediate ECG ordering, checking vitals, administering primary oxygenation, and prompt cross-referral to cardiology.
3. **Post-Operative Anorectal Bleeding (After Ksharasutra):**
   - *Lookout:* Calming the patient, local packing, evaluating source of bleeding, administering Jatyadi taila or hemostatic herbs (Nagakeshara, Bolabaddha Rasa).

### Professional Tips for the Interview
- Highlight your verified rotatory internship logbook entries.
- Demonstrate familiarity with NABH medication safety and patient identification rules.
- Speak with clarity on both classical Ayurvedic Chikitsa and modern diagnostic lab reports (CBC, LFT, KFT, Lipid Profile, USG).

*Disclaimer: Educational interview training. Clinical interventions must follow institutional SOPs and attending physician guidance.*""",
        "tags": ["Interview Prep", "RMO", "Hospital Roles", "Clinical Cases"],
        "target_year": "Interns & Graduates"
    }
]

class CareerGuidanceService:

    # ------------------------------------------------------------
    # 1. BAMS CAREER PATHWAYS
    # ------------------------------------------------------------
    @staticmethod
    def get_all_pathways() -> List[CareerPathwayOut]:
        """Returns all 8 comprehensive curated BAMS career pathways."""
        pathways = []
        for p_id, p_data in BAMS_CAREER_PATHWAYS.items():
            pathways.append(
                CareerPathwayOut(
                    id=p_data["id"],
                    title=p_data["title"],
                    slug=p_data["slug"],
                    category=p_data["category"],
                    short_summary=p_data["short_summary"],
                    full_description=p_data["full_description"],
                    eligibility_requirements=p_data["eligibility_requirements"],
                    core_responsibilities=p_data["core_responsibilities"],
                    suggested_specializations=p_data["suggested_specializations"],
                    recommended_bams_subjects=p_data["recommended_bams_subjects"],
                    certifications_and_trainings=p_data["certifications_and_trainings"],
                    typical_work_environments=p_data["typical_work_environments"],
                    educational_milestones=[
                        CareerPathwayMilestone(**m) for m in p_data["educational_milestones"]
                    ]
                )
            )
        return pathways

    @staticmethod
    def get_pathway_by_id(pathway_id: str) -> Optional[CareerPathwayOut]:
        """Get single pathway detail by ID or slug."""
        clean_id = pathway_id.upper()
        p_data = BAMS_CAREER_PATHWAYS.get(clean_id)
        if not p_data:
            # Try matching by slug
            for k, v in BAMS_CAREER_PATHWAYS.items():
                if v["slug"] == pathway_id.lower():
                    p_data = v
                    break
        if not p_data:
            return None

        return CareerPathwayOut(
            id=p_data["id"],
            title=p_data["title"],
            slug=p_data["slug"],
            category=p_data["category"],
            short_summary=p_data["short_summary"],
            full_description=p_data["full_description"],
            eligibility_requirements=p_data["eligibility_requirements"],
            core_responsibilities=p_data["core_responsibilities"],
            suggested_specializations=p_data["suggested_specializations"],
            recommended_bams_subjects=p_data["recommended_bams_subjects"],
            certifications_and_trainings=p_data["certifications_and_trainings"],
            typical_work_environments=p_data["typical_work_environments"],
            educational_milestones=[
                CareerPathwayMilestone(**m) for m in p_data["educational_milestones"]
            ]
        )

    # ------------------------------------------------------------
    # 2. STUDENT PERSONAL CAREER GOALS
    # ------------------------------------------------------------
    @staticmethod
    async def get_student_goals(db: AsyncSession, user_id: uuid.UUID) -> List[StudentCareerGoal]:
        """Get all career goals for the authenticated student."""
        res = await db.execute(
            select(StudentCareerGoal)
            .where(StudentCareerGoal.user_id == user_id)
            .order_by(desc(StudentCareerGoal.created_at))
        )
        return list(res.scalars().all())

    @staticmethod
    async def create_student_goal(
        db: AsyncSession,
        user_id: uuid.UUID,
        data: StudentCareerGoalIn
    ) -> StudentCareerGoal:
        """Create a new career goal and action plan for the student."""
        milestones_json = [m.model_dump() for m in data.milestones]
        goal = StudentCareerGoal(
            user_id=user_id,
            title=data.title,
            pathway_id=data.pathway_id,
            target_date=data.target_date,
            priority=data.priority,
            status=data.status,
            milestones=milestones_json,
            notes=data.notes
        )
        db.add(goal)
        await db.commit()
        await db.refresh(goal)
        return goal

    @staticmethod
    async def update_student_goal(
        db: AsyncSession,
        goal_id: uuid.UUID,
        user_id: uuid.UUID,
        data: StudentCareerGoalUpdate
    ) -> Optional[StudentCareerGoal]:
        """Update a student's personal career goal. Strict ownership check."""
        res = await db.execute(
            select(StudentCareerGoal).where(
                and_(StudentCareerGoal.id == goal_id, StudentCareerGoal.user_id == user_id)
            )
        )
        goal = res.scalar_one_or_none()
        if not goal:
            return None

        if data.title is not None:
            goal.title = data.title
        if data.pathway_id is not None:
            goal.pathway_id = data.pathway_id
        if data.target_date is not None:
            goal.target_date = data.target_date
        if data.priority is not None:
            goal.priority = data.priority
        if data.status is not None:
            goal.status = data.status
        if data.milestones is not None:
            goal.milestones = [m.model_dump() for m in data.milestones]
        if data.notes is not None:
            goal.notes = data.notes

        goal.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(goal)
        return goal

    @staticmethod
    async def delete_student_goal(
        db: AsyncSession,
        goal_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Delete a student's personal career goal with ownership check."""
        res = await db.execute(
            select(StudentCareerGoal).where(
                and_(StudentCareerGoal.id == goal_id, StudentCareerGoal.user_id == user_id)
            )
        )
        goal = res.scalar_one_or_none()
        if not goal:
            return False

        await db.delete(goal)
        await db.commit()
        return True

    # ------------------------------------------------------------
    # 3. STUDENT CAREER BOOKMARKS
    # ------------------------------------------------------------
    @staticmethod
    async def get_student_bookmarks(db: AsyncSession, user_id: uuid.UUID) -> List[StudentCareerBookmark]:
        res = await db.execute(
            select(StudentCareerBookmark)
            .where(StudentCareerBookmark.user_id == user_id)
            .order_by(desc(StudentCareerBookmark.created_at))
        )
        return list(res.scalars().all())

    @staticmethod
    async def toggle_student_bookmark(
        db: AsyncSession,
        user_id: uuid.UUID,
        data: CareerBookmarkIn
    ) -> Dict[str, Any]:
        """Toggle bookmark for a pathway."""
        res = await db.execute(
            select(StudentCareerBookmark).where(
                and_(
                    StudentCareerBookmark.user_id == user_id,
                    StudentCareerBookmark.pathway_id == data.pathway_id
                )
            )
        )
        existing = res.scalar_one_or_none()
        if existing:
            await db.delete(existing)
            await db.commit()
            return {"bookmarked": False, "pathway_id": data.pathway_id}

        new_bm = StudentCareerBookmark(
            user_id=user_id,
            pathway_id=data.pathway_id,
            pathway_title=data.pathway_title,
            notes=data.notes
        )
        db.add(new_bm)
        await db.commit()
        return {"bookmarked": True, "pathway_id": data.pathway_id}

    @staticmethod
    async def delete_student_bookmark(
        db: AsyncSession,
        user_id: uuid.UUID,
        pathway_id: str
    ) -> bool:
        res = await db.execute(
            select(StudentCareerBookmark).where(
                and_(
                    StudentCareerBookmark.user_id == user_id,
                    StudentCareerBookmark.pathway_id == pathway_id
                )
            )
        )
        bm = res.scalar_one_or_none()
        if not bm:
            return False
        await db.delete(bm)
        await db.commit()
        return True

    # ------------------------------------------------------------
    # 4. CAREER RESOURCES
    # ------------------------------------------------------------
    @staticmethod
    async def seed_initial_resources_if_empty(db: AsyncSession):
        """Seed initial career guides if none exist."""
        res = await db.execute(select(CareerGuidanceResource).limit(1))
        if res.scalar_one_or_none() is not None:
            return

        for r_data in INITIAL_CAREER_RESOURCES:
            r = CareerGuidanceResource(
                title=r_data["title"],
                slug=r_data["slug"],
                category=r_data["category"],
                summary=r_data["summary"],
                content=r_data["content"],
                tags=r_data["tags"],
                target_year=r_data["target_year"],
                author_name="AyurSetu BAMS Faculty Panel",
                is_published=True
            )
            db.add(r)
        await db.commit()

    @staticmethod
    async def get_resources(
        db: AsyncSession,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[CareerGuidanceResource]:
        await CareerGuidanceService.seed_initial_resources_if_empty(db)
        query = select(CareerGuidanceResource).where(CareerGuidanceResource.is_published == True)
        if category and category.upper() != "ALL":
            query = query.where(CareerGuidanceResource.category == category.upper())
        query = query.order_by(desc(CareerGuidanceResource.created_at))
        res = await db.execute(query)
        items = list(res.scalars().all())

        if search and search.strip():
            s = search.lower()
            items = [
                i for i in items
                if s in i.title.lower() or s in i.summary.lower() or any(s in t.lower() for t in (i.tags or []))
            ]
        return items

    @staticmethod
    async def get_resource_by_id_or_slug(
        db: AsyncSession,
        identifier: str
    ) -> Optional[CareerGuidanceResource]:
        await CareerGuidanceService.seed_initial_resources_if_empty(db)
        try:
            val_uuid = uuid.UUID(identifier)
            res = await db.execute(
                select(CareerGuidanceResource).where(CareerGuidanceResource.id == val_uuid)
            )
            item = res.scalar_one_or_none()
            if item:
                return item
        except ValueError:
            pass

        res = await db.execute(
            select(CareerGuidanceResource).where(CareerGuidanceResource.slug == identifier)
        )
        return res.scalar_one_or_none()

    @staticmethod
    async def create_resource(
        db: AsyncSession,
        user: User,
        data: CareerResourceCreate
    ) -> CareerGuidanceResource:
        slug = data.slug or re.sub(r'[^a-zA-Z0-9]+', '-', data.title.lower()).strip('-')
        # Check uniqueness of slug
        res = await db.execute(select(CareerGuidanceResource).where(CareerGuidanceResource.slug == slug))
        if res.scalar_one_or_none():
            slug = f"{slug}-{uuid.uuid4().hex[:4]}"

        author_name = user.full_name if hasattr(user, "full_name") and user.full_name else "Faculty Member"
        resource = CareerGuidanceResource(
            title=data.title,
            slug=slug,
            category=data.category.upper(),
            summary=data.summary,
            content=data.content,
            tags=data.tags,
            target_year=data.target_year,
            author_id=user.id,
            author_name=author_name,
            is_published=data.is_published
        )
        db.add(resource)
        await db.commit()
        await db.refresh(resource)
        return resource

    # ------------------------------------------------------------
    # 5. PERSONALIZED CAREER RECOMMENDATIONS
    # ------------------------------------------------------------
    @staticmethod
    async def get_recommendations_for_student(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> List[StudentCareerRecommendationOut]:
        """
        Calculates educational career recommendations matching the student's
        stated interests, target career, completed topics, and academic year.
        """
        # Fetch student profile & progress
        sp_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user_id))
        sp = sp_res.scalar_one_or_none()

        prog_res = await db.execute(select(StudentBamsProgress).where(StudentBamsProgress.user_id == user_id))
        prog = prog_res.scalar_one_or_none()

        interests = sp.interests if (sp and sp.interests) else []
        current_year = sp.current_year if (sp and sp.current_year) else 4
        completed_count = len(prog.completed_topics) if (prog and prog.completed_topics) else 0

        recommendations = []

        # 1. Check Higher Education MD
        reasons_he = ["Essential pathway for clinical super-specialty and academic professor eligibility."]
        if current_year >= 3:
            reasons_he.append("Ideal time window to commence AIAPGET daily MCQ practice alongside clinical classes.")
        if completed_count > 10:
            reasons_he.append(f"Strong theoretical base ({completed_count} completed curriculum topics).")

        recommendations.append(
            StudentCareerRecommendationOut(
                pathway_id="HIGHER_EDUCATION_MD",
                title="Postgraduate Specialization (MD/MS Ayurveda via AIAPGET)",
                match_score=94 if current_year >= 3 else 85,
                match_reasons=reasons_he,
                key_prerequisites=["BAMS Degree", "Completed Internship", "AIAPGET Qualifying Score"],
                action_url="/student/career?tab=pathways&id=HIGHER_EDUCATION_MD"
            )
        )

        # 2. Check Clinical Practice & Panchakarma
        reasons_cp = ["Direct patient impact utilizing classical Ashtavidha Pariksha and Panchakarma."]
        if any("panchakarma" in str(i).lower() or "clinical" in str(i).lower() for i in interests):
            reasons_cp.append("Matches your stated interest in Panchakarma and patient healing.")
        else:
            reasons_cp.append("Foundation track for autonomous consultation and clinic ownership.")

        recommendations.append(
            StudentCareerRecommendationOut(
                pathway_id="CLINICAL_PRACTICE",
                title="Ayurvedic Clinical Practice & Specialized Panchakarma",
                match_score=92,
                match_reasons=reasons_cp,
                key_prerequisites=["BAMS Degree", "State Ayush Medical Council Registration", "Clinical Logbook"],
                action_url="/student/career?tab=pathways&id=CLINICAL_PRACTICE"
            )
        )

        # 3. Check Research & CCRAS
        reasons_res = ["High national demand for scientific validation and clinical trial investigators."]
        if any("research" in str(i).lower() or "pharma" in str(i).lower() for i in interests):
            reasons_res.append("Directly aligns with your research and drug development interest.")
        else:
            reasons_res.append("Offers lucrative fellowships (JRF/SRF) with premier institutions like CCRAS and ICMR.")

        recommendations.append(
            StudentCareerRecommendationOut(
                pathway_id="RESEARCH",
                title="Ayush Clinical Research & Drug Discovery (CCRAS / ICMR)",
                match_score=86 if any("research" in str(i).lower() for i in interests) else 78,
                match_reasons=reasons_res,
                key_prerequisites=["BAMS Degree", "Good Clinical Practice (GCP) Certification"],
                action_url="/student/career?tab=pathways&id=RESEARCH"
            )
        )

        # 4. Check Hospital Medical Officer
        recommendations.append(
            StudentCareerRecommendationOut(
                pathway_id="HOSPITAL_ROLES",
                title="Hospital Resident Medical Officer (RMO) & Acute Care",
                match_score=82,
                match_reasons=[
                    "Structured clinical environment with immediate post-internship placement opportunities.",
                    "Provides high patient volume exposure and NABH quality training."
                ],
                key_prerequisites=["BAMS Degree", "Internship Completion", "Emergency BLS Orientation"],
                action_url="/student/career?tab=pathways&id=HOSPITAL_ROLES"
            )
        )

        return recommendations

    # ------------------------------------------------------------
    # 6. AI CAREER GUIDANCE ENGINE
    # ------------------------------------------------------------
    @staticmethod
    def ask_career_question(data: AICareerQAIn) -> AICareerQAOut:
        """Educational AI Career guidance grounded in NCISM standards."""
        q = data.question.strip()
        q_lower = q.lower()
        pathway_id = data.pathway_id or "GENERAL"

        # Determine pathway context if matched
        matched_pathway = None
        for pid, pdata in BAMS_CAREER_PATHWAYS.items():
            if pid.lower() in q_lower or pdata["title"].lower() in q_lower or pdata["slug"] in q_lower:
                matched_pathway = pdata
                break

        # Contextual response logic
        if "aiapget" in q_lower or "md" in q_lower or "higher education" in q_lower or "specialization" in q_lower:
            answer = (
                "To pursue an MD or MS in Ayurveda, all candidates must qualify the All India AYUSH Post Graduate Entrance "
                "Test (AIAPGET) conducted by NTA. The exam evaluates complete BAMS curriculum knowledge with primary weightage "
                "given to Brihat Trayi (Charaka, Sushruta, Vagbhata) and clinical subjects like Kayachikitsa, Dravyaguna, and Shalya Tantra. "
                "Preparing requires daily MCQ practice, shloka revision, and completing your internship before the statutory counseling cut-off date."
            )
            key_takeaways = [
                "AIAPGET is mandatory for 100% of MD/MS Ayurveda seats across India.",
                "Charaka Samhita alone accounts for roughly 30-35% of total exam questions.",
                "Completion of mandatory 1-year rotatory internship is a hard prerequisite for counseling."
            ]
            suggested_actions = [
                "Solve 30-50 AIAPGET-style MCQs daily in the AyurSetu Quiz section.",
                "Memorize Sutrasthana chapters 1-30 of Charaka Samhita with Sanskrit shlokas.",
                "Review previous 5 years' AIAPGET question papers to identify recurring topics."
            ]
            follow_ups = [
                "Which 14 specialties are offered in MD/MS Ayurveda and what are their scopes?",
                "How can I manage AIAPGET preparation during my busy hospital internship?",
                "What is the reservation and counseling process through AACCC?"
            ]
            ncism_ref = "NCISM Minimum Standard of Postgraduate Ayurveda Education Regulations"

        elif "panchakarma" in q_lower or "clinic" in q_lower or "setup" in q_lower:
            answer = (
                "Setting up an independent Ayurvedic clinical practice or Panchakarma center requires registration with your "
                "State Ayurvedic Council and obtaining a local Clinical Establishment license. Prioritize patient safety by establishing "
                "hygienic therapy rooms with proper drainage, certified wood or FRP Droni, and an emergency medical revival kit. "
                "Mastering Nadi Pariksha, patient counseling, and accurate Purvakarma protocols will build clinical trust."
            )
            key_takeaways = [
                "State Council registration is required prior to treating patients independently.",
                "Clinical establishments must adhere to biomedical waste management contracts.",
                "Emergency first-aid and patient vitals monitoring are essential before Pradhanakarma therapies."
            ]
            suggested_actions = [
                "Document at least 50 observed Panchakarma procedures in your clinical logbook.",
                "Enroll in a hands-on Panchakarma practical fellowship during your internship.",
                "Review the AyurSetu Panchakarma Clinic Infrastructure Checklist."
            ]
            follow_ups = [
                "What are the typical initial setup costs for a basic 2-bed Panchakarma center?",
                "How do I obtain the biomedical waste disposal certificate for my clinic?",
                "What are the medico-legal consents required before Vamana and Virechana?"
            ]
            ncism_ref = "Clinical Establishments (Registration and Regulation) Act & NCISM Code of Ethics"

        elif "research" in q_lower or "ccras" in q_lower or "trial" in q_lower:
            answer = (
                "Careers in Ayush research involve scientific validation, clinical trials, and drug standardization. "
                "The Central Council for Research in Ayurvedic Sciences (CCRAS) frequently hires BAMS graduates as Junior Research Fellows (JRF) "
                "and Research Officers. Key credentials include Good Clinical Practice (GCP) certification, proficiency in medical statistics, "
                "and published case studies or review articles in peer-reviewed journals."
            )
            key_takeaways = [
                "CCRAS and ICMR lead national multidisciplinary Ayush clinical trials.",
                "Good Clinical Practice (GCP) certification is a standard requirement for research posts.",
                "Experience in scientific protocol drafting and adverse event reporting gives high selection priority."
            ]
            suggested_actions = [
                "Complete free online GCP certification from CDSCO or WHO recognized portals.",
                "Submit a research proposal for the CCRAS SPARK studentship award.",
                "Co-author a clinical case report with your college faculty."
            ]
            follow_ups = [
                "How do I apply for the CCRAS SPARK student research grant?",
                "What is the difference between a Junior Research Fellow (JRF) and a Research Officer (RO)?",
                "Can a BAMS graduate pursue a Ph.D. in clinical pharmacology or bioinformatics?"
            ]
            ncism_ref = "CCRAS Guidelines for Good Clinical Practice in Ayush Clinical Trials"

        elif "interview" in q_lower or "rmo" in q_lower or "job" in q_lower:
            answer = (
                "Hospital and clinical job interviews test your emergency alertness, classical Chikitsa rationale, and communication skills. "
                "For Resident Medical Officer (RMO) posts, interviewers assess how quickly you recognize critical vitals changes, manage acute "
                "complications during Panchakarma, and write accurate hospital discharge summaries. Always maintain a well-organized portfolio "
                "showing your verified logbooks, camp certificates, and college awards."
            )
            key_takeaways = [
                "Interviewers focus on acute triage protocols and post-procedure emergency response.",
                "Demonstrate confidence in interpreting common laboratory reports (CBC, LFT, KFT, ECG).",
                "A signed clinical logbook of internship rotations provides tangible proof of your competence."
            ]
            suggested_actions = [
                "Practice the AyurSetu AI Mock Interview simulator for clinical scenario questions.",
                "Review classical dosages and contraindications of frequently prescribed Rasaushadhis.",
                "Ensure your digital AyurSetu portfolio has verified clinical camp credentials."
            ]
            follow_ups = [
                "What are the top 10 interview questions asked for hospital RMO positions?",
                "How should I explain a complex classical Sanskrit term to modern hospital interviewers?",
                "What salary expectations and contractual terms are typical for fresh BAMS RMOs?"
            ]
            ncism_ref = "NABH Clinical Audit Standards & Hospital Medical Staff Protocols"

        else:
            answer = (
                f"As a BAMS student, you have 8 primary career avenues: Clinical Practice & Panchakarma, Hospital Resident Medical Officer posts, "
                f"Academic Teaching (MD/MS prerequisite), Clinical Research (CCRAS/ICMR), Public Health & National Ayush Mission, Healthcare Administration, "
                f"Postgraduate Specialization, and Ayush Entrepreneurship. Based on your current stage, focusing on strong clinical bedside diagnostics, "
                f"maintaining a signed internship logbook, and preparing for AIAPGET will provide the highest career flexibility."
            )
            key_takeaways = [
                "Ayurveda offers diverse tracks spanning clinical, research, administrative, and entrepreneurial domains.",
                "Clinical competence and state medical registration form the foundation for all career tracks.",
                "Early planning in 3rd/4th Prof ensures smooth transition into postgraduate seats or clinical practice."
            ]
            suggested_actions = [
                "Explore the 8 BAMS Career Pathways in the Career Studio to benchmark your interests.",
                "Create a personal Career Goal with actionable milestones.",
                "Bookmark your top 2 target pathways for periodic progress review."
            ]
            follow_ups = [
                "How do I choose between setting up my own clinic and preparing for AIAPGET?",
                "What non-clinical career options are available for BAMS graduates?",
                "What government jobs are open for BAMS doctors besides Ayurvedic Medical Officer?"
            ]
            ncism_ref = "NCISM National Curriculum & Career Orientation Guidelines"

        return AICareerQAOut(
            question=q,
            answer=answer,
            key_takeaways=key_takeaways,
            suggested_actions=suggested_actions,
            follow_up_questions=follow_ups,
            ncism_guidelines_reference=ncism_ref
        )

    @staticmethod
    def generate_career_prep_plan(data: AICareerPlanIn) -> AICareerPlanOut:
        """Generates a structured, milestone-based career preparation plan."""
        pathway_id = data.pathway_id.upper()
        p_data = BAMS_CAREER_PATHWAYS.get(pathway_id, BAMS_CAREER_PATHWAYS["CLINICAL_PRACTICE"])

        phases = [
            AICareerMilestone(
                phase="Phase 1: Academic & Clinical Foundation (Current Year)",
                title="Bedside Diagnostics & Classical Text Mastery",
                timeline="Months 1 - 6",
                actions=[
                    "Master Ashtavidha Pariksha (Pulse, Tongue, Eyes, Physical evaluation) on hospital OPD patients.",
                    "Complete deep reading of primary classical Samhita chapters relevant to this track.",
                    "Maintain active participation in AyurSetu weekly clinical case reviews."
                ],
                suggested_bams_focus=p_data["recommended_bams_subjects"][:3]
            ),
            AICareerMilestone(
                phase="Phase 2: Internship & Practical Application",
                title="Rotatory Clinical Logbooks & Skill Refinement",
                timeline="Months 7 - 14",
                actions=[
                    "Document required clinical postings in a signed logbook across Kayachikitsa, Shalya, and Panchakarma.",
                    "Gain practical competency in procedure sterile setup and post-procedure monitoring.",
                    "Attend minimum 2 district Ayush healthcare camps to observe community epidemiological patterns."
                ],
                suggested_bams_focus=p_data["recommended_bams_subjects"][2:]
            ),
            AICareerMilestone(
                phase="Phase 3: Licensure, Entrance & Launch",
                title="Council Registration & Career Milestone Execution",
                timeline="Months 15 - 18",
                actions=[
                    "Complete mandatory state medical council registration upon internship completion.",
                    "Take target entrance exam (e.g. AIAPGET) or complete clinical establishment setup.",
                    "Join professional Ayush associations and establish mentorship network with senior Vaidyas."
                ],
                suggested_bams_focus=["Professional Ethics", "Medical Jurisprudence", "Practice Management"]
            )
        ]

        return AICareerPlanOut(
            pathway_title=p_data["title"],
            summary=f"Personalized 3-phase preparation roadmap tailored for {p_data['title']}.",
            readiness_assessment="Moderate Readiness. Consistent weekly commitment will build high placement and clinical competence.",
            roadmap_phases=phases,
            high_yield_recommendations=[
                "Maintain digital portfolio visibility with verified clinical skills.",
                "Review NCISM circulars annually for regulatory updates.",
                "Complete CPR/BLS certification prior to clinical post-internship appointments."
            ],
            recommended_certifications=p_data["certifications_and_trainings"]
        )

    @staticmethod
    def generate_interview_prep(data: AIInterviewPrepIn) -> AIInterviewPrepOut:
        """Generates role-specific mock interview questions and clinical scenarios."""
        role = data.role_or_pathway

        questions = [
            InterviewQuestionItem(
                question="How do you approach a patient presenting with chronic Sandhigata Vata (Osteoarthritis) vs Amavata (Rheumatoid Arthritis)?",
                question_type="Clinical Scenario",
                sample_response_framework=(
                    "Differentiate based on Hetu, Ama presence, morning stiffness, and inflammatory signs. Amavata presents with "
                    "Vrishchika Damshavat Vedana (stabbing pain) and Langhana/Deepana-Pachana is primary. Sandhigata Vata is degenerative "
                    "(Dhatukshaya janya) requiring Snehana, Swedana, and Janu Basti."
                ),
                evaluator_lookout="Accurate diagnostic differentiation between inflammatory autoimmune pathology and degenerative disease."
            ),
            InterviewQuestionItem(
                question="What precautions do you take before administering Snehapana for a patient scheduled for Vamana?",
                question_type="Classical Rationale",
                sample_response_framework=(
                    "Evaluate Agni Bala and Koshta. Ensure the patient is Niram (free from Ama). Administer Deepana-Pachana first. "
                    "Start with Hrasva Matra and monitor for Samyak Snigdha Lakshana (unctuous stool, aversion to ghee, lightness of body)."
                ),
                evaluator_lookout="Understanding patient safety and preventing Vyapad (complications) in Panchakarma."
            ),
            InterviewQuestionItem(
                question="How do you handle a distressed patient whose vitals show sudden hypotension during an inpatient ward stay?",
                question_type="Emergency Triage",
                sample_response_framework=(
                    "Immediately place patient in Trendelenburg position. Recheck vitals (BP, SpO2, Pulse). Stop any ongoing hot therapy/purging. "
                    "Start IV fluid hydration, inform attending consultant, and administer emergency supportive drugs as per hospital SOP."
                ),
                evaluator_lookout="Calm clinical judgment, prompt vitals stabilization, and adherence to hospital hierarchy."
            ),
            InterviewQuestionItem(
                question="Why did you choose this specific hospital / career track and how do you plan to grow in the next 3 years?",
                question_type="Behavioral & Career Goal",
                sample_response_framework=(
                    "Highlight dedication to evidence-based Ayurvedic patient care, appreciation for the hospital's NABH accreditation standards, "
                    "and a concrete plan to pursue specialized fellowships and clinical quality audits."
                ),
                evaluator_lookout="Long-term commitment, professional maturity, and alignment with institutional mission."
            )
        ]

        scenarios = [
            "Managing post-Ksharasutra operative discomfort and patient hygiene education.",
            "Handling a drug-herb interaction query from an allopathic co-physician regarding Blood Thinners and Guggulu.",
            "Explaining dietary Viruddha Ahara (incompatible foods) to an urban lifestyle patient with chronic eczema."
        ]

        tips = [
            "Use clear anatomical and classical Sanskrit terms with accurate modern clinical parallels.",
            "Emphasize documentation ethics and patient confidentiality (HIPAA / DISHA compliance).",
            "Bring your signed college logbook and certificates in a structured binder."
        ]

        return AIInterviewPrepOut(
            role_or_pathway=role,
            overview=f"Comprehensive interview preparation framework for {role}.",
            interview_questions=questions,
            clinical_scenarios=scenarios,
            tips_for_success=tips
        )

    @staticmethod
    def generate_professional_checklist(data: AIChecklistIn) -> AIChecklistOut:
        """Generates actionable professional development checklist."""
        pathway_id = data.pathway_id.upper()
        p_data = BAMS_CAREER_PATHWAYS.get(pathway_id, BAMS_CAREER_PATHWAYS["CLINICAL_PRACTICE"])

        items = [
            AIChecklistItem(
                id="chk-1",
                category="Statutory Formalities",
                task="Apply for Provisional Registration Certificate from State Ayush Council upon passing final exam.",
                priority="Essential"
            ),
            AIChecklistItem(
                id="chk-2",
                category="Clinical Competency",
                task="Complete all mandatory clinical rotations and secure Department Head signatures on rotatory logbook.",
                priority="Essential"
            ),
            AIChecklistItem(
                id="chk-3",
                category="Emergency Protocols",
                task="Obtain certified Basic Life Support (BLS) / CPR training from recognized health agency.",
                priority="Essential"
            ),
            AIChecklistItem(
                id="chk-4",
                category="Professional Portfolio",
                task="Compile verified certificates of health camps, academic seminars, and paper presentations.",
                priority="Recommended"
            ),
            AIChecklistItem(
                id="chk-5",
                category="Academic Exams",
                task="Complete enrollment and review official syllabus bulletin for AIAPGET / State PSC medical officer exams.",
                priority="Recommended"
            ),
            AIChecklistItem(
                id="chk-6",
                category="Professional Networking",
                task="Join official alumni association and state chapter of National Integrated Medical Association (NIMA) / Ayush Vaidya associations.",
                priority="Value-Add"
            )
        ]

        return AIChecklistOut(
            pathway_id=pathway_id,
            pathway_title=p_data["title"],
            stage=data.stage or "Final Year & Internship",
            checklist_items=items,
            disclaimer="Educational checklist. Follow state-specific licensing board requirements and hospital bylaws."
        )

career_guidance_service = CareerGuidanceService()
