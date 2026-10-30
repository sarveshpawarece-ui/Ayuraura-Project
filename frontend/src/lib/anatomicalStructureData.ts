import * as THREE from "three";

export type AnatomicalCategory =
  | "Bone"
  | "Cartilage"
  | "Ligament"
  | "Tendon"
  | "Joint Capsule"
  | "Cardiovascular"
  | "Nervous"
  | "Digestive"
  | "Respiratory"
  | "Integumentary"
  | "Lymphatic"
  | "Endocrine"
  | "Urinary"
  | "Reproductive"
  | "Muscular";

export interface AnatomicalStructureData {
  id: string; // e.g., "femur_right"
  commonName: string; // e.g., "Femur (Thigh Bone)"
  latinName: string; // e.g., "Os Femoris"
  category: AnatomicalCategory;
  colorCode: string;

  // Specific Anatomical Parts Breakdown
  subParts: {
    proximal: string[]; // e.g., ["Head of Femur", "Neck of Femur", "Greater Trochanter", "Lesser Trochanter"]
    shaft: string[]; // e.g., ["Linea Aspera", "Gluteal Tuberosity", "Pectineal Line"]
    distal: string[]; // e.g., ["Medial Condyle", "Lateral Condyle", "Intercondylar Fossa", "Patellar Surface"]
  };

  // Biomechanical Functions
  functions: string[]; // e.g., ["Supports body weight during standing and locomotion", "Provides leverage for quadriceps and hamstring muscles", "Houses bone marrow for hematopoiesis"]

  // Connected Structures
  articulations: string[]; // e.g., ["Acetabulum of Pelvis (Hip Joint)", "Tibia & Patella (Knee Joint)"]
  connectedLigaments: string[]; // e.g., ["Iliofemoral Ligament", "Ligamentum Teres", "ACL / PCL"]

  // Ayurvedic Metadata
  ayurvedicMetadata: {
    dhatu: string; // e.g., "Asthi Dhatu (अस्थि धातु)"
    srotas: string; // e.g., "Asthivaha Srotas (अस्थिवह स्रोतस्)"
    doshaAffinity: string; // e.g., "Vata Dosha (Vayu & Akasha)"
    upadhatu: string; // e.g., "Danta (Teeth) & Kesha (Hair)"
  };

  // Clinical Relevance
  clinicalNotes: string; // e.g., "Susceptible to femoral neck fractures in osteoporosis; primary site for total hip arthroplasty."

  // Interior Histology & Split-View Cross-Sectional Metadata
  histologicalLayer?: string;
  tissueType?: string;
  biochemicalFunction?: string;
  isInternalSplit?: boolean;
}

export interface InternalHistologyPin {
  id: string;
  name: string;
  title?: string;
  organName: string;
  systemId: string;
  anchor: [number, number, number]; // [x, y, z] in standard world meters
  worldAnchor?: [number, number, number];
  colorCode?: string;
  histologicalLayer: string;
  tissueType: string;
  biochemicalFunction: string;
  clinicalRelevance: string;
  ayurvedicCorrelation: {
    srotas: string;
    dhatu: string;
    agni: string;
    dosha: string;
    mechanism: string;
  };
}

export const CATEGORY_COLOR_MAP: Record<AnatomicalCategory, string> = {
  Bone: "#F59E0B", // Electric Gold
  Cartilage: "#06B6D4", // Cyan-Blue
  Ligament: "#10B981", // Emerald Green
  Tendon: "#F97316", // Bright Orange
  "Joint Capsule": "#EC4899", // Magenta-Pink
  Cardiovascular: "#E53935", // Crimson Red
  Nervous: "#00E5FF", // Electric Cyan
  Digestive: "#FF7043", // Amber Orange
  Respiratory: "#4FC3F7", // Sky Blue
  Integumentary: "#E2C3A8", // Translucent Skin
  Lymphatic: "#66BB6A", // Emerald Lime
  Endocrine: "#FFCA28", // Golden Sun
  Urinary: "#AB47BC", // Royal Violet
  Reproductive: "#EC407A", // Rose Pink
  Muscular: "#D32F2F", // Striated Muscle Red
};

export const CATEGORY_AYURVEDA_MAP: Record<
  AnatomicalCategory,
  {
    dhatu: string;
    srotas: string;
    doshaAffinity: string;
    upadhatu: string;
    sanskritTitle: string;
  }
> = {
  Bone: {
    dhatu: "Asthi Dhatu (अस्थि धातु)",
    srotas: "Asthivaha Srotas (अस्थिवह स्रोतस् - Medas & Jaghana Mula)",
    doshaAffinity: "Vata Dosha (Vayu & Akasha Mahabhuta)",
    upadhatu: "Danta (Teeth) & Kesha/Nakha (Hair & Nails)",
    sanskritTitle: "Asthi Samsthana (अस्थि संस्थान)",
  },
  Cartilage: {
    dhatu: "Tarunasthi / Sandhanaka Asthi (तरुणाम्नाय / सन्धानक अस्थि)",
    srotas: "Asthivaha & Majjavaha Srotas",
    doshaAffinity: "Kapha (Sleshaka) & Vata Balance",
    upadhatu: "Snayu Bandhana",
    sanskritTitle: "Tarunasthi (तरुणाम्नाय)",
  },
  Ligament: {
    dhatu: "Snayu (स्नायु - Pratanavati & Vritta)",
    srotas: "Mamsavaha & Asthivaha Srotas",
    doshaAffinity: "Vyana Vayu & Sleshaka Kapha",
    upadhatu: "Mamsa Upadhatu (मांस उपधातु)",
    sanskritTitle: "Snayu Bandhana (स्नायु बन्धन)",
  },
  Tendon: {
    dhatu: "Kandara (कण्डरा - Maha Snayu / Large Tendons)",
    srotas: "Mamsavaha Srotas (मांसवह स्रोतस्)",
    doshaAffinity: "Vata (Vyana Vayu) & Pitta for tensile force",
    upadhatu: "Peshi-Bandhana Upadhatu",
    sanskritTitle: "Kandara Samsthana (कण्डरा)",
  },
  "Joint Capsule": {
    dhatu: "Sandhi & Sleshaka Kapha (सन्धि व श्लेषक कफ)",
    srotas: "Asthivaha & Majjavaha Srotas (सन्धि मार्ग)",
    doshaAffinity: "Sleshaka Kapha (Hydrodynamic lubrication)",
    upadhatu: "Sandhi Kosha & Majja Dhatu",
    sanskritTitle: "Sandhi Kosha (सन्धि कोष)",
  },
  Cardiovascular: {
    dhatu: "Rasa & Rakta Dhatu (रस व रक्त धातु)",
    srotas: "Rasavaha & Raktavaha Srotas (रस-रक्तवह स्रोतस्)",
    doshaAffinity: "Sadhaka Pitta & Vyana Vayu",
    upadhatu: "Sira & Kandara (रक्तस्य उपधातुः शिराः)",
    sanskritTitle: "Raktavaha Samsthana (रक्तवह संस्थान)",
  },
  Nervous: {
    dhatu: "Majja Dhatu (मज्जा धातु - न्यूरो-मेडुला)",
    srotas: "Majjavaha & Manovaha Srotas (मज्जावह व मनोवह स्रोतस्)",
    doshaAffinity: "Prana Vayu & Tarpaka Kapha",
    upadhatu: "Netra Sneha & Twak Sneha",
    sanskritTitle: "Majjavaha Samsthana (मज्जावह संस्थान)",
  },
  Digestive: {
    dhatu: "Pachaka Pitta (जाठराग्नि व पाचक पित्त)",
    srotas: "Annavaha & Purishavaha Srotas (अन्नवह व पुरीषवह स्रोतस्)",
    doshaAffinity: "Samana Vayu, Pachaka Pitta & Kledaka Kapha",
    upadhatu: "Ahara Rasa (आहार रस)",
    sanskritTitle: "Annavaha Samsthana (अन्नवह संस्थान)",
  },
  Respiratory: {
    dhatu: "Rasa & Rakta Oxygenation (प्राण रस-रक्त पोषण)",
    srotas: "Pranavaha Srotas (प्राणवह स्रोतस्)",
    doshaAffinity: "Prana Vayu & Udana Vayu",
    upadhatu: "Poshaka Rasa (पोषक रस)",
    sanskritTitle: "Pranavaha Samsthana (प्राणवह संस्थान)",
  },
  Integumentary: {
    dhatu: "Rasa Dhatu Upadhatu (रसधातोः उपधातुः त्वचा)",
    srotas: "Swedavaha & Rasavaha Srotas (स्वेदवह व रसवह स्रोतस्)",
    doshaAffinity: "Bhrajaka Pitta & Vyana Vayu",
    upadhatu: "Twacha (सप्त स्तर त्वचा)",
    sanskritTitle: "Twacha (त्वचा - सप्त स्तर)",
  },
  Lymphatic: {
    dhatu: "Rasa Dhatu & Ojas (रस धातु व ओजस्)",
    srotas: "Rasavaha & Udakavaha Srotas (रसवह व उदकवह स्रोतस्)",
    doshaAffinity: "Avalambaka Kapha & Vyana Vayu",
    upadhatu: "Lasika (लसीका)",
    sanskritTitle: "Lasika Samsthana (लसीका संस्थान)",
  },
  Endocrine: {
    dhatu: "Sukshma Dhatvagni & Ojas (सूक्ष्म धात्वाग्नि)",
    srotas: "Manovaha & Shukravaha Srotas (मनोवह स्रोतस्)",
    doshaAffinity: "Sadhaka Pitta & Prana Vayu",
    upadhatu: "Dhatu-Poshaka Rasa",
    sanskritTitle: "Antahsravi Granthi (अन्तःस्रावी ग्रन्थि)",
  },
  Urinary: {
    dhatu: "Meda Dhatu & Kitta Mala (मेद धातु व मूत्र मल)",
    srotas: "Mutravaha Srotas (मूत्रवह स्रोतस्)",
    doshaAffinity: "Apana Vayu & Kledaka Kapha",
    upadhatu: "Mutra (मूत्र)",
    sanskritTitle: "Mutravaha Samsthana (मूत्रवह संस्थान)",
  },
  Reproductive: {
    dhatu: "Shukra & Artava Dhatu (शुक्र व आर्तव धातु)",
    srotas: "Shukravaha & Artavavaha Srotas (शुक्रवह व आर्तववह स्रोतस्)",
    doshaAffinity: "Apana Vayu & Saumya Kapha",
    upadhatu: "Stanya (Breast Milk) & Ojas",
    sanskritTitle: "Shukravaha Samsthana (शुक्रवह संस्थान)",
  },
  Muscular: {
    dhatu: "Mamsa Dhatu (मांस धातु - पेशी व्यूह)",
    srotas: "Mamsavaha Srotas (मांसवह स्रोतस्)",
    doshaAffinity: "Vyana Vayu & Kapha Dhatu",
    upadhatu: "Vasa (Muscle Fat) & Twak Shad",
    sanskritTitle: "Mamsa Samsthana (मांस संस्थान)",
  },
};

// ============================================================================
// CANONICAL ANATOMICAL STRUCTURE DATABASE
// ============================================================================

