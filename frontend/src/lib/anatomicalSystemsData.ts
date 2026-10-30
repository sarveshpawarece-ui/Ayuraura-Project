// ============================================================================
// AYURSETU 11 ANATOMICAL SYSTEMS DATA & METADATA
// ============================================================================

export type SystemId =
  | "skeletal"
  | "cardiovascular"
  | "nervous"
  | "digestive"
  | "respiratory"
  | "integumentary"
  | "lymphatic"
  | "endocrine"
  | "urinary"
  | "reproductive"
  | "muscular";

export type ModelSex = "male" | "female";

export const SYSTEM_GLTF_FILENAMES: Record<SystemId, string> = {
  skeletal: "01_skeletal.glb",
  cardiovascular: "02_cardiovascular.glb",
  nervous: "03_nervous.glb",
  digestive: "04_digestive.glb",
  respiratory: "05_respiratory.glb",
  integumentary: "06_integumentary.glb",
  lymphatic: "07_lymphatic.glb",
  endocrine: "08_endocrine.glb",
  urinary: "09_urinary.glb",
  reproductive: "10_reproductive.glb",
  muscular: "11_muscular.glb"
};

/**
 * Resolves the appropriate sex-specific GLTF model path for a given system
 */
export function getSystemGltfPath(sysId: SystemId, sex: ModelSex = "male"): string {
  const filename = SYSTEM_GLTF_FILENAMES[sysId] || `${sysId}.glb`;
  return `/models/${sex}/${filename}`;
}

/**
 * Returns prioritized multi-tier loader URL queue for a given anatomical system and sex
 */
export function getSystemUrlQueue(sysId: SystemId, sex: ModelSex = "male"): string[] {
  const sys = ANATOMICAL_SYSTEMS[sysId];
  const sexSpecific = getSystemGltfPath(sysId, sex);
  const anatomyFallback = `/models/anatomy/${SYSTEM_GLTF_FILENAMES[sysId]}`;
  const cdnUrl = sys?.cdnUrl;
  const fallbacks = sys?.cdnFallbacks || [];
  return Array.from(new Set([sexSpecific, anatomyFallback, cdnUrl, ...fallbacks].filter(Boolean)));
}

export interface SystemMeta {
  id: SystemId;
  name: string;
  code: string;
  sanskritName: string;
  srotas: string;
  dhatu: string;
  dosha: string;
  colorHex: string;
  gltfPath: string;
  cdnUrl: string;
  cdnFallbacks?: string[];
  targetCenter?: [number, number, number];
  targetHeight?: number;
  description: string;
  chemicalEquation: string;
  biochemicalProcess: string;
  macroMicroData: {
    cellType: string;
    keyEnzyme: string;
    organelles: string;
    ayurvedicMechanism: string;
    clinicalSignificance: string;
  };
  centroid: [number, number, number];
  explodeVec: [number, number, number];
  cameraZ: number;
}

