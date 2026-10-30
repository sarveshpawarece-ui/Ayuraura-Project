import * as THREE from "three";

export type StructureClass = "bone" | "cartilage" | "ligament" | "tendon" | "joint";

export interface StructureMeta {
  id: string;
  name: string;
  category: StructureClass;
  categoryTitle: string;
  sanskritName: string;
  ayurvedicClassification: string;
  dosha: string;
  dhatu: string;
  colorHex: string;
  biochemicalRole: string;
  molecularComposition: string;
  biomechanics: string;
  clinicalSignificance: string;
  coordinates?: [number, number, number];
}

export const STRUCTURE_CLASS_CONFIG: Record<
  StructureClass,
  {
    name: string;
    title: string;
    sanskritName: string;
    colorHex: string;
    badgeBg: string;
    badgeText: string;
    description: string;
    roughness: number;
    metalness: number;
    opacity: number;
    transparent: boolean;
    transmission?: number;
  }
> = {
  bone: {
    name: "Cortical Bone",
    title: "Bones",
    sanskritName: "Asthi Dhatu (अस्थि धातु)",
    colorHex: "#EAE3D2",
    badgeBg: "bg-[#EAE3D2]/30",
    badgeText: "text-[#62573d] dark:text-[#EAE3D2]",
    description: "Dense cortical hydroxyapatite matrix providing structural framework, mineral depot, and somatic locomotion leverage.",
    roughness: 0.55,
    metalness: 0.05,
    opacity: 1.0,
    transparent: false,
  },
  cartilage: {
    name: "Articular Cartilage",
    title: "Articular Cartilage",
    sanskritName: "Sandhanaka Asthi / Tarunasthi (सन्धानक अस्थि / तरुणाम्नाय)",
    colorHex: "#38BDF8",
    badgeBg: "bg-sky-500/20",
    badgeText: "text-sky-700 dark:text-sky-300",
    description: "Avascular, aneural hyaline and fibrocartilage capping articulating bones and forming shock-absorbing intervertebral discs.",
    roughness: 0.2,
    metalness: 0.02,
    opacity: 0.85,
    transparent: true,
    transmission: 0.6,
  },
  ligament: {
    name: "Ligament (Stabilizing Band)",
    title: "Ligaments",
    sanskritName: "Snayu (स्नायु - Pratanavati & Vritta)",
    colorHex: "#F59E0B",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    description: "Dense fibrous connective bands linking bone to bone, restraining abnormal joint motion and preventing dislocation.",
    roughness: 0.4,
    metalness: 0.05,
    opacity: 1.0,
    transparent: false,
  },
  tendon: {
    name: "Tendon (Force Transmitter)",
    title: "Tendons",
    sanskritName: "Kandara (कण्डरा - Maha Snayu)",
    colorHex: "#10B981",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    description: "High-tensile parallel collagen fascicles transmitting muscular contractions to periosteal skeletal insertions.",
    roughness: 0.35,
    metalness: 0.05,
    opacity: 1.0,
    transparent: false,
  },
  joint: {
    name: "Joint Cavity & Synovial Capsule",
    title: "Joint Cavities & Capsules",
    sanskritName: "Sandhi & Sleshaka Kapha (सन्धि व श्लेषक कफ)",
    colorHex: "#EC4899",
    badgeBg: "bg-pink-500/20",
    badgeText: "text-pink-700 dark:text-pink-300",
    description: "Fibrous envelope lined with vascular synovial intima, enclosing synovial fluid (Sleshaka Kapha) for near-frictionless gliding.",
    roughness: 0.1,
    metalness: 0.05,
    opacity: 0.6,
    transparent: true,
  },
};

/**
 * Creates standardized PBR materials for the 5 anatomical classes
 */
export function createAnatomicalMaterials(clipPlane?: THREE.Plane) {
  const clippingPlanes = clipPlane ? [clipPlane] : [];

  const boneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#EAE3D2"),
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
  });

  const cartilageMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#38BDF8"),
    roughness: 0.2,
    metalness: 0.02,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
  });

  const ligamentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#F59E0B"),
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
  });

  const tendonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#10B981"),
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
  });

  const jointMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#EC4899"),
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    side: THREE.DoubleSide,
    clippingPlanes,
    clipShadows: true,
  });

  return {
    bone: boneMat,
    cartilage: cartilageMat,
    ligament: ligamentMat,
    tendon: tendonMat,
    joint: jointMat,
  };
}

/**
 * Helper to create a curved ribbon / tube mesh along control points
 */
function createCurvedBand(
  points: THREE.Vector3[],
  radius: number,
  radialSegments = 10,
  tubularSegments = 24
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
}