export const ANATOMICAL_DATABASE: Record<string, AnatomicalStructureData> = {
  // --------------------------------------------------------------------------
  // BONES: LOWER EXTREMITIES & PELVIS
  // --------------------------------------------------------------------------
  femur: {
    id: "femur",
    commonName: "Femur (Thigh Bone)",
    latinName: "Os Femoris",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Head of Femur (Caput Femoris) articulating with Acetabulum",
        "Neck of Femur (Collum Femoris - angle of inclination ~125°)",
        "Greater Trochanter (Trochanter Major - gluteal insertion)",
        "Lesser Trochanter (Trochanter Minor - iliopsoas insertion)",
        "Intertrochanteric Crest & Quadrate Tubercle",
      ],
      shaft: [
        "Linea Aspera (bifurcates proximally into gluteal tuberosity)",
        "Gluteal Tuberosity & Pectineal Line",
        "Medial and Lateral Supracondylar Lines",
        "Popliteal Surface (Planum Popliteum)",
      ],
      distal: [
        "Medial Condyle & Medial Epicondyle (Adductor Tubercle)",
        "Lateral Condyle & Lateral Epicondyle",
        "Intercondylar Fossa (Notch housing ACL and PCL)",
        "Patellar Surface (Trochlear Groove)",
      ],
    },
    functions: [
      "Transmits full upper-body gravitational loads to the tibial plateau during locomotion.",
      "Acts as a Class III mechanical lever amplifiying quad extension and hamstring flexion torques.",
      "Contains dense medullary cavity housing hematopoietic red marrow (in youth) and fatty yellow marrow (Majja Dhatu).",
      "Provides substantial cortical cross-sectional moment of inertia resisting torsional/bending strain.",
    ],
    articulations: [
      "Acetabulum of Pelvis (Enarthrodial Ball-and-Socket Hip Joint)",
      "Proximal Tibial Condyles (Bicondylar Hinge Knee Joint)",
      "Patella (Patellofemoral Gliding Arthrodial Joint)",
    ],
    connectedLigaments: [
      "Iliofemoral Ligament (Y-Ligament of Bigelow - strongest in human body)",
      "Pubofemoral and Ischiofemoral Ligaments",
      "Ligamentum Teres (Ligament of Femoral Head)",
      "Anterior Cruciate Ligament (ACL insertion at lateral femoral condyle)",
      "Posterior Cruciate Ligament (PCL insertion at medial femoral condyle)",
      "Medial & Lateral Collateral Ligaments (MCL & LCL)",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (अस्थि धातु - Prithvi & Vayu Mahabhuta)",
      srotas: "Asthivaha Srotas (अस्थिवह स्रोतस् - Rooted in Medas & Pelvis)",
      doshaAffinity: "Vata Dosha (Vayu & Akasha - primary site of Vata accumulation)",
      upadhatu: "Danta (Teeth) & Kesha (Hair)",
    },
    clinicalNotes:
      "High susceptibility to subcapital and intertrochanteric femoral neck fractures in postmenopausal osteoporosis (Asthi Saushirya); primary candidate site for total hip arthroplasty (THA). High-energy shaft fractures carry risk of fat embolism syndrome.",
  },

  tibia: {
    id: "tibia",
    commonName: "Tibia (Shinbone)",
    latinName: "Os Tibia",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Medial Tibial Condyle & Plateau (bears 60% of axial load)",
        "Lateral Tibial Condyle & Plateau",
        "Intercondylar Eminence (Medial & Lateral Intercondylar Spines)",
        "Tibial Tuberosity (Tuberositas Tibiae - patellar tendon insertion)",
      ],
      shaft: [
        "Anterior Border (Subcutaneous Shin Crest)",
        "Interosseous Margin (Attachment for crural interosseous membrane)",
        "Soleal Line (Popliteus insertion and soleus origin)",
      ],
      distal: [
        "Medial Malleolus (Forms medial mortise wall of talocrural joint)",
        "Fibular Notch (Incised syndesmotic articulation with distal fibula)",
        "Inferior Articular Surface (Plafond articulating with Talus trochlea)",
      ],
    },
    functions: [
      "Principal weight-bearing column of lower limb, distributing body weight to ankle mortise.",
      "Provides stable tibial plateau for meniscus seating and cruciate ligament anchoring.",
      "Serves as rigid origin for ankle dorsiflexors and plantar flexor stabilizing muscle groups.",
    ],
    articulations: [
      "Femoral Condyles (Tibiofemoral Knee Articulation)",
      "Head and Distal Fibula (Superior & Inferior Tibiofibular Joints)",
      "Trochlea of Talus (Talocrural Ankle Mortise Joint)",
    ],
    connectedLigaments: [
      "Patellar Tendon / Ligament (at tibial tuberosity)",
      "Anterior Cruciate Ligament (anterior intercondylar area)",
      "Posterior Cruciate Ligament (posterior intercondylar fossa)",
      "Medial Collateral Ligament (MCL deep & superficial fibers)",
      "Deltoid Ligament of Ankle (from medial malleolus)",
      "Anterior and Posterior Inferior Tibiofibular Syndesmotic Ligaments",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Nalakasthi - Tubular Long Bone)",
      srotas: "Asthivaha Srotas",
      doshaAffinity: "Apana & Vyana Vayu",
      upadhatu: "Kesha & Nakha",
    },
    clinicalNotes:
      "Tibial plateau fractures (Schatzker classification) frequently involve articular surface step-offs and meniscal impaction. Shaft fractures are prone to delayed union/non-union due to limited anteromedial periosteal blood flow and compartment syndrome.",
  },

  fibula: {
    id: "fibula",
    commonName: "Fibula (Calf Bone)",
    latinName: "Os Fibula",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Head of Fibula (Caput Fibulae)",
        "Apex (Styloid Process - Biceps femoris and LCL insertion)",
        "Articular Facet for Proximal Tibia",
      ],
      shaft: [
        "Anterior, Posterior, and Interosseous Borders",
        "Groove for Peroneal / Fibular Longus and Brevis Tendons",
      ],
      distal: [
        "Lateral Malleolus (Deep lateral buttress of ankle mortise)",
        "Malleolar Fossa for Posterior Talofibular Ligament (PTFL)",
      ],
    },
    functions: [
      "Provides lateral non-weight-bearing anchor resisting ankle inversion and syndesmotic diastasis.",
      "Acts as extensive muscular origin for peroneus longus/brevis, extensor digitorum longus, and soleus.",
      "Serves as vascularized autologous graft source in microvascular orthopedic reconstruction.",
    ],
    articulations: [
      "Proximal Tibia (Superior Tibiofibular Plane Arthrodial Joint)",
      "Distal Tibia (Inferior Tibiofibular Syndesmosis)",
      "Lateral Facet of Talus (Ankle Mortise Articulation)",
    ],
    connectedLigaments: [
      "Lateral Collateral Ligament (LCL of Knee)",
      "Anterior Talofibular Ligament (ATFL - most commonly sprained ankle ligament)",
      "Calcaneofibular Ligament (CFL)",
      "Posterior Talofibular Ligament (PTFL)",
      "Crural Interosseous Membrane",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Nalakasthi)",
      srotas: "Asthivaha Srotas",
      doshaAffinity: "Vyana Vayu (Kinetic stability)",
      upadhatu: "Nakha & Kesha",
    },
    clinicalNotes:
      "Maisonneuve fracture (spiral proximal fibular fracture accompanied by medial malleolus tear and syndesmotic rupture). Common peroneal nerve contusion around fibular neck leads to foot drop.",
  },

  patella: {
    id: "patella",
    commonName: "Patella (Kneecap)",
    latinName: "Os Patella",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: ["Base of Patella (Superior attachment of Quadriceps Femoris Tendon)"],
      shaft: ["Anterior Convex Surface (Subcutaneous longitudinally striated fibers)"],
      distal: [
        "Apex of Patella (Inferior origin of Patellar Tendon)",
        "Posterior Articular Surface (Medial & Lateral Facets with thickest cartilage in human body ~6mm)",
      ],
    },
    functions: [
      "Largest sesamoid bone in human anatomy; displaces quadriceps tendon forward.",
      "Increases lever moment arm of extensor mechanism by 30-50% during terminal knee extension.",
      "Shields anterior femoral trochlea and synovial capsule from direct blunt impact trauma.",
    ],
    articulations: ["Trochlear Groove of Distal Femur (Patellofemoral Joint)"],
    connectedLigaments: [
      "Quadriceps Tendon (superior base insertion)",
      "Patellar Tendon / Ligamentum Patellae (inferior apex origin)",
      "Medial Patellofemoral Ligament (MPFL - primary restraint against lateral patellar dislocation)",
      "Lateral Patellar Retinaculum",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Kapalasthi / Valayasthi - Flat/Shield Bone)",
      srotas: "Asthivaha & Sandhivaha Srotas",
      doshaAffinity: "Sleshaka Kapha & Vyana Vayu",
      upadhatu: "Snayu Bandhana",
    },
    clinicalNotes:
      "Chondromalacia patellae (softening of retro-patellar cartilage), lateral patellar subluxation/dislocation from MPFL tear, transverse fractures from direct impact or eccentric quadriceps snapping.",
  },

  pelvis: {
    id: "pelvis",
    commonName: "Pelvis / Innominate Hip Bone",
    latinName: "Os Coxae (Ilium, Ischium, Pubis)",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Iliac Crest (Crista Iliaca - anchor for core abdominal wall muscles)",
        "Anterior Superior Iliac Spine (ASIS - sartorius & inguinal ligament origin)",
        "Anterior Inferior Iliac Spine (AIIS - rectus femoris straight head origin)",
        "Posterior Superior Iliac Spine (PSIS - dimple of Venus landmark)",
      ],
      shaft: [
        "Acetabulum (Lunate articular cartilage cup enclosing head of femur)",
        "Obturator Foramen (Obturator membrane and canal for obturator bundle)",
        "Greater & Lesser Sciatic Notches (divided by Ischial Spine)",
      ],
      distal: [
        "Ischial Tuberosity (Weight-bearing seating prominence & hamstring origin)",
        "Pubic Symphysis (Fibrocartilage interpubic disc)",
        "Pubic Crest & Pecten Pubis",
      ],
    },
    functions: [
      "Transfers cranial-caudal axial spine load symmetrically into bilateral lower extremity femurs.",
      "Protects internal pelvic visceral structures: bladder, rectum, and reproductive organs (Yoni/Garbhashaya).",
      "Provides extensive origin anchor for abdominal core, pelvic floor, and gluteal locomotor musculature.",
    ],
    articulations: [
      "Head of Femur (Acetabulofemoral Hip Joint)",
      "Sacrum (Sacroiliac SI Joints - amortizing syndesmotic joints)",
      "Contralateral Pubis (Pubic Symphysis Joint)",
    ],
    connectedLigaments: [
      "Sacrotuberous and Sacrospinous Ligaments (forming sciatic foramina)",
      "Iliofemoral, Ischiofemoral, and Pubofemoral Ligaments",
      "Anterior & Posterior Sacroiliac Ligaments",
      "Inguinal Ligament (Poupart's Ligament)",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Shroni Asthi / Kapalasthi - Pelvic Basin)",
      srotas: "Asthivaha & Purishavaha / Mutravaha Srotas",
      doshaAffinity: "Apana Vayu (Prime seat of Apana Vata governance)",
      upadhatu: "Kesha & Danta",
    },
    clinicalNotes:
      "High-energy open-book pelvic ring disruptions (Tile & Young-Burgess classifications) cause lethal retroperitoneal venous plexus hemorrhage. Sacroiliitis is hallmark of ankylosing spondylitis.",
  },

  // --------------------------------------------------------------------------
  // BONES: AXIAL SKELETON (SKULL, SPINE, RIBS, STERNUM)
  // --------------------------------------------------------------------------
  skull: {
    id: "skull",
    commonName: "Skull & Cranium",
    latinName: "Neurocranium & Viscerocranium",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Frontal Bone (Forehead, orbital roof, supraorbital margins)",
        "Parietal Bones (Paired calvarial roof joined by Sagittal Suture)",
        "Coronal, Sagittal, and Lambdoid Sutures (Sivani joints)",
      ],
      shaft: [
        "Temporal Bones (Zygomatic process, external acoustic meatus, mastoid process)",
        "Sphenoid Bone (Greater/lesser wings, Sella Turcica housing pituitary)",
        "Ethmoid Bone (Cribriform plate transmitting olfactory nerve fibers)",
      ],
      distal: [
        "Occipital Bone (Foramen Magnum, Occipital Condyles articulating with C1 Atlas)",
        "External Occipital Protuberance (Inion - nuchal ligament anchor)",
        "Maxillae and Zygomatic Arch (Malar complex)",
      ],
    },
    functions: [
      "Encloses and hermetically shields the central cerebral cortex, cerebellum, and brainstem.",
      "Houses primary sensory receptor chambers: optical orbits, auditory cochlea, olfactory cribriform plates.",
      "Suspends dental arcades for mechanical mastication and anchors mimetic facial expression muscles.",
    ],
    articulations: [
      "Atlas C1 Vertebra (Atlanto-Occipital Ellipsoidal Joint for head nodding)",
      "Mandible (Temporomandibular TMJ Bicondylar Hinge Joint)",
      "Internal cranial sutures (Synarthrodial Fibrous Sivani Joints)",
    ],
    connectedLigaments: [
      "Ligamentum Nuchae",
      "Alar and Apical Ligaments of Odontoid Process",
      "Tectorial Membrane (continuation of PLL)",
      "Temporomandibular Lateral Ligament and Sphenomandibular Ligament",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Shira Kapalasthi - Cranial Shell)",
      srotas: "Pranavaha & Majjavaha Srotas (Mastishka - Seat of Prana Vata)",
      doshaAffinity: "Prana Vayu, Alochaka Pitta, and Tarpaka Kapha",
      upadhatu: "Kesha (Scalp Hair) & Danta (Dentition)",
    },
    clinicalNotes:
      "Basilar skull fractures (Battle's sign, raccoon eyes, CSF rhinorrhea/otorrhea). Epidural hematoma secondary to middle meningeal artery rupture at Pterion landmark. Hydrocephalus from CSF pathway blockage.",
  },

  mandible: {
    id: "mandible",
    commonName: "Mandible (Lower Jawbone)",
    latinName: "Os Mandibulare",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Condylar Process (Head of Condyle articulating in mandibular fossa)",
        "Coronoid Process (Temporalis muscle insertion)",
        "Mandibular Notch (Incisura Mandibulae)",
      ],
      shaft: [
        "Ramus of Mandible (Attachment for Masseter and Medial Pterygoid muscles)",
        "Angle of Mandible (Gonion)",
        "Body of Mandible (Corpus Mandibulae) & Mylohyoid Line",
      ],
      distal: [
        "Mental Protuberance & Mental Foramen (Mental nerve emergence)",
        "Alveolar Part (16 mandibular dental sockets / alveoli)",
      ],
    },
    functions: [
      "Only mobile bone in skull; executes 3-axis masticatory movements (elevation, depression, lateral excursion).",
      "Houses lower dentition providing primary mechanical shearing, crushing, and bolus formation.",
      "Anchors anterior belly of digastric, geniohyoid, and mylohyoid forming muscular floor of mouth.",
    ],
    articulations: [
      "Temporal Bone of Skull (Temporomandibular Joint - TMJ)",
      "Mandibular Teeth (Gomphosis Dentate Joints)",
    ],
    connectedLigaments: [
      "Temporomandibular Lateral Ligament",
      "Sphenomandibular Ligament",
      "Stylomandibular Ligament",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Hanu Asthi / Hanugraha site)",
      srotas: "Annavaha & Pranavaha Srotas",
      doshaAffinity: "Bodhaka Kapha (Salivary enzymatic activation) & Prana Vata",
      upadhatu: "Danta (Teeth)",
    },
    clinicalNotes:
      "TMJ internal derangement with anterior articular disc displacement, click/pop crepitus, lockjaw. Mandibular body/angle fractures from direct assault; Hanugraha (mandibular stiffness in Vata disorders).",
  },

  spine: {
    id: "spine",
    commonName: "Vertebral Column (Spine)",
    latinName: "Columna Vertebralis (C1-L5, Sacrum, Coccyx)",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Cervical Spine C1-C7 (C1 Atlas ring, C2 Axis Dens, C7 Vertebra Prominens)",
        "Transverse Foramina (transmitting vertebral arteries to Circle of Willis)",
      ],
      shaft: [
        "Thoracic Spine T1-T12 (Costal demi-facets articulating with rib heads)",
        "Lumbar Spine L1-L5 (Massive kidney-shaped vertebral bodies resisting compression)",
        "Superior & Inferior Articular Processes forming Zygapophyseal Facet Joints",
      ],
      distal: [
        "Sacrum (5 fused sacral vertebrae, sacral promontory, sacral canal, foramina)",
        "Coccyx (3-5 vestigial caudal segments anchoring anococcygeal raphe)",
      ],
    },
    functions: [
      "Axial shock absorber protecting central spinal cord and cauda equina roots.",
      "Provides tri-planar physiological lordotic/kyphotic curvature optimizing upright sagittal balance.",
      "Serves as central column anchoring ribcage, shoulder girdle, and pelvic basin.",
    ],
    articulations: [
      "Occipital Condyles (Atlanto-Occipital Joint)",
      "Adjacent Vertebral Bodies (Intervertebral Amphiarthrodial Symphyses)",
      "Posterior Zygapophyseal Facet Joints (Diarthrodial Plane Joints)",
      "Costal Rib Heads & Tubercles (Costovertebral & Costotransverse Joints)",
      "Ilium (Sacroiliac SI Joint)",
    ],
    connectedLigaments: [
      "Anterior Longitudinal Ligament (ALL - resists hyperextension)",
      "Posterior Longitudinal Ligament (PLL - resists hyperflexion)",
      "Ligamentum Flavum (Elastin-rich yellow ligament bridging laminae)",
      "Interspinous and Supraspinous Ligaments",
      "Iliolumbar Ligaments (anchoring L5 to iliac crest)",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Prishthasthi / Merudanda - Central Cosmic Axis)",
      srotas: "Majjavaha & Asthivaha Srotas (Sushumna Nadi passage)",
      doshaAffinity: "Vyana & Apana Vata (Kati / Prishtha Shoola)",
      upadhatu: "Majja (Spinal cord & marrow)",
    },
    clinicalNotes:
      "Lumbar disc herniation (L4-L5, L5-S1) compressing sciatic nerve roots (Gridhrasi / Sciatica). Spondylolisthesis (pars interarticularis fracture), lumbar spinal canal stenosis, degenerative scoliosis.",
  },

  ribs: {
    id: "ribs",
    commonName: "Thoracic Cage & Ribs",
    latinName: "Costae (Ribs 1-12) & Cavitas Thoracis",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Rib Head (Caput Costae with dual facets for adjacent vertebral bodies)",
        "Neck of Rib (Collum Costae)",
        "Tubercle of Rib (Tuberculum Costae articulating with transverse process)",
      ],
      shaft: [
        "Rib Shaft / Body (Corpus Costae with Costal Angle)",
        "Costal Groove (Sulcus Costae sheltering intercostal neurovascular bundle: VAN)",
      ],
      distal: [
        "Anterior Costal Cartilage Junction (Costochondral Joint)",
        "True Ribs (1-7), False Ribs (8-10 joining costal margin), Floating Ribs (11-12 free)",
      ],
    },
    functions: [
      "Executes 'bucket-handle' and 'pump-handle' kinematics expanding thoracic volume during inhalation.",
      "Protects vital mediastinal cardiopulmonary viscera: heart, lungs, great vessels, and liver dome.",
      "Anchors respiratory diaphragm, intercostal muscles, pectoralis minor, and serratus anterior.",
    ],
    articulations: [
      "Thoracic Vertebrae T1-T12 (Costovertebral & Costotransverse Joints)",
      "Costal Cartilages (Costochondral Junctions)",
      "Sternum (Sternocostal Joints via Costal Cartilages 1-7)",
    ],
    connectedLigaments: [
      "Radiate Costovertebral Ligament",
      "Superior and Lateral Costotransverse Ligaments",
      "Sternocostal Radiate Ligaments",
      "Costoxiphoid Ligament",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Parshukasthi - Rib Vault)",
      srotas: "Pranavaha & Uras Srotas",
      doshaAffinity: "Prana Vayu & Avalambaka Kapha",
      upadhatu: "Uras Asthi Bandha",
    },
    clinicalNotes:
      "Flail chest (>3 adjacent ribs fractured in 2+ places with paradoxical respiration). Costochondritis (Tietze syndrome mimicking cardiac angina). Rib fractures causing traumatic pneumothorax or hemothorax.",
  },

  sternum: {
    id: "sternum",
    commonName: "Sternum (Breastbone)",
    latinName: "Os Sternum",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Manubrium Sterni (Suprasternal / Jugular Notch, Clavicular Notches)",
        "First Costal Cartilage Notch",
      ],
      shaft: [
        "Sternal Angle of Louis (Manubriosternal Joint at T4/T5 level)",
        "Body of Sternum (Corpus Sterni with transverse ridges and costal notches 2-7)",
      ],
      distal: [
        "Xiphisternal Joint",
        "Xiphoid Process (Cartilaginous in youth, ossifies in middle age)",
      ],
    },
    functions: [
      "Forms anterior median pillar of thoracic cage anchoring bilateral costal cartilage arches.",
      "Shields pericardial anterior heart wall, ascending aorta, and mediastinal structures.",
      "Frequent aspirate biopsy site for adult hematopoietic bone marrow examination.",
    ],
    articulations: [
      "Bilateral Clavicles (Sternoclavicular SC Joints)",
      "Costal Cartilages 1-7 (Sternocostal Synchondroses & Arthrodial Joints)",
    ],
    connectedLigaments: [
      "Anterior & Posterior Sternoclavicular Ligaments",
      "Costoclavicular Ligament (Rhomboid Ligament)",
      "Radiate Sternocostal Ligaments",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Uras Asthi - Sternal Shield)",
      srotas: "Pranavaha & Hridaya Srotas (Seat of Hridaya Marma)",
      doshaAffinity: "Avalambaka Kapha & Sadhaka Pitta",
      upadhatu: "Kesha & Danta",
    },
    clinicalNotes:
      "Median sternotomy for coronary artery bypass graft (CABG) surgery; sternal nonunion or mediastinitis. Xiphoid fractures during improper CPR chest compressions.",
  },

  // --------------------------------------------------------------------------
  // BONES: UPPER EXTREMITIES (CLAVICLE, SCAPULA, HUMERUS, RADIUS, ULNA)
  // --------------------------------------------------------------------------
  clavicle: {
    id: "clavicle",
    commonName: "Clavicle (Collarbone)",
    latinName: "Clavicula",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: ["Sternal Extremity (Quadrangular medial end with fibrocartilage articular disc)"],
      shaft: [
        "Medial Two-Thirds (Convex forward tubular body)",
        "Lateral One-Third (Concave forward flattened body)",
        "Subclavian Groove (Attachment for subclavius muscle protecting subclavian vessels)",
      ],
      distal: [
        "Acromial Extremity (Flattened lateral end articulating with acromion)",
        "Conoid Tubercle & Trapezoid Line (Coracoclavicular ligament anchors)",
      ],
    },
    functions: [
      "Acts as horizontal mechanical strut holding upper limb away from trunk for maximum glenohumeral mobility.",
      "Transmits impacts from upper extremity directly to axial sternum.",
      "Provides muscular origins for pectoralis major, deltoid, and sternocleidomastoid.",
    ],
    articulations: [
      "Manubrium Sterni (Sternoclavicular SC Joint - only bony attachment of arm to axial skeleton)",
      "Acromion of Scapula (Acromioclavicular AC Joint)",
    ],
    connectedLigaments: [
      "Costoclavicular Ligament",
      "Coracoclavicular Ligaments (Conoid & Trapezoid)",
      "Acromioclavicular Ligament",
      "Interclavicular Ligament",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Akshakasthi - Collarbone)",
      srotas: "Asthivaha Srotas",
      doshaAffinity: "Udana & Vyana Vayu",
      upadhatu: "Kesha & Nakha",
    },
    clinicalNotes:
      "Most commonly fractured bone in human body, typically at junction of medial 2/3 and lateral 1/3 from fall onto outstretched hand (FOOSH). AC joint separation (shoulder separation grades I-VI).",
  },

  humerus: {
    id: "humerus",
    commonName: "Humerus (Upper Arm Bone)",
    latinName: "Os Humeri",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Head of Humerus (Hemispherical caput articulating with glenoid fossa)",
        "Anatomical Neck & Surgical Neck (Frequent fracture line)",
        "Greater Tubercle (Supraspinatus, infraspinatus, teres minor insertions)",
        "Lesser Tubercle (Subscapularis insertion) & Intertubercular Bicipital Sulcus",
      ],
      shaft: [
        "Deltoid Tuberosity (V-shaped lateral insertion for deltoid)",
        "Radial / Spiral Groove (Sulcus for radial nerve and profunda brachii artery)",
      ],
      distal: [
        "Capitulum (Lateral rounded condyle articulating with radial head)",
        "Trochlea (Medial pulley-shaped condyle articulating with trochlear notch of ulna)",
        "Medial Epicondyle (Common flexor origin & ulnar nerve groove)",
        "Lateral Epicondyle (Common extensor origin)",
        "Olecranon, Coronoid, and Radial Fossae",
      ],
    },
    functions: [
      "Transmits rotational, compressive, and tensile kinetic energy from trunk to hand.",
      "Provides 3-dimensional multi-axis range of motion at glenohumeral joint.",
      "Houses substantial cortical bone mass resisting torsional sports loading.",
    ],
    articulations: [
      "Glenoid Cavity of Scapula (Glenohumeral Shoulder Joint)",
      "Trochlear Notch of Ulna (Humeroulnar Hinge Elbow Joint)",
      "Fovea of Radial Head (Humeroradial Elbow Joint)",
    ],
    connectedLigaments: [
      "Glenohumeral Ligaments (Superior, Middle, Inferior - IGHL complex)",
      "Coracohumeral Ligament",
      "Medial / Ulnar Collateral Ligament (UCL of elbow)",
      "Lateral / Radial Collateral Ligament (RCL of elbow)",
      "Transverse Humeral Ligament (bridging bicipital groove)",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (Bahvasthi / Nalakasthi - Arm Shaft)",
      srotas: "Asthivaha & Mamsavaha Srotas",
      doshaAffinity: "Vyana Vata (Governing limb articulation)",
      upadhatu: "Nakha & Kesha",
    },
    clinicalNotes:
      "Surgical neck fractures risk axillary nerve injury; mid-shaft spiral fractures cause radial nerve entrapment and wrist drop. Supracondylar fractures in children threaten brachial artery Volkmann ischemic contracture.",
  },

  // --------------------------------------------------------------------------
  // CONNECTIVE TISSUES: LIGAMENTS (EMERALD GREEN #10B981)
  // --------------------------------------------------------------------------
  knee_acl: {
    id: "knee_acl",
    commonName: "Anterior Cruciate Ligament (ACL)",
    latinName: "Ligamentum Cruciatum Anterius",
    category: "Ligament",
    colorCode: "#10B981",
    subParts: {
      proximal: ["Femoral Origin: Posterior aspect of medial surface of lateral femoral condyle"],
      shaft: [
        "Anteromedial (AM) Bundle (tight in flexion, controls anterior translation)",
        "Posterolateral (PL) Bundle (tight in extension, controls rotational stability)",
      ],
      distal: ["Tibial Insertion: Anterior intercondylar area of tibial plateau behind anterior horn of medial meniscus"],
    },
    functions: [
      "Provides primary restraint against anterior tibial translation relative to femur (85% of total restraint force).",
      "Secondary restraint against internal and external tibial rotation and valgus-varus stresses.",
      "Houses mechanoreceptors (Ruffini, Pacinian, and Golgi-like corpuscles) providing proprioceptive neuromuscular feedback.",
    ],
    articulations: ["Intra-articular but extra-synovial within central knee notch"],
    connectedLigaments: ["Posterior Cruciate Ligament (crosses ACL in X-configuration)", "Meniscofemoral Ligaments"],
    ayurvedicMetadata: {
      dhatu: "Snayu (Vritta Snayu - Cylindrical Ligament)",
      srotas: "Mamsavaha & Asthivaha Srotas",
      doshaAffinity: "Vyana Vayu & Sleshaka Kapha",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Non-contact pivot-deceleration tears common in sports. Positive Lachman test (>3mm excursion), pivot-shift test, and anterior drawer test. Requires bone-patellar tendon-bone or hamstring autograft reconstruction.",
  },

  knee_pcl: {
    id: "knee_pcl",
    commonName: "Posterior Cruciate Ligament (PCL)",
    latinName: "Ligamentum Cruciatum Posterius",
    category: "Ligament",
    colorCode: "#10B981",
    subParts: {
      proximal: ["Femoral Origin: Anterior aspect of lateral surface of medial femoral condyle"],
      shaft: [
        "Anterolateral (AL) Bundle (larger, tense in mid-flexion)",
        "Posteromedial (PM) Bundle (tense in extension and deep flexion)",
      ],
      distal: ["Tibial Insertion: Posterior intercondylar depression below articular surface of tibia"],
    },
    functions: [
      "Primary restraint against posterior tibial translation relative to femur (95% of total restraint force).",
      "Maintains sagittal knee congruence during deep flexion, stair descent, and squatting.",
    ],
    articulations: ["Intra-articular, extra-synovial cruciate complex of knee joint"],
    connectedLigaments: ["ACL", "Ligament of Wrisberg (Posterior Meniscofemoral)", "Ligament of Humphry"],
    ayurvedicMetadata: {
      dhatu: "Snayu (Vritta Snayu)",
      srotas: "Asthivaha & Mamsavaha Srotas",
      doshaAffinity: "Vyana Vata",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Dashboard injury (direct posterior blow to proximal tibia with knee flexed 90°); positive posterior sag (Godfrey test) and posterior drawer sign.",
  },

  knee_mcl: {
    id: "knee_mcl",
    commonName: "Medial Collateral Ligament (MCL)",
    latinName: "Ligamentum Collaterale Tibiale",
    category: "Ligament",
    colorCode: "#10B981",
    subParts: {
      proximal: ["Femoral Origin: Medial epicondyle of femur directly below adductor tubercle"],
      shaft: [
        "Superficial MCL (Primary stabilizer against valgus stress)",
        "Deep MCL (Meniscofemoral and Meniscotibial coronaries attaching to medial meniscus)",
      ],
      distal: ["Tibial Insertion: Anteromedial proximal tibial surface 4-5 cm below joint line"],
    },
    functions: [
      "Primary static stabilizer resisting knee valgus angulation and external tibial rotation.",
      "High vascularity enables excellent spontaneous healing without surgical reconstruction for isolated grade I-II sprains.",
    ],
    articulations: ["Medial compartment of Knee Joint"],
    connectedLigaments: ["Medial Meniscus (firm attachment)", "Posterior Oblique Ligament (POL)"],
    ayurvedicMetadata: {
      dhatu: "Snayu (Pratanavati Snayu - Broad Flat Ligament)",
      srotas: "Mamsavaha Srotas",
      doshaAffinity: "Vyana Vayu",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Valgus stress injury from clipping or lateral football impact. O'Donoghue Unhappy Triad: concurrent tear of ACL, MCL, and medial meniscus.",
  },

  knee_lcl: {
    id: "knee_lcl",
    commonName: "Lateral Collateral Ligament (LCL)",
    latinName: "Ligamentum Collaterale Fibulare",
    category: "Ligament",
    colorCode: "#10B981",
    subParts: {
      proximal: ["Femoral Origin: Lateral epicondyle of femur above popliteus groove"],
      shaft: ["Cord-like extracapsular free band separated from lateral meniscus by popliteus tendon"],
      distal: ["Fibular Insertion: Lateral surface of fibular head anterior to styloid process"],
    },
    functions: [
      "Primary restraint resisting varus stress and posterolateral tibial rotation.",
      "Maintains posterolateral knee corner stability working alongside popliteus complex.",
    ],
    articulations: ["Lateral compartment of Knee Joint"],
    connectedLigaments: ["Popliteofibular Ligament", "Fabellofibular Ligament", "Arcuate Ligament Complex"],
    ayurvedicMetadata: {
      dhatu: "Snayu (Vritta Snayu - Cord Ligament)",
      srotas: "Asthivaha Srotas",
      doshaAffinity: "Vyana Vata",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "High-energy varus hyperextension injury; often associated with peroneal nerve traction palsy and severe multidirectional knee instability.",
  },

  hip_iliofemoral: {
    id: "hip_iliofemoral",
    commonName: "Iliofemoral Ligament (Y-Ligament of Bigelow)",
    latinName: "Ligamentum Iliofemorale",
    category: "Ligament",
    colorCode: "#10B981",
    subParts: {
      proximal: ["Origin: Anterior Inferior Iliac Spine (AIIS) and acetabular rim"],
      shaft: ["Bifurcated inverted Y-shaped band: Lateral oblique band & Medial transverse band"],
      distal: ["Insertion: Entire length of intertrochanteric line of femur"],
    },
    functions: [
      "Strongest ligament in the entire human body (tensile strength >350 kg / 3,500 N).",
      "Prevents hyperextension of hip joint during upright bipedal stance, allowing relaxed standing with minimal muscle energy.",
      "Restrains external rotation and adduction of the femur.",
    ],
    articulations: ["Acetabulofemoral Hip Articulation"],
    connectedLigaments: ["Pubofemoral Ligament", "Ischiofemoral Ligament", "Zona Orbicularis"],
    ayurvedicMetadata: {
      dhatu: "Snayu (Maha Snayu / Pratanavati)",
      srotas: "Asthivaha Srotas",
      doshaAffinity: "Apana & Vyana Vayu",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Essential stabilizer utilized in paraplegic gait; contracted in hip flexion contractures; preserved in anterior hip arthroplasty approaches.",
  },

  // --------------------------------------------------------------------------
  // CONNECTIVE TISSUES: ARTICULAR CARTILAGE (CYAN-BLUE #06B6D4)
  // --------------------------------------------------------------------------
  knee_femoral_cartilage: {
    id: "knee_femoral_cartilage",
    commonName: "Femoral Articular Cartilage",
    latinName: "Cartilago Articularis Condylaris Femoris",
    category: "Cartilage",
    colorCode: "#06B6D4",
    subParts: {
      proximal: ["Tidemark & Calcified Cartilage Zone anchored to subchondral bone plate"],
      shaft: [
        "Deep Radial Zone (Perpendicular Type II Collagen bundles resisting shear)",
        "Middle Transitional Zone (Randomized collagen mesh holding proteoglycan aggregates)",
      ],
      distal: ["Superficial Tangential Zone (Parallel collagen fibers bathing in synovial fluid, $\mu < 0.002$)"],
    },
    functions: [
      "Provides near-frictionless gliding joint contact surface with hydraulic dampening.",
      "Distributes high contact loads up to 4-7x body weight across subchondral bone.",
      "Avascular and aneural tissue relying entirely on synovial fluid diffusion during joint movement.",
    ],
    articulations: ["Articulates with Tibial Cartilage Plateau and Retro-Patellar Cartilage"],
    connectedLigaments: ["Condylar bone bed", "Synovial membrane reflection"],
    ayurvedicMetadata: {
      dhatu: "Tarunasthi (तरुणाम्नाय / सन्धानक अस्थि)",
      srotas: "Asthivaha & Sandhivaha Srotas",
      doshaAffinity: "Sleshaka Kapha (Nourishing lubricant)",
      upadhatu: "Sandhanaka Dhatu",
    },
    clinicalNotes:
      "Cartilage fibrillation, chondromalacia, and full-thickness eburnation in Osteoarthritis (Sandhigata Vata). Poor intrinsic healing due to lack of blood supply.",
  },

  spine_disc: {
    id: "spine_disc",
    commonName: "Intervertebral Disc (L1-S1)",
    latinName: "Discus Intervertebralis",
    category: "Cartilage",
    colorCode: "#06B6D4",
    subParts: {
      proximal: ["Superior Hyaline Cartilaginous Endplate bonded to cranial vertebral body"],
      shaft: [
        "Annulus Fibrosus (15-25 concentric lamellae of alternating 65° oriented Type I Collagen)",
        "Nucleus Pulposus (Hydrated gel matrix of 80% water, Type II Collagen, and Aggrecan)",
      ],
      distal: ["Inferior Hyaline Cartilaginous Endplate bonded to caudal vertebral body"],
    },
    functions: [
      "Primary axial shock absorber of vertebral column, dissipating compressive impact.",
      "Permits multidirectional segmental flexibility: flexion, extension, lateral bend, axial rotation.",
      "Distributes hydraulic hydrostatic pressure symmetrically across endplates.",
    ],
    articulations: ["Vertebral Bodies from C2 to S1 (Amphiarthrodial Symphysis)"],
    connectedLigaments: ["Anterior Longitudinal Ligament (ALL)", "Posterior Longitudinal Ligament (PLL)"],
    ayurvedicMetadata: {
      dhatu: "Tarunasthi & Majja (सन्धानक अस्थि)",
      srotas: "Asthivaha & Majjavaha Srotas",
      doshaAffinity: "Sleshaka Kapha (disc hydration) & Apana Vata",
      upadhatu: "Snayu Bandha",
    },
    clinicalNotes:
      "Posterolateral disc herniation compressing exiting nerve root (Sciatica / Gridhrasi). Age-related disc desiccation and degenerative disc disease with loss of intervertebral height.",
  },

  costal_cartilage: {
    id: "costal_cartilage",
    commonName: "Costal Cartilages",
    latinName: "Cartilago Costalis (Ribs 1-10)",
    category: "Cartilage",
    colorCode: "#06B6D4",
    subParts: {
      proximal: ["Lateral costochondral junction inserting into anterior cup of rib shaft"],
      shaft: ["Hyaline cartilage bar traversing anterior chest wall"],
      distal: [
        "Medial sternocostal articulation for Ribs 1-7",
        "Costal margin confluence for False Ribs 8-10 joining 7th cartilage",
      ],
    },
    functions: [
      "Imparts elastic resilience and compliance to the thoracic cage during ventilation and blunt trauma.",
      "Enables continuous recoil and volumetric changes during diaphragmatic breathing cycles.",
    ],
    articulations: ["Ribs 1-10 to Sternum and Costal Margin"],
    connectedLigaments: ["Radiate Sternocostal Ligaments", "Costoxiphoid Ligaments"],
    ayurvedicMetadata: {
      dhatu: "Tarunasthi (तरुणाम्नाय)",
      srotas: "Pranavaha Srotas",
      doshaAffinity: "Prana Vata & Avalambaka Kapha",
      upadhatu: "Uras Snayu",
    },
    clinicalNotes:
      "Costochondritis (Tietze syndrome), costal cartilage slipping syndrome, calcification in elderly altering thoracic compliance.",
  },

  // --------------------------------------------------------------------------
  // CONNECTIVE TISSUES: TENDONS (BRIGHT ORANGE #F97316)
  // --------------------------------------------------------------------------
  knee_patellar_tendon: {
    id: "knee_patellar_tendon",
    commonName: "Patellar Tendon (Ligamentum Patellae)",
    latinName: "Ligamentum Patellae / Tendo Patellaris",
    category: "Tendon",
    colorCode: "#F97316",
    subParts: {
      proximal: ["Origin: Inferior apex and adjacent posterior margins of Patella"],
      shaft: ["Dense, glistening, parallel Type I Collagen fascicles (~5-6mm thick, 30mm wide)"],
      distal: ["Insertion: Tibial Tuberosity (Tuberositas Tibiae) fibrocartilaginous enthesis"],
    },
    functions: [
      "Transmits full contractile force generated by Quadriceps Femoris directly to Tibia to achieve knee extension.",
      "Resists tensile loads exceeding 10,000 N during athletic jumping and decelerations.",
      "Serves as sensory locus for the clinical patellar deep tendon reflex (L2-L4 spinal reflex arc).",
    ],
    articulations: ["Spans the Patellofemoral and Tibiofemoral joints"],
    connectedLigaments: ["Quadriceps Tendon", "Patellar Retinacula", "Infrapatellar Fat Pad (Hoffa's Fat Pad)"],
    ayurvedicMetadata: {
      dhatu: "Kandara (कण्डरा - Maha Snayu)",
      srotas: "Mamsavaha Srotas",
      doshaAffinity: "Vyana Vayu & Pitta (mechanical force transmission)",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Patellar tendinopathy (Jumper's Knee); Osgood-Schlatter disease (traction apophysitis in adolescent athletes); complete tendon rupture requiring surgical transosseous repair.",
  },

  ankle_achilles_tendon: {
    id: "ankle_achilles_tendon",
    commonName: "Achilles Tendon (Calcaneal Tendon)",
    latinName: "Tendo Calcaneus",
    category: "Tendon",
    colorCode: "#F97316",
    subParts: {
      proximal: ["Musculotendinous junction merging Gastrocnemius (medial/lateral heads) and Soleus"],
      shaft: [
        "Spiral twisting fascicles (internally rotated 90° maximizing elastic energy storage)",
        "Watershed hypovascular hypoperfusion zone 2-6 cm proximal to insertion",
      ],
      distal: ["Insertion: Posterior surface of Calcaneal Tuberosity with retrocalcaneal bursa cushion"],
    },
    functions: [
      "Thickest and strongest tendon in human anatomy; withstands tensile forces up to 10x body weight.",
      "Stores and releases elastic recoil strain energy during running and jumping (improving energetic economy).",
      "Executes powerful ankle plantarflexion required for push-off phase of bipedal gait.",
    ],
    articulations: ["Crosses Subtalar and Talocrural Ankle Joints"],
    connectedLigaments: ["Plantar Fascia (continuous fascial connection across calcaneus)"],
    ayurvedicMetadata: {
      dhatu: "Kandara (Mahakandara - Prime Achilles Tendon)",
      srotas: "Mamsavaha & Asthivaha Srotas",
      doshaAffinity: "Apana & Vyana Vayu",
      upadhatu: "Mamsa Upadhatu",
    },
    clinicalNotes:
      "Achilles tendon rupture occurs predominantly in watershed hypovascular zone during explosive push-off; positive Thompson calf squeeze test. Chronic insertional vs non-insertional tendinopathy.",
  },

  // --------------------------------------------------------------------------
  // CONNECTIVE TISSUES: JOINT CAPSULES & MENISCI (MAGENTA-PINK #EC4899)
  // --------------------------------------------------------------------------
  knee_synovial_capsule: {
    id: "knee_synovial_capsule",
    commonName: "Knee Joint Synovial Capsule & Cavity",
    latinName: "Capsula Articularis Genu & Cavitas Articularis",
    category: "Joint Capsule",
    colorCode: "#EC4899",
    subParts: {
      proximal: ["Suprapatellar Bursa (extends 5cm above patella beneath quadriceps)"],
      shaft: [
        "Fibrous Outer Envelope (Dense irregular connective tissue resisting distension)",
        "Synovial Intimal Lining (Type A phagocytic & Type B fibroblast synoviocytes producing hyaluronan)",
      ],
      distal: ["Infrapatellar Synovial Fold & Subpopliteal Recess"],
    },
    functions: [
      "Hermetically seals joint cavity and maintains negative intra-articular hydrostatic pressure.",
      "Synthesizes and filters synovial fluid rich in Hyaluronic Acid and Lubricin (PRG4) for hydrodynamic boundary lubrication.",
      "Transports metabolic nutrients and oxygen to avascular hyaline cartilage and menisci.",
    ],
    articulations: ["Encloses Tibiofemoral and Patellofemoral articulations"],
    connectedLigaments: ["MCL", "Oblique Popliteal Ligament", "Arcuate Ligament Complex"],
    ayurvedicMetadata: {
      dhatu: "Sandhi Kosha (सन्धि कोष) & Sleshaka Kapha (श्लेषक कफ)",
      srotas: "Sandhivaha Srotas",
      doshaAffinity: "Sleshaka Kapha (Prime seat of Kapha in extremities)",
      upadhatu: "Majja & Snayu",
    },
    clinicalNotes:
      "Joint effusion (water on the knee / Janu Shotha); Baker's popliteal synovial cyst; acute septic arthritis with high leukocyte count; synovitis in rheumatoid arthritis (Amavata).",
  },

  knee_meniscus: {
    id: "knee_meniscus",
    commonName: "Menisci (Medial & Lateral Meniscus)",
    latinName: "Meniscus Medialis & Lateralis",
    category: "Joint Capsule",
    colorCode: "#EC4899",
    subParts: {
      proximal: ["Superior Concave Articular Surface conforming to convex femoral condyles"],
      shaft: [
        "Medial Meniscus (C-shaped, larger, firmly anchored to MCL, less mobile)",
        "Lateral Meniscus (O-shaped, smaller, highly mobile gliding 10-12mm)",
        "Red-Red Outer Vascular Zone (healing capacity) vs White-White Avascular Inner Zone",
      ],
      distal: ["Inferior Flat Surface seated upon Tibial Plateau, anchored by Coronary Ligaments"],
    },
    functions: [
      "Absorbs and redistributes 50-70% of total compressive axial knee joint contact loads.",
      "Transforms axial compressive vectors into circumferential hoop stresses through dense collagen ring fibers.",
      "Deepens shallow tibial plateau, quadrupling joint contact area to reduce peak contact stresses.",
    ],
    articulations: ["Between Femoral Condyles and Tibial Plateau"],
    connectedLigaments: ["Transverse Genual Ligament", "Meniscofemoral Ligaments", "Coronary Ligaments"],
    ayurvedicMetadata: {
      dhatu: "Sandhanaka Asthi & Sleshaka Kapha (सन्धि चक्रिका)",
      srotas: "Asthivaha & Sandhivaha Srotas",
      doshaAffinity: "Sleshaka Kapha & Vyana Vata",
      upadhatu: "Majja & Snayu",
    },
    clinicalNotes:
      "Bucket-handle tears causing mechanical joint locking and flexion contracture; radial and horizontal cleavage tears in degenerative knees; McMurray test and joint line tenderness.",
  },

  // --------------------------------------------------------------------------
  // SKELETAL SYSTEM GROUPINGS & ARCHITECTURE
  // --------------------------------------------------------------------------
  axial_skeleton: {
    id: "axial_skeleton",
    commonName: "Axial Skeleton (Akshiya - 80 Bones)",
    latinName: "Skeleton Axiale (Columna & Thorax)",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Neurocranium (8 bones): Frontal, 2 Parietal, Occipital, 2 Temporal, Sphenoid, Ethmoid",
        "Viscerocranium (14 facial bones): 2 Maxillae, 2 Zygomatic, 2 Lacrimal, 2 Nasal, 2 Palatine, 2 Inferior Conchae, Vomer, Mandible",
        "Hyoid Bone (1) & Auditory Ossicles (6): Malleus, Incus, Stapes",
      ],
      shaft: [
        "Vertebral Column (26 functional units): 7 Cervical (C1 Atlas, C2 Axis), 12 Thoracic (T1–T12), 5 Lumbar (L1–L5)",
        "Sacrum (5 fused Kasheruka forming pelvic roof) & Coccyx (3–4 fused tail segments)",
        "Intervertebral fibrocartilage discs & neural foramen transmitting 31 pairs of spinal nerves",
      ],
      distal: [
        "Thoracic Cage (25 bones): Sternum (Manubrium, Sternal Body, Xiphoid Process)",
        "12 Pairs of Costal Ribs: 7 Pairs True Ribs (Vertebrosternal), 3 Pairs False Ribs (Vertebrochondral), 2 Pairs Floating Ribs (Vertebral)",
      ],
    },
    functions: [
      "Provides central longitudinal mechanical support, bearing and transmitting cephalic and thoracic loads to the pelvis.",
      "Protects primary vital organs: neurocranium shelters encephalon; vertebral canal guards spinal cord; thoracic cage shields heart, lungs, and mediastinum.",
      "Serves as attachment hub for paraspinal postural muscles, diaphragm, abdominal wall, and pectoral girdle.",
      "Enables dynamic multi-axial spine kinematics: flexion, extension, lateral flexion, and axial rotation.",
      "Facilitates respiratory pump-handle and bucket-handle thoracic wall elevation during pulmonary ventilation.",
    ],
    articulations: [
      "Atlanto-Occipital Joint (Ellipsoid C0-C1 articulation enabling cephalic nodding / Shiro-Dharana)",
      "Atlanto-Axial Joint (Trochoid pivot C1-C2 articulation enabling cervical rotation / Shiro-Bhramana)",
      "Zygapophyseal Facet Joints (Superior & Inferior articular processes along spine)",
      "Costovertebral and Sternocostal articulations",
      "Lumbosacral & Sacroiliac junctions connecting axial axis to appendicular pelvis",
    ],
    connectedLigaments: [
      "Anterior & Posterior Longitudinal Ligaments (ALL / PLL along vertebral bodies)",
      "Ligamentum Flavum (Elastin-dense Kasheruka band lining vertebral arch)",
      "Supraspinous, Interspinous, and Intertransverse Ligaments",
      "Nuchal Ligament (Ligamentum Nuchae)",
      "Radiate and Superior Costotransverse Ligaments anchoring ribs",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (अस्थि धातु - Prithvi & Vayu Mahabhuta dominance)",
      srotas: "Asthivaha Srotas & Majjavaha Srotas (अस्थिवह व मज्जावह स्रोतस्)",
      doshaAffinity: "Prana Vayu (Cranium & Thorax), Vyana Vayu (Movement), and Apana Vayu (Pelvic basin)",
      upadhatu: "Danta (Teeth) & Kesha (Cranial hair)",
    },
    clinicalNotes:
      "Primary clinical entities: Cervical & Lumbar Spondylosis (Manyastambha & Katigraha), Intervertebral disc herniation with radiculopathy/sciatica (Gridhrasi), Scoliosis and Kyphosis, Rib fractures with flail chest, and systemic postmenopausal Osteoporosis (Asthi Saushirya).",
  },

  appendicular_skeleton: {
    id: "appendicular_skeleton",
    commonName: "Appendicular Skeleton (Shakhasthi - 126 Bones)",
    latinName: "Skeleton Appendiculare (Membra Superiora & Inferiora)",
    category: "Bone",
    colorCode: "#F59E0B",
    subParts: {
      proximal: [
        "Pectoral Girdle (4 bones): Bilateral S-shaped Clavicles (Akshakasthi) and triangular Scapulae (Amsaphalaka)",
        "Pelvic Girdle (2 bones): Bilateral Os Coxae (Hip Bones: Ilium, Ischium, and Pubis fused at the Acetabulum)",
      ],
      shaft: [
        "Upper Extremities (60 bones): 2 Humerus, 2 Radius, 2 Ulna, 16 Carpals (Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate), 10 Metacarpals, 28 Phalanges",
        "Kinetic chain engineered for high-precision reach, grip, pollical opposition, and dexterous tool manipulation",
      ],
      distal: [
        "Lower Extremities (60 bones): 2 Femur (Urvasthei - largest long bone), 2 Patellae, 2 Tibia, 2 Fibula, 14 Tarsals (Talus, Calcaneus, Navicular, Cuboid, 3 Cuneiforms), 10 Metatarsals, 28 Phalanges",
        "Weight-bearing column engineered for bipedal upright standing, ground-reaction shock dissipation, and propulsive gait",
      ],
    },
    functions: [
      "Powers somatic locomotion, bipedal balance, walking, running, and athletic propulsion through kinetic lever action.",
      "Provides multi-axis upper extremity mobility allowing 3D spherical reaching and fine digital opposition grasping.",
      "Distributes upper body weight through the pelvic ring, femoral shafts, and tibial plateaus into the triangular plantar arches.",
      "Serves as rigid lever arms (Class I, II, and III) magnifying skeletal muscle contraction forces.",
      "Absorbs impact stresses through meniscal cushions, synovial fluid viscosity, and elastic ligamentous pretension.",
    ],
    articulations: [
      "Sternoclavicular & Acromioclavicular Joints (Only skeletal link between arm and axial skeleton)",
      "Glenohumeral Joint (Ball-and-Socket - greatest range of motion in human body)",
      "Humeroulnar and Radioulnar Elbow & Forearm articulations",
      "Radiocarpal and Intercarpal Wrist Joints",
      "Acetabulofemoral Hip Joint & Tibiofemoral / Patellofemoral Knee Joints",
      "Talocrural Ankle Mortise & Subtalar Tarsal Joints",
    ],
    connectedLigaments: [
      "Iliofemoral, Pubofemoral, and Ischiofemoral Hip Ligaments",
      "Anterior & Posterior Cruciate Ligaments (ACL & PCL)",
      "Medial & Lateral Collateral Ligaments of Knee and Elbow",
      "Glenoid & Acetabular fibrocartilaginous Labra",
      "Achilles Tendon, Patellar Tendon, and Plantar Aponeurosis",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (अस्थि धातु) supported by Mamsa & Snayu Upadhatu",
      srotas: "Mamsavaha & Asthivaha Srotas (Shakha Margas)",
      doshaAffinity: "Vyana Vayu (governing all peripheral circulation, motor transmission, flexion, and extension) & Sleshaka Kapha",
      upadhatu: "Snayu (Ligamentous cords) & Kandara (Tendon fascicles)",
    },
    clinicalNotes:
      "Prevalent disorders: Osteoarthritis (Sandhigata Vata) in knees and hips, Femoral neck subcapital fractures, FOOSH Colles' wrist fractures, Rotator cuff tendonitis, Carpal tunnel median nerve entrapment, and knee ACL/meniscal tears from torsional sporting trauma.",
  },

  tissue_architecture: {
    id: "tissue_architecture",
    commonName: "Anatomical Tissue Architecture (Asthi Rachana)",
    latinName: "Architectura Textus Ossei & Dhatu Bandhana",
    category: "Bone",
    colorCode: "#EAE3D2",
    subParts: {
      proximal: [
        "Cortical / Compact Bone (बाह्य दृढास्थि): Dense, hard outer cylinder composed of cylindrical Osteons (Haversian systems), concentric lamellae, osteocytes in lacunae, communicating canaliculi, and Volkmann's perforating canals.",
        "Periosteum (अस्थि-धरा कला): Vascular double-layered fibroelastic membrane covering external bone surfaces with outer fibrous layer and inner cellular osteogenic cambium layer anchored by Sharpey's perforating fibers.",
      ],
      shaft: [
        "Cancellous / Trabecular / Spongy Bone (सुषिरास्थि): Porous, honeycomb-like 3D lattice composed of interconnecting trabecular plates and spicules aligned precisely along trajectories of mechanical stress (Wolff's Law).",
        "Endosteum: Delicate cellular membrane lining the internal medullary marrow cavity, vascular canals, and trabeculae containing active osteoblasts, osteoclasts, and osteoprogenitor cells.",
      ],
      distal: [
        "Medullary Cavity & Majja Dhatu (मज्जा गुहा): Central cylindrical canal housing active hematopoietic Red Bone Marrow (erythrogenesis) in axial/epiphyseal regions and fatty Yellow Bone Marrow (adipocytes) in long bone shafts.",
        "Articular Hyaline Cartilage (तरुणास्थि): Avascular, aneural resilient protective cap formed of Type II collagen and water-binding aggrecan proteoglycans covering articulating epiphyseal ends.",
      ],
    },
    functions: [
      "Dual Mechanical Optimization: Dense cortical shell delivers high modulus of elasticity and bending stiffness, while porous cancellous core absorbs energetic impacts with minimum weight.",
      "Mineral Homeostasis Depot: Serves as the principal metabolic reservoir for 99% of bodily calcium and 85% of phosphorus, dynamically regulated by PTH, Calcitonin, and Calcitriol.",
      "Hematopoiesis (Rakta Dhatu Utpatti): Medullary cavities and trabecular sinusoids produce red blood cells, white blood cells, and platelets under erythropoietin regulation.",
      "Continuous Cellular Remodeling: Osteoclasts resorb fatigued micro-damaged bone matrix through proton pumping (H+ dissolution), followed by osteoblastic secretion of collagenous osteoid and hydroxyapatite mineralization.",
    ],
    articulations: [
      "Osteon-to-Osteon cement lines and lamellar junctions",
      "Osteochondral interface (Calcified cartilage zone & tidemark boundary)",
      "Entheses: Mineralized fibrocartilaginous insertions of tendons and ligaments into cortical bone",
    ],
    connectedLigaments: [
      "Sharpey's Perforating Fibers (collagen bundles securing periosteum to cortical bone)",
      "Fibrocartilaginous enthesial zones distributing tendon and ligament shear loads",
    ],
    ayurvedicMetadata: {
      dhatu: "Asthi Dhatu (अस्थि) nurtured by Medas and nurturing Majja Dhatu (मज्जा)",
      srotas: "Asthivaha Srotas (Rooted in Medas & Jaghana) and Majjavaha Srotas (Rooted in Asthi & Sandhi)",
      doshaAffinity: "Vata Dosha (resides primarily in Asthi Dhatu; Vayu creates porous Kasheruka canals, Akasha provides space, Prithvi provides bone hardness)",
      upadhatu: "Danta (Teeth) & Kesha/Nakha (Hair & Nails)",
    },
    clinicalNotes:
      "Key clinical conditions: Osteoporosis (Asthi Saushirya - trabecular thinning and fracture fragility), Osteopenia, Osteomalacia/Rickets (Phakka Roga - deficient matrix mineralization), Osteomyelitis (Asthi Paka / suppurative infection), Stress fractures, and Avascular Necrosis (AVN) of bone marrow.",
  },

  cortical_bone: {
    id: "cortical_bone",
    commonName: "Cortical Bone (Compact Bone / बाह्य दृढास्थि)",
    latinName: "Substantia Compacta",
    category: "Bone",
    colorCode: "#EAE3D2",
    subParts: {
      proximal: ["Haversian Systems (Osteons) running parallel to long axis of bone", "Central Haversian Canals containing neurovascular bundles"],
      shaft: ["Concentric Lamellae (calcified collagen rings)", "Lacunae housing mature Osteocytes", "Communicating Canaliculi providing nutrient diffusion"],
      distal: ["Volkmann's Canals perforating perpendicularly from periosteum", "Outer Circumferential Lamellae resisting external torque"],
    },
    functions: [
      "Constitutes approximately 80% of total human skeletal mass, providing maximum compressive and flexural rigidity.",
      "Forms the dense outer cortex of all bones and the entire thick cylindrical wall of long bone diaphyses.",
      "Protects internal spongy bone and delicate medullary bone marrow cavities from traumatic external impacts.",
    ],
    articulations: ["Continuous with articular subchondral plate at epiphyses"],
    connectedLigaments: ["Direct insertion site for Sharpey's fibers and ligamentous entheses"],
    ayurvedicMetadata: {
      dhatu: "Ghanasthi (घनास्थि - Dense Asthi Dhatu)",
      srotas: "Asthivaha Srotas (Prithvi Mahabhuta predominance)",
      doshaAffinity: "Vata Dosha (Akasha creates canaliculi; Prithvi provides density)",
      upadhatu: "Danta & Kesha",
    },
    clinicalNotes:
      "Susceptible to cortical stress fractures under repetitive unaccustomed cyclic loading; cortical thinning is the hallmark metric evaluated on dual-energy X-ray absorptiometry (DEXA) for osteoporosis.",
  },

  cancellous_bone: {
    id: "cancellous_bone",
    commonName: "Cancellous Bone (Trabecular / Spongy / सुषिरास्थि)",
    latinName: "Substantia Spongiosa",
    category: "Bone",
    colorCode: "#D8CBB5",
    subParts: {
      proximal: ["Interconnecting 3D Trabecular plates and rods aligned with stress lines", "High surface area-to-mass ratio (~10x that of cortical bone)"],
      shaft: ["Intertrabecular spaces packed with vascular hematopoietic Red Marrow", "Thin trabecular lamellae nourished directly by marrow diffusion"],
      distal: ["Subchondral trabecular lattice cushioning articulating joint surfaces"],
    },
    functions: [
      "Provides lightweight internal structural support, reducing skeletal weight while maintaining maximum shock-absorbing resilience.",
      "Dynamically reorganizes its trabecular orientation according to Wolff's Law in response to habitual gravitational loads.",
      "Serves as the primary active site of mineral exchange and metabolic turnover due to its large surface area.",
    ],
    articulations: ["Internal support for articular condyles and vertebral endplates"],
    connectedLigaments: ["Anchored externally by the overlying cortical bone shell"],
    ayurvedicMetadata: {
      dhatu: "Sushira Asthi (सुषिरास्थि - Porous Asthi Dhatu)",
      srotas: "Majjavaha & Asthivaha Srotas",
      doshaAffinity: "Vayu and Akasha Mahabhuta predominance creating internal porous spaces",
      upadhatu: "Majja Dhatu support",
    },
    clinicalNotes:
      "Because of its high metabolic turnover rate (8x higher than cortical bone), cancellous bone is the earliest and most severely affected site in osteoporotic bone loss, leading to vertebral compression fractures and femoral head collapse.",
  },

  medullary_cavity: {
    id: "medullary_cavity",
    commonName: "Medullary Cavity & Majja Dhatu (मज्जा गुहा)",
    latinName: "Cavitas Medullaris",
    category: "Bone",
    colorCode: "#A83232",
    subParts: {
      proximal: ["Red Bone Marrow (Medulla Ossium Rubra): Active hematopoietic tissue producing erythrocytes and immune cells"],
      shaft: ["Yellow Bone Marrow (Medulla Ossium Flava): Adipose-rich mesenchymal tissue serving as lipid reserve"],
      distal: ["Endosteum: Monocellular vascular membrane lining the cavity with osteogenic precursors"],
    },
    functions: [
      "Continuous hematopoiesis producing approximately 500 billion new blood cells daily under humoral feedback control.",
      "Reservoir of mesenchymal stem cells (MSCs) capable of differentiating into osteoblasts, chondrocytes, and adipocytes.",
      "Reduces skeletal mass by creating a hollow cylinder design that maximizes resistance to bending with minimum material weight.",
    ],
    articulations: ["Internal vascular connection with nutrient arteries and Haversian systems"],
    connectedLigaments: ["Endosteal network linked to intraosseous nerve and blood vessels"],
    ayurvedicMetadata: {
      dhatu: "Majja Dhatu (मज्जा धातु - 6th tissue layer, pure unctuous essence of bones)",
      srotas: "Majjavaha Srotas (Rooted in Asthi & Sandhi)",
      doshaAffinity: "Kapha (Sneha unctuousness) and Vata balance",
      upadhatu: "Produces Shukra Dhatu (ओजस् / Reproductive vitality)",
    },
    clinicalNotes:
      "Aplastic anemia, Leukemia, Osteomyelitis (marrow cavity infection requiring surgical debridement and targeted antibiotics), and fat embolism syndrome following long bone fractures.",
  },

  periosteum: {
    id: "periosteum",
    commonName: "Periosteum & Asthi-Dhara Kala (अस्थि-धरा कला)",
    latinName: "Periosteum",
    category: "Bone",
    colorCode: "#D49B4B",
    subParts: {
      proximal: ["Outer Fibrous Layer: Dense irregular connective tissue containing fibroblasts, collagen bundles, and capillaries"],
      shaft: ["Inner Osteogenic Cambium Layer: Pluripotent osteoprogenitor cells and osteoblasts responsible for appositional growth"],
      distal: ["Sharpey's Perforating Fibers: Strong collagen cords drilling perpendicularly into outer circumferential cortical lamellae"],
    },
    functions: [
      "Powers appositional (width/thickness) bone growth throughout development and drives fracture callus formation during healing.",
      "Provides rich periosteal blood supply nourishing outer third of cortical bone through Volkmann canals.",
      "Houses dense sensory nociceptive nerve plexus, making the periosteum the most pain-sensitive tissue in the musculoskeletal system.",
    ],
    articulations: ["Continuous with fibrous joint capsules and aponeurotic insertions at bone ends"],
    connectedLigaments: ["Anchors tendon and ligament entheses directly to cortical bone"],
    ayurvedicMetadata: {
      dhatu: "Asthi-Dhara Kala (अस्थिधरा कला - 5th anatomical membrane)",
      srotas: "Asthivaha & Mamsavaha Srotas",
      doshaAffinity: "Vyana Vata (sensory conduction) & Pitta (healing metabolism)",
      upadhatu: "Kala & Snayu Upadhatu",
    },
    clinicalNotes:
      "Periostitis (Shin splints from repetitive traction), subperiosteal hematoma, exquisite somatic pain in bone fractures, and osteosarcoma elevating periosteum (Codman's triangle on radiograph).",
  },

  articular_cartilage: {
    id: "articular_cartilage",
    commonName: "Articular Hyaline Cartilage (तरुणास्थि)",
    latinName: "Cartilago Articularis",
    category: "Cartilage",
    colorCode: "#38BDF8",
    subParts: {
      proximal: ["Superficial Tangential Zone (Zone I): Densely packed parallel Type II collagen fibers resisting joint shear"],
      shaft: ["Middle Transitional Zone (Zone II) & Deep Radial Zone (Zone III): Vertically aligned collagen with high aggrecan proteoglycan density"],
      distal: ["Calcified Cartilage Zone (Zone IV): Anchored across the tidemark to the underlying subchondral cortical bone plate"],
    },
    functions: [
      "Provides an ultra-smooth, near-frictionless gliding bearing surface (coefficient of friction ~0.002 to 0.005).",
      "Deforms elastically under cyclic joint loading to distribute contact stresses over an enlarged area.",
      "Pumps synovial fluid in and out of its porous matrix during motion to nourish its avascular chondrocytes.",
    ],
    articulations: ["Directly lines articulating bone surfaces of all diarthrodial synovial joints"],
    connectedLigaments: ["Enclosed by the vascular synovial capsule bathed in Sleshaka Kapha"],
    ayurvedicMetadata: {
      dhatu: "Tarunasthi / Sandhanaka Asthi (तरुणाम्नाय)",
      srotas: "Asthivaha & Sandhivaha Srotas",
      doshaAffinity: "Sleshaka Kapha (viscous hydrodynamic lubrication) & Vata protection",
      upadhatu: "Sandhi Kosha & Snayu",
    },
    clinicalNotes:
      "Aneural and avascular nature severely limits intrinsic regenerative capacity; progressive mechanical wear and proteoglycan depletion lead to Osteoarthritis (Sandhigata Vata), joint space narrowing, and painful subchondral bone eburnation.",
  },

  // --------------------------------------------------------------------------
  // 11 ANATOMICAL SYSTEMS: CANONICAL ORGAN & VISCERAL RECORDS
  // --------------------------------------------------------------------------
  cardiovascular_heart: {
    id: "cardiovascular_heart",
    commonName: "Cardiovascular System (Heart & Great Vessels)",
    latinName: "Cor & Systema Cardiovasculare",
    category: "Cardiovascular",
    colorCode: "#E53935",
    subParts: {
      proximal: ["Right & Left Atria, Superior/Inferior Vena Cava, Sinoatrial (SA) & Atrioventricular (AV) Nodes"],
      shaft: ["Right & Left Ventricles, Interventricular Septum, Tricuspid & Mitral (Bicuspid) Valves"],
      distal: ["Ascending Aorta, Aortic Arch with 3 Supra-Aortic Trunks, Pulmonary Trunk & Coronary Arteries"],
    },
    functions: [
      "Pumps approximately 5.0 L/min of blood to maintain continuous systemic and pulmonary perfusion pressure.",
      "Generates synchronized electromechanical systole and diastole cycles to distribute oxygenated blood to all 7 dhatus.",
      "Secretes Atrial Natriuretic Peptide (ANP) in response to atrial stretch, regulating intravascular volume and renal sodium excretion.",
    ],
    articulations: ["Encased within middle mediastinum behind sternum (ribs 2-6) anterior to thoracic vertebrae T5-T8"],
    connectedLigaments: ["Pericardiacophrenic ligaments anchoring the fibrous pericardium to the diaphragm"],
    ayurvedicMetadata: {
      dhatu: "Rasa & Rakta Dhatu (रस व रक्त धातु)",
      srotas: "Rasavaha & Raktavaha Srotas (मूलं हृदयं रसवाहिन्यश्च धमन्यः)",
      doshaAffinity: "Sadhaka Pitta (intellect & emotions), Vyana Vayu (circulation) & Avalambaka Kapha",
      upadhatu: "Sira (शिरा - Blood Vessels) & Kandara",
    },
    clinicalNotes:
      "Designated as a supreme Sadyah Pranahara Marma and seat of Para Ojas (8 drops) and Chetana (consciousness). Susceptible to coronary artery disease, myocardial infarction (Hridroga), hypertension, and heart failure.",
  },

  nervous_brain: {
    id: "nervous_brain",
    commonName: "Central Nervous System (Brain & Spinal Cord)",
    latinName: "Encephalon & Medulla Spinalis",
    category: "Nervous",
    colorCode: "#00E5FF",
    subParts: {
      proximal: ["Cerebrum (Frontal, Parietal, Temporal, Occipital lobes with gyri and sulci, Corpus Callosum)"],
      shaft: ["Diencephalon (Thalamus, Hypothalamus), Brainstem (Midbrain, Pons, Medulla Oblongata), Cerebellum"],
      distal: ["Spinal Cord Axis (C1–L2), Conus Medullaris, Cauda Equina, 31 pairs of Spinal Nerves"],
    },
    functions: [
      "Highest integration centre of consciousness, cognition, memory, voluntary locomotion, and sensory perception.",
      "Autonomic nervous regulation of vital cardiovascular, respiratory, and vasomotor centers in the brainstem.",
      "High-speed bioelectric action potential propagation along myelinated axons via saltatory conduction.",
    ],
    articulations: ["Housed securely within neurocranium vault (Kapalasthi) and articulated vertebral canal"],
    connectedLigaments: ["Meningeal layers (Dura, Arachnoid, Pia Mater) and Denticulate ligaments anchoring cord"],
    ayurvedicMetadata: {
      dhatu: "Majja Dhatu (मज्जा धातु - Neuro-Medullary Essence)",
      srotas: "Majjavaha & Manovaha Srotas (शिरो मज्जावहं स्रोतस्)",
      doshaAffinity: "Prana Vayu (governing intellect & senses), Tarpaka Kapha (cerebral lubrication) & Sadhaka Pitta",
      upadhatu: "Netra Sneha & Twak Sneha (Ocular and epidermal unctuousness)",
    },
    clinicalNotes:
      "Shiras is designated as Uttamanga (supreme organ) housing all sensory indriyas. Susceptible to ischemic stroke (Pakshaghata), traumatic brain injury (Shiromarma abhighata), and neurodegenerative disorders.",
  },

  digestive_viscera: {
    id: "digestive_viscera",
    commonName: "Digestive Viscera (Gastrointestinal & Hepatobiliary System)",
    latinName: "Systema Digestorium & Hepar",
    category: "Digestive",
    colorCode: "#FF7043",
    subParts: {
      proximal: ["Esophagus, Lower Esophageal Sphincter, Gastric Cardia, Fundus & Body of Stomach"],
      shaft: ["Multilobar Liver (Lobus Hepatis Dexter/Sinister), Gallbladder (Vesica Biliaris), Pancreas"],
      distal: ["Pyloric Antrum, Duodenum C-loop, Jejunum, Ileum, Cecum, Ascending/Transverse/Descending Colon, Rectum"],
    },
    functions: [
      "Mechanical churning and enzymatic hydrolysis of ingested macronutrients into assimilable micromolecules.",
      "Gastric parietal secretion of hydrochloric acid (pH 1.5–2.0) and intrinsic factor; hepatic synthesis of bile salts for lipid emulsification.",
      "Selective nutrient absorption across microvillus brush border enterocytes into mesenteric portal venous circulation.",
    ],
    articulations: ["Suspended in abdominopelvic cavity by greater and lesser omenta, anterior to lumbar spine"],
    connectedLigaments: ["Falciform ligament, Coronary ligaments of liver, Hepatoduodenal ligament"],
    ayurvedicMetadata: {
      dhatu: "Pachaka Pitta & Jatharagni (जाठराग्नि रूप पाचक पित्त)",
      srotas: "Annavaha & Purishavaha Srotas (मूलं आमाशयः अन्नवाहिन्यश्च धमन्यः)",
      doshaAffinity: "Samana Vayu (peristalsis), Pachaka Pitta (metabolic transformation) & Kledaka Kapha (moisture)",
      upadhatu: "Ahara Rasa (आहार रस - Primordial nutrient plasma)",
    },
    clinicalNotes:
      "Core operational center of Jatharagni; impaired agni (Mandagni) leads to formation of Ama (toxic antigenic endotoxins), causing Grahani, Amlapitta, peptic ulcers, and metabolic syndrome.",
  },

  respiratory_lungs: {
    id: "respiratory_lungs",
    commonName: "Respiratory System (Lungs & Bronchial Tree)",
    latinName: "Pulmones & Arbor Bronchialis",
    category: "Respiratory",
    colorCode: "#4FC3F7",
    subParts: {
      proximal: ["Larynx (Thyroid, Cricoid, Epiglottic Cartilages), Vocal Cords, Trachea with 16-20 C-rings"],
      shaft: ["Carina Tracheae, Right & Left Mainstem Bronchi, Lobar & Segmental Bronchial Branching"],
      distal: ["Bilateral Compliant Lungs (Right 3 lobes, Left 2 lobes with cardiac notch), 300 Million+ Alveoli"],
    },
    functions: [
      "Continuous alveolar-capillary oxygen and carbon dioxide diffusion driven by partial pressure gradients.",
      "Pulmonary ventilation through sub-atmospheric intrapleural pressure generated by diaphragm and intercostal contractions.",
      "Type II pneumocyte secretion of dipalmitoylphosphatidylcholine (DPPC) surfactant preventing alveolar collapse.",
    ],
    articulations: ["Enclosed within thoracic cage (12 pairs of ribs, sternum, thoracic spine, diaphragm)"],
    connectedLigaments: ["Pulmonary ligaments anchoring mediastinal visceral pleura to the hilum"],
    ayurvedicMetadata: {
      dhatu: "Rasa & Rakta Oxygenation (रस-रक्त प्राण पोषण)",
      srotas: "Pranavaha Srotas (मूलं हृदयं महास्रोतश्च)",
      doshaAffinity: "Prana Vayu (inhalation), Udana Vayu (exhalation/speech) & Avalambaka Kapha",
      upadhatu: "Poshaka Rasa (Vital nutrient carrier)",
    },
    clinicalNotes:
      "Direct anatomical channel for Prana Vayu; susceptible to Tamaka Shwasa (Bronchial Asthma), Kasa (cough), COPD, pneumonia, and respiratory distress syndrome.",
  },

  integumentary_skin: {
    id: "integumentary_skin",
    commonName: "Integumentary System (Cutaneous Body Enclosure)",
    latinName: "Systema Integumentarium & Cutis",
    category: "Integumentary",
    colorCode: "#E2C3A8",
    subParts: {
      proximal: ["Epidermis (Stratum Corneum, Lucidum, Granulosum, Spinosum, Basale with active Melanocytes)"],
      shaft: ["Dermis (Papillary Dermis with Meissner corpuscles, Reticular Dermis with Type I Collagen and Elastin)"],
      distal: ["Hypodermis (Subcutaneous adipose layer, Pacinian corpuscles, Sebaceous & Eccrine Sweat Glands)"],
    },
    functions: [
      "Primary mechanical, microbial, and chemical barrier shielding internal viscera against external trauma.",
      "Thermoregulation through autonomic cutaneous vasodilation/vasoconstriction and eccrine diaphoresis.",
      "Photoprotection via melanogenesis and 7-dehydrocholesterol photochemical conversion to Vitamin D3.",
    ],
    articulations: ["Continuous exterior envelope covering complete 1.74m anatomical human silhouette"],
    connectedLigaments: ["Retinacula cutis skin ligaments anchoring hypodermis to underlying deep investing fascia"],
    ayurvedicMetadata: {
      dhatu: "Rasa Dhatu Upadhatu (रसधातोः उपधातुः त्वचा)",
      srotas: "Swedavaha & Rasavaha Srotas (मूलं मेदः लोमकूपाश्च)",
      doshaAffinity: "Bhrajaka Pitta (imparting luster, warmth & complexion) & Vyana Vayu (tactile sensation)",
      upadhatu: "Twacha (सप्त स्तर त्वचा - Sushruta Samhita)",
    },
    clinicalNotes:
      "Described by Acharya Sushruta as having 7 distinct layers (Avabhasini to Mamsadhara). Clinical conditions include Kitibha (Psoriasis), Kushtha (Dermatosis), eczema, and full-thickness thermal burns.",
  },

  lymphatic_spleen: {
    id: "lymphatic_spleen",
    commonName: "Lymphatic & Reticuloendothelial System",
    latinName: "Systema Lymphoideum & Splen",
    category: "Lymphatic",
    colorCode: "#66BB6A",
    subParts: {
      proximal: ["Bilobed Thymus in superior/anterior mediastinum, Cervical and Axillary Lymph Node clusters"],
      shaft: ["Thoracic Duct, Cisterna Chyli, Right Lymphatic Duct, Inguinal and Mesenteric Lymph Nodes"],
      distal: ["Spleen (Lien / Splen in left hypochondrium: Red Pulp for RBC clearance, White Pulp for immune defense)"],
    },
    functions: [
      "Interstitium fluid surveillance and drainage, returning filtered clear lymph into systemic venous subclavian angles.",
      "Adaptive immune clonal selection, antigen presentation, and antibody synthesis in germinal centers.",
      "Splenic filtration of senescent erythrocytes and platelet pooling.",
    ],
    articulations: ["Spleen lies in left hypochondrium between gastric fundus, diaphragm, and left kidney (ribs 9-11)"],
    connectedLigaments: ["Gastrosplenic and Splenorenal peritoneal ligaments"],
    ayurvedicMetadata: {
      dhatu: "Rasa Dhatu & Ojas (रस धातु व ओजस् - व्याधिक्षमत्व)",
      srotas: "Raktavaha & Udakavaha Srotas (रक्तवहस्य स्रोतसो यकृन्मूलं प्लीहा च)",
      doshaAffinity: "Avalambaka Kapha (fluid balance) & Vyana Vayu (lymphatic propulsion)",
      upadhatu: "Lasika (लसीका) & Para/Apara Ojas",
    },
    clinicalNotes:
      "Pleeha is designated as the root of Raktavaha Srotas; essential for Bala (immunity). Pathologies include Pleehodara (Splenomegaly), lymphedema, Hodgkin lymphoma, and autoimmune cytopenias.",
  },

  endocrine_axis: {
    id: "endocrine_axis",
    commonName: "Endocrine System (Ductless Hormonal Glands)",
    latinName: "Systema Endocrineum",
    category: "Endocrine",
    colorCode: "#FFCA28",
    subParts: {
      proximal: ["Pituitary Master Gland (Hypophysis in Sella Turcica: Adenohypophysis & Neurohypophysis)"],
      shaft: ["Thyroid Gland (Bilateral lobes & Isthmus flanking larynx), 4 Parathyroid Glands, Pancreatic Islets"],
      distal: ["Bilateral Suprarenal Adrenal Glands (Adrenal Cortex: Aldosterone/Cortisol; Adrenal Medulla: Epinephrine)"],
    },
    functions: [
      "Ductless humoral chemical coordination controlling metabolic rate, growth, fluid balance, and stress adaptation.",
      "Negative feedback endocrine loops: Hypothalamic-Pituitary-Adrenal (HPA) and Hypothalamic-Pituitary-Thyroid (HPT) axes.",
      "Insulin-glucagon pancreatic counter-regulation governing systemic carbohydrate and lipid homeostatic flux.",
    ],
    articulations: ["Distributed cranially in sella turcica, cervically over trachea, and retroperitoneally above kidneys"],
    connectedLigaments: ["Pretracheal fascia enveloping thyroid; Gerota's renal fascia investing suprarenals"],
    ayurvedicMetadata: {
      dhatu: "Sukshma Dhatvagni & Ojas (सूक्ष्म धात्वाग्नि व ओजस्)",
      srotas: "Rasavaha, Medovaha & Shukravaha Srotas (धातुरस संवहन)",
      doshaAffinity: "Sadhaka Pitta (neuro-hormonal catalysts), Prana Vayu & Samana Vayu",
      upadhatu: "Dhatu-Poshaka Rasa (Metabolic transformation messengers)",
    },
    clinicalNotes:
      "Granthi hormones represent biochemical catalysts for Dhatu-Paka; dysfunctions manifest as Prameha (Diabetes Mellitus), Galaganda (Goiter), Addison disease, and Cushing syndrome.",
  },

  urinary_kidneys: {
    id: "urinary_kidneys",
    commonName: "Urinary System (Kidneys, Ureters & Bladder)",
    latinName: "Apparatus Urinarius & Renes",
    category: "Urinary",
    colorCode: "#AB47BC",
    subParts: {
      proximal: ["Bilateral Retroperitoneal Kidneys (Renal Capsule, Cortex with 1M Nephrons, Medullary Pyramids)"],
      shaft: ["Renal Pelvis, Bilateral Peristaltic Ureters (25-30cm length descending retroperitoneally)"],
      distal: ["Urinary Bladder (Detrusor Muscle, Trigone, Ureteral Orifices), Internal & External Urethral Sphincters"],
    },
    functions: [
      "Ultrafiltration of 180 L/day plasma filtrate, excreting nitrogenous urea, uric acid, and metabolic toxins.",
      "Countercurrent multiplier mechanism in loop of Henle maintaining blood osmolarity and arterial blood pressure.",
      "Endocrine synthesis of Renin, Erythropoietin (EPO), and 1,25-dihydroxycholecalciferol (Active Vitamin D).",
    ],
    articulations: ["Kidneys flank T12–L3 vertebrae retroperitoneally; Bladder housed in pelvic basin behind symphysis pubis"],
    connectedLigaments: ["Renal fascia (Gerota's fascia), Median and medial umbilical ligaments of bladder"],
    ayurvedicMetadata: {
      dhatu: "Meda Dhatu & Kitta Mala (मेद धातु व मूत्र मल)",
      srotas: "Mutravaha Srotas (मूलं बस्तिर्वंक्षणौ च)",
      doshaAffinity: "Apana Vayu (downward excretory impulse) & Kledaka Kapha (fluid balance)",
      upadhatu: "Mutra (मूत्र - Liquid metabolic excretum)",
    },
    clinicalNotes:
      "Basti is recognized as one of the three supreme Trimarma organs. Clinical pathologies include Ashmari (Nephrolithiasis / Kidney Stones), Mutrakrichhra (Dysuria), and End-Stage Renal Disease.",
  },

  reproductive_pelvic: {
    id: "reproductive_pelvic",
    commonName: "Reproductive System (Pelvic Reproductive Organs)",
    latinName: "Systema Reproductionis",
    category: "Reproductive",
    colorCode: "#EC407A",
    subParts: {
      proximal: ["Gonadal Axis (Testes / Ovaries producing haploid gametes and sex steroid hormones)"],
      shaft: ["Internal Pelvic Ductal System (Vas Deferens, Seminal Vesicles, Prostate / Fallopian Tubes & Uterus)"],
      distal: ["External Genitalia, Pudendal Neurovascular Bundle, and Pelvic Diaphragm (Levator Ani) Musculature"],
    },
    functions: [
      "Gametogenesis (spermatogenesis / oogenesis) ensuring genetic transmission and somatic continuity.",
      "Steroidogenesis generating testosterone, estradiol, and progesterone driving secondary sexual dimorphism.",
      "Pelvic autonomically mediated vascular and neuro-endocrine response loops.",
    ],
    articulations: ["Contained within pelvic basin bounded by ilium, ischium, pubis, sacrum, and coccyx"],
    connectedLigaments: ["Broad ligament, Round ligament, Uterosacral ligament, and Ovarian ligament complexes"],
    ayurvedicMetadata: {
      dhatu: "Shukra & Artava Dhatu (शुक्र व आर्तव धातु - सौम्यं सर्वशरीरव्यापि)",
      srotas: "Shukravaha & Artavavaha Srotas (मूलं स्तनौ गर्भाशयश्च / वृषणौ शेफश्च)",
      doshaAffinity: "Apana Vayu (emission / ovulation) & Saumya Kapha",
      upadhatu: "Stanya (Breast Milk) & Ojas (Primordial radiance)",
    },
    clinicalNotes:
      "Shukra permeates the entire bodily matrix like ghee in milk; ultimate substrate for physical stamina, courage, and luminous Ojas. Conditions include Klaibya, Vandhyatva, endometriosis, and endocrine gonadal failure.",
  },

  muscular_fullbody: {
    id: "muscular_fullbody",
    commonName: "Muscular System (Striated Skeletal Musculature)",
    latinName: "Systema Musculare",
    category: "Muscular",
    colorCode: "#D32F2F",
    subParts: {
      proximal: ["Axial Skeletal Musculature (Pectoralis Major, Latissimus Dorsi, Trapezius, Rectus Abdominis 6-pack)"],
      shaft: ["Appendicular Arm & Leg Musculature (Deltoid, Biceps/Triceps Brachii, Quadriceps Femoris, Hamstrings)"],
      distal: ["Distal Stabilizers (Gastrocnemius, Soleus, Forearm Flexors/Extensors, Thenar intrinsic hand muscles)"],
    },
    functions: [
      "Generates voluntary somatic locomotion, posture maintenance, and joint stabilization via actomyosin power strokes.",
      "Non-shivering and shivering thermogenesis through rapid ATP hydrolysis during muscular contractions.",
      "Muscle pump action accelerating deep venous blood and lymphatic return toward the heart against gravity.",
    ],
    articulations: ["Directly envelopes the 1.70m skeletal frame, anchoring onto periosteum via strong collagen tendons"],
    connectedLigaments: ["Epimysium, perimysium, and deep investing muscular fascia continuous with joint capsules"],
    ayurvedicMetadata: {
      dhatu: "Mamsa Dhatu (मांस धातु - मांसं मेदः पुष्यति शरीरे बलं च जनयति)",
      srotas: "Mamsavaha Srotas (मूलं स्नायुत्वचं रक्तवहाश्च धमन्यः)",
      doshaAffinity: "Vyana Vayu (contractile impulse) & Kapha Dhatu (structural mass and stamina)",
      upadhatu: "Vasa (Muscle Fat) & Twak Shad (Seven skin layers)",
    },
    clinicalNotes:
      "Mamsa Lepana (enveloping, padding, and shielding internal visceral organs and bones); confers physical strength (Bala) and vitality (Utsaha). Susceptible to muscle tears, sarcopenia, myasthenia gravis, and Mamsagata Vata.",
  },
};

// ============================================================================
// RESOLVER HELPER FUNCTION: MATCH ANY THREE.JS MESH TO COMPLETE DATA MODEL
// ============================================================================

export function resolveAnatomicalStructureData(
  mesh: THREE.Mesh
): AnatomicalStructureData {
  const meshName = (mesh.name || "").toLowerCase();
  const userData = mesh.userData || {};
  const structId = (userData.structureId || "").toLowerCase();
  const structName = (userData.structureName || "").toLowerCase();
  const boneCat = (userData.boneCategory || "").toLowerCase();
  const sysId = (userData.systemId || "").toLowerCase();

  const searchTokens = `${meshName} ${structId} ${structName} ${boneCat} ${sysId}`.toLowerCase();

  // 1. Direct key match in database
  if (userData.structureId && ANATOMICAL_DATABASE[userData.structureId]) {
    return ANATOMICAL_DATABASE[userData.structureId];
  }

  // 2. Organ & System Match
  if (sysId === "cardiovascular" || searchTokens.includes("heart") || searchTokens.includes("aorta") || searchTokens.includes("cardio") || searchTokens.includes("ventricle") || searchTokens.includes("atrium")) {
    return ANATOMICAL_DATABASE["cardiovascular_heart"];
  }
  if (sysId === "nervous" || searchTokens.includes("brain") || searchTokens.includes("cerebrum") || searchTokens.includes("cerebellum") || searchTokens.includes("spinal") || searchTokens.includes("nerve")) {
    return ANATOMICAL_DATABASE["nervous_brain"];
  }
  if (sysId === "respiratory" || searchTokens.includes("lung") || searchTokens.includes("trachea") || searchTokens.includes("bronch") || searchTokens.includes("larynx") || searchTokens.includes("pulmo")) {
    return ANATOMICAL_DATABASE["respiratory_lungs"];
  }
  if (sysId === "digestive" || searchTokens.includes("liver") || searchTokens.includes("stomach") || searchTokens.includes("intestin") || searchTokens.includes("colon") || searchTokens.includes("digest") || searchTokens.includes("pancreas") || searchTokens.includes("gallbladder")) {
    return ANATOMICAL_DATABASE["digestive_viscera"];
  }
  if (sysId === "integumentary" || searchTokens.includes("skin") || searchTokens.includes("integument") || searchTokens.includes("epiderm") || searchTokens.includes("dermis")) {
    return ANATOMICAL_DATABASE["integumentary_skin"];
  }
  if (sysId === "lymphatic" || searchTokens.includes("spleen") || searchTokens.includes("thymus") || searchTokens.includes("lymph") || searchTokens.includes("node")) {
    return ANATOMICAL_DATABASE["lymphatic_spleen"];
  }
  if (sysId === "endocrine" || searchTokens.includes("thyroid") || searchTokens.includes("pituitary") || searchTokens.includes("adrenal") || searchTokens.includes("endocrine") || searchTokens.includes("gland")) {
    return ANATOMICAL_DATABASE["endocrine_axis"];
  }
  if (sysId === "urinary" || searchTokens.includes("kidney") || searchTokens.includes("renal") || searchTokens.includes("ureter") || searchTokens.includes("bladder") || searchTokens.includes("urinar")) {
    return ANATOMICAL_DATABASE["urinary_kidneys"];
  }
  if (sysId === "reproductive" || searchTokens.includes("uterus") || searchTokens.includes("ovary") || searchTokens.includes("testis") || searchTokens.includes("reproduct")) {
    return ANATOMICAL_DATABASE["reproductive_pelvic"];
  }
  if (sysId === "muscular" || searchTokens.includes("muscle") || searchTokens.includes("muscul") || searchTokens.includes("mamsa") || searchTokens.includes("myo")) {
    return ANATOMICAL_DATABASE["muscular_fullbody"];
  }

  // 3. Specific Connective Tissue Keyword Matching
  if (searchTokens.includes("acl") || searchTokens.includes("anterior_cruciate")) {
    return ANATOMICAL_DATABASE["knee_acl"];
  }
  if (searchTokens.includes("pcl") || searchTokens.includes("posterior_cruciate")) {
    return ANATOMICAL_DATABASE["knee_pcl"];
  }
  if (searchTokens.includes("mcl") || searchTokens.includes("medial_collateral")) {
    return ANATOMICAL_DATABASE["knee_mcl"];
  }
  if (searchTokens.includes("lcl") || searchTokens.includes("lateral_collateral")) {
    return ANATOMICAL_DATABASE["knee_lcl"];
  }
  if (searchTokens.includes("iliofemoral")) {
    return ANATOMICAL_DATABASE["hip_iliofemoral"];
  }
  if (searchTokens.includes("achilles")) {
    return ANATOMICAL_DATABASE["ankle_achilles_tendon"];
  }
  if (searchTokens.includes("patellar_tendon") || searchTokens.includes("patella_tendon") || (searchTokens.includes("patellar") && searchTokens.includes("tendon"))) {
    return ANATOMICAL_DATABASE["knee_patellar_tendon"];
  }
  if (searchTokens.includes("meniscus")) {
    return ANATOMICAL_DATABASE["knee_meniscus"];
  }
  if (searchTokens.includes("capsule") || searchTokens.includes("synovial")) {
    return ANATOMICAL_DATABASE["knee_synovial_capsule"];
  }
  if (searchTokens.includes("disc") || searchTokens.includes("intervertebral")) {
    return ANATOMICAL_DATABASE["spine_disc"];
  }
  if (searchTokens.includes("costal_cartilage") || (searchTokens.includes("rib") && searchTokens.includes("cartilage"))) {
    return ANATOMICAL_DATABASE["costal_cartilage"];
  }
  if (searchTokens.includes("cartilage")) {
    return ANATOMICAL_DATABASE["knee_femoral_cartilage"];
  }

  // 4. Specific Bone Keyword Matching
  if (searchTokens.includes("femur") || searchTokens.includes("thigh")) {
    return ANATOMICAL_DATABASE["femur"];
  }
  if (searchTokens.includes("tibia") || searchTokens.includes("shin")) {
    return ANATOMICAL_DATABASE["tibia"];
  }
  if (searchTokens.includes("fibula")) {
    return ANATOMICAL_DATABASE["fibula"];
  }
  if (searchTokens.includes("patella")) {
    return ANATOMICAL_DATABASE["patella"];
  }
  if (searchTokens.includes("pelvis") || searchTokens.includes("ilium") || searchTokens.includes("ischium") || searchTokens.includes("pubis") || searchTokens.includes("sacroiliac")) {
    return ANATOMICAL_DATABASE["pelvis"];
  }
  if (searchTokens.includes("skull") || searchTokens.includes("cranium") || searchTokens.includes("frontal") || searchTokens.includes("parietal") || searchTokens.includes("occipital") || searchTokens.includes("temporal") || searchTokens.includes("sphenoid")) {
    return ANATOMICAL_DATABASE["skull"];
  }
  if (searchTokens.includes("mandible") || searchTokens.includes("jaw")) {
    return ANATOMICAL_DATABASE["mandible"];
  }
  if (searchTokens.includes("vertebra") || searchTokens.includes("spine") || searchTokens.includes("cervical") || searchTokens.includes("thoracic") || searchTokens.includes("lumbar") || searchTokens.includes("sacrum") || searchTokens.includes("coccyx")) {
    return ANATOMICAL_DATABASE["spine"];
  }
  if (searchTokens.includes("rib") || searchTokens.includes("costa")) {
    return ANATOMICAL_DATABASE["ribs"];
  }
  if (searchTokens.includes("sternum") || searchTokens.includes("manubrium") || searchTokens.includes("xiphoid")) {
    return ANATOMICAL_DATABASE["sternum"];
  }
  if (searchTokens.includes("clavicle") || searchTokens.includes("collarbone")) {
    return ANATOMICAL_DATABASE["clavicle"];
  }
  if (searchTokens.includes("humerus")) {
    return ANATOMICAL_DATABASE["humerus"];
  }

  // 5. Fallback generated according to detected Category
  const isCartilage =
    userData.structureType === "cartilage" ||
    searchTokens.includes("cartilage") ||
    searchTokens.includes("septum");
  const isLigament =
    userData.structureType === "ligament" || searchTokens.includes("ligament");
  const isTendon =
    userData.structureType === "tendon" || searchTokens.includes("tendon");
  const isJoint =
    userData.structureType === "joint" ||
    searchTokens.includes("capsule") ||
    searchTokens.includes("joint");

  let category: AnatomicalCategory = "Bone";
  if (isCartilage) category = "Cartilage";
  else if (isLigament) category = "Ligament";
  else if (isTendon) category = "Tendon";
  else if (isJoint) category = "Joint Capsule";

  const cleanName = (userData.structureName || userData.boneName || mesh.name || "Anatomical Structure")
    .replace(/_/g, " ")
    .replace(/\.g$/, "");
  const ayurDefaults = CATEGORY_AYURVEDA_MAP[category];

  return {
    id: mesh.name || "anatomical_structure",
    commonName: cleanName,
    latinName: userData.sanskritName || `Structura Anatomica (${category})`,
    category,
    colorCode: CATEGORY_COLOR_MAP[category],
    subParts: {
      proximal: [
        `Proximal Attachment / Articular Boundary: Anchors firmly to adjacent musculoskeletal leverage nodes.`,
      ],
      shaft: [
        `Central Structural Core: Dense fibrous / mineralized matrix transmitting tensile and compressive stress.`,
      ],
      distal: [
        `Distal Insertion / Articular Margin: Distributes kinematic load across adjoining articulation surface.`,
      ],
    },
    functions: [
      `Provides dedicated biomechanical stability, load transmission, and movement leverage.`,
      `Interacts synchronously with adjacent musculoskeletal units to preserve anatomical posture.`,
      `Houses localized mechanoreceptors and cellular matrix maintaining tissue remodeling equilibrium.`,
    ],
    articulations: [
      `Adjacent osseous and soft-tissue junctions within ${ayurDefaults.sanskritTitle}.`,
    ],
    connectedLigaments: [
      `Stabilized by surrounding capsuloligamentous and tendinous retinacula.`,
    ],
    ayurvedicMetadata: {
      dhatu: userData.dhatu || ayurDefaults.dhatu,
      srotas: userData.ayurvedicClassification || ayurDefaults.srotas,
      doshaAffinity: userData.dosha || ayurDefaults.doshaAffinity,
      upadhatu: ayurDefaults.upadhatu,
    },
    clinicalNotes:
      userData.clinicalSignificance ||
      `Subject to mechanical strain, degenerative remodeling, and trauma; managed through targeted orthopedic rehabilitation and Ayurvedic Rasayana therapies.`,
  };
}

// ============================================================================
// INTERIOR HISTOLOGY & ANATOMICAL SPLIT-VIEW DATABASE
// ============================================================================

export const INTERIOR_HISTOLOGY_DATABASE: Record<string, InternalHistologyPin> = {
  bronchial_lumen: {
    id: "bronchial_lumen",
    name: "Bronchial Lumen & Mucosa",
    organName: "Respiratory System (Bronchial Tree)",
    systemId: "respiratory",
    anchor: [0.0, 1.33, 0.03],
    histologicalLayer: "Ciliated Pseudostratified Columnar Epithelium with Goblet Cells",
    tissueType: "Respiratory Mucosa & Submucosal Hyaline Cartilage Rings",
    biochemicalFunction:
      "Mucociliary clearance escalator trapping airborne pathogens and particulate matter (PM2.5); carbonic anhydrase driven airway hydration.",
    clinicalRelevance:
      "Denudation of cilia and goblet cell hyperplasia in chronic bronchitis, asthma airway remodeling, and bronchiectasis.",
    ayurvedicCorrelation: {
      srotas: "Pranavaha Srotas (प्राणवह स्रोतस्)",
      dhatu: "Rasa Dhatu (रस धातु)",
      agni: "Prana Agni & Udana Vayu",
      dosha: "Prana Vayu & Kledaka Kapha",
      mechanism:
        "Channels Prana (vital cosmic oxygen) from atmosphere to cardiopulmonary core; vitiation by Kapha leads to Tamaka Shwasa (Asthma).",
    },
  },

  alveolar_sacs: {
    id: "alveolar_sacs",
    name: "Alveolar Sacs & Respiratory Membrane",
    organName: "Lungs (Pulmonary Parenchyma)",
    systemId: "respiratory",
    anchor: [-0.06, 1.25, 0.04],
    histologicalLayer: "Type I (95% surface) & Type II Pneumocytes (Surfactant Producing)",
    tissueType: "0.2–0.5 μm Blood-Air Barrier (Pulmonary Capillary Endothelium)",
    biochemicalFunction:
      "Fick's law passive gas diffusion: pO₂ gradient (104 ➔ 40 mmHg) driven oxygenation; dipalmitoylphosphatidylcholine (DPPC) surfactant lowers surface tension.",
    clinicalRelevance:
      "Acute Respiratory Distress Syndrome (ARDS), pulmonary edema, emphysematous septal destruction, and COVID-19 pneumonitis.",
    ayurvedicCorrelation: {
      srotas: "Pranavaha & Raktavaha Srotas",
      dhatu: "Rasa-Rakta Poshan (रस-रक्त पोषण)",
      agni: "Dhatvagni Poshana",
      dosha: "Prana Vayu & Avalambaka Kapha",
      mechanism:
        "Subtlest interface between external Mahabhutas (Vayu/Akasha) and internal biological dhatu matrix.",
    },
  },

  myocardial_wall: {
    id: "myocardial_wall",
    name: "Myocardial Wall & Intercalated Discs",
    organName: "Heart (Myocardium)",
    systemId: "cardiovascular",
    anchor: [-0.03, 1.27, 0.05],
    histologicalLayer: "Striated Cardiomyocytes with Intercalated Discs (Fascia Adherens & Gap Junctions)",
    tissueType: "Involuntary Striated Cardiac Muscle Layer (Branching Syncytium)",
    biochemicalFunction:
      "Calcium-induced calcium release (CICR) via Ryanodine receptors; high-velocity metabolic ATP turnover fueled by fatty acid beta-oxidation.",
    clinicalRelevance:
      "Transmural ischemic necrosis (Myocardial Infarction), hypertrophic cardiomyopathy, and re-entrant ventricular arrhythmias.",
    ayurvedicCorrelation: {
      srotas: "Rasavaha & Raktavaha Srotas",
      dhatu: "Rasa & Rakta Dhatu (हृदयं सर्वचेतनास्थानम्)",
      agni: "Sadhaka Pitta & Jatharagni",
      dosha: "Vyana Vayu & Sadhaka Pitta",
      mechanism:
        "Seat of Para Ojas (8 drops) and Chetana; continuous pulsation driven by Vyana Vayu without metabolic fatigue.",
    },
  },

  cardiac_valves: {
    id: "cardiac_valves",
    name: "Cardiac Valve Fibrosa & Endocardium",
    organName: "Heart (Atrioventricular Valves)",
    systemId: "cardiovascular",
    anchor: [-0.01, 1.25, 0.04],
    histologicalLayer: "Stratified Fibrosa (Type I Collagen), Spongiosa (GAGs), and Ventricularis (Elastin)",
    tissueType: "Avascular Fibrous Valvular Core Lined with Endothelium",
    biochemicalFunction:
      "Unidirectional hydrodynamic valve closure withstanding ventricular pressure swings up to 120 mmHg.",
    clinicalRelevance:
      "Calcific aortic stenosis, mitral valve prolapse (myxomatous degeneration), and infective endocarditis.",
    ayurvedicCorrelation: {
      srotas: "Rasavaha Srotas",
      dhatu: "Snayu & Asthi Upadhatu",
      agni: "Vyana Vayu regulation",
      dosha: "Avalambaka Kapha & Vyana Vayu",
      mechanism:
        "Sira-Kandara-Snayu architecture providing tensile restraint against regurgitant backward flow.",
    },
  },

  adrenal_cortex: {
    id: "adrenal_cortex",
    name: "Adrenal Cortex (Zonated Steroidogenesis)",
    organName: "Endocrine System (Suprarenal Glands)",
    systemId: "endocrine",
    anchor: [-0.07, 1.15, -0.04],
    histologicalLayer: "Zona Glomerulosa (Mineralocorticoids), Fasciculata (Glucocorticoids), Reticularis (Androgens)",
    tissueType: "Endocrine Epithelial Cords with Abundant Lipid Droplets and Fenestrated Capillaries",
    biochemicalFunction:
      "Cytochrome P450 steroidogenesis converting cholesterol to cortisol (stress adaptation) and aldosterone (Na+/K+ ATPase renal regulation).",
    clinicalRelevance:
      "Cushing syndrome (hypercortisolemia), Addisonian crisis (hypoaldosteronism), and secondary endocrine hypertension.",
    ayurvedicCorrelation: {
      srotas: "Manovaha & Shukravaha Srotas",
      dhatu: "Sukshma Dhatvagni & Ojas",
      agni: "Bhutagni & Dhatvagni",
      dosha: "Sadhaka Pitta & Prana Vayu",
      mechanism:
        "Modulates systemic metabolic resistance (Bala) and adaptogenic endurance under acute Sahasa (extreme stress).",
    },
  },

  thyroid_follicles: {
    id: "thyroid_follicles",
    name: "Thyroid Follicle & Colloid Core",
    organName: "Endocrine System (Thyroid Gland)",
    systemId: "endocrine",
    anchor: [0.0, 1.44, 0.04],
    histologicalLayer: "Simple Cuboidal Follicular Cells Surrounding Thyroglobulin Colloid",
    tissueType: "Endocrine Follicular Architecture & Parafollicular C-Cells (Calcitonin)",
    biochemicalFunction:
      "Thyroid peroxidase (TPO) catalyzed iodide organification synthesizing T3 (triiodothyronine) and T4 (thyroxine) regulating basal metabolic rate.",
    clinicalRelevance:
      "Hashimoto thyroiditis, Graves disease (TSHR autoantibodies), and endemic iodine-deficient goiter (Galaganda).",
    ayurvedicCorrelation: {
      srotas: "Medovaha & Rasavaha Srotas",
      dhatu: "Meda Dhatu & Agni",
      agni: "Sarvasharira Agni (Master Metabolic Fire)",
      dosha: "Kapha-Pitta balance",
      mechanism:
        "Controls Dhatu-Paka rate; Mandagni at thyroid level produces Galaganda, metabolic sluggishness, and Sthaulya.",
    },
  },

  renal_medulla: {
    id: "renal_medulla",
    name: "Renal Medullary Pyramids & Collecting Ducts",
    organName: "Urinary System (Kidney)",
    systemId: "urinary",
    anchor: [0.07, 1.05, -0.04],
    histologicalLayer: "Loops of Henle (Thin & Thick Segments) and Medullary Collecting Ducts",
    tissueType: "Renal Medullary Parenchyma with Countercurrent Hyperosmolar Interstitium",
    biochemicalFunction:
      "Countercurrent multiplier maintaining 1200 mOsm/kg medullary hypertonicity; Aquaporin-2 mediated water reabsorption under Vasopressin (ADH).",
    clinicalRelevance:
      "Acute tubular necrosis, medullary cystic disease, and nephrolithiasis nidus formation (Ashmari).",
    ayurvedicCorrelation: {
      srotas: "Mutravaha Srotas (मूत्रवह स्रोतस्)",
      dhatu: "Meda Dhatu & Kitta Mala (मूत्र)",
      agni: "Apana Agni",
      dosha: "Apana Vayu & Kledaka Kapha",
      mechanism:
        "Filters metabolic Ahara Kitta; Apana Vayu drives regular non-suppressible excretion of watery waste.",
    },
  },

  muscle_fascicle: {
    id: "muscle_fascicle",
    name: "Muscle Fascicle & Myofibrillar Core",
    organName: "Muscular System (Skeletal Muscle)",
    systemId: "muscular",
    anchor: [-0.08, 1.38, -0.05],
    histologicalLayer: "Perimysium Enclosing Multinucleated Muscle Fibers with Sarcomeres (Z-line to Z-line)",
    tissueType: "Striated Skeletal Muscle Fascicle with Sarcoplasmic Reticulum Triads",
    biochemicalFunction:
      "Sliding filament power stroke: Ca2+ binds Troponin C, exposing actin active sites for myosin-head ATP hydrolysis.",
    clinicalRelevance:
      "Duchenne muscular dystrophy (dystrophin loss), rhabdomyolysis, muscle strain tears, and sarcopenia.",
    ayurvedicCorrelation: {
      srotas: "Mamsavaha Srotas (मांसवह स्रोतस्)",
      dhatu: "Mamsa Dhatu (मांस धातु)",
      agni: "Mamsagni (मांसाग्नि)",
      dosha: "Vyana Vayu & Kapha Dhatu",
      mechanism:
        "Mamsa Lepana (enveloping bones and vital organs) providing voluntary somatic locomotion and physical prowess (Bala).",
    },
  },

  splenic_red_pulp: {
    id: "splenic_red_pulp",
    name: "Splenic Red & White Pulp",
    organName: "Lymphatic System (Spleen)",
    systemId: "lymphatic",
    anchor: [-0.14, 1.18, 0.02],
    histologicalLayer: "Cords of Billroth with Macrophages (Red Pulp) & Periarteriolar Lymphoid Sheaths (PALS - White Pulp)",
    tissueType: "Reticuloendothelial Lymphoid & Erythrocyte Filtering Network",
    biochemicalFunction:
      "Culling of senescent erythrocytes older than 120 days via macrophage phagocytosis; iron recycling and blood pool reservoir.",
    clinicalRelevance:
      "Hypersplenism, immune thrombocytopenic purpura (ITP), sickle cell splenic sequestration, and splenomegaly (Pleehodara).",
    ayurvedicCorrelation: {
      srotas: "Raktavaha Srotas (रक्तवह स्रोतस् - मूलं यकृत्प्लीहानौ)",
      dhatu: "Rakta & Rasa Dhatu",
      agni: "Raktagni (रक्ताग्नि)",
      dosha: "Ranjaka Pitta & Avalambaka Kapha",
      mechanism:
        "Origin of Rakta Dhatu; transforms Rasa into luminous Rakta and houses immune essence (Vyadhikshamatwa).",
    },
  },

  gastric_rugae: {
    id: "gastric_rugae",
    name: "Gastric Mucosa & Parietal Glands",
    organName: "Digestive Viscera (Stomach)",
    systemId: "digestive",
    anchor: [0.02, 1.07, 0.05],
    histologicalLayer: "Gastric Foveolae Pits with Parietal Cells (HCl), Chief Cells (Pepsinogen), and Mucous Neck Cells",
    tissueType: "Simple Columnar Secretory Mucosa with Bicarbonate Protective Mucus Barrier",
    biochemicalFunction:
      "H+/K+ ATPase proton pump generating pH 1.5–2.0 gastric juice activating pepsin for proteolysis; Intrinsic Factor secretion for B12.",
    clinicalRelevance:
      "Helicobacter pylori gastritis, peptic ulcer disease, Zollinger-Ellison syndrome, and pernicious anemia.",
    ayurvedicCorrelation: {
      srotas: "Annavaha Srotas (अन्नवह स्रोतस् - मूलं आमाशयः)",
      dhatu: "Pachaka Pitta (पाचक पित्त - जाठराग्नि)",
      agni: "Jatharagni (Supreme Digestive Fire)",
      dosha: "Pachaka Pitta & Kledaka Kapha",
      mechanism:
        "Primary vessel where Ahara is cooked by Agni into Ahara Rasa; Mandagni produces toxic Ama.",
    },
  },

  cancellous_bone_marrow: {
    id: "cancellous_bone_marrow",
    name: "Cancellous Bone Trabeculae & Medullary Cavity",
    organName: "Skeletal System (Femur / Long Bones)",
    systemId: "skeletal",
    anchor: [0.0, 0.65, 0.02],
    histologicalLayer: "Spongy Trabecular Matrix (Type I Collagen + Hydroxyapatite) & Hematopoietic Red/Yellow Marrow",
    tissueType: "Porous Cancellous Bone Lattice (#D8CBB5) enclosing Medullary Marrow Core (#A83232)",
    biochemicalFunction:
      "Pluripotent hematopoiesis (erythropoiesis, leukopoiesis, thrombopoiesis); mechanical energy absorption and weight distribution along stress trajectories.",
    clinicalRelevance:
      "Aplastic anemia, myelodysplastic syndrome, multiple myeloma, osteoporosis trabecular thinning, and avascular necrosis.",
    ayurvedicCorrelation: {
      srotas: "Asthivaha & Majjavaha Srotas (अस्थिवह व मज्जावह स्रोतस्)",
      dhatu: "Asthi & Majja Dhatu (अस्थिमज्जा संश्रय)",
      agni: "Asthyagni & Majjagni",
      dosha: "Vata Dosha (Vayu resides in bone porosities)",
      mechanism:
        "Majja Dhatu fills the inner hollow porosities (Sushira) of Asthi, conferring profound biological stamina (Bala) and unctuous nourishment.",
    },
  },

  cortical_bone_osteon: {
    id: "cortical_bone_osteon",
    name: "Cortical Bone & Haversian Osteon Matrix",
    organName: "Skeletal System (Compact Bone Wall)",
    systemId: "skeletal",
    anchor: [0.0, 0.95, -0.04],
    histologicalLayer: "Concentric Lamellae surrounding Haversian Canals & Volkmann's Perforating Channels",
    tissueType: "Dense Mineralized Cortical Bone Shield (80% of skeletal mass)",
    biochemicalFunction:
      "Structural compression resistance exceeding 130 MPa; systemic calcium-phosphate homeostasis buffered by osteocytic osteolysis.",
    clinicalRelevance:
      "Stress fractures, Paget's disease of bone, osteogenesis imperfecta, and osteoclast-mediated bone resorption.",
    ayurvedicCorrelation: {
      srotas: "Asthivaha Srotas (मूलं मेदः जघनं च)",
      dhatu: "Asthi Dhatu (दृढ संहनन)",
      agni: "Dhatvagni Poshana",
      dosha: "Prithvi & Vayu Mahabhuta dominance",
      mechanism:
        "Ultimate structural scaffold (Dehadharana) shielding soft viscera (Marma sthanas) against mechanical trauma.",
    },
  },

  cerebral_cortex_ventricles: {
    id: "cerebral_cortex_ventricles",
    name: "Cerebral Cortex & Ventricular CSF Core",
    organName: "Nervous System (Brain - Telencephalon)",
    systemId: "nervous",
    anchor: [0.0, 1.58, 0.03],
    histologicalLayer: "6-Layered Neocortical Grey Matter (Pyramidal Somata) & Ependymal-Lined Lateral Ventricles",
    tissueType: "Unmyelinated Neuronal Neuropil (#94A3B8) with Choroid Plexus CSF Filtration Barrier",
    biochemicalFunction:
      "Higher cognitive processing, motor execution, and 500 mL/day cerebrospinal fluid hydro-cushioning and metabolic waste glymphatic clearance.",
    clinicalRelevance:
      "Hydrocephalus, Alzheimer's cortical atrophy, ischemic stroke in MCA territory, and ventriculitis.",
    ayurvedicCorrelation: {
      srotas: "Manovaha & Majjavaha Srotas (मनोवह स्रोतस्)",
      dhatu: "Majja Dhatu & Mastulunga",
      agni: "Sadhaka Pitta & Tarpaka Kapha",
      dosha: "Prana Vayu (Shiro-gata Prana)",
      mechanism:
        "Shiro-marma (Adhipati & Shringataka) core; seat of Indriyas and Buddhi where Prana orchestrates all cognitive sensory afferents.",
    },
  },

  interventricular_septum: {
    id: "interventricular_septum",
    name: "Interventricular Septum & Bundle of His",
    organName: "Cardiovascular System (Cardiac Core)",
    systemId: "cardiovascular",
    anchor: [0.0, 1.25, 0.05],
    histologicalLayer: "Muscular & Membranous Septum Lined with Endocardial Endothelium & Purkinje Fibers",
    tissueType: "High-Density Compact Myocardium Interspersed with Specialized Cardiac Conduction Fascicles",
    biochemicalFunction:
      "Electrical isolation between atria and ventricles; synchronized rapid transmission (2-4 m/s) of action potentials to cardiac apex.",
    clinicalRelevance:
      "Ventricular septal defects (VSD), bundle branch blocks, hypertrophic obstructive cardiomyopathy (HOCM).",
    ayurvedicCorrelation: {
      srotas: "Rasavaha & Raktavaha Srotas (हृदय मूल)",
      dhatu: "Rasa Dhatu & Para Ojas",
      agni: "Sadhaka Pitta",
      dosha: "Vyana Vayu & Avalambaka Kapha",
      mechanism:
        "Central anchor of Hridaya Marma (Sadyah Pranahara); synchronization center that drives unceasing Rasasamvahana throughout the 14 Srotamsi.",
    },
  },

  intestinal_mucosa_submucosa: {
    id: "intestinal_mucosa_submucosa",
    name: "Intestinal Villi & Enteric Meissner Plexus",
    organName: "Digestive Viscera (Small Intestine - Grahani)",
    systemId: "digestive",
    anchor: [0.0, 0.98, 0.05],
    histologicalLayer: "Enterocyte Brush Border with Microvilli & Submucosal Meissner's Autonomic Ganglionic Plexus",
    tissueType: "Absorptive Simple Columnar Mucosa with Crypts of Lieberkühn & Peyer's Patches",
    biochemicalFunction:
      "Surface area expansion to 30 m²; active SGLT-1 glucose transport, dipeptide absorption, and secretin/CCK neuroendocrine coordination.",
    clinicalRelevance:
      "Celiac sprue enteropathy, Crohn's ileitis, Grahani Dosha (Malabsorption Syndrome), and irritable bowel syndrome.",
    ayurvedicCorrelation: {
      srotas: "Annavaha & Purishavaha Srotas",
      dhatu: "Ahara Rasa & Dhatu-Upachaya",
      agni: "Grahani Agni (Seat of Jatharagni)",
      dosha: "Samana Vayu & Pachaka Pitta",
      mechanism:
        "The anatomical Grahani holds food (Ahara-dharana), digests it with Pachaka Pitta, separates Sara (nutrient essence) from Kitta (waste).",
    },
  },

  renal_cortex_pyramids: {
    id: "renal_cortex_pyramids",
    name: "Renal Cortex & Glomerular Bowman's Capsules",
    organName: "Urinary System (Kidney Parenchyma)",
    systemId: "urinary",
    anchor: [-0.07, 1.08, -0.04],
    histologicalLayer: "Fenestrated Glomerular Capillaries, Podocyte Foot Processes & Proximal Convoluted Tubules",
    tissueType: "High-Perfusion Renal Cortex (Receives 20-25% of Cardiac Output)",
    biochemicalFunction:
      "Ultrafiltration of 180 Liters/day of primary plasma; active Na+/K+ ATPase, glucose and amino acid reabsorption in PCT.",
    clinicalRelevance:
      "Glomerulonephritis, diabetic nephropathy, focal segmental glomerulosclerosis, and acute kidney injury.",
    ayurvedicCorrelation: {
      srotas: "Mutravaha Srotas (मूलं बस्तिर्वङ्क्षणौ च)",
      dhatu: "Meda Dhatu & Kitta Parināma",
      agni: "Apana Agni",
      dosha: "Apana Vayu & Kledaka Kapha",
      mechanism:
        "Vrikka (Kidneys) formed from essence of Rakta and Meda; filters toxic Kleda (morbid moisture) into Mutra for excretion by Apana Vayu.",
    },
  },

  muscle_epimysium_fascicle: {
    id: "muscle_epimysium_fascicle",
    name: "Epimysium Investing Sheath & Fascicular Bundles",
    organName: "Muscular System (Deep Somatic Muscle)",
    systemId: "muscular",
    anchor: [0.08, 1.35, -0.06],
    histologicalLayer: "Dense Irregular Collagenous Epimysium Sheath with Perimysial Septa & Muscle Spindles",
    tissueType: "Fibrous Fascial Compartment Enclosing Contractile Sarcomere Matrix",
    biochemicalFunction:
      "Force transmission from myofibrillar actomyosin power strokes through myotendinous junctions to osseous levers; proprioceptive stretch reflex feedback.",
    clinicalRelevance:
      "Compartment syndrome, myofascial pain syndrome, fibrositis, and muscular dystrophy.",
    ayurvedicCorrelation: {
      srotas: "Mamsavaha Srotas (मूलं स्नायु त्वक् च)",
      dhatu: "Mamsa Dhatu & Snayu",
      agni: "Mamsagni",
      dosha: "Vyana Vayu (Peshana & Gati)",
      mechanism:
        "Provides dynamic somatic locomotion (Cheshta) and maintains postural integrity, acting as the contractile vehicle for Vyana Vayu.",
    },
  },

  uterus_endometrium: {
    id: "uterus_endometrium",
    name: "Uterine Cavity & Stratified Endometrium",
    organName: "Female Reproductive System (Garbhashaya)",
    systemId: "reproductive",
    anchor: [0.0, 0.83, 0.02],
    histologicalLayer: "Endometrial Stratum Functionale & Basale, Spiral Arterioles, and Thick Interlacing Myometrium",
    tissueType: "Secretory Columnar Mucosa & Smooth Muscle Syncytium with Ovarian Follicular Clusters",
    biochemicalFunction:
      "Cyclical estrogen-progesterone deciduous proliferation; implantation nidus for blastocyst and powerful oxytocin-mediated labor contractions.",
    clinicalRelevance:
      "Endometriosis, uterine leiomyomas (fibroids), endometrial hyperplasia, and polycystic ovary syndrome (PCOS).",
    ayurvedicCorrelation: {
      srotas: "Artavavaha Srotas (आर्तववह स्रोतस् - मूलं गर्भाशयः आर्तववाहिन्यश्च धमन्यः)",
      dhatu: "Artava Upadhatu (आर्तव उपधातु)",
      agni: "Artavagni",
      dosha: "Apana Vayu (Pravartana) & Saumya Kapha",
      mechanism:
        "Garbhashaya acts as the sacred vessel for Garbha-dharana; Apana Vayu governs the rhythmic 28-day Rajasravana menstrual discharge.",
    },
  },

  testicular_lobules: {
    id: "testicular_lobules",
    name: "Seminiferous Tubules & Leydig Interstitial Stroma",
    organName: "Male Reproductive System (Vrishana)",
    systemId: "reproductive",
    anchor: [0.0, 0.73, 0.03],
    histologicalLayer: "Convoluted Seminiferous Tubules Lined by Sertoli Cells & Peritubular Myoid Cells",
    tissueType: "Specialized Spermatogenic Epithelium & Androgen-Secreting Interstitial Leydig Stroma",
    biochemicalFunction:
      "Continuous spermatogenesis (producing 100-200 million spermatozoa/day); LH-stimulated testosterone biosynthesis driving systemic anabolism.",
    clinicalRelevance:
      "Varicocele, oligospermia, cryptorchidism, testicular torsion, and benign prostatic hyperplasia (BPH).",
    ayurvedicCorrelation: {
      srotas: "Shukravaha Srotas (शुक्रवह स्रोतस् - मूलं स्तनौ वृषणौ च)",
      dhatu: "Shukra Dhatu (शुक्र धातु - सौम्यं सर्वशरीरव्यापि)",
      agni: "Shukragni",
      dosha: "Apana Vayu & Saumya Kapha",
      mechanism:
        "Shukra permeates all tissues conferring metabolic vigor (Bala) and primordial glow (Ojas); expelled under sexual arousal by Apana Vayu.",
    },
  },

  mammary_glands: {
    id: "mammary_glands",
    name: "Mammary Lobules & Lactiferous Ducts",
    organName: "Female Reproductive Accessory (Stana)",
    systemId: "reproductive",
    anchor: [0.0, 1.25, 0.12],
    histologicalLayer: "15-20 Compound Tubuloalveolar Gland Lobes Enclosed in Cooper's Suspensory Ligaments & Adipose",
    tissueType: "Myoepithelial-Enclosed Secretory Alveoli & Lactiferous Sinuses",
    biochemicalFunction:
      "Prolactin-stimulated lactogenesis; oxytocin-mediated neuroendocrine milk ejection reflex into lactiferous ampullae.",
    clinicalRelevance:
      "Fibroadenoma, ductal carcinoma, mastitis, and intraductal papilloma.",
    ayurvedicCorrelation: {
      srotas: "Stanyavaha Srotas (स्तन्यवह स्रोतस् - मूलं स्तनौ हृदयं च)",
      dhatu: "Stanya (Breast Milk - Upadhatu of Rasa Dhatu)",
      agni: "Rasagni",
      dosha: "Avalambaka Kapha & Vyana Vayu",
      mechanism:
        "Formed from the pristine essence of Rasa Dhatu (मातुस्तु रसो यः सम्भवति... स्तन्यं जनयति); provides complete neonatal nourishment and immune transfer.",
    },
  },
};

export function resolveInteriorHistologyData(pin: InternalHistologyPin): AnatomicalStructureData {
  const cat = (pin.systemId.charAt(0).toUpperCase() + pin.systemId.slice(1)) as AnatomicalCategory;
  const ayurDefaults = CATEGORY_AYURVEDA_MAP[cat] || CATEGORY_AYURVEDA_MAP.Bone;

  return {
    id: pin.id,
    commonName: `${pin.name} [Interior Split View]`,
    latinName: `${pin.organName} (Histologia Interior)`,
    category: cat in CATEGORY_COLOR_MAP ? cat : "Bone",
    colorCode: CATEGORY_COLOR_MAP[cat] || "#D49B4B",
    subParts: {
      proximal: [`Histological Layer: ${pin.histologicalLayer}`],
      shaft: [`Tissue Architecture: ${pin.tissueType}`],
      distal: [`Biochemical Mechanism: ${pin.biochemicalFunction}`],
    },
    functions: [
      pin.biochemicalFunction,
      `Clinical Significance: ${pin.clinicalRelevance}`,
      `Histological Classification: ${pin.tissueType}`,
    ],
    articulations: [`Continuous with the functional parenchyma of ${pin.organName}`],
    connectedLigaments: [`Embedded within connective stroma and microvascular supply`],
    ayurvedicMetadata: {
      dhatu: `${pin.ayurvedicCorrelation?.dhatu || ayurDefaults.dhatu}`,
      srotas: `${pin.ayurvedicCorrelation?.srotas || ayurDefaults.srotas}`,
      doshaAffinity: `${pin.ayurvedicCorrelation?.dosha || ayurDefaults.doshaAffinity}`,
      upadhatu: `${pin.ayurvedicCorrelation?.mechanism || ayurDefaults.upadhatu}`,
    },
    clinicalNotes: `${pin.clinicalRelevance} | Ayurvedic Correlation: ${pin.ayurvedicCorrelation.mechanism}`,
    histologicalLayer: pin.histologicalLayer,
    tissueType: pin.tissueType,
    biochemicalFunction: pin.biochemicalFunction,
    isInternalSplit: true,
  };
}


