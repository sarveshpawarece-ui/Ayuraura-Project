import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.future import select
from sqlalchemy import func
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.domain import (
    Skill,
    SkillCategory,
    CareerCategory,
    CareerRole,
    CareerPath,
    CareerSkillRequirement,
    ProficiencyLevel,
    StudentProfile,
    FacultyProfile,
    IndustryProfile,
    InstitutionProfile,
    AssessmentQuestion,
    AssessmentOption,
    QuestionCategory,
    QuestionDifficulty,
    QuestionType,
    VerificationStatus,
)
from app.models.doctor_ngo import DoctorProfile, NGOProfile

INITIAL_SKILLS = [
    {"name": "Dravyaguna & Herbal Identification", "category": SkillCategory.RAW_MATERIAL_QC, "description": "Identification and quality verification of Ayurvedic medicinal plants."},
    {"name": "Rasashastra & Bhasma Preparation", "category": SkillCategory.PHARMA_R_AND_D, "description": "Standardized processing of metallic and mineral formulations."},
    {"name": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)", "category": SkillCategory.CLINICAL, "description": "Traditional 8-fold diagnostic methodologies."},
    {"name": "Phytochemistry & High-Performance Liquid Chromatography (HPLC)", "category": SkillCategory.RAW_MATERIAL_QC, "description": "Analytical testing of active botanical marker compounds."},
    {"name": "Ayush Regulatory Compliance & Drug Standardizations", "category": SkillCategory.REGULATORY, "description": "Understanding ASU (Ayurveda, Siddha, Unani) drugs regulations and pharmacopoeia standards."},
    {"name": "Clinical Trial Protocol Design & GCP Guidelines", "category": SkillCategory.RESEARCH_METHODOLOGY, "description": "Designing Good Clinical Practice compliant clinical studies for Ayush products."},
    {"name": "Panchakarma Procedure Protocols", "category": SkillCategory.CLINICAL, "description": "Operational mastery of detoxification and bio-cleansing therapies."},
    {"name": "Ayurvedic Electronic Medical Records (EMR) & Digital Health", "category": SkillCategory.DIGITAL_HEALTH, "description": "Digital documentation of clinical practice and Tele-Ayush software."},
    {"name": "Good Manufacturing Practice (GMP)", "category": SkillCategory.TECHNICAL, "description": "Schedule T compliance and quality assurance in manufacturing."},
    {"name": "Ayurvedic Formulation Science", "category": SkillCategory.AYURVEDA_DOMAIN, "description": "Classical and modern dosage form development."},
    {"name": "Data Analysis & Statistical Validation", "category": SkillCategory.TECHNICAL, "description": "Data analysis and statistical significance testing in research."},
    {"name": "Professional Communication & Ethics", "category": SkillCategory.SOFT_SKILL, "description": "Ethical communication and patient/collaborator interaction."},
    {"name": "Problem Solving & Critical Thinking", "category": SkillCategory.SOFT_SKILL, "description": "Analytical problem solving in clinical and laboratory settings."}
]

INITIAL_CAREER_ROLES = [
    {
        "name": "Ayurvedic Pharmaceutical R&D",
        "slug": "ayurvedic-pharmaceutical-rd",
        "category": CareerCategory.AYURVEDA_PHARMACEUTICAL,
        "domain": "Research & Development",
        "short_description": "Research and formulation development of standardized Ayurvedic medicines.",
        "description": "Focuses on formulation development, botanical marker extraction, standardization of Ayurvedic drugs, laboratory testing, and pharmaceutical documentation following pharmacopoeia standards.",
        "display_order": 1
    },
    {
        "name": "Ayurvedic Clinical Research",
        "slug": "ayurvedic-clinical-research",
        "category": CareerCategory.AYURVEDA_RESEARCH,
        "domain": "Clinical R&D",
        "short_description": "Clinical trials, protocol design, and GCP compliance for Ayush products.",
        "description": "Involves designing and conducting Good Clinical Practice (GCP) compliant clinical studies, validating traditional Ayurvedic remedies using modern clinical trial methodologies and observational studies.",
        "display_order": 2
    },
    {
        "name": "Ayurvedic Product Development",
        "slug": "ayurvedic-product-development",
        "category": CareerCategory.AYURVEDA_PHARMACEUTICAL,
        "domain": "Product Formulation",
        "short_description": "Translating classical formulations into modern consumer healthcare products.",
        "description": "Bridges classical Ayurvedic pharmacology (Dravyaguna & Rasashastra) with modern nutraceuticals, cosmetics, and OTC healthcare formulation development.",
        "display_order": 3
    },
    {
        "name": "Quality Control – Ayurveda",
        "slug": "quality-control-ayurveda",
        "category": CareerCategory.AYURVEDA_QUALITY,
        "domain": "Quality Assurance & QC",
        "short_description": "Raw material testing, HPLC marker analysis, and heavy metal testing.",
        "description": "Ensures raw botanical and mineral raw materials adhere to ASU Pharmacopoeia standards using analytical chemistry tools like HPLC, TLC, UV-Vis, and heavy metal limits testing.",
        "display_order": 4
    },
    {
        "name": "Ayurvedic Manufacturing & GMP",
        "slug": "ayurvedic-manufacturing-gmp",
        "category": CareerCategory.AYURVEDA_MANUFACTURING,
        "domain": "Manufacturing & Supply Chain",
        "short_description": "Industrial scale production under Schedule T GMP regulations.",
        "description": "Oversees large-scale manufacturing of churnas, kwathas, bhasmas, and modern tablet/capsule dosage forms while ensuring strict compliance with Schedule T Good Manufacturing Practices.",
        "display_order": 5
    },
    {
        "name": "Pharmacognosy Research",
        "slug": "pharmacognosy-research",
        "category": CareerCategory.AYURVEDA_RESEARCH,
        "domain": "Herbal Standardization",
        "short_description": "Botanical verification, microscopic evaluation, and phytochemical profiling.",
        "description": "Focuses on identifying medicinal plants, evaluating microscopic cellular structures, preventing adulteration, and establishing botanical authentication protocols.",
        "display_order": 6
    },
    {
        "name": "Ayurveda Clinical Practice",
        "slug": "ayurveda-clinical-practice",
        "category": CareerCategory.AYURVEDA_CLINICAL,
        "domain": "Clinical Operations",
        "short_description": "Patient care, Nadi Pariksha diagnosis, and Panchakarma management.",
        "description": "Professional patient consultation, traditional diagnostic evaluation (Pariksha), personalized treatment protocol planning, and hospital Panchakarma unit oversight.",
        "display_order": 7
    },
    {
        "name": "Ayurveda Public Health",
        "slug": "ayurveda-public-health",
        "category": CareerCategory.AYURVEDA_PUBLIC_HEALTH,
        "domain": "Public Health & Preventive Medicine",
        "short_description": "Preventive healthcare, Swasthavritta protocols, and community Ayush programs.",
        "description": "Designing and executing community health initiatives, epidemic prevention protocols based on Swasthavritta & Ritucharya, and public health policy implementation.",
        "display_order": 8
    },
    {
        "name": "AYUSH Research & Innovation",
        "slug": "ayush-research-innovation",
        "category": CareerCategory.AYUSH_TECHNOLOGY,
        "domain": "IPR & Patent Research",
        "short_description": "Patenting, Traditional Knowledge Digital Library (TKDL) research, and biotech innovation.",
        "description": "Securing Intellectual Property Rights for novel Ayush formulations, conducting TKDL verification, and integrating modern biotechnology with traditional health wisdom.",
        "display_order": 9
    },
    {
        "name": "Ayurveda Healthcare Technology",
        "slug": "ayurveda-healthcare-technology",
        "category": CareerCategory.AYUSH_TECHNOLOGY,
        "domain": "Digital Health & EMR",
        "short_description": "Tele-Ayush software, AI diagnostic tools, and Ayush EMR systems.",
        "description": "Building and deploying modern software platforms, Tele-Ayush consultation tools, digital Prakriti assessment algorithms, and standardized EMR for Ayurveda practice.",
        "display_order": 10
    }
]

DEV_SEED_USERS = []

