// ============================================================================
// AYURSETU TRIDOSHA ENERGY FLOW 3D ENGINE
// High-performance Particle Spline Flows along Classical Srotas Channels
// Vata (Cyan-Blue) • Pitta (Ruby-Gold) • Kapha (White-Opal)
// ============================================================================

import * as THREE from "three";

export interface TridoshaVisibilityState {
  vata: boolean;
  pitta: boolean;
  kapha: boolean;
}

interface ParticleFlowSystem {
  points: THREE.Points;
  curves: THREE.CatmullRomCurve3[];
  particleCount: number;
  curveIndices: Float32Array;
  tOffsets: Float32Array;
  speeds: Float32Array;
  positions: Float32Array;
}

export interface TridoshaFlowSystem {
  group: THREE.Group;
  update: (time: number, delta: number, visibility: TridoshaVisibilityState) => void;
  dispose: () => void;
}

// ----------------------------------------------------------------------------
// 1. CANONICAL SROTAS CURVE COORDINATES (1.70m Reference Frame)
// ----------------------------------------------------------------------------

// VATA CURVES: Cranio-Spinal & Neuro-Peripheral Axis (Prana -> Apana / Vyana)
const VATA_SPINAL_PATH = [
  new THREE.Vector3(0.0, 1.70, 0.0),    // Adhipati (Crown)
  new THREE.Vector3(0.0, 1.60, 0.06),   // Sthapani (Glabella)
  new THREE.Vector3(0.0, 1.50, -0.05),  // Krikadika (Atlanto-Occipital)
  new THREE.Vector3(0.0, 1.38, -0.07),  // C7 Prominens
  new THREE.Vector3(0.0, 1.28, -0.08),  // T4-T5 (Vrihati)
  new THREE.Vector3(0.0, 1.10, -0.06),  // T12-L1
  new THREE.Vector3(0.0, 0.94, -0.07),  // L4-L5
  new THREE.Vector3(0.0, 0.86, -0.08),  // Katikataruna (Sacrum)
  new THREE.Vector3(0.0, 0.77, -0.02)   // Guda (Perineum / Coccyx)
];

const VATA_LEG_RIGHT_PATH = [
  new THREE.Vector3(-0.05, 0.88, -0.09), // Kukundara Right
  new THREE.Vector3(-0.08, 0.78, 0.06),  // Lohitaksha (Femoral)
  new THREE.Vector3(-0.10, 0.65, 0.04),  // Urvi (Thigh)
  new THREE.Vector3(-0.09, 0.54, 0.05),  // Ani (Supracondylar)
  new THREE.Vector3(-0.09, 0.47, 0.05),  // Janu (Knee)
  new THREE.Vector3(-0.09, 0.28, -0.04), // Indrabasti (Calf)
  new THREE.Vector3(-0.08, 0.09, 0.0),   // Gulpha (Ankle)
  new THREE.Vector3(-0.09, 0.03, 0.12)   // Kshipra (Foot Web)
];

const VATA_LEG_LEFT_PATH = [
  new THREE.Vector3(0.05, 0.88, -0.09),  // Kukundara Left
  new THREE.Vector3(0.08, 0.78, 0.06),   // Lohitaksha
  new THREE.Vector3(0.10, 0.65, 0.04),   // Urvi
  new THREE.Vector3(0.09, 0.54, 0.05),   // Ani
  new THREE.Vector3(0.09, 0.47, 0.05),   // Janu
  new THREE.Vector3(0.09, 0.28, -0.04),  // Indrabasti
  new THREE.Vector3(0.08, 0.09, 0.0),    // Gulpha
  new THREE.Vector3(0.09, 0.03, 0.12)    // Kshipra
];

