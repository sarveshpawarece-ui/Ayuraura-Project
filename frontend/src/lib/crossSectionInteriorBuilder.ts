// ============================================================================
// AYURSETU PROCEDURAL CROSS-SECTIONAL INTERIOR ANATOMY BUILDER
// Generates Photorealistic Cut Surfaces, Lumens, Chambers & Histology Layers
// Symmetrical Bisection Co-registered with Left & Right Cut Planes (X = 0)
// WITH REAL-TIME PHYSIOLOGICAL WORKING FUNCTION ANIMATIONS IN SPLIT-VIEW
// ============================================================================

import * as THREE from "three";

export interface InteriorLayerMeshMeta {
  id: string;
  name: string;
  pinId: string;
  systemId: string;
  colorHex: string;
  depth: number;
}

export interface PhysiologicalState {
  heartRateBPM: number;            // 40 - 180 BPM
  respirationRateRPM: number;      // 8 - 35 RPM
  gastricPH: number;               // 1.5 - 7.0
  peristalticSpeed: number;        // 0.5 - 3.0x
  muscleContraction: number;       // 0.0 - 1.0 (0% - 100%)
  jointArticulationAngle: number;  // 0 - 90 deg
  boneDensity?: number;            // 0.5 - 1.5
  alveolarDiffusionActive: boolean;// true/false
  actionPotentialRate?: number;    // 1.0 - 5.0 Hz
  cardiacPhaseStage?: "auto" | "systole" | "diastole";
  bloodVesselLayerInspector?: "all" | "intima" | "media" | "adventitia";
  isPaused: boolean;
}

export interface CrossSectionResult {
  group: THREE.Group;
  layers: THREE.Mesh[];
  update?: (time: number, delta: number, state: PhysiologicalState) => void;
  dispose: () => void;
}

// Helper to create double-sided PBR material for interior cut faces
function createInteriorMaterial(
  colorHex: string,
  roughness = 0.65,
  metalness = 0.1,
  clippingPlane?: THREE.Plane
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness,
    metalness,
    side: THREE.DoubleSide,
    clipShadows: true
  });
  if (clippingPlane) {
    mat.clippingPlanes = [clippingPlane];
  }
  return mat;
}

/**
 * Procedurally builds symmetrical interior cross-sectional structures
 * for a specific anatomical system along the sagittal cut plane (X = 0).
 * Includes real-time working physiological function simulation inside split-view.
 */