INITIAL_QUESTIONS_DATA = [
    # --- TECHNICAL QUESTIONS (10) ---
    {
        "text": "What is the primary objective of Schedule T Good Manufacturing Practices (GMP) in ASU drug production?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Good Manufacturing Practice (GMP)",
        "weight": 1.0,
        "explanation": "Schedule T of Drugs and Cosmetics Rules mandates quality control, hygiene, and standardized manufacturing for ASU medicines.",
        "options": [
            {"text": "To ensure consistent product quality, safety, and controlled manufacturing", "correct": True},
            {"text": "To increase shelf life beyond 100 years", "correct": False},
            {"text": "To reduce raw material procurement costs by half", "correct": False},
            {"text": "To bypass analytical marker testing", "correct": False}
        ]
    },
    {
        "text": "Which analytical technique is most widely specified in Ayurvedic Pharmacopoeia for quantitating chemical marker compounds?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Phytochemistry & High-Performance Liquid Chromatography (HPLC)",
        "weight": 1.2,
        "explanation": "HPLC is the gold standard for separating and quantitating phytochemical markers in plant extracts.",
        "options": [
            {"text": "High-Performance Liquid Chromatography (HPLC)", "correct": True},
            {"text": "Flame Photometry", "correct": False},
            {"text": "Gravimetric Precipitation", "correct": False},
            {"text": "Refractometry", "correct": False}
        ]
    },
    {
        "text": "Under ASU drug regulations, what is the maximum permissible limit for lead (Pb) in finished Ayurvedic formulations?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.HARD,
        "skill_name": "Ayush Regulatory Compliance & Drug Standardizations",
        "weight": 1.5,
        "explanation": "Ayurvedic Pharmacopoeia limits lead (Pb) to 10 ppm for internal herbal formulations.",
        "options": [
            {"text": "10 ppm", "correct": True},
            {"text": "50 ppm", "correct": False},
            {"text": "100 ppm", "correct": False},
            {"text": "0.1 ppm", "correct": False}
        ]
    },
    {
        "text": "In clinical research, which document provides standardized global guidelines for scientific and ethical clinical trial conduct?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Clinical Trial Protocol Design & GCP Guidelines",
        "weight": 1.0,
        "explanation": "ICH Good Clinical Practice (GCP) guidelines define standards for clinical trial conduct, safety, and data integrity.",
        "options": [
            {"text": "ICH Good Clinical Practice (GCP) Guidelines", "correct": True},
            {"text": "ISO 9001 Quality Policy", "correct": False},
            {"text": "WHO Botanical Nomenclature Rules", "correct": False},
            {"text": "Schedule M-III", "correct": False}
        ]
    },
    {
        "text": "What is the primary function of stationary phase silica gel in Thin Layer Chromatography (TLC) of plant extracts?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Phytochemistry & High-Performance Liquid Chromatography (HPLC)",
        "weight": 1.0,
        "explanation": "Silica gel acts as a polar adsorbent stationary phase separating compounds based on affinity.",
        "options": [
            {"text": "To adsorb and separate constituent phytocompounds based on polarity", "correct": True},
            {"text": "To evaporate the solvent mobile phase", "correct": False},
            {"text": "To hydrolyze saponins into sapogenins", "correct": False},
            {"text": "To dissolve non-polar waxes", "correct": False}
        ]
    },
    {
        "text": "Which parameter measures the spread of data points around the mean in clinical trial statistical analysis?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Data Analysis & Statistical Validation",
        "weight": 1.0,
        "explanation": "Standard deviation quantifies the variation or dispersion of a set of data values.",
        "options": [
            {"text": "Standard Deviation", "correct": True},
            {"text": "Median Absolute Limit", "correct": False},
            {"text": "Correlation Co-coefficient", "correct": False},
            {"text": "Probability Index", "correct": False}
        ]
    },
    {
        "text": "Which regulatory body publishes the Ayurvedic Pharmacopoeia of India (API)?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Ayush Regulatory Compliance & Drug Standardizations",
        "weight": 1.0,
        "explanation": "Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H) under Ministry of Ayush publishes API.",
        "options": [
            {"text": "PCIM&H (Ministry of Ayush)", "correct": True},
            {"text": "Central Drugs Standard Control Organization (CDSCO)", "correct": False},
            {"text": "Indian Council of Medical Research (ICMR)", "correct": False},
            {"text": "Food Safety and Standards Authority of India (FSSAI)", "correct": False}
        ]
    },
    {
        "text": "What does a p-value of less than 0.05 signify in clinical research statistical hypothesis testing?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Data Analysis & Statistical Validation",
        "weight": 1.2,
        "explanation": "A p-value < 0.05 indicates statistically significant evidence against the null hypothesis.",
        "options": [
            {"text": "Statistically significant difference between treatment groups", "correct": True},
            {"text": "50% probability of study error", "correct": False},
            {"text": "The trial sample size is inadequate", "correct": False},
            {"text": "Zero clinical efficacy", "correct": False}
        ]
    },
    {
        "text": "What is the key purpose of a Batch Manufacturing Record (BMR) in Ayurvedic pharmaceutical manufacturing?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Good Manufacturing Practice (GMP)",
        "weight": 1.0,
        "explanation": "BMR documents step-by-step processing parameters and raw material lot usage for complete batch traceability.",
        "options": [
            {"text": "To document step-by-step processing and ensure batch traceability", "correct": True},
            {"text": "To record daily sales transactions", "correct": False},
            {"text": "To list employee salary structures", "correct": False},
            {"text": "To calculate retail profit margins", "correct": False}
        ]
    },
    {
        "text": "What is the primary requirement for creating digital Electronic Medical Records (EMR) compliant with ABDM standards?",
        "category": QuestionCategory.TECHNICAL,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Ayurvedic Electronic Medical Records (EMR) & Digital Health",
        "weight": 1.0,
        "explanation": "ABDM compliance requires standardized clinical terminology and secure ABHA health ID integration.",
        "options": [
            {"text": "Standardized clinical terminology and ABHA ID integration", "correct": True},
            {"text": "Manual paper register scanning", "correct": False},
            {"text": "Third-party advertising cookies", "correct": False},
            {"text": "Proprietary non-interoperable data formats", "correct": False}
        ]
    },

    # --- DOMAIN QUESTIONS (10) ---
    {
        "text": "In Dravyaguna, which test parameter determines the moisture content of raw crude drugs to prevent fungal contamination?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Dravyaguna & Herbal Identification",
        "weight": 1.0,
        "explanation": "Loss on Drying (LOD) determines moisture and volatile matter in raw herbal material.",
        "options": [
            {"text": "Loss on Drying (LOD)", "correct": True},
            {"text": "Acid Insoluble Ash", "correct": False},
            {"text": "Extractive Value in Ether", "correct": False},
            {"text": "Swelling Index", "correct": False}
        ]
    },
    {
        "text": "Which classical Rasashastra test verifies that a Bhasma is extremely fine and floats on water surface?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Rasashastra & Bhasma Preparation",
        "weight": 1.2,
        "explanation": "Varitaratwa confirms particle lightness where Bhasma floats on calm water surface.",
        "options": [
            {"text": "Varitaratwa", "correct": True},
            {"text": "Niruttha", "correct": False},
            {"text": "Apunarbhava", "correct": False},
            {"text": "Rekhapurnatva", "correct": False}
        ]
    },
    {
        "text": "According to Ashtavidha Pariksha, which pulse characteristic is traditionally associated with Vata dosha dominance?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
        "weight": 1.0,
        "explanation": "Vata Nadi exhibits Sarpagathi (serpentine/snake-like movement).",
        "options": [
            {"text": "Sarpagathi (Serpentine / Snake movement)", "correct": True},
            {"text": "Mandukagathi (Frog movement)", "correct": False},
            {"text": "Hamsagathi (Swan movement)", "correct": False},
            {"text": "Gajagathi (Elephant movement)", "correct": False}
        ]
    },
    {
        "text": "In Panchakarma procedure protocol, which purvakarma (preparatory procedure) involves internal administration of medicated ghee?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Panchakarma Procedure Protocols",
        "weight": 1.0,
        "explanation": "Snehapana (internal oleation) is the primary preparatory procedure before Vamana or Virechana.",
        "options": [
            {"text": "Snehapana", "correct": True},
            {"text": "Swedana", "correct": False},
            {"text": "Abhyanga", "correct": False},
            {"text": "Shirodhara", "correct": False}
        ]
    },
    {
        "text": "Which pharmaceutical dosage form involves fermentation to generate self-generated alcohol as a natural preservative?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Ayurvedic Formulation Science",
        "weight": 1.0,
        "explanation": "Asava and Arishta are fermented liquid preparations containing self-generated alcohol.",
        "options": [
            {"text": "Asava and Arishta", "correct": True},
            {"text": "Avaleha", "correct": False},
            {"text": "Ghutika", "correct": False},
            {"text": "Kalka", "correct": False}
        ]
    },
    {
        "text": "What is the primary classical indication for Shodhana (purification) treatment of toxic herbal drugs like Bhallataka?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.HARD,
        "skill_name": "Dravyaguna & Herbal Identification",
        "weight": 1.5,
        "explanation": "Shodhana detoxifies harmful chemical components while potentiating therapeutic efficacy.",
        "options": [
            {"text": "Detoxifying toxic principles while enhancing therapeutic efficacy", "correct": True},
            {"text": "Increasing total dry weight by 50%", "correct": False},
            {"text": "Removing natural green chlorophyll color", "correct": False},
            {"text": "Converting alkaloid into volatile oil", "correct": False}
        ]
    },
    {
        "text": "In Rasashastra, what is the role of Shodhana processing using Media like Kanji or Godugdha?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Rasashastra & Bhasma Preparation",
        "weight": 1.2,
        "explanation": "Media processing neutralizes raw mineral toxicity and reduces particle size prior to Marana (incineration).",
        "options": [
            {"text": "Neutralizing raw mineral toxicity and reducing particle matrix size", "correct": True},
            {"text": "Converting inorganic metals into synthetic polymers", "correct": False},
            {"text": "Bleaching the color of metallic ores", "correct": False},
            {"text": "Increasing water solubility to 100%", "correct": False}
        ]
    },
    {
        "text": "Which Ashtavidha Pariksha component specifically evaluates tongue coating, color, and moisture?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
        "weight": 1.0,
        "explanation": "Jihva Pariksha evaluates tongue appearance to assess Ama and Agni status.",
        "options": [
            {"text": "Jihva Pariksha", "correct": True},
            {"text": "Mutra Pariksha", "correct": False},
            {"text": "Drik Pariksha", "correct": False},
            {"text": "Akriti Pariksha", "correct": False}
        ]
    },
    {
        "text": "What is the essential post-procedure dietary regimen prescribed after Panchakarma therapies called?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Panchakarma Procedure Protocols",
        "weight": 1.0,
        "explanation": "Samsarjana Krama is the progressive dietary protocol to restore digestive fire (Agni).",
        "options": [
            {"text": "Samsarjana Krama", "correct": True},
            {"text": "Pathya Apathya Index", "correct": False},
            {"text": "Rasayana Krama", "correct": False},
            {"text": "Langhana Protocol", "correct": False}
        ]
    },
    {
        "text": "What is the shelf life (saviryata avadhi) specified for Churna formulations under Ayurvedic Pharmacopoeia rules?",
        "category": QuestionCategory.DOMAIN,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Ayurvedic Formulation Science",
        "weight": 1.0,
        "explanation": "Under updated gazette notifications, packaged herbal churnas have a shelf life of 2 years.",
        "options": [
            {"text": "2 Years", "correct": True},
            {"text": "10 Years", "correct": False},
            {"text": "1 Month", "correct": False},
            {"text": "50 Years", "correct": False}
        ]
    },

    # --- SOFT SKILLS QUESTIONS (5) ---
    {
        "text": "During an interdisciplinary research meeting, an investigator presents data contradicting your initial hypothesis. What is the most professional response?",
        "category": QuestionCategory.SOFT_SKILL,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Problem Solving & Critical Thinking",
        "weight": 1.0,
        "explanation": "Objective scientific analysis requires open evaluation of contradictory data without emotional bias.",
        "options": [
            {"text": "Objectively examine the dataset, controls, and methodology with the investigator", "correct": True},
            {"text": "Dismiss the data immediately to protect your hypothesis", "correct": False},
            {"text": "File an administrative complaint against the investigator", "correct": False},
            {"text": "Refuse to participate in further team discussions", "correct": False}
        ]
    },
    {
        "text": "When communicating complex Ayurvedic treatment protocols to a patient who has low health literacy, what is the best practice?",
        "category": QuestionCategory.SOFT_SKILL,
        "difficulty": QuestionDifficulty.EASY,
        "skill_name": "Professional Communication & Ethics",
        "weight": 1.0,
        "explanation": "Using clear, jargon-free language and verifying understanding ensures patient adherence and safety.",
        "options": [
            {"text": "Use simple language, visual guides, and confirm understanding via teach-back", "correct": True},
            {"text": "Hand them classical Sanskrit texts without explanation", "correct": False},
            {"text": "Speak quickly using medical jargon to save consultation time", "correct": False},
            {"text": "Instruct them to research the treatment independently online", "correct": False}
        ]
    },
    {
        "text": "While conducting a clinical trial, a minor protocol deviation occurs. What is the ethical requirement?",
        "category": QuestionCategory.SOFT_SKILL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Professional Communication & Ethics",
        "weight": 1.2,
        "explanation": "Ethical research standards require transparent documentation and reporting of protocol deviations to the Institutional Ethics Committee.",
        "options": [
            {"text": "Document the deviation immediately and inform the Principal Investigator and Ethics Committee", "correct": True},
            {"text": "Conceal the deviation to ensure trial publication", "correct": False},
            {"text": "Falsify patient records to match the protocol", "correct": False},
            {"text": "Discontinue the trial without reporting", "correct": False}
        ]
    },
    {
        "text": "A research lab experiences a critical equipment malfunction during a tight publication deadline. What is the most effective problem-solving approach?",
        "category": QuestionCategory.SOFT_SKILL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Problem Solving & Critical Thinking",
        "weight": 1.0,
        "explanation": "Proactive problem solving involves identifying alternative validated facilities while communicating realistic timelines.",
        "options": [
            {"text": "Identify alternative validated facilities, log the incident, and communicate revised timelines", "correct": True},
            {"text": "Fabricate expected data points to meet the deadline", "correct": False},
            {"text": "Blame maintenance staff publicly and abandon the project", "correct": False},
            {"text": "Wait passively for equipment replacement without notifying stakeholders", "correct": False}
        ]
    },
    {
        "text": "In a collaborative R&D project between an academic institution and an industry partner, how should intellectual property rights (IPR) be managed?",
        "category": QuestionCategory.SOFT_SKILL,
        "difficulty": QuestionDifficulty.MEDIUM,
        "skill_name": "Professional Communication & Ethics",
        "weight": 1.0,
        "explanation": "Clear, written legal agreements (MOU/NDA) establishing IP ownership prior to collaborative research prevent future disputes.",
        "options": [
            {"text": "Establish transparent, written IP sharing agreements (MOU) before project execution", "correct": True},
            {"text": "Rely on verbal assurances without written contracts", "correct": False},
            {"text": "Allow the largest financial contributor to claim 100% sole ownership retroactively", "correct": False},
            {"text": "Keep all experimental methodologies secret from team members", "correct": False}
        ]
    }
]


