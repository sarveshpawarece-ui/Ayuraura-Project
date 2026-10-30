/**
 * BAMS LEARNING ECOSYSTEM & REMEDIATION ENGINE
 * Authoritative NCISM Curriculum, Cross-Domain Knowledge Graph & Remediation Pathways
 */

export interface BamsSubject {
  id: string;
  code: string;
  name: string;
  sanskritName: string;
  professionalYear: "1st Prof" | "2nd Prof" | "3rd Prof" | "4th Prof" | "Internship";
  iconName: string;
  totalHours: number;
  description: string;
  unitsCount: number;
  topicsCount: number;
  linkedSkillName: string;
  targetCareerRelevance: string[];
}

export interface BamsTopic {
  id: string;
  subjectId: string;
  subjectName: string;
  unitNumber: number;
  unitTitle: string;
  topicTitle: string;
  difficulty: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "CLINICAL";
  learningObjectives: string[];
  explanation: string;
  sanskritShloka: {
    devanagari: string;
    iast: string;
    englishMeaning: string;
    sourceTreatise: string;
    clinicalPearl: string;
  };
  diagram: {
    title: string;
    description: string;
    educationalContext: string;
    altText: string;
    diagramType: "ANATOMICAL" | "PROCEDURAL_FLOW" | "FORMULATION_MATRIX" | "DIAGNOSTIC_ALGORITHM";
    visualSvgType: "basti_flow" | "dosha_cycle" | "herbal_extraction" | "marma_points" | "nadi_radial";
  };
  keyRevisionPoints: string[];
  examHighYield: boolean;
}

export interface BamsCaseStudy {
  id: string;
  caseIdCode: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: "Basic" | "Intermediate" | "Advanced" | "Complex/Integrated";
  patientDemographics: {
    age: number;
    gender: "Male" | "Female" | "Other";
    occupation: string;
    prakriti: string;
  };
  presentingComplaints: string[];
  historyOfPresentIllness: string;
  clinicalFindings: {
    nadi: string;
    mala: string;
    mutra: string;
    jihwa: string;
    shabda: string;
    sparsha: string;
    drik: string;
    akriti: string;
  };
  ayurvedicAssessment: {
    hetu: string;
    dosha: string;
    dushya: string;
    agni: string;
    ama: string;
    srotasInvolved: string;
    vyadhiNidana: string;
  };
  differentialConsiderations: string[];
  learningObjectives: string[];
  discussionQuestions: {
    question: string;
    modelAnswer: string;
    pedagogicalExplanation: string;
  }[];
  recommendedIntervention: string;
  caseFingerprintHash: string;
  verifiedAuthor: string;
  educationalDisclaimer: string;
}

export interface ExamPrepModule {
  id: string;
  examType: "University Examination" | "Internal / Term" | "Viva Voce" | "Practical Examination" | "Theory (Long/Short Answer)" | "MCQ / NEXT-Oriented";
  subject: string;
  topic: string;
  questionTitle: string;
  marksWeightage: number;
  answerWritingFramework: {
    step1_Prastavana: string;
    step2_ShlokaNirupana: string;
    step3_HetuLingaMatrix: string;
    step4_ModernCorrelation: string;
    step5_ClinicalUpasamhara: string;
  };
  mnemonic: {
    acronym: string;
    expansion: string;
    retentionContext: string;
  };
}

export interface SmartTimetableBlock {
  id: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
  category: "COLLEGE_LECTURE" | "CLINICAL_PRACTICAL" | "INTERNSHIP_POSTING" | "WEAK_TOPIC_STUDY" | "REVISION_BLOCK" | "MOCK_EXAM_PRACTICE" | "FITNESS_WELLNESS" | "REST_MEAL";
  title: string;
  details: string;
  isFixedCommitment: boolean;
  priorityTopic?: string;
}

export interface RemediationPathway {
  weakTopicId: string;
  topicTitle: string;
  subjectName: string;
  currentMasteryPct: number;
  targetMasteryPct: number;
  step1_Explanation: {
    coreConcept: string;
    classicalShloka: {
      devanagari: string;
      iast: string;
      meaning: string;
      reference: string;
    };
    clinicalPearls: string[];
  };
  step2_Diagram: {
    title: string;
    caption: string;
    altText: string;
    svgSchema: string;
  };
  step3_VoiceReaderScript: string;
  step4_PracticeQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  step5_TargetedCaseStudyId: string;
  step6_RelevantExpertSession: {
    sessionId: string;
    sessionTitle: string;
    expertName: string;
    expertTitle: string;
    scheduledOrRecorded: "RECORDED_LECTURE" | "UPCOMING_LIVE";
    durationMins: number;
  };
  step7_RelevantDoctorProfile: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    experienceYears: number;
    clinicLocation: string;
  };
  estimatedScoreBoost: number;
}

// ============================================================
// 1. MASTER NCISM BAMS CURRICULUM SUBJECTS
// ============================================================