export function buildSystemCrossSection(
  systemId: string,
  isLeftHalf: boolean,
  clippingPlane?: THREE.Plane,
  modelSex: "male" | "female" = "male"
): CrossSectionResult {
  const group = new THREE.Group();
  group.name = `CrossSection_${systemId}_${isLeftHalf ? "Left" : "Right"}`;

  const layers: THREE.Mesh[] = [];
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  // Local offset: Left half faces toward +X; Right half faces toward -X
  const normalDir = isLeftHalf ? 1 : -1;
  const cutFaceX = 0.0005 * normalDir;

  let updateCallback: ((time: number, delta: number, state: PhysiologicalState) => void) | undefined;

  switch (systemId) {
    // ------------------------------------------------------------------------
    // 01_SKELETAL: Femoral & Cranial Cross-Sections (Cortical + Cancellous + Marrow + Haversian)
    // ------------------------------------------------------------------------
    case "skeletal": {
      // 1. Outer Compact Cortical Bone Rim (Femur Shaft: Y: 0.40 to 0.75)
      const cortexGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.36, 32, 1, false, 0, Math.PI);
      const cortexMat = createInteriorMaterial("#EFE8DB", 0.42, 0.05, clippingPlane);
      cortexMat.emissive = new THREE.Color("#2A241A");
      cortexMat.emissiveIntensity = 0.12;
      const cortexMesh = new THREE.Mesh(cortexGeo, cortexMat);
      cortexMesh.position.set(cutFaceX, 0.60, 0.02);
      cortexMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      cortexMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cortical_bone_osteon",
        name: "Compact Cortical Bone (Haversian Lamellae)",
        systemId: "skeletal"
      };
      group.add(cortexMesh);
      layers.push(cortexMesh);
      geometries.push(cortexGeo);
      materials.push(cortexMat);

      // 2. Longitudinal Haversian Canals with Volkmann's Connecting Channels
      const haversianGroup = new THREE.Group();
      haversianGroup.position.set(cutFaceX, 0.60, 0.02);
      const canalCount = 6;
      for (let c = 0; c < canalCount; c++) {
        const canalAngle = (c / (canalCount - 1)) * Math.PI;
        const canalR = 0.018;
        const canalX = Math.cos(canalAngle) * canalR * normalDir;
        const canalZ = Math.sin(canalAngle) * canalR;
        const canalGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 0.34, 8);
        const canalMat = createInteriorMaterial("#F59E0B", 0.3, 0.1, clippingPlane);
        canalMat.emissive = new THREE.Color("#D97706");
        canalMat.emissiveIntensity = 0.3;
        const canalMesh = new THREE.Mesh(canalGeo, canalMat);
        canalMesh.position.set(canalX, 0, canalZ);
        haversianGroup.add(canalMesh);
        geometries.push(canalGeo);
        materials.push(canalMat);
      }
      group.add(haversianGroup);

      // 3. Spongy Cancellous Bone Network (Porous Trabeculae: #D8CBB5)
      const spongyGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.35, 32, 1, false, 0, Math.PI);
      const spongyMat = createInteriorMaterial("#D8CBB5", 0.85, 0.0, clippingPlane);
      const spongyMesh = new THREE.Mesh(spongyGeo, spongyMat);
      spongyMesh.position.set(cutFaceX, 0.60, 0.02);
      spongyMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      spongyMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cancellous_bone_marrow",
        name: "Cancellous Trabecular Honeycomb Matrix",
        systemId: "skeletal"
      };
      group.add(spongyMesh);
      layers.push(spongyMesh);
      geometries.push(spongyGeo);
      materials.push(spongyMat);

      // 4. Central Medullary Cavity with Red/Yellow Bone Marrow (#A83232)
      const marrowGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.33, 24, 1, false, 0, Math.PI);
      const marrowMat = createInteriorMaterial("#A83232", 0.55, 0.15, clippingPlane);
      marrowMat.emissive = new THREE.Color("#5A1212");
      marrowMat.emissiveIntensity = 0.25;
      const marrowMesh = new THREE.Mesh(marrowGeo, marrowMat);
      marrowMesh.position.set(cutFaceX, 0.60, 0.02);
      marrowMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      marrowMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cancellous_bone_marrow",
        name: "Hematopoietic Medullary Bone Marrow Cavity",
        systemId: "skeletal"
      };
      group.add(marrowMesh);
      layers.push(marrowMesh);
      geometries.push(marrowGeo);
      materials.push(marrowMat);

      // 5. Cranial Calvaria Diploe Cross-Section (Y: 1.55 to 1.70)
      const skullCutGeo = new THREE.SphereGeometry(0.092, 32, 16, 0, Math.PI, 0, Math.PI * 0.5);
      const skullCutMat = createInteriorMaterial("#EFE8DB", 0.5, 0.05, clippingPlane);
      const skullMesh = new THREE.Mesh(skullCutGeo, skullCutMat);
      skullMesh.position.set(cutFaceX, 1.62, 0.02);
      skullMesh.rotation.y = isLeftHalf ? 0 : Math.PI;
      skullMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cortical_bone_osteon",
        name: "Cranial Diploe, Outer & Inner Tables",
        systemId: "skeletal"
      };
      group.add(skullMesh);
      layers.push(skullMesh);
      geometries.push(skullCutGeo);
      materials.push(skullCutMat);

      // 6. Knee Articulation Joint Pivot
      const jointPivot = new THREE.Group();
      jointPivot.position.set(cutFaceX, 0.45, 0.02);
      const tibiaStubGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.18, 24, 1, false, 0, Math.PI);
      const tibiaStubMat = createInteriorMaterial("#EAE3D2", 0.5, 0.05, clippingPlane);
      const tibiaStubMesh = new THREE.Mesh(tibiaStubGeo, tibiaStubMat);
      tibiaStubMesh.position.set(0, -0.09, 0);
      tibiaStubMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      jointPivot.add(tibiaStubMesh);
      group.add(jointPivot);
      geometries.push(tibiaStubGeo);
      materials.push(tibiaStubMat);

      updateCallback = (_time, _delta, state) => {
        // Joint articulation response
        const rad = (state.jointArticulationAngle * Math.PI) / 180;
        jointPivot.rotation.x = -rad;

        // Bone density visual response on trabecular spongy layer
        if (state.boneDensity !== undefined) {
          spongyMat.roughness = THREE.MathUtils.clamp(0.95 - (state.boneDensity - 1.0) * 0.3, 0.3, 1.0);
          spongyMat.opacity = THREE.MathUtils.clamp(0.7 + state.boneDensity * 0.3, 0.5, 1.0);
        }
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 02_CARDIOVASCULAR: 4-Chamber Heart, Septum, Fossa Ovalis, Papillary Muscles,
    // Chordae Tendineae & Mitral/Tricuspid/Aortic Valves (72 BPM Sync)
    // ------------------------------------------------------------------------
    case "cardiovascular": {
      // 1. Left & Right Ventricles and Thick Myocardial Wall (Y: 1.21 to 1.28)
      // Left Ventricular wall is ~3x thicker than Right Ventricle
      const myoGeo = new THREE.SphereGeometry(0.058, 32, 24, 0, Math.PI);
      const myoMat = createInteriorMaterial("#881337", 0.55, 0.15, clippingPlane);
      myoMat.emissive = new THREE.Color("#4C0519");
      myoMat.emissiveIntensity = 0.22;
      const myoMesh = new THREE.Mesh(myoGeo, myoMat);
      myoMesh.position.set(cutFaceX - 0.015, 1.25, 0.05);
      myoMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      myoMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "myocardial_wall",
        name: isLeftHalf ? "Left Ventricle (Thick Myocardium & Trabeculae Carneae)" : "Right Ventricle (Crescentic Myocardium)",
        systemId: "cardiovascular"
      };
      group.add(myoMesh);
      layers.push(myoMesh);
      geometries.push(myoGeo);
      materials.push(myoMat);

      // 2. Left & Right Atria (Superior thin-walled chambers Y: 1.29 to 1.35)
      const atriumGeo = new THREE.SphereGeometry(0.040, 24, 18, 0, Math.PI);
      const atriumMat = createInteriorMaterial("#9F1239", 0.6, 0.1, clippingPlane);
      const atriumMesh = new THREE.Mesh(atriumGeo, atriumMat);
      atriumMesh.position.set(cutFaceX - 0.012, 1.31, 0.035);
      atriumMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      atriumMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "myocardial_wall",
        name: isLeftHalf ? "Left Atrium (Pectinate Muscles & Pulmonary Inlets)" : "Right Atrium (Fossa Ovalis & Caval Inlets)",
        systemId: "cardiovascular"
      };
      group.add(atriumMesh);
      layers.push(atriumMesh);
      geometries.push(atriumGeo);
      materials.push(atriumMat);

      // 3. Interventricular Septum Core (#BE123C)
      const septumGeo = new THREE.BoxGeometry(0.010, 0.070, 0.048);
      const septumMat = createInteriorMaterial("#BE123C", 0.52, 0.1, clippingPlane);
      const septumMesh = new THREE.Mesh(septumGeo, septumMat);
      septumMesh.position.set(cutFaceX, 1.25, 0.05);
      septumMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "interventricular_septum",
        name: "Interventricular Septum & Atrioventricular Conduction Bundle",
        systemId: "cardiovascular"
      };
      group.add(septumMesh);
      layers.push(septumMesh);
      geometries.push(septumGeo);
      materials.push(septumMat);

      // 4. Fossa Ovalis (Interatrial Septum Oval Depression)
      const fossaGeo = new THREE.TorusGeometry(0.009, 0.002, 12, 24);
      const fossaMat = createInteriorMaterial("#FDA4AF", 0.45, 0.05, clippingPlane);
      const fossaMesh = new THREE.Mesh(fossaGeo, fossaMat);
      fossaMesh.position.set(cutFaceX, 1.315, 0.04);
      fossaMesh.rotation.y = Math.PI * 0.5;
      fossaMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "interventricular_septum",
        name: "Fossa Ovalis & Limbus Fossae Ovalis (Interatrial Septum)",
        systemId: "cardiovascular"
      };
      group.add(fossaMesh);
      layers.push(fossaMesh);
      geometries.push(fossaGeo);
      materials.push(fossaMat);

      // 5. Papillary Muscles (Ventricular Myocardial Cones)
      const papillaryGroup = new THREE.Group();
      const papGeo = new THREE.ConeGeometry(0.005, 0.018, 12);
      const papMat = createInteriorMaterial("#9F1239", 0.5, 0.1, clippingPlane);
      
      const papMesh1 = new THREE.Mesh(papGeo, papMat);
      papMesh1.position.set(cutFaceX - 0.02, 1.225, 0.06);
      papMesh1.rotation.z = isLeftHalf ? -0.2 : 0.2;
      papillaryGroup.add(papMesh1);

      const papMesh2 = new THREE.Mesh(papGeo, papMat);
      papMesh2.position.set(cutFaceX - 0.025, 1.228, 0.038);
      papMesh2.rotation.z = isLeftHalf ? -0.15 : 0.15;
      papillaryGroup.add(papMesh2);

      group.add(papillaryGroup);
      geometries.push(papGeo);
      materials.push(papMat);

      // 6. Chordae Tendineae ("Heart Strings" Fibrous Cords)
      const chordaeGroup = new THREE.Group();
      const chordaeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color("#FFF1F2"),
        transparent: true,
        opacity: 0.9
      });
      if (clippingPlane) chordaeMat.clippingPlanes = [clippingPlane];

      for (let ch = 0; ch < 5; ch++) {
        const lineGeo = new THREE.BufferGeometry();
        const yStart = 1.235;
        const yEnd = 1.272;
        const xOffset = cutFaceX - (0.014 + ch * 0.003);
        const zOffset = 0.042 + (ch - 2) * 0.006;
        const pts = [
          new THREE.Vector3(xOffset, yStart, zOffset),
          new THREE.Vector3(xOffset + (Math.random() - 0.5) * 0.003, (yStart + yEnd) * 0.5, zOffset),
          new THREE.Vector3(cutFaceX - 0.01, yEnd, 0.045)
        ];
        lineGeo.setFromPoints(pts);
        const line = new THREE.Line(lineGeo, chordaeMat);
        chordaeGroup.add(line);
        geometries.push(lineGeo);
      }
      group.add(chordaeGroup);
      materials.push(chordaeMat);

      // 7. Active Atrioventricular Valve Flaps (Mitral on Left / Tricuspid on Right)
      const valveRingGeo = new THREE.TorusGeometry(0.018, 0.0035, 16, 32, Math.PI);
      const valveRingMat = createInteriorMaterial("#FCA5A5", 0.35, 0.15, clippingPlane);
      const valveRingMesh = new THREE.Mesh(valveRingGeo, valveRingMat);
      valveRingMesh.position.set(cutFaceX - 0.01, 1.278, 0.045);
      valveRingMesh.rotation.x = Math.PI * 0.5;
      valveRingMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cardiac_valves",
        name: isLeftHalf ? "Bicuspid (Mitral) Valve Annulus & Cusps" : "Tricuspid Valve Annulus & Cusps",
        systemId: "cardiovascular"
      };
      group.add(valveRingMesh);
      layers.push(valveRingMesh);
      geometries.push(valveRingGeo);
      materials.push(valveRingMat);

      // Valve leaflet flaps with rotational hinge pivot
      const valvePivot = new THREE.Group();
      valvePivot.position.set(cutFaceX - 0.01, 1.275, 0.045);
      const leafletGeo = new THREE.PlaneGeometry(0.016, 0.018);
      const leafletMat = createInteriorMaterial("#FFE4E6", 0.3, 0.1, clippingPlane);
      leafletMat.transparent = true;
      leafletMat.opacity = 0.95;
      const leafletMesh = new THREE.Mesh(leafletGeo, leafletMat);
      leafletMesh.position.set(0, -0.009, 0);
      valvePivot.add(leafletMesh);
      group.add(valvePivot);
      geometries.push(leafletGeo);
      materials.push(leafletMat);

      // 8. Aortic Semilunar Valve (3 Pocket Cusps)
      const aorticGroup = new THREE.Group();
      aorticGroup.position.set(cutFaceX - 0.008, 1.33, 0.04);
      const aorticCuspGeo = new THREE.SphereGeometry(0.008, 16, 12, 0, Math.PI * 0.65);
      const aorticCuspMat = createInteriorMaterial("#FECDD3", 0.35, 0.1, clippingPlane);
      aorticCuspMat.transparent = true;
      aorticCuspMat.opacity = 0.92;
      const cusp1 = new THREE.Mesh(aorticCuspGeo, aorticCuspMat);
      cusp1.rotation.x = Math.PI * 0.5;
      aorticGroup.add(cusp1);
      group.add(aorticGroup);
      geometries.push(aorticCuspGeo);
      materials.push(aorticCuspMat);

      // 9. 3-Layer Blood Vessel Cross-Section (Tunica Intima, Media, Adventitia)
      const vesselGroup = new THREE.Group();
      vesselGroup.position.set(cutFaceX - 0.005, 1.36, 0.03);

      // Tunica Intima (Inner endothelial lumen: radius 0.007)
      const intimaGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.05, 24, 1, false, 0, Math.PI);
      const intimaMat = createInteriorMaterial("#FECDD3", 0.3, 0.2, clippingPlane);
      const intimaMesh = new THREE.Mesh(intimaGeo, intimaMat);
      intimaMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      vesselGroup.add(intimaMesh);
      geometries.push(intimaGeo);
      materials.push(intimaMat);

      // Tunica Media (Middle muscular/elastic layer: radius 0.011)
      const mediaGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.048, 24, 1, false, 0, Math.PI);
      const mediaMat = createInteriorMaterial("#991B1B", 0.6, 0.1, clippingPlane);
      const mediaMesh = new THREE.Mesh(mediaGeo, mediaMat);
      mediaMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      vesselGroup.add(mediaMesh);
      geometries.push(mediaGeo);
      materials.push(mediaMat);

      // Tunica Adventitia (Outer collagenous sheath: radius 0.014)
      const adventitiaGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.046, 24, 1, false, 0, Math.PI);
      const adventitiaMat = createInteriorMaterial("#E2E8F0", 0.5, 0.05, clippingPlane);
      const adventitiaMesh = new THREE.Mesh(adventitiaGeo, adventitiaMat);
      adventitiaMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      vesselGroup.add(adventitiaMesh);
      group.add(vesselGroup);
      geometries.push(adventitiaGeo);
      materials.push(adventitiaMat);

      // 10. Dual-Color Real-Time Blood Particle Streams
      // Left side: Oxygenated arterial red (#EF4444)
      // Right side: Deoxygenated venous cyan/blue (#3B82F6)
      const pCount = 80;
      const bloodGeo = new THREE.BufferGeometry();
      const bloodPos = new Float32Array(pCount * 3);
      const bloodCols = new Float32Array(pCount * 3);
      const bloodSpeeds = new Float32Array(pCount);

      const streamColor = isLeftHalf ? new THREE.Color("#EF4444") : new THREE.Color("#3B82F6");

      for (let i = 0; i < pCount; i++) {
        const t = Math.random();
        bloodPos[i * 3] = cutFaceX + (Math.random() - 0.5) * 0.016;
        bloodPos[i * 3 + 1] = 1.21 + t * 0.14;
        bloodPos[i * 3 + 2] = 0.03 + (Math.random() - 0.5) * 0.026;

        const col = streamColor.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.15);
        bloodCols[i * 3] = col.r;
        bloodCols[i * 3 + 1] = col.g;
        bloodCols[i * 3 + 2] = col.b;

        bloodSpeeds[i] = 0.6 + Math.random() * 0.8;
      }

      bloodGeo.setAttribute("position", new THREE.BufferAttribute(bloodPos, 3));
      bloodGeo.setAttribute("color", new THREE.BufferAttribute(bloodCols, 3));

      const bloodMat = new THREE.PointsMaterial({
        size: 0.0035,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        depthWrite: false
      });
      if (clippingPlane) bloodMat.clippingPlanes = [clippingPlane];

      const bloodPoints = new THREE.Points(bloodGeo, bloodMat);
      group.add(bloodPoints);
      geometries.push(bloodGeo);
      materials.push(bloodMat);

      updateCallback = (time, delta, state) => {
        if (state.isPaused) return;

        const bpmFreq = (state.heartRateBPM / 60) * Math.PI * 2;
        let systolePhase = Math.sin(time * bpmFreq);

        if (state.cardiacPhaseStage === "systole") {
          systolePhase = 1.0;
        } else if (state.cardiacPhaseStage === "diastole") {
          systolePhase = -1.0;
        }

        // 1. Coordinated Myocardium Chamber Contraction / Systole (72 BPM)
        const heartPulse = 1.0 + 0.08 * Math.max(0, systolePhase);
        myoMesh.scale.set(heartPulse, heartPulse, heartPulse);

        // 2. Active Mitral / Tricuspid Valve Flap Motion & Papillary Tension
        // Diastole: Valve opens to allow ventricular filling (-42 deg)
        // Systole: Valve snaps shut against backpressure (0 deg)
        const isSystolicSnap = systolePhase > 0.08;
        const targetValveAngle = isSystolicSnap ? 0.02 : -0.74;
        valvePivot.rotation.z = THREE.MathUtils.lerp(valvePivot.rotation.z, targetValveAngle, 0.28);

        // Aortic valve opens when AV valve snaps shut
        const targetAorticAngle = isSystolicSnap ? 0.65 : 0.05;
        aorticGroup.rotation.y = THREE.MathUtils.lerp(aorticGroup.rotation.y, targetAorticAngle, 0.25);

        // Papillary muscle contraction tension
        papillaryGroup.scale.y = isSystolicSnap ? 0.90 : 1.05;

        // 3. Radial Vessel Wall Pulsation (Tunica Media Elastic Recoil)
        const vesselPulse = 1.0 + 0.08 * (0.5 + 0.5 * Math.sin(time * bpmFreq));
        vesselGroup.scale.set(vesselPulse, 1.0, vesselPulse);

        // Blood Vessel Layer Inspector visibility filter
        if (state.bloodVesselLayerInspector) {
          const filter = state.bloodVesselLayerInspector;
          intimaMesh.visible = filter === "all" || filter === "intima";
          mediaMesh.visible = filter === "all" || filter === "media";
          adventitiaMesh.visible = filter === "all" || filter === "adventitia";
        }

        // 4. Dual-Color Blood Particle Dynamics
        const posAttr = bloodGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const speedMultiplier = (state.heartRateBPM / 72) * delta * 0.10;

        for (let i = 0; i < pCount; i++) {
          arr[i * 3 + 1] -= bloodSpeeds[i] * speedMultiplier;
          if (arr[i * 3 + 1] < 1.21) {
            arr[i * 3 + 1] = 1.35;
            arr[i * 3] = cutFaceX + (Math.random() - 0.5) * 0.016;
          }
        }
        posAttr.needsUpdate = true;
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 03_NERVOUS: Sagittal Neocortex, Ventricle & Bioelectric Action Potential Pulses
    // ------------------------------------------------------------------------
    case "nervous": {
      // 1. Neocortical Grey Matter Neuropil (#94A3B8)
      const cortexGeo = new THREE.SphereGeometry(0.075, 32, 24, 0, Math.PI);
      const cortexMat = createInteriorMaterial("#94A3B8", 0.75, 0.05, clippingPlane);
      const cortexMesh = new THREE.Mesh(cortexGeo, cortexMat);
      cortexMesh.position.set(cutFaceX, 1.60, 0.02);
      cortexMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      cortexMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cerebral_cortex_ventricles",
        name: "Neocortical Grey Matter (Neuronal Somata)",
        systemId: "nervous"
      };
      group.add(cortexMesh);
      layers.push(cortexMesh);
      geometries.push(cortexGeo);
      materials.push(cortexMat);

      // 2. Inner White Matter Axon Tracts (Arbor Vitae: #F1F5F9)
      const whiteMatterGeo = new THREE.SphereGeometry(0.052, 24, 18, 0, Math.PI);
      const whiteMatterMat = createInteriorMaterial("#F1F5F9", 0.6, 0.1, clippingPlane);
      const whiteMatterMesh = new THREE.Mesh(whiteMatterGeo, whiteMatterMat);
      whiteMatterMesh.position.set(cutFaceX, 1.60, 0.02);
      whiteMatterMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      whiteMatterMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cerebral_cortex_ventricles",
        name: "Myelinated White Matter Tracts & Corpus Callosum",
        systemId: "nervous"
      };
      group.add(whiteMatterMesh);
      layers.push(whiteMatterMesh);
      geometries.push(whiteMatterGeo);
      materials.push(whiteMatterMat);

      // 3. Lateral Ventricle Cavity & Ependyma (#38BDF8)
      const csfGeo = new THREE.TorusGeometry(0.024, 0.005, 12, 24, Math.PI);
      const csfMat = createInteriorMaterial("#38BDF8", 0.2, 0.3, clippingPlane);
      csfMat.emissive = new THREE.Color("#0284C7");
      csfMat.emissiveIntensity = 0.35;
      const csfMesh = new THREE.Mesh(csfGeo, csfMat);
      csfMesh.position.set(cutFaceX, 1.60, 0.02);
      csfMesh.rotation.z = Math.PI * 0.25;
      csfMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "cerebral_cortex_ventricles",
        name: "Lateral Ventricle Cavity & Ependyma",
        systemId: "nervous"
      };
      group.add(csfMesh);
      layers.push(csfMesh);
      geometries.push(csfGeo);
      materials.push(csfMat);

      // 4. Bioelectric Action Potential Pulse Stream (Axonal Synaptic Flashes)
      const pulseCount = 50;
      const pulseGeo = new THREE.BufferGeometry();
      const pulsePos = new Float32Array(pulseCount * 3);
      const pulseCols = new Float32Array(pulseCount * 3);

      const goldCol = new THREE.Color("#F59E0B");
      const cyanCol = new THREE.Color("#38BDF8");

      for (let i = 0; i < pulseCount; i++) {
        pulsePos[i * 3] = cutFaceX + (Math.random() - 0.5) * 0.03;
        pulsePos[i * 3 + 1] = 1.55 + Math.random() * 0.12;
        pulsePos[i * 3 + 2] = (Math.random() - 0.5) * 0.04;

        const col = Math.random() > 0.4 ? cyanCol : goldCol;
        pulseCols[i * 3] = col.r;
        pulseCols[i * 3 + 1] = col.g;
        pulseCols[i * 3 + 2] = col.b;
      }

      pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
      pulseGeo.setAttribute("color", new THREE.BufferAttribute(pulseCols, 3));

      const pulseMat = new THREE.PointsMaterial({
        size: 0.004,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      if (clippingPlane) pulseMat.clippingPlanes = [clippingPlane];

      const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
      group.add(pulsePoints);
      geometries.push(pulseGeo);
      materials.push(pulseMat);

      updateCallback = (time, delta, state) => {
        if (state.isPaused) return;

        const rate = (state.actionPotentialRate || 2.5) * 4.0;
        csfMat.emissiveIntensity = 0.35 + 0.3 * Math.sin(time * rate);

        const posAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < pulseCount; i++) {
          arr[i * 3 + 1] -= delta * 0.06 * rate;
          if (arr[i * 3 + 1] < 1.54) {
            arr[i * 3 + 1] = 1.67;
            arr[i * 3] = cutFaceX + (Math.random() - 0.5) * 0.03;
          }
        }
        posAttr.needsUpdate = true;
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 04_DIGESTIVE: Multilayer Gastric Wall, 3D Rugae Folds, Gastric Pits, Sphincters, Villi
    // ------------------------------------------------------------------------
    case "digestive": {
      // 1. Outer Serosa & Muscularis Externa (Y: 1.05 to 1.15)
      const stomachGeo = new THREE.TorusGeometry(0.045, 0.025, 24, 32, Math.PI);
      const stomachMat = createInteriorMaterial("#E2E8F0", 0.65, 0.05, clippingPlane);
      const stomachMesh = new THREE.Mesh(stomachGeo, stomachMat);
      stomachMesh.position.set(cutFaceX + 0.02, 1.08, 0.05);
      stomachMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "gastric_rugae",
        name: "Gastric Serosa & Muscularis Externa (Longitudinal, Circular & Oblique)",
        systemId: "digestive"
      };
      group.add(stomachMesh);
      layers.push(stomachMesh);
      geometries.push(stomachGeo);
      materials.push(stomachMat);

      // 2. Inner Mucosa with Deep Sinusoidal 3D Rugae Folds (#F87171)
      const rugaeGroup = new THREE.Group();
      rugaeGroup.position.set(cutFaceX + 0.02, 1.08, 0.05);
      const rugaeCount = 5;
      const rugaeMat = createInteriorMaterial("#F87171", 0.48, 0.1, clippingPlane);
      rugaeMat.emissive = new THREE.Color("#991B1B");
      rugaeMat.emissiveIntensity = 0.22;

      for (let rf = 0; rf < rugaeCount; rf++) {
        const radius = 0.032 + rf * 0.003;
        const tube = 0.004 + (rf % 2) * 0.002;
        const rGeo = new THREE.TorusGeometry(radius, tube, 16, 32, Math.PI);
        const rMesh = new THREE.Mesh(rGeo, rugaeMat);
        rMesh.position.set(0, (rf - 2) * 0.003, (rf % 2) * 0.002);
        rugaeGroup.add(rMesh);
        geometries.push(rGeo);
      }
      group.add(rugaeGroup);
      materials.push(rugaeMat);

      // 3. Gastric Pits (Foveolae Gastricae Micro-Indentations)
      const pitsGroup = new THREE.Group();
      pitsGroup.position.set(cutFaceX + 0.025, 1.08, 0.05);
      const pitGeo = new THREE.CylinderGeometry(0.0012, 0.0006, 0.006, 8);
      const pitMat = createInteriorMaterial("#7F1D1D", 0.7, 0.05, clippingPlane);
      for (let p = 0; p < 8; p++) {
        const pitMesh = new THREE.Mesh(pitGeo, pitMat);
        const ang = (p / 7) * Math.PI;
        pitMesh.position.set(Math.cos(ang) * 0.035, Math.sin(ang) * 0.02, 0.008);
        pitsGroup.add(pitMesh);
      }
      group.add(pitsGroup);
      geometries.push(pitGeo);
      materials.push(pitMat);

      // 4. Lower Esophageal Sphincter (LES) & Cardiac Orifice (Y: 1.15)
      const lesGeo = new THREE.TorusGeometry(0.012, 0.003, 16, 24, Math.PI);
      const lesMat = createInteriorMaterial("#FDA4AF", 0.5, 0.1, clippingPlane);
      const lesMesh = new THREE.Mesh(lesGeo, lesMat);
      lesMesh.position.set(cutFaceX + 0.015, 1.14, 0.045);
      lesMesh.rotation.x = Math.PI * 0.5;
      lesMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "gastric_rugae",
        name: "Lower Esophageal Sphincter (LES) & Z-line Transition",
        systemId: "digestive"
      };
      group.add(lesMesh);
      layers.push(lesMesh);
      geometries.push(lesGeo);
      materials.push(lesMat);

      // 5. Pylorus & Pyloric Sphincter Valve (Y: 1.02)
      const pylorusGeo = new THREE.TorusGeometry(0.011, 0.0035, 16, 24, Math.PI);
      const pylorusMat = createInteriorMaterial("#F43F5E", 0.52, 0.1, clippingPlane);
      const pylorusMesh = new THREE.Mesh(pylorusGeo, pylorusMat);
      pylorusMesh.position.set(cutFaceX + 0.035, 1.03, 0.055);
      pylorusMesh.rotation.x = Math.PI * 0.45;
      pylorusMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "gastric_rugae",
        name: "Pyloric Sphincter Muscular Constrictor & Duodenal Orifice",
        systemId: "digestive"
      };
      group.add(pylorusMesh);
      layers.push(pylorusMesh);
      geometries.push(pylorusGeo);
      materials.push(pylorusMat);

      // 6. Real-Time Peristaltic Circular Smooth Muscle Wave Segments
      const segmentGroup = new THREE.Group();
      segmentGroup.position.set(cutFaceX, 0.95, 0.05);
      const ringCount = 8;
      const ringMeshes: THREE.Mesh[] = [];

      for (let r = 0; r < ringCount; r++) {
        const ringGeo = new THREE.TorusGeometry(0.018, 0.004, 16, 24, Math.PI);
        const ringMat = createInteriorMaterial("#FCA5A5", 0.55, 0.1, clippingPlane);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(0, (r - ringCount / 2) * 0.014, 0);
        ringMesh.rotation.x = Math.PI * 0.5;
        segmentGroup.add(ringMesh);
        ringMeshes.push(ringMesh);
        geometries.push(ringGeo);
        materials.push(ringMat);
      }
      group.add(segmentGroup);

      // 7. Intestinal Lumen & Absorptive Villi Structure (#FCA5A5)
      const villiGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 24, 1, false, 0, Math.PI);
      const villiMat = createInteriorMaterial("#FCA5A5", 0.7, 0.05, clippingPlane);
      const villiMesh = new THREE.Mesh(villiGeo, villiMat);
      villiMesh.position.set(cutFaceX, 0.95, 0.05);
      villiMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      villiMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "intestinal_mucosa_submucosa",
        name: "Intestinal Villi Brush Border & Enteric Meissner/Auerbach Plexus",
        systemId: "digestive"
      };
      group.add(villiMesh);
      layers.push(villiMesh);
      geometries.push(villiGeo);
      materials.push(villiMat);

      updateCallback = (time, _delta, state) => {
        if (state.isPaused) return;

        // Traveling Peristaltic Wave along Intestinal Rings
        const pSpeed = state.peristalticSpeed || 1.0;
        ringMeshes.forEach((mesh, idx) => {
          const wavePhase = time * pSpeed * 3.2 - idx * 0.75;
          const contractionScale = 1.0 - 0.28 * Math.pow(Math.max(0, Math.sin(wavePhase)), 2);
          mesh.scale.set(contractionScale, contractionScale, 1.0);
        });

        // Gastric pH Chemical Shift (Jatharagni)
        const normPH = (state.gastricPH - 1.5) / 5.5; // 0.0 (acidic) to 1.0 (neutral)
        const acidColor = new THREE.Color("#DC2626");
        const neutralColor = new THREE.Color("#F472B6");
        rugaeMat.color.lerpColors(acidColor, neutralColor, normPH);

        const acidEmissive = new THREE.Color("#EA580C");
        const neutralEmissive = new THREE.Color("#4C0519");
        rugaeMat.emissive.lerpColors(acidEmissive, neutralEmissive, normPH);
        rugaeMat.emissiveIntensity = 0.45 - 0.35 * normPH;
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 05_RESPIRATORY: 3-Tier Bronchial Tree, Bronchioles, Alveolar Sac Clusters
    // & Real-Time Ventilation Expansion/Deflation
    // ------------------------------------------------------------------------
    case "respiratory": {
      // 1. Tracheobronchial Cartilage Rings & Primary Mainstem Bronchus
      const bronchusGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 24, 1, false, 0, Math.PI);
      const bronchusMat = createInteriorMaterial("#BAE6FD", 0.45, 0.2, clippingPlane);
      const bronchusMesh = new THREE.Mesh(bronchusGeo, bronchusMat);
      bronchusMesh.position.set(cutFaceX, 1.34, 0.02);
      bronchusMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      bronchusMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "bronchial_lumen",
        name: "Primary Mainstem Bronchus (Hyaline C-Rings & Ciliated Epithelium)",
        systemId: "respiratory"
      };
      group.add(bronchusMesh);
      layers.push(bronchusMesh);
      geometries.push(bronchusGeo);
      materials.push(bronchusMat);

      // 2. 3-Tier Deep Bronchial Tree Arborization (Secondary Lobar & Tertiary Segmental)
      const bronchialTree = new THREE.Group();
      bronchialTree.position.set(cutFaceX - 0.02, 1.30, 0.025);

      // Secondary Lobar Bronchi
      const lobarGeo = new THREE.CylinderGeometry(0.007, 0.010, 0.08, 16, 1, false, 0, Math.PI);
      const lobarMat = createInteriorMaterial("#7DD3FC", 0.48, 0.15, clippingPlane);
      const lobarMesh1 = new THREE.Mesh(lobarGeo, lobarMat);
      lobarMesh1.rotation.z = isLeftHalf ? -0.45 : 0.45;
      bronchialTree.add(lobarMesh1);

      const lobarMesh2 = new THREE.Mesh(lobarGeo, lobarMat);
      lobarMesh2.rotation.z = isLeftHalf ? -0.85 : 0.85;
      lobarMesh2.position.set(0, -0.03, 0);
      bronchialTree.add(lobarMesh2);

      // Tertiary Segmental Bronchi & Bronchiole Network
      const segGeo = new THREE.CylinderGeometry(0.0035, 0.005, 0.05, 12, 1, false, 0, Math.PI);
      const segMat = createInteriorMaterial("#38BDF8", 0.5, 0.1, clippingPlane);
      for (let s = 0; s < 4; s++) {
        const segMesh = new THREE.Mesh(segGeo, segMat);
        const ang = (s / 3) * 0.8 - 0.4;
        segMesh.position.set(isLeftHalf ? -0.02 : 0.02, -0.04 - s * 0.012, (s - 1.5) * 0.008);
        segMesh.rotation.z = isLeftHalf ? -0.5 + ang : 0.5 - ang;
        bronchialTree.add(segMesh);
        geometries.push(segGeo);
      }

      group.add(bronchialTree);
      geometries.push(lobarGeo);
      materials.push(lobarMat);
      materials.push(segMat);

      // 3. Alveolar Sac Clusters (Microscopic Grape-like Alveoli Formations)
      const alveolarClusters = new THREE.Group();
      alveolarClusters.position.set(cutFaceX - 0.04, 1.25, 0.03);
      const sacGeo = new THREE.SphereGeometry(0.006, 12, 8);
      const sacMat = createInteriorMaterial("#FDA4AF", 0.65, 0.05, clippingPlane);
      sacMat.emissive = new THREE.Color("#881337");
      sacMat.emissiveIntensity = 0.18;

      for (let a = 0; a < 14; a++) {
        const sacMesh = new THREE.Mesh(sacGeo, sacMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const rad = 0.025 + Math.random() * 0.025;
        sacMesh.position.set(
          Math.sin(phi) * Math.cos(theta) * rad * 0.8,
          Math.sin(phi) * Math.sin(theta) * rad,
          Math.cos(phi) * rad * 0.7
        );
        alveolarClusters.add(sacMesh);
      }
      group.add(alveolarClusters);
      geometries.push(sacGeo);
      materials.push(sacMat);

      // 4. Pulmonary Alveolar Parenchyma Sponge (#FDA4AF)
      const alveoliGeo = new THREE.SphereGeometry(0.058, 24, 18, 0, Math.PI);
      const alveoliMat = createInteriorMaterial("#FDA4AF", 0.8, 0.05, clippingPlane);
      alveoliMat.emissive = new THREE.Color("#881337");
      alveoliMat.emissiveIntensity = 0.15;
      const alveoliMesh = new THREE.Mesh(alveoliGeo, alveoliMat);
      alveoliMesh.position.set(cutFaceX - 0.04, 1.26, 0.03);
      alveoliMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      alveoliMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "alveolar_sacs",
        name: "Alveolar Sacs, Surfactant Lining & Blood-Air Barrier",
        systemId: "respiratory"
      };
      group.add(alveoliMesh);
      layers.push(alveoliMesh);
      geometries.push(alveoliGeo);
      materials.push(alveoliMat);

      // 5. Dual-Phase Airflow Stream Particles (Inspiration vs Expiration)
      const airCount = 70;
      const airGeo = new THREE.BufferGeometry();
      const airPos = new Float32Array(airCount * 3);
      const airDirections = new Float32Array(airCount);

      for (let i = 0; i < airCount; i++) {
        airPos[i * 3] = cutFaceX + (Math.random() - 0.5) * 0.016;
        airPos[i * 3 + 1] = 1.25 + Math.random() * 0.16;
        airPos[i * 3 + 2] = 0.01 + Math.random() * 0.03;
        airDirections[i] = 0.8 + Math.random() * 0.5;
      }
      airGeo.setAttribute("position", new THREE.BufferAttribute(airPos, 3));

      const airMat = new THREE.PointsMaterial({
        color: new THREE.Color("#E0F2FE"),
        size: 0.0032,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      if (clippingPlane) airMat.clippingPlanes = [clippingPlane];

      const airPoints = new THREE.Points(airGeo, airMat);
      group.add(airPoints);
      geometries.push(airGeo);
      materials.push(airMat);

      updateCallback = (time, delta, state) => {
        if (state.isPaused) return;

        const rpmFreq = (state.respirationRateRPM / 60) * Math.PI * 2;
        const respCycle = Math.sin(time * rpmFreq);
        const isInspiration = respCycle > 0;

        // 1. Bronchial tree & alveolar expansion
        const expansion = 1.0 + 0.07 * Math.max(0, respCycle);
        alveoliMesh.scale.set(expansion, expansion, expansion);
        bronchialTree.scale.set(expansion, expansion, expansion);
        alveolarClusters.scale.set(expansion, expansion, expansion);

        // 2. Alveolar Gas Exchange Color Dynamic
        if (state.alveolarDiffusionActive) {
          const oxygenationNorm = 0.5 + 0.5 * respCycle;
          const venousBlood = new THREE.Color("#4338CA");
          const oxygenatedBlood = new THREE.Color("#EF4444");
          sacMat.emissive.lerpColors(venousBlood, oxygenatedBlood, oxygenationNorm);
          sacMat.emissiveIntensity = 0.2 + 0.28 * oxygenationNorm;
          alveoliMat.emissive.lerpColors(venousBlood, oxygenatedBlood, oxygenationNorm);
          alveoliMat.emissiveIntensity = 0.15 + 0.22 * oxygenationNorm;
        } else {
          sacMat.emissive.set("#881337");
          sacMat.emissiveIntensity = 0.18;
          alveoliMat.emissive.set("#881337");
          alveoliMat.emissiveIntensity = 0.15;
        }

        // 3. Airflow particles streaming down during inspiration, drifting up during expiration
        const posAttr = airGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const flowStep = (isInspiration ? -1 : 1) * delta * 0.08 * (state.respirationRateRPM / 14);

        for (let i = 0; i < airCount; i++) {
          arr[i * 3 + 1] += flowStep * airDirections[i];
          if (arr[i * 3 + 1] < 1.23) arr[i * 3 + 1] = 1.41;
          if (arr[i * 3 + 1] > 1.42) arr[i * 3 + 1] = 1.24;
        }
        posAttr.needsUpdate = true;
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 09_URINARY: Coronal Kidney Cross-Section (Cortex, Medulla Pyramids, Columns of
    // Bertin, Papillae, Calyces & Active Urine Filtration Stream)
    // ------------------------------------------------------------------------
    case "urinary": {
      // 1. Renal Cortex Outer Glomerular Layer (#B45309)
      const cortexGeo = new THREE.SphereGeometry(0.040, 24, 18, 0, Math.PI);
      cortexGeo.scale(0.8, 1.4, 0.7);
      const cortexMat = createInteriorMaterial("#B45309", 0.58, 0.1, clippingPlane);
      const cortexMesh = new THREE.Mesh(cortexGeo, cortexMat);
      cortexMesh.position.set(cutFaceX + 0.06, 1.08, -0.04);
      cortexMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      cortexMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "renal_cortex_pyramids",
        name: "Renal Cortex (Bowman's Capsules & Convoluted Tubules)",
        systemId: "urinary"
      };
      group.add(cortexMesh);
      layers.push(cortexMesh);
      geometries.push(cortexGeo);
      materials.push(cortexMat);

      // 2. Renal Medullary Pyramids (6 Triangular Striated Malpighian Pyramids)
      const pyramidsGroup = new THREE.Group();
      pyramidsGroup.position.set(cutFaceX + 0.06, 1.08, -0.04);
      const pyrGeo = new THREE.ConeGeometry(0.008, 0.022, 16, 1, false, 0, Math.PI);
      const pyrMat = createInteriorMaterial("#78350F", 0.65, 0.05, clippingPlane);
      pyrMat.emissive = new THREE.Color("#451A03");
      pyrMat.emissiveIntensity = 0.25;

      const pyramidCount = 6;
      for (let p = 0; p < pyramidCount; p++) {
        const pMesh = new THREE.Mesh(pyrGeo, pyrMat);
        const yOffset = (p - 2.5) * 0.012;
        pMesh.position.set(0, yOffset, 0.005);
        pMesh.rotation.z = Math.PI * 0.5 * normalDir;
        pyramidsGroup.add(pMesh);
      }
      group.add(pyramidsGroup);
      geometries.push(pyrGeo);
      materials.push(pyrMat);

      // 3. Renal Columns of Bertin (Cortical Infoldings Between Pyramids)
      const columnsGroup = new THREE.Group();
      columnsGroup.position.set(cutFaceX + 0.06, 1.08, -0.04);
      const colGeo = new THREE.BoxGeometry(0.005, 0.006, 0.015);
      const colMat = createInteriorMaterial("#D97706", 0.6, 0.05, clippingPlane);
      for (let c = 0; c < pyramidCount - 1; c++) {
        const cMesh = new THREE.Mesh(colGeo, colMat);
        cMesh.position.set(0, (c - 2.0) * 0.012, 0.008);
        columnsGroup.add(cMesh);
      }
      group.add(columnsGroup);
      geometries.push(colGeo);
      materials.push(colMat);

      // 4. Minor & Major Calyces and Funnel Renal Pelvis (#FEF3C7)
      const pelvisGeo = new THREE.CylinderGeometry(0.006, 0.014, 0.035, 16, 1, false, 0, Math.PI);
      const pelvisMat = createInteriorMaterial("#FEF3C7", 0.42, 0.1, clippingPlane);
      const pelvisMesh = new THREE.Mesh(pelvisGeo, pelvisMat);
      pelvisMesh.position.set(cutFaceX + 0.045, 1.05, -0.04);
      pelvisMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      pelvisMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "renal_cortex_pyramids",
        name: "Renal Pelvis, Major & Minor Calyces",
        systemId: "urinary"
      };
      group.add(pelvisMesh);
      layers.push(pelvisMesh);
      geometries.push(pelvisGeo);
      materials.push(pelvisMat);

      // 5. Active Urine Filtration Stream Particles (Glomerular Filtrate to Pelvis)
      const urineCount = 45;
      const urineGeo = new THREE.BufferGeometry();
      const urinePos = new Float32Array(urineCount * 3);
      for (let u = 0; u < urineCount; u++) {
        urinePos[u * 3] = cutFaceX + 0.055 + (Math.random() - 0.5) * 0.012;
        urinePos[u * 3 + 1] = 1.04 + Math.random() * 0.06;
        urinePos[u * 3 + 2] = -0.04 + (Math.random() - 0.5) * 0.015;
      }
      urineGeo.setAttribute("position", new THREE.BufferAttribute(urinePos, 3));
      const urineMat = new THREE.PointsMaterial({
        color: new THREE.Color("#FDE047"),
        size: 0.0028,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
      if (clippingPlane) urineMat.clippingPlanes = [clippingPlane];
      const urinePoints = new THREE.Points(urineGeo, urineMat);
      group.add(urinePoints);
      geometries.push(urineGeo);
      materials.push(urineMat);

      updateCallback = (_time, delta, state) => {
        if (state.isPaused) return;
        const posAttr = urineGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let u = 0; u < urineCount; u++) {
          arr[u * 3 + 1] -= delta * 0.035;
          if (arr[u * 3 + 1] < 1.03) {
            arr[u * 3 + 1] = 1.10;
            arr[u * 3] = cutFaceX + 0.055 + (Math.random() - 0.5) * 0.012;
          }
        }
        posAttr.needsUpdate = true;
      };
      break;
    }

    // ------------------------------------------------------------------------
    // 10_REPRODUCTIVE: Sex-Specific Histological Architecture
    // Female: Endometrium, Myometrium, Cervical Canal, Ovarian Follicles
    // Male: Testicular Lobules, Seminiferous Tubules, Prostate Glandular Acini
    // ------------------------------------------------------------------------
    case "reproductive": {
      if (modelSex === "female") {
        // Female Uterine Cavity & Stratified Myometrium (Pelvic basin Y: 0.80 to 0.86)
        const myometriumGeo = new THREE.SphereGeometry(0.024, 24, 18, 0, Math.PI);
        const myometriumMat = createInteriorMaterial("#BE185D", 0.55, 0.08, clippingPlane);
        const myometriumMesh = new THREE.Mesh(myometriumGeo, myometriumMat);
        myometriumMesh.position.set(cutFaceX, 0.83, 0.02);
        myometriumMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
        myometriumMesh.userData = {
          isInteriorLayer: true,
          interiorPinId: "uterus_endometrium",
          name: "Uterine Myometrium & Endometrial Cavity",
          systemId: "reproductive"
        };
        group.add(myometriumMesh);
        layers.push(myometriumMesh);
        geometries.push(myometriumGeo);
        materials.push(myometriumMat);

        // Ovarian Follicles Cluster (Lateral Y: 0.84)
        const ovaryGeo = new THREE.SphereGeometry(0.009, 16, 12, 0, Math.PI);
        const ovaryMat = createInteriorMaterial("#F472B6", 0.45, 0.05, clippingPlane);
        const ovaryMesh = new THREE.Mesh(ovaryGeo, ovaryMat);
        ovaryMesh.position.set(cutFaceX + (isLeftHalf ? -0.045 : 0.045), 0.84, 0.01);
        group.add(ovaryMesh);
        geometries.push(ovaryGeo);
        materials.push(ovaryMat);

        // Fallopian Tube (Salpinx & Infundibulum)
        const tubeGeo = new THREE.CylinderGeometry(0.003, 0.005, 0.045, 12);
        const tubeMat = createInteriorMaterial("#EC4899", 0.5, 0.05, clippingPlane);
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.position.set(cutFaceX + (isLeftHalf ? -0.025 : 0.025), 0.85, 0.015);
        tubeMesh.rotation.z = isLeftHalf ? 0.4 : -0.4;
        group.add(tubeMesh);
        geometries.push(tubeGeo);
        materials.push(tubeMat);

        // Female Mammary Glands (Anterior Thoracic Wall: Y 1.25, Z 0.10)
        const mammaryGeo = new THREE.SphereGeometry(0.032, 24, 18, 0, Math.PI);
        const mammaryMat = createInteriorMaterial("#FBCFE8", 0.45, 0.05, clippingPlane);
        const mammaryMesh = new THREE.Mesh(mammaryGeo, mammaryMat);
        mammaryMesh.position.set(cutFaceX + (isLeftHalf ? -0.065 : 0.065), 1.25, 0.10);
        mammaryMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
        mammaryMesh.userData = {
          isInteriorLayer: true,
          interiorPinId: "mammary_glands",
          name: "Mammary Glands (Lactiferous Ducts & Lobules)",
          systemId: "reproductive"
        };
        group.add(mammaryMesh);
        layers.push(mammaryMesh);
        geometries.push(mammaryGeo);
        materials.push(mammaryMat);
      } else {
        // Male Testicular Lobules & Seminiferous Tubules (Y: 0.72)
        const testisGeo = new THREE.SphereGeometry(0.016, 24, 18, 0, Math.PI);
        const testisMat = createInteriorMaterial("#0284C7", 0.5, 0.08, clippingPlane);
        const testisMesh = new THREE.Mesh(testisGeo, testisMat);
        testisMesh.position.set(cutFaceX + (isLeftHalf ? -0.018 : 0.018), 0.73, 0.03);
        testisMesh.userData = {
          isInteriorLayer: true,
          interiorPinId: "testicular_lobules",
          name: "Testicular Lobules, Seminiferous Tubules & Epididymis",
          systemId: "reproductive"
        };
        group.add(testisMesh);
        layers.push(testisMesh);
        geometries.push(testisGeo);
        materials.push(testisMat);

        // Prostate Gland with Urethral Lumen (Y: 0.80)
        const prostateGeo = new THREE.ConeGeometry(0.014, 0.020, 16, 1, false, 0, Math.PI);
        const prostateMat = createInteriorMaterial("#D97706", 0.55, 0.1, clippingPlane);
        const prostateMesh = new THREE.Mesh(prostateGeo, prostateMat);
        prostateMesh.position.set(cutFaceX, 0.80, 0.02);
        group.add(prostateMesh);
        geometries.push(prostateGeo);
        materials.push(prostateMat);

        // Male Seminal Vesicles (Postero-superior to prostate: Y 0.82)
        const vesicleGeo = new THREE.CylinderGeometry(0.005, 0.007, 0.022, 12);
        const vesicleMat = createInteriorMaterial("#F59E0B", 0.5, 0.1, clippingPlane);
        const vesicleMesh = new THREE.Mesh(vesicleGeo, vesicleMat);
        vesicleMesh.position.set(cutFaceX + (isLeftHalf ? -0.012 : 0.012), 0.82, 0.005);
        group.add(vesicleMesh);
        geometries.push(vesicleGeo);
        materials.push(vesicleMat);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // 11_MUSCULAR: Epimysium, Perimysium, Internal Fascicle Bundles,
    // and Microscopic Sliding Filament Sarcomere
    // ------------------------------------------------------------------------
    case "muscular": {
      // 1. Epimysium Investing Sheath (#CBD5E1)
      const epimysiumGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.30, 24, 1, false, 0, Math.PI);
      const epimysiumMat = createInteriorMaterial("#CBD5E1", 0.4, 0.1, clippingPlane);
      const epimysiumMesh = new THREE.Mesh(epimysiumGeo, epimysiumMat);
      epimysiumMesh.position.set(cutFaceX - 0.08, 1.36, -0.05);
      epimysiumMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      epimysiumMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "muscle_epimysium_fascicle",
        name: "Epimysium Investing Sheath & Deep Fascia",
        systemId: "muscular"
      };
      group.add(epimysiumMesh);
      layers.push(epimysiumMesh);
      geometries.push(epimysiumGeo);
      materials.push(epimysiumMat);

      // 2. Perimysium & Multiple Internal Cylindrical Fascicle Bundles
      const fascicleGroup = new THREE.Group();
      fascicleGroup.position.set(cutFaceX - 0.08, 1.36, -0.05);
      const fGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.28, 16, 1, false, 0, Math.PI);
      const fMat = createInteriorMaterial("#B91C1C", 0.62, 0.1, clippingPlane);
      fMat.emissive = new THREE.Color("#450A0A");
      fMat.emissiveIntensity = 0.2;

      for (let fb = 0; fb < 5; fb++) {
        const fMesh = new THREE.Mesh(fGeo, fMat);
        const ang = (fb / 4) * Math.PI;
        fMesh.position.set(Math.cos(ang) * 0.016 * normalDir, 0, Math.sin(ang) * 0.016);
        fMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
        fascicleGroup.add(fMesh);
      }
      group.add(fascicleGroup);
      geometries.push(fGeo);
      materials.push(fMat);

      // 3. Central Muscle Fascicle Bundle Matrix (#B91C1C)
      const fascicleGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.27, 24, 1, false, 0, Math.PI);
      const fascicleMat = createInteriorMaterial("#B91C1C", 0.65, 0.1, clippingPlane);
      fascicleMat.emissive = new THREE.Color("#450A0A");
      fascicleMat.emissiveIntensity = 0.2;
      const fascicleMesh = new THREE.Mesh(fascicleGeo, fascicleMat);
      fascicleMesh.position.set(cutFaceX - 0.08, 1.36, -0.05);
      fascicleMesh.rotation.y = isLeftHalf ? Math.PI * 0.5 : -Math.PI * 0.5;
      fascicleMesh.userData = {
        isInteriorLayer: true,
        interiorPinId: "muscle_fascicle",
        name: "Perimysium & Contractile Muscle Fascicle Bundles",
        systemId: "muscular"
      };
      group.add(fascicleMesh);
      layers.push(fascicleMesh);
      geometries.push(fascicleGeo);
      materials.push(fascicleMat);

      // 4. Microscopic Sarcomere Model: Sliding Actin & Myosin Filaments
      const sarcomereGroup = new THREE.Group();
      sarcomereGroup.position.set(cutFaceX - 0.075, 1.36, -0.04);

      // Central Thick Myosin Filaments (#DC2626)
      const myosinGeo = new THREE.BoxGeometry(0.003, 0.05, 0.003);
      const myosinMat = createInteriorMaterial("#DC2626", 0.4, 0.1, clippingPlane);
      myosinMat.emissive = new THREE.Color("#7F1D1D");
      myosinMat.emissiveIntensity = 0.3;
      const myosinMesh = new THREE.Mesh(myosinGeo, myosinMat);
      sarcomereGroup.add(myosinMesh);
      geometries.push(myosinGeo);
      materials.push(myosinMat);

      // Sliding Thin Actin Filaments (#FBBF24) attached to Z-Discs
      const actinLeftGroup = new THREE.Group();
      const actinRightGroup = new THREE.Group();

      const actinGeo = new THREE.BoxGeometry(0.002, 0.035, 0.002);
      const actinMat = createInteriorMaterial("#FBBF24", 0.5, 0.05, clippingPlane);

      const actinMeshL = new THREE.Mesh(actinGeo, actinMat);
      actinMeshL.position.set(-0.003, 0.02, 0);
      actinLeftGroup.add(actinMeshL);

      const actinMeshR = new THREE.Mesh(actinGeo, actinMat);
      actinMeshR.position.set(0.003, -0.02, 0);
      actinRightGroup.add(actinMeshR);

      sarcomereGroup.add(actinLeftGroup);
      sarcomereGroup.add(actinRightGroup);
      group.add(sarcomereGroup);
      geometries.push(actinGeo);
      materials.push(actinMat);

      updateCallback = (time, _delta, state) => {
        let contraction = state.muscleContraction;
        if (contraction === 0.0 && !state.isPaused) {
          contraction = 0.25 + 0.25 * Math.sin(time * 2.0);
        }

        // Sliding Filament Theory: Actin slides inward toward M-line
        const slideOffset = contraction * 0.012;
        actinLeftGroup.position.y = -slideOffset;
        actinRightGroup.position.y = slideOffset;

        // Muscle belly bulges laterally as it contracts (constant volume principle)
        const bellyBulge = 1.0 + contraction * 0.15;
        fascicleMesh.scale.set(bellyBulge, 1.0 - contraction * 0.08, bellyBulge);
        fascicleGroup.scale.set(bellyBulge, 1.0 - contraction * 0.08, bellyBulge);
      };
      break;
    }

    default:
      break;
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    group,
    layers,
    update: updateCallback,
    dispose
  };
}
