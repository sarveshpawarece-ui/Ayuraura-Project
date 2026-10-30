// ============================================================================
// AYURSETU ANGULA PRAMANA SPATIAL VISUALIZATION RINGS ENGINE
// Concentric Holographic 3D Metric Rings & Billboarding Spatial Boundaries
// 0.5 Angula (0.9cm) • 1.0 Angula (1.8cm) • 2.0 Angula (3.6cm) • 4.0 Angula (7.2cm)
// ============================================================================

import * as THREE from "three";

export interface AngulaRingLevel {
  angulaValue: number; // e.g., 0.5, 1.0, 2.0, 4.0
  radiusMeters: number; // In 3D world meters (1m = 100cm)
  colorHex: string;
  baseOpacity: number;
  label: string;
}

export const ANGULA_TIERS: AngulaRingLevel[] = [
  {
    angulaValue: 0.5,
    radiusMeters: 0.009, // ~0.9 cm (Ardha Angula)
    colorHex: "#EF4444", // Sharp Ruby Inner Core
    baseOpacity: 0.55,
    label: "0.5 Angula (0.9 cm)"
  },
  {
    angulaValue: 1.0,
    radiusMeters: 0.018, // ~1.8 cm (Eka Angula)
    colorHex: "#F59E0B", // Amber Gold Medium Ring
    baseOpacity: 0.40,
    label: "1.0 Angula (1.8 cm)"
  },
  {
    angulaValue: 2.0,
    radiusMeters: 0.036, // ~3.6 cm (Dvi Angula)
    colorHex: "#10B981", // Emerald Green Wide Ring
    baseOpacity: 0.30,
    label: "2.0 Angula (3.6 cm)"
  },
  {
    angulaValue: 4.0,
    radiusMeters: 0.072, // ~7.2 cm (Mushti / 4 Angula)
    colorHex: "#38BDF8", // Cyan-Blue Outer Boundary
    baseOpacity: 0.22,
    label: "4.0 Angula / Mushti (7.2 cm)"
  }
];

export interface AngulaRingsSystem {
  group: THREE.Group;
  setTarget: (anchor: [number, number, number] | null, pramanaSize?: string) => void;
  update: (time: number, camera: THREE.Camera, visible: boolean) => void;
  dispose: () => void;
}

export function buildAngulaRingsEngine(): AngulaRingsSystem {
  const masterGroup = new THREE.Group();
  masterGroup.name = "AngulaPramanaRingsEngine";
  masterGroup.visible = false;

  // Billboarding Flat Rings Subgroup (Faces camera)
  const ringsBillboardGroup = new THREE.Group();
  ringsBillboardGroup.name = "AngulaBillboardRings";
  masterGroup.add(ringsBillboardGroup);

  // Holographic 3D Wireframe Spheres Subgroup
  const wireframeSpheresGroup = new THREE.Group();
  wireframeSpheresGroup.name = "AngulaWireframeSpheres";
  masterGroup.add(wireframeSpheresGroup);

  interface RingUnit {
    tier: AngulaRingLevel;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    sphereMesh: THREE.Mesh;
    sphereMat: THREE.MeshBasicMaterial;
  }

  const units: RingUnit[] = [];

  ANGULA_TIERS.forEach((tier) => {
    // 1. Billboard Ring Mesh
    const thickness = tier.radiusMeters * 0.08;
    const ringGeo = new THREE.RingGeometry(
      Math.max(0.002, tier.radiusMeters - thickness),
      tier.radiusMeters + thickness,
      64
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(tier.colorHex),
      transparent: true,
      opacity: tier.baseOpacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringsBillboardGroup.add(ringMesh);

    // 2. Holographic Concentric Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(tier.radiusMeters, 18, 12);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(tier.colorHex),
      wireframe: true,
      transparent: true,
      opacity: tier.baseOpacity * 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    wireframeSpheresGroup.add(sphereMesh);

    units.push({
      tier,
      ringMesh,
      ringMat,
      sphereMesh,
      sphereMat
    });
  });

  // Center Axis Pulsing Marker
  const centerPointGeo = new THREE.SphereGeometry(0.0035, 12, 12);
  const centerPointMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const centerMarker = new THREE.Mesh(centerPointGeo, centerPointMat);
  masterGroup.add(centerMarker);

  let activeTierLevel = -1; // -1 = all equal; or matched tier index

  const parsePramanaLevel = (text?: string): number => {
    if (!text) return -1;
    const lower = text.toLowerCase();
    if (lower.includes("1/2") || lower.includes("ardha") || lower.includes("0.5")) return 0;
    if (lower.includes("1 angula") || lower.includes("eka angula")) return 1;
    if (lower.includes("2 angula") || lower.includes("dvi angula")) return 2;
    if (lower.includes("4 angula") || lower.includes("mushti") || lower.includes("panitala") || lower.includes("chatush")) return 3;
    if (lower.includes("3 angula")) return 2;
    return -1;
  };

  const setTarget = (anchor: [number, number, number] | null, pramanaSize?: string) => {
    if (!anchor) {
      masterGroup.visible = false;
      return;
    }
    masterGroup.position.set(anchor[0], anchor[1], anchor[2]);
    masterGroup.visible = true;
    activeTierLevel = parsePramanaLevel(pramanaSize);
  };

  const update = (time: number, camera: THREE.Camera, visible: boolean) => {
    if (!visible || !masterGroup.visible) {
      masterGroup.visible = false;
      return;
    }
    masterGroup.visible = true;

    // Billboard the concentric 2D rings directly to camera orientation
    ringsBillboardGroup.quaternion.copy(camera.quaternion);

    // Subtle continuous rotation of wireframe holographic spheres
    wireframeSpheresGroup.rotation.y = time * 0.35;
    wireframeSpheresGroup.rotation.x = Math.sin(time * 0.2) * 0.15;

    // Emissive harmonic pulsation
    const pulse = Math.sin(time * 3.2);

    units.forEach((u, idx) => {
      const isHighlighted = activeTierLevel === idx || activeTierLevel === -1;
      const highlightMultiplier = activeTierLevel === idx ? 1.5 + 0.35 * pulse : 1.0;
      const opacity = Math.min(0.95, u.tier.baseOpacity * (isHighlighted ? highlightMultiplier : 0.4));

      u.ringMat.opacity = opacity;
      u.sphereMat.opacity = opacity * 0.5;

      // Scale pulse on highlighted tier
      if (activeTierLevel === idx) {
        const s = 1.0 + 0.03 * Math.sin(time * 4.0);
        u.ringMesh.scale.set(s, s, s);
      } else {
        u.ringMesh.scale.set(1, 1, 1);
      }
    });

    // Center focal point breathing pulse
    centerMarker.scale.setScalar(1.0 + 0.25 * Math.sin(time * 5.0));
  };

  const dispose = () => {
    units.forEach((u) => {
      u.ringMesh.geometry.dispose();
      u.ringMat.dispose();
      u.sphereMesh.geometry.dispose();
      u.sphereMat.dispose();
    });
    centerPointGeo.dispose();
    centerPointMat.dispose();
  };

  return {
    group: masterGroup,
    setTarget,
    update,
    dispose
  };
}
