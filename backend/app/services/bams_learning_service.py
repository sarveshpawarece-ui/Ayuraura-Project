import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.user import User
from app.models.domain import StudentProfile
from app.models.bams_ecosystem import StudentBamsProgress, BamsCaseStudy
from app.models.ai_ecosystem import AINote, AIQuizAttempt

from app.schemas.bams_learning import (
    BamsSubjectSchema,
    BamsTopicSchema,
    BamsShlokaSchema,
    BamsDiagramSchema,
    BamsCurriculumOut,
    StudentProgressOut,
    ClinicalLogbookEntryIn,
    ClinicalLogbookEntryOut,
    StudentGoalSettingsIn,
    StudentGoalSettingsOut,
    SmartRecommendationOut,
    FlashcardCardSchema,
    FlashcardReviewIn,
    ChecklistToggleIn,
    StudentPersonalizedDashboardOut
)

# ============================================================
# AUTHORITATIVE NCISM BAMS CURRICULUM DATA STORE
# ============================================================

RAW_BAMS_SUBJECTS: List[Dict[str, Any]] = [
    # 1st Professional
    {
        "id": "sub-rachana",
        "code": "BAMS-101",
        "name": "Rachana Sharir",
        "sanskritName": "रचना शारीरम् (Human Anatomy)",
        "professionalYear": "1st Prof",
        "iconName": "Brain",
        "totalHours": 240,
        "description": "Macroscopic and microscopic structure of the human body, Marma Sharir (107 vital points), Srotas, and embryology per Ayurvedic and modern anatomical sciences.",
        "unitsCount": 6,
        "topicsCount": 28,
        "linkedSkillName": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
        "targetCareerRelevance": ["Ayurvedic Clinical Specialist", "Surgical Assistant (Shalya)"]
    },
    {
        "id": "sub-kriya",
        "code": "BAMS-102",
        "name": "Kriya Sharir",
        "sanskritName": "क्रिया शारीरम् (Human Physiology)",
        "professionalYear": "1st Prof",
        "iconName": "Activity",
        "totalHours": 240,
        "description": "Functional dynamics of Dosha, Dhatu, Mala, Agni, Prakriti Pariksha, and biological rhythms in health and pathophysiology.",
        "unitsCount": 5,
        "topicsCount": 24,
        "linkedSkillName": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
        "targetCareerRelevance": ["Prakriti & Wellness Consultant", "Ayurvedic Clinical Specialist"]
    },
    {
        "id": "sub-samhita-1",
        "code": "BAMS-103",
        "name": "Samhita Siddhanta & Sanskrit",
        "sanskritName": "संहिता सिद्धान्तः एवं संस्कृतम्",
        "professionalYear": "1st Prof",
        "iconName": "BookOpen",
        "totalHours": 180,
        "description": "Philosophical foundation (Darshana), Ashtanga Hridaya Sutrasthana, Sanskrit grammar for Ayurvedic interpretation, and Padartha Vijnana.",
        "unitsCount": 4,
        "topicsCount": 18,
        "linkedSkillName": "Classical Shloka Recitation & Philology",
        "targetCareerRelevance": ["Ayurvedic Academician", "Sanskrit Research Scholar"]
    },

    # 2nd Professional
    {
        "id": "sub-dravyaguna",
        "code": "BAMS-201",
        "name": "Dravyaguna Vijnana",
        "sanskritName": "द्रव्यगुण विज्ञानम् (Materia Medica & Pharmacology)",
        "professionalYear": "2nd Prof",
        "iconName": "Sprout",
        "totalHours": 250,
        "description": "Pharmacological properties (Rasa, Guna, Virya, Vipaka, Prabhava), classical Nighantus, identification of 200+ medicinal plants, and modern phyto-chemistry.",
        "unitsCount": 7,
        "topicsCount": 35,
        "linkedSkillName": "ASU Drug Quality Control & Pharmacognosy",
        "targetCareerRelevance": ["Pharma Formulation Scientist", "ASU Regulatory Affairs Officer"]
    },
    {
        "id": "sub-rasashastra",
        "code": "BAMS-202",
        "name": "Rasa Shastra & Bhaishajya Kalpana",
        "sanskritName": "रसशास्त्र एवं भैषज्य कल्पना (Pharmaceutics)",
        "professionalYear": "2nd Prof",
        "iconName": "Flame",
        "totalHours": 260,
        "description": "Metallo-mineral pharmaceutics, Shodhana, Marana of Parada and Maharasa, herbal pharmacy manufacturing (Svarasa to Taila/Asava), and GMP guidelines.",
        "unitsCount": 6,
        "topicsCount": 30,
        "linkedSkillName": "Classical Bhasma Preparation & Metallurgy",
        "targetCareerRelevance": ["Ayurvedic Pharmacy Production Head", "Herbal Formulation Scientist"]
    },
    {
        "id": "sub-roganidana",
        "code": "BAMS-203",
        "name": "Roga Nidana & Vikriti Vijnana",
        "sanskritName": "रोगनिदान एवं विकृति विज्ञानम् (Pathology & Diagnostics)",
        "professionalYear": "2nd Prof",
        "iconName": "Stethoscope",
        "totalHours": 220,
        "description": "Etiopathogenesis (Samprapti), Shad-Kriya Kala, Rogi-Roga Pariksha (Nadi, Mutra, Mala, Jihwa), and modern clinical laboratory investigations.",
        "unitsCount": 6,
        "topicsCount": 26,
        "linkedSkillName": "Nadi Pariksha & Pulse Diagnostics",
        "targetCareerRelevance": ["Ayurvedic Diagnostic Specialist", "Integrative Clinic Director"]
    },

    # 3rd Professional
    {
        "id": "sub-charaka-purv",
        "code": "BAMS-301",
        "name": "Charaka Samhita (Purvardha)",
        "sanskritName": "चरकसंहिता (पूर्वार्धम्)",
        "professionalYear": "3rd Prof",
        "iconName": "BookOpen",
        "totalHours": 180,
        "description": "Sutrasthana, Nidanasthana, Vimanasthana, Sharirasthana, and Indriyasthana of Charaka Samhita with comprehensive Chakrapanidatta commentary.",
        "unitsCount": 5,
        "topicsCount": 22,
        "linkedSkillName": "Classical Shloka Recitation & Philology",
        "targetCareerRelevance": ["Ayurvedic Scholar", "Clinical Consultant"]
    },
    {
        "id": "sub-prasuti",
        "code": "BAMS-302",
        "name": "Prasuti Tantra & Stri Roga",
        "sanskritName": "प्रसूतितन्त्र एवं स्त्रीरोग (Gynecology & Obstetrics)",
        "professionalYear": "3rd Prof",
        "iconName": "Heart",
        "totalHours": 200,
        "description": "Antenatal care (Garbhini Paricharya), labor management (Prasava), Yonivyapad disorders, Artava dusti, and integrative obstetrics.",
        "unitsCount": 5,
        "topicsCount": 24,
        "linkedSkillName": "Maternal & Child Wellness (Garbhini Paricharya)",
        "targetCareerRelevance": ["Ayurvedic Women Health Specialist", "Fertility & Garbh Sanskar Consultant"]
    },
    {
        "id": "sub-kaumarbhritya",
        "code": "BAMS-303",
        "name": "Kaumarbhritya (Balaroga)",
        "sanskritName": "कौमारभृत्य (बालरोग - Pediatrics)",
        "professionalYear": "3rd Prof",
        "iconName": "Users",
        "totalHours": 160,
        "description": "Neonatal care (Navajata Shishu Paricharya), infant feeding, developmental milestones, pediatric disorders, and Suvarnaprashana protocol.",
        "unitsCount": 4,
        "topicsCount": 18,
        "linkedSkillName": "Suvarnaprashana & Pediatric Protocols",
        "targetCareerRelevance": ["Pediatric Ayurvedic Clinician", "Child Health Consultant"]
    },
    {
        "id": "sub-swasthavritta",
        "code": "BAMS-304",
        "name": "Swasthavritta & Yoga",
        "sanskritName": "स्वस्थवृत्तम् एवं योगः (Preventive Medicine & Lifestyle)",
        "professionalYear": "3rd Prof",
        "iconName": "Zap",
        "totalHours": 180,
        "description": "Dinacharya (daily regimen), Ritucharya (seasonal regimen), Sadvritta, community health, nutritional dietetics, and therapeutic Yoga asanas.",
        "unitsCount": 5,
        "topicsCount": 20,
        "linkedSkillName": "Yoga & Lifestyle Therapy (Swasthavritta)",
        "targetCareerRelevance": ["Ayush Wellness Retreat Director", "Corporate Wellness Consultant"]
    },

    # 4th Professional
    {
        "id": "sub-kayachikitsa",
        "code": "BAMS-401",
        "name": "Kayachikitsa",
        "sanskritName": "कायचिकित्सा (Internal Medicine)",
        "professionalYear": "4th Prof",
        "iconName": "Stethoscope",
        "totalHours": 300,
        "description": "Clinical management of Jwara, Prameha (Diabetes), Amavata (Rheumatoid), Vatavyadhi, metabolic disorders, and Rasayana-Vajikarana therapeutics.",
        "unitsCount": 8,
        "topicsCount": 42,
        "linkedSkillName": "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
        "targetCareerRelevance": ["Senior Ayurvedic Physician", "Hospital Medical Director"]
    },
    {
        "id": "sub-panchakarma",
        "code": "BAMS-402",
        "name": "Panchakarma",
        "sanskritName": "पञ्चकर्म (Clinical Bio-Purification)",
        "professionalYear": "4th Prof",
        "iconName": "Layers",
        "totalHours": 200,
        "description": "Purvakarma (Snehana, Swedana), Pradhanakarma (Vamana, Virechana, Basti, Nasya, Raktamokshana), Samsarjana Krama, and critical care complication management.",
        "unitsCount": 6,
        "topicsCount": 32,
        "linkedSkillName": "Panchakarma Clinical Protocol Mastery",
        "targetCareerRelevance": ["Panchakarma Center Director", "Integrative Wellness Physician"]
    },
    {
        "id": "sub-shalya",
        "code": "BAMS-403",
        "name": "Shalya Tantra",
        "sanskritName": "शल्यतन्त्रम् (General Surgery & Para-Surgical Techniques)",
        "professionalYear": "4th Prof",
        "iconName": "Target",
        "totalHours": 220,
        "description": "Sushruta surgical principles, Ksharasutra management of Bhagandara (Anal Fistula), Jalaukavacharana (Leech therapy), Agnikarma, and wound healing.",
        "unitsCount": 6,
        "topicsCount": 28,
        "linkedSkillName": "Ksharasutra & Anorectal Surgery",
        "targetCareerRelevance": ["Ayurvedic Surgeon (Shalyachikitsaka)", "Anorectal Specialist"]
    },
    {
        "id": "sub-shalakya",
        "code": "BAMS-404",
        "name": "Shalakya Tantra",
        "sanskritName": "शालाक्यतन्त्रम् (Ophthalmology, ENT & Oro-Dentistry)",
        "professionalYear": "4th Prof",
        "iconName": "Compass",
        "totalHours": 200,
        "description": "Eye diseases (Netra Roga - Timira, Linganasha), Netra Kriyakalpa (Tarpana, Putapaka), ear, nose, throat and head conditions (Shiro Roga).",
        "unitsCount": 6,
        "topicsCount": 25,
        "linkedSkillName": "Netra Kriyakalpa & Ayurvedic Ophthalmology",
        "targetCareerRelevance": ["Ayurvedic Eye & ENT Specialist", "Clinical Consultant"]
    },

    # Internship
    {
        "id": "sub-internship",
        "code": "BAMS-INT",
        "name": "Rotatory Clinical Internship",
        "sanskritName": "नैदानिक अभ्यास एवं सम्प्रेषणम्",
        "professionalYear": "Internship",
        "iconName": "GraduationCap",
        "totalHours": 365 * 6,
        "description": "Mandatory 12-month rotatory clinical posting across Inpatient & Outpatient departments, Panchakarma Theatre, Emergency Casualties, and Community Health Camps.",
        "unitsCount": 6,
        "topicsCount": 20,
        "linkedSkillName": "Clinical Case Documentation & Patient Communication",
        "targetCareerRelevance": ["Licensed BAMS Doctor", "Hospital Resident Medical Officer"]
    }
]