const VATA_ARM_RIGHT_PATH = [
  new THREE.Vector3(-0.04, 1.42, 0.03),  // Cervical Root
  new THREE.Vector3(-0.18, 1.43, -0.02), // Amsa (Shoulder)
  new THREE.Vector3(-0.20, 1.34, 0.02),  // Urvi (Arm)
  new THREE.Vector3(-0.23, 1.23, 0.01),  // Kurpara (Elbow)
  new THREE.Vector3(-0.24, 1.15, 0.04),  // Indrabasti (Forearm)
  new THREE.Vector3(-0.25, 1.05, 0.04),  // Manibandha (Wrist)
  new THREE.Vector3(-0.27, 0.98, 0.08)   // Kshipra (Hand Web)
];

const VATA_ARM_LEFT_PATH = [
  new THREE.Vector3(0.04, 1.42, 0.03),
  new THREE.Vector3(0.18, 1.43, -0.02),
  new THREE.Vector3(0.20, 1.34, 0.02),
  new THREE.Vector3(0.23, 1.23, 0.01),
  new THREE.Vector3(0.24, 1.15, 0.04),
  new THREE.Vector3(0.25, 1.05, 0.04),
  new THREE.Vector3(0.27, 0.98, 0.08)
];

// PITTA CURVES: Solar Plexus & Cardiovascular Arterial Axis (Pachaka Agni <-> Sadhaka)
const PITTA_CORE_PATH = [
  new THREE.Vector3(0.0, 1.05, 0.10),   // Nabhi (Solar Plexus)
  new THREE.Vector3(0.0, 1.15, 0.08),   // Celiac Axis
  new THREE.Vector3(0.0, 1.25, 0.10),   // Hridaya (Heart Center)
  new THREE.Vector3(-0.04, 1.32, 0.11), // Apastambha Right
  new THREE.Vector3(-0.045, 1.46, 0.03),// Sira Matrika (Right Carotid)
  new THREE.Vector3(0.0, 1.60, 0.08),   // Ajna / Glabella
  new THREE.Vector3(0.045, 1.46, 0.03), // Sira Matrika (Left Carotid)
  new THREE.Vector3(0.04, 1.32, 0.11),  // Apastambha Left
  new THREE.Vector3(0.0, 1.25, 0.10),   // Return to Hridaya
  new THREE.Vector3(0.0, 1.05, 0.10)    // Return to Nabhi
];

const PITTA_ARTERIAL_RIGHT_PATH = [
  new THREE.Vector3(0.0, 1.25, 0.10),   // Hridaya
  new THREE.Vector3(-0.09, 1.30, 0.12), // Stanarohita Right
  new THREE.Vector3(-0.16, 1.40, 0.01), // Lohitaksha (Axillary)
  new THREE.Vector3(-0.20, 1.34, 0.02), // Urvi
  new THREE.Vector3(-0.24, 1.15, 0.04), // Indrabasti
  new THREE.Vector3(-0.29, 0.96, 0.06)  // Talahridaya (Palmar Heart)
];

const PITTA_ARTERIAL_LEFT_PATH = [
  new THREE.Vector3(0.0, 1.25, 0.10),   // Hridaya
  new THREE.Vector3(0.09, 1.30, 0.12),  // Stanarohita Left
  new THREE.Vector3(0.16, 1.40, 0.01),  // Lohitaksha
  new THREE.Vector3(0.20, 1.34, 0.02),  // Urvi
  new THREE.Vector3(0.24, 1.15, 0.04),  // Indrabasti
  new THREE.Vector3(0.29, 0.96, 0.06)   // Talahridaya
];

// KAPHA CURVES: Lymphatic, Thoracic & Synovial Joint Axis (Avalambaka & Sleshaka)
const KAPHA_THORACIC_PATH = [
  new THREE.Vector3(0.0, 1.44, 0.05),   // Larynx / Nila
  new THREE.Vector3(0.0, 1.35, 0.06),   // Thymus / Mediastinum
  new THREE.Vector3(-0.09, 1.20, 0.12), // Stanamula Right
  new THREE.Vector3(-0.16, 1.26, 0.04), // Apalapa Right
  new THREE.Vector3(0.0, 1.25, 0.10),   // Hridaya
  new THREE.Vector3(0.16, 1.26, 0.04),  // Apalapa Left
  new THREE.Vector3(0.09, 1.20, 0.12),  // Stanamula Left
  new THREE.Vector3(0.0, 1.05, 0.10)    // Nabhi
];