export const BAMS_SUBJECTS: BamsSubject[] = [
  // 1st Professional
  {
    id: "sub-rachana",
    code: "BAMS-101",
    name: "Rachana Sharir",
    sanskritName: "रचना शारीरम् (Human Anatomy)",
    professionalYear: "1st Prof",
    iconName: "Brain",
    totalHours: 240,
    description: "Macroscopic and microscopic structure of the human body, Marma Sharir, Srotas, and embryology per Ayurvedic and modern anatomical sciences.",
    unitsCount: 6,
    topicsCount: 28,
    linkedSkillName: "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
    targetCareerRelevance: ["Ayurvedic Clinical Specialist", "Surgical Assistant (Shalya)"]
  },
  {
    id: "sub-kriya",
    code: "BAMS-102",
    name: "Kriya Sharir",
    sanskritName: "क्रिया शारीरम् (Human Physiology)",
    professionalYear: "1st Prof",
    iconName: "Activity",
    totalHours: 240,
    description: "Functional dynamics of Dosha, Dhatu, Mala, Agni, Prakriti Pariksha, and biological rhythms in health and pathophysiology.",
    unitsCount: 5,
    topicsCount: 24,
    linkedSkillName: "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
    targetCareerRelevance: ["Prakriti & Wellness Consultant", "Ayurvedic Clinical Specialist"]
  },
  {
    id: "sub-samhita-1",
    code: "BAMS-103",
    name: "Samhita Siddhanta & Sanskrit",
    sanskritName: "संहिता सिद्धान्तः एवं संस्कृतम्",
    professionalYear: "1st Prof",
    iconName: "BookOpen",
    totalHours: 180,
    description: "Classical principles from Ashtanga Hridaya (Sutrasthana) and fundamental Padartha Vijnana philosophy.",
    unitsCount: 4,
    topicsCount: 20,
    linkedSkillName: "Ayurveda Domain Knowledge",
    targetCareerRelevance: ["Academic Faculty / Researcher", "Classical Physician"]
  },

  // 2nd Professional
  {
    id: "sub-dravyaguna",
    code: "BAMS-201",
    name: "Dravyaguna Vijnana",
    sanskritName: "द्रव्यगुण विज्ञानम् (Materia Medica & Pharmacology)",
    professionalYear: "2nd Prof",
    iconName: "Sprout",
    totalHours: 260,
    description: "Pharmacognosy, medicinal plant identification, Rasa-Panchaka (Rasa, Guna, Virya, Vipaka, Prabhava), and botanical pharmacology.",
    unitsCount: 6,
    topicsCount: 32,
    linkedSkillName: "Dravyaguna & Herbal Identification",
    targetCareerRelevance: ["Herbal Formulation Scientist", "Raw Material QC Specialist", "Ayurvedic Pharmacist"]
  },
  {
    id: "sub-rasashastra",
    code: "BAMS-202",
    name: "Rasashastra & Bhaishajya Kalpana",
    sanskritName: "रसशास्त्र एवं भैषज्य कल्पना (Formulations & Pharmacy)",
    professionalYear: "2nd Prof",
    iconName: "Sparkles",
    totalHours: 260,
    description: "Mineral, metal processing, Shodhana, Marana, Bhasma preparation, and classical secondary formulations (Swarasa, Kwatha, Sneha Kalpana).",
    unitsCount: 6,
    topicsCount: 30,
    linkedSkillName: "Rasashastra & Bhasma Preparation",
    targetCareerRelevance: ["Formulation Scientist", "Pharma R&D Director", "Quality Assurance Manager"]
  },
  {
    id: "sub-roganidana",
    code: "BAMS-203",
    name: "Roga Nidana & Vikriti Vijnana",
    sanskritName: "रोग निदान एवं विकृति विज्ञानम् (Pathology & Diagnostics)",
    professionalYear: "2nd Prof",
    iconName: "Stethoscope",
    totalHours: 240,
    description: "Nidana Panchaka, Ashtavidha & Dashavidha Pariksha, Nadi Pariksha, and integration with modern clinical lab diagnostics.",
    unitsCount: 5,
    topicsCount: 26,
    linkedSkillName: "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
    targetCareerRelevance: ["Ayurvedic Clinical Specialist", "Hospital Resident", "Diagnostic Specialist"]
  },

  // 3rd Professional
  {
    id: "sub-swasthavritta",
    code: "BAMS-301",
    name: "Swasthavritta & Yoga",
    sanskritName: "स्वस्थवृत्तम् एवं योगः (Preventive Medicine)",
    professionalYear: "3rd Prof",
    iconName: "Compass",
    totalHours: 220,
    description: "Dinacharya, Ritucharya, Sadvritta, community health, dietetics, and therapeutic Yoga systems.",
    unitsCount: 5,
    topicsCount: 22,
    linkedSkillName: "Ayurveda Domain Knowledge",
    targetCareerRelevance: ["Public Health Officer", "Ayurvedic Wellness Consultant"]
  },
  {
    id: "sub-prasuti",
    code: "BAMS-302",
    name: "Prasuti Tantra & Stri Roga",
    sanskritName: "प्रसूति तन्त्र एवं स्त्री रोग (Obstetrics & Gynecology)",
    professionalYear: "3rd Prof",
    iconName: "Users",
    totalHours: 240,
    description: "Garbhadhana, Antenatal Garbhini Paricharya, labor management, and Ayurvedic management of gynaecological disorders.",
    unitsCount: 6,
    topicsCount: 25,
    linkedSkillName: "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
    targetCareerRelevance: ["Ayurvedic Gynaecologist", "Maternal Care Specialist"]
  },

  // 4th Professional
  {
    id: "sub-kayachikitsa",
    code: "BAMS-401",
    name: "Kayachikitsa",
    sanskritName: "कायचिकित्सा (Internal Medicine)",
    professionalYear: "4th Prof",
    iconName: "Flame",
    totalHours: 300,
    description: "Comprehensive systemic internal medicine: Jwara, Amavata, Prameha, Rajayakshma, and chronic disease clinical management.",
    unitsCount: 7,
    topicsCount: 36,
    linkedSkillName: "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)",
    targetCareerRelevance: ["Senior Ayurvedic Physician", "Clinical Director", "Hospital Consultant"]
  },
  {
    id: "sub-panchakarma",
    code: "BAMS-402",
    name: "Panchakarma",
    sanskritName: "पञ्चकर्म (Detoxification & Cleansing Protocols)",
    professionalYear: "4th Prof",
    iconName: "Zap",
    totalHours: 280,
    description: "Purvakarma (Snehana/Swedana), Pradhanakarma (Vamana, Virechana, Basti, Nasya, Raktamokshana), and Paschatkarma Samsarjana Krama.",
    unitsCount: 6,
    topicsCount: 30,
    linkedSkillName: "Panchakarma Procedure Protocols",
    targetCareerRelevance: ["Panchakarma Consultant", "Panchakarma Center Director", "Clinical Specialist"]
  },
  {
    id: "sub-shalya",
    code: "BAMS-403",
    name: "Shalya Tantra",
    sanskritName: "शल्य तन्त्रम् (Surgical Techniques & Para-Surgical)",
    professionalYear: "4th Prof",
    iconName: "Target",
    totalHours: 260,
    description: "Ksharasutra management of anorectal diseases, Agnikarma, Jalaukavacharana (Leech therapy), and wound healing.",
    unitsCount: 6,
    topicsCount: 26,
    linkedSkillName: "Clinical Trial Protocol Design & GCP Guidelines",
    targetCareerRelevance: ["Ksharasutra Specialist", "Anorectal Surgeon", "Wound Care Specialist"]
  }
];