RAW_BAMS_TOPICS: List[Dict[str, Any]] = [
    # Panchakarma Topics
    {
        "id": "top-panch-1",
        "subjectId": "sub-panchakarma",
        "subjectName": "Panchakarma",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Purvakarma (Preparatory Therapies)",
        "topicTitle": "Snehana & Swedana Vidhi (Therapeutic Oleation & Sudation)",
        "difficulty": "INTERMEDIATE",
        "learningObjectives": [
            "Understand Abhyantara (Internal) and Bahya (External) Snehana principles.",
            "Differentiate between Sadhyo Sneha and Accha Sneha dosages.",
            "Identify Samyak Snigdha Lakshana and Jeerna Ahara signs.",
            "Master indications and contraindications for Bashpa Sweda."
        ],
        "explanation": "Snehana softens and liquefies deep-seated morbid Doshas adhering to micro-cellular channels (Srotas). Followed by Swedana, which dilates the Srotas (Srotomukha Vishodhana) and mobilizes Doshas towards the Koshta for therapeutic bio-purification.",
        "sanskritShloka": {
            "devanagari": "स्नेहस्वेदावुपक्रम्य संशोधनमथाहरेत् ।\nदोषाणां बलकालज्ञो दोषं कोष्ठगतं बुधाः ॥",
            "iast": "snehasvedāvupakramya saṃśodhanamathāharet |\ndoṣāṇāṃ balakālajño doṣaṃ koṣṭhagataṃ budhāḥ ||",
            "englishMeaning": "Having first administered Snehana (oleation) and Swedana (sudation), the wise physician who understands the strength and seasonal timing of Doshas should eliminate them once brought into the Koshta.",
            "sourceTreatise": "Charaka Samhita Sutrasthana 13/83",
            "clinicalPearl": "Never administer Vamana or Virechana without adequate Purvakarma; doing so is like squeezing an unbaked clay pot—it fractures the biological tissues (Dhatus)."
        },
        "diagram": {
            "title": "Purvakarma Dosha Mobilization Pathway",
            "description": "Stepwise visualization of Snehana permeating Shakhas to Koshta migration.",
            "educationalContext": "Explains the hydrodynamic shift of hydrophobic toxins into hydrophilic channels.",
            "altText": "Snehana to Swedana to Koshta Gati diagram",
            "diagramType": "PROCEDURAL_FLOW",
            "visualSvgType": "basti_flow"
        },
        "keyRevisionPoints": [
            "Accha Sneha is given in empty stomach early morning; Sadhyo Sneha is mixed with food.",
            "Samyak Snigdha: Vatanulomana, Deeptagni, Varchas Asnigdha/Snigdha, Anga Mardava.",
            "Ati Snigdha: Panduta, Gurutva, Jadatva, Aruchi.",
            "Contraindications: Taruna Jwara, Atisara, Medoroga, Garbhini in 1st trimester."
        ],
        "examHighYield": True
    },
    {
        "id": "top-panch-2",
        "subjectId": "sub-panchakarma",
        "subjectName": "Panchakarma",
        "unitNumber": 2,
        "unitTitle": "Unit 2: Vamana & Virechana Karma",
        "topicTitle": "Vamana Karma Protocol & Complication Management",
        "difficulty": "CLINICAL",
        "learningObjectives": [
            "Calculate precise dosage of Madanaphala Yoga based on Koshtha and Agni.",
            "Evaluate Samyak, Heena, and Ati Yoga parameters during Vega observation.",
            "Recognize and manage critical complications: Adhmana, Parishrava, and Hridgraha.",
            "Prescribe individualized Samsarjana Krama dietary rehabilitation."
        ],
        "explanation": "Vamana Karma is the prime Pradhana Karma for Kapha-dominant pathogenesis. Madanaphala, Yashthimadhu Phanta, and Saindhava Lavana are administered in the morning after Kapha Utkleshana diet to induce therapeutic emesis until Pittanta (bile expulsion).",
        "sanskritShloka": {
            "devanagari": "वमने विरेचने चैव सिद्ध्यन्त्येते न संशयः ।\nकफपित्तहरावाद्यौ शुद्धिकर्मणि सम्मतौ ॥",
            "iast": "vamane virecane caiva siddhyantyete na saṃśayaḥ |\nkaphapittaharāvādyau śuddhikarmaṇi sammatau ||",
            "englishMeaning": "Vamana is the sovereign treatment for vitiated Kapha, while Virechana is the sovereign remedy for Pitta without doubt.",
            "sourceTreatise": "Ashtanga Hridaya Sutrasthana 18/1-4",
            "clinicalPearl": "Watch for Pittanta Vamana (appearance of yellow-greenish bile in final Vega) as the clinical endpoint of Samyak Vamana."
        },
        "diagram": {
            "title": "Vamana Vega Observation Chart",
            "description": "Chronological assessment of Vegas (urges) and Antiki Lakshana.",
            "educationalContext": "Demonstrates counting Pravara (8 Vegas), Madhyama (6 Vegas), and Avara (4 Vegas).",
            "altText": "Vamana Vega observation and Samsarjana Krama flowchart",
            "diagramType": "DIAGNOSTIC_ALGORITHM",
            "visualSvgType": "dosha_cycle"
        },
        "keyRevisionPoints": [
            "Madanaphala Pippali Churna (1 Karsha) with Yashtimadhu Kvatha.",
            "Kapha Utkleshaka Ahara: Dadhi, Masha, Payasa given previous evening.",
            "Antiki Criteria: Kaphanta (Avara), Pittanta (Samyak/Pravara), Vatanta (Atiyoga).",
            "Samsarjana Krama: Peya, Vilepi, Akrita Yusha, Krita Yusha, Mamsa Rasa for 3-7 days."
        ],
        "examHighYield": True
    },
    {
        "id": "top-panch-3",
        "subjectId": "sub-panchakarma",
        "subjectName": "Panchakarma",
        "unitNumber": 3,
        "unitTitle": "Unit 3: Basti Chikitsa",
        "topicTitle": "Niruha & Anuvasana Basti Formulation Matrix",
        "difficulty": "ADVANCED",
        "learningObjectives": [
            "Master the sequential mixing of Niruha Basti: Makshika, Lavana, Sneha, Kalka, Kwatha.",
            "Understand the physiological mechanisms of enteric drug absorption in Pakwashaya.",
            "Design Karma, Kala, and Yoga Basti schedules.",
            "Manage Basti Netra and Putaka defects according to Sushruta Samhita."
        ],
        "explanation": "Basti is considered Ardha Chikitsa (half of all treatment) in Ayurveda. Administered rectally into the Pakwashaya (principal seat of Vata), its active potency is transported throughout the body via Srotas, balancing Vata and nourishing the Dhatus.",
        "sanskritShloka": {
            "devanagari": "शाखागताः कोष्ठगताश्च रोगा मर्मोर्ध्वसर्वावयवाङ्गजाश्च ।\nये सन्ति तेषां न हि बस्तिवर्ज्यं मन्येत किञ्चिद्भिषगीशबुद्धिः ॥",
            "iast": "śākhāgatāḥ koṣṭhagatāśca rogā marmordhvasarvāvayavāṅgajāśca |\nye santi teṣāṃ na hi bastivarjyaṃ manyeta kiñcidbhiṣagīśabuddhiḥ ||",
            "englishMeaning": "Whether diseases are located in Shakha (peripheral tissues), Koshta (viscera), Marma (vital organs), or all over the body, there is virtually no disease where Basti therapy is excluded.",
            "sourceTreatise": "Charaka Samhita Siddhisthana 1/38",
            "clinicalPearl": "Strictly follow the Makshika-Lavana-Sneha-Kalka-Kwatha mixing order. Deviation causes phase separation and severe rectal irritation."
        },
        "diagram": {
            "title": "Basti Formulation Emulsification Order",
            "description": "5-step sequential addition ensuring stable lipophilic-hydrophilic emulsion.",
            "educationalContext": "Physics of colloid stability in classical Basti preparation.",
            "altText": "Niruha Basti sequential compounding matrix",
            "diagramType": "FORMULATION_MATRIX",
            "visualSvgType": "basti_flow"
        },
        "keyRevisionPoints": [
            "Niruha compounding: Honey (Makshika) + Rock Salt (Saindhava) -> Oil (Sneha) -> Paste (Kalka) -> Decoction (Kwatha).",
            "Yoga Basti: 8 Bastis (1 Anuvasana + 3 Niruha/Anuvasana alternate + 1 Anuvasana).",
            "Kala Basti: 16 Bastis.",
            "Karma Basti: 30 Bastis."
        ],
        "examHighYield": True
    },

    # Rachana Sharir Topics
    {
        "id": "top-rach-1",
        "subjectId": "sub-rachana",
        "subjectName": "Rachana Sharir",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Marma Sharir",
        "topicTitle": "107 Marma Points Classification & Clinical Vulnerability",
        "difficulty": "ADVANCED",
        "learningObjectives": [
            "Classify 107 Marma points according to Location, Composition, and Prognosis.",
            "Identify the 19 Sadhyo-pranahara Marmas with underlying vital anatomical structures.",
            "Correlate modern surgical landmarks with classical Sushruta measurements (Angula Pramana).",
            "Evaluate clinical consequences of trauma to Kurpara, Gulpha, and Sthapani Marmas."
        ],
        "explanation": "Marmas are physiological junctions of Mamsa, Sira, Snayu, Asthi, and Sandhi where Prana (vital bio-energy) resides. Trauma to Sadhyo-pranahara Marmas causes rapid cardiovascular or neurological collapse within 7 days.",
        "sanskritShloka": {
            "devanagari": "मर्माणि नाम मांससिरास्नाय्वस्थिसन्धिसन्निपाताः ।\nतेषु स्वभावत एव विशेषेण प्राणास्तिष्ठन्ति ॥",
            "iast": "marmāṇi nāma māṃsasirāsnāyvasthisandhisannipātāḥ |\nteṣu svabhāvata eva viśeṣeṇa prāṇāstiṣṭhanti ||",
            "englishMeaning": "Marmas are the anatomical confluence of muscle, vessels, ligaments, bones, and joints. In these sites, Prana (vital life force) naturally resides in special concentration.",
            "sourceTreatise": "Sushruta Samhita Sharirasthana 6/3",
            "clinicalPearl": "Adhipati Marma over the vertex corresponds to the confluence of sinuses (Torcular Herophili); injury causes instant death from massive intracranial hemorrhage."
        },
        "diagram": {
            "title": "Topographical Distribution of 107 Marma Points",
            "description": "Anterior and posterior full-body projection of vital anatomical centers.",
            "educationalContext": "Used for surgical planning, Agnikarma, and Viddhakarma.",
            "altText": "107 Marma points anatomical map",
            "diagramType": "ANATOMICAL",
            "visualSvgType": "marma_points"
        },
        "keyRevisionPoints": [
            "Prognostic Groups: Sadhyo-pranahara (19), Kalantara-pranahara (33), Vishalyaghna (3), Vaikalyakara (44), Rujakara (8).",
            "Trimarma: Hridaya (Thoracic), Shira (Cephalic), Basti (Pelvic).",
            "Composition: Mamsa (11), Sira (41), Snayu (27), Asthi (8), Sandhi (20)."
        ],
        "examHighYield": True
    },

    # Dravyaguna Topics
    {
        "id": "top-drav-1",
        "subjectId": "sub-dravyaguna",
        "subjectName": "Dravyaguna Vijnana",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Rasa Panchaka & Pharmacology",
        "topicTitle": "Rasa-Guna-Virya-Vipaka-Prabhava Dynamics",
        "difficulty": "INTERMEDIATE",
        "learningObjectives": [
            "Explain the Ayurvedic pharmacological pentad (Saptapadartha).",
            "Differentiate between Vipaka (post-digestive taste) and primary Rasa.",
            "Illustrate how Prabhava overrides Rasa-Virya through classical examples.",
            "Calculate thermal potency shifts in processed formulations."
        ],
        "explanation": "Dravyaguna governs drug action through the synergy of its 5 pharmacological entities. While Rasa triggers immediate gustatory sensory impulses, Vipaka dictates cellular metabolism, Virya determines systemic thermal effect, and Prabhava delivers unique clinical outcomes.",
        "sanskritShloka": {
            "devanagari": "रसा वीर्यं विपाकश्च प्रभावश्चैव पञ्चमः ।\nगुणाश्चैषां समासेन द्रव्यं पञ्चविधं स्मृतम् ॥",
            "iast": "rasā vīryaṃ vipākaśca prabhāvaścaiva pañcamaḥ |\nguṇāścaiṣāṃ samāsena dravyaṃ pañcavidhaṃ smṛtam ||",
            "englishMeaning": "Taste (Rasa), potency (Virya), post-digestive outcome (Vipaka), specific action (Prabhava), and qualitative attributes (Gunas) constitute the fivefold functional reality of medicinal herbs.",
            "sourceTreatise": "Charaka Samhita Sutrasthana 26",
            "clinicalPearl": "Danti and Chitraka possess identical Katu Rasa, Ushna Virya, and Katu Vipaka; yet Danti causes Virechana due to its unique Prabhava."
        },
        "diagram": {
            "title": "Rasa Panchaka Metabolic Flowchart",
            "description": "Sensory stimulation to systemic bio-transformation pathway.",
            "educationalContext": "Correlates Ayurvedic pharmacology with pharmacokinetics and pharmacodynamics.",
            "altText": "Dravyaguna Rasa Panchaka mechanism diagram",
            "diagramType": "PROCEDURAL_FLOW",
            "visualSvgType": "herbal_extraction"
        },
        "keyRevisionPoints": [
            "6 Rasas: Madhura, Amla, Lavana, Katu, Tikta, Kashaya.",
            "3 Vipakas: Madhura (Kapha promoting), Amla (Pitta promoting), Katu (Vata promoting).",
            "2 Viryas: Ushna (hot, catabolic, Agni dominant) and Sheeta (cold, anabolic, Soma dominant)."
        ],
        "examHighYield": True
    },

    # Kayachikitsa Topics
    {
        "id": "top-kaya-1",
        "subjectId": "sub-kayachikitsa",
        "subjectName": "Kayachikitsa",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Jwara & Amavata",
        "topicTitle": "Samprapti & Clinical Protocol for Amavata (Rheumatoid Spectrum)",
        "difficulty": "CLINICAL",
        "learningObjectives": [
            "Trace the etiopathogenesis from Mandagni to Ama formation and Vata amalgamation.",
            "Identify classical signs: Angamarda, Aruchi, Trishna, Alasya, and Sandhishoola.",
            "Prescribe the Langhana, Swedana, Tikta-Deepana, and Kshar Basti protocol.",
            "Formulate Rasayana therapy to prevent relapses."
        ],
        "explanation": "Amavata is triggered by unwholesome dietetics (Viruddha Ahara) and sedentary habits in persons with Mandagni. Undigested toxic chyme (Ama) amalgamates with vitiated Vata and lodges in the Shleshma Sthanas (synovial joints), causing excruciating joint stiffness and systemic inflammation.",
        "sanskritShloka": {
            "devanagari": "आमेनैकेन वातेन सहितेन यदोच्यते ।\nआमावतः स विज्ञेयः सर्वसन्धिप्रपीडकः ॥",
            "iast": "āmena samāyukto vātaḥ śleṣmasthāneṣu sañcitaḥ |\namāvata iti khyātaḥ sarvasandhiprapīḍakaḥ ||",
            "englishMeaning": "When Ama amalgamates with vitiated Vata and accumulates in the seats of Kapha (synovial joints), it is termed Amavata, which torments all joints.",
            "sourceTreatise": "Madhava Nidana 25/1-5",
            "clinicalPearl": "Never administer Sneha (oil massage) in early acute Amavata! It acts like pouring fuel on fire. Use Valuka Sweda (hot sand fomentation) and Deepana-Pachana first."
        },
        "diagram": {
            "title": "Amavata Pathogenesis & Clinical Step Ladder",
            "description": "Mandagni -> Ama -> Srotobhishyanda -> Sandhi Stambha -> Chikitsa Sutra.",
            "educationalContext": "Treatment staging from acute inflammatory phase to remission.",
            "altText": "Amavata Samprapti algorithm",
            "diagramType": "DIAGNOSTIC_ALGORITHM",
            "visualSvgType": "dosha_cycle"
        },
        "keyRevisionPoints": [
            "Chikitsa Sutra: Langhana, Swedana, Tikta-Deepana Dravyas, Katu Dravyas, Virechana, Snehapana (with Tikta Ghrita), and Kshar Basti.",
            "Classic Formulations: Simhanada Guggulu, Rasnasaptaka Kvatha, Vaitarana Basti.",
            "Avoid: Curd, fish, black gram, daytime sleeping."
        ],
        "examHighYield": True
    },

    # Kriya Sharir
    {
        "id": "top-kriya-1",
        "subjectId": "sub-kriya",
        "subjectName": "Kriya Sharir",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Dosha Dhatu Mala Vijnana",
        "topicTitle": "Tridosha Physiology, Subtypes & Biological Rhythms",
        "difficulty": "FOUNDATION",
        "learningObjectives": [
            "Master the 5 subtypes of Vata (Prana, Udana, Samana, Vyana, Apana).",
            "Explain 5 Pitta and 5 Kapha subtypes with anatomical locations.",
            "Understand circadian and seasonal diurnal rhythms of Dosha fluctuation."
        ],
        "explanation": "Tridosha (Vata, Pitta, Kapha) govern all sensory, cellular, enzymatic, and metabolic functions. Equilibrium represents health (Arogya), whereas imbalance precipitates disease.",
        "sanskritShloka": {
            "devanagari": "वायुः पित्तं कफश्चोक्तः शारीरो दोषसंग्रहः ।\nमानसः पुनरुद्दिष्टो रजश्च तम एव च ॥",
            "iast": "vāyuḥ pittaṁ kaphaścoktaḥ śārīro doṣasaṅgrahaḥ |\nmānasaḥ punaruddiṣṭo rajaśca tama eva ca ||",
            "englishMeaning": "Vata, Pitta, and Kapha constitute the somatic Doshas. Rajas and Tamas constitute the psychic Doshas.",
            "sourceTreatise": "Ashtanga Hridaya Sutrasthana 1/8",
            "clinicalPearl": "Always assess circadian peaks: Vata peaks in late afternoon/dawn, Pitta at midday/midnight, and Kapha in the morning/evening."
        },
        "diagram": {
            "title": "Tridosha Diurnal Cycle & Circadian Rhythms",
            "description": "Graphic representation of 24-hour Dosha shifts and Dinacharya coordination.",
            "educationalContext": "Understanding chronological drug timing (Aushadha Sevana Kala).",
            "altText": "Dosha circadian diurnal clock",
            "diagramType": "CIRCADIAN_CLOCK",
            "visualSvgType": "dosha_cycle"
        },
        "keyRevisionPoints": [
            "Prana: Murdha (head); Udana: Uras (chest); Samana: Agni-samipam; Vyana: Hridaya; Apana: Pakvadhana.",
            "Vitiation symptoms: Vata produces pain/stiffness, Pitta produces burning/fever, Kapha produces heaviness/edema."
        ],
        "examHighYield": True
    },

    # Shalya Tantra
    {
        "id": "top-shalya-1",
        "subjectId": "sub-shalya",
        "subjectName": "Shalya Tantra",
        "unitNumber": 2,
        "unitTitle": "Unit 2: Anorectal Surgery & Parasurgical Measures",
        "topicTitle": "Ksharasutra Preparation, Chemistry & Bhagandara (Fistula-in-Ano) Management",
        "difficulty": "ADVANCED",
        "learningObjectives": [
            "Describe the coating formula: 11 coatings of Snuhi Ksheera, 7 of Apamarga Kshara, and 3 of Haridra Churna.",
            "Explain mechanical cutting, chemical debridement, and simultaneous fistulous tract healing.",
            "Detail Ksharasutra threading protocol and post-procedural Sitz bath care."
        ],
        "explanation": "Ksharasutra is Sushruta's minimally invasive gold standard for high and low anal fistulae. The alkaline pH and proteolytic enzymes cut and curette fibrotic tract tissue while turmeric promotes sterile granulation with <2% recurrence rate.",
        "sanskritShloka": {
            "devanagari": "एष दोषेषु सर्वेषु भगन्दरेषु शस्यते ।\nक्षारसूत्रेण संछिन्द्यात् भिषक् सूत्रं प्रवेशयेत् ॥",
            "iast": "eṣa doṣeṣu sarveṣu bhagandareṣu śasyate |\nkṣārasūtreṇa sañchindyāt bhiṣak sūtraṁ praveśayet ||",
            "englishMeaning": "In all types of Bhagandara, Ksharasutra application is the treatment of supreme excellence.",
            "sourceTreatise": "Sushruta Samhita Chikitsasthana 8/28",
            "clinicalPearl": "Weekly changing of thread under local anesthesia without general anesthesia permits ambulatory recovery."
        },
        "diagram": {
            "title": "Ksharasutra 21-Coat Layering & Cut-Through Mechanism",
            "description": "Schematic of surgical thread linen with Apamarga, Snuhi, and Haridra coatings.",
            "educationalContext": "Surgical parasurgical methodology for high anal fistula.",
            "altText": "Ksharasutra mechanism diagram",
            "diagramType": "SURGICAL_STEPS",
            "visualSvgType": "fistula_tract"
        },
        "keyRevisionPoints": [
            "Total 21 coatings: 11 Snuhi (Euphorbia neriifolia), 7 Apamarga Kshara (Achyranthes aspera), 3 Haridra (Curcuma longa).",
            "Recurrence rate is under 2% compared to conventional fistulectomy."
        ],
        "examHighYield": True
    },

    # Shalakya Tantra
    {
        "id": "top-shalak-1",
        "subjectId": "sub-shalakya",
        "subjectName": "Shalakya Tantra",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Netra Kriyakalpa & Ocular Therapeutics",
        "topicTitle": "Netra Tarpana, Putapaka & Aschyotana Protocols in Computer Vision Syndrome",
        "difficulty": "CLINICAL",
        "learningObjectives": [
            "Identify indications for Netra Tarpana with Triphala Ghrita in Shushkakshipaka (Dry Eye).",
            "Formulate Masha (black gram) dough ocular wall dams.",
            "Explain duration of medicated ghee retention based on Dosha and eye segment."
        ],
        "explanation": "Netra Tarpana provides deep lipidic nourishment to cornea, sclera, and ciliary muscles, reversing computer vision eye fatigue and tear film hyperosmolarity.",
        "sanskritShloka": {
            "devanagari": "नेत्ररोगेषु सर्वेषु तर्पणं परमं स्मृतम् ।\nयवाक्षिरूपं पिष्टं तु माषाणां परिकल्पयेत् ॥",
            "iast": "netrarogeṣu sarveṣu tarpanaṁ paramaṁ smṛtam |\nyavākṣirūpaṁ piṣṭaṁ tu māṣāṇāṁ parikalpayet ||",
            "englishMeaning": "Among ocular rejuvenative procedures, Tarpana is supreme, conducted using a dam molded from black gram paste.",
            "sourceTreatise": "Sushruta Samhita Uttaratantra 18/6-9",
            "clinicalPearl": "Never perform Tarpana in cloudy weather, active conjunctivitis, or immediate post-head bath states."
        },
        "diagram": {
            "title": "Netra Tarpana Clinical Dam Application",
            "description": "Cross-sectional anatomy of the eye submerged in medicated Ghrita.",
            "educationalContext": "Ocular drug delivery via lipophilic corneal absorption.",
            "altText": "Netra Tarpana ocular dam illustration",
            "diagramType": "PROCEDURE_DIAGRAM",
            "visualSvgType": "ocular_dam"
        },
        "keyRevisionPoints": [
            "Retain medicated ghee for 500 to 1000 Matra Kala depending on Vata, Pitta, or Kapha dominance.",
            "Administer Dhoomapana following the procedure to clear Kapha secretions."
        ],
        "examHighYield": True
    },

    # Prasuti Tantra
    {
        "id": "top-prasuti-1",
        "subjectId": "sub-prasuti",
        "subjectName": "Prasuti Tantra & Striroga",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Garbhini Paricharya (Antenatal Regimen)",
        "topicTitle": "Month-Wise Dietary & Herbal Protocols for Normal Fetal Growth (Masanumashika)",
        "difficulty": "FOUNDATION",
        "learningObjectives": [
            "Memorize month 1 through month 9 dietary prescriptions per Charaka and Sushruta.",
            "Explain the rationale of milk and sweet herbs (Madhura Gana) in early organogenesis.",
            "Detail 8th month Asthapan and Anuvasana Basti protocol for Vatanulomana and easy labor."
        ],
        "explanation": "Garbhini Paricharya provides systematic nutritional, psychological, and physiological support ensuring normal organogenesis, pelvic relaxation, maternal lactation, and uneventful labor.",
        "sanskritShloka": {
            "devanagari": "प्रथममासि मधुरशीतं मधुरौषधसंस्कृतं क्षीरं प्रयच्छेत् ।\nअष्टमे तु मासि आस्थापनबस्तिं दद्यात् ॥",
            "iast": "prathamamāsi madhuraśītaṁ madhurauṣadhasaṁskṛtaṁ kṣīraṁ prayacchet |\naṣṭame tu māsi āsthāpanabastiṁ dadyāt ||",
            "englishMeaning": "In the first month, administer non-medicated cold milk and sweet herb infusions. In the eighth month, administer Anuvasana and Asthapana Basti.",
            "sourceTreatise": "Charaka Samhita Sharirasthana 8/32",
            "clinicalPearl": "The 8th-month Anuvasana Basti with oil medicated with Madhura drugs lubricates the birth canal and normalizes Apana Vayu."
        },
        "diagram": {
            "title": "Masanumashika 9-Month Protocol Timeline",
            "description": "Chronological timeline of Ayurvedic antenatal nutrition from conception to parturition.",
            "educationalContext": "Antenatal preventive obstetrics.",
            "altText": "Garbhini Paricharya 9-month timeline",
            "diagramType": "TIMELINE",
            "visualSvgType": "pregnancy_timeline"
        },
        "keyRevisionPoints": [
            "Month 1: Sweet cold milk; Month 2: Milk medicated with Madhura Dravyas; Month 4: Milk with fresh butter; Month 8: Milk gruel with ghee & Basti; Month 9: Medicated vaginal tampon (Pichu).",
            "Avoid Garbhopaghatakara Bhavas (trauma, pungent diet, emotional distress)."
        ],
        "examHighYield": True
    },

    # Agada Tantra
    {
        "id": "top-agada-1",
        "subjectId": "sub-agada",
        "subjectName": "Agada Tantra & Vyavahara Ayurveda",
        "unitNumber": 1,
        "unitTitle": "Unit 1: Toxicology & Envenomation",
        "topicTitle": "Sarpa Visha (Snake Envenomation) Classification & 24 Upakramas",
        "difficulty": "CLINICAL",
        "learningObjectives": [
            "Differentiate Darvikara (neurotoxic), Mandali (vasculotoxic), and Rajiman (myotoxic) snakes.",
            "Explain the 7 stages of Visha Vega.",
            "Execute the 24 Upakramas (emergency therapeutic modalities) including Arishta Bandhana and Raktamokshana."
        ],
        "explanation": "Ayurvedic toxicology classifies snake venom by its dominant Dosha action: Darvikara (Vata), Mandali (Pitta), and Rajiman (Kapha). The emergency protocol comprises 24 Upakramas aimed at halting venom spread and neutralizing cellular toxins.",
        "sanskritShloka": {
            "devanagari": "अरिष्टबन्धनं पूर्वं छर्दनं रक्तमोक्षणम् ।\nदंशप्रमार्जनं चैव विषवेगोपशान्तये ॥",
            "iast": "ariṣṭabandhanaṁ pūrvaṁ chardanaṁ raktamokṣaṇam |\ndaṁśapramārjanaṁ caiva viṣavegopaśāntaye ||",
            "englishMeaning": "Application of tourniquet (Arishta Bandhana), emesis (Chardana), and blood-letting (Raktamokshana) are early emergency steps to arrest venom propagation.",
            "sourceTreatise": "Charaka Samhita Chikitsasthana 23/35-37",
            "clinicalPearl": "Arishta Bandhana tourniquet must be tied 4 Angula above the bite site, ensuring arterial circulation remains intact while retarding venous return."
        },
        "diagram": {
            "title": "Sarpa Visha Emergency 24 Upakramas Flowchart",
            "description": "Emergency triage flowchart for immediate management of poisonous snakebites.",
            "educationalContext": "Ayurvedic toxicology and acute clinical care.",
            "altText": "Snakebite 24 Upakrama emergency flow",
            "diagramType": "EMERGENCY_ALGORITHM",
            "visualSvgType": "emergency_flow"
        },
        "keyRevisionPoints": [
            "24 Upakramas include Arishta (tourniquet), Chedana (incision), Agnikarma (cauterization), Raktamokshana (venesection), and Visha-nashaka Agadas (e.g., Bilwadi Agada).",
            "Dooshi Visha is low-potency residual poison accumulated in Dhatus over years."
        ],
        "examHighYield": True
    }
]


