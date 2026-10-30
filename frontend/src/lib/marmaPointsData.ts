// ============================================================================
// AYURSETU 107 CANONICAL MARMA POINTS DATABASE
// Conforming to Sushruta Samhita (Sharira Sthana, Adhyaya 6)
// Co-registered with Modern Anatomical Landmarks in 1.70m 3D Space (0, 0, 0)
// ============================================================================

export type MarmaCategory =
  | "Sadyah Pranahara"
  | "Kalantara Pranahara"
  | "Vishalyaghna"
  | "Vaikalyakara"
  | "Rujakara";

export type MarmaRegion =
  | "Chest / Thorax"
  | "Head & Neck"
  | "Extremities"
  | "Abdomen & Pelvis"
  | "Back & Spine";

export type MarmaStructuralClass =
  | "Mamsa Marma"   // Muscular
  | "Sira Marma"    // Vascular
  | "Snayu Marma"   // Ligamentous/Tendon
  | "Asthi Marma"   // Osseous/Bone
  | "Sandhi Marma"; // Articular/Joint

export interface MarmaPointData {
  id: string; // e.g., "hridaya_marma"
  sanskritName: string; // e.g., "Hridaya Marma (हृदय मर्म)"
  englishTranslation: string; // e.g., "Vital Heart Centre"
  totalCount: number; // e.g., 1 (Single central Marma)
  category: MarmaCategory;
  anatomicalRegion: MarmaRegion;
  structuralClass?: MarmaStructuralClass;
  subLocation?: string;
  anchor: [number, number, number]; // 3D coordinates in meters

  // Precise Modern Anatomical Structures Underlying the Point
  underlyingAnatomy: {
    bones: string[];        // e.g., ["Body of Sternum", "4th-5th Costal Cartilages"]
    vessels: string[];      // e.g., ["Ascending Aorta", "Coronary Arteries", "Internal Thoracic Artery"]
    nerves: string[];       // e.g., ["Cardiac Plexus", "Vagus Nerve (CN X)", "Phrenic Nerve"]
    musclesTissues: string[]; // e.g., ["Myocardium", "Pectoralis Major", "Intercostal Muscles"]
  };

  // Ayurvedic Energetics & Measurement
  pramanaSize: string; // e.g., "Hrdaya-Mushti (Self-Fist Size ~ 4 Angula)"
  primaryDosha: string; // e.g., "Sadhaka Pitta & Vyana Vayu"
  dhatuAssociation: string; // e.g., "Rasa & Rakta Dhatu"

  // Clinical Vulnerability & Therapeutic Stimulus
  vulnerabilityEffect: string; // e.g., "Trauma causes immediate loss of consciousness, severe hemorrhage, and cardiac arrest."
  chikitsaProtocol: string; // e.g., "Gentle circular acupressure with Abhyanga oils (Bala taila) to balance Vyan Vayu and reduce thoracic stress."
}

export interface MarmaCategoryConfig {
  name: string;
  colorHex: string;
  pulseSpeed: number; // Hz / multiplier in RAF loop
  prognosis: string;
  lethalityPeriod: string;
  count: number;
}

export const MARMA_CATEGORY_CONFIG: Record<MarmaCategory, MarmaCategoryConfig> = {
  "Sadyah Pranahara": {
    name: "Sadyah Pranahara",
    colorHex: "#EF4444", // Glowing Ruby Red
    pulseSpeed: 3.0,
    prognosis: "Immediate Lethality / Critical Vitality",
    lethalityPeriod: "Death occurs within 1 to 7 days from trauma",
    count: 19
  },
  "Kalantara Pranahara": {
    name: "Kalantara Pranahara",
    colorHex: "#F59E0B", // Deep Amber Gold
    pulseSpeed: 1.8,
    prognosis: "Delayed Lethality / Systemic Depletion",
    lethalityPeriod: "Death occurs within 15 to 30 days without intervention",
    count: 33
  },
  "Vishalyaghna": {
    name: "Vishalyaghna",
    colorHex: "#06B6D4", // Bright Cyan
    pulseSpeed: 1.5,
    prognosis: "Fatal Upon Foreign Body Extraction",
    lethalityPeriod: "Air/Vayu escapes causing sudden collapse upon arrow/foreign body removal",
    count: 3
  },
  "Vaikalyakara": {
    name: "Vaikalyakara",
    colorHex: "#10B981", // Emerald Green
    pulseSpeed: 1.0,
    prognosis: "Permanent Disability / Structural Deformity",
    lethalityPeriod: "Causes chronic motor impairment, joint ankylosis, or sensory loss",
    count: 44
  },
  "Rujakara": {
    name: "Rujakara",
    colorHex: "#A855F7", // Neon Violet
    pulseSpeed: 2.2,
    prognosis: "Intense Excruciating Pain",
    lethalityPeriod: "Severe intractable pain without immediate mortality",
    count: 8
  }
};

// ============================================================================
// ALL 107 CLASSICAL MARMA POINTS (SUSHRUTA SAMHITA CANONICAL DATASET)
// ============================================================================