// ============================================================
// 2. MASTER HIGH-YIELD TOPICS & VISUAL DIAGRAM DATA
// ============================================================

export const MASTER_BAMS_TOPICS: BamsTopic[] = [
  {
    id: "topic-panchakarma-basti",
    subjectId: "sub-panchakarma",
    subjectName: "Panchakarma",
    unitNumber: 4,
    unitTitle: "Pradhana Karma — Basti Kalpana",
    topicTitle: "Basti Protocols: Niruha vs Anuvasana Administration & Vyapat Management",
    difficulty: "CLINICAL",
    learningObjectives: [
      "Understand why Basti is hailed as Ardha Chikitsa (half of all clinical medicine)",
      "Master the formulation ratio of Niruha Basti (Makshika, Lavana, Sneha, Kalka, Kwatha)",
      "Differentiate Anuvasana Basti retention times and manage non-retention complications",
      "Correlate trans-colonic drug absorption with systemic neuro-endocrine regulation"
    ],
    explanation: "Basti Karma is considered the supreme therapy for all Vata-predominant disorders. Delivered via the rectum into the Pakvashaya (the primary seat of Vata), Basti works systemically from the colon up to the head, drawing morbid humors out like sunlight draws moisture from the earth. Niruha (evacuating decoction enema) and Anuvasana (unctuous oil enema) are administered cyclically in Karma Basti (30 days), Kala Basti (16 days), or Yoga Basti (8 days) regimens.",
    sanskritShloka: {
      devanagari: "बस्तिर्वाते च पित्ते च कफे चोक्तो विधारिते ।\nसर्वदोषहरो यस्मात् तस्मादर्थचिकित्सितम् ॥",
      iast: "bastirvāte ca pitte ca kaphe cokto vidhārite |\nsarvadoṣaharo yasmāt tasmādardhacikitsitam ||",
      englishMeaning: "Basti is indicated in morbid states of Vata, Pitta, and Kapha alike; because it eliminates all vitiated doshas, it is regarded as half (or the whole) of all therapeutics.",
      sourceTreatise: "Charaka Samhita, Siddhisthana, Chapter 1, Verse 38",
      clinicalPearl: "Always mix Niruha ingredients in strict classical sequence: 1. Honey (Makshika) + 2. Rock salt (Saindhava), then 3. Oil (Sneha), followed by 4. Fine paste (Kalka), and finally 5. Decoction (Kwatha) until completely emulsified."
    },
    diagram: {
      title: "Classical Emulsification & Delivery Matrix of Niruha Basti",
      description: "Visual step-by-step preparation flow of Makshika → Saindhava → Sneha → Kalka → Kwatha followed by Basti Putaka assembly and Netra insertion angle.",
      educationalContext: "Demonstrates physical chemistry of creating a stable oil-in-water micro-emulsion for mucosal uptake in the sigmoid colon.",
      altText: "Flowchart showing sequential mixing of 5 Niruha ingredients yielding homogenous emulsion",
      diagramType: "PROCEDURAL_FLOW",
      visualSvgType: "basti_flow"
    },
    keyRevisionPoints: [
      "Mixing sequence: Honey → Salt → Fat → Herbal Paste → Decoction (M-S-S-K-K)",
      "Yoga Basti schedule (8 enemas): 1 Anuvasana + 3 Alternate Niruha/Anuvasana + 1 final Anuvasana",
      "Pratyagamana Kala: Niruha should return within 1 Muhurta (48 minutes); if delayed, administer Vatahara Kashaya with Gomutra",
      "Contraindications: Acute indigestion (Ajeerna), bleeding piles, severe diarrhea, unconsciousness"
    ],
    examHighYield: true
  },
  {
    id: "topic-dravyaguna-rasapanchaka",
    subjectId: "sub-dravyaguna",
    subjectName: "Dravyaguna Vijnana",
    unitNumber: 2,
    unitTitle: "Fundamental Pharmacodynamics",
    topicTitle: "Rasa-Panchaka: Interplay of Taste, Post-Digestive Effect, and Potency",
    difficulty: "INTERMEDIATE",
    learningObjectives: [
      "Map 6 Rasas to Bhautika elemental constitution and Dosha modulation",
      "Differentiate Virya (Sheeta vs Ushna) and Vipaka (Madhura, Amla, Katu)",
      "Explain Prabhava (specific pharmacological action defying normal rules)"
    ],
    explanation: "Ayurvedic pharmacology operates on five interlinked dynamic principles: Rasa (primary gustatory taste), Guna (20 physicochemical attributes), Virya (thermodynamic potency), Vipaka (post-digestive transformation), and Prabhava (exceptional specific affinity). Understanding this matrix allows precise drug substitution and tailored polyherbal formulation.",
    sanskritShloka: {
      devanagari: "रसा रसाग्निजननाद् द्रव्याणां कर्महेतवः ।\nवीर्यं तु शक्तिरुत्कृष्टा विपाकोऽन्तकरः स्मृतः ॥",
      iast: "rasā rasāgnijananād dravyāṇāṃ karmahetavaḥ |\nvīryaṃ tu śaktirutkṛṣṭā vipāko'ntakaraḥ smṛtaḥ ||",
      englishMeaning: "Rasas serve as the initial cause of medicinal action; Virya represents the potent active energy, while Vipaka governs final metabolic transformation.",
      sourceTreatise: "Ashtanga Hridaya, Sutrasthana, Chapter 9",
      clinicalPearl: "Guduchi is bitter (Tikta) yet possesses Ushna Virya and Madhura Vipaka, making it a tridoshic rasayana without aggravating Vata."
    },
    diagram: {
      title: "Rasa-Panchaka Hexagonal Dynamic Balance Matrix",
      description: "Hexagonal chart linking 6 tastes (Madhura, Amla, Lavana, Tikta, Katu, Kashaya) to elemental components and Dosha pacification.",
      educationalContext: "Essential NCISM pharmacology reference for formulation design.",
      altText: "Hexagonal pharmacology diagram mapping Rasas to Doshas and thermal potency",
      diagramType: "FORMULATION_MATRIX",
      visualSvgType: "dosha_cycle"
    },
    keyRevisionPoints: [
      "Madhura, Amla, Lavana alleviate Vata; Tikta, Ushna, Kashaya alleviate Kapha; Kashaya, Tikta, Madhura pacify Pitta",
      "Vipaka transforms all food into Madhura, Amla, or Katu post-digestion",
      "Prabhava explains why Danti and Chitraka have identical Rasa-Guna-Virya-Vipaka yet Danti is a purgative while Chitraka is not"
    ],
    examHighYield: true
  },
  {
    id: "topic-rachana-marma",
    subjectId: "sub-rachana",
    subjectName: "Rachana Sharir",
    unitNumber: 5,
    unitTitle: "Marma Sharir (Vital Anatomical Sites)",
    topicTitle: "107 Marma Classification, Structural Composition & Sadhyo-Pranahara Dynamics",
    difficulty: "ADVANCED",
    learningObjectives: [
      "Classify 107 Marmas by regional location, tissue dominance (Mamsa, Sira, Snayu, Asthi, Sandhi), and prognosis (Parinama)",
      "Correlate Sadhyo-Pranahara (instant fatal) Marmas with neuro-vascular junctions",
      "Apply Marma Chikitsa principles in surgical safety and therapeutic stimulation"
    ],
    explanation: "Sushruta identifies 107 Marmas where Mamsa, Sira, Snayu, Asthi, and Sandhi convene and where Prana naturally resides. Any trauma or incision over these vital hubs causes intense pain, disability, or rapid mortality. They are categorized prognostically into Sadhyo-Pranahara (19), Kalantara-Pranahara (33), Vishalyaghna (3), Vaikalyakara (44), and Rujakara (8).",
    sanskritShloka: {
      devanagari: "मर्माणि नाम मांससिरास्नाय्वस्थिसन्धीनां सन्निपाताः,\nतेषु स्वभावत एव विशषेण प्राणास्तिष्ठन्ति ॥",
      iast: "marmāṇi nāma māṃsasirāsnāyvasthisandhīnāṃ sannipātāḥ,\nteṣu svabhāvata eva viśeṣeṇa prāṇāstiṣṭhanti ||",
      englishMeaning: "Marmas are anatomical confluences of muscle, vessels, ligaments, bones, and joints, wherein the vital lifeforce (Prana) specially resides by nature.",
      sourceTreatise: "Sushruta Samhita, Sharirasthana, Chapter 6, Verse 22",
      clinicalPearl: "Hridaya, Basti, and Shira are the Tri-Marma (3 supreme vital organs); trauma to Shira causes hemiplegia, facial palsy, or instantaneous loss of consciousness."
    },
    diagram: {
      title: "Tri-Marma and 107 Vital Anatomical Convergence Map",
      description: "Anatomical schematic highlighting the distribution of 107 Marmas across extremities, thorax, abdomen, and head-and-neck.",
      educationalContext: "Crucial for both university viva voce and clinical surgical safety.",
      altText: "Body map diagram illustrating Marma locations and prognosis color-coding",
      diagramType: "ANATOMICAL",
      visualSvgType: "marma_points"
    },
    keyRevisionPoints: [
      "Total Marmas: 107 (11 in each limb = 44, 12 in chest & abdomen, 14 in back, 37 in head & neck)",
      "Prognosis: Sadhyo-Pranahara (fatal in 1-7 days), Kalantara (fatal in 15-30 days), Vishalyaghna (fatal on weapon extraction)",
      "Structural: 11 Mamsa, 41 Sira, 27 Snayu, 8 Asthi, 20 Sandhi Marmas"
    ],
    examHighYield: true
  }
];