export const ANATOMICAL_SYSTEMS: Record<SystemId, SystemMeta> = {
  skeletal: {
    id: "skeletal",
    name: "01. Skeletal System",
    code: "01_SKELETAL",
    sanskritName: "Asthi Samsthana (अस्थि संस्थान)",
    srotas: "Asthivaha Srotas",
    dhatu: "Asthi Dhatu (Bone Matrix)",
    dosha: "Vata Dosha (Vayu & Akasha)",
    colorHex: "#EAE3D2",
    gltfPath: "/models/anatomy/01_skeletal.glb",
    cdnUrl: "https://raw.githubusercontent.com/sesgigikimo/gym-muscle/main/skeleton.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/sesgigikimo/gym-muscle@main/skeleton.glb",
      "/models/anatomy/01_skeletal.glb"
    ],
    targetCenter: [0, 0.85, 0],
    targetHeight: 1.70,
    description:
      "Articulated human skeleton comprising 206 bones, providing structural framework, organ protection, leverage for movement, and mineral storage.",
    chemicalEquation: "3Ca₃(PO₄)₂ + Ca(OH)₂ ⇌ Ca₁₀(PO₄)₆(OH)₂",
    biochemicalProcess:
      "Dynamic osteoclastic bone resorption vs osteoblastic mineralization with hydroxyapatite crystal precipitation.",
    macroMicroData: {
      cellType: "Osteocytes, Osteoblasts & Multinucleated Osteoclasts",
      keyEnzyme: "Alkaline Phosphatase (ALP) & Carbonic Anhydrase II",
      organelles: "Collagen Type I Matrix, Hydroxyapatite Nanocrystals, Haversian Canals",
      ayurvedicMechanism:
        "Asthi Posha governed by Purisha and Vata; nourishing majja and providing stable Adhara for the entire sharira.",
      clinicalSignificance: "Osteopenia, Asthi Saushirya, fracture healing and mineral homeostasis."
    },
    centroid: [0, 0.85, 0],
    explodeVec: [0, 0, 0.25],
    cameraZ: 3.15
  },
  cardiovascular: {
    id: "cardiovascular",
    name: "02. Cardiovascular System",
    code: "02_CARDIOVASCULAR",
    sanskritName: "Raktavaha Samsthana (रक्तवह संस्थान)",
    srotas: "Rasavaha & Raktavaha Srotas",
    dhatu: "Rasa & Rakta Dhatu (Plasma & Blood)",
    dosha: "Sadhaka Pitta & Vyana Vayu",
    colorHex: "#E53935",
    gltfPath: "/models/anatomy/02_cardiovascular.glb",
    cdnUrl: "https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/heart.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/yihalem123/Human-Organ3D@main/models/heart.glb",
      "/models/anatomy/02_cardiovascular.glb"
    ],
    targetCenter: [-0.03, 0.82, 0.08],
    targetHeight: 0.28,
    description:
      "Anatomically precise 4-chambered heart (atria, ventricles, septum), aortic arch with 3 supra-aortic branches, vena cava vessels, coronary arteries, and systemic circulation tree.",
    chemicalEquation: "Hb + 4O₂ ⇌ Hb(O₂)₄  |  CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺",
    biochemicalProcess:
      "Allosteric hemoglobin oxygenation cooperativity and carbonic anhydrase-driven bicarbonate buffer maintaining physiological arterial pH.",
    macroMicroData: {
      cellType: "Cardiomyocytes, Erythrocytes, Endothelial Cells",
      keyEnzyme: "Carbonic Anhydrase, Troponin-I, Creatine Kinase-MB",
      organelles: "Intercalated Discs, Sarcoplasmic Reticulum Ca²⁺-ATPase (SERCA), Dense Mitochondria",
      ayurvedicMechanism:
        "Hridaya as Sadyah Pranahara Marma and seat of Ojas; Vyana Vayu pumps Rasa-Rakta to all 7 dhatus unceasingly.",
      clinicalSignificance: "Myocardial infarction, hypertension, cardiac arrhythmias, and tissue ischemia."
    },
    centroid: [-0.03, 0.82, 0.08],
    explodeVec: [-0.35, 0.15, 0.4],
    cameraZ: 2.2
  },
  nervous: {
    id: "nervous",
    name: "03. Nervous System",
    code: "03_NERVOUS",
    sanskritName: "Majjavaha & Manovaha (मज्जावह संस्थान)",
    srotas: "Majjavaha & Manovaha Srotas",
    dhatu: "Majja Dhatu (Neuro-Medullary Matrix)",
    dosha: "Prana Vayu & Tarpaka Kapha",
    colorHex: "#00E5FF",
    gltfPath: "/models/anatomy/03_nervous.glb",
    cdnUrl: "https://raw.githubusercontent.com/DrMuratAltun/beyin-simulatoru/main/brain.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/DrMuratAltun/beyin-simulatoru@main/brain.glb",
      "/models/anatomy/03_nervous.glb"
    ],
    targetCenter: [0, 1.56, 0.04],
    targetHeight: 0.22,
    description:
      "Anatomical brain with cerebral hemispheres (gyri & sulci), cerebellum with horizontal folia, brainstem, central spinal cord axis, and radiating peripheral nerve plexuses.",
    chemicalEquation: "Ach + Receptor ➔ Na⁺ Influx (+40mV Action Potential Peak)",
    biochemicalProcess:
      "Voltage-gated Na⁺/K⁺-ATPase depolarization wave traveling down myelinated axons, inducing presynaptic exocytotic Acetylcholine release into the synaptic cleft.",
    macroMicroData: {
      cellType: "Pyramidal Neurons, Astrocytes, Oligodendrocytes, Microglia",
      keyEnzyme: "Acetylcholinesterase, Tyrosine Hydroxylase, Na⁺/K⁺ ATPase",
      organelles: "Myelin Sheaths, Nodes of Ranvier, Presynaptic Synaptosomes",
      ayurvedicMechanism:
        "Shiras as Uttamanga (supreme organ) housing 10 Indriyas; Prana Vayu controls intellect (Dhi), retention (Dhriti), and recollection (Smriti).",
      clinicalSignificance: "Neuropathies, stroke, neurodegenerative disorders, and neuromuscular synaptic fatigue."
    },
    centroid: [0, 1.56, 0.04],
    explodeVec: [0, 0.45, 0.25],
    cameraZ: 2.0
  },
  digestive: {
    id: "digestive",
    name: "04. Digestive Viscera",
    code: "04_DIGESTIVE_VISCERA",
    sanskritName: "Annavaha Samsthana (अन्नवह संस्थान)",
    srotas: "Annavaha & Udakavaha Srotas",
    dhatu: "Pachaka Pitta (Jatharagni Transformation)",
    dosha: "Samana Vayu, Pachaka Pitta & Kledaka Kapha",
    colorHex: "#FF7043",
    gltfPath: "/models/anatomy/04_digestive.glb",
    cdnUrl: "https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/liver.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/yihalem123/Human-Organ3D@main/models/liver.glb",
      "https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/stomach.glb",
      "/models/anatomy/04_digestive.glb"
    ],
    targetCenter: [0.04, 0.45, 0.07],
    targetHeight: 0.38,
    description:
      "Muscular esophagus, J-shaped stomach with rugae folds, multilobar liver with gallbladder, endocrine pancreas, duodenum C-loop, and small/large intestinal tracts.",
    chemicalEquation: "Lipids + Bile Salts ➔ Emulsified Micelles  |  H⁺/K⁺-ATPase ➔ HCl (pH 1.5–2.0)",
    biochemicalProcess:
      "Peristaltic smooth muscle segmentation churning Ahara Rasa while gastric parietal cells secrete hydrochloric acid and hepatic bile salts emulsify lipids.",
    macroMicroData: {
      cellType: "Parietal Cells, Chief Cells, Enterocytes, Hepatocytes",
      keyEnzyme: "Pepsinogen, Amylase, Pancreatic Lipase, Trypsin",
      organelles: "Gastric Pits, Microvilli Brush Border, Hepatic Sinusoids",
      ayurvedicMechanism:
        "Jatharagni cooks ingested Ahara into Ahara Rasa and Kitta (waste). If Agni is Mandagni, Ama (toxic endotoxins) is formed.",
      clinicalSignificance: "Gastric ulceration, GERD, hepatic cirrhosis, and malabsorption syndromes."
    },
    centroid: [0.04, 0.42, 0.07],
    explodeVec: [0.35, -0.15, 0.42],
    cameraZ: 2.2
  },
  respiratory: {
    id: "respiratory",
    name: "05. Respiratory System",
    code: "05_RESPIRATORY",
    sanskritName: "Pranavaha Samsthana (प्राणवह संस्थान)",
    srotas: "Pranavaha Srotas",
    dhatu: "Rasa & Rakta Oxygenation",
    dosha: "Prana Vayu & Udana Vayu",
    colorHex: "#4FC3F7",
    gltfPath: "/models/anatomy/05_respiratory.glb",
    cdnUrl: "https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/lung.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/yihalem123/Human-Organ3D@main/models/lung.glb",
      "/models/anatomy/05_respiratory.glb"
    ],
    targetCenter: [0, 0.86, 0.05],
    targetHeight: 0.38,
    description:
      "Larynx with thyroid/cricoid cartilages, trachea with C-rings, bronchial branching tree, and bilateral compliant lungs with 300+ million alveoli for gas diffusion.",
    chemicalEquation: "Alveoli: pO₂ 104 mmHg ➔ Capillary: pO₂ 40 mmHg (Fick's Diffusion Law)",
    biochemicalProcess:
      "Negative intrathoracic pressure ventilation drawing ambient air across 0.5-micron alveolar-capillary membranes; pulmonary surfactant reduces surface tension.",
    macroMicroData: {
      cellType: "Type I & Type II Pneumocytes, Alveolar Macrophages",
      keyEnzyme: "Pulmonary Surfactant Proteins (SP-A, B, C, D), ACE",
      organelles: "Lamellar Bodies, Elastic Parenchyma, Alveolar Capillary Bed",
      ayurvedicMechanism:
        "Phupphusa circulates Prana Vayu from external cosmos into internal cosmos, sustaining consciousness and Ayu.",
      clinicalSignificance: "Asthma (Tamak Shwasa), COPD, pneumonia, and acute respiratory distress."
    },
    centroid: [0.12, 0.86, 0.05],
    explodeVec: [0.45, 0.12, 0.25],
    cameraZ: 2.3
  },
  integumentary: {
    id: "integumentary",
    name: "06. Integumentary System",
    code: "06_INTEGUMENTARY",
    sanskritName: "Twacha (त्वचा - सप्त स्तर)",
    srotas: "Swedavaha & Rasavaha Srotas",
    dhatu: "Rasa Dhatu Upadhatu (Skin)",
    dosha: "Bhrajaka Pitta & Vyana Vayu",
    colorHex: "#E2C3A8",
    gltfPath: "/models/anatomy/06_integumentary.glb",
    cdnUrl: "https://raw.githubusercontent.com/sesgigikimo/gym-muscle/main/fullbody.glb",
    cdnFallbacks: [
      "/models/human_body.glb",
      "/models/anatomy/06_integumentary.glb"
    ],
    targetCenter: [0, 0.05, 0],
    targetHeight: 3.6,
    description:
      "Smooth, realistic translucent human body skin mesh with UV coordinates, natural body topology, and sub-surface scattering depth.",
    chemicalEquation: "7-Dehydrocholesterol + UV-B (297nm) ➔ Pre-Vitamin D₃ ➔ Cholecalciferol",
    biochemicalProcess:
      "Keratinocyte differentiation and melanocyte melanin synthesis absorbing UV radiation while eccrine sweat glands excrete urea and thermoregulate.",
    macroMicroData: {
      cellType: "Keratinocytes, Melanocytes, Langerhans Cells, Merkel Cells",
      keyEnzyme: "Tyrosinase, Transglutaminase-1, 1α-Hydroxylase",
      organelles: "Melanosomes, Desmosomes, Sebaceous Glands, Keratohyalin Granules",
      ayurvedicMechanism:
        "Seven skin layers described by Acharya Sushruta (Avabhasini to Mamsadhara); Bhrajaka Pitta confers luster, complexion, and warmth.",
      clinicalSignificance: "Psoriasis (Kitibha), dermatitis, thermal burns, and barrier dysfunction."
    },
    centroid: [0, 0.55, 0.12],
    explodeVec: [0, 0, 0.55],
    cameraZ: 3.1
  },
  lymphatic: {
    id: "lymphatic",
    name: "07. Lymphatic System",
    code: "07_LYMPHATIC",
    sanskritName: "Lasika & Rasavaha (लसीका संस्थान)",
    srotas: "Rasavaha & Udakavaha Srotas",
    dhatu: "Rasa Dhatu & Ojas (Immune Essence)",
    dosha: "Avalambaka Kapha & Vyana Vayu",
    colorHex: "#66BB6A",
    gltfPath: "/models/anatomy/07_lymphatic.glb",
    cdnUrl: "/models/anatomy/07_lymphatic.glb",
    cdnFallbacks: ["/models/anatomy/07_lymphatic.glb"],
    targetCenter: [-0.18, 0.58, 0.06],
    targetHeight: 0.45,
    description:
      "Reticuloendothelial network: spleen in left hypochondrium, bilobed thymus, cervical/axillary/inguinal lymph nodes, and ascending thoracic duct.",
    chemicalEquation: "Antigen + APC ➔ MHC-II:TCR Complex ➔ Interleukin-2 Activation",
    biochemicalProcess:
      "Interstitial fluid filtration and lymphocyte antibody clonal selection neutralizing circulating pathogens before draining clean lymph into the venous system.",
    macroMicroData: {
      cellType: "T-Lymphocytes, B-Lymphocytes, Natural Killer Cells, Dendritic Cells",
      keyEnzyme: "Perforin, Granzyme B, Lysozyme, Complement C3 Convertase",
      organelles: "Germinal Centers, Lymphoid Follicles, High Endothelial Venules",
      ayurvedicMechanism:
        "Lasika lubricates tissues; Bala and Vyadhikshamatwa depend on the purity of Rasa Dhatu and superior Ojas.",
      clinicalSignificance: "Lymphedema, lymphadenopathy, lymphoma, and autoimmune disorders."
    },
    centroid: [-0.18, 0.58, 0.06],
    explodeVec: [-0.42, 0.08, 0.35],
    cameraZ: 2.3
  },
  endocrine: {
    id: "endocrine",
    name: "08. Endocrine System",
    code: "08_ENDOCRINE",
    sanskritName: "Antahsravi Granthi (अन्तःस्रावी ग्रन्थि)",
    srotas: "Manovaha & Shukravaha Srotas",
    dhatu: "Ojas & Sukshma Dhatu Poshana",
    dosha: "Sadhaka Pitta & Prana Vayu",
    colorHex: "#FFCA28",
    gltfPath: "/models/anatomy/08_endocrine.glb",
    cdnUrl: "/models/anatomy/08_endocrine.glb",
    cdnFallbacks: ["/models/anatomy/08_endocrine.glb"],
    targetCenter: [0, 1.35, 0.04],
    targetHeight: 0.65,
    description:
      "Ductless glandular axis: sella turcica pituitary master gland, butterfly thyroid with 4 parathyroids, suprarenal adrenal glands, and pancreatic islet beta cells.",
    chemicalEquation: "Hormone + GPCR ➔ Adenylate Cyclase ➔ ATP ➔ cAMP (Second Messenger)",
    biochemicalProcess:
      "Endocrine hormone feedback loops: Hypothalamic-Pituitary-Adrenal (HPA) axis regulation and insulin-glucagon glucose counter-regulation.",
    macroMicroData: {
      cellType: "Pituitary Somatotropes, Thyroid Follicular Cells, Adrenal Chromaffin Cells",
      keyEnzyme: "Thyroid Peroxidase (TPO), Tyrosine Hydroxylase, Protein Kinase A",
      organelles: "Secretory Granules, Colloid Follicles, Dense Endoplasmic Reticulum",
      ayurvedicMechanism:
        "Granthi hormones represent Dhatvagni-regulating chemical messengers sustaining Dhatu-Paka and metabolic homeostasis.",
      clinicalSignificance: "Diabetes mellitus, hyper/hypothyroidism, adrenal fatigue, and pituitary adenomas."
    },
    centroid: [0, 1.35, 0.04],
    explodeVec: [0, 0.28, 0.32],
    cameraZ: 2.2
  },
  urinary: {
    id: "urinary",
    name: "09. Urinary System",
    code: "09_URINARY",
    sanskritName: "Mutravaha Samsthana (मूत्रवह संस्थान)",
    srotas: "Mutravaha Srotas",
    dhatu: "Meda & Kitta Mala (Liquid Waste)",
    dosha: "Apana Vayu & Kledaka Kapha",
    colorHex: "#AB47BC",
    gltfPath: "/models/anatomy/09_urinary.glb",
    cdnUrl: "https://raw.githubusercontent.com/yihalem123/Human-Organ3D/main/models/kidney.glb",
    cdnFallbacks: [
      "https://cdn.jsdelivr.net/gh/yihalem123/Human-Organ3D@main/models/kidney.glb",
      "/models/anatomy/09_urinary.glb"
    ],
    targetCenter: [0, 0.38, -0.06],
    targetHeight: 0.26,
    description:
      "Bilateral retroperitoneal kidneys with renal cortex and medullary pyramids, descending peristaltic ureters, and urinary bladder reservoir.",
    chemicalEquation: "Glomerular Filtration: GFR = Kf × [(P_GC - P_BS) - (π_GC - π_BS)] ➔ 125 mL/min",
    biochemicalProcess:
      "Nephron ultrafiltration and countercurrent multiplier in the Loop of Henle reabsorbing 99% of filtered water, sodium, and glucose.",
    macroMicroData: {
      cellType: "Podocytes, Proximal Tubule Brush Border Cells, Mesangial Cells",
      keyEnzyme: "Renin, Na⁺/K⁺-ATPase, Aquaporin-2 Water Channels",
      organelles: "Glomerular Basement Membrane, Juxtaglomerular Apparatus",
      ayurvedicMechanism:
        "Vrikka form Mutra from the Kledaka moisture of Ahara; Apana Vayu drives regular, non-suppressible excretion.",
      clinicalSignificance: "Chronic kidney disease, nephrolithiasis (Ashmari), and acute tubular necrosis."
    },
    centroid: [0.08, 0.38, -0.06],
    explodeVec: [0.38, -0.12, -0.3],
    cameraZ: 2.2
  },
  reproductive: {
    id: "reproductive",
    name: "10. Reproductive System",
    code: "10_REPRODUCTIVE",
    sanskritName: "Shukravaha Samsthana (शुक्रवह संस्थान)",
    srotas: "Shukravaha & Artavavaha Srotas",
    dhatu: "Shukra & Artava Dhatu (Quintessence)",
    dosha: "Apana Vayu & Saumya Kapha",
    colorHex: "#EC407A",
    gltfPath: "/models/anatomy/10_reproductive.glb",
    cdnUrl: "/models/anatomy/10_reproductive.glb",
    cdnFallbacks: ["/models/anatomy/10_reproductive.glb"],
    targetCenter: [0, -0.08, 0.04],
    targetHeight: 0.28,
    description:
      "Complete dual-sex reproductive anatomy: Female pelvic framework featuring the uterus (fundus, body, endometrial cavity), cervix, fallopian tubes with fimbriae, bilateral ovaries, vaginal canal, and mammary glands; Male pelvic framework featuring testes, epididymis, vas deferens, prostate gland, seminal vesicles, and bulbourethral glands.",
    chemicalEquation: "Cholesterol ➔ Pregnenolone ➔ Testosterone / Estradiol-17β",
    biochemicalProcess:
      "Pulsatile GnRH-stimulated FSH and LH signaling orchestrating gametogenesis, steroidogenesis, and cyclical vascular remodeling.",
    macroMicroData: {
      cellType: "Sertoli Cells, Leydig Cells, Granulosa Cells, Gametes",
      keyEnzyme: "Aromatase (CYP19A1), 5α-Reductase, Hyaluronidase",
      organelles: "Acrosome, Zona Pellucida, Abundant Mitochondria",
      ayurvedicMechanism:
        "Shukra permeates the entire body like ghee in milk; it is the source of pure physical strength, courage, and luminous Ojas.",
      clinicalSignificance: "Infertility (Klaibya/Vandhyatva), hormonal imbalance, and gonadal dysfunction."
    },
    centroid: [0, -0.08, 0.04],
    explodeVec: [0, -0.32, 0.3],
    cameraZ: 2.2
  },
  muscular: {
    id: "muscular",
    name: "11. Muscular System",
    code: "11_MUSCULAR",
    sanskritName: "Mamsa Samsthana (मांस संस्थान)",
    srotas: "Mamsavaha Srotas",
    dhatu: "Mamsa Dhatu (Contractile Muscle)",
    dosha: "Vyana Vayu & Kapha Dhatu",
    colorHex: "#D32F2F",
    gltfPath: "/models/anatomy/11_muscular.glb",
    cdnUrl: "https://raw.githubusercontent.com/sesgigikimo/gym-muscle/main/fullbody.glb",
    cdnFallbacks: ["/models/anatomy/11_muscular.glb"],
    targetCenter: [0, 0, 0],
    targetHeight: 3.3,
    description:
      "Full body striated muscular anatomy: pectoralis major, deltoids, biceps, rectus abdominis with 6-pack tendinous intersections, obliques, and quadriceps.",
    chemicalEquation: "Actin + Myosin·ADP·Pi ➔ Power Stroke + ADP + Pi (ATP Hydrolysis)",
    biochemicalProcess:
      "Sliding filament cross-bridge cycling: Ca²⁺ binds Troponin C, shifting Tropomyosin to expose actin active sites for myosin head power strokes.",
    macroMicroData: {
      cellType: "Multinucleated Myocytes, Satellite Stem Cells",
      keyEnzyme: "Myosin Heavy Chain ATPase, Creatine Kinase, Myoglobin",
      organelles: "Sarcomeres (Z-line to Z-line), T-Tubules, Sarcoplasmic Reticulum",
      ayurvedicMechanism:
        "Mamsa Lepana (enveloping and protecting bones/organs) and providing somatic locomotion and physical prowess (Utsaha).",
      clinicalSignificance: "Myopathy, muscular dystrophy, muscle cramps, and sarcopenia."
    },
    centroid: [0, 0.48, 0.08],
    explodeVec: [0, 0, 0.38],
    cameraZ: 2.7
  }
};