async def init_db(db: AsyncSession) -> None:
    # Ensure role-based structured name columns exist
    try:
        from sqlalchemy import text
        table_columns = [
            ("student_profiles", "name_prefix", "VARCHAR(50)"),
            ("student_profiles", "middle_name", "VARCHAR(150)"),
            ("doctor_profiles", "name_prefix", "VARCHAR(50) DEFAULT 'Dr.'"),
            ("doctor_profiles", "first_name", "VARCHAR(150)"),
            ("doctor_profiles", "middle_name", "VARCHAR(150)"),
            ("doctor_profiles", "last_name", "VARCHAR(150)"),
            ("faculty_profiles", "name_prefix", "VARCHAR(50) DEFAULT 'Prof.'"),
            ("faculty_profiles", "first_name", "VARCHAR(150)"),
            ("faculty_profiles", "middle_name", "VARCHAR(150)"),
            ("faculty_profiles", "last_name", "VARCHAR(150)"),
            ("institution_profiles", "contact_person_prefix", "VARCHAR(50)"),
            ("institution_profiles", "contact_person_first_name", "VARCHAR(150)"),
            ("institution_profiles", "contact_person_middle_name", "VARCHAR(150)"),
            ("institution_profiles", "contact_person_last_name", "VARCHAR(150)"),
            ("institution_profiles", "contact_person_name", "VARCHAR(255)"),
            ("users", "google_id", "VARCHAR(255)"),
            ("users", "auth_provider", "VARCHAR(50) DEFAULT 'LOCAL'"),
            ("users", "avatar_url", "VARCHAR(500)"),
        ]
        for tbl, col, ctype in table_columns:
            try:
                await db.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {ctype};"))
                await db.commit()
            except Exception:
                await db.rollback()
    except Exception:
        pass

    # Seed Initial Career Roles
    for role_data in INITIAL_CAREER_ROLES:
        res = await db.execute(select(CareerRole).where(CareerRole.slug == role_data["slug"]))
        existing_role = res.scalars().first()
        if not existing_role:
            role = CareerRole(
                name=role_data["name"],
                slug=role_data["slug"],
                category=role_data["category"],
                domain=role_data["domain"],
                short_description=role_data["short_description"],
                description=role_data["description"],
                display_order=role_data["display_order"],
                is_active=True
            )
            db.add(role)

    await db.flush()

    # Seed Dev Users
    for user_data in DEV_SEED_USERS:
        res = await db.execute(select(User).where(User.email == user_data["email"]))
        user = res.scalars().first()
        if not user:
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash("AyurSetu@2026"),
                role=user_data["role"],
                is_active=True,
                is_verified=True
            )
            db.add(user)
            await db.flush()

            # Create associated profile
            if user_data["role"] == UserRole.STUDENT:
                res_default_role = await db.execute(select(CareerRole).where(CareerRole.slug == "ayurvedic-pharmaceutical-rd"))
                default_target_role = res_default_role.scalars().first()

                sp = StudentProfile(
                    user_id=user.id,
                    first_name="Aarav",
                    last_name="Sharma",
                    full_name="Aarav Sharma",
                    college_name="National Institute of Ayurveda",
                    course="BAMS",
                    current_year=4,
                    graduation_year=2027,
                    cgpa=8.5,
                    city="Jaipur",
                    state="Rajasthan",
                    bio="Final year BAMS student specializing in Dravyaguna and Herbal Formulation.",
                    target_career_id=default_target_role.id if default_target_role else None
                )
                db.add(sp)
            elif user_data["role"] == UserRole.FACULTY:
                inst_dummy_id = uuid.uuid4()
                fp = FacultyProfile(
                    user_id=user.id,
                    institution_id=inst_dummy_id,
                    full_name="Dr. Rajesh Sharma",
                    department="Dravyaguna",
                    designation="Associate Professor"
                )
                db.add(fp)
            elif user_data["role"] == UserRole.INDUSTRY:
                ip = IndustryProfile(
                    user_id=user.id,
                    company_name="Dabur Ayush Research Lab",
                    registration_number="REG-109283",
                    industry_domain="Herbal Pharma"
                )
                db.add(ip)
            elif user_data["role"] == UserRole.INSTITUTION:
                inst_p = InstitutionProfile(
                    user_id=user.id,
                    institution_name="National Institute of Ayurveda",
                    aishe_code="AISHE-C-99881",
                    state="Rajasthan",
                    city="Jaipur",
                    verification_status=VerificationStatus.VERIFIED
                )
                db.add(inst_p)
            elif user_data["role"] == UserRole.DOCTOR:
                dp = DoctorProfile(
                    user_id=user.id,
                    name_prefix="Dr.",
                    first_name="Rajeshwari",
                    last_name="Sharma",
                    full_name="Dr. Rajeshwari Sharma",
                    registration_number="AYUR-DOC-001928",
                    state_medical_council="Delhi Bharatiya Chikitsa Parishad",
                    qualification="BAMS, MD (Ayurveda - Panchakarma)",
                    specialization="Panchakarma & Clinical Ayurveda",
                    years_of_experience=15,
                    designation="Senior Consultant & Academician",
                    city="New Delhi",
                    state="Delhi",
                    verification_status=VerificationStatus.VERIFIED
                )
                db.add(dp)
            elif user_data["role"] == UserRole.NGO:
                ngo_p = NGOProfile(
                    user_id=user.id,
                    name="Arogya Seva Foundation",
                    darpan_id="DL/2021/0289124",
                    registration_number="NGO-DL-98211",
                    description="Non-profit healthcare organization conducting free Ayurvedic health camps and rural wellness outreach across India.",
                    service_areas=["Free Health Camps", "Herb Conservation", "Tribal Health Outreach", "Preventive Ayurveda"],
                    contact_person="Vaidya Anil Deshmukh",
                    email="ngo@ayursetu.local",
                    phone="+91 98765 43210",
                    city="New Delhi",
                    state="Delhi",
                    address="12, Institutional Area, Lodhi Road, New Delhi",
                    pincode="110003",
                    verification_status=VerificationStatus.VERIFIED
                )
                db.add(ngo_p)

    # Seed Initial Skills
    for skill_data in INITIAL_SKILLS:
        res_skill = await db.execute(select(Skill).where(Skill.name == skill_data["name"]))
        existing_skill = res_skill.scalars().first()
        if not existing_skill:
            skill = Skill(
                name=skill_data["name"],
                category=skill_data["category"],
                description=skill_data["description"]
            )
            db.add(skill)

    await db.flush()

    # Seed Default Career Path
    res_career = await db.execute(select(CareerPath).where(CareerPath.title == "Ayurvedic Clinical Researcher & Quality Analyst"))
    career = res_career.scalars().first()
    if not career:
        career = CareerPath(
            title="Ayurvedic Clinical Researcher & Quality Analyst",
            domain="R&D / Clinical Quality",
            description="Specialized career bridging traditional clinical diagnosis with modern phytochemistry and GCP clinical research."
        )
        db.add(career)
        await db.flush()

        res_all_skills = await db.execute(select(Skill))
        all_skills = res_all_skills.scalars().all()
        for s in all_skills:
            csr = CareerSkillRequirement(
                career_id=career.id,
                skill_id=s.id,
                required_proficiency=ProficiencyLevel.INTERMEDIATE,
                importance_weight=1.2
            )
            db.add(csr)

    # Seed Phase 5 Assessment Questions & Options
    for q_data in INITIAL_QUESTIONS_DATA:
        res_q = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.question_text == q_data["text"]))
        existing_q = res_q.scalars().first()
        if not existing_q:
            # Find skill by name
            res_s = await db.execute(select(Skill).where(Skill.name == q_data["skill_name"]))
            target_skill = res_s.scalars().first()
            if not target_skill:
                # Fallback to first available skill
                res_any_s = await db.execute(select(Skill))
                target_skill = res_any_s.scalars().first()

            question = AssessmentQuestion(
                question_text=q_data["text"],
                question_type=QuestionType.MCQ,
                category=q_data["category"],
                difficulty=q_data["difficulty"],
                skill_id=target_skill.id,
                weight=q_data["weight"],
                explanation=q_data["explanation"],
                is_active=True
            )
            db.add(question)
            await db.flush()

            # Add Options
            for idx, opt_data in enumerate(q_data["options"], start=1):
                option = AssessmentOption(
                    question_id=question.id,
                    option_text=opt_data["text"],
                    option_order=idx,
                    is_correct=opt_data["correct"]
                )
                db.add(option)

    # Seed Phase 7 Role Required Skills Templates
    from app.models.domain import RoleRequiredSkill

    ROLE_REQUIRED_TEMPLATES = {
        "ayurvedic-pharmaceutical-rd": [
            {"skill_name": "Good Manufacturing Practice (GMP)", "score": 80.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Ayurvedic Formulation Science", "score": 85.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Phytochemistry & High-Performance Liquid Chromatography (HPLC)", "score": 75.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Ayush Regulatory Compliance & Drug Standardizations", "score": 75.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Data Analysis & Statistical Validation", "score": 70.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Professional Communication & Ethics", "score": 70.0, "importance": "MEDIUM", "is_required": True},
            {"skill_name": "Problem Solving & Critical Thinking", "score": 70.0, "importance": "MEDIUM", "is_required": True},
        ],
        "ayurvedic-clinical-research": [
            {"skill_name": "Clinical Trial Protocol Design & GCP Guidelines", "score": 85.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)", "score": 80.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Data Analysis & Statistical Validation", "score": 75.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Ayush Regulatory Compliance & Drug Standardizations", "score": 75.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Professional Communication & Ethics", "score": 75.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Problem Solving & Critical Thinking", "score": 75.0, "importance": "HIGH", "is_required": True},
        ],
        "ayurvedic-product-development": [
            {"skill_name": "Ayurvedic Formulation Science", "score": 85.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Dravyaguna & Herbal Identification", "score": 80.0, "importance": "CRITICAL", "is_required": True},
            {"skill_name": "Rasashastra & Bhasma Preparation", "score": 80.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Good Manufacturing Practice (GMP)", "score": 80.0, "importance": "HIGH", "is_required": True},
            {"skill_name": "Phytochemistry & High-Performance Liquid Chromatography (HPLC)", "score": 70.0, "importance": "MEDIUM", "is_required": True},
            {"skill_name": "Professional Communication & Ethics", "score": 70.0, "importance": "MEDIUM", "is_required": True},
        ]
    }

    for role_slug, req_list in ROLE_REQUIRED_TEMPLATES.items():
        res_r = await db.execute(select(CareerRole).where(CareerRole.slug == role_slug))
        role_obj = res_r.scalars().first()
        if role_obj:
            for req_data in req_list:
                res_sk = await db.execute(select(Skill).where(Skill.name == req_data["skill_name"]))
                sk_obj = res_sk.scalars().first()
                if sk_obj:
                    res_existing_rrs = await db.execute(
                        select(RoleRequiredSkill).where(
                            RoleRequiredSkill.career_role_id == role_obj.id,
                            RoleRequiredSkill.skill_id == sk_obj.id
                        )
                    )
                    existing_rrs = res_existing_rrs.scalars().first()
                    if not existing_rrs:
                        rrs = RoleRequiredSkill(
                            career_role_id=role_obj.id,
                            skill_id=sk_obj.id,
                            required_score=req_data["score"],
                            importance=req_data["importance"],
                            is_required=req_data["is_required"]
                        )
                        db.add(rrs)

    # Seed Phase 8 Learning Resources Catalog
    from app.models.domain import (
        LearningResource,
        LearningResourceSkill,
        LearningResourceCareer,
        ResourceType,
        ResourcePriceType
    )

    RESOURCE_CATALOG = [
        {
            "title": "Good Manufacturing Practice (GMP) in Ayush Industry",
            "description": "Comprehensive guide covering WHO-GMP guidelines, Batch Manufacturing Records (BMR), and cleanroom sanitation in Ayurvedic drug manufacturing.",
            "resource_type": ResourceType.COURSE,
            "provider": "Ayush Academia Learning Hub",
            "url": "https://ayush.gov.in/gmp-course",
            "difficulty": QuestionDifficulty.MEDIUM,
            "estimated_hours": 20,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Good Manufacturing Practice (GMP)", 1.0), ("Ayush Regulatory Compliance & Drug Standardizations", 0.7)],
            "careers": [("ayurvedic-pharmaceutical-rd", 1.0), ("quality-control-ayurveda", 0.9)]
        },
        {
            "title": "Phytochemistry & High-Performance Liquid Chromatography (HPLC) Workshop",
            "description": "Hands-on virtual lab workshop on marker compound estimation, extraction protocols, and chromatogram analysis for herbal extracts.",
            "resource_type": ResourceType.WORKSHOP,
            "provider": "National Institute of Ayurveda",
            "url": "https://nia.nic.in/hplc-workshop",
            "difficulty": QuestionDifficulty.HARD,
            "estimated_hours": 15,
            "price_type": ResourcePriceType.PAID,
            "skills": [("Phytochemistry & High-Performance Liquid Chromatography (HPLC)", 1.0), ("Dravyaguna & Herbal Identification", 0.6)],
            "careers": [("ayurvedic-pharmaceutical-rd", 1.0), ("pharmacognosy-research", 1.0)]
        },
        {
            "title": "Data Analysis & Statistical Validation for Ayush Research",
            "description": "Learn biostatistics, p-value validation, regression modeling, and SPSS/R data analysis tailored for clinical trials and herbal studies.",
            "resource_type": ResourceType.COURSE,
            "provider": "Central Council for Research in Ayurvedic Sciences (CCRAS)",
            "url": "https://ccras.nic.in/data-analysis",
            "difficulty": QuestionDifficulty.MEDIUM,
            "estimated_hours": 25,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Data Analysis & Statistical Validation", 1.0), ("Clinical Trial Protocol Design & GCP Guidelines", 0.6)],
            "careers": [("ayurvedic-clinical-research", 1.0), ("ayurvedic-pharmaceutical-rd", 0.8)]
        },
        {
            "title": "Clinical Trial Protocol Design & Good Clinical Practice (GCP)",
            "description": "Essential training on ICMR-Ayush ethical guidelines, informed consent, clinical trial registry (CTRI), and clinical auditing.",
            "resource_type": ResourceType.CERTIFICATION,
            "provider": "Indian Council of Medical Research (ICMR)",
            "url": "https://icmr.gov.in/gcp-certification",
            "difficulty": QuestionDifficulty.HARD,
            "estimated_hours": 30,
            "price_type": ResourcePriceType.MIXED,
            "skills": [("Clinical Trial Protocol Design & GCP Guidelines", 1.0), ("Professional Communication & Ethics", 0.5)],
            "careers": [("ayurvedic-clinical-research", 1.0)]
        },
        {
            "title": "Ayurvedic Formulation Science & Novel Delivery Systems",
            "description": "Explore traditional Rasa and Bhasma formulation principles integrated with modern micro-encapsulation and phytosome technology.",
            "resource_type": ResourceType.PROJECT,
            "provider": "Ayush Innovation Lab",
            "url": "https://ayush-innovation.org/formulation-project",
            "difficulty": QuestionDifficulty.MEDIUM,
            "estimated_hours": 40,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Ayurvedic Formulation Science", 1.0), ("Rasashastra & Bhasma Preparation", 0.8)],
            "careers": [("ayurvedic-product-development", 1.0), ("ayurvedic-pharmaceutical-rd", 0.9)]
        },
        {
            "title": "Professional Communication & Ethics in Healthcare",
            "description": "Master technical documentation, scientific paper drafting, grant writing, and ethical patient communication in Ayush research.",
            "resource_type": ResourceType.WORKSHOP,
            "provider": "All India Institute of Ayurveda (AIIA)",
            "url": "https://aiia.gov.in/ethics-comm",
            "difficulty": QuestionDifficulty.EASY,
            "estimated_hours": 10,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Professional Communication & Ethics", 1.0), ("Problem Solving & Critical Thinking", 0.5)],
            "careers": [("ayurveda-clinical-practice", 0.9), ("ayurvedic-clinical-research", 0.8)]
        },
        {
            "title": "Dravyaguna Authentication & Microscopic Herbal QC Project",
            "description": "Practical project on crude drug organoleptic evaluation, powder microscopy, and thin-layer chromatography (TLC) fingerprinting.",
            "resource_type": ResourceType.PROJECT,
            "provider": "Herbal Standards Research Center",
            "url": "https://herbal-qc.org/microscopy-project",
            "difficulty": QuestionDifficulty.MEDIUM,
            "estimated_hours": 20,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Dravyaguna & Herbal Identification", 1.0), ("Ayush Regulatory Compliance & Drug Standardizations", 0.7)],
            "careers": [("ayurvedic-product-development", 1.0), ("pharmacognosy-research", 0.9)]
        },
        {
            "title": "Ayurvedic Electronic Medical Records (EMR) & ABDM Digital Health",
            "description": "Understanding Ayush GRID, ABDM health stack, SNOMED-CT clinical terms, and EMR integration for modern Ayurvedic hospitals.",
            "resource_type": ResourceType.COURSE,
            "provider": "National Health Authority (NHA)",
            "url": "https://abdm.gov.in/ayush-emr",
            "difficulty": QuestionDifficulty.EASY,
            "estimated_hours": 12,
            "price_type": ResourcePriceType.FREE,
            "skills": [("Ayurvedic Electronic Medical Records (EMR) & Digital Health", 1.0), ("Problem Solving & Critical Thinking", 0.4)],
            "careers": [("ayurveda-healthcare-technology", 1.0), ("ayurveda-clinical-practice", 0.7)]
        }
    ]

    for res_item in RESOURCE_CATALOG:
        res_check = await db.execute(select(LearningResource).where(LearningResource.title == res_item["title"]))
        existing_res = res_check.scalars().first()
        if not existing_res:
            resource = LearningResource(
                title=res_item["title"],
                description=res_item["description"],
                resource_type=res_item["resource_type"],
                provider=res_item["provider"],
                url=res_item["url"],
                difficulty=res_item["difficulty"],
                estimated_hours=res_item["estimated_hours"],
                price_type=res_item["price_type"],
                is_active=True
            )
            db.add(resource)
            await db.flush()

            # Map skills
            for sk_name, weight in res_item["skills"]:
                sk_res = await db.execute(select(Skill).where(Skill.name == sk_name))
                sk_obj = sk_res.scalars().first()
                if sk_obj:
                    lr_skill = LearningResourceSkill(
                        learning_resource_id=resource.id,
                        skill_id=sk_obj.id,
                        relevance_weight=weight
                    )
                    db.add(lr_skill)

                    lr_career = LearningResourceCareer(
                        learning_resource_id=resource.id,
                        career_role_id=role_obj.id,
                        relevance_weight=weight
                    )
                    db.add(lr_career)

    # Seed Phase 9 Industry Opportunities Catalog
    from datetime import timedelta
    from app.models.domain import (
        IndustryOpportunity,
        OpportunityRequiredSkill,
        OpportunityCareerRole,
        OpportunityType,
        WorkMode,
        EmploymentType,
        ExperienceLevel,
        OpportunitySourceType,
        OpportunityStatus
    )


    future_deadline = datetime.now(timezone.utc) + timedelta(days=45)

    OPPORTUNITY_CATALOG = [
        {
            "title": "Junior Ayurvedic R&D Scientist Intern",
            "description": "Join Dabur's Ayurvedic Herbal Formulation Lab. Assist senior scientists in raw botanical standardization, marker compound extraction, and stability testing.",
            "responsibilities": "Execute HPLC assay preparation, maintain Batch Manufacturing Records (BMR), conduct TLC fingerprinting of herbal extracts.",
            "requirements": "BAMS / B.Pharm (Ayush) student or graduate. Foundational knowledge in Ayurvedic Formulation & Phytochemistry.",
            "opportunity_type": OpportunityType.INTERNSHIP,
            "organization_name": "Dabur Research Foundation (Demo)",
            "organization_description": "Premier research organization dedicated to Ayurvedic healthcare standardization.",
            "location_text": "Ghaziabad, Uttar Pradesh",
            "city": "Ghaziabad",
            "state": "Uttar Pradesh",
            "country": "India",
            "work_mode": WorkMode.HYBRID,
            "employment_type": EmploymentType.INTERNSHIP,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://dabur-demo.ayursetu.org/careers/rd-intern",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 18000.0,
            "salary_max": 22000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayurvedic Formulation Science", 70.0, "CRITICAL", True),
                ("Research Methodology & Study Design", 60.0, "HIGH", True),
                ("Data Analysis & Statistical Validation", 60.0, "MEDIUM", True),
                ("Good Manufacturing Practice (GMP)", 70.0, "HIGH", True),
                ("Professional Communication & Ethics", 60.0, "LOW", False),
            ],
            "careers": [
                ("ayurvedic-pharmaceutical-rd", 1.0),
                ("ayurvedic-product-development", 0.8),
            ]
        },
        {
            "title": "Clinical Trial Data Associate (Ayush)",
            "description": "Coordinate clinical trial data collection for multi-center clinical evaluation of classical Ayurvedic formulations in metabolic disorders.",
            "responsibilities": "Verify Case Report Forms (CRFs), CTRI registry compliance, data cleaning, statistical summary prep.",
            "requirements": "BAMS / MD (Ayurveda) with interest in biostatistics and GCP clinical research.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "Patanjali Research Institute (Demo)",
            "organization_description": "Leading Ayush research institute conducting scientific validation of Ayurvedic medicines.",
            "location_text": "Haridwar, Uttarakhand",
            "city": "Haridwar",
            "state": "Uttarakhand",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.ENTRY,
            "application_url": "https://patanjali-demo.ayursetu.org/jobs/clinical-data",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 35000.0,
            "salary_max": 45000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Clinical Trial Protocol Design & GCP Guidelines", 75.0, "CRITICAL", True),
                ("Data Analysis & Statistical Validation", 70.0, "CRITICAL", True),
                ("Professional Communication & Ethics", 70.0, "HIGH", True),
                ("Research Methodology & Study Design", 65.0, "HIGH", True),
            ],
            "careers": [
                ("ayurvedic-clinical-research", 1.0),
                ("ayurveda-healthcare-technology", 0.7),
            ]
        },
        {
            "title": "Quality Control & HPLC Analytical Trainee",
            "description": "Perform quality control testing of raw herbal materials, heavy metal limit tests, pesticide residue analysis, and HPLC marker quantification.",
            "responsibilities": "Operate HPLC instruments, maintain laboratory logs, ensure WHO-GMP laboratory compliance.",
            "requirements": "B.Pharm (Ayush) / M.Sc Pharmacognosy. Practical laboratory exposure.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "Himalaya Wellness Company (Demo)",
            "organization_description": "Global herbal health and personal care organization.",
            "location_text": "Bengaluru, Karnataka",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://himalaya-demo.ayursetu.org/careers/qc-trainee",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 28000.0,
            "salary_max": 35000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Phytochemistry & High-Performance Liquid Chromatography (HPLC)", 75.0, "CRITICAL", True),
                ("Good Manufacturing Practice (GMP)", 75.0, "CRITICAL", True),
                ("Dravyaguna & Herbal Identification", 70.0, "HIGH", True),
                ("Ayush Regulatory Compliance & Drug Standardizations", 65.0, "HIGH", True),
            ],
            "careers": [
                ("quality-control-ayurveda", 1.0),
                ("ayurvedic-pharmaceutical-rd", 0.8),
            ]
        },
        {
            "title": "Postdoctoral / Junior Research Fellow — Pharmacognosy",
            "description": "CCRAS-funded research project on authentication and chemical profiling of rare Himalayan medicinal plants.",
            "responsibilities": "Field collection, microscopic characterization, HPTLC fingerprinting, publishing peer-reviewed research papers.",
            "requirements": "MD (Dravyaguna) or Ph.D in Pharmacognosy.",
            "opportunity_type": OpportunityType.RESEARCH,
            "organization_name": "CCRAS Research Center (Demo)",
            "organization_description": "Central Council for Research in Ayurvedic Sciences.",
            "location_text": "New Delhi, Delhi",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "work_mode": WorkMode.HYBRID,
            "employment_type": EmploymentType.FELLOWSHIP,
            "experience_level": ExperienceLevel.ENTRY,
            "application_url": "https://ccras-demo.ayursetu.org/fellowships/jrf-dravyaguna",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 42000.0,
            "salary_max": 50000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Dravyaguna & Herbal Identification", 80.0, "CRITICAL", True),
                ("Research Methodology & Study Design", 75.0, "CRITICAL", True),
                ("Phytochemistry & High-Performance Liquid Chromatography (HPLC)", 70.0, "HIGH", True),
                ("Data Analysis & Statistical Validation", 65.0, "MEDIUM", True),
            ],
            "careers": [
                ("pharmacognosy-research", 1.0),
                ("ayurvedic-clinical-research", 0.7),
            ]
        },
        {
            "title": "Ayurvedic Digital Health & EMR Integration Specialist",
            "description": "Collaborate with software engineers to design Ayush GRID compliant Electronic Medical Record templates and SNOMED-CT clinical coding for Ayurvedic hospitals.",
            "responsibilities": "Define Ayurvedic clinical workflow taxonomies, perform user acceptance testing for ABDM health stack integration.",
            "requirements": "BAMS with passion for digital health, health informatics, and clinical software solutions.",
            "opportunity_type": OpportunityType.PROJECT,
            "organization_name": "Ayush Digital Health Mission Lab (Demo)",
            "organization_description": "National initiative promoting digital innovation in Ayush healthcare.",
            "location_text": "Remote / New Delhi",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "work_mode": WorkMode.REMOTE,
            "employment_type": EmploymentType.PROJECT_BASED,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://digitalayush-demo.ayursetu.org/emr-specialist",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 30000.0,
            "salary_max": 40000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayurvedic Electronic Medical Records (EMR) & Digital Health", 70.0, "CRITICAL", True),
                ("Professional Communication & Ethics", 70.0, "HIGH", True),
                ("Problem Solving & Critical Thinking", 70.0, "HIGH", True),
            ],
            "careers": [
                ("ayurveda-healthcare-technology", 1.0),
                ("ayurveda-clinical-practice", 0.7),
            ]
        },
        {
            "title": "Ayush Regulatory Affairs Executive",
            "description": "Handle Ayush drug license applications, ASU GCP documentation, state licensing authority liaison, and export certificate filings.",
            "responsibilities": "Draft dossier submissions for classical and patent Ayurvedic formulations under Drugs & Cosmetics Act Rules 157-170.",
            "requirements": "B.Pharm (Ayush) / BAMS with working knowledge of Ayush regulatory frameworks.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "Baidyanath Ayurveda Group (Demo)",
            "organization_description": "Legacy Ayurvedic medicine manufacturer in India.",
            "location_text": "Nagpur, Maharashtra",
            "city": "Nagpur",
            "state": "Maharashtra",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.ENTRY,
            "application_url": "https://baidyanath-demo.ayursetu.org/careers/reg-executive",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 32000.0,
            "salary_max": 40000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayush Regulatory Compliance & Drug Standardizations", 75.0, "CRITICAL", True),
                ("Good Manufacturing Practice (GMP)", 70.0, "HIGH", True),
                ("Professional Communication & Ethics", 70.0, "HIGH", True),
            ],
            "careers": [
                ("quality-control-ayurveda", 0.9),
                ("ayurvedic-pharmaceutical-rd", 0.8),
            ]
        },
        {
            "title": "Clinical Research Coordinator — Panchakarma & Musculoskeletal Trials",
            "description": "Coordinate clinical trial operations evaluating Janu Basti and Rasayana therapy in osteoarthritis at All India Institute of Ayurveda.",
            "responsibilities": "Patient screening, informed consent administration, VAS pain scale scoring, adverse event recording.",
            "requirements": "BAMS degree registered with State Board. Clinical experience in Panchakarma procedures.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "All India Institute of Ayurveda (AIIA Demo)",
            "organization_description": "Apex autonomous institute under Ministry of Ayush.",
            "location_text": "New Delhi, Delhi",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://aiia-demo.ayursetu.org/careers/crc-panchakarma",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 40000.0,
            "salary_max": 48000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayurvedic Clinical Diagnostics & Nadi Pariksha", 80.0, "CRITICAL", True),
                ("Clinical Trial Protocol Design & GCP Guidelines", 70.0, "CRITICAL", True),
                ("Panchakarma Procedure & Safety Monitoring", 75.0, "HIGH", True),
                ("Professional Communication & Ethics", 70.0, "HIGH", True),
            ],
            "careers": [
                ("ayurveda-clinical-practice", 1.0),
                ("ayurvedic-clinical-research", 0.9),
            ]
        },
        {
            "title": "Herbal Raw Material Procurement & Authentication Intern",
            "description": "Gain hands-on experience in crude drug supply chain verification, macroscopic herb identification, and moisture/ash content testing.",
            "responsibilities": "Inspect mandis, authenticate bulk herb shipments, conduct heavy metal spot tests.",
            "requirements": "BAMS 4th year student or B.Pharm (Ayush) intern.",
            "opportunity_type": OpportunityType.INTERNSHIP,
            "organization_name": "Zandu Healthcare (Demo)",
            "organization_description": "Trusted brand in wellness and Ayurvedic formulations.",
            "location_text": "Mumbai, Maharashtra",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.INTERNSHIP,
            "experience_level": ExperienceLevel.STUDENT,
            "application_url": "https://zandu-demo.ayursetu.org/internships/raw-herb-qc",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 15000.0,
            "salary_max": 18000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Dravyaguna & Herbal Identification", 70.0, "CRITICAL", True),
                ("Good Manufacturing Practice (GMP)", 65.0, "HIGH", True),
                ("Problem Solving & Critical Thinking", 60.0, "MEDIUM", True),
            ],
            "careers": [
                ("quality-control-ayurveda", 0.9),
                ("ayurvedic-product-development", 0.8),
            ]
        },
        {
            "title": "Public Health Ayush Research Fellow — National Nutrition Mission",
            "description": "Evaluate the efficacy of Ayush-based dietary interventions (Ahara Kalpana) in reducing anemia among adolescent girls across rural health centers.",
            "responsibilities": "Field survey design, anthropometric measurements, biostatistical analysis of community health metrics.",
            "requirements": "BAMS / MPH (Master of Public Health) with research orientation.",
            "opportunity_type": OpportunityType.RESEARCH,
            "organization_name": "National Health Mission (Ayush Cell Demo)",
            "organization_description": "Government body integrating traditional medicine into public health systems.",
            "location_text": "Bhopal, Madhya Pradesh",
            "city": "Bhopal",
            "state": "Madhya Pradesh",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FELLOWSHIP,
            "experience_level": ExperienceLevel.ENTRY,
            "application_url": "https://nhm-demo.ayursetu.org/fellowships/public-health",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 38000.0,
            "salary_max": 45000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Research Methodology & Study Design", 75.0, "CRITICAL", True),
                ("Data Analysis & Statistical Validation", 70.0, "CRITICAL", True),
                ("Ayurvedic Pathya-Apathya & Dietetics", 75.0, "HIGH", True),
                ("Professional Communication & Ethics", 70.0, "HIGH", True),
            ],
            "careers": [
                ("ayurvedic-clinical-research", 0.9),
                ("ayurveda-clinical-practice", 0.8),
            ]
        },
        {
            "title": "Rasashastra & Bhasma Preparation Research Project Intern",
            "description": "Participate in modern elemental characterization (XRD, SEM-EDX) of traditional Swarna and Tamra Bhasma preparations.",
            "responsibilities": "Monitor Puta heating cycles, perform elemental analysis sample prep, maintain laboratory notebooks.",
            "requirements": "BAMS final year student / M.D. (Rasashastra) Scholar.",
            "opportunity_type": OpportunityType.PROJECT,
            "organization_name": "National Institute of Ayurveda (NIA Demo)",
            "organization_description": "Deemed University dedicated to teaching and advanced Ayurvedic research.",
            "location_text": "Jaipur, Rajasthan",
            "city": "Jaipur",
            "state": "Rajasthan",
            "country": "India",
            "work_mode": WorkMode.HYBRID,
            "employment_type": EmploymentType.PROJECT_BASED,
            "experience_level": ExperienceLevel.STUDENT,
            "application_url": "https://nia-demo.ayursetu.org/projects/rasashastra-bhasma",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 20000.0,
            "salary_max": 25000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Rasashastra & Bhasma Preparation", 75.0, "CRITICAL", True),
                ("Ayurvedic Formulation Science", 70.0, "HIGH", True),
                ("Research Methodology & Study Design", 60.0, "HIGH", True),
            ],
            "careers": [
                ("ayurvedic-pharmaceutical-rd", 1.0),
                ("ayurvedic-product-development", 0.9),
            ]
        },
        {
            "title": "Phytochemistry & High-Performance Chromatography Apprentice",
            "description": "Intensive hands-on apprenticeship training on HPLC method development, sample cleanup, and UV-Vis spectroscopy for standardization of polyherbal churnas.",
            "responsibilities": "Prepare mobile phases, run HPLC sequences, generate quantitative assay reports.",
            "requirements": "B.Pharm (Ayush) / B.Sc Chemistry with analytical chemistry coursework.",
            "opportunity_type": OpportunityType.APPRENTICESHIP,
            "organization_name": "Charak Pharma Analytical Labs (Demo)",
            "organization_description": "Leading manufacturer of standardized Ayurvedic medicines.",
            "location_text": "Pune, Maharashtra",
            "city": "Pune",
            "state": "Maharashtra",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.CONTRACT,
            "experience_level": ExperienceLevel.BEGINNER,
            "application_url": "https://charak-demo.ayursetu.org/apprenticeships/hplc-prep",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 16000.0,
            "salary_max": 20000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Phytochemistry & High-Performance Liquid Chromatography (HPLC)", 70.0, "CRITICAL", True),
                ("Good Manufacturing Practice (GMP)", 65.0, "HIGH", True),
                ("Problem Solving & Critical Thinking", 60.0, "MEDIUM", True),
            ],
            "careers": [
                ("quality-control-ayurveda", 1.0),
                ("ayurvedic-pharmaceutical-rd", 0.8),
            ]
        },
        {
            "title": "Ayurvedic Medical Content & Scientific Writing Fellow",
            "description": "Draft evidence-based Ayurvedic clinical summaries, patient education monographs, and scientific review papers for peer-reviewed journals.",
            "responsibilities": "Conduct PubMed/DHARA literature searches, write clinical case reports, edit medical manuscripts.",
            "requirements": "BAMS degree with excellent written English skills and PubMed literature search proficiency.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "AyurSetu Scientific Publications (Demo)",
            "organization_description": "Knowledge hub promoting open-access Ayush research dissemination.",
            "location_text": "Remote",
            "city": "Remote",
            "state": "Delhi",
            "country": "India",
            "work_mode": WorkMode.REMOTE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://publications-demo.ayursetu.org/careers/medical-writer",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 30000.0,
            "salary_max": 38000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Professional Communication & Ethics", 80.0, "CRITICAL", True),
                ("Research Methodology & Study Design", 70.0, "HIGH", True),
                ("Data Analysis & Statistical Validation", 60.0, "MEDIUM", True),
            ],
            "careers": [
                ("ayurvedic-clinical-research", 0.8),
                ("ayurveda-clinical-practice", 0.7),
            ]
        },
        {
            "title": "Ayurvedic Wellness Product Innovation Specialist",
            "description": "Formulate functional herbal teas, nutraceutical gummies, and skin-care churnas combining classical Dravyaguna principles with modern consumer aesthetics.",
            "responsibilities": "Organoleptic testing, shelf-life estimation, batch scale-up protocols.",
            "requirements": "BAMS / B.Pharm (Ayush) with creative interest in herbal FMCG products.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "Kottakkal Arya Vaidya Sala Innovation Center (Demo)",
            "organization_description": "Century-old pioneer in authentic Ayurvedic preparations.",
            "location_text": "Kottakkal, Kerala",
            "city": "Kottakkal",
            "state": "Kerala",
            "country": "India",
            "work_mode": WorkMode.ONSITE,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.ENTRY,
            "application_url": "https://kottakkal-demo.ayursetu.org/careers/product-innovation",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 35000.0,
            "salary_max": 42000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayurvedic Formulation Science", 80.0, "CRITICAL", True),
                ("Dravyaguna & Herbal Identification", 75.0, "CRITICAL", True),
                ("Good Manufacturing Practice (GMP)", 70.0, "HIGH", True),
                ("Problem Solving & Critical Thinking", 70.0, "HIGH", True),
            ],
            "careers": [
                ("ayurvedic-product-development", 1.0),
                ("ayurvedic-pharmaceutical-rd", 0.8),
            ]
        },
        {
            "title": "Ayurvedic Telemedicine & Clinical Diagnostics Officer",
            "description": "Conduct virtual Prakriti assessments, remote Samprapti diagnosis, and personalized Chikitsa planning for global patients via AyurSetu Tele-Health platform.",
            "responsibilities": "Virtual patient consultation, electronic prescription entry, follow-up monitoring.",
            "requirements": "BAMS with state medical council registration.",
            "opportunity_type": OpportunityType.JOB,
            "organization_name": "Jiva Ayurveda Tele-Clinic (Demo)",
            "organization_description": "Pioneering organization in personalized Ayurvedic telemedicine.",
            "location_text": "Faridabad, Haryana",
            "city": "Faridabad",
            "state": "Haryana",
            "country": "India",
            "work_mode": WorkMode.HYBRID,
            "employment_type": EmploymentType.FULL_TIME,
            "experience_level": ExperienceLevel.FRESHER,
            "application_url": "https://jiva-demo.ayursetu.org/careers/tele-doctor",
            "source_name": "AyurSetu Demo Network",
            "source_type": OpportunitySourceType.DEMO,
            "application_deadline": future_deadline,
            "salary_min": 32000.0,
            "salary_max": 40000.0,
            "salary_currency": "INR",
            "status": OpportunityStatus.ACTIVE,
            "skills": [
                ("Ayurvedic Clinical Diagnostics & Nadi Pariksha", 80.0, "CRITICAL", True),
                ("Ayurvedic Electronic Medical Records (EMR) & Digital Health", 70.0, "HIGH", True),
                ("Professional Communication & Ethics", 75.0, "HIGH", True),
            ],
            "careers": [
                ("ayurveda-clinical-practice", 1.0),
                ("ayurveda-healthcare-technology", 0.8),
            ]
        }
    ]


    for opp_item in OPPORTUNITY_CATALOG:
        opp_check = await db.execute(select(IndustryOpportunity).where(IndustryOpportunity.title == opp_item["title"]))
        existing_opp = opp_check.scalars().first()
        if existing_opp:
            dl = existing_opp.application_deadline
            if dl:
                if dl.tzinfo is None:
                    dl = dl.replace(tzinfo=timezone.utc)
                if dl < datetime.now(timezone.utc):
                    existing_opp.application_deadline = future_deadline
        else:
            opp = IndustryOpportunity(
                title=opp_item["title"],
                description=opp_item["description"],
                responsibilities=opp_item.get("responsibilities"),
                requirements=opp_item.get("requirements"),
                opportunity_type=opp_item["opportunity_type"],
                organization_name=opp_item["organization_name"],
                organization_description=opp_item.get("organization_description"),
                location_text=opp_item.get("location_text"),
                city=opp_item.get("city"),
                state=opp_item.get("state"),
                country=opp_item.get("country", "India"),
                work_mode=opp_item["work_mode"],
                employment_type=opp_item["employment_type"],
                experience_level=opp_item["experience_level"],
                application_url=opp_item.get("application_url"),
                source_name=opp_item["source_name"],
                source_type=opp_item["source_type"],
                application_deadline=opp_item.get("application_deadline"),
                salary_min=opp_item.get("salary_min"),
                salary_max=opp_item.get("salary_max"),
                salary_currency=opp_item.get("salary_currency", "INR"),
                is_salary_disclosed=True,
                status=opp_item["status"]
            )
            db.add(opp)
            await db.flush()

            # Map skills
            for sk_name, req_score, imp, is_req in opp_item["skills"]:
                sk_res = await db.execute(select(Skill).where(Skill.name == sk_name))
                sk_obj = sk_res.scalars().first()
                if sk_obj:
                    opp_sk = OpportunityRequiredSkill(
                        opportunity_id=opp.id,
                        skill_id=sk_obj.id,
                        required_score=req_score,
                        importance=imp,
                        is_required=is_req
                    )
                    db.add(opp_sk)

            # Map careers
            for role_slug, weight in opp_item["careers"]:
                role_res = await db.execute(select(CareerRole).where(CareerRole.slug == role_slug))
                role_obj = role_res.scalars().first()
                if role_obj:
                    opp_car = OpportunityCareerRole(
                        opportunity_id=opp.id,
                        career_role_id=role_obj.id,
                        relevance_weight=weight
                    )
                    db.add(opp_car)

    # ============================================================
    # SEED EXPERT GUIDANCE PROFILES AND SESSIONS
    # ============================================================
    from app.models.expert_guidance import (
        ExpertProfile,
        ExpertSession,
        SessionType,
        SessionLevel,
        SessionStatus,
        SessionVisibility,
        SessionRating
    )

    exp_check = await db.execute(select(func.count(ExpertProfile.id)))
    doctor_user_res = await db.execute(select(User).where(User.role == UserRole.DOCTOR))
    doctor_users = doctor_user_res.scalars().all()
    if exp_check.scalar_one() == 0 and doctor_users:
        primary_doc = doctor_users[0]

        # Expert Profile 1: Dr. Rajeshwari Sharma
        exp1 = ExpertProfile(
            user_id=primary_doc.id,
            full_name="Vaidya Dr. Rajeshwari Sharma",
            role=UserRole.DOCTOR,
            professional_title="Professor & Senior Panchakarma Specialist",
            institution_or_clinic="All India Institute of Ayurveda (AIIA), New Delhi",
            qualifications="BAMS, MD (Ayurveda - Panchakarma), PhD",
            specialization="Panchakarma",
            areas_of_expertise=["Panchakarma", "Vamana Therapy", "Virechana Protocol", "Basti Therapy", "Clinical Ayurveda"],
            subjects=["Panchakarma Chikitsa", "Kaya Chikitsa", "Snehana & Swedana"],
            skills=["Panchakarma Procedure Protocols", "Ayurvedic Clinical Diagnostics", "Clinical Trial Protocol Design"],
            languages=["English", "Hindi", "Sanskrit"],
            years_of_experience=15,
            bio="Senior clinician and academician with 15+ years of specialized experience in clinical Panchakarma protocols, bio-cleansing therapies, and integrative chronic disease care.",
            profile_photo_url="/assets/doctor-rajeshwari.jpg",
            is_verified=True,
            verification_badge_title="NCISM Verified Expert Clinician",
            average_rating=4.9,
            total_ratings=142,
            completed_sessions_count=38,
            total_sessions_count=42,
            followers_count=850,
            bayesian_score=4.87
        )
        db.add(exp1)
        await db.flush()

        # Seed Sample Sessions
        today = date.today()

        # Session 1: LIVE NOW
        sess1 = ExpertSession(
            expert_user_id=primary_doc.id,
            expert_profile_id=exp1.id,
            expert_name=exp1.full_name,
            expert_role="DOCTOR",
            institution=exp1.institution_or_clinic,
            title="Mastering Panchakarma Virechana: Dosage, Snehapana & Live Case Discussion",
            description="An in-depth clinical masterclass covering classical Virechana purgation therapy, calculating internal snehapana dosages based on Agni and Koshtha, monitoring Vegas, and managing post-cleansing Samsarjana Krama.",
            session_type=SessionType.LIVE_LECTURE,
            category="Panchakarma",
            topics=["Snehapana Protocols", "Virechana Vegas", "Samsarjana Krama", "Complications Management"],
            level=SessionLevel.ADVANCED,
            scheduled_date=today,
            start_time="Live Now",
            end_time="11:30 AM",
            duration_minutes=90,
            max_students=300,
            language="English / Hindi",
            session_thumbnail="/assets/session-thumb-panchakarma.jpg",
            learning_objectives=[
                "Master clinical assessment of Koshtha and Agni before Snehapana",
                "Recognize Samyak Snigdha Lakshana accurately",
                "Execute safe classical Virechana Dravya administration"
            ],
            prerequisites=["Basic knowledge of Panchakarma Sharira and Dosha Gati"],
            tags=["Panchakarma", "Virechana", "Clinical Case", "Detox"],
            visibility=SessionVisibility.PUBLIC,
            status=SessionStatus.LIVE,
            live_stream_url="https://meet.google.com/ayu-virechana-live",
            current_live_attendees=54,
            started_at=datetime.now(timezone.utc),
            recording_available=True,
            average_rating=4.9,
            total_ratings=88,
            participants_count=192
        )
        db.add(sess1)

        # Session 2: UPCOMING
        sess2 = ExpertSession(
            expert_user_id=primary_doc.id,
            expert_profile_id=exp1.id,
            expert_name=exp1.full_name,
            expert_role="DOCTOR",
            institution=exp1.institution_or_clinic,
            title="Nadi Pariksha Masterclass: Deciphering Pulse Waveforms & Organ Pathology",
            description="Interactive hands-on guidance on radial pulse examination (Nadi Pariksha) for determining Doshic imbalances, Ama presence, Sub-doshas, and early metabolic shifts.",
            session_type=SessionType.LIVE_GUIDANCE,
            category="Clinical Practice",
            topics=["Nadi Gati", "Sarpagati vs Mandukagati", "Sub-dosha Pulse Analysis"],
            level=SessionLevel.INTERMEDIATE,
            scheduled_date=today + timedelta(days=2),
            start_time="10:00 AM",
            end_time="11:15 AM",
            duration_minutes=75,
            max_students=250,
            language="English / Sanskrit terms",
            session_thumbnail="/assets/session-thumb-nadi.jpg",
            learning_objectives=[
                "Identify primary and secondary pulse velocities",
                "Correlate Nadi waveforms with Manasika and Sharirika Doshas"
            ],
            prerequisites=["Familiarity with Roganidana fundamentals"],
            tags=["Diagnostics", "Nadi Pariksha", "Pulse", "Clinical Skills"],
            visibility=SessionVisibility.PUBLIC,
            status=SessionStatus.SCHEDULED,
            live_stream_url="https://meet.google.com/ayu-nadi-live",
            current_live_attendees=0,
            recording_available=True,
            average_rating=4.8,
            total_ratings=45,
            participants_count=82
        )
        db.add(sess2)

        # Session 3: COMPLETED WITH RECORDING
        sess3 = ExpertSession(
            expert_user_id=primary_doc.id,
            expert_profile_id=exp1.id,
            expert_name=exp1.full_name,
            expert_role="DOCTOR",
            institution=exp1.institution_or_clinic,
            title="Clinical Management of Osteoarthritis & Sandhivata using Classical Janu Basti",
            description="Comprehensive recorded clinical demonstration of Janu Basti setup, oil temperature maintenance, taila selection (Ksheerabala vs Mahanarayana), and integration with oral Rasayana.",
            session_type=SessionType.RECORDED_LECTURE,
            category="Panchakarma",
            topics=["Janu Basti", "Sandhivata", "Taila Selection", "Pain Management"],
            level=SessionLevel.INTERMEDIATE,
            scheduled_date=today - timedelta(days=5),
            start_time="On Demand",
            duration_minutes=60,
            max_students=500,
            language="English",
            session_thumbnail="/assets/session-thumb-janubasti.jpg",
            learning_objectives=[
                "Construct dough ring for leak-proof Basti application",
                "Formulate personalized rehabilitation plans for knee osteoarthritis"
            ],
            prerequisites=["BAMS 2nd year or clinical rotation"],
            tags=["Janu Basti", "Orthopedics", "Sandhivata", "Therapeutics"],
            visibility=SessionVisibility.PUBLIC,
            status=SessionStatus.COMPLETED,
            recording_available=True,
            recording_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            recording_duration=3600,
            recording_views_count=340,
            recording_uploaded_at=datetime.now(timezone.utc) - timedelta(days=5),
            average_rating=4.9,
            total_ratings=112,
            participants_count=340
        )
        db.add(sess3)

        # Session 4: RECORDED - Dravyaguna Standardization
        sess4 = ExpertSession(
            expert_user_id=primary_doc.id,
            expert_profile_id=exp1.id,
            expert_name="Dr. Arvind Swaminathan",
            expert_role="DOCTOR",
            institution="Faculty of Ayurveda, Banaras Hindu University",
            title="Dravyaguna Marker Profiling: Ashwagandha & Shatavari HPLC Characterization",
            description="Laboratory and academic lecture on chromatographic standardization of Withanolides in Withania somnifera and Saponins in Asparagus racemosus according to API standards.",
            session_type=SessionType.RECORDED_LECTURE,
            category="Dravyaguna",
            topics=["HPLC Profiling", "Withanolide Quantification", "Adulteration Testing", "Schedule T"],
            level=SessionLevel.ADVANCED,
            scheduled_date=today - timedelta(days=10),
            start_time="On Demand",
            duration_minutes=50,
            max_students=400,
            language="English",
            session_thumbnail="/assets/session-thumb-dravyaguna.jpg",
            learning_objectives=[
                "Interpret HPLC chromatograms for botanical authentication",
                "Detect common market adulterants in raw roots"
            ],
            prerequisites=["Basic Pharmacognosy and Phytochemistry knowledge"],
            tags=["Dravyaguna", "Phytochemistry", "HPLC", "Quality Control"],
            visibility=SessionVisibility.PUBLIC,
            status=SessionStatus.COMPLETED,
            recording_available=True,
            recording_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            recording_duration=3000,
            recording_views_count=215,
            recording_uploaded_at=datetime.now(timezone.utc) - timedelta(days=10),
            average_rating=4.8,
            total_ratings=68,
            participants_count=215
        )
        db.add(sess4)

    await db.commit()

    # ============================================================
    # SEED TOPIC QUIZ HIERARCHY & AUTHENTIC QUESTION BANK
    # ============================================================
    from app.models.topic_quiz import (
        TopicQuizSubject,
        TopicQuizTopic,
        TopicQuizSubtopic,
        TopicQuizQuestion,
        QuizDifficulty,
        QuizQuestionType
    )

    subj_count = await db.execute(select(func.count(TopicQuizSubject.id)))
    if (subj_count.scalar() or 0) == 0:
        subjects_data = [
            {
                "name": "Dravyaguna (Herbal Pharmacology)",
                "code": "DRAVYAGUNA",
                "icon": "Leaf",
                "description": "Botanical authentication, phytochemistry, active markers, and classical pharmacological principles (Rasa, Guna, Virya, Vipaka, Prabhava).",
                "display_order": 1,
                "topics": [
                    {
                        "name": "Medicinal Plants",
                        "description": "Identification, therapeutic actions, chemical constituents, and dosage of classical Ayurvedic herbs.",
                        "display_order": 1,
                        "subtopics": ["Ashwagandha", "Guduchi", "Shatavari", "Brahmi", "Haritaki", "Amalaki", "Arjuna", "Guggulu"],
                        "questions": [
                            {
                                "subtopic": "Ashwagandha",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the botanical source of classical Ayurvedic herb 'Ashwagandha'?",
                                "options": [
                                    {"id": "A", "text": "Withania somnifera", "is_correct": True},
                                    {"id": "B", "text": "Asparagus racemosus", "is_correct": False},
                                    {"id": "C", "text": "Tinospora cordifolia", "is_correct": False},
                                    {"id": "D", "text": "Bacopa monnieri", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Withania somnifera (family Solanaceae) is the botanical identity of Ashwagandha, renowned for its withanolides active marker and Balya/Rasayana pharmacological profile.",
                                "pearl": "Ashwagandha possesses Katu-Tikta-Kashaya Rasa, Ushna Virya, and Madhura Vipaka, specifically pacifying Kapha and Vata."
                            },
                            {
                                "subtopic": "Ashwagandha",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which primary withanolide glycoside in Withania somnifera root is quantified during HPLC standardization for adaptogenic potency?",
                                "options": [
                                    {"id": "A", "text": "Bacoside A", "is_correct": False},
                                    {"id": "B", "text": "Withaferin A & Withanolide A", "is_correct": True},
                                    {"id": "C", "text": "Curcuminoids", "is_correct": False},
                                    {"id": "D", "text": "Sennoside B", "is_correct": False}
                                ],
                                "correct": "B",
                                "explanation": "Withaferin A and Withanolide A are the key steroidal lactones quantified by reverse-phase HPLC as analytical chemical markers specified in the Ayurvedic Pharmacopoeia of India (API).",
                                "pearl": "Therapeutic root powder dosage is 3 to 6 grams daily with warm milk/ghee as Anupana."
                            },
                            {
                                "subtopic": "Guduchi",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the primary pharmacological Karma of Guduchi (Tinospora cordifolia) in chronic fever?",
                                "options": [
                                    {"id": "A", "text": "Jwaraghna & Rasayana", "is_correct": True},
                                    {"id": "B", "text": "Virechana & Rechana", "is_correct": False},
                                    {"id": "C", "text": "Lekhana & Stambhana", "is_correct": False},
                                    {"id": "D", "text": "Vamana & Utkleshana", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Guduchi is celebrated as supreme Jwaraghna (febrifuge), Vayahsthapana, and Rasayana, pacifying all three Doshas (Tridoshashamaka) with Tikta-Kashaya Rasa and Ushna Virya.",
                                "pearl": "Guduchi Satva (aqueous starch extract) is specifically Sheeta Virya and exceptionally soothing in Pitta Jwara."
                            },
                            {
                                "subtopic": "Shatavari",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which Rasa, Virya, and Vipaka combination belongs to Shatavari (Asparagus racemosus)?",
                                "options": [
                                    {"id": "A", "text": "Tikta-Madhura Rasa, Sheeta Virya, Madhura Vipaka", "is_correct": True},
                                    {"id": "B", "text": "Katu Rasa, Ushna Virya, Katu Vipaka", "is_correct": False},
                                    {"id": "C", "text": "Amla Rasa, Ushna Virya, Amla Vipaka", "is_correct": False},
                                    {"id": "D", "text": "Kashaya Rasa, Ushna Virya, Katu Vipaka", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Shatavari is Tikta-Madhura Rasa, Sheeta Virya, and Madhura Vipaka. It acts as supreme Stanyajanana (galactagogue), Shukrala, and Vata-Pitta Shamaka.",
                                "pearl": "Shatavarins (steroidal saponins) are the active bioactive constituents in the root tuber."
                            },
                            {
                                "subtopic": "Arjuna",
                                "difficulty": QuizDifficulty.HARD,
                                "type": QuizQuestionType.MCQ,
                                "text": "In cardiovascular pathology (Hridroga), what specific Karma and constituent explain Terminalia arjuna's myocardial protective action?",
                                "options": [
                                    {"id": "A", "text": "Hridya Karma due to arjunic acid & flavonoids", "is_correct": True},
                                    {"id": "B", "text": "Virechana Karma due to anthraquinones", "is_correct": False},
                                    {"id": "C", "text": "Deepana Karma due to piperine", "is_correct": False},
                                    {"id": "D", "text": "Nidrajana due to reserpine", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Terminalia arjuna bark contains arjunic acid, arjunetin, and oligomeric proanthocyanidins (OPCs), conferring classical Hridya (cardiotonic), Kashaya Rasa, and Sheeta Virya actions.",
                                "pearl": "Arjuna Ksheerapaka (decoction prepared with milk) is the preferred classical clinical delivery form."
                            }
                        ]
                    },
                    {
                        "name": "Rasa (Taste Principles)",
                        "description": "The six classical tastes (Shad Rasa), their elemental composition (Mahabhutas), and physiological impact on Doshas.",
                        "display_order": 2,
                        "subtopics": ["Madhura", "Amla", "Lavana", "Katu", "Tikta", "Kashaya"],
                        "questions": [
                            {
                                "subtopic": "Tikta",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which Mahabhutas (primordial elements) constitute Tikta (Bitter) Rasa?",
                                "options": [
                                    {"id": "A", "text": "Vayu (Air) + Akasha (Ether)", "is_correct": True},
                                    {"id": "B", "text": "Prithvi (Earth) + Jala (Water)", "is_correct": False},
                                    {"id": "C", "text": "Agni (Fire) + Jala (Water)", "is_correct": False},
                                    {"id": "D", "text": "Prithvi (Earth) + Agni (Fire)", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Tikta Rasa is composed of Vayu and Akasha Mahabhuta. It pacifies Pitta and Kapha, dries moisture (Kleda-meda shoshana), and stimulates taste perception.",
                                "pearl": "Tikta Rasa is Rooksha, Sheeta, and Laghu in Guna."
                            },
                            {
                                "subtopic": "Katu",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which Mahabhutas predominate in Katu (Pungent) Rasa, causing Deepana and Pachana?",
                                "options": [
                                    {"id": "A", "text": "Vayu (Air) + Agni (Fire)", "is_correct": True},
                                    {"id": "B", "text": "Jala (Water) + Agni (Fire)", "is_correct": False},
                                    {"id": "C", "text": "Prithvi (Earth) + Vayu (Air)", "is_correct": False},
                                    {"id": "D", "text": "Akasha (Ether) + Prithvi (Earth)", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Katu Rasa is formed by Vayu and Agni Mahabhuta. It ignites Jatharagni, cleanses the oral cavity, destroys worms, and liquifies Kapha.",
                                "pearl": "Excessive intake of Katu Rasa aggravates Pitta and Vata, leading to burning sensation and emaciation."
                            }
                        ]
                    },
                    {
                        "name": "Virya & Vipaka",
                        "description": "Potency (Sheeta/Ushna Virya) and post-digestive transformation (Madhura/Amla/Katu Vipaka).",
                        "display_order": 3,
                        "subtopics": ["Ushna Virya", "Sheeta Virya", "Madhura Vipaka", "Katu Vipaka"],
                        "questions": [
                            {
                                "subtopic": "Ushna Virya",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the post-digestive transformation (Vipaka) of Haritaki despite its predominant Kashaya Rasa?",
                                "options": [
                                    {"id": "A", "text": "Madhura Vipaka", "is_correct": True},
                                    {"id": "B", "text": "Katu Vipaka", "is_correct": False},
                                    {"id": "C", "text": "Amla Vipaka", "is_correct": False},
                                    {"id": "D", "text": "Lavana Vipaka", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Haritaki is Pancharasa (devoid of Lavana) with dominant Kashaya Rasa, but undergoes Madhura Vipaka, making it non-depleting and supreme Rasayana.",
                                "pearl": "Haritaki is known as 'Pathya' because it cleanses the srotas without aggravating Vata."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Panchakarma (Bio-Purification)",
                "code": "PANCHAKARMA",
                "icon": "Sparkles",
                "description": "Purvakarma, Pradhanakarma (Vamana, Virechana, Basti, Nasya, Raktamokshana), Paschatkarma, and emergency clinical protocol management.",
                "display_order": 2,
                "topics": [
                    {
                        "name": "Vamana (Therapeutic Emesis)",
                        "description": "Protocols for Kapha-predominant disorders, Snehapana titration, Madana Phala yoga, and Vega monitoring.",
                        "display_order": 1,
                        "subtopics": ["Madana Phala Formulations", "Indications & Contraindications", "Samyak Lakshana", "Vega Assessment"],
                        "questions": [
                            {
                                "subtopic": "Madana Phala Formulations",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which drug is heralded in classical texts as the best Vamaka Dravya (foremost emetic)?",
                                "options": [
                                    {"id": "A", "text": "Madana Phala (Catunaregam spinosa)", "is_correct": True},
                                    {"id": "B", "text": "Jimutaka", "is_correct": False},
                                    {"id": "C", "text": "Ikshvaku", "is_correct": False},
                                    {"id": "D", "text": "Dhamargava", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Acharya Charaka designates Madana Phala (Phalini dravya) as supreme among emetic drugs due to its safety, predictability, and lack of adverse cardiac effects.",
                                "pearl": "Madana Phala Pippali (seeds) mixed with Yashtimadhu Phanta and Saindhava Lavana is the standard emetic cocktail."
                            },
                            {
                                "subtopic": "Samyak Lakshana",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the classical expulsion sequence (Antiki) observed during Samyak (optimal) Vamana?",
                                "options": [
                                    {"id": "A", "text": "Kapha-anta → Pitta-anta", "is_correct": True},
                                    {"id": "B", "text": "Pitta-anta → Vata-anta", "is_correct": False},
                                    {"id": "C", "text": "Rakta-anta → Kapha-anta", "is_correct": False},
                                    {"id": "D", "text": "Meda-anta → Pitta-anta", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "In proper (Samyak) Vamana, the vomitus initially contains food contents, followed by copious Kapha, and terminates when yellowish Pitta appears (Pittanta Vamana).",
                                "pearl": "Appearance of Pitta marks successful cessation of emetic therapy; Dhumapana and Samsarjana Krama follow immediately."
                            },
                            {
                                "subtopic": "Vega Assessment",
                                "difficulty": QuizDifficulty.HARD,
                                "type": QuizQuestionType.MCQ,
                                "text": "According to Charaka Samhita, what constitutes 'Pravara Vega' (maximum emetic bouts) during Vamana?",
                                "options": [
                                    {"id": "A", "text": "8 Vegas with approximately 2 Prastha (64 tolas) volume", "is_correct": True},
                                    {"id": "B", "text": "4 Vegas with 1 Prastha volume", "is_correct": False},
                                    {"id": "C", "text": "12 Vegas with 4 Prastha volume", "is_correct": False},
                                    {"id": "D", "text": "6 Vegas with 1.5 Prastha volume", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Charaka classifies Vamana Vega as: Pravara (8 Vegas, 2 Prastha), Madhyama (6 Vegas, 1.5 Prastha), and Avara (4 Vegas, 1 Prastha).",
                                "pearl": "Vega refers to forceful rhythmic emetic expulsions, distinct from minor Upavegas (dry retching)."
                            }
                        ]
                    },
                    {
                        "name": "Basti (Medicated Enemas)",
                        "description": "Vata pacification mastery: Niruha, Anuvasana, Matra Basti, Netra dimensions, and formulation mixing sequence.",
                        "display_order": 2,
                        "subtopics": ["Niruha Basti", "Anuvasana Basti", "Matra Basti", "Uttara Basti"],
                        "questions": [
                            {
                                "subtopic": "Niruha Basti",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the classical mixing order of ingredients during Niruha Basti formulation (Praksepana krama)?",
                                "options": [
                                    {"id": "A", "text": "Makshika (Honey) → Lavana (Rock Salt) → Sneha (Oil/Ghee) → Kalka (Paste) → Kwatha (Decoction)", "is_correct": True},
                                    {"id": "B", "text": "Kwatha → Sneha → Kalka → Makshika → Lavana", "is_correct": False},
                                    {"id": "C", "text": "Lavana → Kwatha → Sneha → Makshika → Kalka", "is_correct": False},
                                    {"id": "D", "text": "Kalka → Kwatha → Makshika → Lavana → Sneha", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "The strict mixing sequence (Makshika-Lavana-Sneha-Kalka-Kwatha) creates a stable micro-emulsion enabling systemic absorption and physiological cleansing without mucosal irritation.",
                                "pearl": "Thorough churning with a pestle until homogeneous is essential for uniform emulsion."
                            },
                            {
                                "subtopic": "Matra Basti",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the standard volume of Taila administered in Matra Basti for an adult?",
                                "options": [
                                    {"id": "A", "text": "1.5 Pala (approx 72 ml)", "is_correct": True},
                                    {"id": "B", "text": "6 Pala (approx 288 ml)", "is_correct": False},
                                    {"id": "C", "text": "12 Pala (approx 576 ml)", "is_correct": False},
                                    {"id": "D", "text": "0.25 Pala (approx 12 ml)", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Matra Basti is half the dose of Hrasva Sneha Basti (1.5 Pala ≈ 72 ml). It requires no strict dietary restrictions and can be safely given in all seasons.",
                                "pearl": "Matra Basti is ideal for children, elderly, debilitated patients, and working professionals."
                            }
                        ]
                    },
                    {
                        "name": "Nasya (Nasal Medication)",
                        "description": "Administration of medicated oils and churnas via nasal passage for Urdhwajatrugata Roga.",
                        "display_order": 3,
                        "subtopics": ["Pratimarsha Nasya", "Marsha Nasya", "Shirovirechana", "Anu Taila"],
                        "questions": [
                            {
                                "subtopic": "Pratimarsha Nasya",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the standard dosage of Pratimarsha Nasya per nostril?",
                                "options": [
                                    {"id": "A", "text": "2 Bindu (drops)", "is_correct": True},
                                    {"id": "B", "text": "8 Bindu", "is_correct": False},
                                    {"id": "C", "text": "16 Bindu", "is_correct": False},
                                    {"id": "D", "text": "32 Bindu", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Pratimarsha Nasya (2 drops in each nostril) can be performed daily morning and evening as part of Dinacharya without fear of complications.",
                                "pearl": "Anu Taila is the classical medicated oil indicated for daily Pratimarsha Nasya."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Rasashastra & Bhaishajya Kalpana",
                "code": "RASASHASTRA",
                "icon": "FlaskConical",
                "description": "Standardized processing of minerals, metals, Bhasmas, Kupipakwa Rasayana, and classical pharmaceutical formulations (Kashaya, Taila, Asava).",
                "display_order": 3,
                "topics": [
                    {
                        "name": "Bhasma Standardization",
                        "description": "Marana techniques, Puta heating cycles, and organoleptic Bhasma Pariksha tests.",
                        "display_order": 1,
                        "subtopics": ["Varitara Test", "Rekhapurnata", "Niruttha", "Apunarbhava"],
                        "questions": [
                            {
                                "subtopic": "Varitara Test",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What physical property of properly incinerated Bhasma is validated by the 'Varitara' test?",
                                "options": [
                                    {"id": "A", "text": "Micro-fineness and low specific gravity causing it to float on water", "is_correct": True},
                                    {"id": "B", "text": "Resistance to strong mineral acids", "is_correct": False},
                                    {"id": "C", "text": "Metallic luster under sunlight", "is_correct": False},
                                    {"id": "D", "text": "Instant solubility in boiling alcohol", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Varitara Pariksha involves gently sprinkling Bhasma on stagnant water; properly calcined nanoparticles float on the surface tension due to extreme lightness.",
                                "pearl": "Unama test is a continuation: placing a rice grain on the floating Bhasma without it sinking."
                            },
                            {
                                "subtopic": "Niruttha",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "In Bhasma Pariksha, what is the 'Niruttha' test designed to detect?",
                                "options": [
                                    {"id": "A", "text": "Absence of free, unoxidized metallic alloy formation with silver", "is_correct": True},
                                    {"id": "B", "text": "Presence of sweet taste in Bhasma", "is_correct": False},
                                    {"id": "C", "text": "Particle size below 50 nanometers", "is_correct": False},
                                    {"id": "D", "text": "Moisture content percentage", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Niruttha involves heating the Bhasma with pure silver (Roupya patra); if unoxidized free metal remains, it alloys with the silver, altering its weight.",
                                "pearl": "Apunarbhava tests irreversible state: heating Bhasma with Mitra Panchaka without metal regeneration."
                            }
                        ]
                    },
                    {
                        "name": "Pancha Vidha Kashaya Kalpana",
                        "description": "Five fundamental secondary pharmaceutical dosage forms: Swarasa, Kalka, Kwatha, Hima, and Phanta.",
                        "display_order": 2,
                        "subtopics": ["Swarasa", "Kalka", "Kwatha", "Hima", "Phanta"],
                        "questions": [
                            {
                                "subtopic": "Kwatha",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "What is the standard water ratio and reduction proportion for general Kwatha (decoction) preparation?",
                                "options": [
                                    {"id": "A", "text": "16 parts water reduced to 1/4th on mild fire", "is_correct": True},
                                    {"id": "B", "text": "4 parts water reduced to 1/2", "is_correct": False},
                                    {"id": "C", "text": "8 parts water reduced to 1/8th", "is_correct": False},
                                    {"id": "D", "text": "32 parts water reduced to 1/16th", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "According to Sharangadhara Samhita, coarse drug (Yavakuta churna) is boiled with 16 parts of water (or 8/4 parts based on hardness) and reduced to one-fourth (1/4) without lid.",
                                "pearl": "Kwatha must be consumed fresh within 24 hours of preparation."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Kayachikitsa (Internal Medicine)",
                "code": "KAYACHIKITSA",
                "icon": "Stethoscope",
                "description": "Diagnosis, staging, pathology, and holistic management of systemic disorders (Metabolic, Digestive, Respiratory, Musculoskeletal).",
                "display_order": 4,
                "topics": [
                    {
                        "name": "Digestive & Metabolic Disorders",
                        "description": "Agni Dushti, Grahani, Amlapitta, Prameha (Diabetes), and clinical metabolic corrections.",
                        "display_order": 1,
                        "subtopics": ["Grahani Roga", "Prameha & Madhumeha", "Amlapitta", "Amavata"],
                        "questions": [
                            {
                                "subtopic": "Grahani Roga",
                                "difficulty": QuizDifficulty.EASY,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which classical preparation is universally designated as Pathya (ideal therapeutic food) in Grahani Roga?",
                                "options": [
                                    {"id": "A", "text": "Takra (Medicated Buttermilk)", "is_correct": True},
                                    {"id": "B", "text": "Dadhi (Fresh Curd)", "is_correct": False},
                                    {"id": "C", "text": "Ksheera (Cow's Milk)", "is_correct": False},
                                    {"id": "D", "text": "Ikshu Rasa (Sugarcane Juice)", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Takra is Grahi, Deepana, Laghu, and possesses Madhura Vipaka and Kashaya-Amla Rasa, making it the supreme remedy to restore digestive Agni in Grahani.",
                                "pearl": "Takrarishta and Kutajaghan Vati are cornerstone classical formulations in chronic Grahani."
                            },
                            {
                                "subtopic": "Prameha & Madhumeha",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "Which pair of Dushyas (tissues) is predominantly vitiated along with Kleda in Prameha pathogenesis?",
                                "options": [
                                    {"id": "A", "text": "Meda (Fat) & Mutra (Urine) along with Kleda", "is_correct": True},
                                    {"id": "B", "text": "Asthi & Majja", "is_correct": False},
                                    {"id": "C", "text": "Rakta & Shukra", "is_correct": False},
                                    {"id": "D", "text": "Prana Vayu & Udana Vayu", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "In Prameha Samprapti, Kapha vitiates Medas (adipose tissue), Mansa, and Kleda, overflowing into the urinary tract (Mutravaha Srotas) causing turbidity and polyuria.",
                                "pearl": "Nisha-Amalaki churna (Turmeric + Indian Gooseberry) is the foremost evidence-based formulation for Prameha."
                            }
                        ]
                    },
                    {
                        "name": "Vata Vyadhi & Pain Management",
                        "description": "Pakshaghata, Gridhrasi, Sandhivata, Cervical Spondylosis, and neuro-muscular rehabilitation.",
                        "display_order": 2,
                        "subtopics": ["Gridhrasi (Sciatica)", "Sandhivata", "Pakshaghata"],
                        "questions": [
                            {
                                "subtopic": "Gridhrasi (Sciatica)",
                                "difficulty": QuizDifficulty.MEDIUM,
                                "type": QuizQuestionType.MCQ,
                                "text": "In Gridhrasi (Sciatica), pain radiates classically along which path in the lower limb?",
                                "options": [
                                    {"id": "A", "text": "Sphik (buttock) → Kati (lumbar) → Uru (thigh) → Janu (knee) → Jangha (calf) → Pada (foot)", "is_correct": True},
                                    {"id": "B", "text": "Pada → Janu → Kati", "is_correct": False},
                                    {"id": "C", "text": "Nabhi → Sphik → Janu", "is_correct": False},
                                    {"id": "D", "text": "Vankshana → Pada → Kati", "is_correct": False}
                                ],
                                "correct": "A",
                                "explanation": "Charaka defines Gridhrasi as radiating pain starting from Sphik (gluteal region), descending sequentially through Kati, Uru, Janu, Jangha to Pada with stiffness (Stambha) and shooting pain (Toda).",
                                "pearl": "Siravedha (venesection) at 4 Angula above or below Janu Sandhi or Agnikarma provides immediate decompression."
                            }
                        ]
                    }
                ]
            }
        ]

        for s_data in subjects_data:
            subject = TopicQuizSubject(
                name=s_data["name"],
                code=s_data["code"],
                icon=s_data["icon"],
                description=s_data["description"],
                display_order=s_data["display_order"]
            )
            db.add(subject)
            await db.flush()

            for t_data in s_data["topics"]:
                topic = TopicQuizTopic(
                    subject_id=subject.id,
                    name=t_data["name"],
                    description=t_data["description"],
                    display_order=t_data["display_order"]
                )
                db.add(topic)
                await db.flush()

                # Subtopics map
                subtopic_map = {}
                for idx, st_name in enumerate(t_data.get("subtopics", [])):
                    subtopic = TopicQuizSubtopic(
                        topic_id=topic.id,
                        name=st_name,
                        display_order=idx + 1
                    )
                    db.add(subtopic)
                    await db.flush()
                    subtopic_map[st_name] = subtopic.id

                # Questions
                for q_data in t_data.get("questions", []):
                    st_id = subtopic_map.get(q_data.get("subtopic"))
                    question = TopicQuizQuestion(
                        subject_id=subject.id,
                        topic_id=topic.id,
                        subtopic_id=st_id,
                        subject_name=subject.name,
                        topic_name=topic.name,
                        subtopic_name=q_data.get("subtopic"),
                        difficulty=q_data["difficulty"],
                        question_type=q_data["type"],
                        question_text=q_data["text"],
                        options=q_data["options"],
                        correct_answer=q_data["correct"],
                        explanation=q_data["explanation"],
                        clinical_pearl=q_data.get("pearl"),
                        tags=[subject.name, topic.name, q_data.get("subtopic", "")]
                    )
                    db.add(question)

        await db.commit()