const KAPHA_JOINT_LOOP_RIGHT = [
  new THREE.Vector3(-0.06, 0.81, 0.07), // Vitapa / Inguinal
  new THREE.Vector3(-0.09, 0.47, 0.05), // Janu (Knee Synovium)
  new THREE.Vector3(-0.08, 0.09, 0.0),  // Gulpha (Ankle)
  new THREE.Vector3(-0.08, 0.015, 0.04),// Talahridaya Sole
  new THREE.Vector3(-0.08, 0.06, 0.02), // Kurchashira
  new THREE.Vector3(-0.09, 0.47, 0.05)  // Re-circulate to Janu
];

const KAPHA_JOINT_LOOP_LEFT = [
  new THREE.Vector3(0.06, 0.81, 0.07),
  new THREE.Vector3(0.09, 0.47, 0.05),
  new THREE.Vector3(0.08, 0.09, 0.0),
  new THREE.Vector3(0.08, 0.015, 0.04),
  new THREE.Vector3(0.08, 0.06, 0.02),
  new THREE.Vector3(0.09, 0.47, 0.05)
];

// ----------------------------------------------------------------------------
// 2. FLOW SYSTEM GENERATOR
// ----------------------------------------------------------------------------

function createFlowSystem(
  curveDefinitions: THREE.Vector3[][],
  colorHex: string,
  particleCount: number,
  size: number,
  baseSpeed: number
): ParticleFlowSystem {
  const curves = curveDefinitions.map((pts) => new THREE.CatmullRomCurve3(pts));
  const numCurves = curves.length;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const curveIndices = new Float32Array(particleCount);
  const tOffsets = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  const baseColor = new THREE.Color(colorHex);
  const pVec = new THREE.Vector3();

  for (let i = 0; i < particleCount; i++) {
    const cIdx = i % numCurves;
    curveIndices[i] = cIdx;
    const t = Math.random();
    tOffsets[i] = t;
    speeds[i] = baseSpeed * (0.8 + Math.random() * 0.4);

    curves[cIdx].getPoint(t, pVec);
    // Subtle lateral jitter to give natural fluid stream thickness
    pVec.x += (Math.random() - 0.5) * 0.008;
    pVec.y += (Math.random() - 0.5) * 0.008;
    pVec.z += (Math.random() - 0.5) * 0.008;

    positions[i * 3] = pVec.x;
    positions[i * 3 + 1] = pVec.y;
    positions[i * 3 + 2] = pVec.z;

    // Subtle hue shift along particles
    const shift = (Math.random() - 0.5) * 0.1;
    const c = baseColor.clone().offsetHSL(shift, 0, shift * 0.5);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: size,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    curves,
    particleCount,
    curveIndices,
    tOffsets,
    speeds,
    positions
  };
}

// ----------------------------------------------------------------------------
// 3. MASTER TRIDOSHA FLOW BUILDER
// ----------------------------------------------------------------------------