// ============================================================
// 3. MASTER EDUCATIONAL CLINICAL CASE STUDIES
// ============================================================

export const MASTER_BAMS_CASES: BamsCaseStudy[] = [
  {
    id: "case-amavata-panchakarma",
    caseIdCode: "AYUR-CASE-2026-001",
    title: "Refractory Amavata (Rheumatoid Spectrum) Presenting for Vaitarana Basti Protocol",
    subject: "Panchakarma",
    topic: "Basti Protocols",
    difficulty: "Advanced",
    patientDemographics: {
      age: 42,
      gender: "Female",
      occupation: "Primary School Teacher",
      prakriti: "Vata-Kapha"
    },
    presentingComplaints: [
      "Bilateral symmetrical wrist, PIP, and knee joint swelling with morning stiffness > 2 hours for 9 months",
      "Vrischika Damshavat Vedana (severe stinging joint pain exacerbated in cold, humid weather)",
      "Severe Agnimandya (loss of appetite), Gaurava (heaviness), and Angamarda (body ache)",
      "Refractory to oral NSAIDs and initial outpatient herbal decoctions"
    ],
    historyOfPresentIllness: "Patient developed insidious onset pain in smaller joints following an episode of acute viral pharyngitis with subsequent irregular dietetics (Adhyashana and Guru-Snigdha Ahara) and daytime sleep (Divaswapna).",
    clinicalFindings: {
      nadi: "Manda, Gambhira, Saama (Heavy, deep pulse indicating systemic endotoxins)",
      mala: "Vibandha with Ama-yukta (foul-smelling, sticky, incomplete evacuation)",
      mutra: "Aavilata (turbid) without burning",
      jihwa: "Lipta (thick white furred coating indicating Ama)",
      shabda: "Prakrita (Normal speech)",
      sparsha: "Ushna over inflamed joints without active erythema",
      drik: "Alasya / dull sclera",
      akriti: "Madhyama with observable antalgic gait"
    },
    ayurvedicAssessment: {
      hetu: "Viruddhadhara, Divaswapna, Vyayamavarjita (sedentary after heavy meals)",
      dosha: "Vata-Kapha aggravated; Pittanubandha at articular sites",
      dushya: "Rasa, Asthi, Sandhi, Snayu",
      agni: "Jatharagnimandya leading to Dhatvagnimandya",
      ama: "Teevra Ama (circulating toxic macromolecular complexes)",
      srotasInvolved: "Rasavaha and Asthivaha Srotas (Sanga & Vimargagamana)",
      vyadhiNidana: "Amavata (Madhyama Rogamarga)"
    },
    differentialConsiderations: [
      "Vatarakta (Gouty arthritis / hyperuricemia - predominantly starts at great toe with burning)",
      "Sandhigata Vata (Osteoarthritis - degenerative, no systemic Ama, pain worsens with movement)",
      "Kroshtukashirsha (Synovial knee involvement predominantly post-trauma)"
    ],
    learningObjectives: [
      "Recognize clinical markers of Saama vs Niraama Vata presentation",
      "Formulate step-wise protocol: Deepana-Pachana → Valuka Sweda → Vaitarana Basti",
      "Avoid premature Snehana (oiling) which aggravates Ama like water on an unbaked clay pot"
    ],
    discussionQuestions: [
      {
        question: "Why is traditional Abhyanga (oil massage) strictly contraindicated in the acute phase of Amavata?",
        modelAnswer: "In acute Amavata, Ama is actively lodged in the joints and channels. Administering Snigdha Abhyanga further clogs the srotas and fuels Ama formation, intensifying swelling and pain. Instead, Ruksha Sweda (such as Valuka Sweda) must precede any unctuous therapy.",
        pedagogicalExplanation: "Charaka explicitly warns: 'Snehana in Ama acts like adding water to an unbaked clay vessel, causing dissolution and worse obstruction.'"
      },
      {
        question: "Detail the composition and rationale of Vaitarana Basti for this patient.",
        modelAnswer: "Vaitarana Basti consists of Guda (Jaggery) 30g, Saindhava (Rock salt) 10g, Chincha (Tamarind pulp paste) 40g, Taila (Brihat Saindhavadya Taila) 60ml, and Gomutra (Purified cow urine) 250ml. Its alkaline, scraping (Lekhana), and penetrating (Tikshna) properties dissolve viscous Ama in the Pakvashaya.",
        pedagogicalExplanation: "The sour and alkaline combination rapidly liquefies Kapha-Ama complexes without drying the underlying Vata excessively."
      }
    ],
    recommendedIntervention: "1. Shunthi-Guduchi Kwatha 40ml bid with castor oil (Eranda Taila) for 5 days. 2. Valuka Sweda over affected joints. 3. Vaitarana Basti course of 8 days (Yoga Basti pattern) followed by Rasasindhoora and Simhanada Guggulu.",
    caseFingerprintHash: "SHA256_AMAVATA_VAITARANA_BATCH_42_PANCHAKARMA_2026",
    verifiedAuthor: "Prof. Dr. Rajeshwari Nair, MD (Ayu), Ph.D. (Panchakarma)",
    educationalDisclaimer: "Educational Case Study Only. Formulated strictly for academic training of BAMS undergraduates and clinical interns under NCISM curriculum guidelines. Not intended as personal medical diagnosis."
  },
  {
    id: "case-tamaka-shwasa",
    caseIdCode: "AYUR-CASE-2026-002",
    title: "Tamaka Shwasa (Bronchial Asthma) Protocol: Vamana vs Virechana Clinical Decision",
    subject: "Kayachikitsa",
    topic: "Pranavaha Sroto-Vikara",
    difficulty: "Intermediate",
    patientDemographics: {
      age: 28,
      gender: "Male",
      occupation: "IT Software Engineer",
      prakriti: "Vata-Pitta"
    },
    presentingComplaints: [
      "Paroxysmal breathlessness and wheezing during midnight and early dawn hours",
      "Kasa (cough) with sticky white phlegm, temporarily relieved by sitting upright (Asino Labhate Saukhyam)",
      "Triggered by dust exposure, cold drinks, and night shifts"
    ],
    historyOfPresentIllness: "Three-year history of episodic dyspnea worsening every winter season. Frequent use of bronchodilator inhalers with diminishing relief periods.",
    clinicalFindings: {
      nadi: "Kapha-Vataja, Chanchala during acute episodes",
      mala: "Prakrita",
      mutra: "Prakrita",
      jihwa: "Mild white coat",
      shabda: "Ghurghuruka (audible rhonchi)",
      sparsha: "Sheeta over extremities",
      drik: "Anxious eyes during dyspnea",
      akriti: "Krisha (lean physique)"
    },
    ayurvedicAssessment: {
      hetu: "Sheetashana, Rajas/Dhuma sevana, Raja-Ratri-Jagarana",
      dosha: "Vata (Prana & Udana) obstructed by Kapha",
      dushya: "Pranavaha Srotas, Rasa Dhatu",
      agni: "Vishamagni",
      ama: "Madhyama",
      srotasInvolved: "Pranavaha and Annavaha Srotas",
      vyadhiNidana: "Tamaka Shwasa (Santarpana-uttha)"
    },
    differentialConsiderations: [
      "Kshudra Shwasa (Exertional dyspnea without paroxysm)",
      "Chhinna Shwasa (Cheyne-Stokes breathing / terminal resp failure)",
      "Urdhva Shwasa (Prolonged expiration with eye upturning)"
    ],
    learningObjectives: [
      "Identify classical symptom triad: Ghurghuruka (wheezing), Asino Labhate Saukhyam (orthopnea), and Kricchrāt Shleshma Moksha (difficult expectoration)",
      "Determine when Virechana is preferred over Vamana in lean, Vata-predominant asthmatics",
      "Formulate Sadyovamana vs Shamana emergency approach"
    ],
    discussionQuestions: [
      {
        question: "Why does Charaka recommend Virechana or Vata-Anulomana over strong Vamana in debilitated Tamaka Shwasa patients?",
        modelAnswer: "Vamana is the root therapy for Kapha, but Tamaka Shwasa is an Urdhvagata disease caused by Vata obstruction. In lean or debilitated patients, intense emesis may further aggravate Vata. Virechana creates downward momentum (Anulomana), clearing the chest without straining Vata.",
        pedagogicalExplanation: "Charaka Chikitsa 17 highlights: 'Tamake tu virechanam' — gentle purgation relieves the upward pressure on diaphragm."
      }
    ],
    recommendedIntervention: "1. Sadyo Snehana with Til Taila + Lavana external chest application followed by Nadi Sweda. 2. Haridra Khanda 5g with lukewarm water bid. 3. Shwasakasa Chintamani Rasa 125mg with honey. 4. Planned Mridu Virechana with Eranda Taila in milk.",
    caseFingerprintHash: "SHA256_TAMAKA_SHWASA_KAYACHIKITSA_28_2026",
    verifiedAuthor: "Dr. Arvind Kulkarni, MD (Kayachikitsa), Senior Physician",
    educationalDisclaimer: "Educational Case Study Only. Formulated strictly for academic training of BAMS undergraduates under NCISM curriculum guidelines."
  }
];