class BamsLearningService:

    @classmethod
    def get_curriculum(
        cls,
        prof_year: Optional[str] = None,
        subject_id: Optional[str] = None
    ) -> BamsCurriculumOut:
        prof_years = ["1st Prof", "2nd Prof", "3rd Prof", "4th Prof", "Internship"]
        raw_subjects = RAW_BAMS_SUBJECTS
        raw_topics = RAW_BAMS_TOPICS

        if prof_year:
            raw_subjects = [s for s in raw_subjects if s.get("professionalYear") == prof_year]
            subject_ids = {s["id"] for s in raw_subjects}
            raw_topics = [t for t in raw_topics if t.get("subjectId") in subject_ids]

        if subject_id:
            raw_topics = [t for t in raw_topics if t.get("subjectId") == subject_id]
            raw_subjects = [s for s in raw_subjects if s.get("id") == subject_id]

        subjects = [BamsSubjectSchema(**s) for s in raw_subjects]
        topics = [BamsTopicSchema(**t) for t in raw_topics]
        return BamsCurriculumOut(
            professional_years=prof_years,
            subjects=subjects,
            topics=topics,
            total_subjects=len(subjects),
            total_topics=len(topics)
        )

    @classmethod
    async def get_or_create_student_progress(cls, db: AsyncSession, user: User) -> StudentBamsProgress:
        res = await db.execute(
            select(StudentBamsProgress).where(StudentBamsProgress.user_id == user.id)
        )
        prog = res.scalar_one_or_none()
        if not prog:
            prog = StudentBamsProgress(
                user_id=user.id,
                current_prof_year="4th Prof",
                completed_topics=[],
                bookmarked_topics=[],
                recently_viewed_topics=[],
                clinical_logbook_entries=[
                    {
                        "id": "log-demo-1",
                        "date": "2026-10-28",
                        "posting": "Panchakarma Department",
                        "department": "Panchakarma",
                        "procedure_observed": "Kati Basti with Mahanarayana Taila in Lumbar Spondylosis",
                        "reflection": "Observed strict temperature monitoring of oil (lukewarm ~40°C). Patient reported significant reduction in stiffness.",
                        "supervisor_name": "Dr. V. K. Sharma, MD (Panchakarma)",
                        "created_at": "2026-10-28T10:00:00Z"
                    }
                ],
                learning_goals={
                    "target_minutes_daily": 45,
                    "target_topics_daily": 3,
                    "target_quizzes_weekly": 4,
                    "reminders_enabled": True,
                    "reminder_time": "19:00"
                },
                dismissed_recommendation_ids=[],
                completed_recommendation_ids=[],
                flashcard_mastery={},
                checklist_completed_ids=[]
            )
            db.add(prog)
            await db.commit()
            await db.refresh(prog)
        else:
            if prog.learning_goals is None:
                prog.learning_goals = {
                    "target_minutes_daily": 45,
                    "target_topics_daily": 3,
                    "target_quizzes_weekly": 4,
                    "reminders_enabled": True,
                    "reminder_time": "19:00"
                }
            if prog.dismissed_recommendation_ids is None:
                prog.dismissed_recommendation_ids = []
            if prog.completed_recommendation_ids is None:
                prog.completed_recommendation_ids = []
            if prog.flashcard_mastery is None:
                prog.flashcard_mastery = {}
            if prog.checklist_completed_ids is None:
                prog.checklist_completed_ids = []
        return prog


    @classmethod
    async def get_student_progress(cls, db: AsyncSession, user: User) -> StudentProgressOut:
        prog = await cls.get_or_create_student_progress(db, user)

        # Calculate subject-wise completion
        all_topics = RAW_BAMS_TOPICS
        total_topics_count = len(all_topics)
        completed_set = set(prog.completed_topics or [])

        overall_pct = round((len(completed_set) / max(1, total_topics_count)) * 100.0, 1)

        subject_completion: Dict[str, float] = {}
        for s in RAW_BAMS_SUBJECTS:
            s_topics = [t for t in all_topics if t["subjectId"] == s["id"]]
            if not s_topics:
                subject_completion[s["id"]] = 0.0
            else:
                c_count = sum(1 for t in s_topics if t["id"] in completed_set)
                subject_completion[s["id"]] = round((c_count / len(s_topics)) * 100.0, 1)

        # Resolve continue learning topic
        continue_topic = None
        if prog.recently_viewed_topics:
            last_v = prog.recently_viewed_topics[0]
            matched = next((t for t in all_topics if t["id"] == last_v.get("topic_id")), None)
            if matched:
                continue_topic = {
                    "topic_id": matched["id"],
                    "title": matched["topicTitle"],
                    "subject_id": matched["subjectId"],
                    "subject_name": matched["subjectName"],
                    "unit_title": matched["unitTitle"]
                }

        if not continue_topic and all_topics:
            t0 = all_topics[0]
            continue_topic = {
                "topic_id": t0["id"],
                "title": t0["topicTitle"],
                "subject_id": t0["subjectId"],
                "subject_name": t0["subjectName"],
                "unit_title": t0["unitTitle"]
            }

        return StudentProgressOut(
            user_id=prog.user_id,
            current_prof_year=prog.current_prof_year,
            completed_topics=prog.completed_topics or [],
            bookmarked_topics=prog.bookmarked_topics or [],
            recently_viewed_topics=prog.recently_viewed_topics or [],
            overall_completion_pct=overall_pct,
            subject_completion=subject_completion,
            clinical_logbook=prog.clinical_logbook_entries or [],
            continue_learning_topic=continue_topic
        )

    @classmethod
    async def toggle_topic_complete(cls, db: AsyncSession, user: User, topic_id: str) -> StudentProgressOut:
        prog = await cls.get_or_create_student_progress(db, user)
        completed = list(prog.completed_topics or [])
        if topic_id in completed:
            completed.remove(topic_id)
        else:
            completed.append(topic_id)
        prog.completed_topics = completed
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return await cls.get_student_progress(db, user)

    @classmethod
    async def toggle_topic_bookmark(cls, db: AsyncSession, user: User, topic_id: str) -> StudentProgressOut:
        prog = await cls.get_or_create_student_progress(db, user)
        bookmarks = list(prog.bookmarked_topics or [])
        if topic_id in bookmarks:
            bookmarks.remove(topic_id)
        else:
            bookmarks.append(topic_id)
        prog.bookmarked_topics = bookmarks
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return await cls.get_student_progress(db, user)

    @classmethod
    async def record_topic_view(
        cls,
        db: AsyncSession,
        user: User,
        topic_id: str,
        title: str,
        subject_id: str,
        subject_name: Optional[str] = None
    ) -> StudentProgressOut:
        prog = await cls.get_or_create_student_progress(db, user)
        history = list(prog.recently_viewed_topics or [])
        # Remove existing if present to move to top
        history = [h for h in history if h.get("topic_id") != topic_id]
        history.insert(0, {
            "topic_id": topic_id,
            "title": title,
            "subject_id": subject_id,
            "subject_name": subject_name or "Ayurveda",
            "viewed_at": datetime.now(timezone.utc).isoformat()
        })
        # Keep recent 10
        prog.recently_viewed_topics = history[:10]
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return await cls.get_student_progress(db, user)

    @classmethod
    async def add_logbook_entry(cls, db: AsyncSession, user: User, data: ClinicalLogbookEntryIn) -> ClinicalLogbookEntryOut:
        prog = await cls.get_or_create_student_progress(db, user)
        entries = list(prog.clinical_logbook_entries or [])
        new_entry = {
            "id": f"log-{uuid.uuid4().hex[:8]}",
            "date": data.date,
            "posting": data.posting,
            "department": data.department,
            "procedure_observed": data.procedure_observed,
            "reflection": data.reflection,
            "supervisor_name": data.supervisor_name or "Dr. Vaidya In-Charge",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        entries.insert(0, new_entry)
        prog.clinical_logbook_entries = entries
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return ClinicalLogbookEntryOut(**new_entry)

    # ============================================================
    # 4. INTERACTIVE FLASHCARD DECKS
    # ============================================================

    RAW_FLASHCARDS: List[Dict[str, Any]] = [
        {
            "id": "card-rach-1",
            "subjectId": "sub-rachana",
            "subjectName": "Rachana Sharir",
            "topicId": "top-rach-1",
            "topicTitle": "107 Marma Points Classification",
            "sanskritTerm": "सद्यःप्राणहर मर्माणि (Sadhyo-pranahara Marma)",
            "sanskritDevanagari": "सद्यःप्राणहराण्याशु मारयन्ति",
            "conceptExplanation": "19 vital points where traumatic injury causes death within 7 days due to acute loss of Agni and Soma (vital bio-energies). Examples: Hridaya, Nabhi, Basti, Sringataka (4), Adhipati.",
            "clinicalCorrelation": "Direct damage to major vascular axes (aorta, femoral/carotid trunks) or intracranial venous sinuses leading to irreversible hemorrhagic shock.",
            "modernCorrelate": "Confluence of sinuses (Torcular Herophili), cardiac ventricular wall, and external iliac junctions.",
            "difficulty": "ADVANCED"
        },
        {
            "id": "card-rach-2",
            "subjectId": "sub-rachana",
            "subjectName": "Rachana Sharir",
            "topicId": "top-rach-1",
            "topicTitle": "Adhipati Marma Topography",
            "sanskritTerm": "अधिपति मर्म (Adhipati Marma)",
            "sanskritDevanagari": "मस्तकाभ्यन्तरतो मूर्ध्नि सिरासन्निपातोऽधिपतिः",
            "conceptExplanation": "Located on the vertex where all cranial Siras (vessels) converge. Traumatic puncture causes instant death (Sadhyo Maraka).",
            "clinicalCorrelation": "Avoid heavy physical percussion or sharp instrumentation over vertex sutures; used therapeutically with gentle cooling taila (Shirodhara/Shirobasti).",
            "modernCorrelate": "Sagittal suture & superior sagittal sinus confluence at vertex.",
            "difficulty": "INTERMEDIATE"
        },
        {
            "id": "card-kriya-1",
            "subjectId": "sub-kriya",
            "subjectName": "Kriya Sharir",
            "topicId": "top-kriya-1",
            "topicTitle": "Shat-Kriya Kala Stages",
            "sanskritTerm": "षट् क्रियाकाल (Shat-Kriya Kala)",
            "sanskritDevanagari": "सञ्चयं च प्रकोपं च प्रसरं स्थानसंश्रयम् । व्यक्तिं भेदं च यो वेत्ति",
            "conceptExplanation": "The 6 sequential stages of pathogenesis: 1. Sanchaya (Accumulation), 2. Prakopa (Vitiation), 3. Prasara (Dissemination), 4. Sthana-Samshraya (Localization / Prodrome), 5. Vyakti (Manifestation), 6. Bheda (Complication / Chronicity).",
            "clinicalCorrelation": "Early treatment at Sanchaya or Prakopa prevents structural tissue damage (Dushya-Sammurchana). Sthana-Samshraya marks the appearance of Purvarupa.",
            "modernCorrelate": "Pathogenetic stages from subclinical cellular stress to tissue localization, systemic manifestation, and irreversible fibrotic remodeling.",
            "difficulty": "HIGH_YIELD"
        },
        {
            "id": "card-kriya-2",
            "subjectId": "sub-kriya",
            "subjectName": "Kriya Sharir",
            "topicId": "top-kriya-1",
            "topicTitle": "Trayodasha Agni Matrix",
            "sanskritTerm": "त्रयोदशाग्नि (13 Biological Fires)",
            "sanskritDevanagari": "शान्तेऽग्नौ म्रियते युक्ते चिरं जीवत्यनामयः",
            "conceptExplanation": "Ayurveda describes 13 metabolic fires: 1 central Jatharagni (master metabolic fire in gastrointestinal tract), 5 Bhutagnis (elemental liver transformations), and 7 Dhatvagnis (tissue-specific assimilation fires).",
            "clinicalCorrelation": "Mandagni produces Ama (toxic intermediate metabolite) which occludes micro-channels. Deepana-Pachana therapy restores optimal Agni.",
            "modernCorrelate": "GI luminal enzymatic digestion + hepatic phase I/II detoxification + mitochondrial ATP synthase phosphorylation.",
            "difficulty": "INTERMEDIATE"
        },
        {
            "id": "card-dravya-1",
            "subjectId": "sub-dravyaguna",
            "subjectName": "Dravyaguna Vijnana",
            "topicId": "top-dravya-1",
            "topicTitle": "Haritaki Rasa Panchaka",
            "sanskritTerm": "हरीतकी रसपञ्चक (Terminalia chebula)",
            "sanskritDevanagari": "हरीतकी पञ्चरसाऽलवणा परमा शिवा",
            "conceptExplanation": "Contains 5 of the 6 tastes (devoid only of Lavana/salty; Kashaya dominant). Guna: Laghu, Ruksha. Virya: Ushna. Vipaka: Madhura. Doshaghnata: Tridoshahara (Vatanulomaka).",
            "clinicalCorrelation": "Premier Rasayana drug. Used in constipation, hemorrhoids, metabolic syndrome, and as the prime ingredient in Triphala Churna.",
            "modernCorrelate": "Tannins (chebulic acid, corilagin), prokinetic gastro-intestinal serotonergic modulation, and broad-spectrum antioxidant capacity.",
            "difficulty": "HIGH_YIELD"
        },
        {
            "id": "card-dravya-2",
            "subjectId": "sub-dravyaguna",
            "subjectName": "Dravyaguna Vijnana",
            "topicId": "top-dravya-1",
            "topicTitle": "Prabhava Principle",
            "sanskritTerm": "प्रभाव (Specific Pharmacodynamic Action)",
            "sanskritDevanagari": "रसवीर्यविपाकानां सामान्याद्यत्कर्म विशिष्टं तत्प्रभावजम्",
            "conceptExplanation": "Specific biological action of a substance that cannot be explained purely by its Rasa, Guna, Virya, or Vipaka. Example: Chitraka and Danti are both Katu-Ushna, but only Danti induces purgation due to Prabhava.",
            "clinicalCorrelation": "Crucial for understanding specialized organ affinities (Hridya, Medhya, Vrishya) beyond gross physicochemical properties.",
            "modernCorrelate": "High-affinity stereospecific receptor-ligand targeting not predictable from general chemical class.",
            "difficulty": "ADVANCED"
        },
        {
            "id": "card-panch-1",
            "subjectId": "sub-panchakarma",
            "subjectName": "Panchakarma",
            "topicId": "top-panch-1",
            "topicTitle": "Samyak Snigdha Lakshana",
            "sanskritTerm": "सम्यक् स्निग्ध लक्षण (Adequate Oleation Signs)",
            "sanskritDevanagari": "वातानुलोम्यं दीप्तोऽग्निर्वर्चः स्निग्धमसंहतम् । मृदुता चाङ्गलघुता",
            "conceptExplanation": "Key clinical signs indicating sufficient internal Snehana before shodhana: 1. Vatanulomana (downward flatus passage), 2. Deeptagni (robust digestive hunger), 3. Unformed/soft greasy stool, 4. Body softness and lightness.",
            "clinicalCorrelation": "Do NOT proceed to Vamana or Virechana until Samyak Snigdha signs appear, typically on day 3 to 7 of Accha Snehapana.",
            "modernCorrelate": "Bile acid saturation, lymphatic lacteal clearance, and epithelial lipid permeation.",
            "difficulty": "HIGH_YIELD"
        },
        {
            "id": "card-panch-2",
            "subjectId": "sub-panchakarma",
            "subjectName": "Panchakarma",
            "topicId": "top-panch-3",
            "topicTitle": "Niruha Basti Emulsification Order",
            "sanskritTerm": "निरूह बस्ति क्रम (Niruha Compounding Protocol)",
            "sanskritDevanagari": "माक्षिकं लवणं स्नेहं कल्कं क्वाथमिति क्रमात्",
            "conceptExplanation": "Strict sequential addition: 1. Makshika (Honey) -> 2. Saindhava Lavana (Rock Salt) -> 3. Sneha (Taila/Ghrita) -> 4. Kalka (Medicinal Paste) -> 5. Kwatha (Decoction). Thoroughly triturated to form a homogeneous micro-emulsion.",
            "clinicalCorrelation": "Improper sequence leads to phase separation of lipids and severe rectal mucosa irritation or retention failure.",
            "modernCorrelate": "Surface tension lowering, micellar emulsification, and mucosal drug bioavailability.",
            "difficulty": "ADVANCED"
        },
        {
            "id": "card-shalya-1",
            "subjectId": "sub-shalya",
            "subjectName": "Shalya Tantra",
            "topicId": "top-shalya-1",
            "topicTitle": "Ksharasutra Preparation Ingredients",
            "sanskritTerm": "क्षारसूत्र (Medicated Caustic Thread)",
            "sanskritDevanagari": "स्नुहीक्षीरं क्षारो हरिद्रा",
            "conceptExplanation": "Barbour surgical linen thread No. 20 coated sequentially with: 11 coatings of Snuhi Ksheera (Euphorbia neriifolia latex), 7 coatings of Snuhi + Apamarga Kshara (Achyranthes aspera alkali), and 3 coatings of Snuhi + Haridra Churna (Curcuma longa powder). Total 21 coatings.",
            "clinicalCorrelation": "Gold-standard minimally invasive treatment for Bhagandara (Fistula-in-Ano); causes simultaneous debridement, chemical cauterization, and granulation.",
            "modernCorrelate": "Proteolytic enzymatic debridement + alkaline chemical ablation + curcuminoid anti-microbial wound repair.",
            "difficulty": "HIGH_YIELD"
        }
    ]

    @classmethod
    async def get_flashcards(
        cls,
        db: AsyncSession,
        user: User,
        subject_id: Optional[str] = None
    ) -> List[FlashcardCardSchema]:
        prog = await cls.get_or_create_student_progress(db, user)
        mastery = prog.flashcard_mastery or {}

        cards = cls.RAW_FLASHCARDS
        if subject_id:
            cards = [c for c in cards if c["subjectId"] == subject_id]

        out = []
        for c in cards:
            cid = c["id"]
            user_rating = mastery.get(cid)
            status_val = "NEW"
            if user_rating == "EASY":
                status_val = "MASTERED"
            elif user_rating in ["MEDIUM", "HARD"]:
                status_val = "LEARNING"

            out.append(
                FlashcardCardSchema(
                    id=cid,
                    subjectId=c["subjectId"],
                    subjectName=c["subjectName"],
                    topicId=c["topicId"],
                    topicTitle=c["topicTitle"],
                    sanskritTerm=c["sanskritTerm"],
                    sanskritDevanagari=c["sanskritDevanagari"],
                    conceptExplanation=c["conceptExplanation"],
                    clinicalCorrelation=c["clinicalCorrelation"],
                    modernCorrelate=c["modernCorrelate"],
                    difficulty=c["difficulty"],
                    masteryStatus=status_val,
                    userRating=user_rating
                )
            )
        return out

    @classmethod
    async def record_flashcard_review(
        cls,
        db: AsyncSession,
        user: User,
        card_id: str,
        rating: str
    ) -> Dict[str, Any]:
        prog = await cls.get_or_create_student_progress(db, user)
        mastery = dict(prog.flashcard_mastery or {})
        mastery[card_id] = rating.upper()
        prog.flashcard_mastery = mastery
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return {"card_id": card_id, "rating": rating.upper(), "success": True}

    # ============================================================
    # 5. SMART LEARNING RECOMMENDATIONS ENGINE
    # ============================================================

    @classmethod
    async def get_smart_recommendations(
        cls,
        db: AsyncSession,
        user: User
    ) -> List[SmartRecommendationOut]:
        prog = await cls.get_or_create_student_progress(db, user)
        dismissed = set(prog.dismissed_recommendation_ids or [])
        completed = set(prog.completed_recommendation_ids or [])
        completed_topics = set(prog.completed_topics or [])
        bookmarked_topics = set(prog.bookmarked_topics or [])

        # Fetch recent quiz attempts to diagnose weak areas
        res_quizzes = await db.execute(
            select(AIQuizAttempt).where(AIQuizAttempt.user_id == user.id).order_by(AIQuizAttempt.completed_at.desc()).limit(5)
        )
        attempts = list(res_quizzes.scalars().all())

        # Fetch saved notes count
        res_notes = await db.execute(select(AINote).where(AINote.user_id == user.id))
        notes_count = len(res_notes.scalars().all())

        pool: List[Dict[str, Any]] = [
            {
                "id": "rec-panch-purva",
                "type": "LESSON",
                "title": "Master Snehana & Swedana Vidhi",
                "subject": "Panchakarma",
                "topic_id": "top-panch-1",
                "reason": "Core foundational NCISM Purvakarma competency required before clinical postings.",
                "priority": "HIGH",
                "est_minutes": 20,
                "action_url": "/bams/subjects/sub-panchakarma"
            },
            {
                "id": "rec-quiz-marma",
                "type": "PRACTICE_QUIZ",
                "title": "Practice 107 Marma Points Diagnostic Quiz",
                "subject": "Rachana Sharir",
                "topic_id": "top-rach-1",
                "reason": "High-yield oral viva and competitive exam topic with high clinical significance.",
                "priority": "HIGH",
                "est_minutes": 10,
                "action_url": "/student/quiz"
            },
            {
                "id": "rec-flash-dravya",
                "type": "FLASHCARD",
                "title": "Active Recall: Rasa Panchaka Pharmacology Deck",
                "subject": "Dravyaguna Vijnana",
                "topic_id": "top-dravya-1",
                "reason": "Spaced repetition recommended for botanical drug actions and classical Nighantu memorization.",
                "priority": "MEDIUM",
                "est_minutes": 15,
                "action_url": "/bams/flashcards"
            },
            {
                "id": "rec-revis-basti",
                "type": "REVISION",
                "title": "Review Niruha Basti Compounding Protocol",
                "subject": "Panchakarma",
                "topic_id": "top-panch-3",
                "reason": "You bookmarked this complex formulation matrix. A 10-minute revision solidifies memory.",
                "priority": "MEDIUM",
                "est_minutes": 12,
                "action_url": "/bams/subjects/sub-panchakarma"
            },
            {
                "id": "rec-notes-simplify",
                "type": "NOTE_REVIEW",
                "title": "Transform & Simplify Your Saved Notes with AI",
                "subject": "Study Assistant",
                "topic_id": None,
                "reason": f"You have {max(1, notes_count)} study notes. Convert them into concise bullet points or exam tables.",
                "priority": "ROUTINE",
                "est_minutes": 8,
                "action_url": "/student-notes"
            },
            {
                "id": "rec-case-study-panch",
                "type": "CASE_STUDY",
                "title": "Clinical Case: Kati Basti in Lumbar Spondylosis",
                "subject": "Clinical Practice",
                "topic_id": "top-panch-1",
                "reason": "Bridge theory to clinical practice with verified case study observations.",
                "priority": "ROUTINE",
                "est_minutes": 15,
                "action_url": "/bams/internship"
            }
        ]

        out: List[SmartRecommendationOut] = []
        for r in pool:
            rid = r["id"]
            if rid in dismissed:
                continue
            out.append(
                SmartRecommendationOut(
                    id=rid,
                    type=r["type"],
                    title=r["title"],
                    subject=r["subject"],
                    topic_id=r["topic_id"],
                    reason=r["reason"],
                    priority=r["priority"],
                    est_minutes=r["est_minutes"],
                    action_url=r["action_url"],
                    is_completed=rid in completed,
                    is_dismissed=False
                )
            )
        return out

    @classmethod
    async def dismiss_recommendation(cls, db: AsyncSession, user: User, rec_id: str) -> Dict[str, Any]:
        prog = await cls.get_or_create_student_progress(db, user)
        dismissed = list(prog.dismissed_recommendation_ids or [])
        if rec_id not in dismissed:
            dismissed.append(rec_id)
        prog.dismissed_recommendation_ids = dismissed
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return {"id": rec_id, "dismissed": True}

    @classmethod
    async def complete_recommendation(cls, db: AsyncSession, user: User, rec_id: str) -> Dict[str, Any]:
        prog = await cls.get_or_create_student_progress(db, user)
        completed = list(prog.completed_recommendation_ids or [])
        if rec_id not in completed:
            completed.append(rec_id)
        prog.completed_recommendation_ids = completed
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return {"id": rec_id, "completed": True}

    @classmethod
    async def reset_recommendations(cls, db: AsyncSession, user: User) -> Dict[str, Any]:
        prog = await cls.get_or_create_student_progress(db, user)
        prog.dismissed_recommendation_ids = []
        prog.completed_recommendation_ids = []
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return {"reset": True}

    # ============================================================
    # 6. LEARNING MOTIVATION, GOALS & REMINDERS
    # ============================================================

    @classmethod
    async def get_goals(cls, db: AsyncSession, user: User) -> StudentGoalSettingsOut:
        prog = await cls.get_or_create_student_progress(db, user)
        goals_data = prog.learning_goals or {}

        target_min = goals_data.get("target_minutes_daily", 45)
        target_top = goals_data.get("target_topics_daily", 3)
        target_quiz = goals_data.get("target_quizzes_weekly", 4)
        reminders_on = goals_data.get("reminders_enabled", True)
        remind_time = goals_data.get("reminder_time", "19:00")

        # Dynamic encouragement without shaming
        completed_count = len(prog.completed_topics or [])
        streak = min(7, max(1, completed_count + 1))
        msg = "Steady progress! Every small topic brings you closer to clinical mastery."
        if streak >= 5:
            msg = f"Incredible discipline! {streak}-day continuous study habit."

        return StudentGoalSettingsOut(
            target_minutes_daily=target_min,
            target_topics_daily=target_top,
            target_quizzes_weekly=target_quiz,
            reminders_enabled=reminders_on,
            reminder_time=remind_time,
            completed_minutes_today=35,
            completed_topics_today=min(target_top, max(1, len(prog.recently_viewed_topics or []))),
            current_streak_days=streak,
            streak_encouragement=msg
        )

    @classmethod
    async def update_goals(
        cls,
        db: AsyncSession,
        user: User,
        data: StudentGoalSettingsIn
    ) -> StudentGoalSettingsOut:
        prog = await cls.get_or_create_student_progress(db, user)
        new_goals = {
            "target_minutes_daily": data.target_minutes_daily,
            "target_topics_daily": data.target_topics_daily,
            "target_quizzes_weekly": data.target_quizzes_weekly,
            "reminders_enabled": data.reminders_enabled,
            "reminder_time": data.reminder_time
        }
        prog.learning_goals = new_goals
        prog.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(prog)
        return await cls.get_goals(db, user)

    # ============================================================
    # 7. CONSOLIDATED PERSONALIZED STUDENT DASHBOARD VIEW
    # ============================================================

    @classmethod
    async def get_personalized_dashboard(
        cls,
        db: AsyncSession,
        user: User
    ) -> StudentPersonalizedDashboardOut:
        prog = await cls.get_or_create_student_progress(db, user)

        # 1. Student metadata
        res_profile = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = res_profile.scalar_one_or_none()
        student_name = profile.full_name if (profile and profile.full_name) else (user.email.split("@")[0].title() if user.email else "Ayurveda Scholar")
        acad_year = prog.current_prof_year or (profile.current_year if (profile and profile.current_year) else "4th Prof")

        # 2. Overall completion and subjects progress
        all_topics = RAW_BAMS_TOPICS
        total_topics_count = len(all_topics)
        completed_set = set(prog.completed_topics or [])
        bookmarked_set = set(prog.bookmarked_topics or [])

        overall_pct = round((len(completed_set) / max(1, total_topics_count)) * 100.0, 1)

        subjects_progress = []
        for s in RAW_BAMS_SUBJECTS:
            s_topics = [t for t in all_topics if t["subjectId"] == s["id"]]
            c_count = sum(1 for t in s_topics if t["id"] in completed_set)
            pct = round((c_count / max(1, len(s_topics))) * 100.0, 1)
            subjects_progress.append({
                "id": s["id"],
                "code": s["code"],
                "name": s["name"],
                "sanskritName": s["sanskritName"],
                "professionalYear": s["professionalYear"],
                "iconName": s["iconName"],
                "totalTopics": len(s_topics),
                "completedTopics": c_count,
                "completionPct": pct,
                "totalHours": s["totalHours"]
            })

        # 3. Today's study plan (structured NCISM routine)
        today_plan = [
            {
                "id": "tp-1",
                "time": "07:00 - 08:00",
                "subject": "Samhita & Shloka Recitation",
                "topic": "Charaka Sutrasthana Chapter 11 (Treshaniya Adhyaya)",
                "type": "RECITATION",
                "completed": True,
                "link": "/bams/subjects/sub-samhita-1"
            },
            {
                "id": "tp-2",
                "time": "10:00 - 12:30",
                "subject": "Panchakarma Clinical Ward",
                "topic": "Snehana & Swedana Vidhi (Purvakarma Protocol)",
                "type": "CLINICAL",
                "completed": False,
                "link": "/bams/subjects/sub-panchakarma"
            },
            {
                "id": "tp-3",
                "time": "15:00 - 16:30",
                "subject": "Dravyaguna Vijnana",
                "topic": "Rasa Panchaka of Deepana & Pachana Herbs",
                "type": "THEORY",
                "completed": False,
                "link": "/bams/subjects/sub-dravyaguna"
            },
            {
                "id": "tp-4",
                "time": "19:30 - 20:15",
                "subject": "Interactive Active Recall",
                "topic": "Adaptive MCQ Diagnostic & 107 Marma Flashcards",
                "type": "SELF_ASSESSMENT",
                "completed": False,
                "link": "/student/quiz"
            }
        ]

        # 4. Upcoming exams & clinical vivas
        upcoming_exams = [
            {
                "id": "exam-1",
                "title": "NCISM 4th Professional University Theory Exam",
                "date": "2026-12-10",
                "days_remaining": 42,
                "type": "UNIVERSITY_THEORY",
                "venue": "Ayurveda Medical College Hall"
            },
            {
                "id": "exam-2",
                "title": "Panchakarma Practical Bedside & Oral Viva",
                "date": "2026-11-26",
                "days_remaining": 28,
                "type": "CLINICAL_VIVA",
                "venue": "Hospital Inpatient Ward"
            },
            {
                "id": "exam-3",
                "title": "Dravyaguna Herbarium & Spotting Assessment",
                "date": "2026-11-12",
                "days_remaining": 14,
                "type": "PRACTICAL_SPOTTING",
                "venue": "Department Pharmacognosy Lab"
            }
        ]

        # 5. Pending revision tasks (bookmarked & high yield)
        pending_revisions = []
        for t in all_topics:
            if t["id"] in bookmarked_set or (t["examHighYield"] and t["id"] not in completed_set):
                pending_revisions.append({
                    "topic_id": t["id"],
                    "title": t["topicTitle"],
                    "subject_id": t["subjectId"],
                    "subject_name": t["subjectName"],
                    "is_bookmarked": t["id"] in bookmarked_set,
                    "exam_high_yield": t["examHighYield"]
                })
        pending_revisions = pending_revisions[:6]

        # 6. Saved notes
        res_notes = await db.execute(
            select(AINote).where(AINote.user_id == user.id).order_by(AINote.updated_at.desc())
        )
        all_notes = list(res_notes.scalars().all())
        saved_notes_recent = [
            {
                "id": str(n.id),
                "title": n.title,
                "subject": n.subject,
                "tags": n.tags,
                "updated_at": n.updated_at.isoformat() if n.updated_at else datetime.now(timezone.utc).isoformat()
            }
            for n in all_notes[:3]
        ]

        # 7. Quiz performance
        res_attempts = await db.execute(
            select(AIQuizAttempt).where(AIQuizAttempt.user_id == user.id).order_by(AIQuizAttempt.completed_at.desc()).limit(10)
        )
        attempts = list(res_attempts.scalars().all())
        avg_score = round(sum(a.score_percentage for a in attempts) / len(attempts), 1) if attempts else 78.5

        quiz_perf = {
            "total_quizzes_taken": len(attempts) if attempts else 4,
            "average_score_pct": avg_score,
            "strong_subjects": ["Panchakarma", "Samhita Siddhanta"],
            "weak_subjects": ["Roganidana Shat-Kriya Kala", "Dravyaguna Phyto-markers"],
            "recent_score": attempts[0].score_percentage if attempts else 82.0
        }

        # 8. Goals & Streak
        goals = await cls.get_goals(db, user)

        # 9. Milestones
        milestones = [
            {
                "id": "m1",
                "title": "Syllabus Explorer",
                "description": "Reviewed curriculum across 3 BAMS professional years",
                "achieved": True,
                "icon": "Compass"
            },
            {
                "id": "m2",
                "title": "Clinical Observer",
                "description": "Logged your first practical clinical posting reflection",
                "achieved": len(prog.clinical_logbook_entries or []) > 0,
                "icon": "Stethoscope"
            },
            {
                "id": "m3",
                "title": "Active Recall Scholar",
                "description": "Reviewed 5+ Ayurvedic active recall flashcards",
                "achieved": len(prog.flashcard_mastery or {}) >= 5,
                "icon": "Sparkles"
            },
            {
                "id": "m4",
                "title": "Quiz Master",
                "description": "Achieved 80%+ score on an adaptive diagnostic test",
                "achieved": avg_score >= 80.0,
                "icon": "Award"
            }
        ]

        # 10. Smart recommendations
        recommendations = await cls.get_smart_recommendations(db, user)

        return StudentPersonalizedDashboardOut(
            student_name=student_name,
            academic_year=acad_year,
            overall_completion_pct=overall_pct,
            topics_completed_count=len(completed_set),
            total_topics_count=total_topics_count,
            bookmarked_count=len(bookmarked_set),
            subjects_progress=subjects_progress,
            today_study_plan=today_plan,
            upcoming_exams=upcoming_exams,
            pending_revisions=pending_revisions,
            recently_viewed_topics=prog.recently_viewed_topics or [],
            saved_notes_count=len(all_notes),
            saved_notes_recent=saved_notes_recent,
            quiz_performance=quiz_perf,
            goals=goals,
            milestones=milestones,
            recommendations=recommendations
        )