export const HIGHLIGHT_CATEGORY_CONFIG: Record<
  StructureClass,
  {
    highlightColor: string;
    emissiveColor: string;
    emissiveIntensity: number;
    title: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  bone: {
    highlightColor: "#F59E0B", // Electric Gold
    emissiveColor: "#F59E0B",
    emissiveIntensity: 0.5,
    title: "Bone",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  cartilage: {
    highlightColor: "#06B6D4", // Cyan-Blue
    emissiveColor: "#06B6D4",
    emissiveIntensity: 0.5,
    title: "Cartilage",
    badgeBg: "bg-cyan-500/20",
    badgeText: "text-cyan-700 dark:text-cyan-300",
  },
  ligament: {
    highlightColor: "#10B981", // Emerald Green
    emissiveColor: "#10B981",
    emissiveIntensity: 0.5,
    title: "Ligament",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
  tendon: {
    highlightColor: "#F97316", // Bright Orange
    emissiveColor: "#F97316",
    emissiveIntensity: 0.5,
    title: "Tendon",
    badgeBg: "bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
  },
  joint: {
    highlightColor: "#EC4899", // Magenta-Pink
    emissiveColor: "#EC4899",
    emissiveIntensity: 0.5,
    title: "Joint Capsule",
    badgeBg: "bg-pink-500/20",
    badgeText: "text-pink-700 dark:text-pink-300",
  },
};

/**
 * Helper to tag any mesh with its complete anatomical and Ayurvedic metadata
 */
export function tagStructureMesh(
  mesh: THREE.Mesh,
  meta: Omit<StructureMeta, "categoryTitle" | "colorHex">
) {
  const cfg = STRUCTURE_CLASS_CONFIG[meta.category];
  mesh.name = meta.id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Clone material so each mesh can be highlighted or dimmed independently
  if (mesh.material) {
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();
  }

  const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
    | THREE.MeshStandardMaterial
    | undefined;
  const origColor = mat && mat.color ? mat.color.clone() : new THREE.Color(cfg.colorHex);
  const origEmissive = mat && mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000);
  const origEmissiveIntensity = mat && mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0;
  const origOpacity = mat && mat.opacity !== undefined ? mat.opacity : cfg.opacity;
  const origTransparent = mat && mat.transparent !== undefined ? mat.transparent : cfg.transparent;

  mesh.userData = {
    ...mesh.userData,
    isAnatomicalStructure: true,
    structureId: meta.id,
    structureName: meta.name,
    structureType: meta.category,
    categoryTitle: cfg.title,
    sanskritName: meta.sanskritName,
    ayurvedicClassification: meta.ayurvedicClassification,
    dosha: meta.dosha,
    dhatu: meta.dhatu,
    colorHex: cfg.colorHex,
    biochemicalRole: meta.biochemicalRole,
    molecularComposition: meta.molecularComposition,
    biomechanics: meta.biomechanics,
    clinicalSignificance: meta.clinicalSignificance,
    originalColor: origColor,
    originalEmissive: origEmissive,
    originalEmissiveIntensity: origEmissiveIntensity,
    originalOpacity: origOpacity,
    originalTransparent: origTransparent,
  };
}

/**
 * Builds the complete 3D connective tissue anatomical subsystem
 * (Articular Cartilage, Ligaments, Tendons, Joint Capsules)
 * perfectly positioned and scaled for the 1.70m human skeleton.
 */
export function buildConnectiveTissueSubsystem(clipPlane?: THREE.Plane): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = "Connective_Tissue_System";

  const mats = createAnatomicalMaterials(clipPlane);

  // ==========================================================================
  // 1. KNEE JOINTS (BILATERAL LEFT & RIGHT) - HIGH DETAILED DISSECTION ANATOMY
  // ==========================================================================
  const sides: Array<{ sideName: "Right" | "Left"; xSign: number }> = [
    { sideName: "Left", xSign: 1 },
    { sideName: "Right", xSign: -1 },
  ];

  sides.forEach(({ sideName, xSign }) => {
    const kneeCenterX = xSign * 0.105;
    const kneeJointY = 0.485;

    // --- A. ARTICULAR CARTILAGES (Cyan #38BDF8) ---
    // 1. Femoral Condyle Articular Cartilage (Medial & Lateral Capping Layers)
    const femMedialCartGeom = new THREE.SphereGeometry(0.016, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    femMedialCartGeom.scale(1.1, 0.5, 1.4);
    const femMedialCartMesh = new THREE.Mesh(femMedialCartGeom, mats.cartilage);
    femMedialCartMesh.position.set(kneeCenterX - xSign * 0.014, kneeJointY + 0.012, 0.002);
    tagStructureMesh(femMedialCartMesh, {
      id: `knee_femoral_medial_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Medial Femoral Condyle Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Tarunasthi (तरुणाम्नाय - जानु सन्धि)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Tarpaka Kapha & Vata",
      dhatu: "Asthi & Majja Dhatu",
      biochemicalRole: "Type II Collagen & Aggrecan proteoglycan matrix holding hydrated water for hydrostatic shock dissipation.",
      molecularComposition: "Collagen Type II (80%), Aggrecan (15%), Chondroitin-4/6-Sulfate, Hyaluronan core.",
      biomechanics: "Reduces peak articular contact stress from 8-10 MPa to <3 MPa across dynamic stance phase.",
      clinicalSignificance: "Osteoarthritis chondropathy, joint space narrowing, and cartilage fibrillations.",
    });
    rootGroup.add(femMedialCartMesh);

    const femLateralCartGeom = new THREE.SphereGeometry(0.015, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    femLateralCartGeom.scale(1.1, 0.5, 1.3);
    const femLateralCartMesh = new THREE.Mesh(femLateralCartGeom, mats.cartilage);
    femLateralCartMesh.position.set(kneeCenterX + xSign * 0.016, kneeJointY + 0.012, 0.002);
    tagStructureMesh(femLateralCartMesh, {
      id: `knee_femoral_lateral_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Lateral Femoral Condyle Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Tarunasthi (तरुणाम्नाय - जानु सन्धि)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Tarpaka Kapha",
      dhatu: "Asthi Dhatu",
      biochemicalRole: "Superficial tangential collagen zone gliding against lateral meniscus and tibial plateau.",
      molecularComposition: "Type II Collagen fibrils aligned parallel to articulating surface.",
      biomechanics: "Viscoelastic fluid exudation and imbibition during cyclical axial loading.",
      clinicalSignificance: "Lateral compartment gonarthrosis and chondromalacia patellae.",
    });
    rootGroup.add(femLateralCartMesh);

    // 2. Tibial Plateau Articular Cartilage
    const tibCartGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.0035, 20);
    const tibCartMesh = new THREE.Mesh(tibCartGeom, mats.cartilage);
    tibCartMesh.position.set(kneeCenterX, kneeJointY - 0.004, 0.001);
    tagStructureMesh(tibCartMesh, {
      id: `knee_tibial_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Tibial Plateau Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Sandhanaka Asthi (सन्धानक जान्वस्थि)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Sleshaka Kapha",
      dhatu: "Asthi & Majja Dhatu",
      biochemicalRole: "Biphasic solid-fluid matrix providing near-frictionless articular counter-face.",
      molecularComposition: "Proteoglycans (decorin, biglycan) bound to Type II collagen network.",
      biomechanics: "Dynamic contact stress dampening during bipedal heel strike and gait propulsion.",
      clinicalSignificance: "Tibial plateau subchondral sclerosis and osteophyte spurs.",
    });
    rootGroup.add(tibCartMesh);

    // 3. Retropatellar Articular Cartilage
    const patCartGeom = new THREE.BoxGeometry(0.022, 0.024, 0.004);
    const patCartMesh = new THREE.Mesh(patCartGeom, mats.cartilage);
    patCartMesh.position.set(kneeCenterX, kneeJointY + 0.022, 0.046);
    tagStructureMesh(patCartMesh, {
      id: `knee_patellar_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Retropatellar Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Janu Kapalika Tarunasthi (जानु कपालिका तरुणाम्नाय)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Sleshaka Kapha & Vyana Vayu",
      dhatu: "Asthi Dhatu",
      biochemicalRole: "Thickest articular cartilage in human body (~5-6mm), resisting intense patellofemoral compressive force.",
      molecularComposition: "Extracellular matrix optimized for high compressive osmotic swelling pressure.",
      biomechanics: "Transfers quadriceps muscle vector across patellofemoral groove with low friction.",
      clinicalSignificance: "Chondromalacia Patellae (Runner's Knee), anterior knee crepitus.",
    });
    rootGroup.add(patCartMesh);

    // --- B. LIGAMENTS (Amber #F59E0B) ---
    // 1. Anterior Cruciate Ligament (ACL)
    const aclPoints = [
      new THREE.Vector3(kneeCenterX + xSign * 0.009, kneeJointY + 0.015, -0.006),
      new THREE.Vector3(kneeCenterX + xSign * 0.002, kneeJointY + 0.006, 0.001),
      new THREE.Vector3(kneeCenterX - xSign * 0.005, kneeJointY - 0.004, 0.008),
    ];
    const aclGeom = createCurvedBand(aclPoints, 0.0038, 8, 16);
    const aclMesh = new THREE.Mesh(aclGeom, mats.ligament);
    tagStructureMesh(aclMesh, {
      id: `knee_acl_${sideName.toLowerCase()}`,
      name: `${sideName} Anterior Cruciate Ligament (ACL)`,
      category: "ligament",
      sanskritName: "Purva Tiryak Snayu (पूर्व तिर्यक् स्नायु)",
      ayurvedicClassification: "Vritta Snayu (वृत्त स्नायु - Round Ligament)",
      dosha: "Vata (Vyana Vayu)",
      dhatu: "Snayu / Mamsa Upadhatu",
      biochemicalRole: "Hierarchical bundles of Type I Collagen resisting anterior tibial translation and rotational pivot strain.",
      molecularComposition: "Type I Collagen (88%), Type III Collagen (8%), Elastin (<2%), Decorin, Biglycan.",
      biomechanics: "Primary restraint against anterior tibial translation (85% of total restraint force) and internal tibial rotation.",
      clinicalSignificance: "ACL rupture, Lachman test positive, pivot-shift instability, reconstructive graft necessity.",
    });
    rootGroup.add(aclMesh);

    // 2. Posterior Cruciate Ligament (PCL)
    const pclPoints = [
      new THREE.Vector3(kneeCenterX - xSign * 0.008, kneeJointY + 0.016, 0.004),
      new THREE.Vector3(kneeCenterX, kneeJointY + 0.006, -0.002),
      new THREE.Vector3(kneeCenterX + xSign * 0.003, kneeJointY - 0.005, -0.010),
    ];
    const pclGeom = createCurvedBand(pclPoints, 0.0042, 8, 16);
    const pclMesh = new THREE.Mesh(pclGeom, mats.ligament);
    tagStructureMesh(pclMesh, {
      id: `knee_pcl_${sideName.toLowerCase()}`,
      name: `${sideName} Posterior Cruciate Ligament (PCL)`,
      category: "ligament",
      sanskritName: "Pashchima Tiryak Snayu (पश्चिम तिर्यक् स्नायु)",
      ayurvedicClassification: "Vritta Snayu (वृत्त स्नायु)",
      dosha: "Vata Dosha",
      dhatu: "Snayu Upadhatu",
      biochemicalRole: "Dense Type I collagen fascicles resisting posterior displacement of tibia on femur.",
      molecularComposition: "Type I Collagen aligned in anterolateral and posteromedial functional bundles.",
      biomechanics: "Primary restraint against posterior tibial displacement (95% restraint), strongest knee ligament.",
      clinicalSignificance: "Dashboard injury, posterior sag sign, knee hyperextension sprains.",
    });
    rootGroup.add(pclMesh);

    // 3. Medial Collateral Ligament (MCL)
    const mclPoints = [
      new THREE.Vector3(kneeCenterX - xSign * 0.024, kneeJointY + 0.034, 0.002),
      new THREE.Vector3(kneeCenterX - xSign * 0.024, kneeJointY, 0.003),
      new THREE.Vector3(kneeCenterX - xSign * 0.022, kneeJointY - 0.038, 0.002),
    ];
    const mclGeom = createCurvedBand(mclPoints, 0.0032, 8, 16);
    const mclMesh = new THREE.Mesh(mclGeom, mats.ligament);
    tagStructureMesh(mclMesh, {
      id: `knee_mcl_${sideName.toLowerCase()}`,
      name: `${sideName} Medial Collateral Ligament (MCL)`,
      category: "ligament",
      sanskritName: "Madhyama Parshva Snayu (मध्यम पार्श्व स्नायु)",
      ayurvedicClassification: "Pratanavati Snayu (प्रतानवती स्नायु - Flat/Branching Ligament)",
      dosha: "Vata & Kapha",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Broad, flat fibrous band of parallel collagen fibrils restraining valgus stress and external rotation.",
      molecularComposition: "Dense parallel Type I Collagen fibers with abundant fibroblast tenocytes.",
      biomechanics: "Resists valgus knee abduction forces (78% of valgus restraint at 25° flexion).",
      clinicalSignificance: "Valgus stress sprain, medial knee joint opening, unhappy triad injury.",
    });
    rootGroup.add(mclMesh);

    // 4. Lateral Collateral Ligament (LCL / Fibular Collateral)
    const lclPoints = [
      new THREE.Vector3(kneeCenterX + xSign * 0.025, kneeJointY + 0.028, 0.0),
      new THREE.Vector3(kneeCenterX + xSign * 0.027, kneeJointY, -0.002),
      new THREE.Vector3(kneeCenterX + xSign * 0.028, kneeJointY - 0.036, -0.008),
    ];
    const lclGeom = createCurvedBand(lclPoints, 0.0028, 8, 16);
    const lclMesh = new THREE.Mesh(lclGeom, mats.ligament);
    tagStructureMesh(lclMesh, {
      id: `knee_lcl_${sideName.toLowerCase()}`,
      name: `${sideName} Lateral Collateral Ligament (LCL)`,
      category: "ligament",
      sanskritName: "Bahya Parshva Snayu (बाह्य पार्श्व स्नायु)",
      ayurvedicClassification: "Vritta Snayu (वृत्त स्नायु - Cord-Like Ligament)",
      dosha: "Vata Dosha",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Cord-like extracapsular ligament stabilizing against varus adduction stress.",
      molecularComposition: "Type I Collagen tightly packed in cylindrical cord architecture.",
      biomechanics: "Primary restraint against varus angulation (55% restraint at 5° flexion, 69% at 25°).",
      clinicalSignificance: "Varus stress tears, posterolateral corner (PLC) instability.",
    });
    rootGroup.add(lclMesh);

    // --- C. TENDONS (Emerald #10B981) ---
    // 1. Quadriceps Femoris Tendon
    const quadTendonPoints = [
      new THREE.Vector3(kneeCenterX, kneeJointY + 0.082, 0.042),
      new THREE.Vector3(kneeCenterX, kneeJointY + 0.052, 0.046),
      new THREE.Vector3(kneeCenterX, kneeJointY + 0.034, 0.047),
    ];
    const quadTendonGeom = createCurvedBand(quadTendonPoints, 0.0062, 8, 16);
    const quadTendonMesh = new THREE.Mesh(quadTendonGeom, mats.tendon);
    tagStructureMesh(quadTendonMesh, {
      id: `knee_quadriceps_tendon_${sideName.toLowerCase()}`,
      name: `${sideName} Quadriceps Femoris Tendon`,
      category: "tendon",
      sanskritName: "Maha Kandara (महा कण्डरा - ऊरु सन्धि)",
      ayurvedicClassification: "Kandara (कण्डरा - Large Heavy Tendon)",
      dosha: "Vyana Vayu (Kaphadhara Kala)",
      dhatu: "Mamsa & Snayu Upadhatu",
      biochemicalRole: "Convergent fibrous tendon from 4 quadriceps muscle heads inserting into superior base of patella.",
      molecularComposition: "Highly aligned Type I Collagen fascicles encased in loose vascular paratenon.",
      biomechanics: "Transmits peak quadriceps contractile tensile forces exceeding 5,000 N during jumping/deceleration.",
      clinicalSignificance: "Quadriceps tendon rupture, enthesopathy, extensor mechanism disruption.",
    });
    rootGroup.add(quadTendonMesh);

    // 2. Patellar Tendon (Ligamentum Patellae)
    const patTendonPoints = [
      new THREE.Vector3(kneeCenterX, kneeJointY + 0.012, 0.046),
      new THREE.Vector3(kneeCenterX, kneeJointY - 0.018, 0.042),
      new THREE.Vector3(kneeCenterX, kneeJointY - 0.038, 0.034),
    ];
    const patTendonGeom = createCurvedBand(patTendonPoints, 0.0055, 8, 16);
    const patTendonMesh = new THREE.Mesh(patTendonGeom, mats.tendon);
    tagStructureMesh(patTendonMesh, {
      id: `knee_patellar_tendon_${sideName.toLowerCase()}`,
      name: `${sideName} Patellar Tendon (Ligamentum Patellae)`,
      category: "tendon",
      sanskritName: "Janu Kandara (जानु कण्डरा)",
      ayurvedicClassification: "Kandara / Maha Snayu (कण्डरा / महा स्नायु)",
      dosha: "Vata & Pitta",
      dhatu: "Mamsa Upadhatu",
      biochemicalRole: "Strong, flat fibrous band continuing the quadriceps tendon from patellar apex down to tibial tuberosity.",
      molecularComposition: "Type I Collagen (90%), Tenascin-C, Proteoglycans at bony insertion fibrocartilage enthesis.",
      biomechanics: "Mechanical lever arm amplifying knee extension torque generated by the extensor apparatus.",
      clinicalSignificance: "Patellar tendinopathy (Jumper's Knee), Osgood-Schlatter disease at tibial tuberosity.",
    });
    rootGroup.add(patTendonMesh);

    // --- D. JOINT CAVITY & SYNOVIAL CAPSULES (Vibrant Pink #EC4899) ---
    // 1. Knee Synovial Capsule (Articular Envelope)
    const synCapsuleGeom = new THREE.CylinderGeometry(0.026, 0.028, 0.045, 20, 1, true);
    const synCapsuleMesh = new THREE.Mesh(synCapsuleGeom, mats.joint);
    synCapsuleMesh.position.set(kneeCenterX, kneeJointY + 0.006, 0.006);
    tagStructureMesh(synCapsuleMesh, {
      id: `knee_synovial_capsule_${sideName.toLowerCase()}`,
      name: `${sideName} Knee Joint Synovial Capsule`,
      category: "joint",
      sanskritName: "Sandhi Kosha & Sleshaka Kapha (सन्धि कोष व श्लेषक कफ)",
      ayurvedicClassification: "Sandhi Kosha (सन्धि कोष)",
      dosha: "Sleshaka Kapha (श्लेषक कफ)",
      dhatu: "Sandhi / Majja",
      biochemicalRole: "Seals the joint cavity and produces synovial fluid rich in Hyaluronan and Lubricin for hydrodynamic lubrication.",
      molecularComposition: "Synovial Intima (Type A macrophage-like & Type B fibroblast-like synoviocytes) + Hyaluronic Acid.",
      biomechanics: "Maintains negative intra-articular hydrostatic pressure and provides boundary lubrication ($\mu < 0.002$).",
      clinicalSignificance: "Knee joint effusion (Janu Shotha / Sandhigata Vata), Baker's cyst, synovitis.",
    });
    rootGroup.add(synCapsuleMesh);

    // 2. Medial & Lateral Menisci (Fibrocartilaginous Shock Absorbers)
    const medMeniscusGeom = new THREE.TorusGeometry(0.016, 0.0034, 8, 16, Math.PI * 1.3);
    const medMeniscusMesh = new THREE.Mesh(medMeniscusGeom, mats.joint);
    medMeniscusMesh.rotation.x = Math.PI / 2;
    medMeniscusMesh.position.set(kneeCenterX - xSign * 0.012, kneeJointY - 0.001, 0.002);
    tagStructureMesh(medMeniscusMesh, {
      id: `knee_medial_meniscus_${sideName.toLowerCase()}`,
      name: `${sideName} Medial Meniscus`,
      category: "joint",
      sanskritName: "Janu Sandhi Chakra (जानु सन्धि चक्र - श्लेषक चक्रिका)",
      ayurvedicClassification: "Sandhanaka Asthi & Sleshaka Kapha",
      dosha: "Sleshaka Kapha",
      dhatu: "Majja & Asthi Dhatu",
      biochemicalRole: "C-shaped fibrocartilaginous wedge increasing joint congruity and distributing 50-70% of medial axial loads.",
      molecularComposition: "Circumferential hoop-stress oriented Type I Collagen (90%) with glycosaminoglycans.",
      biomechanics: "Converts axial compressive forces into circumferential tensile hoop stress.",
      clinicalSignificance: "Bucket-handle tear, degenerative cleavage tear, joint locking.",
    });
    rootGroup.add(medMeniscusMesh);

    const latMeniscusGeom = new THREE.TorusGeometry(0.014, 0.0034, 8, 16, Math.PI * 1.6);
    const latMeniscusMesh = new THREE.Mesh(latMeniscusGeom, mats.joint);
    latMeniscusMesh.rotation.x = Math.PI / 2;
    latMeniscusMesh.position.set(kneeCenterX + xSign * 0.014, kneeJointY - 0.001, 0.002);
    tagStructureMesh(latMeniscusMesh, {
      id: `knee_lateral_meniscus_${sideName.toLowerCase()}`,
      name: `${sideName} Lateral Meniscus`,
      category: "joint",
      sanskritName: "Bahya Sandhi Chakra (बाह्य जानु सन्धि चक्र)",
      ayurvedicClassification: "Sandhanaka Asthi & Sleshaka Kapha",
      dosha: "Sleshaka Kapha",
      dhatu: "Majja Dhatu",
      biochemicalRole: "Nearly circular fibrocartilaginous ring bearing 70% of lateral compartment load with high mobility.",
      molecularComposition: "Type I Collagen bundled in dense radial and circumferential fibers.",
      biomechanics: "Prevents direct lateral femoral-tibial contact; glides 10-12mm during deep knee flexion.",
      clinicalSignificance: "Radial tears, discoid lateral meniscus, lateral compartment joint line pain.",
    });
    rootGroup.add(latMeniscusMesh);
  });

  // ==========================================================================
  // 2. HIP JOINTS (BILATERAL LEFT & RIGHT) - ACETABULOFEMORAL ARTICULATION
  // ==========================================================================
  sides.forEach(({ sideName, xSign }) => {
    const hipX = xSign * 0.145;
    const hipY = 0.85;
    const hipZ = 0.01;

    // 1. Femoral Head Articular Cartilage
    const hipCartGeom = new THREE.SphereGeometry(0.021, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hipCartMesh = new THREE.Mesh(hipCartGeom, mats.cartilage);
    hipCartMesh.position.set(hipX, hipY, hipZ);
    hipCartMesh.rotation.z = xSign * 0.4;
    tagStructureMesh(hipCartMesh, {
      id: `hip_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Femoral Head Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Tarunasthi (तरुणाम्नाय - ऊरु सन्धि)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Sleshaka Kapha",
      dhatu: "Asthi & Majja",
      biochemicalRole: "Uniform hyaline cartilage cap distributing high triaxial ground reaction forces across acetabular socket.",
      molecularComposition: "Collagen Type II cross-linked with chondroitin sulfate proteoglycans.",
      biomechanics: "Withstands peak hip contact forces of 300-400% body weight during normal walking.",
      clinicalSignificance: "Avascular necrosis (AVN) of femoral head, hip osteoarthritis (coxarthrosis).",
    });
    rootGroup.add(hipCartMesh);

    // 2. Iliofemoral Ligament (Y-Ligament of Bigelow - Strongest in human body)
    const ilioPoints = [
      new THREE.Vector3(hipX - xSign * 0.01, hipY + 0.045, hipZ + 0.025),
      new THREE.Vector3(hipX + xSign * 0.005, hipY + 0.015, hipZ + 0.028),
      new THREE.Vector3(hipX + xSign * 0.02, hipY - 0.025, hipZ + 0.024),
    ];
    const ilioGeom = createCurvedBand(ilioPoints, 0.0048, 8, 16);
    const ilioMesh = new THREE.Mesh(ilioGeom, mats.ligament);
    tagStructureMesh(ilioMesh, {
      id: `hip_iliofemoral_ligament_${sideName.toLowerCase()}`,
      name: `${sideName} Iliofemoral Ligament (Y-Ligament of Bigelow)`,
      category: "ligament",
      sanskritName: "Shroni-Uru Maha Snayu (श्रोणी-ऊरु महा स्नायु)",
      ayurvedicClassification: "Pratanavati Snayu (प्रतानवती स्नायु)",
      dosha: "Vata (Apana Vayu)",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Tensile strength exceeding 350 N, preventing hip hyperextension and maintaining upright human posture.",
      molecularComposition: "Densely packed parallel Type I Collagen fascicles with high tensile modulus.",
      biomechanics: "Permits static upright stance with minimal active muscular energy expenditure.",
      clinicalSignificance: "Hip impingement (FAI), capsular tightness, anterior hip instability.",
    });
    rootGroup.add(ilioMesh);

    // 3. Hip Synovial Joint Capsule & Acetabular Labrum
    const hipCapGeom = new THREE.SphereGeometry(0.025, 16, 12);
    hipCapGeom.scale(1.0, 1.1, 1.0);
    const hipCapMesh = new THREE.Mesh(hipCapGeom, mats.joint);
    hipCapMesh.position.set(hipX, hipY, hipZ);
    tagStructureMesh(hipCapMesh, {
      id: `hip_synovial_capsule_${sideName.toLowerCase()}`,
      name: `${sideName} Hip Synovial Capsule & Acetabular Labrum`,
      category: "joint",
      sanskritName: "Udumukha Sandhi Kosha (उदूखल सन्धि कोष)",
      ayurvedicClassification: "Sandhi Kosha (सन्धि कोष)",
      dosha: "Sleshaka Kapha",
      dhatu: "Sandhi & Majja",
      biochemicalRole: "Airtight fibrocartilaginous labral seal creating negative fluid pressure to stabilize femoral head.",
      molecularComposition: "Dense fibrocartilaginous labrum ring + vascular synovial capsule.",
      biomechanics: "Deepens acetabulum by 21% and increases surface area by 28%, maintaining suction seal.",
      clinicalSignificance: "Acetabular labral tears, cam/pincer impingement, hip osteoarthritis.",
    });
    rootGroup.add(hipCapMesh);
  });

  // ==========================================================================
  // 3. ANKLES & FEET (ACHILLES TENDON, DELTOID, ATFL)
  // ==========================================================================
  sides.forEach(({ sideName, xSign }) => {
    const ankleX = xSign * 0.082;
    const ankleY = 0.08;

    // 1. Achilles Tendon (Tendo Calcaneus - Thickest and strongest tendon)
    const achillesPoints = [
      new THREE.Vector3(ankleX, ankleY + 0.15, -0.028),
      new THREE.Vector3(ankleX, ankleY + 0.07, -0.038),
      new THREE.Vector3(ankleX, ankleY - 0.02, -0.045),
    ];
    const achillesGeom = createCurvedBand(achillesPoints, 0.0065, 10, 20);
    const achillesMesh = new THREE.Mesh(achillesGeom, mats.tendon);
    tagStructureMesh(achillesMesh, {
      id: `achilles_tendon_${sideName.toLowerCase()}`,
      name: `${sideName} Achilles Tendon (Tendo Calcaneus)`,
      category: "tendon",
      sanskritName: "Padangushtha-Gulpha Kandara (पादाङ्गुष्ठ-गुल्फ महा कण्डरा)",
      ayurvedicClassification: "Maha Kandara (महा कण्डरा)",
      dosha: "Vyana Vayu & Pitta",
      dhatu: "Mamsa Upadhatu",
      biochemicalRole: "Transmits explosive plantarflexion force from gastrocnemius & soleus muscles to calcaneal tuberosity.",
      molecularComposition: "Type I Collagen (95%), Tenocytes, Endotenon septa with nerve/vascular supply.",
      biomechanics: "Capable of storing and releasing up to 35% of energy during bipedal running and hopping.",
      clinicalSignificance: "Achilles tendon rupture, tendinopathy, Haglund's deformity, Thompson test.",
    });
    rootGroup.add(achillesMesh);

    // 2. Anterior Talofibular Ligament (ATFL - Most commonly sprained ligament)
    const atflPoints = [
      new THREE.Vector3(ankleX + xSign * 0.015, ankleY + 0.012, -0.005),
      new THREE.Vector3(ankleX + xSign * 0.012, ankleY - 0.005, 0.014),
    ];
    const atflGeom = createCurvedBand(atflPoints, 0.0025, 8, 12);
    const atflMesh = new THREE.Mesh(atflGeom, mats.ligament);
    tagStructureMesh(atflMesh, {
      id: `ankle_atfl_${sideName.toLowerCase()}`,
      name: `${sideName} Anterior Talofibular Ligament (ATFL)`,
      category: "ligament",
      sanskritName: "Gulpha Tiryak Snayu (गुल्फ तिर्यक् स्नायु)",
      ayurvedicClassification: "Snayu (स्नायु)",
      dosha: "Vata Dosha",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Restrains anterior talar displacement and excessive ankle inversion in plantarflexion.",
      molecularComposition: "Type I Collagen fibrils oriented along inversion tension vector.",
      biomechanics: "Weakest lateral ankle ligament; primary restraint against inversion during heel strike.",
      clinicalSignificance: "Inversion ankle sprain (85% of all ankle injuries), chronic lateral ankle instability.",
    });
    rootGroup.add(atflMesh);

    // 3. Deltoid Ligament (Medial Collateral of Ankle)
    const deltoidPoints = [
      new THREE.Vector3(ankleX - xSign * 0.012, ankleY + 0.015, -0.002),
      new THREE.Vector3(ankleX - xSign * 0.014, ankleY - 0.012, 0.004),
    ];
    const deltoidGeom = createCurvedBand(deltoidPoints, 0.0035, 8, 12);
    const deltoidMesh = new THREE.Mesh(deltoidGeom, mats.ligament);
    tagStructureMesh(deltoidMesh, {
      id: `ankle_deltoid_ligament_${sideName.toLowerCase()}`,
      name: `${sideName} Deltoid Ligament (Medial Collateral of Ankle)`,
      category: "ligament",
      sanskritName: "Tri-Kona Gulpha Snayu (त्रिकोण गुल्फ स्नायु)",
      ayurvedicClassification: "Pratanavati Snayu (प्रतानवती स्नायु)",
      dosha: "Kapha & Vata",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Massive triangular ligament complex preventing excessive eversion and talar pronation.",
      molecularComposition: "Superficial (tibionavicular, tibiocalcaneal) and deep (anterior/posterior tibiotalar) collagen fibers.",
      biomechanics: "Extremely strong; bone avulsion of medial malleolus usually occurs before ligament tears.",
      clinicalSignificance: "Eversion ankle injuries, Pott's fracture-dislocation.",
    });
    rootGroup.add(deltoidMesh);

    // 4. Ankle Synovial Capsule
    const ankleCapGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.024, 16);
    const ankleCapMesh = new THREE.Mesh(ankleCapGeom, mats.joint);
    ankleCapMesh.position.set(ankleX, ankleY, 0.002);
    tagStructureMesh(ankleCapMesh, {
      id: `ankle_synovial_capsule_${sideName.toLowerCase()}`,
      name: `${sideName} Talocrural Synovial Joint Capsule`,
      category: "joint",
      sanskritName: "Gulpha Sandhi Kosha (गुल्फ सन्धि कोष)",
      ayurvedicClassification: "Sandhi Kosha (सन्धि कोष)",
      dosha: "Sleshaka Kapha",
      dhatu: "Sandhi Dhatu",
      biochemicalRole: "Articular capsule enclosing hinge joint between tibia/fibula mortise and talar dome.",
      molecularComposition: "Thin anteriorly and posteriorly with synovial membrane and Sleshaka Kapha fluid.",
      biomechanics: "Permits uniaxial dorsiflexion (20°) and plantarflexion (50°).",
      clinicalSignificance: "Ankle anterior impingement syndrome, post-traumatic synovitis.",
    });
    rootGroup.add(ankleCapMesh);
  });

  // ==========================================================================
  // 4. VERTEBRAL COLUMN (INTERVERTEBRAL DISCS & LONGITUDINAL LIGAMENTS)
  // ==========================================================================
  // 12 Representative Intervertebral Discs spanning Cervical to Lumbar spine
  const discLevels = [
    { name: "C3-C4 Intervertebral Disc", y: 1.48, rx: 0.012, rz: 0.010, th: 0.004 },
    { name: "C5-C6 Intervertebral Disc", y: 1.44, rx: 0.013, rz: 0.011, th: 0.004 },
    { name: "C7-T1 Cervicothoracic Disc", y: 1.40, rx: 0.014, rz: 0.012, th: 0.0045 },
    { name: "T2-T3 Intervertebral Disc", y: 1.34, rx: 0.015, rz: 0.013, th: 0.0048 },
    { name: "T5-T6 Intervertebral Disc", y: 1.27, rx: 0.016, rz: 0.014, th: 0.005 },
    { name: "T8-T9 Intervertebral Disc", y: 1.20, rx: 0.017, rz: 0.015, th: 0.0052 },
    { name: "T11-T12 Thoracolumbar Disc", y: 1.13, rx: 0.018, rz: 0.016, th: 0.0056 },
    { name: "L1-L2 Intervertebral Disc", y: 1.07, rx: 0.020, rz: 0.018, th: 0.0062 },
    { name: "L2-L3 Intervertebral Disc", y: 1.02, rx: 0.021, rz: 0.019, th: 0.0066 },
    { name: "L3-L4 Intervertebral Disc", y: 0.97, rx: 0.022, rz: 0.020, th: 0.007 },
    { name: "L4-L5 Intervertebral Disc", y: 0.92, rx: 0.023, rz: 0.021, th: 0.0075 },
    { name: "L5-S1 Lumbosacral Disc", y: 0.88, rx: 0.024, rz: 0.022, th: 0.008 },
  ];

  discLevels.forEach((disc, idx) => {
    const discGeom = new THREE.CylinderGeometry(disc.rx, disc.rx, disc.th, 20);
    discGeom.scale(1.0, 1.0, disc.rz / disc.rx);
    const discMesh = new THREE.Mesh(discGeom, mats.cartilage);
    discMesh.position.set(0, disc.y, -0.015);
    tagStructureMesh(discMesh, {
      id: `spine_disc_${idx + 1}`,
      name: disc.name,
      category: "cartilage",
      sanskritName: "Prishthasthi Sandhana Chakra (पृष्ठास्थि सन्धान चक्र)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Vata (Vyana & Apana Vayu)",
      dhatu: "Asthi & Majja Dhatu",
      biochemicalRole: "Concentric lamellae of Anulus Fibrosus (Type I collagen) enclosing gelatinous Nucleus Pulposus (Type II collagen + Aggrecan).",
      molecularComposition: "Aggrecan, Chondroitin Sulfate, Type I & II Collagen, 80% water content in healthy state.",
      biomechanics: "Converts axial vertebral compressive loads into multidirectional hydraulic tension, absorbing spinal shocks.",
      clinicalSignificance: "Disc herniation, sciatica (Gridhrasi), degenerative disc disease, spinal stenosis.",
    });
    rootGroup.add(discMesh);
  });

  // Anterior Longitudinal Ligament (ALL - Spanning cervical to sacrum)
  const allPoints = [
    new THREE.Vector3(0, 1.48, -0.002),
    new THREE.Vector3(0, 1.30, 0.002),
    new THREE.Vector3(0, 1.10, -0.001),
    new THREE.Vector3(0, 0.88, 0.006),
  ];
  const allGeom = createCurvedBand(allPoints, 0.004, 8, 24);
  const allMesh = new THREE.Mesh(allGeom, mats.ligament);
  tagStructureMesh(allMesh, {
    id: "spine_anterior_longitudinal_ligament",
    name: "Anterior Longitudinal Ligament (ALL)",
    category: "ligament",
    sanskritName: "Purva Deergha Kasheruka Snayu (पूर्व दीर्घ कशेरुका स्नायु)",
    ayurvedicClassification: "Pratanavati Snayu (प्रतानवती स्नायु)",
    dosha: "Vata Dosha",
    dhatu: "Snayu Dhatu",
    biochemicalRole: "Strong, broad fibrous band running along anterior surfaces of vertebral bodies, preventing hyperextension.",
    molecularComposition: "Multilayered dense longitudinal Type I Collagen fibers with high tensile strength.",
    biomechanics: "Only ligament in human body that actively resists spine hyperextension.",
    clinicalSignificance: "Whiplash injury hyperextension tears, diffuse idiopathic skeletal hyperostosis (DISH).",
  });
  rootGroup.add(allMesh);

  // ==========================================================================
  // 5. THORACIC CAGE (BILATERAL COSTAL CARTILAGES CONNECTING RIBS TO STERNUM)
  // ==========================================================================
  const costalLevels = [
    { y: 1.39, len: 0.032, angle: 0.05 },
    { y: 1.36, len: 0.038, angle: 0.12 },
    { y: 1.33, len: 0.044, angle: 0.18 },
    { y: 1.30, len: 0.052, angle: 0.25 },
    { y: 1.27, len: 0.060, angle: 0.32 },
    { y: 1.24, len: 0.068, angle: 0.40 },
    { y: 1.21, len: 0.076, angle: 0.48 },
  ];

  costalLevels.forEach((level, idx) => {
    sides.forEach(({ sideName, xSign }) => {
      const startX = xSign * 0.014;
      const endX = xSign * (0.014 + level.len);
      const points = [
        new THREE.Vector3(startX, level.y, 0.098),
        new THREE.Vector3((startX + endX) / 2, level.y - level.angle * 0.02, 0.096),
        new THREE.Vector3(endX, level.y - level.angle * 0.04, 0.088),
      ];
      const costalGeom = createCurvedBand(points, 0.0035, 8, 16);
      const costalMesh = new THREE.Mesh(costalGeom, mats.cartilage);
      tagStructureMesh(costalMesh, {
        id: `costal_cartilage_${idx + 1}_${sideName.toLowerCase()}`,
        name: `${sideName} Costal Cartilage Rib ${idx + 1}`,
        category: "cartilage",
        sanskritName: "Parshuka Tarunasthi (पर्शुका तरुणाम्नाय - उरः सन्धि)",
        ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
        dosha: "Prana Vayu & Avalambaka Kapha",
        dhatu: "Asthi & Snayu",
        biochemicalRole: "Hyaline cartilage bars providing elastic compliance to anterior thoracic cage during breathing.",
        molecularComposition: "Type II Collagen & Chondroitin Sulfate gel matrix providing thoracic elastic recoil.",
        biomechanics: "Enables respiratory tidal excursion (costal bucket-handle and pump-handle kinetics).",
        clinicalSignificance: "Costochondritis (Tietze syndrome), rib cartilage fracture, chest wall deformities.",
      });
      rootGroup.add(costalMesh);
    });
  });

  // ==========================================================================
  // 6. SHOULDERS (GLENOHUMERAL CAPSULE, LABRUM, CORACOACROMIAL, BICEPS TENDON)
  // ==========================================================================
  sides.forEach(({ sideName, xSign }) => {
    const shoulderX = xSign * 0.185;
    const shoulderY = 1.34;
    const shoulderZ = 0.005;

    // 1. Glenohumeral Articular Cartilage
    const glenCartGeom = new THREE.SphereGeometry(0.018, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const glenCartMesh = new THREE.Mesh(glenCartGeom, mats.cartilage);
    glenCartMesh.position.set(shoulderX, shoulderY, shoulderZ);
    glenCartMesh.rotation.z = -xSign * 0.6;
    tagStructureMesh(glenCartMesh, {
      id: `shoulder_cartilage_${sideName.toLowerCase()}`,
      name: `${sideName} Humeral Head Articular Cartilage`,
      category: "cartilage",
      sanskritName: "Amsa Tarunasthi (अंसास्थि तरुणाम्नाय)",
      ayurvedicClassification: "Sandhanaka Asthi (सन्धानक अस्थि)",
      dosha: "Sleshaka Kapha",
      dhatu: "Asthi Dhatu",
      biochemicalRole: "Smooth hyaline articular cartilage capping head of humerus for triaxial ball-and-socket motion.",
      molecularComposition: "Type II Collagen fibrils supporting frictionless multiplanar arm circumduction.",
      biomechanics: "Largest range of motion of any joint in the body (~180° flexion/abduction).",
      clinicalSignificance: "Glenohumeral osteoarthritis, rotator cuff arthropathy, Bankart lesions.",
    });
    rootGroup.add(glenCartMesh);

    // 2. Coracoacromial Ligament
    const caPoints = [
      new THREE.Vector3(shoulderX - xSign * 0.02, shoulderY + 0.022, 0.018),
      new THREE.Vector3(shoulderX - xSign * 0.008, shoulderY + 0.030, 0.012),
      new THREE.Vector3(shoulderX + xSign * 0.015, shoulderY + 0.028, 0.004),
    ];
    const caGeom = createCurvedBand(caPoints, 0.0028, 8, 12);
    const caMesh = new THREE.Mesh(caGeom, mats.ligament);
    tagStructureMesh(caMesh, {
      id: `shoulder_coracoacromial_ligament_${sideName.toLowerCase()}`,
      name: `${sideName} Coracoacromial Ligament`,
      category: "ligament",
      sanskritName: "Amsa-Kuta Snayu (अंसास्थि-कूट स्नायु)",
      ayurvedicClassification: "Vritta Snayu (वृत्त स्नायु)",
      dosha: "Vata (Vyana Vayu)",
      dhatu: "Snayu Dhatu",
      biochemicalRole: "Forms coracoacromial arch protecting superior aspect of humeral head and rotator cuff.",
      molecularComposition: "Dense fibrous Type I Collagen band bridging coracoid and acromion.",
      biomechanics: "Prevents superior dislocation of humeral head during heavy vertical loading.",
      clinicalSignificance: "Subacromial impingement syndrome, rotator cuff tendon attrition.",
    });
    rootGroup.add(caMesh);

    // 3. Biceps Brachii Long Head Tendon
    const bicepsTendonPoints = [
      new THREE.Vector3(shoulderX - xSign * 0.004, shoulderY + 0.026, 0.008),
      new THREE.Vector3(shoulderX + xSign * 0.002, shoulderY + 0.008, 0.018),
      new THREE.Vector3(shoulderX + xSign * 0.006, shoulderY - 0.045, 0.016),
    ];
    const bicepsTendonGeom = createCurvedBand(bicepsTendonPoints, 0.0032, 8, 16);
    const bicepsTendonMesh = new THREE.Mesh(bicepsTendonGeom, mats.tendon);
    tagStructureMesh(bicepsTendonMesh, {
      id: `shoulder_biceps_tendon_${sideName.toLowerCase()}`,
      name: `${sideName} Biceps Brachii Long Head Tendon`,
      category: "tendon",
      sanskritName: "Dvi-Shira Bahu Kandara (द्विशिर बाहु कण्डरा)",
      ayurvedicClassification: "Kandara (कण्डरा)",
      dosha: "Vyana Vayu",
      dhatu: "Mamsa Upadhatu",
      biochemicalRole: "Intracapsular tendon originating from supraglenoid tubercle, traveling down bicipital groove.",
      molecularComposition: "High-density aligned Type I Collagen encased in synovial sheath.",
      biomechanics: "Depresses humeral head and assists anterior glenohumeral stabilization.",
      clinicalSignificance: "Biceps tendinitis, SLAP tear (Superior Labrum Anterior to Posterior), Popeye deformity.",
    });
    rootGroup.add(bicepsTendonMesh);

    // 4. Glenohumeral Synovial Capsule
    const glenCapGeom = new THREE.SphereGeometry(0.024, 16, 12);
    const glenCapMesh = new THREE.Mesh(glenCapGeom, mats.joint);
    glenCapMesh.position.set(shoulderX, shoulderY, shoulderZ);
    tagStructureMesh(glenCapMesh, {
      id: `shoulder_synovial_capsule_${sideName.toLowerCase()}`,
      name: `${sideName} Glenohumeral Synovial Capsule & Labrum`,
      category: "joint",
      sanskritName: "Amsa Sandhi Kosha (अंस सन्धि कोष)",
      ayurvedicClassification: "Sandhi Kosha (सन्धि कोष)",
      dosha: "Sleshaka Kapha",
      dhatu: "Sandhi & Majja",
      biochemicalRole: "Spacious joint capsule twice the volume of the humeral head, enabling unmatched mobility.",
      molecularComposition: "Capsular fibrous layer lined by synovial membrane bathed in Sleshaka Kapha fluid.",
      biomechanics: "Dynamic stabilization coupled with rotator cuff muscles (SITS).",
      clinicalSignificance: "Adhesive Capsulitis (Frozen Shoulder / Apabahuka), anterior shoulder dislocation.",
    });
    rootGroup.add(glenCapMesh);
  });

  return rootGroup;
}