// ============================================================
// 4. EXAM PREPARATION & NCISM 5-STEP ANSWER FRAMEWORK
// ============================================================

export const MASTER_EXAM_PREP_MODULES: ExamPrepModule[] = [
  {
    id: "exam-panchakarma-basti-15m",
    examType: "University Examination",
    subject: "Panchakarma",
    topic: "Basti Kalpana",
    questionTitle: "Define Basti. Explain the classification of Basti according to Karmukata, Sankhya, and Ashaya. Describe Niruha Basti Netra and Putaka Nirmana with classical shloka references. (15 Marks)",
    marksWeightage: 15,
    answerWritingFramework: {
      step1_Prastavana: "Introduction defining Basti from Vachaspatyam and Charaka Siddhisthana. Explain anatomical delivery into rectum & sigmoid colon and systemic action via nervous system and vascular plexus.",
      step2_ShlokaNirupana: "Cite 'बस्तिर्वाते च पित्ते च...' (Charaka Siddhi 1/38) and explain why it governs 80 Vataja nanatmaja disorders.",
      step3_HetuLingaMatrix: "Systematic classification table: 1. By Action: Shodhana, Shamana, Lekhana, Brimhana; 2. By Number: Karma Basti (30), Kala Basti (16), Yoga Basti (8); 3. By Site: Pakvashayagata, Mutrashayagata (Uttara Basti), Vranagata.",
      step4_ModernCorrelation: "Correlate with trans-colonic pharmacokinetics, micro-biome modulation, short-chain fatty acids (SCFA) absorption, and the enteric nervous system (Gut-Brain Axis).",
      step5_ClinicalUpasamhara: "Summary of clinical precautions, signs of Samyak Snigdha / Samyak Niruha, and immediate management of non-retention or hyper-retention."
    },
    mnemonic: {
      acronym: "M-S-S-K-K",
      expansion: "Makshika (Honey) → Saindhava (Salt) → Sneha (Oil) → Kalka (Paste) → Kwatha (Decoction)",
      retentionContext: "Strict sequential addition during Niruha preparation to form micro-emulsion without phase separation."
    }
  },
  {
    id: "exam-dravyaguna-rasa-10m",
    examType: "Theory (Long/Short Answer)",
    subject: "Dravyaguna Vijnana",
    topic: "Rasa Vijnana",
    questionTitle: "Classify the Six Rasas according to their Panchamahabhuta constitution and explain their physiological action on Tridosha and Dhatus. (10 Marks)",
    marksWeightage: 10,
    answerWritingFramework: {
      step1_Prastavana: "Define Rasa as perceived by Rasanendriya (tongue) originating from Jala and Prithvi Mahabhuta during embryonic development.",
      step2_ShlokaNirupana: "Cite 'स्वाद्वम्ललवणकटुतिक्तकषायाख्याः षड् रसाः...' (Ashtanga Hridaya Sutra 1/14).",
      step3_HetuLingaMatrix: "Detailed matrix table connecting each of the 6 tastes with Mahabhutas, Doshic effect (Vata, Pitta, Kapha), and specific Dhatu nutrition.",
      step4_ModernCorrelation: "Correlate with taste receptor cells (TRCs), G-protein coupled receptors (T1R and T2R families), cephalic phase insulin release, and metabolic signaling.",
      step5_ClinicalUpasamhara: "Therapeutic clinical prescription rules based on dominant clinical stage (e.g. Tikta rasa in early Jwara for Ama digestion)."
    },
    mnemonic: {
      acronym: "M-A-L- pacifies Vata | T-K-K- pacifies Pitta | K-T-K- pacifies Kapha",
      expansion: "Madhura-Amla-Lavana (V-), Tikta-Kashaya-Madhura (P-), Katu-Tikta-Kashaya (K-)",
      retentionContext: "Quick triage rule during university theory and clinical viva examinations."
    }
  }
];