export function buildTridoshaFlowEngine(): TridoshaFlowSystem {
  const masterGroup = new THREE.Group();
  masterGroup.name = "TridoshaEnergyFlowEngine";

  // Vata System (Electric Cyan-Blue #00E5FF, fast fluid flow)
  const vataCurves = [
    VATA_SPINAL_PATH,
    VATA_LEG_RIGHT_PATH,
    VATA_LEG_LEFT_PATH,
    VATA_ARM_RIGHT_PATH,
    VATA_ARM_LEFT_PATH
  ];
  const vataSystem = createFlowSystem(vataCurves, "#00E5FF", 450, 0.015, 0.16);
  vataSystem.points.name = "VataFlowParticles";
  masterGroup.add(vataSystem.points);

  // Pitta System (Ruby-Gold Glowing Flow #EF4444 / #F59E0B, warm metabolic pulsing)
  const pittaCurves = [
    PITTA_CORE_PATH,
    PITTA_ARTERIAL_RIGHT_PATH,
    PITTA_ARTERIAL_LEFT_PATH
  ];
  const pittaSystem = createFlowSystem(pittaCurves, "#F59E0B", 380, 0.018, 0.14);
  pittaSystem.points.name = "PittaFlowParticles";
  masterGroup.add(pittaSystem.points);

  // Kapha System (White-Opal Pearl Flow #F8FAFC, slow smooth viscous lubrication)
  const kaphaCurves = [
    KAPHA_THORACIC_PATH,
    KAPHA_JOINT_LOOP_RIGHT,
    KAPHA_JOINT_LOOP_LEFT
  ];
  const kaphaSystem = createFlowSystem(kaphaCurves, "#F8FAFC", 350, 0.020, 0.09);
  kaphaSystem.points.name = "KaphaFlowParticles";
  masterGroup.add(kaphaSystem.points);

  const pVec = new THREE.Vector3();

  const update = (time: number, delta: number, visibility: TridoshaVisibilityState) => {
    // 1. Vata Update
    vataSystem.points.visible = visibility.vata;
    if (visibility.vata) {
      const pos = vataSystem.positions;
      for (let i = 0; i < vataSystem.particleCount; i++) {
        let t = vataSystem.tOffsets[i] + delta * vataSystem.speeds[i];
        if (t > 1.0) t -= 1.0;
        vataSystem.tOffsets[i] = t;

        const cIdx = vataSystem.curveIndices[i];
        vataSystem.curves[cIdx].getPoint(t, pVec);
        pos[i * 3] = pVec.x;
        pos[i * 3 + 1] = pVec.y;
        pos[i * 3 + 2] = pVec.z;
      }
      vataSystem.points.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Pitta Update
    pittaSystem.points.visible = visibility.pitta;
    if (visibility.pitta) {
      const pos = pittaSystem.positions;
      // Metabolic pulse brightness
      const pittaPulse = 0.75 + 0.25 * Math.sin(time * 3.5);
      (pittaSystem.points.material as THREE.PointsMaterial).opacity = pittaPulse;

      for (let i = 0; i < pittaSystem.particleCount; i++) {
        let t = pittaSystem.tOffsets[i] + delta * pittaSystem.speeds[i];
        if (t > 1.0) t -= 1.0;
        pittaSystem.tOffsets[i] = t;

        const cIdx = pittaSystem.curveIndices[i];
        pittaSystem.curves[cIdx].getPoint(t, pVec);
        pos[i * 3] = pVec.x;
        pos[i * 3 + 1] = pVec.y;
        pos[i * 3 + 2] = pVec.z;
      }
      pittaSystem.points.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Kapha Update
    kaphaSystem.points.visible = visibility.kapha;
    if (visibility.kapha) {
      const pos = kaphaSystem.positions;
      for (let i = 0; i < kaphaSystem.particleCount; i++) {
        let t = kaphaSystem.tOffsets[i] + delta * kaphaSystem.speeds[i];
        if (t > 1.0) t -= 1.0;
        kaphaSystem.tOffsets[i] = t;

        const cIdx = kaphaSystem.curveIndices[i];
        kaphaSystem.curves[cIdx].getPoint(t, pVec);
        pos[i * 3] = pVec.x;
        pos[i * 3 + 1] = pVec.y;
        pos[i * 3 + 2] = pVec.z;
      }
      kaphaSystem.points.geometry.attributes.position.needsUpdate = true;
    }
  };

  const dispose = () => {
    [vataSystem, pittaSystem, kaphaSystem].forEach((sys) => {
      sys.points.geometry.dispose();
      (sys.points.material as THREE.Material).dispose();
    });
  };

  return {
    group: masterGroup,
    update,
    dispose
  };
}
