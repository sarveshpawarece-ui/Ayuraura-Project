// ============================================================================
// AYURSETU 3D BILATERAL MARMA SPLINE ARCS & PRANA FLOW ENGINE
// Connects Paired Left & Right Marma Nodes Across Sagittal Midline
// Luminous Quadratic Bezier Symmetry Arcs & Symmetrical Prana Distribution
// ============================================================================

import * as THREE from "three";
import { MarmaPointData, MARMA_DATABASE } from "./marmaPointsData";

export interface BilateralPair {
  id: string;
  name: string;
  leftMarma: MarmaPointData;
  rightMarma: MarmaPointData;
  curve: THREE.QuadraticBezierCurve3;
}

export interface BilateralArcsSystem {
  group: THREE.Group;
  pairs: BilateralPair[];
  update: (time: number, delta: number, visible: boolean) => void;
  dispose: () => void;
}

// Helper: Identify all bilateral pairs across the 107 Marma dataset
export function extractBilateralMarmaPairs(): BilateralPair[] {
  const marmaMap = new Map<string, MarmaPointData>();
  MARMA_DATABASE.forEach((m) => marmaMap.set(m.id, m));

  const processed = new Set<string>();
  const pairs: BilateralPair[] = [];

  MARMA_DATABASE.forEach((m) => {
    if (processed.has(m.id)) return;

    let counterpartId: string | null = null;
    let isLeft = false;

    // Pattern 1: _right <-> _left
    if (m.id.includes("_right")) {
      counterpartId = m.id.replace("_right", "_left");
      isLeft = false;
    } else if (m.id.includes("_left")) {
      counterpartId = m.id.replace("_left", "_right");
      isLeft = true;
    }
    // Pattern 2: _rt <-> _lt
    else if (m.id.includes("_rt")) {
      counterpartId = m.id.replace("_rt", "_lt");
      isLeft = false;
    } else if (m.id.includes("_lt")) {
      counterpartId = m.id.replace("_lt", "_rt");
      isLeft = true;
    }
    // Pattern 3: Sira Matrika 1-4 (siramatrika_r1 <-> siramatrika_l1)
    else if (m.id.startsWith("siramatrika_r")) {
      counterpartId = m.id.replace("siramatrika_r", "siramatrika_l");
      isLeft = false;
    } else if (m.id.startsWith("siramatrika_l")) {
      counterpartId = m.id.replace("siramatrika_l", "siramatrika_r");
      isLeft = true;
    }

    if (counterpartId && marmaMap.has(counterpartId)) {
      const counterpart = marmaMap.get(counterpartId)!;
      const leftM = isLeft ? m : counterpart;
      const rightM = isLeft ? counterpart : m;

      const pL = new THREE.Vector3(...leftM.anchor);
      const pR = new THREE.Vector3(...rightM.anchor);

      // Midline sagittal anchor (X = 0)
      const isPosterior = pL.z < -0.02 && pR.z < -0.02;
      const span = pL.distanceTo(pR);

      // Dynamic arc elevation & depth according to anatomical region
      const arcHeight = Math.min(0.06, Math.max(0.015, span * 0.12));
      const zOffset = isPosterior ? -0.03 : 0.03;

      const midY = (pL.y + pR.y) * 0.5 + arcHeight;
      const midZ = (pL.z + pR.z) * 0.5 + zOffset;
      const midPoint = new THREE.Vector3(0, midY, midZ);

      const curve = new THREE.QuadraticBezierCurve3(pL, midPoint, pR);

      pairs.push({
        id: `${leftM.id}_${rightM.id}`,
        name: leftM.sanskritName.replace(/\s*\([^)]*\)/g, ""),
        leftMarma: leftM,
        rightMarma: rightM,
        curve
      });

      processed.add(m.id);
      processed.add(counterpart.id);
    }
  });

  return pairs;
}