// ============================================================
// 5. SMART TIMETABLE SCHEDULE ENGINE
// ============================================================

export function generateSmartBamsSchedule(params: {
  collegeStart: string; // e.g. "09:00"
  collegeEnd: string;   // e.g. "16:00"
  hasInternship: boolean;
  internshipStart?: string; // e.g. "08:00"
  internshipEnd?: string;   // e.g. "14:00"
  weakTopics: string[]; // e.g. ["Panchakarma: Basti Protocols", "Dravyaguna: Rasa-Panchaka"]
  examDateDaysAway: number;
}): SmartTimetableBlock[] {
  const days: Array<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"> = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const schedule: SmartTimetableBlock[] = [];
  const primaryWeakTopic = params.weakTopics[0] || "Panchakarma: Basti Protocols";
  const secondaryWeakTopic = params.weakTopics[1] || "Dravyaguna: Rasa-Panchaka";

  days.forEach((day, idx) => {
    // 1. Morning Fitness / Dinacharya (Non-overlapping)
    schedule.push({
      id: `tt-${day}-dinacharya`,
      dayOfWeek: day,
      startTime: "06:30",
      endTime: "07:30",
      category: "FITNESS_WELLNESS",
      title: "Ayurvedic Dinacharya & Pranayama",
      details: "Gentle Surya Namaskara, Nadi Shodhana Pranayama, and warm water hydration to balance Vata & boost mental focus.",
      isFixedCommitment: false
    });

    // 2. Fixed College / Internship block (STRICT: NEVER SCHEDULE STUDY OVER THIS!)
    if (params.hasInternship) {
      schedule.push({
        id: `tt-${day}-internship`,
        dayOfWeek: day,
        startTime: params.internshipStart || "08:30",
        endTime: params.internshipEnd || "14:00",
        category: "INTERNSHIP_POSTING",
        title: "Clinical Hospital Duty & OPD Rounds",
        details: "Hands-on clinical observations, patient case histories, and panchakarma theater rotations.",
        isFixedCommitment: true
      });
    } else {
      schedule.push({
        id: `tt-${day}-college`,
        dayOfWeek: day,
        startTime: params.collegeStart || "09:00",
        endTime: params.collegeEnd || "16:00",
        category: "COLLEGE_LECTURE",
        title: "College Academic Classes & Dissection / Lab Practicals",
        details: "Fixed institutional BAMS lectures and laboratory practical hours.",
        isFixedCommitment: true
      });
    }

    // 3. Post-College Rest & Refreshment
    schedule.push({
      id: `tt-${day}-rest`,
      dayOfWeek: day,
      startTime: "16:30",
      endTime: "17:30",
      category: "REST_MEAL",
      title: "Post-College Rest & Nutrition Break",
      details: "Light Ayurvedic snack, mental decompression, and restorative walk to prevent cognitive burnout.",
      isFixedCommitment: false
    });

    // 4. Targeted Weak Topic Remediation Slot (Daily focused 90 mins)
    const topicForToday = (idx % 2 === 0) ? primaryWeakTopic : secondaryWeakTopic;
    schedule.push({
      id: `tt-${day}-weak-study`,
      dayOfWeek: day,
      startTime: "18:00",
      endTime: "19:30",
      category: "WEAK_TOPIC_STUDY",
      title: `Deep Focus: Remediation of ${topicForToday}`,
      details: `Read basic concepts, review procedural diagrams, and listen via Voice Reader to master classical shlokas.`,
      isFixedCommitment: false,
      priorityTopic: topicForToday
    });

    // 5. Practice Questions & Case Study Review
    schedule.push({
      id: `tt-${day}-practice`,
      dayOfWeek: day,
      startTime: "20:30",
      endTime: "21:30",
      category: (idx % 3 === 0) ? "MOCK_EXAM_PRACTICE" : "REVISION_BLOCK",
      title: (idx % 3 === 0) ? "Clinical Case Study & 10 MCQ Sprint" : "High-Yield Shloka Recitation & Mnemonics Revision",
      details: "Active recall practice and NCISM 5-step answer drafting under timed conditions.",
      isFixedCommitment: false
    });
  });

  return schedule;
}