export const MARMA_DATABASE: MarmaPointData[] = [
  // --------------------------------------------------------------------------
  // A. EXTREMITIES / SHAKHA (44 MARMA POINTS)
  // --------------------------------------------------------------------------

  // 1-4. Kshipra Marma (4 points: 2 Hands, 2 Feet)
  {
    id: "kshipra_hand_right",
    sanskritName: "Kshipra Marma (क्षिप्र मर्म - Right Hand)",
    englishTranslation: "Rapid Action Webbing Centre (Right Hand)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Right 1st Interdigital Webbing (Between Thumb & Index)",
    anchor: [-0.27, 0.98, 0.08],
    underlyingAnatomy: {
      bones: ["1st Metacarpal", "2nd Metacarpal"],
      vessels: ["Radial Artery (Dorsal Metacarpal Artery)", "Princeps Pollicis Artery", "Cephalic Vein Radicles"],
      nerves: ["Superficial Branch of Radial Nerve", "Median Nerve Digital Branches"],
      musclesTissues: ["1st Dorsal Interosseous Muscle", "Adductor Pollicis", "Deep Fascia of Palm"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu (Ligaments/Tendons) & Rakta Dhatu",
    vulnerabilityEffect: "Trauma produces rapid systemic convulsions, severe hemorrhage, and lockjaw (tetanic spasm).",
    chikitsaProtocol: "Direct bilateral ischemic acupressure (30-60 sec) with Mahanarayana taila to relieve bronchospasm and calm agitated nervous pathways."
  },
  {
    id: "kshipra_hand_left",
    sanskritName: "Kshipra Marma (क्षिप्र मर्म - Left Hand)",
    englishTranslation: "Rapid Action Webbing Centre (Left Hand)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Left 1st Interdigital Webbing",
    anchor: [0.27, 0.98, 0.08],
    underlyingAnatomy: {
      bones: ["1st Metacarpal", "2nd Metacarpal"],
      vessels: ["Radial Artery (Dorsal Metacarpal Artery)", "Deep Palmar Arch Radicles"],
      nerves: ["Superficial Branch of Radial Nerve", "Digital Branches of Median Nerve"],
      musclesTissues: ["1st Dorsal Interosseous Muscle", "Adductor Pollicis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces acute peripheral vasospasm, respiratory arrest, and toxic febrile convulsions.",
    chikitsaProtocol: "Gentle circular friction with warm Dhanwantaram taila to restore neuromuscular conductivity."
  },
  {
    id: "kshipra_foot_right",
    sanskritName: "Kshipra Marma (क्षिप्र मर्म - Right Foot)",
    englishTranslation: "Rapid Action Interdigital Centre (Right Foot)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between 1st & 2nd Metatarsal Bones of Right Foot",
    anchor: [-0.09, 0.03, 0.12],
    underlyingAnatomy: {
      bones: ["1st Metatarsal Base", "2nd Metatarsal Base"],
      vessels: ["Dorsalis Pedis Artery (1st Dorsal Metatarsal)", "Dorsal Venous Arch"],
      nerves: ["Deep Peroneal Nerve (Medial Terminal Branch)"],
      musclesTissues: ["1st Dorsal Interosseous Muscle of Foot", "Extensor Hallucis Brevis Tendon"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Perforation precipitates severe muscular tetany, shock, and ascending motor collapse.",
    chikitsaProtocol: "Padabhyanga using Ksheerabala 101 taila; stimulative circular pressure relieves lymphatic stasis and plantar fascitis."
  },
  {
    id: "kshipra_foot_left",
    sanskritName: "Kshipra Marma (क्षिप्र मर्म - Left Foot)",
    englishTranslation: "Rapid Action Interdigital Centre (Left Foot)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between 1st & 2nd Metatarsal Bones of Left Foot",
    anchor: [0.09, 0.03, 0.12],
    underlyingAnatomy: {
      bones: ["1st Metatarsal Base", "2nd Metatarsal Base"],
      vessels: ["Dorsalis Pedis Artery (First Dorsal Metatarsal Branch)"],
      nerves: ["Deep Peroneal Nerve"],
      musclesTissues: ["1st Dorsal Interosseous Muscle of Foot", "Tendon of Extensor Hallucis Brevis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Puncture induces rapid foot drop, acute reflex sympathetic dystrophy, and prolonged systemic exhaustion.",
    chikitsaProtocol: "Warm herbal poultice (Patra Pinda Sweda) followed by thumb kneading to enhance peripheral microcirculation."
  },

  // 5-8. Talahridaya Marma (4 points: 2 Palms, 2 Soles)
  {
    id: "talahridaya_hand_right",
    sanskritName: "Talahridaya Marma (तलहृदय मर्म - Right Palm)",
    englishTranslation: "Palmar Cardiac Centre (Right Hand)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Center of Right Palm in line with Middle Finger",
    anchor: [-0.29, 0.96, 0.06],
    underlyingAnatomy: {
      bones: ["3rd Metacarpal Bone Shaft"],
      vessels: ["Superficial Palmar Arterial Arch", "Common Palmar Digital Arteries"],
      nerves: ["Median Nerve (Palmar Digital Branches)", "Ulnar Nerve Deep Branch"],
      musclesTissues: ["Palmar Aponeurosis", "Flexor Digitorum Superficialis & Profundus Tendons", "2nd Lumbrical"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Sadhaka Pitta & Vyana Vayu",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces severe excruciating palmar pain, gangrenous compartment infection, and death from sepsis.",
    chikitsaProtocol: "Rhythmic acupressure with warm Chandanadi or Brahmi taila to stabilize cardiac arrhythmias and anxiety."
  },
  {
    id: "talahridaya_hand_left",
    sanskritName: "Talahridaya Marma (तलहृदय मर्म - Left Palm)",
    englishTranslation: "Palmar Cardiac Centre (Left Hand)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Center of Left Palm in line with Middle Finger",
    anchor: [0.29, 0.96, 0.06],
    underlyingAnatomy: {
      bones: ["3rd Metacarpal Bone Shaft"],
      vessels: ["Superficial & Deep Palmar Arterial Arches"],
      nerves: ["Median Nerve", "Deep Ulnar Nerve Branches"],
      musclesTissues: ["Palmar Aponeurosis", "Flexor Digitorum Profundus Tendons", "Lumbrical Muscles"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Sadhaka Pitta & Vyana Vayu",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Crush injury causes irreversible contracture of palmar fascia and sympathetic cardiac instability.",
    chikitsaProtocol: "Deep thumb circular friction with Bala taila; useful in managing psychosomatic hypertension."
  },
  {
    id: "talahridaya_foot_right",
    sanskritName: "Talahridaya Marma (तलहृदय मर्म - Right Sole)",
    englishTranslation: "Plantar Cardiac Centre (Right Sole)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Central Depression of Plantar Surface of Right Foot",
    anchor: [-0.08, 0.015, 0.04],
    underlyingAnatomy: {
      bones: ["2nd and 3rd Metatarsal Shafts", "Navicular Bone"],
      vessels: ["Lateral Plantar Artery", "Plantar Arterial Arch"],
      nerves: ["Medial Plantar Nerve", "Lateral Plantar Nerve"],
      musclesTissues: ["Plantar Aponeurosis", "Flexor Digitorum Brevis Muscle", "Quadratus Plantae"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Bhrajaka Pitta",
    dhatuAssociation: "Mamsa & Majja Dhatu",
    vulnerabilityEffect: "Penetrating injury causes ascending septic phlebitis, excruciating pain, and reflex syncope.",
    chikitsaProtocol: "Bronze kansa vatki massage with Ghee and Ashwagandha taila; highly potent for treating insomnia and sensory exhaustion."
  },
  {
    id: "talahridaya_foot_left",
    sanskritName: "Talahridaya Marma (तलहृदय मर्म - Left Sole)",
    englishTranslation: "Plantar Cardiac Centre (Left Sole)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Central Depression of Plantar Surface of Left Foot",
    anchor: [0.08, 0.015, 0.04],
    underlyingAnatomy: {
      bones: ["2nd and 3rd Metatarsal Shafts"],
      vessels: ["Plantar Arterial Arch", "Medial Plantar Artery"],
      nerves: ["Lateral & Medial Plantar Nerves"],
      musclesTissues: ["Plantar Fascia", "Flexor Digitorum Brevis", "Flexor Accessorius"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Bhrajaka Pitta",
    dhatuAssociation: "Mamsa & Majja Dhatu",
    vulnerabilityEffect: "Trauma induces severe plantar fasciitis, chronic gait deformity, and debilitating radiating shock.",
    chikitsaProtocol: "Firm sustained pressure with Triphala ghrita to cool Pitta dosha and ground hyperactive Prana."
  },

  // 9-12. Kurcha Marma (4 points: 2 Hands, 2 Feet)
  {
    id: "kurcha_hand_right",
    sanskritName: "Kurcha Marma (कूर्च मर्म - Right Hand)",
    englishTranslation: "Brush Knot Centre (Right Hand)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "4 Angulas Proximal to Base of Right Thumb & Index",
    anchor: [-0.26, 1.01, 0.06],
    underlyingAnatomy: {
      bones: ["Trapezium", "Trapezoid", "Scaphoid"],
      vessels: ["Radial Artery in Anatomical Snuffbox"],
      nerves: ["Radial Nerve Superficial Branch", "Median Recurrent Motor Branch"],
      musclesTissues: ["Abductor Pollicis Longus", "Extensor Pollicis Brevis & Longus Tendons"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Vyana Vayu & Alochaka Pitta",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Trauma causes tremors, twitching of the hand, sensory loss, and impairment of visual acuity.",
    chikitsaProtocol: "Gentle stroking with Mahamasha taila; regulates ophthalmic micro-circulation via ocular reflex pathways."
  },
  {
    id: "kurcha_hand_left",
    sanskritName: "Kurcha Marma (कूर्च मर्म - Left Hand)",
    englishTranslation: "Brush Knot Centre (Left Hand)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "4 Angulas Proximal to Base of Left Thumb",
    anchor: [0.26, 1.01, 0.06],
    underlyingAnatomy: {
      bones: ["Trapezium", "Scaphoid"],
      vessels: ["Radial Artery Branches"],
      nerves: ["Superficial Radial Nerve"],
      musclesTissues: ["Anatomical Snuffbox Tendons", "Opponens Pollicis"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Vyana Vayu & Alochaka Pitta",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Injury produces irreversible hand clawing and functional visual blurring (Drishti Vibhrama).",
    chikitsaProtocol: "Application of warm Murivenna oil with distal-to-proximal effleurage."
  },
  {
    id: "kurcha_foot_right",
    sanskritName: "Kurcha Marma (कूर्च मर्म - Right Foot)",
    englishTranslation: "Brush Knot Centre (Right Foot)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Dorsum of Right Foot Proximal to Kshipra",
    anchor: [-0.08, 0.05, 0.08],
    underlyingAnatomy: {
      bones: ["Medial & Intermediate Cuneiform Bones", "Navicular"],
      vessels: ["Arcuate Artery", "Dorsalis Pedis"],
      nerves: ["Deep Peroneal Nerve", "Medial Dorsal Cutaneous Nerve"],
      musclesTissues: ["Extensor Digitorum Longus & Brevis Tendons", "Inferior Extensor Retinaculum"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu Dhatu",
    vulnerabilityEffect: "Injury causes gait ataxia, trembling of foot, and chronic postural imbalance.",
    chikitsaProtocol: "Stimulation with Karpasastyadi taila to restore ankle stability and neurological proprioception."
  },
  {
    id: "kurcha_foot_left",
    sanskritName: "Kurcha Marma (कूर्च मर्म - Left Foot)",
    englishTranslation: "Brush Knot Centre (Left Foot)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Dorsum of Left Foot Proximal to Kshipra",
    anchor: [0.08, 0.05, 0.08],
    underlyingAnatomy: {
      bones: ["Cuneiform Bones", "Navicular"],
      vessels: ["Dorsalis Pedis Artery"],
      nerves: ["Deep Peroneal Nerve"],
      musclesTissues: ["Extensor Retinaculum", "Extensor Hallucis Longus Tendon"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Snayu Dhatu",
    vulnerabilityEffect: "Trauma leads to foot eversion/inversion deformities and severe reflex muscular wasting.",
    chikitsaProtocol: "Therapeutic massage with Sahacharadi taila to address sciatica and motor neuron disorders."
  },

  // 13-16. Kurchashira Marma (4 points: 2 Wrists, 2 Ankles)
  {
    id: "kurchashira_hand_right",
    sanskritName: "Kurchashira Marma (कूर्चशिर मर्म - Right Hand)",
    englishTranslation: "Head of Brush Centre (Right Wrist Base)",
    totalCount: 4,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Directly Below the Base of the Thumb Joint (Right)",
    anchor: [-0.25, 1.03, 0.05],
    underlyingAnatomy: {
      bones: ["1st Carpometacarpal Articulation", "Trapezium"],
      vessels: ["Radial Artery (Dorsal Carpal Branch)"],
      nerves: ["Lateral Cutaneous Nerve of Forearm", "Median Palmar Cutaneous Branch"],
      musclesTissues: ["Abductor Pollicis Brevis Origin", "Flexor Carpi Radialis Tendon"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Trauma results in chronic excruciating wrist pain (Ruja) and loss of grasping strength.",
    chikitsaProtocol: "Circular friction with Pinda taila or Murivenna to pacify acute joint inflammation."
  },
  {
    id: "kurchashira_hand_left",
    sanskritName: "Kurchashira Marma (कूर्चशिर मर्म - Left Hand)",
    englishTranslation: "Head of Brush Centre (Left Wrist Base)",
    totalCount: 4,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Directly Below the Base of the Thumb Joint (Left)",
    anchor: [0.25, 1.03, 0.05],
    underlyingAnatomy: {
      bones: ["Carpometacarpal Joint of Thumb", "Trapezium"],
      vessels: ["Radial Artery Carpal Branches"],
      nerves: ["Lateral Antebrachial Cutaneous Nerve"],
      musclesTissues: ["Thenar Muscle Fascia", "Flexor Carpi Radialis"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Severe localized pain, tenosynovitis (de Quervain's), and inability to flex the wrist.",
    chikitsaProtocol: "Acupressure with warm Dhanwantaram taila to restore painless thumb opposition."
  },
  {
    id: "kurchashira_foot_right",
    sanskritName: "Kurchashira Marma (कूर्चशिर मर्म - Right Foot)",
    englishTranslation: "Head of Brush Centre (Right Ankle Base)",
    totalCount: 4,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Directly Below the Medial Malleolus of Right Ankle",
    anchor: [-0.08, 0.06, 0.02],
    underlyingAnatomy: {
      bones: ["Calcaneus", "Talus", "Navicular Tuberosity"],
      vessels: ["Posterior Tibial Artery (Medial Plantar Branch)"],
      nerves: ["Tibial Nerve (Medial Calcaneal Branches)"],
      musclesTissues: ["Deltoid Ligament of Ankle", "Tibialis Posterior Tendon", "Flexor Retinaculum"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Produces severe persistent pain, heel swelling, and inability to bear weight on the foot.",
    chikitsaProtocol: "Warm sesame oil Lepa with Guggulu to reduce calcaneal spur agony and ligamentous strain."
  },
  {
    id: "kurchashira_foot_left",
    sanskritName: "Kurchashira Marma (कूर्चशिर मर्म - Left Foot)",
    englishTranslation: "Head of Brush Centre (Left Ankle Base)",
    totalCount: 4,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Directly Below the Medial Malleolus of Left Ankle",
    anchor: [0.08, 0.06, 0.02],
    underlyingAnatomy: {
      bones: ["Sustentaculum Tali", "Calcaneus"],
      vessels: ["Medial Malleolar Arterial Network"],
      nerves: ["Tibial Nerve Branches"],
      musclesTissues: ["Plantar Calcaneonavicular (Spring) Ligament", "Tibialis Posterior"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Excruciating pain, loss of medial longitudinal arch, and painful limp.",
    chikitsaProtocol: "Application of Murivenna plaster followed by gentle transverse friction massage."
  },

  // 17-18. Manibandha Marma (2 points: Bilateral Wrist Joints)
  {
    id: "manibandha_right",
    sanskritName: "Manibandha Marma (मणिबन्ध मर्म - Right Wrist)",
    englishTranslation: "Wrist Bracelet Articulation (Right)",
    totalCount: 2,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Right Radiocarpal Articular Line",
    anchor: [-0.25, 1.05, 0.04],
    underlyingAnatomy: {
      bones: ["Distal Radius", "Distal Ulna", "Scaphoid", "Lunate", "Triquetrum"],
      vessels: ["Radial & Ulnar Arteries (Palmar & Dorsal Carpal Arches)"],
      nerves: ["Median Nerve", "Ulnar Nerve", "Superficial Radial Nerve"],
      musclesTissues: ["Flexor Retinaculum (Transverse Carpal Ligament)", "Extensor Retinaculum", "Articular Capsule"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Trauma induces acute wrist joint ankylosis, severe continuous pain, and motor wrist drop.",
    chikitsaProtocol: "Gentle circular traction and passive rotation with warm Mahanarayana taila to enhance synovial fluid synthesis."
  },
  {
    id: "manibandha_left",
    sanskritName: "Manibandha Marma (मणिबन्ध मर्म - Left Wrist)",
    englishTranslation: "Wrist Bracelet Articulation (Left)",
    totalCount: 2,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Left Radiocarpal Articular Line",
    anchor: [0.25, 1.05, 0.04],
    underlyingAnatomy: {
      bones: ["Radius Styloid", "Ulna Styloid", "Carpal Bones"],
      vessels: ["Anterior & Posterior Interosseous Arteries"],
      nerves: ["Median Nerve (Carpal Tunnel)", "Ulnar Nerve (Guyon's Canal)"],
      musclesTissues: ["Radiocarpal Joint Capsule", "Palmaris Longus Tendon"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Carpal tunnel compression, severe intractable throbbing pain, and permanent joint rigidity.",
    chikitsaProtocol: "Application of Bala-Ashwagandhadi taila with mild longitudinal joint distraction."
  },

  // 19-20. Gulpha Marma (2 points: Bilateral Ankle Joints)
  {
    id: "gulpha_right",
    sanskritName: "Gulpha Marma (गुल्फ मर्म - Right Ankle)",
    englishTranslation: "Ankle Mortise Articulation (Right)",
    totalCount: 2,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Right Talocrural Joint between Medial & Lateral Malleoli",
    anchor: [-0.08, 0.09, 0.0],
    underlyingAnatomy: {
      bones: ["Medial Malleolus (Tibia)", "Lateral Malleolus (Fibula)", "Talus Trochlea"],
      vessels: ["Anterior Tibial Artery", "Peroneal Artery Malleolar Branches"],
      nerves: ["Tibial Nerve", "Superficial & Deep Peroneal Nerves", "Sural Nerve"],
      musclesTissues: ["Deltoid Ligament", "Anterior Talofibular Ligament", "Calcaneofibular Ligament", "Synovial Capsule"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Apana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Trauma induces severe crippling pain, joint stiffness (Stambha), and permanent limping gait.",
    chikitsaProtocol: "Janu-Basti style warm oil pooling (Gulpha Basti) with Murivenna and Ksheerabala to resolve chronic sprains."
  },
  {
    id: "gulpha_left",
    sanskritName: "Gulpha Marma (गुल्फ मर्म - Left Ankle)",
    englishTranslation: "Ankle Mortise Articulation (Left)",
    totalCount: 2,
    category: "Rujakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Left Talocrural Joint between Malleoli",
    anchor: [0.08, 0.09, 0.0],
    underlyingAnatomy: {
      bones: ["Distal Tibiofibular Syndesmosis", "Talus"],
      vessels: ["Posterior Tibial Artery", "Anterior Lateral Malleolar Artery"],
      nerves: ["Tibial & Sural Nerves"],
      musclesTissues: ["Anterior Talofibular Ligament", "Peroneus Longus & Brevis Tendons"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Apana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Severe intractable joint agony, swelling, instability, and inability to ambulate.",
    chikitsaProtocol: "Gentle figure-eight joint mobilization combined with Dhanwantaram 101 taila."
  },

  // 21-24. Indrabasti Marma (4 points: 2 Forearms, 2 Calves)
  {
    id: "indrabasti_arm_right",
    sanskritName: "Indrabasti Marma (इन्द्रबस्ति मर्म - Right Forearm)",
    englishTranslation: "Indra's Reservoir Centre (Right Forearm)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Center of Volar Aspect of Right Forearm (Between Muscle Bellies)",
    anchor: [-0.24, 1.15, 0.04],
    underlyingAnatomy: {
      bones: ["Radius", "Ulna", "Interosseous Membrane"],
      vessels: ["Anterior Interosseous Artery", "Radial Artery", "Median Vein"],
      nerves: ["Median Nerve (Main Trunk)", "Anterior Interosseous Nerve"],
      musclesTissues: ["Pronator Teres", "Flexor Carpi Radialis", "Flexor Digitorum Superficialis & Profundus"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Penetration causes copious arterial hemorrhage, hemorrhagic shock, and rapid death.",
    chikitsaProtocol: "Deep ischemic thumb compression along muscle bellies with warm Bala taila to relieve intestinal colicky spasms via reflex pathways."
  },
  {
    id: "indrabasti_arm_left",
    sanskritName: "Indrabasti Marma (इन्द्रबस्ति मर्म - Left Forearm)",
    englishTranslation: "Indra's Reservoir Centre (Left Forearm)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Center of Volar Aspect of Left Forearm",
    anchor: [0.24, 1.15, 0.04],
    underlyingAnatomy: {
      bones: ["Radius", "Ulna"],
      vessels: ["Radial & Ulnar Arteries"],
      nerves: ["Median Nerve", "Ulnar Nerve"],
      musclesTissues: ["Flexor Digitorum Superficialis", "Flexor Carpi Ulnaris"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces severe blood loss, compartment syndrome, Volkmann's ischemic contracture, and death.",
    chikitsaProtocol: "Longitudinal massage with Mahanarayana taila to regulate digestive Agni and gastrointestinal motility."
  },
  {
    id: "indrabasti_calf_right",
    sanskritName: "Indrabasti Marma (इन्द्रबस्ति मर्म - Right Calf)",
    englishTranslation: "Indra's Reservoir Centre (Right Calf)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Middle of Right Calf at Junction of Gastrocnemius Bellies",
    anchor: [-0.09, 0.28, -0.04],
    underlyingAnatomy: {
      bones: ["Tibia Posterior Shaft", "Fibula"],
      vessels: ["Posterior Tibial Artery & Veins", "Peroneal Artery", "Small Saphenous Vein"],
      nerves: ["Tibial Nerve (Deep)"],
      musclesTissues: ["Gastrocnemius (Medial & Lateral Heads)", "Soleus", "Plantaris Tendon"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Samana Vayu",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Laceration precipitates catastrophic exsanguination, deep vein thrombosis, and delayed mortality.",
    chikitsaProtocol: "Deep upward effleurage with Sahacharadi taila; activates venous return pump and cures nocturnal calf cramps."
  },
  {
    id: "indrabasti_calf_left",
    sanskritName: "Indrabasti Marma (इन्द्रबस्ति मर्म - Left Calf)",
    englishTranslation: "Indra's Reservoir Centre (Left Calf)",
    totalCount: 4,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Extremities",
    structuralClass: "Mamsa Marma",
    subLocation: "Middle of Left Calf at Junction of Gastrocnemius Bellies",
    anchor: [0.09, 0.28, -0.04],
    underlyingAnatomy: {
      bones: ["Tibia", "Fibula"],
      vessels: ["Posterior Tibial Vascular Bundle"],
      nerves: ["Tibial Nerve"],
      musclesTissues: ["Soleus", "Gastrocnemius", "Tibialis Posterior"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Samana Vayu",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Severe muscular necrosis, unmanageable blood loss, and death from hemodynamic collapse.",
    chikitsaProtocol: "Warm poultice application (Valuka Sweda) followed by thumb kneading to stimulate urinary and bladder tone."
  },

  // 25-26. Kurpara Marma (2 points: Bilateral Elbow Joints)
  {
    id: "kurpara_right",
    sanskritName: "Kurpara Marma (कूर्पर मर्म - Right Elbow)",
    englishTranslation: "Elbow Pivot Articulation (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Right Humeroulnar & Humeroradial Articulation",
    anchor: [-0.23, 1.23, 0.01],
    underlyingAnatomy: {
      bones: ["Distal Humerus Trochlea & Capitulum", "Olecranon of Ulna", "Head of Radius"],
      vessels: ["Brachial Artery Bifurcation", "Radial & Ulnar Collateral Arteries"],
      nerves: ["Median Nerve", "Radial Nerve", "Ulnar Nerve (Cubital Tunnel)"],
      musclesTissues: ["Biceps Brachii Tendon", "Brachialis", "Triceps Tendon", "Annular & Collateral Ligaments"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Dislocation or crush injury causes permanent arm flexion deformity (Kuni), contracture, and muscle wasting.",
    chikitsaProtocol: "Gentle hydrotherapy and Janu/Kurpara Basti with warm Ksheerabala taila; highly beneficial for tennis/golfer's elbow."
  },
  {
    id: "kurpara_left",
    sanskritName: "Kurpara Marma (कूर्पर मर्म - Left Elbow)",
    englishTranslation: "Elbow Pivot Articulation (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Left Humeroulnar & Humeroradial Articulation",
    anchor: [0.23, 1.23, 0.01],
    underlyingAnatomy: {
      bones: ["Distal Humerus", "Ulna Olecranon", "Radial Head"],
      vessels: ["Recurrent Radial & Ulnar Arteries"],
      nerves: ["Ulnar Nerve in Cubital Tunnel", "Median Nerve"],
      musclesTissues: ["Elbow Joint Capsule", "Pronator Teres Origin", "Brachioradialis"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Trauma leads to cubital tunnel syndrome, clawing of medial digits, and permanent functional limitation.",
    chikitsaProtocol: "Application of Murivenna plaster and gentle mobilization to release hepatic/splenic stress via meridian linkages."
  },

  // 27-28. Janu Marma (2 points: Bilateral Knee Joints)
  {
    id: "janu_right",
    sanskritName: "Janu Marma (जानु मर्म - Right Knee)",
    englishTranslation: "Knee Articulation Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Right Patellofemoral & Tibiofemoral Articulation",
    anchor: [-0.09, 0.47, 0.05],
    underlyingAnatomy: {
      bones: ["Femoral Condyles", "Tibial Plateau", "Patella"],
      vessels: ["Genicular Arterial Anastomosis (5 Branches)", "Popliteal Artery"],
      nerves: ["Tibial Nerve", "Common Peroneal Nerve", "Saphenous Nerve"],
      musclesTissues: ["Anterior & Posterior Cruciate Ligaments (ACL/PCL)", "Medial & Lateral Menisci", "Patellar Tendon"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Apana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Rupture causes permanent joint instability, severe degenerative arthritis, and inability to walk (Khanjata).",
    chikitsaProtocol: "Janu Basti with warm Dhanwantaram or Ksheerabala taila (30 min) to regenerate synovial cartilage and relieve osteoarthritic pain."
  },
  {
    id: "janu_left",
    sanskritName: "Janu Marma (जानु मर्म - Left Knee)",
    englishTranslation: "Knee Articulation Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sandhi Marma",
    subLocation: "Left Patellofemoral & Tibiofemoral Articulation",
    anchor: [0.09, 0.47, 0.05],
    underlyingAnatomy: {
      bones: ["Femur Condyles", "Tibia Plateau", "Patella"],
      vessels: ["Genicular Arterial Tree", "Popliteal Vein"],
      nerves: ["Peroneal Nerve (Circling Fibular Neck)"],
      musclesTissues: ["Menisci", "Cruciate Ligaments", "Quadriceps Tendon"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Apana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Severe ligamentous tearing, genu valgum/varum deformity, and severe locomotor handicap.",
    chikitsaProtocol: "Patra Pinda Sweda followed by gentle traction to alleviate Sandhigata Vata."
  },

  // 29-32. Ani Marma (4 points: 2 Arms, 2 Thighs)
  {
    id: "ani_arm_right",
    sanskritName: "Ani Marma (आणि मर्म - Right Arm)",
    englishTranslation: "Needle Pin Centre (Right Distal Arm)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "3 Angulas Above the Right Elbow Joint (Bilateral to Biceps)",
    anchor: [-0.22, 1.29, 0.02],
    underlyingAnatomy: {
      bones: ["Anteromedial Shaft of Humerus"],
      vessels: ["Brachial Artery & Venae Comitantes", "Basilic Vein"],
      nerves: ["Median Nerve", "Medial Cutaneous Nerve of Forearm"],
      musclesTissues: ["Biceps Brachii Distal Belly", "Brachialis Muscle", "Medial Intermuscular Septum"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Mamsa Dhatu",
    vulnerabilityEffect: "Trauma induces severe contracture of forearm muscles, hand paralysis, and trophic limb wasting.",
    chikitsaProtocol: "Gentle sustained digital pressure with Bala-Ashwagandhadi taila to release spastic biceps contractions."
  },
  {
    id: "ani_arm_left",
    sanskritName: "Ani Marma (आणि मर्म - Left Arm)",
    englishTranslation: "Needle Pin Centre (Left Distal Arm)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "3 Angulas Above the Left Elbow Joint",
    anchor: [0.22, 1.29, 0.02],
    underlyingAnatomy: {
      bones: ["Humerus Distal Shaft"],
      vessels: ["Brachial Artery Branches"],
      nerves: ["Median Nerve", "Radial Nerve (Spiraling)"],
      musclesTissues: ["Brachialis", "Triceps Medial Head"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Mamsa Dhatu",
    vulnerabilityEffect: "Ischemic contracture, sensory numbness of palmar digits, and prolonged neuromuscular paresis.",
    chikitsaProtocol: "Application of warm Murivenna oil with rhythmic stroking along the neurovascular pathway."
  },
  {
    id: "ani_thigh_right",
    sanskritName: "Ani Marma (आणि मर्म - Right Thigh)",
    englishTranslation: "Needle Pin Centre (Right Distal Thigh)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "3 Angulas Above Right Patella on Distal Quadriceps",
    anchor: [-0.09, 0.54, 0.05],
    underlyingAnatomy: {
      bones: ["Distal Shaft of Femur (Supracondylar Region)"],
      vessels: ["Descending Genicular Artery (Supreme Genicular)", "Femoral Artery Entering Adductor Hiatus"],
      nerves: ["Nerve to Vastus Medialis (Femoral Nerve Branch)", "Saphenous Nerve"],
      musclesTissues: ["Vastus Medialis", "Rectus Femoris Tendinous Expansion", "Adductor Magnus Tendon"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Snayu & Mamsa Dhatu",
    vulnerabilityEffect: "Trauma induces severe swelling (Shopha), knee joint stiffness, and inability to extend the leg.",
    chikitsaProtocol: "Thumb acupressure with Mahanarayana taila to relieve patellar tracking pain and hypertonic quads."
  },
  {
    id: "ani_thigh_left",
    sanskritName: "Ani Marma (आणि मर्म - Left Thigh)",
    englishTranslation: "Needle Pin Centre (Left Distal Thigh)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "3 Angulas Above Left Patella on Distal Quadriceps",
    anchor: [0.09, 0.54, 0.05],
    underlyingAnatomy: {
      bones: ["Femur Supracondylar Ridge"],
      vessels: ["Descending Genicular Vessels"],
      nerves: ["Branches of Femoral Nerve"],
      musclesTissues: ["Vastus Lateralis & Medialis", "Quadriceps Aponeurosis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Snayu & Mamsa Dhatu",
    vulnerabilityEffect: "Severe loss of knee extensor power, chronic joint effusions, and reflex muscle atrophy.",
    chikitsaProtocol: "Herbal steam fomentation (Nadi Sweda) with Dashamoola decoction."
  },

  // 33-36. Urvi Marma (4 points: 2 Mid-Arms, 2 Mid-Thighs)
  {
    id: "urvi_arm_right",
    sanskritName: "Urvi Marma (उर्वी मर्म - Right Arm)",
    englishTranslation: "Broad Channel Centre (Right Mid-Arm)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Exact Middle of Right Arm along Medial Neurovascular Bundle",
    anchor: [-0.20, 1.34, 0.02],
    underlyingAnatomy: {
      bones: ["Mid-Shaft of Humerus (Deltoid Tuberosity Level)"],
      vessels: ["Brachial Artery", "Profunda Brachii Artery", "Basilic Vein"],
      nerves: ["Median Nerve", "Ulnar Nerve", "Medial Antibrachial Cutaneous Nerve"],
      musclesTissues: ["Coracobrachialis", "Biceps Brachii", "Medial Intermuscular Septum"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu & Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Puncture or laceration produces severe hemorrhage, wasting of arm muscles (Sakthishosha), and paralysis.",
    chikitsaProtocol: "Gentle rhythmic effleurage with Chandanadi taila to reduce vascular congestion and hypertension."
  },
  {
    id: "urvi_arm_left",
    sanskritName: "Urvi Marma (उर्वी मर्म - Left Arm)",
    englishTranslation: "Broad Channel Centre (Left Mid-Arm)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Exact Middle of Left Arm along Medial Neurovascular Bundle",
    anchor: [0.20, 1.34, 0.02],
    underlyingAnatomy: {
      bones: ["Humerus Mid-Shaft"],
      vessels: ["Brachial Artery & Accompanying Veins"],
      nerves: ["Median Nerve", "Musculocutaneous Nerve"],
      musclesTissues: ["Biceps Brachii", "Brachialis"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu & Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Trauma produces rapid muscular wasting, ischemic paresthesia, and chronic brachial plexus neuropathy.",
    chikitsaProtocol: "Application of Bala taila with circular friction towards heart to encourage venous return."
  },
  {
    id: "urvi_thigh_right",
    sanskritName: "Urvi Marma (उर्वी मर्म - Right Thigh)",
    englishTranslation: "Broad Channel Centre (Right Mid-Thigh)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Center of Right Thigh along Hunter's Sub-Sartorial Canal",
    anchor: [-0.10, 0.65, 0.04],
    underlyingAnatomy: {
      bones: ["Shaft of Femur (Linea Aspera)"],
      vessels: ["Femoral Artery & Vein (in Adductor Canal)", "Profunda Femoris Artery"],
      nerves: ["Saphenous Nerve", "Nerve to Vastus Medialis"],
      musclesTissues: ["Sartorius", "Vastus Medialis", "Adductor Longus & Magnus"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Sira, Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces severe arterial hemorrhage, pseudoaneurysm, and profound atrophy of thigh musculature.",
    chikitsaProtocol: "Deep longitudinal strokes with Sahacharadi taila to combat sciatica, vascular claudication, and muscle spasms."
  },
  {
    id: "urvi_thigh_left",
    sanskritName: "Urvi Marma (उर्वी मर्म - Left Thigh)",
    englishTranslation: "Broad Channel Centre (Left Mid-Thigh)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Center of Left Thigh along Hunter's Sub-Sartorial Canal",
    anchor: [0.10, 0.65, 0.04],
    underlyingAnatomy: {
      bones: ["Femur Shaft"],
      vessels: ["Femoral Artery and Vein"],
      nerves: ["Saphenous Nerve"],
      musclesTissues: ["Sartorius Muscle", "Adductor Group"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu & Vyana Vayu",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Severe blood loss, loss of femoral pulse, ischemia of foot, and irreversible thigh muscle wasting.",
    chikitsaProtocol: "Kashaya Seka (warm herbal decoction stream) followed by gentle kneading with Mahanarayana taila."
  },

  // 37-40. Lohitaksha Marma (4 points: 2 Axillary Roots, 2 Femoral Roots)
  {
    id: "lohitaksha_axilla_right",
    sanskritName: "Lohitaksha Marma (लोहिताक्ष मर्म - Right Axilla)",
    englishTranslation: "Red Eye Vascular Root (Right Axillary Origin)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Anterior Fold of Right Axilla below Clavicle",
    anchor: [-0.16, 1.40, 0.01],
    underlyingAnatomy: {
      bones: ["1st & 2nd Ribs", "Clavicle Lateral Third", "Coracoid Process of Scapula"],
      vessels: ["Axillary Artery (2nd & 3rd Parts)", "Axillary Vein", "Thoracoacromial Artery"],
      nerves: ["Brachial Plexus Cords (Lateral, Medial, Posterior)"],
      musclesTissues: ["Pectoralis Major & Minor", "Subclavius", "Clavipectoral Fascia"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu & Ranjaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Severe uncontrollable hemorrhage, complete arm paralysis (brachial plexopathy), and systemic shock.",
    chikitsaProtocol: "Gentle circular touch with Chandanadi taila to release chronic thoracic outlet tightness and lymph blockages."
  },
  {
    id: "lohitaksha_axilla_left",
    sanskritName: "Lohitaksha Marma (लोहिताक्ष मर्म - Left Axilla)",
    englishTranslation: "Red Eye Vascular Root (Left Axillary Origin)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Anterior Fold of Left Axilla below Clavicle",
    anchor: [0.16, 1.40, 0.01],
    underlyingAnatomy: {
      bones: ["Coracoid Process", "Clavicle", "Upper Ribs"],
      vessels: ["Axillary Artery & Vein", "Lateral Thoracic Artery"],
      nerves: ["Brachial Plexus Cords"],
      musclesTissues: ["Pectoralis Minor", "Serratus Anterior Superior Slips"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu & Ranjaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Massive hematoma, arm ischemia, permanent loss of sensation, and motor paralysis of the upper limb.",
    chikitsaProtocol: "Very light feather-touch Abhyanga with Ksheerabala 101 to decompress the brachial plexus."
  },
  {
    id: "lohitaksha_groin_right",
    sanskritName: "Lohitaksha Marma (लोहिताक्ष मर्म - Right Femoral Triangle)",
    englishTranslation: "Red Eye Vascular Root (Right Femoral Sheath)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Center of Right Femoral Triangle below Inguinal Ligament",
    anchor: [-0.08, 0.78, 0.06],
    underlyingAnatomy: {
      bones: ["Pubic Ramus", "Femoral Head", "Acetabulum"],
      vessels: ["Femoral Artery (Common)", "Femoral Vein", "Great Saphenous Vein Junction"],
      nerves: ["Femoral Nerve (Anterior Division)"],
      musclesTissues: ["Femoral Sheath", "Pectineus", "Iliopsoas Tendon", "Inguinal Lymph Nodes"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Ranjaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Puncture induces fatal exsanguination within minutes, hemorrhagic shock, or leg paralysis (Marana/Pakshaghata).",
    chikitsaProtocol: "Delicate clockwise warming massage with Dhanwantaram taila to improve lower extremity arterial and venous return."
  },
  {
    id: "lohitaksha_groin_left",
    sanskritName: "Lohitaksha Marma (लोहिताक्ष मर्म - Left Femoral Triangle)",
    englishTranslation: "Red Eye Vascular Root (Left Femoral Sheath)",
    totalCount: 4,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Sira Marma",
    subLocation: "Center of Left Femoral Triangle below Inguinal Ligament",
    anchor: [0.08, 0.78, 0.06],
    underlyingAnatomy: {
      bones: ["Pubic Bone", "Femur Neck"],
      vessels: ["Common Femoral Artery & Vein"],
      nerves: ["Femoral Nerve Trunk"],
      musclesTissues: ["Iliopsoas", "Fascia Lata (Cribriform Fascia)"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu & Ranjaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Catastrophic arterial rupture, severe blood loss, loss of distal pulses, and permanent quadriceps paralysis.",
    chikitsaProtocol: "Gentle lymphatic drainage stroking towards pelvic nodes with warm Ghee and Pinda taila."
  },

  // 41-42. Kakshadhara Marma (2 points: Bilateral Clavipectoral Folds)
  {
    id: "kakshadhara_right",
    sanskritName: "Kakshadhara Marma (कक्षाधर मर्म - Right Clavipectoral Fold)",
    englishTranslation: "Axillary Suspensor Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between Anterior Axillary Fold and Chest Wall (Coracoid Fossa)",
    anchor: [-0.14, 1.41, 0.05],
    underlyingAnatomy: {
      bones: ["Coracoid Process of Scapula", "Clavicle Inferior Surface", "1st Rib"],
      vessels: ["Cephalic Vein Piercing Clavipectoral Fascia", "Thoracoacromial Artery Deltoid Branch"],
      nerves: ["Lateral Pectoral Nerve", "Supraclavicular Nerves"],
      musclesTissues: ["Pectoralis Major Clavicular Head", "Pectoralis Minor Insertion", "Coracobrachialis Origin"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Trauma induces severe shoulder joint subluxation, loss of arm abduction, and brachial neuralgia (Pakshaghata).",
    chikitsaProtocol: "Subtle sustained upward pressure with Mahamasha taila to release frozen shoulder and pectoralis minor tightness."
  },
  {
    id: "kakshadhara_left",
    sanskritName: "Kakshadhara Marma (कक्षाधर मर्म - Left Clavipectoral Fold)",
    englishTranslation: "Axillary Suspensor Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between Anterior Axillary Fold and Chest Wall",
    anchor: [0.14, 1.41, 0.05],
    underlyingAnatomy: {
      bones: ["Coracoid Process", "Clavicle"],
      vessels: ["Cephalic Vein", "Acromiothoracic Vessels"],
      nerves: ["Brachial Plexus Anterior Divisions"],
      musclesTissues: ["Clavipectoral Fascia", "Pectoralis Major & Minor"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Arm contracture, intractable neuropathic pain, and inability to elevate the upper extremity.",
    chikitsaProtocol: "Warm herbal compress with Nirgundi taila followed by gentle shoulder distraction."
  },

  // 43-44. Vankshana / Vitapa Marma (2 points: Bilateral Inguinal Canals)
  {
    id: "vitapa_right",
    sanskritName: "Vitapa / Vankshana Marma (विटप / वङ्क्षण मर्म - Right Inguinal Canal)",
    englishTranslation: "Inguinal Suspensory Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between Groin Crease and Testis/Vulva along Inguinal Canal",
    anchor: [-0.06, 0.81, 0.07],
    underlyingAnatomy: {
      bones: ["Pubic Tubercle", "Pectineal Line of Pubis"],
      vessels: ["Testicular/Ovarian Vessels", "Inferior Epigastric Artery", "Cremasteric Artery"],
      nerves: ["Ilioinguinal Nerve", "Genital Branch of Genitofemoral Nerve"],
      musclesTissues: ["Spermatic Cord / Round Ligament of Uterus", "Inguinal Ligament", "Conjoint Tendon"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu & Shukradhara Kala",
    dhatuAssociation: "Snayu & Shukra/Artava Dhatu",
    vulnerabilityEffect: "Trauma induces severe inguinal hernia, testicular atrophy, sterility (Shandhata), and impotence.",
    chikitsaProtocol: "Ultra-gentle circular massage with Ashwagandha-Bala taila to strengthen the pelvic floor and reproductive vitality."
  },
  {
    id: "vitapa_left",
    sanskritName: "Vitapa / Vankshana Marma (विटप / वङ्क्षण मर्म - Left Inguinal Canal)",
    englishTranslation: "Inguinal Suspensory Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Extremities",
    structuralClass: "Snayu Marma",
    subLocation: "Between Groin Crease and Testis/Vulva along Inguinal Canal",
    anchor: [0.06, 0.81, 0.07],
    underlyingAnatomy: {
      bones: ["Pubic Tubercle", "Superior Pubic Ramus"],
      vessels: ["Pampiniform Venous Plexus", "Testicular Artery"],
      nerves: ["Ilioinguinal Nerve", "Genitofemoral Nerve"],
      musclesTissues: ["External Oblique Aponeurosis", "Internal Oblique & Transversus Abdominis"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Apana Vayu & Shukradhara Kala",
    dhatuAssociation: "Snayu & Shukra/Artava Dhatu",
    vulnerabilityEffect: "Infertility, oligospermia, chronic inguinal neuralgia, and testicular neuralgia.",
    chikitsaProtocol: "Warm Ghee and Sukumara Ghrita local massage to nourish Apana Vayu and pelvic srotas."
  },

  // --------------------------------------------------------------------------
  // B. CHEST & THORAX / URAS (9 MARMA POINTS)
  // --------------------------------------------------------------------------

  // 45. Hridaya Marma (1 Central Heart Centre)
  {
    id: "hridaya_marma",
    sanskritName: "Hridaya Marma (हृदय मर्म - Central Heart)",
    englishTranslation: "Supreme Vital Heart Centre",
    totalCount: 1,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Center of Mediastinum Behind Sternum at 4th Intercostal Space",
    anchor: [0.0, 1.25, 0.10],
    underlyingAnatomy: {
      bones: ["Body of Sternum (Mesosternum)", "Costal Cartilages (4th, 5th, 6th)"],
      vessels: ["Ascending Aorta", "Coronary Arteries", "Superior & Inferior Vena Cava", "Internal Thoracic Arteries"],
      nerves: ["Cardiac Nerve Plexus", "Vagus Nerve (CN X)", "Phrenic Nerves (Bilateral)"],
      musclesTissues: ["Myocardium (4-Chamber Heart)", "Pericardial Sac", "Pectoralis Major", "Transversus Thoracis"]
    },
    pramanaSize: "Hrdaya-Mushti (~4 Angula / 8.0 cm)",
    primaryDosha: "Sadhaka Pitta & Vyana Vayu",
    dhatuAssociation: "Rasa, Rakta & Ojas Dhatu",
    vulnerabilityEffect: "Direct trauma precipitates instantaneous loss of consciousness, cardiac arrest, ventricular fibrillation, and instant mortality.",
    chikitsaProtocol: "Very light clockwise devotional friction (Hridaya Tarpanam) using Brahmi Ghrita or warm Bala taila; balances emotion and dispels panic."
  },

  // 46-47. Stanamula Marma (2 points: Below Breasts)
  {
    id: "stanamula_right",
    sanskritName: "Stanamula Marma (स्तनमूल मर्म - Right Submammary)",
    englishTranslation: "Submammary Root Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Directly 2 Angulas Below Right Nipple / 6th Intercostal Space",
    anchor: [-0.09, 1.20, 0.12],
    underlyingAnatomy: {
      bones: ["6th & 7th Ribs and Costal Cartilages"],
      vessels: ["6th Intercostal Artery & Vein", "Musculophrenic Artery"],
      nerves: ["6th Intercostal Nerve (Anterior Cutaneous Branch)"],
      musclesTissues: ["Pectoralis Major Inferior Margin", "Rectus Abdominis Upper Insertion", "Diaphragm Attachment"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Avalambaka Kapha & Prana Vayu",
    dhatuAssociation: "Mamsa & Rasa Dhatu",
    vulnerabilityEffect: "Puncture fills the pleural cavity with sputum/blood (Kaphapurna Kostha), resulting in suffocation, pleurisy, and delayed death.",
    chikitsaProtocol: "Gentle horizontal effleurage with Karpasastyadi taila to open lower lobe bronchial air flow."
  },
  {
    id: "stanamula_left",
    sanskritName: "Stanamula Marma (स्तनमूल मर्म - Left Submammary)",
    englishTranslation: "Submammary Root Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Directly 2 Angulas Below Left Nipple / 6th Intercostal Space",
    anchor: [0.09, 1.20, 0.12],
    underlyingAnatomy: {
      bones: ["6th Rib", "7th Costal Cartilage"],
      vessels: ["Internal Thoracic Branches", "Intercostal Vessels"],
      nerves: ["Left Intercostal Nerves"],
      musclesTissues: ["Pectoralis Major", "Serratus Anterior", "Diaphragm Costal Slips"]
    },
    pramanaSize: "2 Angula (~4.0 cm)",
    primaryDosha: "Avalambaka Kapha & Prana Vayu",
    dhatuAssociation: "Mamsa & Rasa Dhatu",
    vulnerabilityEffect: "Trauma causes hemopneumothorax, massive respiratory distress (Kasa, Shwasa), and death from respiratory failure.",
    chikitsaProtocol: "Warm compress with Dashamoola decoction followed by light circular thumb pressure."
  },

  // 48-49. Stanarohita Marma (2 points: Above Breasts)
  {
    id: "stanarohita_right",
    sanskritName: "Stanarohita Marma (स्तनरोहित मर्म - Right Supramammary)",
    englishTranslation: "Supramammary Apex Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Mamsa Marma",
    subLocation: "2 Angulas Directly Above Right Nipple / 3rd Intercostal Space",
    anchor: [-0.09, 1.30, 0.12],
    underlyingAnatomy: {
      bones: ["3rd & 4th Ribs"],
      vessels: ["Internal Thoracic Artery Perforators", "3rd Anterior Intercostal Artery"],
      nerves: ["3rd Intercostal Nerve", "Supraclavicular Nerve Intermediate Branches"],
      musclesTissues: ["Pectoralis Major Sternal Head", "Intercostal Muscles", "Right Superior Lung Lobe"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Udana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Injury produces internal thoracic hemorrhage filling the chest (Raktapurna Kostha), cough with bloody sputum, and fatal exhaustion.",
    chikitsaProtocol: "Application of Chandanadi taila to pacify Pitta; relieves asthma, bronchial spasms, and chest tightness."
  },
  {
    id: "stanarohita_left",
    sanskritName: "Stanarohita Marma (स्तनरोहित मर्म - Left Supramammary)",
    englishTranslation: "Supramammary Apex Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Mamsa Marma",
    subLocation: "2 Angulas Directly Above Left Nipple / 3rd Intercostal Space",
    anchor: [0.09, 1.30, 0.12],
    underlyingAnatomy: {
      bones: ["3rd Rib", "Costal Cartilage"],
      vessels: ["Internal Mammary Arterial Branches"],
      nerves: ["3rd Intercostal Nerve"],
      musclesTissues: ["Pectoralis Major", "Left Lung Lingula & Superior Lobe"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Udana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Mamsa & Rakta Dhatu",
    vulnerabilityEffect: "Severe hemoptysis, lung laceration, pleural effusion, and death within 15 to 30 days.",
    chikitsaProtocol: "Gentle outward spreading strokes with warm sesame oil to expand thoracic excursion."
  },

  // 50-51. Apalapa Marma (2 points: Mid-Axillary Line Below Axilla)
  {
    id: "apalapa_right",
    sanskritName: "Apalapa Marma (अपलाप मर्म - Right Mid-Axillary)",
    englishTranslation: "Lateral Thoracic Flank Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Below Right Axilla along Mid-Axillary Line at 4th-5th Rib Level",
    anchor: [-0.16, 1.26, 0.04],
    underlyingAnatomy: {
      bones: ["4th & 5th Ribs Mid-Axillary Shafts"],
      vessels: ["Lateral Thoracic Artery", "Lateral Cutaneous Intercostal Vessels"],
      nerves: ["Long Thoracic Nerve (of Bell)", "Intercostobrachial Nerve"],
      musclesTissues: ["Serratus Anterior Digitations", "Latissimus Dorsi Anterior Border", "Intercostal Muscles"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Vyana Vayu",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Puncture induces pus and bloody transformation of pleural fluid (Puyarakta Srava), septicemia, and delayed fatality.",
    chikitsaProtocol: "Subtle kneading with Bala-Ashwagandhadi taila to relieve winging of the scapula and intercostal neuralgia."
  },
  {
    id: "apalapa_left",
    sanskritName: "Apalapa Marma (अपलाप मर्म - Left Mid-Axillary)",
    englishTranslation: "Lateral Thoracic Flank Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Below Left Axilla along Mid-Axillary Line at 4th-5th Rib Level",
    anchor: [0.16, 1.26, 0.04],
    underlyingAnatomy: {
      bones: ["4th & 5th Ribs Shafts"],
      vessels: ["Lateral Thoracic Vessels", "Subscapular Artery Branches"],
      nerves: ["Long Thoracic Nerve", "Intercostal Nerve Cutaneous Branches"],
      musclesTissues: ["Serratus Anterior", "External Oblique Rib Slips"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Vyana Vayu",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Pleural empyema, intractable thoracic stitch pain, septic shock, and demise within 3 weeks.",
    chikitsaProtocol: "Warm herbal poultice application to soothe diaphragmatic pleura and stimulate lymphatic drainage."
  },

  // 52-53. Apastambha Marma (2 points: Bilateral Parasternal Bronchial Roots)
  {
    id: "apastambha_right",
    sanskritName: "Apastambha Marma (अपस्तम्भ मर्म - Right Parasternal Bronchus)",
    englishTranslation: "Bronchial Conduit Pillar Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Right Parasternal Line at 2nd Costal Cartilage (Over Right Bronchus)",
    anchor: [-0.04, 1.32, 0.11],
    underlyingAnatomy: {
      bones: ["2nd Costal Cartilage & Sternomanubrial Junction (Angle of Louis)"],
      vessels: ["Internal Thoracic Artery & Vein", "Right Bronchial Artery"],
      nerves: ["Pulmonary Nerve Plexus", "2nd Intercostal Nerve"],
      musclesTissues: ["Right Primary Bronchus", "Pectoralis Major Sternal Fibers", "Tracheobronchial Lymph Nodes"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Penetration causes bronchial laceration, filling of airways with blood/sputum (Vata-Kapha Stambha), asphyxia, and death.",
    chikitsaProtocol: "Steam inhalation with Tulsi and eucalyptus followed by gentle feather-light stroking with Mahanarayana taila to open airway conduits."
  },
  {
    id: "apastambha_left",
    sanskritName: "Apastambha Marma (अपस्तम्भ मर्म - Left Parasternal Bronchus)",
    englishTranslation: "Bronchial Conduit Pillar Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Chest / Thorax",
    structuralClass: "Sira Marma",
    subLocation: "Left Parasternal Line at 2nd Costal Cartilage (Over Left Bronchus)",
    anchor: [0.04, 1.32, 0.11],
    underlyingAnatomy: {
      bones: ["2nd Costal Cartilage Left", "Sternal Border"],
      vessels: ["Internal Thoracic Artery", "Left Bronchial Arteries"],
      nerves: ["Cardiac & Pulmonary Autonomic Plexus"],
      musclesTissues: ["Left Mainstem Bronchus", "Transversus Thoracis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Tracheobronchial disruption, severe dyspnea, cyanosis, and fatal pulmonary collapse.",
    chikitsaProtocol: "Application of Karpooradi taila with slow rhythmic breathing exercises (Pranayama)."
  },

  // --------------------------------------------------------------------------
  // C. ABDOMEN & PELVIS / UDARA (3 MARMA POINTS)
  // --------------------------------------------------------------------------

  // 54. Nabhi Marma (1 Central Umbilical Center)
  {
    id: "nabhi_marma",
    sanskritName: "Nabhi Marma (नाभि मर्म - Solar Umbilical Plexus)",
    englishTranslation: "Supreme Umbilical Life Centre (Solar Plexus)",
    totalCount: 1,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Abdomen & Pelvis",
    structuralClass: "Sira Marma",
    subLocation: "Umbilicus / Mid-Abdominal Line (Over Abdominal Aorta Bifurcation)",
    anchor: [0.0, 1.05, 0.10],
    underlyingAnatomy: {
      bones: ["L3-L4 Vertebral Bodies (Posterior Plane)"],
      vessels: ["Abdominal Aorta & Inferior Vena Cava Bifurcation", "Superior & Inferior Epigastric Arteries", "Paraumbilical Veins"],
      nerves: ["Celiac & Superior Mesenteric Plexuses (Solar Plexus)", "10th Intercostal Nerve (T10 Dermatome)"],
      musclesTissues: ["Linea Alba", "Umbilical Ring", "Transversalis Fascia", "Greater Omentum & Small Intestine Root"]
    },
    pramanaSize: "Swapanitala (~4 Angula / 8.0 cm)",
    primaryDosha: "Pachaka & Ranjaka Pitta, Samana Vayu",
    dhatuAssociation: "Mamsa, Sira & Rakta Dhatu",
    vulnerabilityEffect: "Puncture ruptures abdominal aorta/mesentery, leading to massive internal hemorrhage, peritonitis, shock, and instant death within 24 hours.",
    chikitsaProtocol: "Nabhi Basti (warm medicated oil reservoir over umbilicus) with Dhanwantaram or Hingwashtak taila; directly regulates digestive Agni, IBS, and metabolic fire."
  },

  // 55. Basti Marma (1 Central Urinary Bladder / Hypogastrium)
  {
    id: "basti_marma",
    sanskritName: "Basti Marma (बस्ति मर्म - Urinary Bladder)",
    englishTranslation: "Vesical Life Reservoir Centre",
    totalCount: 1,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Abdomen & Pelvis",
    structuralClass: "Mamsa Marma",
    subLocation: "Suprapubic Midline (Hypogastric Region over Urinary Bladder)",
    anchor: [0.0, 0.90, 0.08],
    underlyingAnatomy: {
      bones: ["Pubic Symphysis", "Superior Pubic Rami"],
      vessels: ["Superior & Inferior Vesical Arteries", "Vesical Venous Plexus", "Internal Iliac Branches"],
      nerves: ["Inferior Hypogastric (Pelvic) Plexus", "Pelvic Splanchnic Nerves (S2-S4 Nervi Erigentes)"],
      musclesTissues: ["Detrusor Urinae Muscle", "Rectus Abdominis Distal Insertion", "Median Umbilical Ligament (Urachus)"]
    },
    pramanaSize: "Swapanitala (~4 Angula / 8.0 cm)",
    primaryDosha: "Apana Vayu & Kledaka Kapha",
    dhatuAssociation: "Mamsa, Meda & Mutra Vaha Srotas",
    vulnerabilityEffect: "Rupture causes acute uroperitoneum, pelvic extravasation, septic peritonitis, anuria, and death within 1 to 7 days.",
    chikitsaProtocol: "Warm Uttar Basti or external oil compress with Sahacharadi taila; cures chronic urinary retention, dysuria, and pelvic floor spasticity."
  },

  // 56. Guda Marma (1 Perineal / Anal Sphincter Centre)
  {
    id: "guda_marma",
    sanskritName: "Guda Marma (गुद मर्म - Perineal & Anal Sphincter)",
    englishTranslation: "Perineal Excretory Gate Centre",
    totalCount: 1,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Abdomen & Pelvis",
    structuralClass: "Mamsa Marma",
    subLocation: "Perineum at Tip of Coccyx / External Anal Sphincter",
    anchor: [0.0, 0.77, -0.02],
    underlyingAnatomy: {
      bones: ["Coccyx (Tip)", "Sacrococcygeal Joint", "Ischial Tuberosities"],
      vessels: ["Inferior Rectal (Hemorrhoidal) Artery & Vein", "Internal Pudendal Vessels"],
      nerves: ["Pudendal Nerve (Inferior Rectal Nerve)", "Coccygeal Nerve Plexus"],
      musclesTissues: ["External & Internal Anal Sphincter", "Levator Ani (Puborectalis)", "Perineal Body", "Anococcygeal Ligament"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Mamsa, Purishavaha Srotas & Rakta Dhatu",
    vulnerabilityEffect: "Laceration produces massive septic shock, fatal sphincter rupture, severe blood loss, and death within days.",
    chikitsaProtocol: "Warm sitz bath (Avagaha Sweda) with Triphala decoction followed by Jatyadi taila application; heals anal fissures, piles, and pelvic tension."
  },

  // --------------------------------------------------------------------------
  // D. BACK & SPINE / PRISHTHA (14 MARMA POINTS)
  // --------------------------------------------------------------------------

  // 57-58. Katikataruna Marma (2 points: Sacroiliac Pelvic Hinges)
  {
    id: "katikataruna_right",
    sanskritName: "Katikataruna Marma (कटिकतरुण मर्म - Right Sacroiliac)",
    englishTranslation: "Sacroiliac Hip Pivot Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Right Sacroiliac Joint / Posterior Iliac Bone",
    anchor: [-0.07, 0.86, -0.08],
    underlyingAnatomy: {
      bones: ["Sacrum (Ala)", "Ilium (Auricular Surface)", "Sacroiliac Joint"],
      vessels: ["Superior Gluteal Artery & Vein", "Iliolumbar Artery"],
      nerves: ["Superior Gluteal Nerve", "Sacral Spinal Nerves Dorsal Rami (L4-S2)"],
      musclesTissues: ["Dorsal Sacroiliac Ligament", "Gluteus Maximus Origin", "Erector Spinae Base"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Asthi & Majja Dhatu",
    vulnerabilityEffect: "Trauma induces severe retroperitoneal hematoma, acute osteitis, systemic anemia (Pandu), and slow death from hemorrhage.",
    chikitsaProtocol: "Kati Basti with warm Mahanarayana taila to relieve sacroiliac subluxation and chronic sciatica."
  },
  {
    id: "katikataruna_left",
    sanskritName: "Katikataruna Marma (कटिकतरुण मर्म - Left Sacroiliac)",
    englishTranslation: "Sacroiliac Hip Pivot Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Left Sacroiliac Joint / Posterior Iliac Bone",
    anchor: [0.07, 0.86, -0.08],
    underlyingAnatomy: {
      bones: ["Sacrum", "Left Iliac Bone"],
      vessels: ["Superior Gluteal Vessels"],
      nerves: ["Sacral Dorsal Rami"],
      musclesTissues: ["Sacroiliac Ligament Complex", "Gluteus Medius Posterior Margin"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Asthi & Majja Dhatu",
    vulnerabilityEffect: "Severe intractable lumbosacral agony, internal pelvic bleeding, progressive pallor, and cachexia.",
    chikitsaProtocol: "Application of Dhanwantaram taila with deep sacral friction to align pelvic torsion."
  },

  // 59-60. Kukundara Marma (2 points: Dimples of Venus / PSIS)
  {
    id: "kukundara_right",
    sanskritName: "Kukundara Marma (कुकुन्दर मर्म - Right Posterior Iliac Spine)",
    englishTranslation: "Sacral Dimple Depressive Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sandhi Marma",
    subLocation: "Right Posterior Superior Iliac Spine (Dimple of Venus)",
    anchor: [-0.05, 0.88, -0.09],
    underlyingAnatomy: {
      bones: ["Posterior Superior Iliac Spine (PSIS)", "Sacral Promontory Level"],
      vessels: ["Branches of Superior Gluteal Artery", "Deep Lumbar Veins"],
      nerves: ["Superior Cluneal Nerves", "Sacral Nerves (Posterior Divisions)"],
      musclesTissues: ["Thoracolumbar Fascia", "Long Posterior Sacroiliac Ligament", "Multifidus"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Injury induces loss of sensation in lower limbs, flaccid pelvic floor paresis, and bowel/bladder dysfunction (Kundata).",
    chikitsaProtocol: "Firm palm pressure with warm Ksheerabala taila; highly effective for lumbar disc bulges and fertility disorders."
  },
  {
    id: "kukundara_left",
    sanskritName: "Kukundara Marma (कुकुन्दर मर्म - Left Posterior Iliac Spine)",
    englishTranslation: "Sacral Dimple Depressive Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sandhi Marma",
    subLocation: "Left Posterior Superior Iliac Spine (Dimple of Venus)",
    anchor: [0.05, 0.88, -0.09],
    underlyingAnatomy: {
      bones: ["PSIS Left", "Sacrum S1-S2"],
      vessels: ["Gluteal Arterial Network"],
      nerves: ["Superior Cluneal Nerves"],
      musclesTissues: ["Sacrotuberous Ligament Fibers", "Erector Spinae Tendon"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Pelvic instability, sciatic nerve irritation, and loss of postural equilibrium.",
    chikitsaProtocol: "Circular warm oil massage with Murivenna to release lumbosacral fascial restrictions."
  },

  // 61-62. Nitamba Marma (2 points: Above Hip Crests)
  {
    id: "nitamba_right",
    sanskritName: "Nitamba Marma (नितम्ब मर्म - Right Iliac Crest Ridge)",
    englishTranslation: "Pelvic Flank Ridge Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Posterior Third of Right Iliac Crest Ridge",
    anchor: [-0.12, 0.94, -0.07],
    underlyingAnatomy: {
      bones: ["Iliac Crest Ridge", "Iliac Fossa Posterior Rim"],
      vessels: ["Deep Circumflex Iliac Artery", "Lumbar Arteries (4th Branch)"],
      nerves: ["Iliohypogastric Nerve (Lateral Cutaneous Branch)", "12th Subcostal Nerve"],
      musclesTissues: ["Quadratus Lumborum", "Internal & External Oblique", "Gluteus Medius Origin"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Asthi & Mamsa Dhatu",
    vulnerabilityEffect: "Crush trauma causes massive retroperitoneal bleeding, paralysis of the lower trunk (Adhokaya Shosha), and demise from shock.",
    chikitsaProtocol: "Deep thumb kneading with warm Sahacharadi taila to release hypertonic quadratus lumborum and lower back spasms."
  },
  {
    id: "nitamba_left",
    sanskritName: "Nitamba Marma (नितम्ब मर्म - Left Iliac Crest Ridge)",
    englishTranslation: "Pelvic Flank Ridge Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Posterior Third of Left Iliac Crest Ridge",
    anchor: [0.12, 0.94, -0.07],
    underlyingAnatomy: {
      bones: ["Iliac Crest Left"],
      vessels: ["Iliolumbar Vascular Branches"],
      nerves: ["Iliohypogastric Nerve"],
      musclesTissues: ["Latissimus Dorsi Origin", "Iliocostalis Lumborum"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Apana Vayu",
    dhatuAssociation: "Asthi & Mamsa Dhatu",
    vulnerabilityEffect: "Lower trunk wasting, renal bed hematoma, and fatal organ compromise within 2 to 4 weeks.",
    chikitsaProtocol: "Warm herbal pouch fomentation (Patra Pinda Sweda) followed by application of Bala taila."
  },

  // 63-64. Parshvasandhi Marma (2 points: Flank Fossa at 12th Rib)
  {
    id: "parshvasandhi_right",
    sanskritName: "Parshvasandhi Marma (पार्श्वसन्धि मर्म - Right Flank Junction)",
    englishTranslation: "Thoracolumbar Flank Junction (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sira Marma",
    subLocation: "Posterior Flank at Inferior Margin of 12th Rib (Over Renal Bed)",
    anchor: [-0.13, 1.05, -0.05],
    underlyingAnatomy: {
      bones: ["12th Rib (Floating Rib)", "L1 Transverse Process"],
      vessels: ["Subcostal Artery & Vein", "Renal Capsular Collateral Arteries"],
      nerves: ["Subcostal Nerve (T12)", "Iliohypogastric Nerve"],
      musclesTissues: ["Quadratus Lumborum", "Transversus Abdominis Posterior Aponeurosis", "Perirenal Fat Pad"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Samana Vayu & Pachaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Puncture tears the renal cortex/capsule, causing massive hemoperitoneum, urinary extravasation, and delayed death.",
    chikitsaProtocol: "Gentle soothing friction with Chandanadi taila to alleviate renal colic and flank tension."
  },
  {
    id: "parshvasandhi_left",
    sanskritName: "Parshvasandhi Marma (पार्श्वसन्धि मर्म - Left Flank Junction)",
    englishTranslation: "Thoracolumbar Flank Junction (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sira Marma",
    subLocation: "Posterior Flank at Inferior Margin of 12th Rib (Over Spleen/Renal Bed)",
    anchor: [0.13, 1.05, -0.05],
    underlyingAnatomy: {
      bones: ["11th & 12th Ribs Left"],
      vessels: ["Subcostal Vessels", "Splenic & Left Renal Collateral Branches"],
      nerves: ["12th Thoracic Nerve"],
      musclesTissues: ["Diaphragm Costal Slips", "Thoracolumbar Fascia"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Samana Vayu & Pachaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Splenic/renal laceration, acute internal hemorrhage (Raktakshaya), shock, and demise within 15 days.",
    chikitsaProtocol: "Application of Dashamoola oil with gentle stroking towards the iliac spine."
  },

  // 65-66. Vrihati Marma (2 points: Mid-Thoracic Paraspinal / Scapular Level)
  {
    id: "vrihati_right",
    sanskritName: "Vrihati Marma (बृहती मर्म - Right Paraspinal Thorax)",
    englishTranslation: "Great Paraspinal Centre (Right)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sira Marma",
    subLocation: "Paraspinal Level of T4-T5 Vertebrae / Spine of Right Scapula Level",
    anchor: [-0.06, 1.28, -0.09],
    underlyingAnatomy: {
      bones: ["T4 & T5 Vertebral Laminae and Spinous Processes", "4th & 5th Ribs Posterior Angles"],
      vessels: ["Posterior Intercostal Arteries (4th & 5th)", "Deep Cervical & Dorsal Scapular Vessels"],
      nerves: ["Thoracic Spinal Nerves Dorsal Rami", "Dorsal Scapular Nerve"],
      musclesTissues: ["Trapezius (Middle Fibers)", "Rhomboid Major", "Longissimus Thoracis", "Semispinalis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces severe thoracic cavity hemorrhage, lung collapse, intractable dyspnea, and delayed mortality.",
    chikitsaProtocol: "Prishta Basti (warm oil reservoir over thoracic spine) with Mahanarayana taila to open lung capacity and relieve postural kyphosis."
  },
  {
    id: "vrihati_left",
    sanskritName: "Vrihati Marma (बृहती मर्म - Left Paraspinal Thorax)",
    englishTranslation: "Great Paraspinal Centre (Left)",
    totalCount: 2,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Sira Marma",
    subLocation: "Paraspinal Level of T4-T5 Vertebrae / Spine of Left Scapula Level",
    anchor: [0.06, 1.28, -0.09],
    underlyingAnatomy: {
      bones: ["T4-T5 Spinous Processes", "Posterior Ribs"],
      vessels: ["Posterior Intercostal Vessels"],
      nerves: ["Thoracic Dorsal Rami"],
      musclesTissues: ["Rhomboid Major", "Spinalis Thoracis", "Trapezius"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Severe blood accumulation in posterior mediastinum, pleurisy, and fatality within 20 days.",
    chikitsaProtocol: "Heated herbal pouch massage with Karpasastyadi taila to restore thoracic spine mobility."
  },

  // 67-68. Amsaphalaka Marma (2 points: Scapular Blades)
  {
    id: "amsaphalaka_right",
    sanskritName: "Amsaphalaka Marma (अंसफलक मर्म - Right Scapular Blade)",
    englishTranslation: "Scapular Blade Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Center of Triangular Blade of Right Scapula (Infraspinous Fossa)",
    anchor: [-0.12, 1.34, -0.08],
    underlyingAnatomy: {
      bones: ["Scapula (Body & Infraspinous Fossa)", "Spine of Scapula"],
      vessels: ["Suprascapular Artery & Vein", "Circumflex Scapular Artery (Scapular Anastomosis)"],
      nerves: ["Suprascapular Nerve", "Accessory Nerve (CN XI) Branches"],
      musclesTissues: ["Infraspinatus Muscle", "Teres Minor", "Trapezius Lower Fibers"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Asthi & Snayu Dhatu",
    vulnerabilityEffect: "Trauma induces severe suprascapular nerve palsy, atrophy of rotator cuff muscles, and permanent loss of shoulder abduction.",
    chikitsaProtocol: "Deep thumb stripping along the infraspinous fossa with warm Mahamasha taila to release rotator cuff tendonitis."
  },
  {
    id: "amsaphalaka_left",
    sanskritName: "Amsaphalaka Marma (अंसफलक मर्म - Left Scapular Blade)",
    englishTranslation: "Scapular Blade Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Asthi Marma",
    subLocation: "Center of Triangular Blade of Left Scapula (Infraspinous Fossa)",
    anchor: [0.12, 1.34, -0.08],
    underlyingAnatomy: {
      bones: ["Scapular Body Left", "Infraspinatus Fossa"],
      vessels: ["Circumflex Scapular Vessels", "Dorsal Scapular Artery"],
      nerves: ["Suprascapular Nerve"],
      musclesTissues: ["Infraspinatus", "Rhomboid Minor & Major Attachments"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Vyana Vayu",
    dhatuAssociation: "Asthi & Snayu Dhatu",
    vulnerabilityEffect: "Loss of shoulder external rotation, supraspinatus/infraspinatus wasting, and chronic arm numbness.",
    chikitsaProtocol: "Application of Murivenna oil followed by targeted myofascial trigger point release."
  },

  // 69-70. Amsa Marma (2 points: Top of Shoulders / Acromioclavicular Summit)
  {
    id: "amsa_right",
    sanskritName: "Amsa Marma (अंस मर्म - Right Shoulder Summit)",
    englishTranslation: "Shoulder Summit Articulation (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Snayu Marma",
    subLocation: "Top Summit of Right Shoulder at Acromioclavicular Joint",
    anchor: [-0.18, 1.43, -0.02],
    underlyingAnatomy: {
      bones: ["Acromion Process of Scapula", "Clavicle Lateral Extremity", "Humeral Head"],
      vessels: ["Suprascapular Artery", "Acromial Rete Anastomosis"],
      nerves: ["Supraclavicular Nerves (Lateral)", "Axillary Nerve Branches"],
      musclesTissues: ["Trapezius Superior Band", "Deltoid Anterior & Middle Heads", "Coracoacromial Ligament", "Subacromial Bursa"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Trauma induces acromioclavicular separation, arm droop, severe stiffness (Amsashosha), and inability to lift the arm.",
    chikitsaProtocol: "Pinda Sweda (warm milk and rice bolus) and lubrication with warm Ksheerabala taila to restore glenohumeral biomechanics."
  },
  {
    id: "amsa_left",
    sanskritName: "Amsa Marma (अंस मर्म - Left Shoulder Summit)",
    englishTranslation: "Shoulder Summit Articulation (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Back & Spine",
    structuralClass: "Snayu Marma",
    subLocation: "Top Summit of Left Shoulder at Acromioclavicular Joint",
    anchor: [0.18, 1.43, -0.02],
    underlyingAnatomy: {
      bones: ["Left Acromion", "Clavicular Acromial End"],
      vessels: ["Acromiothoracic Arterial Branches"],
      nerves: ["Lateral Supraclavicular Nerves"],
      musclesTissues: ["Supraspinatus Tendon", "Acromioclavicular Ligament", "Deltoid"]
    },
    pramanaSize: "1 Angula (~2.0 cm)",
    primaryDosha: "Vyana Vayu & Sleshaka Kapha",
    dhatuAssociation: "Snayu & Sandhi Dhatu",
    vulnerabilityEffect: "Permanent shoulder contracture, rotator cuff impingement, and chronic arm wasting (Bahu Sosa).",
    chikitsaProtocol: "Gentle downward compression with Mahanarayana taila to relieve stress and cervical tightness."
  },

  // --------------------------------------------------------------------------
  // E. HEAD & NECK / JATRU-URDHVA (37 MARMA POINTS)
  // --------------------------------------------------------------------------

  // 71-72. Nila Marma (2 points: Bilateral Internal Jugular / Anterior Triangle)
  {
    id: "nila_right",
    sanskritName: "Nila Marma (नीला मर्म - Right Anterior Neck)",
    englishTranslation: "Blue Jugular Channel Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Anterior Cervical Triangle Lateral to Thyroid Cartilage (Over Internal Jugular Vein)",
    anchor: [-0.035, 1.44, 0.05],
    underlyingAnatomy: {
      bones: ["Hyoid Bone Greater Horn", "Thyroid Cartilage Lamina"],
      vessels: ["Internal Jugular Vein", "Superior Thyroid Artery & Vein", "Common Carotid Artery"],
      nerves: ["Ansa Cervicalis", "Superior Laryngeal Nerve (Internal Branch)"],
      musclesTissues: ["Sternocleidomastoid Anterior Border", "Omohyoid Superior Belly", "Thyrohyoid Muscle"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Udana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Trauma impairs vocal fold innervation, causing permanent muteness (Mukanata), hoarseness (Swarabheda), and loss of taste (Arasata).",
    chikitsaProtocol: "Ultra-gentle feather-light upward stroking with Chandanadi taila to soothe throat tightness and thyroid hyper-activity."
  },
  {
    id: "nila_left",
    sanskritName: "Nila Marma (नीला मर्म - Left Anterior Neck)",
    englishTranslation: "Blue Jugular Channel Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Anterior Cervical Triangle Lateral to Thyroid Cartilage",
    anchor: [0.035, 1.44, 0.05],
    underlyingAnatomy: {
      bones: ["Thyroid Cartilage", "Hyoid Bone"],
      vessels: ["Internal Jugular Vein Left", "Carotid Bifurcation"],
      nerves: ["Vagus Nerve (CN X)", "Cervical Sympathetic Chain"],
      musclesTissues: ["Sternohyoid", "Sternothyroid", "Carotid Sheath"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Udana Vayu & Avalambaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Loss of voice, severe speech stammering (Gadgadadvam), and venous congestion of the cranium.",
    chikitsaProtocol: "Warm Ghee application to the anterior throat followed by humming Pranayama (Bhramari)."
  },

  // 73-74. Manya Marma (2 points: Bilateral SCM Margins)
  {
    id: "manya_right",
    sanskritName: "Manya Marma (मन्या मर्म - Right Lateral Neck)",
    englishTranslation: "Carotid Sheath Honor Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Posterolateral Neck along Posterior Border of Sternocleidomastoid",
    anchor: [-0.055, 1.45, 0.04],
    underlyingAnatomy: {
      bones: ["C3-C4 Vertebral Transverse Processes"],
      vessels: ["External Jugular Vein", "Ascending Cervical Artery"],
      nerves: ["Great Auricular Nerve", "Transverse Cervical Nerve", "Accessory Nerve (CN XI) Crossing"],
      musclesTissues: ["Sternocleidomastoid (SCM)", "Splenius Capitis", "Levator Scapulae Upper Insertion"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Udana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Sira & Mamsa Dhatu",
    vulnerabilityEffect: "Trauma induces spasmodic torticollis (Wry neck), severe dysarthria, and salivary gland dysfunction.",
    chikitsaProtocol: "Delicate longitudinal massage with warm Ksheerabala taila to release cervical muscle spasm and TMJ stress."
  },
  {
    id: "manya_left",
    sanskritName: "Manya Marma (मन्या मर्म - Left Lateral Neck)",
    englishTranslation: "Carotid Sheath Honor Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Posterolateral Neck along Posterior Border of SCM",
    anchor: [0.055, 1.45, 0.04],
    underlyingAnatomy: {
      bones: ["C3-C4 Transverse Processes"],
      vessels: ["External Jugular Vein Left"],
      nerves: ["Accessory Nerve (Spinal Division)", "Cervical Plexus Branches"],
      musclesTissues: ["Sternocleidomastoid", "Scalene Muscles"]
    },
    pramanaSize: "3 Angula (~6.0 cm)",
    primaryDosha: "Udana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Sira & Mamsa Dhatu",
    vulnerabilityEffect: "Loss of taste sensation, dysphagia, permanent neck rotation spasm, and vocal weakness.",
    chikitsaProtocol: "Warm sesame oil Lepa followed by mild cervical isometric relaxation."
  },

  // 75-82. Sira Matrika Marma (8 points: 4 on Each Side along Carotid Tree)
  {
    id: "siramatrika_r1",
    sanskritName: "Sira Matrika Marma 1 (सिरा मातृका १ - Right Lower Carotid)",
    englishTranslation: "Maternal Carotid Conduit (Right Lower)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Right Lower Carotid Triangle at Omohyoid Crossing",
    anchor: [-0.04, 1.42, 0.03],
    underlyingAnatomy: {
      bones: ["C6 Vertebra (Chassaignac's Carotid Tubercle)"],
      vessels: ["Common Carotid Artery (Proximal)", "Internal Jugular Vein"],
      nerves: ["Vagus Nerve Trunk (CN X)", "Sympathetic Trunk"],
      musclesTissues: ["Carotid Sheath Deep Fascia", "Omohyoid Intermediate Tendon"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Sadhaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Laceration precipitates catastrophic exsanguination, massive cerebral ischemia, and immediate death within minutes.",
    chikitsaProtocol: "Gentle non-compressive cooling touch with Brahmi taila; direct pressure contraindicated due to carotid sinus reflex."
  },
  {
    id: "siramatrika_l1",
    sanskritName: "Sira Matrika Marma 1 (सिरा मातृका १ - Left Lower Carotid)",
    englishTranslation: "Maternal Carotid Conduit (Left Lower)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Left Lower Carotid Triangle at Omohyoid Crossing",
    anchor: [0.04, 1.42, 0.03],
    underlyingAnatomy: {
      bones: ["C6 Chassaignac's Tubercle"],
      vessels: ["Left Common Carotid Artery", "Thoracic Duct Arch (Deep)"],
      nerves: ["Vagus Nerve (CN X)"],
      musclesTissues: ["Carotid Sheath", "Sternocleidomastoid Lower Segment"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Sadhaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Instantaneous hemorrhagic shock, acute stroke, and instant fatality.",
    chikitsaProtocol: "Very light cooling application of Chandana paste to calm Pitta in the arterial tree."
  },
  {
    id: "siramatrika_r2",
    sanskritName: "Sira Matrika Marma 2 (सिरा मातृका २ - Right Carotid Bifurcation)",
    englishTranslation: "Maternal Carotid Conduit (Right Bifurcation)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Right Carotid Bifurcation at Superior Border of Thyroid Cartilage",
    anchor: [-0.045, 1.46, 0.03],
    underlyingAnatomy: {
      bones: ["C4 Vertebral Body", "Hyoid Bone"],
      vessels: ["Carotid Sinus & Glomus (Body)", "Internal & External Carotid Bifurcation"],
      nerves: ["Glossopharyngeal Nerve (Carotid Sinus Nerve of Hering)", "Vagus Nerve Branch"],
      musclesTissues: ["Carotid Sheath", "Middle Pharyngeal Constrictor"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Sadhaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Trauma triggers reflex vasovagal cardiac standstill, massive hemorrhage, and instantaneous mortality.",
    chikitsaProtocol: "Ultra-gentle feather stroking with Brahmi Ghrita to balance cerebral perfusion."
  },
  {
    id: "siramatrika_l2",
    sanskritName: "Sira Matrika Marma 2 (सिरा मातृका २ - Left Carotid Bifurcation)",
    englishTranslation: "Maternal Carotid Conduit (Left Bifurcation)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Left Carotid Bifurcation at Superior Border of Thyroid Cartilage",
    anchor: [0.045, 1.46, 0.03],
    underlyingAnatomy: {
      bones: ["C4 Vertebra", "Hyoid"],
      vessels: ["Carotid Sinus", "Internal & External Carotid Arteries"],
      nerves: ["Sinus Nerve (Hering)", "Vagus Nerve"],
      musclesTissues: ["Carotid Sheath", "Sternocleidomastoid"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Sadhaka Pitta",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Vascular collapse, acute cerebral infarction, and immediate death.",
    chikitsaProtocol: "Shirodhara with Ksheerabala taila to balance autonomic sympathetic tone."
  },
  {
    id: "siramatrika_r3",
    sanskritName: "Sira Matrika Marma 3 (सिरा मातृका ३ - Right Upper Cervical Carotid)",
    englishTranslation: "Maternal Carotid Conduit (Right Upper Cervical)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Right Carotid Sheath at Level of Mandibular Angle",
    anchor: [-0.05, 1.49, 0.025],
    underlyingAnatomy: {
      bones: ["C3 Vertebra", "Angle of Mandible"],
      vessels: ["Internal Carotid Artery (Extracranial)", "Facial & Lingual Arteries"],
      nerves: ["Hypoglossal Nerve (CN XII Crossing)", "Superior Cervical Ganglion"],
      musclesTissues: ["Digastric Muscle Posterior Belly", "Stylohyoid Muscle"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Trauma induces severe arterial hemorrhage, hypoglossal paralysis, and rapid death.",
    chikitsaProtocol: "Application of warm sesame oil with upward chin drainage strokes."
  },
  {
    id: "siramatrika_l3",
    sanskritName: "Sira Matrika Marma 3 (सिरा मातृका ३ - Left Upper Cervical Carotid)",
    englishTranslation: "Maternal Carotid Conduit (Left Upper Cervical)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Left Carotid Sheath at Level of Mandibular Angle",
    anchor: [0.05, 1.49, 0.025],
    underlyingAnatomy: {
      bones: ["C3 Vertebra", "Mandible Angle"],
      vessels: ["Internal Carotid Artery", "Internal Jugular Vein"],
      nerves: ["Hypoglossal Nerve (CN XII)", "Vagus Nerve"],
      musclesTissues: ["Posterior Digastric", "Stylopharyngeus"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Immediate lethal bleeding, tongue deviation, airway obstruction, and mortality.",
    chikitsaProtocol: "Subtle Nasya with Anu taila to clear cerebral micro-circulation."
  },
  {
    id: "siramatrika_r4",
    sanskritName: "Sira Matrika Marma 4 (सिरा मातृका ४ - Right Skull Base Carotid Canal)",
    englishTranslation: "Maternal Carotid Conduit (Right Skull Base)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Inferior Petrous Skull Base at Right Carotid Canal Entrance",
    anchor: [-0.055, 1.52, 0.02],
    underlyingAnatomy: {
      bones: ["Petrous Temporal Bone (Carotid Canal Aperture)", "Styloid Process"],
      vessels: ["Internal Carotid Artery Entering Skull", "Internal Jugular Vein Superior Bulb"],
      nerves: ["Glossopharyngeal (CN IX)", "Vagus (CN X)", "Accessory (CN XI)", "Hypoglossal (CN XII)"],
      musclesTissues: ["Parapharyngeal Space Fascia", "Longus Capitis"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Penetrating skull base trauma causes massive subarachnoid hemorrhage, multiple cranial nerve palsies, and instantaneous death.",
    chikitsaProtocol: "Shiro-Pichu (oil-soaked cotton pad over crown) with Ksheerabala 101 to nurture cranial nerve roots."
  },
  {
    id: "siramatrika_l4",
    sanskritName: "Sira Matrika Marma 4 (सिरा मातृका ४ - Left Skull Base Carotid Canal)",
    englishTranslation: "Maternal Carotid Conduit (Left Skull Base)",
    totalCount: 8,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Inferior Petrous Skull Base at Left Carotid Canal Entrance",
    anchor: [0.055, 1.52, 0.02],
    underlyingAnatomy: {
      bones: ["Temporal Bone Petrous Portion", "Jugular Foramen"],
      vessels: ["Internal Carotid Artery", "Jugular Bulb"],
      nerves: ["Lower 4 Cranial Nerves (CN IX-XII)"],
      musclesTissues: ["Stylomandibular Ligament", "Pharyngobasilar Fascia"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Instant fatality from basilar skull fracture, transection of the carotid canal, and exsanguination.",
    chikitsaProtocol: "Cooling sandal paste Lepa applied to the upper neck and mastoid."
  },

  // 83-84. Krikadika Marma (2 points: Atlanto-Occipital Joints)
  {
    id: "krikadika_right",
    sanskritName: "Krikadika Marma (कृकाटिका मर्म - Right Suboccipital Joint)",
    englishTranslation: "Atlanto-Occipital Articulation (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Junction of Neck and Occut at Right Atlanto-Occipital Joint",
    anchor: [-0.04, 1.50, -0.06],
    underlyingAnatomy: {
      bones: ["Occipital Condyle Right", "Atlas (C1 Superior Articular Facet)"],
      vessels: ["Vertebral Artery (Horizontal Segment in Suboccipital Triangle)", "Suboccipital Venous Plexus"],
      nerves: ["Suboccipital Nerve (C1 Dorsal Ramus)", "Greater Occipital Nerve (C2)"],
      musclesTissues: ["Rectus Capitis Posterior Major & Minor", "Obliquus Capitis Superior & Inferior", "Posterior Atlanto-Occipital Membrane"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Subluxation causes permanent head shaking/tremor (Chala Murdha), severe cervical instability, and ataxia.",
    chikitsaProtocol: "Griva Basti with Mahanarayana taila followed by gentle suboccipital decompression to relieve cervicogenic headaches and vestibular vertigo."
  },
  {
    id: "krikadika_left",
    sanskritName: "Krikadika Marma (कृकाटिका मर्म - Left Suboccipital Joint)",
    englishTranslation: "Atlanto-Occipital Articulation (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Junction of Neck and Occiput at Left Atlanto-Occipital Joint",
    anchor: [0.04, 1.50, -0.06],
    underlyingAnatomy: {
      bones: ["Occiput", "Atlas C1"],
      vessels: ["Vertebral Artery Left", "Posterior Spinal Artery"],
      nerves: ["Greater Occipital Nerve", "C1-C2 Nerve Roots"],
      musclesTissues: ["Suboccipital Musculature", "Ligamentum Nuchae Upper Origin"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sandhi & Snayu Dhatu",
    vulnerabilityEffect: "Permanent uncontrolled head nodding, loss of neck rotation, and occipital neuralgia.",
    chikitsaProtocol: "Warm herbal compress with Nirgundi decoction to release deep occipital spasms."
  },

  // 85-86. Vidhura Marma (2 points: Retroauricular Mastoid Depressions)
  {
    id: "vidhura_right",
    sanskritName: "Vidhura Marma (विधुर मर्म - Right Retroauricular)",
    englishTranslation: "Retroauricular Auditory Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Snayu Marma",
    subLocation: "Depression Immediately Postero-Inferior to Right Ear Lobule / Below Mastoid",
    anchor: [-0.075, 1.53, -0.02],
    underlyingAnatomy: {
      bones: ["Mastoid Process of Temporal Bone", "Styloid Process"],
      vessels: ["Posterior Auricular Artery & Vein", "Occipital Artery Branches"],
      nerves: ["Facial Nerve (CN VII Exiting Stylomastoid Foramen)", "Greater Auricular Nerve"],
      musclesTissues: ["Sternocleidomastoid Superior Insertion", "Posterior Auricular Muscle", "Splenius Capitis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Snayu & Majja Dhatu",
    vulnerabilityEffect: "Trauma destroys acoustic/facial nerve conduction, resulting in sensorineural deafness (Badhirya) and facial paralysis (Bell's palsy).",
    chikitsaProtocol: "Karna Poorana (warm medicated oil instillation into ear canal) with Bilva or Ksheerabala taila to cure tinnitus, hearing loss, and otalgia."
  },
  {
    id: "vidhura_left",
    sanskritName: "Vidhura Marma (विधुर मर्म - Left Retroauricular)",
    englishTranslation: "Retroauricular Auditory Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Snayu Marma",
    subLocation: "Depression Postero-Inferior to Left Ear Lobule / Below Mastoid",
    anchor: [0.075, 1.53, -0.02],
    underlyingAnatomy: {
      bones: ["Mastoid Process", "Temporal Bone"],
      vessels: ["Posterior Auricular Vessels"],
      nerves: ["Facial Nerve (CN VII)", "Lesser Occipital Nerve"],
      musclesTissues: ["Digastric Muscle Posterior Belly Origin", "SCM"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Snayu & Majja Dhatu",
    vulnerabilityEffect: "Complete permanent ipsilateral deafness, facial droop, and loss of stapedial acoustic reflex.",
    chikitsaProtocol: "Gentle circular friction around mastoid groove with warm garlic oil (Lasunadi taila)."
  },

  // 87-88. Phana Marma (2 points: Lateral Nostrils / Alae of Nose)
  {
    id: "phana_right",
    sanskritName: "Phana Marma (फण मर्म - Right Nasal Ala)",
    englishTranslation: "Serpent Hood Olfactory Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Lateral Margin of Right Nostril Ala (Nasolabial Groove)",
    anchor: [-0.025, 1.56, 0.085],
    underlyingAnatomy: {
      bones: ["Maxilla (Frontal Process & Anterior Nasal Spine)", "Alar Cartilage"],
      vessels: ["Facial Artery (Angular Artery Branch)", "Lateral Nasal Artery", "Facial Vein"],
      nerves: ["Infraorbital Nerve (CN V2 Terminal Branches)", "External Nasal Nerve"],
      musclesTissues: ["Levator Labii Superioris Alaeque Nasi", "Nasalis Muscle (Compressor & Dilator)", "Procerus"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Trauma damages olfactory/trigeminal innervation, causing permanent anosmia (loss of smell) and rhinitis (Ghrana Nasha).",
    chikitsaProtocol: "Pratimarsha Nasya with Anu taila or Shadbindu taila (2 drops per nostril); clears chronic sinusitis, allergies, and migraines."
  },
  {
    id: "phana_left",
    sanskritName: "Phana Marma (फण मर्म - Left Nasal Ala)",
    englishTranslation: "Serpent Hood Olfactory Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Lateral Margin of Left Nostril Ala (Nasolabial Groove)",
    anchor: [0.025, 1.56, 0.085],
    underlyingAnatomy: {
      bones: ["Maxilla Alar Region", "Lateral Nasal Cartilage"],
      vessels: ["Angular Artery & Facial Vein"],
      nerves: ["Infraorbital Nerve (V2)"],
      musclesTissues: ["Nasalis", "Levator Labii Superioris"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Udana Vayu",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Loss of smell, chronic nasal airway obstruction, and facial sensory numbness.",
    chikitsaProtocol: "Gentle upward thumb stroking along nasolabial crease with warm Ghee."
  },

  // 89-90. Apanga Marma (2 points: Outer Canthi of Eyes)
  {
    id: "apanga_right",
    sanskritName: "Apanga Marma (अपाङ्ग मर्म - Right Outer Canthus)",
    englishTranslation: "Outer Eye Corner Visual Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Outer Canthus of Right Eye at Lateral Orbit Rim",
    anchor: [-0.06, 1.58, 0.06],
    underlyingAnatomy: {
      bones: ["Zygomatic Bone (Frontal Process)", "Greater Wing of Sphenoid"],
      vessels: ["Zygomatico-Orbital Artery", "Transverse Facial Artery Orbital Branches"],
      nerves: ["Zygomaticofacial & Zygomaticotemporal Nerves (CN V2)", "Lacrimal Nerve (CN V1)"],
      musclesTissues: ["Orbicularis Oculi (Lateral Palpebral Raphe)", "Lateral Rectus Muscle Expansion"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Alochaka Pitta & Prana Vayu",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Trauma induces severe visual field defects, blindness (Andhata), or unilateral diplopia.",
    chikitsaProtocol: "Netra Tarpana (medicated ghee eye reservoir) with Triphala Ghrita; restores macular health and relieves digital eye fatigue."
  },
  {
    id: "apanga_left",
    sanskritName: "Apanga Marma (अपाङ्ग मर्म - Left Outer Canthus)",
    englishTranslation: "Outer Eye Corner Visual Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Outer Canthus of Left Eye at Lateral Orbit Rim",
    anchor: [0.06, 1.58, 0.06],
    underlyingAnatomy: {
      bones: ["Zygomatic Bone Lateral Orbital Margin"],
      vessels: ["Lacrimal Artery Branches", "Orbital Veins"],
      nerves: ["Zygomatic Branches of Facial Nerve (CN VII)", "Trigeminal V1/V2"],
      musclesTissues: ["Orbicularis Oculi", "Lateral Palpebral Ligament"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Alochaka Pitta & Prana Vayu",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Visual blurring, optic nerve ischemia, ptosis, and permanent loss of sight.",
    chikitsaProtocol: "Ultra-light circular motion with pure cow's Ghee around orbital rim."
  },

  // 91-92. Avarta Marma (2 points: Supraorbital Eyebrow Notches)
  {
    id: "avarta_right",
    sanskritName: "Avarta Marma (आवर्त मर्म - Right Supraorbital Notch)",
    englishTranslation: "Supraorbital Whirlpool Centre (Right)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Supraorbital Margin at Junction of Medial and Middle Thirds of Eyebrow",
    anchor: [-0.035, 1.61, 0.075],
    underlyingAnatomy: {
      bones: ["Frontal Bone (Supraorbital Notch / Foramen)", "Superciliary Arch"],
      vessels: ["Supraorbital Artery & Vein", "Supratrochlear Artery"],
      nerves: ["Supraorbital Nerve (CN V1 Frontal Branch)", "Supratrochlear Nerve"],
      musclesTissues: ["Corrugator Supercilii", "Orbicularis Oculi (Orbital Portion)", "Frontalis Muscle"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Alochaka Pitta & Prana Vayu",
    dhatuAssociation: "Sandhi & Majja Dhatu",
    vulnerabilityEffect: "Trauma damages the supraorbital neurovascular bundle, causing severe visual impairment (Drishti Upaghata) and blinding cephalalgia.",
    chikitsaProtocol: "Gentle outward sliding strokes along eyebrow line with warm Brahmi taila; relieves fronto-orbital migraines and mental exhaustion."
  },
  {
    id: "avarta_left",
    sanskritName: "Avarta Marma (आवर्त मर्म - Left Supraorbital Notch)",
    englishTranslation: "Supraorbital Whirlpool Centre (Left)",
    totalCount: 2,
    category: "Vaikalyakara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Supraorbital Margin at Junction of Medial and Middle Thirds of Left Eyebrow",
    anchor: [0.035, 1.61, 0.075],
    underlyingAnatomy: {
      bones: ["Frontal Bone Left Notch"],
      vessels: ["Supraorbital Vessels"],
      nerves: ["Frontal Nerve (V1)"],
      musclesTissues: ["Corrugator Supercilii", "Frontalis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Alochaka Pitta & Prana Vayu",
    dhatuAssociation: "Sandhi & Majja Dhatu",
    vulnerabilityEffect: "Severe supraorbital neuralgia, photophobia, and permanent loss of visual clarity.",
    chikitsaProtocol: "Application of Chandana paste followed by gentle acupressure with the pads of the thumbs."
  },

  // 93-94. Utkshepa Marma (2 points: Temporalis Crest above Hairline)
  {
    id: "utkshepa_right",
    sanskritName: "Utkshepa Marma (उत्क्षेप मर्म - Right Temporal Crest)",
    englishTranslation: "Upward Projecting Hairline Centre (Right)",
    totalCount: 2,
    category: "Vishalyaghna",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Snayu Marma",
    subLocation: "Above Right Temple Hairline (Superior Temporal Line)",
    anchor: [-0.075, 1.65, 0.02],
    underlyingAnatomy: {
      bones: ["Parietal Bone", "Squamous Temporal Bone", "Frontal Bone"],
      vessels: ["Superficial Temporal Artery (Parietal Branch)", "Middle Temporal Vein"],
      nerves: ["Auriculotemporal Nerve (CN V3)", "Temporal Branch of Facial Nerve"],
      musclesTissues: ["Temporalis Muscle", "Epicranial Aponeurosis (Galea Aponeurotica)", "Temporoparietalis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Weapon penetration is survived as long as foreign body seals the defect; sudden extraction allows vital air (Prana Vayu) to rush out, resulting in fatal shock.",
    chikitsaProtocol: "Do NOT attempt forceful extraction in emergency puncture. Theraputically, soothing circles with Ksheerabala 101 soothe insomnia and temporal migraines."
  },
  {
    id: "utkshepa_left",
    sanskritName: "Utkshepa Marma (उत्क्षेप मर्म - Left Temporal Crest)",
    englishTranslation: "Upward Projecting Hairline Centre (Left)",
    totalCount: 2,
    category: "Vishalyaghna",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Snayu Marma",
    subLocation: "Above Left Temple Hairline (Superior Temporal Line)",
    anchor: [0.075, 1.65, 0.02],
    underlyingAnatomy: {
      bones: ["Temporal Bone", "Parietal Bone"],
      vessels: ["Superficial Temporal Vessels"],
      nerves: ["Auriculotemporal Nerve"],
      musclesTissues: ["Temporalis Muscle", "Galea Aponeurotica"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu",
    dhatuAssociation: "Snayu & Asthi Dhatu",
    vulnerabilityEffect: "Fatal collapse upon foreign body removal due to sudden intracranial pressure drop and pneumocephalus.",
    chikitsaProtocol: "Shiro-Abhyanga with Brahmi taila to calm agitated mental thoughts and anxiety."
  },

  // 95-96. Shankha Marma (2 points: Bilateral Temples / Pterion)
  {
    id: "shankha_right",
    sanskritName: "Shankha Marma (शङ्ख मर्म - Right Temple Pterion)",
    englishTranslation: "Conch Shell Temple Centre (Right)",
    totalCount: 2,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Asthi Marma",
    subLocation: "Depression in Right Temple between Eye Canthus and Ear (Pterion Junction)",
    anchor: [-0.07, 1.60, 0.04],
    underlyingAnatomy: {
      bones: ["Pterion (Junction of Frontal, Parietal, Temporal, and Sphenoid Bones)"],
      vessels: ["Anterior Branch of Middle Meningeal Artery (Directly Underlying)", "Deep Temporal Arteries"],
      nerves: ["Zygomaticotemporal Nerve", "Auriculotemporal Nerve", "Trigeminal CN V3 Motor Branches"],
      musclesTissues: ["Temporalis Muscle (Anterior Fibers)", "Temporal Fascia (Integument)"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Alochaka Pitta",
    dhatuAssociation: "Asthi, Sira & Majja Dhatu",
    vulnerabilityEffect: "Blow fractures fragile pterion, lacerating the middle meningeal artery to form a fatal extradural hematoma with death in 1 to 7 days.",
    chikitsaProtocol: "Extremely delicate non-pressing application of cold sandalwood or Brahmi paste; relieves acute hemicrania and cluster headaches."
  },
  {
    id: "shankha_left",
    sanskritName: "Shankha Marma (शङ्ख मर्म - Left Temple Pterion)",
    englishTranslation: "Conch Shell Temple Centre (Left)",
    totalCount: 2,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Asthi Marma",
    subLocation: "Depression in Left Temple between Eye Canthus and Ear (Pterion Junction)",
    anchor: [0.07, 1.60, 0.04],
    underlyingAnatomy: {
      bones: ["Left Pterion Sutural Confluence"],
      vessels: ["Middle Meningeal Artery", "Superficial Temporal Artery"],
      nerves: ["Auriculotemporal Nerve", "Temporal Branches CN VII"],
      musclesTissues: ["Temporalis", "Temporal Aponeurosis"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu & Alochaka Pitta",
    dhatuAssociation: "Asthi, Sira & Majja Dhatu",
    vulnerabilityEffect: "Rapid uncal herniation, coma, contralateral hemiplegia, and instant death from extradural hemorrhage.",
    chikitsaProtocol: "Shirodhara with cooling herbal decoction (Ksheerabala taila) to stabilize cranial pressure."
  },

  // 97. Sthapani Marma (1 Glabella / Third Eye Centre)
  {
    id: "sthapani_marma",
    sanskritName: "Sthapani Marma (स्थपनी मर्म - Third Eye Glabella)",
    englishTranslation: "Stabilizing Third Eye Centre (Ajna Chakra)",
    totalCount: 1,
    category: "Vishalyaghna",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Directly between Eyebrows at Glabella / Nasion",
    anchor: [0.0, 1.60, 0.08],
    underlyingAnatomy: {
      bones: ["Nasion (Junction of Frontal and Nasal Bones)", "Frontal Sinus (Anterior Wall)"],
      vessels: ["Supratrochlear Arteries & Veins", "Angular Vein", "Nasociliary Venous Anastomosis"],
      nerves: ["Supratrochlear Nerves (CN V1)", "Infratrochlear Nerve"],
      musclesTissues: ["Procerus Muscle", "Frontalis Medial Bellies", "Corrugator Supercilii Medial Heads"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu, Sadhaka Pitta & Tarpaka Kapha",
    dhatuAssociation: "Sira, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Piercing arrow can be survived while lodged; removal allows air/cerebrospinal fluid to escape with pneumocephalus and fatal collapse.",
    chikitsaProtocol: "Sustained gentle circular pressure with warm Brahmi Ghrita or Chandanadi taila; activates pituitary gland, enhances intuition, and banishes anxiety."
  },

  // 98-102. Simanta Marma (5 points: Cranial Sutures)
  {
    id: "simanta_coronal",
    sanskritName: "Simanta Marma 1 (सीमन्त मर्म - Coronal Suture / Bregma)",
    englishTranslation: "Cranial Boundary Seam (Coronal)",
    totalCount: 5,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Anterior Cranial Vault at Junction of Sagittal and Coronal Sutures (Bregma)",
    anchor: [0.0, 1.67, 0.04],
    underlyingAnatomy: {
      bones: ["Frontal Bone", "Bilateral Parietal Bones", "Bregma Suture"],
      vessels: ["Superior Sagittal Sinus (Anterior Third)", "Frontal Diploic Veins"],
      nerves: ["Meningeal Branches of Ophthalmic Nerve (CN V1)"],
      musclesTissues: ["Galea Aponeurotica", "Dura Mater (Falx Cerebri Anterior Attachment)"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Trauma precipitates severe delirium (Unmada), generalized seizures (Apasmarata), psychological collapse, and delayed death within a month.",
    chikitsaProtocol: "Shirodhara with Dhanwantaram taila to settle mental agitation, schizophrenia, and neurological hyper-arousal."
  },
  {
    id: "simanta_sagittal",
    sanskritName: "Simanta Marma 2 (सीमन्त मर्म - Sagittal Mid-Suture)",
    englishTranslation: "Cranial Boundary Seam (Sagittal)",
    totalCount: 5,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Midpoint of Sagittal Suture along Calvarium Vertex",
    anchor: [0.0, 1.69, 0.0],
    underlyingAnatomy: {
      bones: ["Bilateral Parietal Bones along Interparietal Suture"],
      vessels: ["Superior Sagittal Sinus (Mid-segment)", "Parietal Emissary Veins"],
      nerves: ["Dural Sensory Nerves"],
      musclesTissues: ["Epicranial Aponeurosis", "Falx Cerebri"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Superior sagittal sinus thrombosis, cerebral edema, mania, cognitive disintegration, and fatal coma.",
    chikitsaProtocol: "Application of Shiro-Pichu soaked in Ksheerabala taila to soothe cerebral exhaustion."
  },
  {
    id: "simanta_lambdoid",
    sanskritName: "Simanta Marma 3 (सीमन्त मर्म - Lambdoid Suture / Lambda)",
    englishTranslation: "Cranial Boundary Seam (Lambdoid)",
    totalCount: 5,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Posterior Cranial Vault at Junction of Sagittal and Lambdoid Sutures",
    anchor: [0.0, 1.66, -0.05],
    underlyingAnatomy: {
      bones: ["Occipital Bone Squama", "Parietal Bones (Lambda Junction)"],
      vessels: ["Confluence of Sinuses (Torcular Herophili Superior Margin)", "Occipital Diploic Veins"],
      nerves: ["Greater Occipital Nerve Cutaneous Branches"],
      musclesTissues: ["Galea Aponeurotica", "Occipitalis Muscle Bellies"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Trauma causes visual cortex contusion, intractable hallucinations, profound depression, and delayed demise.",
    chikitsaProtocol: "Gentle longitudinal effleurage with Mahamasha taila along the occiput to restore cranial-sacral rhythm."
  },
  {
    id: "simanta_squamosal_r",
    sanskritName: "Simanta Marma 4 (सीमन्त मर्म - Right Squamosal Suture)",
    englishTranslation: "Cranial Boundary Seam (Right Squamosal)",
    totalCount: 5,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Curved Squamosal Suture between Right Temporal and Parietal Bones",
    anchor: [-0.065, 1.65, -0.01],
    underlyingAnatomy: {
      bones: ["Squamous Temporal Bone", "Parietal Bone Inferior Border"],
      vessels: ["Middle Temporal Artery", "Parietal Diploic Vein"],
      nerves: ["Auriculotemporal Nerve Branches"],
      musclesTissues: ["Temporalis Fascia Deep Layer"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Temporal lobe contusion, aphasia, unprovoked seizures, and systemic exhaustion.",
    chikitsaProtocol: "Soothing rhythmic strokes with warm Chandanadi taila to alleviate temporal tension."
  },
  {
    id: "simanta_squamosal_l",
    sanskritName: "Simanta Marma 5 (सीमन्त मर्म - Left Squamosal Suture)",
    englishTranslation: "Cranial Boundary Seam (Left Squamosal)",
    totalCount: 5,
    category: "Kalantara Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Curved Squamosal Suture between Left Temporal and Parietal Bones",
    anchor: [0.065, 1.65, -0.01],
    underlyingAnatomy: {
      bones: ["Left Temporal Bone", "Parietal Bone"],
      vessels: ["Middle Temporal Vessels"],
      nerves: ["Trigeminal V3 Sensory Fibers"],
      musclesTissues: ["Temporalis Muscle"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sandhi, Asthi & Majja Dhatu",
    vulnerabilityEffect: "Language processing disruption (Wernicke's aphasia), chronic paranoia, and fatal metabolic decline.",
    chikitsaProtocol: "Shiro-Abhyanga with Brahmi oil to clear neurological srotas."
  },

  // 103-106. Shringataka Marma (4 points: Internal Cranial Vascular Confluence)
  {
    id: "shringataka_palate",
    sanskritName: "Shringataka Marma 1 (शृङ्गाटक मर्म - Palatine Nasopharyngeal)",
    englishTranslation: "Four-Way Crossroads Confluence (Palatine)",
    totalCount: 4,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Roof of Hard/Soft Palate Junction (Deep Nasopharyngeal Confluence)",
    anchor: [0.0, 1.54, 0.03],
    underlyingAnatomy: {
      bones: ["Horizontal Plate of Palatine Bone", "Vomer", "Pterygoid Plates"],
      vessels: ["Greater & Lesser Palatine Arteries", "Sphenopalatine Artery Branches", "Pharyngeal Venous Plexus"],
      nerves: ["Greater Palatine Nerve", "Nasopalatine Nerve", "Glossopharyngeal Nerve (CN IX) Pharyngeal Branch"],
      musclesTissues: ["Tensor & Levator Veli Palatini", "Superior Pharyngeal Constrictor"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu, Bodhaka Kapha & Alochaka Pitta",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Puncture causes catastrophic posterior epistaxis, asphyxiation from blood aspiration, and immediate death.",
    chikitsaProtocol: "Kavala & Gandusha (oil pulling) with warm Irimedadi taila; cures throat infections and stabilizes oral srotas."
  },
  {
    id: "shringataka_cribriform",
    sanskritName: "Shringataka Marma 2 (शृङ्गाटक मर्म - Spheno-Ethmoidal Cavernous)",
    englishTranslation: "Four-Way Crossroads Confluence (Cribriform Cavernous)",
    totalCount: 4,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Deep Cranial Base at Cribriform Plate / Cavernous Sinus Confluence",
    anchor: [0.0, 1.58, 0.01],
    underlyingAnatomy: {
      bones: ["Cribriform Plate of Ethmoid Bone", "Body of Sphenoid (Sella Turcica Anterior Wall)"],
      vessels: ["Cavernous Sinus Venous Confluence", "Intercavernous Sinuses", "Ophthalmic Veins"],
      nerves: ["Olfactory Nerve Filaments (CN I)", "Ophthalmic Division Trigeminal (CN V1)"],
      musclesTissues: ["Dura Mater of Anterior Cranial Fossa", "Olfactory Bulb"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Tarpaka Kapha",
    dhatuAssociation: "Sira & Majja Dhatu",
    vulnerabilityEffect: "Fracture induces acute cavernous sinus thrombosis, massive meningitis, and immediate mortality.",
    chikitsaProtocol: "Direct mechanical stimulation strictly forbidden. Treated via Nasya with medicated Ghee."
  },
  {
    id: "shringataka_pharynx_r",
    sanskritName: "Shringataka Marma 3 (शृङ्गाटक मर्म - Right Eustachian Confluence)",
    englishTranslation: "Four-Way Crossroads Confluence (Right Eustachian)",
    totalCount: 4,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Lateral Wall of Nasopharynx around Right Torus Tubarius",
    anchor: [-0.02, 1.55, 0.02],
    underlyingAnatomy: {
      bones: ["Medial Pterygoid Plate", "Auditory Tube Cartilage"],
      vessels: ["Ascending Pharyngeal Artery", "Pterygoid Venous Plexus"],
      nerves: ["Pharyngeal Nerve from Pterygopalatine Ganglion"],
      musclesTissues: ["Salpingopharyngeus", "Superior Constrictor"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Massive pharyngeal hemorrhage, rapid asphyxia, and instant death.",
    chikitsaProtocol: "Medicated smoke inhalation (Dhumapana) with Haridra and Guggulu."
  },
  {
    id: "shringataka_pharynx_l",
    sanskritName: "Shringataka Marma 4 (शृङ्गाटक मर्म - Left Eustachian Confluence)",
    englishTranslation: "Four-Way Crossroads Confluence (Left Eustachian)",
    totalCount: 4,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sira Marma",
    subLocation: "Lateral Wall of Nasopharynx around Left Torus Tubarius",
    anchor: [0.02, 1.55, 0.02],
    underlyingAnatomy: {
      bones: ["Sphenoid Pterygoid Base", "Eustachian Tube Cartilage"],
      vessels: ["Ascending Pharyngeal Vessels"],
      nerves: ["Pharyngeal Plexus Nerves"],
      musclesTissues: ["Levator Veli Palatini", "Salpingopharyngeus"]
    },
    pramanaSize: "4 Angula (~8.0 cm)",
    primaryDosha: "Prana Vayu & Bodhaka Kapha",
    dhatuAssociation: "Sira & Rakta Dhatu",
    vulnerabilityEffect: "Catastrophic deep airway hemorrhage and acute respiratory arrest.",
    chikitsaProtocol: "Gargling with Triphala Kashaya and honey to tone mucous membranes."
  },

  // 107. Adhipati Marma (1 Supreme Crown Centre)
  {
    id: "adhipati_marma",
    sanskritName: "Adhipati Marma (अधिपति मर्म - Supreme Crown Vertex)",
    englishTranslation: "Supreme Master Crown Centre (Sahasrara)",
    totalCount: 1,
    category: "Sadyah Pranahara",
    anatomicalRegion: "Head & Neck",
    structuralClass: "Sandhi Marma",
    subLocation: "Apex of Cranial Vertex / Bregma-Sagittal Zenith (Over Superior Sagittal Sinus)",
    anchor: [0.0, 1.70, 0.0],
    underlyingAnatomy: {
      bones: ["Parietal Bones (Coronal Zenith)", "Vertex Calvarium"],
      vessels: ["Superior Sagittal Sinus (Venous Lacunae)", "Parietal Emissary Veins", "Occipital Artery Terminal Branches"],
      nerves: ["Dura Mater Innervation", "Greater Occipital & Supratrochlear Anastomosis"],
      musclesTissues: ["Galea Aponeurotica", "Falx Cerebri Apex", "Arachnoid Granulations (Pacchionian Bodies)"]
    },
    pramanaSize: "1/2 Angula (~1.0 cm)",
    primaryDosha: "Prana Vayu, Sadhaka Pitta & Tarpaka Kapha",
    dhatuAssociation: "Majja & Ojas Dhatu",
    vulnerabilityEffect: "Direct penetrating blow fractures the cranial vertex, lacerating the superior sagittal sinus, causing massive intracranial hemorrhage, brainstem compression, and instantaneous mortality within 24 hours.",
    chikitsaProtocol: "Shirodhara or Shiro-Basti with Brahmi Ghrita or Ksheerabala 101 taila; opens cosmic spiritual awareness, grounds extreme nervous agitation, cures insomnia, and revitalizes the entire central nervous system."
  }
];

// Helper Lookup & Filter Functions
export function getMarmaById(id: string): MarmaPointData | undefined {
  return MARMA_DATABASE.find((m) => m.id === id);
}

export function filterMarmasByCategory(category: MarmaCategory | "ALL"): MarmaPointData[] {
  if (category === "ALL") return MARMA_DATABASE;
  return MARMA_DATABASE.filter((m) => m.category === category);
}

export function filterMarmasByRegion(region: MarmaRegion | "ALL"): MarmaPointData[] {
  if (region === "ALL") return MARMA_DATABASE;
  return MARMA_DATABASE.filter((m) => m.anatomicalRegion === region);
}

export function searchMarmas(query: string): MarmaPointData[] {
  const q = query.trim().toLowerCase();
  if (!q) return MARMA_DATABASE;
  return MARMA_DATABASE.filter((m) => {
    return (
      m.sanskritName.toLowerCase().includes(q) ||
      m.englishTranslation.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.anatomicalRegion.toLowerCase().includes(q) ||
      m.underlyingAnatomy.bones.some((b) => b.toLowerCase().includes(q)) ||
      m.underlyingAnatomy.vessels.some((v) => v.toLowerCase().includes(q)) ||
      m.underlyingAnatomy.nerves.some((n) => n.toLowerCase().includes(q)) ||
      m.underlyingAnatomy.musclesTissues.some((mu) => mu.toLowerCase().includes(q))
    );
  });
}