export function buildBilateralArcsEngine(): BilateralArcsSystem {
  const group = new THREE.Group();
  group.name = "BilateralMarmaSplineArcsEngine";

  const pairs = extractBilateralMarmaPairs();

  // 1. Luminous Spline Curves Line System
  const linePositions: number[] = [];
  const pointsPerCurve = 32;

  pairs.forEach((pair) => {
    const pts = pair.curve.getPoints(pointsPerCurve);
    for (let i = 0; i < pts.length - 1; i++) {
      linePositions.push(pts[i].x, pts[i].y, pts[i].z);
      linePositions.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
  });

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8, // Luminous Cyan-Blue (#38BDF8)
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  lineSegments.name = "BilateralArcsLines";
  group.add(lineSegments);

  // 2. Prana Distribution Energy Particles (Outward Flow from Midline to Extremities)
  // Each pair gets 8 particles: 4 flowing toward left extremity, 4 toward right extremity
  const particlesPerPair = 8;
  const totalParticles = pairs.length * particlesPerPair;

  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(totalParticles * 3);
  const particleColors = new Float32Array(totalParticles * 3);

  // Particle tracking metadata
  const pairIndices = new Int32Array(totalParticles);
  const particleDirections = new Float32Array(totalParticles); // -1 (toward left) or +1 (toward right)
  const particleProgress = new Float32Array(totalParticles);  // 0.0 to 1.0 along curve
  const particleSpeeds = new Float32Array(totalParticles);

  let pIdx = 0;
  pairs.forEach((pair, pairIdx) => {
    for (let j = 0; j < particlesPerPair; j++) {
      pairIndices[pIdx] = pairIdx;
      // Alternate direction: even indices travel to left (0.5 -> 0.0), odd travel to right (0.5 -> 1.0)
      const dir = j % 2 === 0 ? -1 : 1;
      particleDirections[pIdx] = dir;
      // Stagger initial progress around center 0.5
      particleProgress[pIdx] = 0.5 + dir * ((j % 4) * 0.12 + Math.random() * 0.04);
      particleSpeeds[pIdx] = 0.22 + Math.random() * 0.18;

      // Color: Electric Cyan #38BDF8 with core bright white-cyan (#BAE6FD)
      particleColors[pIdx * 3] = 0.22;
      particleColors[pIdx * 3 + 1] = 0.74;
      particleColors[pIdx * 3 + 2] = 0.97;

      pIdx++;
    }
  });

  particleGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );
  particleGeo.setAttribute(
    "color",
    new THREE.BufferAttribute(particleColors, 3)
  );

  const particleMat = new THREE.PointsMaterial({
    size: 0.016,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  particleSystem.name = "BilateralPranaParticles";
  group.add(particleSystem);

  const tmpVec = new THREE.Vector3();

  // Animation Update Function
  const update = (time: number, delta: number, visible: boolean) => {
    group.visible = visible;
    if (!visible) return;

    // Subtle line glow pulse
    const linePulse = 0.45 + 0.25 * Math.sin(time * 2.5);
    lineMat.opacity = linePulse;

    const pos = particlePositions;
    for (let i = 0; i < totalParticles; i++) {
      const pair = pairs[pairIndices[i]];
      const dir = particleDirections[i];
      let t = particleProgress[i] + dir * delta * particleSpeeds[i];

      // Reset when reaching extremities (t < 0 or t > 1) back to center (t = 0.5)
      if (dir < 0 && t <= 0.0) {
        t = 0.5 + Math.random() * 0.05;
      } else if (dir > 0 && t >= 1.0) {
        t = 0.5 - Math.random() * 0.05;
      }

      particleProgress[i] = t;
      pair.curve.getPoint(Math.max(0, Math.min(1, t)), tmpVec);

      pos[i * 3] = tmpVec.x;
      pos[i * 3 + 1] = tmpVec.y;
      pos[i * 3 + 2] = tmpVec.z;
    }

    particleGeo.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    lineGeo.dispose();
    lineMat.dispose();
    particleGeo.dispose();
    particleMat.dispose();
  };

  return {
    group,
    pairs,
    update,
    dispose
  };
}