// ============================================================
// 6. DYNAMIC WEAK TOPIC REMEDIATION BLUEPRINT
// ============================================================

export function getRemediationPathwayForPanchakarma(): RemediationPathway {
  return {
    weakTopicId: "topic-panchakarma-basti",
    topicTitle: "Panchakarma: Basti Protocols & Administration Management",
    subjectName: "Panchakarma",
    currentMasteryPct: 48,
    targetMasteryPct: 85,
    step1_Explanation: {
      coreConcept: "Basti Karma is considered the supreme therapy for all Vata-predominant disorders. Delivered via the rectum into the Pakvashaya, it eliminates deep-seated morbid doshas throughout the body. Niruha and Anuvasana are given in planned cycles.",
      classicalShloka: {
        devanagari: "बस्तिर्वाते च पित्ते च कफे चोक्तो विधारिते ।\nसर्वदोषहरो यस्मात् तस्मादर्थचिकित्सितम् ॥",
        iast: "bastirvāte ca pitte ca kaphe cokto vidhārite |\nsarvadoṣaharo yasmāt tasmādardhacikitsitam ||",
        meaning: "Basti is effective in Vata, Pitta, and Kapha vitiations alike; because it uproots systemic doshas, it is deemed half of all medical practice.",
        reference: "Charaka Samhita Siddhisthana 1/38"
      },
      clinicalPearls: [
        "Sequential mixing of Niruha: Honey → Rock Salt → Medicated Oil → Herbal Paste → Decoction (M-S-S-K-K).",
        "Anuvasana retention ideally lasts 3 Yamas (9 hours); minimum 1 Yama (3 hours).",
        "In case of non-retention with colic, immediately administer warm Phalasneha or Gomutra-processed dashamula."
      ]
    },
    step2_Diagram: {
      title: "Niruha Basti Emulsification Chamber & Putaka Delivery Mechanism",
      caption: "Sequential homogenous emulsification of 5 classical ingredients and 45-degree angle Netra insertion in left lateral Sims position.",
      altText: "Scientific diagram of Niruha Basti emulsification and patient Sims positioning",
      svgSchema: "basti_flow"
    },
    step3_VoiceReaderScript: "Welcome to your high-yield remediation for Panchakarma Basti protocols. Basti is recognized by Acharya Charaka as Ardha Chikitsa. Remember the five-step sequential addition formula for Niruha Basti: Makshika or Honey is first rubbed with Saindhava Lavana. Then unctuous Sneha is added, followed by Kalka fine paste, and lastly Kwatha decoction is blended until a silky micro-emulsion forms. The patient must lie in the Left Lateral Sims position with the right thigh flexed.",
    step4_PracticeQuestions: [
      {
        id: "q-basti-1",
        question: "In what sequential order must ingredients be mixed during classical Niruha Basti preparation?",
        options: [
          "Decoction → Oil → Honey → Rock Salt → Herbal Paste",
          "Honey (Makshika) → Rock Salt (Saindhava) → Oil (Sneha) → Paste (Kalka) → Decoction (Kwatha)",
          "Oil → Honey → Decoction → Salt → Paste",
          "Paste → Salt → Decoction → Oil → Honey"
        ],
        correctIndex: 1,
        explanation: "Correct! The classical sequence Makshika → Saindhava → Sneha → Kalka → Kwatha ensures an oil-in-water micro-emulsion that does not separate upon administration."
      },
      {
        id: "q-basti-2",
        question: "Which posture is mandated for the patient during Basti administration?",
        options: [
          "Supine posture with legs extended",
          "Prone posture on abdomen",
          "Vama Parshwa (Left lateral Sims posture) with left leg straight and right leg flexed",
          "Sitting upright with knees bent"
        ],
        correctIndex: 2,
        explanation: "Correct! The left lateral (Vama Parshwa) position aligns with the natural curvature of the descending colon and rectum, facilitating smooth, painless entry."
      },
      {
        id: "q-basti-3",
        question: "How many total Basti enemas constitute a standard Yoga Basti regimen?",
        options: [
          "30 Bastis (18 Anuvasana, 12 Niruha)",
          "16 Bastis (10 Anuvasana, 6 Niruha)",
          "8 Bastis (5 Anuvasana, 3 Niruha)",
          "5 Bastis (3 Anuvasana, 2 Niruha)"
        ],
        correctIndex: 2,
        explanation: "Correct! Yoga Basti consists of 8 Bastis: 1 initial Anuvasana, 3 alternating Niruha/Anuvasana pairs, and 1 final Anuvasana."
      }
    ],
    step5_TargetedCaseStudyId: "case-amavata-panchakarma",
    step6_RelevantExpertSession: {
      sessionId: "session-panchakarma-masterclass",
      sessionTitle: "Clinical Panchakarma: Basti Protocols in Chronic Autoimmune Cases",
      expertName: "Dr. Vaidya Rajesh Sharma, MD (Ayu)",
      expertTitle: "HOD & Senior Panchakarma Specialist",
      scheduledOrRecorded: "RECORDED_LECTURE",
      durationMins: 45
    },
    step7_RelevantDoctorProfile: {
      doctorId: "doc-rajesh-sharma",
      doctorName: "Dr. Vaidya Rajesh Sharma",
      specialization: "Panchakarma & Clinical Detoxification",
      experienceYears: 18,
      clinicLocation: "AyurSetu Apex Hospital, Pune"
    },
    estimatedScoreBoost: 32
  };
}

// ============================================================
// 7. DUPLICATE CASE STUDY PREVENTION GENERATOR
// ============================================================

export function generateCaseStudyFingerprint(title: string, subject: string, presentingComplaints: string[]): string {
  const normalized = (title + subject + presentingComplaints.join("")).toLowerCase().replace(/[^a-z0-9]/g, "");
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `AYUR-CASE-FP-${Math.abs(hash).toString(16).toUpperCase()}`;
}
