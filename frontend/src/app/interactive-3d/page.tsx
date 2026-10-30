"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCw,
  ZoomIn,
  Layers,
  Activity,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Minus,
  Sliders,
  Heart,
  Wind,
  Zap,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Scissors,
  Flame,
  Droplets,
  Microscope,
  X,
  Play,
  Pause,
  Compass,
  ShieldCheck,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Crosshair,
  Target,
  Radio,
  FileText,
  Globe,
  CircleDot,
  Square,
  Minimize2,
  ChevronUp,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MolecularInspectionViewer from "@/components/interactive-3d/MolecularInspectionViewer";
import AIAnatomyExplainerModal from "@/components/ai/AIAnatomyExplainerModal";
import AnatomyLearningStudio from "@/components/interactive-3d/AnatomyLearningStudio";
import {
  StructureClass,
  StructureMeta,
  STRUCTURE_CLASS_CONFIG,
  HIGHLIGHT_CATEGORY_CONFIG,
  buildConnectiveTissueSubsystem
} from "@/lib/connectiveTissueBuilder";
import {
  AnatomicalStructureData,
  resolveAnatomicalStructureData,
  ANATOMICAL_DATABASE,
  CATEGORY_COLOR_MAP,
  InternalHistologyPin,
  INTERIOR_HISTOLOGY_DATABASE,
  resolveInteriorHistologyData
} from "@/lib/anatomicalStructureData";

import {
  buildSystemCrossSection,
  CrossSectionResult,
  PhysiologicalState
} from "@/lib/crossSectionInteriorBuilder";

// ============================================================================
// REALISTIC MEDICAL PBR CANVAS TEXTURE GENERATORS
// ============================================================================

function createMuscleStriationTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture({} as any);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Deep physiological muscle red base (#8B261D)
    ctx.fillStyle = "#8B261D";
    ctx.fillRect(0, 0, 512, 512);

    // Longitudinal myofibril striation bands with subtle density fluctuations
    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.18 + 0.22 * Math.sin(y * 0.35);
      ctx.fillStyle = y % 4 === 0 ? `rgba(183, 61, 53, ${alpha})` : `rgba(105, 18, 14, ${alpha})`;
      ctx.fillRect(0, y, 512, 1.5);
    }

    // Transverse sarcomere cross-striation Z-disc markers
    for (let x = 0; x < 512; x += 10) {
      ctx.fillStyle = "rgba(226, 232, 240, 0.09)";
      ctx.fillRect(x, 0, 1.5, 512);
    }

    // Pearlescent collagenous fascia streaks (#E2E8F0)
    for (let i = 0; i < 18; i++) {
      const y = (i * 29) % 512;
      const gradient = ctx.createLinearGradient(0, y, 512, y + 14);
      gradient.addColorStop(0, "rgba(226, 232, 240, 0)");
      gradient.addColorStop(0.5, "rgba(226, 232, 240, 0.12)");
      gradient.addColorStop(1, "rgba(226, 232, 240, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, 512, 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  return texture;
}

function createLungPleuralTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture({} as any);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Alveolar pleural salmon-pink base (#E07A5F)
    ctx.fillStyle = "#E07A5F";
    ctx.fillRect(0, 0, 512, 512);

    // Fine capillary reticular micro-mesh
    ctx.strokeStyle = "rgba(165, 50, 40, 0.32)";
    ctx.lineWidth = 1;
    const r = 14;
    for (let y = 0; y < 512; y += r * 1.5) {
      for (let x = 0; x < 512; x += r * 1.732) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + r * Math.cos(angle);
          const py = y + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Soft pleural sheen wash
    const washGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    washGrad.addColorStop(0, "rgba(240, 160, 140, 0.25)");
    washGrad.addColorStop(1, "rgba(180, 70, 60, 0.15)");
    ctx.fillStyle = washGrad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  return texture;
}

// ============================================================================
// 1. 11 ANATOMICAL SUB-SYSTEM METADATA & GLTF ASSET CONFIGURATION
// ============================================================================

import {
  SystemId,
  SystemMeta,
  ANATOMICAL_SYSTEMS,
  ModelSex,
  getSystemGltfPath,
  getSystemUrlQueue
} from "@/lib/anatomicalSystemsData";

export type { SystemId, SystemMeta, ModelSex };

export interface BoneHierarchyCategory {
  id: string;
  name: string;
  sanskritName: string;
  group: "axial" | "appendicular";
  asthiType: string;
  boneCount: number;
  description: string;
  keywords: string[];
}

export const BONE_HIERARCHY: BoneHierarchyCategory[] = [
  {
    id: "skull_cranium",
    name: "Skull & Mandible",
    sanskritName: "Shirasthi & Hanuasthi (शिरोऽस्थि व हन्वस्थि)",
    group: "axial",
    asthiType: "Kapalasthi (कपालास्थि - Flat Bones)",
    boneCount: 28,
    description: "Cranium with orbit cavities, nasal septum, zygomatic arches, maxilla, and articulated mandible with teeth.",
    keywords: ["cranium", "frontal", "parietal", "occipital", "sphenoid", "temporal", "ethmoid", "maxilla", "palatine", "zygomatic", "nasal", "lacrimal", "vomer", "mandible", "hyoid", "teeth", "cartilage", "alar"]
  },
  {
    id: "vertebral_column",
    name: "Vertebral Column",
    sanskritName: "Prishthasthi & Kasheruka (पृष्ठास्थि व कशेरुका)",
    group: "axial",
    asthiType: "Valayasthi (वलयास्थि - Curved/Ring Bones)",
    boneCount: 26,
    description: "26 articulated segments: Cervical (C1–C7, Atlas/Axis), Thoracic (T1–T12), Lumbar (L1–L5), Sacrum, and Coccyx.",
    keywords: ["vertebra", "atlas", "axis", "sacrum", "coccyx"]
  },
  {
    id: "thoracic_cage",
    name: "Thoracic Cage",
    sanskritName: "Urasthi & Parshukasthi (उरोऽस्थि व पर्शुका)",
    group: "axial",
    asthiType: "Valayasthi & Kapalasthi",
    boneCount: 25,
    description: "Thoracic cage: Manubrium, Body of Sternum, Xiphoid process, and 24 Costal ribs (True, False, Floating).",
    keywords: ["sternum", "manubrium", "xiphoid", "rib", "costal", "costarum", "thorax"]
  },
  {
    id: "pectoral_girdle",
    name: "Pectoral Girdle",
    sanskritName: "Amsasthi & Akshakasthi (अंसास्थि व अक्षकास्थि)",
    group: "appendicular",
    asthiType: "Kapalasthi (कपालास्थि - Flat Bone)",
    boneCount: 4,
    description: "Shoulder girdle: Bilateral S-shaped Clavicles and triangular Scapulae connecting upper limbs to the axial trunk.",
    keywords: ["clavicle", "scapula", "pectoral"]
  },
  {
    id: "pelvic_girdle",
    name: "Pelvic Girdle",
    sanskritName: "Shronyasthi & Nitambasthi (श्रोण्यस्थि व नितम्बास्थि)",
    group: "appendicular",
    asthiType: "Kapalasthi (कपालास्थि - Broad Pelvic Basin)",
    boneCount: 2,
    description: "Pelvic basin: Bilateral Hip bones formed by fused Ilium, Ischium, and Pubis with Symphysis Pubis.",
    keywords: ["hip bone", "pelvic", "ilium", "ischium", "pubis"]
  },
  {
    id: "upper_limbs",
    name: "Upper Limbs (Arms & Hands)",
    sanskritName: "Bahu & Hasta Asthi (बाहु व हस्तास्थि)",
    group: "appendicular",
    asthiType: "Nalakasthi (नलकास्थि - Long Tubular Bones)",
    boneCount: 60,
    description: "Bilateral Humerus, Radius, Ulna, 16 Carpals, 10 Metacarpals, and 28 Hand Phalanges.",
    keywords: ["humerus", "radius", "ulna", "hand", "metacarpal", "capitate", "hamate", "lunate", "pisiform", "scaphoid", "trapezium", "trapezoid", "triquetrum"]
  },
  {
    id: "lower_limbs",
    name: "Lower Limbs (Legs & Feet)",
    sanskritName: "Uru & Pada Asthi (ऊरु व पादास्थि)",
    group: "appendicular",
    asthiType: "Nalakasthi (नलकास्थि - Weight-Bearing Long Bones)",
    boneCount: 60,
    description: "Bilateral Femur (largest human bone), Patella, Tibia, Fibula, 14 Tarsals, 10 Metatarsals, and 28 Foot Phalanges.",
    keywords: ["femur", "patella", "tibia", "fibula", "foot", "metatarsal", "talus", "calcaneus", "navicular", "cuboid", "cuneiform", "sesamoid"]
  }
];

export { ANATOMICAL_SYSTEMS };

// ============================================================================
// 2. MAIN COMPONENT: PRODUCTION-GRADE GLTF/GLB 3D ANATOMICAL ENGINE
// ============================================================================

export default function GLTFAnatomical3DEnginePage() {
  // System Visibility & Layer Opacities (Default: Pure Photorealistic Skeletal System)
  const [visibleSystems, setVisibleSystems] = useState<Record<SystemId, boolean>>({
    skeletal: true,
    cardiovascular: false,
    nervous: false,
    digestive: false,
    respiratory: false,
    integumentary: false,
    lymphatic: false,
    endocrine: false,
    urinary: false,
    reproductive: false,
    muscular: false
  });
  const visibleSystemsRef = useRef<Record<SystemId, boolean>>(visibleSystems);
  useEffect(() => {
    visibleSystemsRef.current = visibleSystems;
  }, [visibleSystems]);

  const [systemOpacities, setSystemOpacities] = useState<Record<SystemId, number>>({
    skeletal: 1.0,
    cardiovascular: 1.0,
    nervous: 1.0,
    digestive: 1.0,
    respiratory: 0.9,
    integumentary: 0.15,
    lymphatic: 0.95,
    endocrine: 1.0,
    urinary: 1.0,
    reproductive: 0.95,
    muscular: 0.85
  });

  // Loading Status Tracker & Live Asset Stream Info
  const [loadedStatus, setLoadedStatus] = useState<Record<SystemId, boolean>>({
    skeletal: false,
    cardiovascular: false,
    nervous: false,
    digestive: false,
    respiratory: false,
    integumentary: false,
    lymphatic: false,
    endocrine: false,
    urinary: false,
    reproductive: false,
    muscular: false
  });

  const [loadingFile, setLoadingFile] = useState<string>("Streaming 11 High-Accuracy Anatomical GLTF Models...");
  const [loadingErrors, setLoadingErrors] = useState<Record<SystemId, boolean>>({} as any);

  // Active Inspector System: 01. Skeletal System (Asthi Samsthana)
  const [activeSystemId, setActiveSystemId] = useState<SystemId>("skeletal");
  const activeSystem = ANATOMICAL_SYSTEMS[activeSystemId];
  const activeSystemIdRef = useRef<SystemId>("skeletal");
  useEffect(() => {
    activeSystemIdRef.current = activeSystemId;
  }, [activeSystemId]);

  // Dynamic Male & Female 3D Model Selection
  const [modelSex, setModelSex] = useState<ModelSex>("male");
  const modelSexRef = useRef<ModelSex>("male");

  // Skin Shell Opacity Mode: Transparent (15%) | Solid (100%) | Hidden (0%)
  const [skinMode, setSkinMode] = useState<"transparent" | "solid" | "hidden">("transparent");
  const skinModeRef = useRef<"transparent" | "solid" | "hidden">("transparent");

  // Reload handler ref for dynamic sex switching
  const reloadModelsForSexRef = useRef<((sex: ModelSex) => void) | null>(null);

  // Skeletal Sub-Mesh Hierarchy & Raycasting Selection State
  const [selectedBoneCategory, setSelectedBoneCategory] = useState<string>("skull_cranium");
  const [selectedBoneName, setSelectedBoneName] = useState<string | null>(null);
  const [boneRemodelingEnabled, setBoneRemodelingEnabled] = useState<boolean>(true);
  const [boneMineralizationRate, setBoneMineralizationRate] = useState<number>(1.0);

  // 5 Anatomical Structural Classes (Bones, Articular Cartilage, Ligaments, Tendons, Joint Cavities)
  const [tissueVisibility, setTissueVisibility] = useState<Record<StructureClass, boolean>>({
    bone: true,
    cartilage: true,
    ligament: true,
    tendon: true,
    joint: true,
  });
  const [selectedStructure, setSelectedStructure] = useState<AnatomicalStructureData | null>(null);
  const selectedStructureRef = useRef<AnatomicalStructureData | null>(null);
  useEffect(() => {
    selectedStructureRef.current = selectedStructure;
  }, [selectedStructure]);

  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(false); // Default to collapsed state, opening automatically when an anatomical structure is clicked
  const [legendCollapsed, setLegendCollapsed] = useState<boolean>(false);
  const [legendMinimized, setLegendMinimized] = useState<boolean>(true); // Default to collapsed
  const [tissueDrawerOpen, setTissueDrawerOpen] = useState<boolean>(false); // Collapsible top-margin drawer
  const [allAccordionOpen, setAllAccordionOpen] = useState<boolean>(true);
  const [aiExplainerOpen, setAiExplainerOpen] = useState<boolean>(false);
  const [learningStudioOpen, setLearningStudioOpen] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [studiedStructures, setStudiedStructures] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aayuraura_anatomy_completed");
      if (stored) {
        try { setStudiedStructures(JSON.parse(stored)); } catch {}
      }
    }
  }, []);

  // --------------------------------------------------------------------------
  // 3D LABELED DIAGRAM ENGINE WITH INTERACTIVE LEADER LINES STATE & REFS
  // --------------------------------------------------------------------------
  const [diagramEngineActive, setDiagramEngineActive] = useState<boolean>(true);
  const [activeSubPartPin, setActiveSubPartPin] = useState<string | null>(null);
  const leaderLineSvgRef = useRef<SVGPolylineElement | null>(null);
  const anchorDotRef = useRef<SVGCircleElement | null>(null);
  const anchorPulseRef = useRef<SVGCircleElement | null>(null);
  const leaderTagRef = useRef<HTMLDivElement | null>(null);
  const activeDiagramAnchor = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.15, 0.06));
  const diagramEngineActiveRef = useRef<boolean>(true);

  useEffect(() => {
    diagramEngineActiveRef.current = diagramEngineActive;
  }, [diagramEngineActive]);

  // Focus Canvas / Viewport Declutter Mode
  const allPanelsHidden = !leftSidebarOpen && !rightSidebarOpen && !tissueDrawerOpen;

  const handleToggleFocusCanvas = () => {
    if (allPanelsHidden) {
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
    } else {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
      setTissueDrawerOpen(false);
      setLegendMinimized(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "f" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        handleToggleFocusCanvas();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allPanelsHidden]);

  const [openAccordion, setOpenAccordion] = useState<{
    subParts: boolean;
    functions: boolean;
    articulations: boolean;
    ayurveda: boolean;
    clinical: boolean;
  }>({
    subParts: true,
    functions: true,
    articulations: true,
    ayurveda: true,
    clinical: true,
  });

  const toggleAccordionSection = (sec: keyof typeof openAccordion) => {
    setOpenAccordion((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleAllAccordion = () => {
    const next = !allAccordionOpen;
    setAllAccordionOpen(next);
    setOpenAccordion({
      subParts: next,
      functions: next,
      articulations: next,
      ayurveda: next,
      clinical: next,
    });
  };

  // Sliders: Exploded View & Real-Time Physiology
  const [explodeValue, setExplodeValue] = useState<number>(0);
  const [heartRateBPM, setHeartRateBPM] = useState<number>(72);
  const [respirationRateRPM, setRespirationRateRPM] = useState<number>(14);
  const [gastricPH, setGastricPH] = useState<number>(2.0);
  const [peristalticSpeed, setPeristalticSpeed] = useState<number>(1.0);
  const [jointArticulationAngle, setJointArticulationAngle] = useState<number>(0);
  const [boneDensity, setBoneDensity] = useState<number>(1.0);
  const [alveolarDiffusionEnabled, setAlveolarDiffusionEnabled] = useState<boolean>(true);
  const [muscleContractionPercent, setMuscleContractionPercent] = useState<number>(0);
  const [cardiacPhaseStage, setCardiacPhaseStage] = useState<"auto" | "systole" | "diastole">("auto");
  const [bloodVesselLayerInspector, setBloodVesselLayerInspector] = useState<"all" | "intima" | "media" | "adventitia">("all");
  const [chamberSlicingMode, setChamberSlicingMode] = useState<"coronal" | "transverse" | "four_chamber">("four_chamber");
  const [preserveSkinSilhouette, setPreserveSkinSilhouette] = useState<boolean>(true);
  const [multiSystemPhysioExpanded, setMultiSystemPhysioExpanded] = useState<boolean>(false);

  // Clipping Plane State
  const [clippingEnabled, setClippingEnabled] = useState<boolean>(false);
  const [clipAxis, setClipAxis] = useState<"x" | "y" | "z">("z");
  const [clipDistance, setClipDistance] = useState<number>(0.1);
  const [clipInverted, setClipInverted] = useState<boolean>(false);

  // Viewport State
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [macroMicroModalOpen, setMacroMicroModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"systems" | "sliders" | "clipping" | "cellular">("systems");

  // --------------------------------------------------------------------------
  // HIERARCHICAL DIAGRAM ANNOTATION & SUB-PART RESOLVER
  // --------------------------------------------------------------------------
  const getActiveDiagramData = () => {
    if (selectedStructure) {
      const parts: string[] = [];
      if (selectedStructure.subParts) {
        if (selectedStructure.subParts.proximal?.length) parts.push(selectedStructure.subParts.proximal[0]);
        if (selectedStructure.subParts.shaft?.length) parts.push(selectedStructure.subParts.shaft[0]);
        if (selectedStructure.subParts.distal?.length) parts.push(selectedStructure.subParts.distal[0]);
      }
      if (parts.length === 0) {
        if (selectedStructure.category === "Bone") {
          parts.push("Periosteum (Paryasthi)", "Cortical Bone (Ghanasthi)", "Cancellous Bone (Susirasthi)", "Medullary Majja (मज्जा)");
        } else if (selectedStructure.category === "Cardiovascular") {
          parts.push("Tunica Intima", "Tunica Media", "Tunica Externa", "Purkinje Conducting System");
        } else if (selectedStructure.category === "Muscular") {
          parts.push("Epimysium (Outer)", "Perimysium (Fascicle)", "Endomysium (Fiber)", "Sarcomere Triad");
        } else if (selectedStructure.category === "Respiratory") {
          parts.push("Visceral Pleura", "Alveolar Sacs (Vayu-Kosha)", "Capillary Meshwork", "Type II Pneumocytes");
        } else {
          parts.push("Surface Mucosa", "Lamina Propria", "Submucosa", "Vascular-Neural Plexus");
        }
      }
      return {
        primaryName: selectedStructure.commonName,
        latinName: selectedStructure.latinName,
        category: selectedStructure.category,
        sanskrit: selectedStructure.ayurvedicMetadata?.dhatu || selectedStructure.latinName,
        subParts: parts.slice(0, 4),
        clinical: selectedStructure.clinicalNotes
      };
    }

    const defSys = ANATOMICAL_SYSTEMS[activeSystemId];
    return {
      primaryName: defSys?.name || "Aortic Arch & Cardiovascular",
      latinName: defSys?.code || "Arcus Aortae (Mahasira)",
      category: defSys?.srotas || "Pranavaha Srotas",
      sanskrit: defSys?.sanskritName || "हृदय व महासिरा",
      subParts: ["Aortic Arch / Arcus Aortae", "Tunica Intima (Endothelial)", "Tunica Media (Elastic Muscle)", "Tunica Externa (Adventitia)"],
      clinical: defSys?.description || "Central vital cardiovascular distribution channel."
    };
  };

  // Three.js References
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);
  const boneParticlesRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const fitCameraHelperRef = useRef<((obj: THREE.Object3D, offset?: number) => void) | null>(null);


  // Sub-System GLTF Groups & Materials
  const systemGroupsRef = useRef<Record<SystemId, THREE.Group>>({} as any);
  const systemMaterialsRef = useRef<Record<SystemId, THREE.Material[]>>({} as any);
  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.1));
  const reqAnimRef = useRef<number | null>(null);

  // Animation References
  const cardioGroupRef = useRef<THREE.Group | null>(null);
  const respGroupRef = useRef<THREE.Group | null>(null);
  const digestiveGroupRef = useRef<THREE.Group | null>(null);

  // Target Camera Lerp
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 3.2));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 0));

  // Anatomical Split-View / Exploded Layer Engine State
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const isSplitViewRef = useRef<boolean>(false);
  const [splitDistancePercent, setSplitDistancePercent] = useState<number>(50);
  const splitDistancePercentRef = useRef<number>(50);
  const splitProgressRef = useRef<number>(0);
  const splitContainerRef = useRef<THREE.Group | null>(null);
  const splitGroupLeftRef = useRef<THREE.Group | null>(null);
  const splitGroupRightRef = useRef<THREE.Group | null>(null);
  const splitPlaneLeftRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0));
  const splitPlaneRightRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(1, 0, 0), 0));
  const crossSectionsRef = useRef<CrossSectionResult[]>([]);
  const pinElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const rebuildSplitGroupsRef = useRef<(() => void) | null>(null);

  // Real-Time Physiological Animation State References
  const heartRateBPMRef = useRef<number>(72);
  const respirationRateRPMRef = useRef<number>(14);
  const gastricPHRef = useRef<number>(2.0);
  const peristalticSpeedRef = useRef<number>(1.0);
  const jointArticulationAngleRef = useRef<number>(0);
  const boneDensityRef = useRef<number>(1.0);
  const alveolarDiffusionRef = useRef<boolean>(true);
  const muscleContractionPercentRef = useRef<number>(0);
  const cardiacPhaseStageRef = useRef<"auto" | "systole" | "diastole">("auto");
  const bloodVesselLayerInspectorRef = useRef<"all" | "intima" | "media" | "adventitia">("all");
  const preserveSkinSilhouetteRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(false);

  // Cloned system references inside split-view halves for synchronized animation
  const splitCardioClonesRef = useRef<THREE.Group[]>([]);
  const splitRespClonesRef = useRef<THREE.Group[]>([]);
  const splitDigestiveClonesRef = useRef<THREE.Group[]>([]);

  useEffect(() => { splitDistancePercentRef.current = splitDistancePercent; }, [splitDistancePercent]);
  useEffect(() => { heartRateBPMRef.current = heartRateBPM; }, [heartRateBPM]);
  useEffect(() => { respirationRateRPMRef.current = respirationRateRPM; }, [respirationRateRPM]);
  useEffect(() => { gastricPHRef.current = gastricPH; }, [gastricPH]);
  useEffect(() => { peristalticSpeedRef.current = peristalticSpeed; }, [peristalticSpeed]);
  useEffect(() => { jointArticulationAngleRef.current = jointArticulationAngle; }, [jointArticulationAngle]);
  useEffect(() => { boneDensityRef.current = boneDensity; }, [boneDensity]);
  useEffect(() => { alveolarDiffusionRef.current = alveolarDiffusionEnabled; }, [alveolarDiffusionEnabled]);
  useEffect(() => { muscleContractionPercentRef.current = muscleContractionPercent; }, [muscleContractionPercent]);
  useEffect(() => { cardiacPhaseStageRef.current = cardiacPhaseStage; }, [cardiacPhaseStage]);
  useEffect(() => { bloodVesselLayerInspectorRef.current = bloodVesselLayerInspector; }, [bloodVesselLayerInspector]);
  useEffect(() => { preserveSkinSilhouetteRef.current = preserveSkinSilhouette; }, [preserveSkinSilhouette]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const isRotatingRef = useRef<boolean>(false);
  const explodeValueRef = useRef<number>(0);
  const boneRemodelingEnabledRef = useRef<boolean>(true);
  const boneMineralizationRateRef = useRef<number>(1.0);
  const autoFitCameraRef = useRef<((target?: THREE.Object3D) => void) | null>(null);

  useEffect(() => { isRotatingRef.current = isRotating; }, [isRotating]);
  useEffect(() => { explodeValueRef.current = explodeValue; }, [explodeValue]);
  useEffect(() => { boneRemodelingEnabledRef.current = boneRemodelingEnabled; }, [boneRemodelingEnabled]);
  useEffect(() => { boneMineralizationRateRef.current = boneMineralizationRate; }, [boneMineralizationRate]);

  const autoFitCamera = (target?: THREE.Object3D) => {
    if (autoFitCameraRef.current) {
      autoFitCameraRef.current(target);
    }
  };

  // Select Interior Histology Pin
  const handleSelectPin = (pin: InternalHistologyPin) => {
    const data = resolveInteriorHistologyData(pin);
    setSelectedStructure(data);
    setRightSidebarOpen(true);
    setAllAccordionOpen(true);
    setOpenAccordion({
      subParts: true,
      functions: true,
      articulations: true,
      ayurveda: true,
      clinical: true,
    });
    // Smooth camera lerp to focus directly on pin internal anchor
    const [px, py, pz] = pin.worldAnchor || pin.anchor;
    targetCamLook.current.set(px, py, pz);
    targetCamPos.current.set(px, py, pz + 0.42);

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const inspectorEl = document.getElementById("anatomical-inspector-panel");
        if (inspectorEl) {
          inspectorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 80);
    }
  };

  // Toggle Anatomical Split-View Engine
  const handleToggleSplitView = () => {
    setIsSplitView((prev) => {
      const next = !prev;
      isSplitViewRef.current = next;
      if (next) {
        setRightSidebarOpen(true);
        setTissueDrawerOpen(false);
        if (rebuildSplitGroupsRef.current) {
          rebuildSplitGroupsRef.current();
        }
        // Auto-select interior pin matching activeSystemId
        const matchPin = Object.values(INTERIOR_HISTOLOGY_DATABASE).find(
          (p) => p.systemId === activeSystemId
        ) || Object.values(INTERIOR_HISTOLOGY_DATABASE)[0];
        if (matchPin) {
          setSelectedStructure(resolveInteriorHistologyData(matchPin));
        }
      }
      return next;
    });
  };

  // Dynamic Male & Female Model Switcher (Scene Re-Attachment & Box3 Camera Auto-Fit)
  const handleSwitchModelSex = (newSex: ModelSex) => {
    if (modelSex === newSex) return;
    setModelSex(newSex);
    modelSexRef.current = newSex;
    setSelectedStructure(null);

    // Requirement 1: Re-add active GLTF group directly to scene.add(activeModelGroup) and force scene.needsUpdate = true
    if (sceneRef.current && bodyGroupRef.current) {
      if (!sceneRef.current.children.includes(bodyGroupRef.current)) {
        sceneRef.current.add(bodyGroupRef.current);
      }
      (sceneRef.current as any).needsUpdate = true;
    }

    if (reloadModelsForSexRef.current) {
      reloadModelsForSexRef.current(newSex);
    }

    // Requirement 2: Auto-fit camera to newly loaded sex model
    autoFitCamera();
  };

  // Dedicated Skin Shell Opacity Mode Toggle (Transparent 15% -> Solid 100% -> Hidden 0%)
  const handleCycleSkinMode = () => {
    const nextMode: "transparent" | "solid" | "hidden" =
      skinMode === "transparent" ? "solid" : skinMode === "solid" ? "hidden" : "transparent";
    setSkinMode(nextMode);
    skinModeRef.current = nextMode;

    const skinGroup = systemGroupsRef.current["integumentary"];
    if (skinGroup) {
      skinGroup.visible = nextMode !== "hidden";
      skinGroup.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            if (nextMode === "transparent") {
              m.transparent = true;
              m.opacity = 0.15;
              m.color = new THREE.Color("#E2C3A8");
              if ("transmission" in m) m.transmission = 0.75;
              if ("roughness" in m) m.roughness = 0.45;
              m.depthWrite = false;
            } else if (nextMode === "solid") {
              m.transparent = false;
              m.opacity = 1.0;
              m.color = new THREE.Color("#E2C3A8");
              if ("transmission" in m) m.transmission = 0.0;
              m.depthWrite = true;
            } else {
              m.transparent = true;
              m.opacity = 0.0;
              m.depthWrite = false;
            }
            m.needsUpdate = true;
          });
        }
      });
    }

    setVisibleSystems((prev) => ({
      ...prev,
      integumentary: nextMode !== "hidden"
    }));
  };

  // Toggle Visibility with Compulsory Skeletal Base Rule in Multi-System Mode
  const toggleSystemVisibility = (sysId: SystemId) => {
    setVisibleSystems((prev) => {
      const willBeVisible = !prev[sysId];
      const proposed = { ...prev, [sysId]: willBeVisible };

      // UI Overlay Detachment Prevention: if structure from this system was selected and is hidden, clear it
      if (!willBeVisible && selectedStructureRef.current) {
        const catLower = (selectedStructureRef.current.category || "").toLowerCase();
        if (catLower.includes(sysId.slice(0, 4))) {
          setSelectedStructure(null);
        }
      }

      // Enforce Skeletal Foundation in Multi-System Mode:
      // Count other active non-skeletal systems
      const otherActiveCount = (Object.keys(proposed) as SystemId[]).filter(
        (k) => k !== "skeletal" && proposed[k]
      ).length;

      // If user tries to turn off skeletal while any other system is active (Multi-System Mode),
      // skeletal must remain active as the compulsory base framework:
      if (sysId === "skeletal" && !willBeVisible && otherActiveCount >= 1) {
        return prev; // Lock skeletal as compulsory anchor
      }

      // If user turns on another system and there are multiple systems active,
      // automatically ensure Skeletal is checked as the compulsory foundation:
      if (willBeVisible && sysId !== "skeletal" && otherActiveCount >= 1) {
        proposed.skeletal = true;
        if (systemGroupsRef.current["skeletal"]) {
          systemGroupsRef.current["skeletal"].visible = true;
        }
      }

      if (systemGroupsRef.current[sysId]) {
        systemGroupsRef.current[sysId].visible = proposed[sysId];
      }

      if (isSplitViewRef.current && rebuildSplitGroupsRef.current) {
        rebuildSplitGroupsRef.current();
      }
      return proposed;
    });
  };

  // Set Opacity directly on loaded GLTF materials dynamically
  const handleSystemOpacityChange = (sysId: SystemId, val: number) => {
    setSystemOpacities((prev) => ({ ...prev, [sysId]: val }));
    const group = systemGroupsRef.current[sysId];
    if (group) {
      group.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            if ("opacity" in m) {
              m.opacity = val;
              m.transparent = val < 0.99;
              m.needsUpdate = true;
            }
          });
        }
      });
    }
    const mats = systemMaterialsRef.current[sysId];
    if (mats) {
      mats.forEach((m: any) => {
        if ("opacity" in m) {
          m.opacity = val;
          m.transparent = val < 0.99;
          m.needsUpdate = true;
        }
      });
    }
  };

  // Specific Solo View Override: Complete 360° isolated system inspection
  // Instantly overrides the compulsory skeletal rule and sets ALL other 10 system meshes to visible = false
  const handleSoloSystem = (sysId: SystemId) => {
    setActiveSystemId(sysId);
    setVisibleSystems(() => {
      const updated: Record<SystemId, boolean> = {} as any;
      Object.keys(ANATOMICAL_SYSTEMS).forEach((k) => {
        const isSolo = k === sysId;
        updated[k as SystemId] = isSolo;
        if (systemGroupsRef.current[k as SystemId]) {
          systemGroupsRef.current[k as SystemId].visible = isSolo;
        }
      });

      if (isSplitViewRef.current && rebuildSplitGroupsRef.current) {
        rebuildSplitGroupsRef.current();
      }
      return updated;
    });

    // Auto-focus camera on the soloed system's bounding box
    const targetGrp = systemGroupsRef.current[sysId];
    if (targetGrp && fitCameraHelperRef.current) {
      fitCameraHelperRef.current(targetGrp, 1.4);
    } else {
      const meta = ANATOMICAL_SYSTEMS[sysId];
      if (meta) {
        targetCamLook.current.set(meta.centroid[0], meta.centroid[1], meta.centroid[2]);
        targetCamPos.current.set(meta.centroid[0], meta.centroid[1], meta.cameraZ);
      }
    }
  };

  // Show All (11 Systems Combined View)
  const handleShowAllSystems = () => {
    setVisibleSystems(() => {
      const updated: Record<SystemId, boolean> = {} as any;
      Object.keys(ANATOMICAL_SYSTEMS).forEach((k) => {
        updated[k as SystemId] = true;
        if (systemGroupsRef.current[k as SystemId]) {
          systemGroupsRef.current[k as SystemId].visible = true;
        }
      });
      return updated;
    });

    // Enforce integumentary opacity to 0.15 so internal organs are visible inside the body shell
    handleSystemOpacityChange("integumentary", 0.15);
    handleFitWholeBody();
  };

  // X-Ray Preset
  const handleXRayPreset = () => {
    handleSystemOpacityChange("integumentary", 0.04);
    handleSystemOpacityChange("muscular", 0.2);
    handleSystemOpacityChange("skeletal", 0.95);
    handleSystemOpacityChange("cardiovascular", 1.0);
    handleSystemOpacityChange("nervous", 1.0);
  };

  // Select System & Focus Camera
  const handleSelectSystem = (sysId: SystemId) => {
    setActiveSystemId(sysId);
    if (sysId === "skeletal") {
      handleFitWholeBody();
      return;
    }
    const meta = ANATOMICAL_SYSTEMS[sysId];
    targetCamLook.current.set(meta.centroid[0], meta.centroid[1], meta.centroid[2]);
    targetCamPos.current.set(meta.centroid[0], meta.centroid[1], meta.cameraZ);
  };

  // Fit Whole Body into Viewport Frame (Head to Toe using Box3 auto-fit)
  const handleFitWholeBody = () => {
    setSelectedBoneName(null);
    setSelectedStructure(null);
    const skeleton = skeletonGroupRef.current || bodyGroupRef.current;
    if (skeleton) {
      // Reset any highlight emissives
      skeleton.traverse((c: any) => {
        if (c.isMesh && c.material && c.userData.originalEmissive) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m: any) => {
            m.emissive.copy(c.userData.originalEmissive);
            m.emissiveIntensity = c.userData.originalEmissiveIntensity || 0;
          });
        }
      });
      autoFitCamera(bodyGroupRef.current || skeleton);
    }
  };

  // --------------------------------------------------------------------------
  // DYNAMIC SELECTION HIGHLIGHT SHADER & CAMERA SMOOTH AUTO-CENTER
  // --------------------------------------------------------------------------
  const highlightMesh = (hitMesh: THREE.Mesh) => {
    let hlColor = "#F59E0B";
    let emissiveColor = "#F59E0B";
    let emissiveIntensity = 0.5;

    const structType = hitMesh.userData.structureType as StructureClass;
    const sysId = hitMesh.userData.systemId as SystemId;

    if (structType && HIGHLIGHT_CATEGORY_CONFIG[structType]) {
      hlColor = HIGHLIGHT_CATEGORY_CONFIG[structType].highlightColor;
      emissiveColor = HIGHLIGHT_CATEGORY_CONFIG[structType].emissiveColor;
      emissiveIntensity = HIGHLIGHT_CATEGORY_CONFIG[structType].emissiveIntensity || 0.5;
    } else if (sysId && ANATOMICAL_SYSTEMS[sysId]) {
      hlColor = ANATOMICAL_SYSTEMS[sysId].colorHex;
      emissiveColor = ANATOMICAL_SYSTEMS[sysId].colorHex;
      emissiveIntensity = 0.5;
    }

    Object.values(systemGroupsRef.current).forEach((sysGroup) => {
      if (!sysGroup) return;
      sysGroup.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          const isSelected = child === hitMesh;

          mats.forEach((m: any) => {
            if (isSelected) {
              // Clicked structure: highlight in category/system color with emissive glow (0.5 intensity)
              if (m.color) m.color.set(hlColor);
              if (m.emissive) {
                m.emissive.set(emissiveColor);
                m.emissiveIntensity = emissiveIntensity;
              }
              m.opacity = 1.0;
              m.transparent = false;
              m.needsUpdate = true;
            } else {
              // Non-selected structures: restore original color/emissive and dim opacity to 0.25
              if (child.userData.originalColor && m.color) {
                m.color.copy(child.userData.originalColor);
              }
              if (child.userData.originalEmissive && m.emissive) {
                m.emissive.copy(child.userData.originalEmissive);
                m.emissiveIntensity = child.userData.originalEmissiveIntensity || 0;
              }
              m.opacity = 0.25;
              m.transparent = true;
              m.needsUpdate = true;
            }
          });
        }
      });
    });
  };

  const focusCameraOnMesh = (object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    if (!cameraRef.current) return;
    const fovRad = cameraRef.current.fov * (Math.PI / 180);
    const aspect = cameraRef.current.aspect;

    const fitHeightDist = size.y / (2 * Math.tan(fovRad / 2));
    const fitWidthDist = size.x / (2 * Math.tan(fovRad / 2) * aspect);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Compute comfortable zoom: minimum 0.22m for small ligaments, up to appropriate height distance
    let distance = Math.max(fitHeightDist, fitWidthDist) * 1.55;
    distance = Math.max(distance, maxDim * 2.2, 0.22);

    targetCamLook.current.copy(center);
    targetCamPos.current.set(center.x, center.y, center.z + distance);
  };

  // Reset Selection / Clear Highlight Control
  const handleClearHighlight = () => {
    setSelectedStructure(null);
    setSelectedBoneName(null);

    Object.entries(systemGroupsRef.current).forEach(([sysKey, sysGroup]) => {
      if (!sysGroup) return;
      const sysId = sysKey as SystemId;
      sysGroup.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            if (child.userData.originalColor && m.color) {
              m.color.copy(child.userData.originalColor);
            }
            if (child.userData.originalEmissive && m.emissive) {
              m.emissive.copy(child.userData.originalEmissive);
              m.emissiveIntensity = child.userData.originalEmissiveIntensity || 0;
            }
            const origOpacity = child.userData.originalOpacity !== undefined
              ? child.userData.originalOpacity
              : (sysId === "integumentary" ? 0.15 : (systemOpacities[sysId] ?? 1.0));
            m.opacity = origOpacity;
            m.transparent = child.userData.originalTransparent !== undefined
              ? child.userData.originalTransparent
              : origOpacity < 0.99;
            m.needsUpdate = true;
          });
        }
      });
    });

    applyTissueVisibility(tissueVisibility);

    // Smoothly animate camera back to default full-body overview coordinates (0, 0, 2.5) with target (0, 0.85, 0)
    targetCamLook.current.set(0, 0.85, 0);
    targetCamPos.current.set(0, 0, 2.5);
  };

  // --------------------------------------------------------------------------
  // 5 ANATOMICAL STRUCTURAL CLASSES TOGGLES & ISOLATION PRESETS
  // --------------------------------------------------------------------------
  // 5 ANATOMICAL STRUCTURAL CLASSES TOGGLES & ISOLATION PRESETS
  // --------------------------------------------------------------------------
  const applyTissueVisibility = (visibility: Record<StructureClass, boolean>) => {
    const skeleton = skeletonGroupRef.current;
    if (!skeleton) return;
    skeleton.traverse((child: any) => {
      if (child.isMesh) {
        let type = child.userData.structureType as StructureClass;
        if (!type) {
          const n = (child.name || "").toLowerCase();
          if (n.includes("cartilage") || n.includes("meniscus") || n.includes("disc") || n.includes("septum")) type = "cartilage";
          else if (n.includes("ligament") || n.includes("acl") || n.includes("pcl") || n.includes("mcl") || n.includes("lcl") || n.includes("snayu")) type = "ligament";
          else if (n.includes("tendon") || n.includes("achilles") || n.includes("patellar") || n.includes("kandara")) type = "tendon";
          else if (n.includes("capsule") || n.includes("joint") || n.includes("synovial") || n.includes("sandhi")) type = "joint";
          else type = "bone";
          child.userData.structureType = type;
        }
        const isVisible = visibility[type] ?? true;
        child.visible = isVisible;
      }
    });
  };

  const handleToggleTissue = (type: StructureClass) => {
    // Bones are compulsorily selected as the fundamental skeletal frame and cannot be deselected
    if (type === "bone") {
      if (!tissueVisibility.bone) {
        setTissueVisibility((prev) => {
          const updated = { ...prev, bone: true };
          applyTissueVisibility(updated);
          return updated;
        });
      }
      handleSelectBoneCategory("axial_skeleton");
      return;
    }

    setTissueVisibility((prev) => {
      const isTurningOff = prev[type] === true;
      const updated = { ...prev, [type]: !prev[type] };
      applyTissueVisibility(updated);

      // When an option is DESELECTED, remove the result of the selected option if it belongs to this tissue
      if (isTurningOff) {
        setSelectedStructure((curr) => {
          if (!curr) return null;
          const cat = (curr.category || "").toLowerCase();
          const isCartilage =
            type === "cartilage" &&
            (cat.includes("cartilage") ||
              curr.id.includes("cartilage") ||
              curr.id.includes("meniscus") ||
              curr.id.includes("disc"));
          const isLigament =
            type === "ligament" &&
            (cat.includes("ligament") ||
              curr.id.includes("ligament") ||
              curr.id.includes("acl") ||
              curr.id.includes("pcl") ||
              curr.id.includes("mcl") ||
              curr.id.includes("lcl") ||
              curr.id.includes("iliofemoral"));
          const isTendon =
            type === "tendon" &&
            (cat.includes("tendon") ||
              curr.id.includes("tendon") ||
              curr.id.includes("achilles") ||
              curr.id.includes("patellar"));
          const isJoint =
            type === "joint" &&
            (cat.includes("joint") ||
              cat.includes("capsule") ||
              curr.id.includes("capsule"));

          if (isCartilage || isLigament || isTendon || isJoint) {
            setSelectedBoneName(null);
            return null; // Immediately remove the result of the deselected option!
          }
          return curr;
        });

        // Reset highlight emissives on meshes belonging to the deselected tissue
        if (skeletonGroupRef.current) {
          skeletonGroupRef.current.traverse((child: any) => {
            if (child.isMesh && child.userData.structureType === type && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m: any) => {
                if (child.userData.originalColor && m.color) m.color.copy(child.userData.originalColor);
                if (m.emissive) {
                  if (child.userData.originalEmissive && typeof m.emissive.copy === "function") {
                    m.emissive.copy(child.userData.originalEmissive);
                  } else if (typeof m.emissive.set === "function") {
                    m.emissive.set(0x000000);
                  }
                  m.emissiveIntensity = child.userData.originalEmissiveIntensity || 0;
                }
                m.opacity = child.userData.originalOpacity ?? 1.0;
                m.transparent = child.userData.originalTransparent ?? false;
                m.needsUpdate = true;
              });
            }
          });
        }
      } else {
        // When an option is SELECTED (turned ON): Show the results of the selected option!
        const representativeKey: Record<StructureClass, string> = {
          bone: "axial_skeleton",
          cartilage: "articular_cartilage",
          ligament: "knee_acl",
          tendon: "knee_patellar_tendon",
          joint: "knee_synovial_capsule",
        };
        const defaultKey = representativeKey[type];
        if (defaultKey && ANATOMICAL_DATABASE[defaultKey]) {
          setSelectedStructure(ANATOMICAL_DATABASE[defaultKey]);
          setOpenAccordion({
            subParts: true,
            functions: true,
            articulations: true,
            ayurveda: true,
            clinical: true,
          });
          setAllAccordionOpen(true);
          setRightSidebarOpen(true);

          if (typeof window !== "undefined") {
            setTimeout(() => {
              const inspectorEl = document.getElementById("anatomical-inspector-panel");
              if (inspectorEl) {
                inspectorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }, 80);
          }
        }
      }

      return updated;
    });
  };

  const handleSoloTissue = (type: StructureClass) => {
    // Bones are compulsory selected; soloing any tissue keeps Bones active alongside it
    const updated: Record<StructureClass, boolean> = {
      bone: true, // Compulsory baseline skeleton
      cartilage: type === "cartilage",
      ligament: type === "ligament",
      tendon: type === "tendon",
      joint: type === "joint",
    };
    setTissueVisibility(updated);
    applyTissueVisibility(updated);

    const representativeKey: Record<StructureClass, string> = {
      bone: "axial_skeleton",
      cartilage: "articular_cartilage",
      ligament: "knee_acl",
      tendon: "knee_patellar_tendon",
      joint: "knee_synovial_capsule",
    };
    const defaultKey = representativeKey[type];
    if (defaultKey && ANATOMICAL_DATABASE[defaultKey]) {
      setSelectedStructure(ANATOMICAL_DATABASE[defaultKey]);
      setOpenAccordion({
        subParts: true,
        functions: true,
        articulations: true,
        ayurveda: true,
        clinical: true,
      });
      setAllAccordionOpen(true);
      setRightSidebarOpen(true);
    }
  };

  const handleDeselectAllTissues = () => {
    // Bones are compulsorily selected; deselect remaining optional connective tissues
    const updated: Record<StructureClass, boolean> = {
      bone: true, // Compulsory baseline skeleton
      cartilage: false,
      ligament: false,
      tendon: false,
      joint: false,
    };
    setTissueVisibility(updated);
    applyTissueVisibility(updated);

    // If current selection is one of the deselected connective tissues, switch back to axial skeleton
    setSelectedStructure((curr) => {
      if (!curr) return ANATOMICAL_DATABASE["axial_skeleton"];
      const cat = (curr.category || "").toLowerCase();
      const isConnective =
        cat.includes("cartilage") ||
        cat.includes("ligament") ||
        cat.includes("tendon") ||
        cat.includes("joint") ||
        cat.includes("capsule") ||
        curr.id.includes("cartilage") ||
        curr.id.includes("meniscus") ||
        curr.id.includes("disc") ||
        curr.id.includes("acl") ||
        curr.id.includes("pcl") ||
        curr.id.includes("mcl") ||
        curr.id.includes("lcl") ||
        curr.id.includes("iliofemoral") ||
        curr.id.includes("tendon");

      if (isConnective) {
        return ANATOMICAL_DATABASE["axial_skeleton"];
      }
      return curr;
    });

    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.traverse((child: any) => {
        if (child.isMesh && child.userData.structureType !== "bone" && child.material && child.userData.originalEmissive) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            if (child.userData.originalColor && m.color) m.color.copy(child.userData.originalColor);
            if (m.emissive && typeof m.emissive.copy === "function") {
              m.emissive.copy(child.userData.originalEmissive);
            }
            m.emissiveIntensity = child.userData.originalEmissiveIntensity || 0;
            m.opacity = child.userData.originalOpacity ?? 1.0;
            m.transparent = child.userData.originalTransparent ?? false;
            m.needsUpdate = true;
          });
        }
      });
    }
  };

  const handleShowAllTissues = () => {
    const updated: Record<StructureClass, boolean> = {
      bone: true,
      cartilage: true,
      ligament: true,
      tendon: true,
      joint: true,
    };
    setTissueVisibility(updated);
    applyTissueVisibility(updated);

    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.traverse((child: any) => {
        if (child.isMesh && child.userData.structureType === "bone" && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            m.opacity = 1.0;
            m.transparent = false;
            m.needsUpdate = true;
          });
        }
      });
    }
  };

  const handleConnectiveOnlyPreset = () => {
    const updated: Record<StructureClass, boolean> = {
      bone: false,
      cartilage: true,
      ligament: true,
      tendon: true,
      joint: true,
    };
    setTissueVisibility(updated);
    applyTissueVisibility(updated);
  };

  const handleKneeDissectionPreset = () => {
    const updated: Record<StructureClass, boolean> = {
      bone: true,
      cartilage: true,
      ligament: true,
      tendon: true,
      joint: true,
    };
    setTissueVisibility(updated);
    applyTissueVisibility(updated);

    if (skeletonGroupRef.current) {
      skeletonGroupRef.current.traverse((child: any) => {
        if (child.isMesh && child.userData.structureType === "bone" && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => {
            m.opacity = 0.22;
            m.transparent = true;
            m.needsUpdate = true;
          });
        }
      });
    }

    targetCamLook.current.set(0.105, 0.485, 0);
    targetCamPos.current.set(0.105, 0.485, 0.38);

    setSelectedStructure(ANATOMICAL_DATABASE["knee_acl"]);
  };

  // Select Specific Bone Hierarchy Category, Axial/Appendicular Group, or Tissue Architecture
  const handleSelectBoneCategory = (catId: string) => {
    setSelectedBoneCategory(catId);
    setSelectedBoneName(null);
    setRightSidebarOpen(true);

    // Resolve AnatomicalStructureData for this selection and immediately populate accordion
    const categoryDatabaseMap: Record<string, string> = {
      skull_cranium: "skull",
      vertebral_column: "spine",
      thoracic_cage: "ribs",
      pectoral_girdle: "clavicle",
      pelvic_girdle: "pelvis",
      upper_limbs: "humerus",
      lower_limbs: "femur",
      axial: "axial_skeleton",
      axial_skeleton: "axial_skeleton",
      appendicular: "appendicular_skeleton",
      appendicular_skeleton: "appendicular_skeleton",
      tissue_architecture: "tissue_architecture",
      cortical_bone: "cortical_bone",
      cancellous_bone: "cancellous_bone",
      medullary_cavity: "medullary_cavity",
      periosteum: "periosteum",
      articular_cartilage: "articular_cartilage",
    };
    const dbKey = categoryDatabaseMap[catId] || catId;
    const structObj = ANATOMICAL_DATABASE[dbKey];
    if (structObj) {
      setSelectedStructure(structObj);
      setOpenAccordion({
        subParts: true,
        functions: true,
        articulations: true,
        ayurveda: true,
        clinical: true,
      });
      setAllAccordionOpen(true);

      // Auto-enable tissue category if it was deselected so mesh is visible in 3D
      const catLower = structObj.category.toLowerCase();
      let neededType: StructureClass = "bone";
      if (catLower.includes("cartilage")) neededType = "cartilage";
      else if (catLower.includes("ligament")) neededType = "ligament";
      else if (catLower.includes("tendon")) neededType = "tendon";
      else if (catLower.includes("joint") || catLower.includes("capsule")) neededType = "joint";

      setTissueVisibility((prev) => {
        if (prev[neededType]) return prev;
        const updated = { ...prev, [neededType]: true };
        applyTissueVisibility(updated);
        return updated;
      });
    }

    // Smoothly scroll to the Inspector panel so the user immediately sees the bone parts & description
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const inspectorEl = document.getElementById("anatomical-inspector-panel");
        if (inspectorEl) {
          inspectorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 80);
    }

    const skeleton = skeletonGroupRef.current;
    if (!skeleton) return;

    const isAxialGroup = catId === "axial" || catId === "axial_skeleton";
    const isAppendicularGroup = catId === "appendicular" || catId === "appendicular_skeleton";
    const isTissueArch = catId === "tissue_architecture";

    try {
      // Reset previous emissives and dim non-matching meshes to 0.25 opacity
      skeleton.traverse((c: any) => {
        if (c.isMesh && c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m: any) => {
            if (c.userData.originalColor && m.color) {
              m.color.copy(c.userData.originalColor);
            }
            if (m.emissive) {
              if (c.userData.originalEmissive && typeof m.emissive.copy === "function") {
                m.emissive.copy(c.userData.originalEmissive);
              } else if (typeof m.emissive.set === "function") {
                m.emissive.set(0x000000);
              }
              m.emissiveIntensity = c.userData.originalEmissiveIntensity || 0;
            }
            m.opacity = isTissueArch ? 1.0 : 0.25;
            m.transparent = !isTissueArch;
            m.needsUpdate = true;
          });
        }
      });

      // Highlight all meshes in target category or group with canonical color
      const highlightColor = structObj?.colorCode || "#F59E0B";
      const targetMeshes: THREE.Mesh[] = [];
      skeleton.traverse((c: any) => {
        if (c.isMesh) {
          const matchesTarget =
            isAxialGroup
              ? c.userData.boneGroup === "axial" || ["skull_cranium", "vertebral_column", "thoracic_cage"].includes(c.userData.boneCategory)
              : isAppendicularGroup
                ? c.userData.boneGroup === "appendicular" || ["pectoral_girdle", "pelvic_girdle", "upper_limbs", "lower_limbs"].includes(c.userData.boneCategory)
                : isTissueArch
                  ? c.userData.structureType === "bone"
                  : c.userData.boneCategory === catId ||
                  c.userData.structureId === catId ||
                  c.userData.structureId === dbKey ||
                  (c.userData.structureId && (c.userData.structureId.includes(catId) || catId.includes(c.userData.structureId))) ||
                  (c.name && c.name.toLowerCase().includes(catId.toLowerCase()));

          if (matchesTarget) {
            targetMeshes.push(c);
            if (c.material) {
              const mats = Array.isArray(c.material) ? c.material : [c.material];
              mats.forEach((m: any) => {
                if (isTissueArch) {
                  if (c.userData.originalColor && m.color) m.color.copy(c.userData.originalColor);
                  m.opacity = 1.0;
                  m.transparent = false;
                } else {
                  if (m.color) m.color.set(highlightColor);
                  if (m.emissive && typeof m.emissive.set === "function") {
                    m.emissive.set(highlightColor);
                    m.emissiveIntensity = isAxialGroup || isAppendicularGroup ? 0.4 : 0.5;
                  }
                  m.opacity = 1.0;
                  m.transparent = false;
                }
                m.needsUpdate = true;
              });
            }
          }
        }
      });

      if (targetMeshes.length > 0) {
        const box = new THREE.Box3();
        targetMeshes.forEach((m) => box.expandByObject(m));
        if (!box.isEmpty() && cameraRef.current) {
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const fovRad = cameraRef.current.fov * (Math.PI / 180);
          const aspect = cameraRef.current.aspect || 1.6;
          const fitHeightDist = size.y / (2 * Math.tan(fovRad / 2));
          const fitWidthDist = size.x / (2 * Math.tan(fovRad / 2) * aspect);
          const multiplier = isAxialGroup || isAppendicularGroup ? 1.35 : 1.4;
          const distance = Math.max(fitHeightDist, fitWidthDist, 0.35) * multiplier;
          targetCamLook.current.copy(center);
          targetCamPos.current.set(center.x, center.y, center.z + distance);
        }
      }
    } catch (err) {
      console.warn("[AyurSetu 3D Engine] Highlight error:", err);
    }
  };

  // Reset View Camera (Auto-fits 3D model bounding box, restores tissues, clears highlights)
  const handleResetCamera = () => {
    setSelectedBoneName(null);
    setSelectedStructure(null);
    handleShowAllTissues();
    setExplodeValue(0);
    autoFitCamera();
  };

  // ==========================================================================
  // 3. GLTF/GLB ASSET LOADER & SCENE INITIALIZATION (NO PROCEDURAL PRIMITIVES)
  // ==========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Canvas Background: Warm Alabaster Cream (#FBF9F5)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#FBF9F5");
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Position camera to display entire 1.70m human body in one frame
    camera.position.set(0, 0.85, 3.15);
    cameraRef.current = camera;
    targetCamPos.current.set(0, 0.85, 3.15);
    targetCamLook.current.set(0, 0.85, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to interactive schematic mode:", e);
      setWebglError(true);
      return;
    }
    renderer.setClearColor(0xfbf9f5, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.localClippingEnabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls: 360-Degree Orbital Rotation, Continuous Zooming (0.15 to 5.0), and Pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.85, 0);
    controls.minDistance = 0.15;
    controls.maxDistance = 5.0;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI;
    controlsRef.current = controls;

    // DYNAMIC CAMERA AUTO-FIT (BOX3 BOUNDING RE-CENTERING)
    // Guarantees active 3D model fills ~75% of viewport and remains centered
    const performCameraAutoFit = (explicitTarget?: THREE.Object3D) => {
      const activeModelGroup =
        explicitTarget ||
        (isSplitViewRef.current && splitContainerRef.current?.visible
          ? splitContainerRef.current
          : bodyGroupRef.current);
      if (!activeModelGroup || !cameraRef.current || !controlsRef.current) return;

      const box = new THREE.Box3().setFromObject(activeModelGroup);
      if (box.isEmpty()) return;

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      controlsRef.current.target.copy(center);
      const fitZ = center.z + (size.y > 0 ? size.y * 1.5 : 2.5);
      cameraRef.current.position.set(center.x, center.y, fitZ);
      targetCamLook.current.copy(center);
      targetCamPos.current.set(center.x, center.y, fitZ);
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
    };
    fitCameraHelperRef.current = performCameraAutoFit;
    autoFitCameraRef.current = performCameraAutoFit;

    // ENVIRONMENT LIGHTING & SHADER RE-ENGAGEMENT:
    // Calibrated with active 1.4 AmbientLight and dual DirectionalLight sources for maximum clarity
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(2, 4, 3);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.camera.far = 15;
    dirLight1.shadow.bias = -0.0005;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight2.position.set(-2, 2, -3);
    scene.add(dirLight2);

    // Root Body Group (Aligned at Origin 0, 0, 0)
    const rootBodyGroup = new THREE.Group();
    rootBodyGroup.position.set(0, 0, 0);
    scene.add(rootBodyGroup);
    bodyGroupRef.current = rootBodyGroup;

    // ------------------------------------------------------------------------
    // BONE REMODELING GPU PARTICLES (OSTEOBLASTS #D49B4B & OSTEOCLASTS #00E5FF)
    // ------------------------------------------------------------------------
    const particleCount = 600;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color("#D49B4B");
    const cyanColor = new THREE.Color("#00E5FF");

    for (let i = 0; i < particleCount; i++) {
      const y = 0.12 + Math.random() * 1.55;
      const isLimb = Math.random() > 0.4 && y < 1.3;
      const xSign = Math.random() > 0.5 ? 1 : -1;
      const x = isLimb ? xSign * (0.10 + Math.random() * 0.18) : (Math.random() - 0.5) * 0.20;
      const z = (Math.random() - 0.5) * 0.14;

      pPositions[i * 3] = x;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = z;

      const isOsteoblast = Math.random() > 0.4;
      const col = isOsteoblast ? goldColor : cyanColor;
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;
    }

    pGeometry.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeometry.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 0.016,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const bonePoints = new THREE.Points(pGeometry, pMaterial);
    bonePoints.name = "boneRemodelingParticles";
    rootBodyGroup.add(bonePoints);
    boneParticlesRef.current = bonePoints;

    // ------------------------------------------------------------------------
    // PRODUCTION GLTF ASSET LOADING PIPELINE (DRACO + DUAL-SEX + CDN FALLBACKS)
    // ------------------------------------------------------------------------
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const loadAllSystems = (targetSex: ModelSex) => {
      setLoadingFile(`Streaming 11 High-Accuracy Anatomical GLTF Models (${targetSex.toUpperCase()})...`);

      Object.values(ANATOMICAL_SYSTEMS).forEach((sys) => {
        let sysGroup = systemGroupsRef.current[sys.id];
        if (!sysGroup) {
          sysGroup = new THREE.Group();
          sysGroup.name = `System_${sys.id}`;
          rootBodyGroup.add(sysGroup);
          systemGroupsRef.current[sys.id] = sysGroup;
        } else {
          // Dispose and clear previous children when switching sex
          while (sysGroup.children.length > 0) {
            const child = sysGroup.children[0];
            sysGroup.remove(child);
            child.traverse((node: any) => {
              if (node.isMesh) {
                node.geometry?.dispose();
                if (Array.isArray(node.material)) {
                  node.material.forEach((m: any) => m.dispose());
                } else {
                  node.material?.dispose();
                }
              }
            });
          }
        }

        const urlQueue = getSystemUrlQueue(sys.id, targetSex);
        let queueIndex = 0;

        const tryLoadUrl = () => {
          if (queueIndex >= urlQueue.length) {
            console.error(`Exhausted all GLTF asset URLs for system ${sys.id} (${targetSex}).`);
            setLoadingErrors((prev) => ({ ...prev, [sys.id]: true }));
            return;
          }

          const currentUrl = urlQueue[queueIndex];
          queueIndex++;

          gltfLoader.load(
            currentUrl,
            (gltf) => {
              const loadedScene = gltf.scene || gltf.scenes[0];
              if (!loadedScene) {
                tryLoadUrl();
                return;
              }

              const mats: THREE.Material[] = [];

              if (sys.id === "cardiovascular") cardioGroupRef.current = sysGroup;
              if (sys.id === "respiratory") respGroupRef.current = sysGroup;
              if (sys.id === "digestive") digestiveGroupRef.current = sysGroup;
              if (sys.id === "skeletal") skeletonGroupRef.current = sysGroup;

              loadedScene.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  child.userData.systemId = sys.id;
                  child.userData.modelSex = targetSex;

                  // Realistic Skin Shell synchronization (MeshPhysicalMaterial with SSS depth & sheen)
                  if (sys.id === "integumentary") {
                    const skinMat = new THREE.MeshPhysicalMaterial({
                      color: new THREE.Color("#E2C3A8"),
                      roughness: 0.35,
                      metalness: 0.05,
                      transmission: skinModeRef.current === "transparent" ? 0.75 : 0.0,
                      transparent: skinModeRef.current !== "solid",
                      opacity:
                        skinModeRef.current === "transparent"
                          ? 0.15
                          : skinModeRef.current === "solid"
                            ? 1.0
                            : 0.0,
                      depthWrite: skinModeRef.current === "solid",
                      side: THREE.DoubleSide,
                      clearcoat: 0.2,
                      clearcoatRoughness: 0.25,
                      reflectivity: 0.5
                    });
                    skinMat.clippingPlanes = [];
                    child.material = skinMat;
                    mats.push(skinMat);
                  } else {
                    // Requirement 1: Ensure all loaded system materials have material.visible = true,
                    // material.opacity = 1.0 (unless skin shell transparency is explicitly requested), and material.depthWrite = true
                    if (child.material) {
                      const childMats = Array.isArray(child.material) ? child.material : [child.material];
                      childMats.forEach((m: any) => {
                        m.visible = true;
                        m.transparent = false;
                        m.opacity = 1.0;
                        m.depthWrite = true;
                        m.clippingPlanes = [];
                        m.side = THREE.DoubleSide;
                        mats.push(m);
                      });
                    }
                  }
                }
              });

              sysGroup.add(loadedScene);
              systemMaterialsRef.current[sys.id] = mats;

              // Apply current visibility
              sysGroup.visible = visibleSystemsRef.current
                ? Boolean(visibleSystemsRef.current[sys.id])
                : sys.id === "skeletal";

              if (sys.id === "integumentary") {
                sysGroup.visible =
                  skinModeRef.current !== "hidden" && Boolean(visibleSystemsRef.current?.[sys.id]);
              }

              setLoadedStatus((prev) => ({ ...prev, [sys.id]: true }));

              // Auto-fit camera on model load
              if (sys.id === "skeletal" || Object.keys(systemGroupsRef.current).length === 1) {
                performCameraAutoFit(rootBodyGroup);
              }

              if (isSplitViewRef.current && rebuildSplitGroupsRef.current) {
                rebuildSplitGroupsRef.current();
              }
            },
            undefined,
            (err) => {
              console.warn(`Failed loading ${sys.id} from ${currentUrl}:`, err);
              tryLoadUrl();
            }
          );
        };

        tryLoadUrl();
      });
    };

    // Bind reload handler ref for dynamic sex switching with scene re-attachment and Box3 auto-fit
    reloadModelsForSexRef.current = (sex: ModelSex) => {
      if (sceneRef.current && rootBodyGroup) {
        if (!sceneRef.current.children.includes(rootBodyGroup)) {
          sceneRef.current.add(rootBodyGroup);
        }
        (sceneRef.current as any).needsUpdate = true;
      }
      loadAllSystems(sex);
      performCameraAutoFit(rootBodyGroup);
    };

    // Initial asset load
    loadAllSystems(modelSexRef.current);

    // ------------------------------------------------------------------------
    // ANATOMICAL SPLIT-VIEW / EXPLODED LAYER GENERATOR
    // ------------------------------------------------------------------------
    const buildSplitGroups = () => {
      if (!sceneRef.current) return;
      if (splitContainerRef.current) {
        sceneRef.current.remove(splitContainerRef.current);
        splitContainerRef.current = null;
      }
      const splitContainer = new THREE.Group();
      splitContainer.name = "AnatomicalSplitContainer";

      const leftGroup = new THREE.Group();
      leftGroup.name = "SplitLeftHalf";
      const rightGroup = new THREE.Group();
      rightGroup.name = "SplitRightHalf";

      // Dispose any previously generated cross-sections
      crossSectionsRef.current.forEach((c) => c.dispose?.());
      crossSectionsRef.current = [];

      // Reset cloned groups for live physiological animation sync in split-view
      splitCardioClonesRef.current = [];
      splitRespClonesRef.current = [];
      splitDigestiveClonesRef.current = [];

      Object.entries(systemGroupsRef.current).forEach(([sysId, sysGroup]) => {
        if (!sysGroup || !sysGroup.visible) return;

        // Left half clone (cut by splitPlaneLeft)
        const leftClone = sysGroup.clone(true);
        leftClone.traverse((child: any) => {
          if (child.isMesh && child.material) {
            child.material = Array.isArray(child.material)
              ? child.material.map((m: any) => m.clone())
              : child.material.clone();
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m: any) => {
              m.clippingPlanes = [splitPlaneLeftRef.current];
              m.clipShadows = true;
              m.side = THREE.DoubleSide; // Exposes interior chambers & cut surfaces
              m.needsUpdate = true;
            });
          }
        });
        leftGroup.add(leftClone);

        // Procedural interior cross-section for Left half
        const leftCS = buildSystemCrossSection(sysId, true, splitPlaneLeftRef.current, modelSexRef.current);
        leftGroup.add(leftCS.group);
        crossSectionsRef.current.push(leftCS);

        // Right half clone (cut by splitPlaneRight)
        const rightClone = sysGroup.clone(true);
        rightClone.traverse((child: any) => {
          if (child.isMesh && child.material) {
            child.material = Array.isArray(child.material)
              ? child.material.map((m: any) => m.clone())
              : child.material.clone();
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m: any) => {
              m.clippingPlanes = [splitPlaneRightRef.current];
              m.clipShadows = true;
              m.side = THREE.DoubleSide; // Exposes interior chambers & cut surfaces
              m.needsUpdate = true;
            });
          }
        });
        rightGroup.add(rightClone);

        // Procedural interior cross-section for Right half
        const rightCS = buildSystemCrossSection(sysId, false, splitPlaneRightRef.current, modelSexRef.current);
        rightGroup.add(rightCS.group);
        crossSectionsRef.current.push(rightCS);

        // Track cloned organ groups for live split-view 60 FPS animation
        if (sysId === "cardiovascular") {
          splitCardioClonesRef.current.push(leftClone, rightClone);
        } else if (sysId === "respiratory") {
          splitRespClonesRef.current.push(leftClone, rightClone);
        } else if (sysId === "digestive") {
          splitDigestiveClonesRef.current.push(leftClone, rightClone);
        }
      });

      splitContainer.add(leftGroup);
      splitContainer.add(rightGroup);
      sceneRef.current.add(splitContainer);

      splitGroupLeftRef.current = leftGroup;
      splitGroupRightRef.current = rightGroup;
      splitContainerRef.current = splitContainer;
    };
    rebuildSplitGroupsRef.current = buildSplitGroups;

    // ------------------------------------------------------------------------
    // INTERACTIVE CROSS-SYSTEM RAYCASTING & ANATOMICAL INSPECTION
    // ------------------------------------------------------------------------
    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), camera);

      // Collect active groups from split container if split is active, else visible system groups
      const activeGroups: THREE.Object3D[] = [];
      if (isSplitViewRef.current && splitContainerRef.current && splitContainerRef.current.visible) {
        activeGroups.push(splitContainerRef.current);
      } else {
        Object.entries(systemGroupsRef.current).forEach(([, group]) => {
          if (group && group.visible) {
            activeGroups.push(group);
          }
        });
      }
      if (activeGroups.length === 0) return;

      const intersects = raycasterRef.current.intersectObjects(activeGroups, true);
      if (intersects.length > 0) {
        // Direct click on exposed cross-sectional interior structure
        const interiorHit = intersects.find((i) => i.object.userData?.isInteriorLayer);
        if (interiorHit && interiorHit.object.userData?.interiorPinId) {
          const pinId = interiorHit.object.userData.interiorPinId;
          if (INTERIOR_HISTOLOGY_DATABASE[pinId]) {
            handleSelectPin(INTERIOR_HISTOLOGY_DATABASE[pinId]);
            const [ix, iy, iz] = INTERIOR_HISTOLOGY_DATABASE[pinId].worldAnchor || INTERIOR_HISTOLOGY_DATABASE[pinId].anchor;
            activeDiagramAnchor.current.set(ix, iy, iz);
            if (interiorHit.object instanceof THREE.Mesh && interiorHit.object.material) {
              const mat = interiorHit.object.material as THREE.MeshStandardMaterial;
              const prevColor = mat.emissive ? mat.emissive.clone() : new THREE.Color(0);
              mat.emissive = new THREE.Color("#D49B4B");
              mat.emissiveIntensity = 0.6;
              setTimeout(() => {
                mat.emissive = prevColor;
                mat.emissiveIntensity = 0.2;
              }, 1200);
            }
            return;
          }
        }

        let hitMesh: any = null;
        let skinMesh: any = null;

        for (const hit of intersects) {
          if (hit.object && (hit.object as any).isMesh) {
            // Strict filter: Ignore invisible meshes or structures hidden by tissue/system toggles
            if (!hit.object.visible) continue;
            let parentVisible = true;
            let curr: THREE.Object3D | null = hit.object.parent;
            while (curr && curr !== scene) {
              if (!curr.visible) {
                parentVisible = false;
                break;
              }
              curr = curr.parent;
            }
            if (!parentVisible) continue;

            // Check if hit object is the translucent outer skin shell
            const isSkin = hit.object.userData.systemId === "integumentary" ||
              (hit.object.name || "").toLowerCase().includes("skin") ||
              (hit.object.name || "").toLowerCase().includes("body");
            const meshMat = (hit.object as any).material;
            const isSkinTranslucent = isSkin && ((meshMat?.opacity ?? 1) < 0.5);

            if (isSkinTranslucent && !skinMesh) {
              skinMesh = hit.object;
              continue; // Look deeper to see if an internal organ or bone was clicked
            }

            hitMesh = hit.object;
            break;
          }
        }

        // If only skin was hit, select skin only if specifically inspecting integumentary system
        if (!hitMesh && skinMesh && (!preserveSkinSilhouetteRef.current || activeSystemId === "integumentary")) {
          hitMesh = skinMesh;
        }

        if (hitMesh) {
          // Auto-open right sidebar inspector when any structure is clicked
          setRightSidebarOpen(true);

          // Dynamic category/system color shift & non-selected structure dimming (0.25 opacity)
          highlightMesh(hitMesh);

          // Resolve canonical AnatomicalStructureData conforming to interface
          const structData = resolveAnatomicalStructureData(hitMesh);
          setSelectedStructure(structData);
          if (hitMesh.userData.boneName) setSelectedBoneName(hitMesh.userData.boneName);
          if (hitMesh.userData.boneCategory) setSelectedBoneCategory(hitMesh.userData.boneCategory);

          // Position 3D Diagram Leader Line Anchor on mesh
          const clickPoint = intersects.find((i) => i.object === hitMesh)?.point;
          if (clickPoint) {
            activeDiagramAnchor.current.copy(clickPoint);
          } else {
            const b = new THREE.Box3().setFromObject(hitMesh);
            b.getCenter(activeDiagramAnchor.current);
          }

          // Smoothly animate camera to center directly on centroid over 0.8s
          focusCameraOnMesh(hitMesh);
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // ------------------------------------------------------------------------
    // REAL-TIME ANIMATION LOOP (60 FPS)
    // ------------------------------------------------------------------------
    const startTime = performance.now();
    let lastTime = startTime;

    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const time = (now - startTime) * 0.001;
      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isRotatingRef.current;
        controlsRef.current.update();
      }

      // Smooth Camera Interpolation
      if (cameraRef.current && controlsRef.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetCamLook.current, 0.08);
      }

      // 0. Anatomical Split-View Dual Plane Symmetrical Separation (0.6s smooth spring)
      const targetSplit = isSplitViewRef.current ? 1.0 : 0.0;
      splitProgressRef.current = THREE.MathUtils.lerp(splitProgressRef.current, targetSplit, 0.09);

      if (splitProgressRef.current > 0.005) {
        if (!splitContainerRef.current || !splitGroupLeftRef.current || !splitGroupRightRef.current) {
          buildSplitGroups();
        }
        if (splitContainerRef.current && splitGroupLeftRef.current && splitGroupRightRef.current && rootBodyGroup) {
          splitContainerRef.current.visible = true;
          rootBodyGroup.visible = false;
          // Dynamic translation based on user's Symmetrical Split Distance slider (0 to 0.26m)
          const maxSeparation = 0.26;
          const currentOffset = (splitDistancePercentRef.current / 100) * maxSeparation * splitProgressRef.current;
          splitGroupLeftRef.current.position.x = -currentOffset;
          splitGroupRightRef.current.position.x = currentOffset;
          splitPlaneLeftRef.current.set(new THREE.Vector3(-1, 0, 0), -currentOffset);
          splitPlaneRightRef.current.set(new THREE.Vector3(1, 0, 0), -currentOffset);
        }
      } else if (splitContainerRef.current && splitContainerRef.current.visible && rootBodyGroup) {
        splitContainerRef.current.visible = false;
        rootBodyGroup.visible = true;
      }

      // Requirement 1: WebGL Render Loop Scene Re-attachment & Mesh Visibility Verification
      if (rootBodyGroup && sceneRef.current) {
        if (!sceneRef.current.children.includes(rootBodyGroup) && (!isSplitViewRef.current || splitProgressRef.current <= 0.005)) {
          sceneRef.current.add(rootBodyGroup);
          (sceneRef.current as any).needsUpdate = true;
        }
      }

      // Continuous system visibility and clipping plane reset
      const isSplitEngaged = isSplitViewRef.current && splitProgressRef.current > 0.005;
      Object.entries(systemGroupsRef.current).forEach(([sysKey, grp]) => {
        if (!grp) return;
        const sysId = sysKey as SystemId;
        const isSysVis = visibleSystemsRef.current ? Boolean(visibleSystemsRef.current[sysId]) : false;

        if (sysId === "integumentary") {
          grp.visible = isSysVis && skinModeRef.current !== "hidden";
        } else {
          grp.visible = isSysVis;
        }

        // Reset material clipping planes on all system meshes whenever Split-View is not actively engaged
        if (!isSplitEngaged) {
          grp.traverse((child: any) => {
            if (child.isMesh && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m: any) => {
                if (m.clippingPlanes && m.clippingPlanes.length > 0) {
                  m.clippingPlanes = [];
                  m.needsUpdate = true;
                }
                if (sysId === "integumentary") {
                  m.visible = skinModeRef.current !== "hidden";
                  if (skinModeRef.current === "transparent") {
                    m.transparent = true;
                    m.opacity = 0.15;
                    m.depthWrite = false;
                  } else if (skinModeRef.current === "solid") {
                    m.transparent = false;
                    m.opacity = 1.0;
                    m.depthWrite = true;
                  } else {
                    m.transparent = true;
                    m.opacity = 0.0;
                    m.depthWrite = false;
                  }
                } else {
                  if (!m.visible) m.visible = true;
                  if (m.opacity !== 1.0) m.opacity = 1.0;
                  if (!m.depthWrite) m.depthWrite = true;
                  if (m.transparent) m.transparent = false;
                }
              });
            }
          });
        }
      });

      // REAL-TIME PHYSIOLOGICAL STATE PACKET FOR SPLIT-VIEW & CORE ENGINES
      const physioState: PhysiologicalState = {
        heartRateBPM: heartRateBPMRef.current,
        respirationRateRPM: respirationRateRPMRef.current,
        gastricPH: gastricPHRef.current,
        peristalticSpeed: peristalticSpeedRef.current,
        muscleContraction: muscleContractionPercentRef.current / 100,
        jointArticulationAngle: jointArticulationAngleRef.current,
        boneDensity: boneDensityRef.current,
        alveolarDiffusionActive: alveolarDiffusionRef.current,
        actionPotentialRate: 2.5,
        cardiacPhaseStage: cardiacPhaseStageRef.current,
        bloodVesselLayerInspector: bloodVesselLayerInspectorRef.current,
        isPaused: isPausedRef.current
      };

      // Real-time update of all active bisected interior layers (valves, blood particles, rugae, alveoli, sarcomeres)
      if (crossSectionsRef.current.length > 0) {
        crossSectionsRef.current.forEach((cs) => {
          cs.update?.(time, delta, physioState);
        });
      }

      if (!isPausedRef.current) {
        // 1. Cardiovascular Pulse (BPM Slider & Cardiac Phase Controls)
        const bpmFrequency = (heartRateBPMRef.current / 60) * Math.PI * 2;
        let systole = 1.0 + 0.06 * Math.sin(time * bpmFrequency) * Math.pow(Math.max(0, Math.sin(time * (bpmFrequency * 0.5))), 4);
        if (cardiacPhaseStageRef.current === "systole") systole = 1.06;
        if (cardiacPhaseStageRef.current === "diastole") systole = 0.96;

        if (cardioGroupRef.current) {
          cardioGroupRef.current.scale.set(systole, systole, systole);
        }
        splitCardioClonesRef.current.forEach((cl) => cl.scale.set(systole, systole, systole));

        // 2. Respiratory Rhythm (RPM Slider)
        const rpmFrequency = (respirationRateRPMRef.current / 60) * Math.PI * 2;
        const lungExpansion = 1.0 + 0.05 * Math.sin(time * rpmFrequency);
        if (respGroupRef.current) {
          respGroupRef.current.scale.set(lungExpansion, lungExpansion, lungExpansion);
        }
        splitRespClonesRef.current.forEach((cl) => cl.scale.set(lungExpansion, lungExpansion, lungExpansion));

        // 3. Gastric pH Chemical Color Shift
        const curPH = gastricPHRef.current;
        const normPH = (curPH - 1.5) / 5.5;
        const acidColor = new THREE.Color(0xff3300);
        const neutralColor = new THREE.Color(0x4caf50);

        const updateDigestiveMats = (mats: THREE.Material[]) => {
          mats.forEach((m: any) => {
            if ("color" in m) {
              m.color.lerpColors(acidColor, neutralColor, normPH * 0.35);
            }
          });
        };
        const digestiveMats = systemMaterialsRef.current["digestive"];
        if (digestiveMats && digestiveMats.length > 0) updateDigestiveMats(digestiveMats);
        splitDigestiveClonesRef.current.forEach((cl) => {
          cl.traverse((c: any) => {
            if (c.isMesh && c.material) {
              const cmats = Array.isArray(c.material) ? c.material : [c.material];
              updateDigestiveMats(cmats);
            }
          });
        });

        // 4. Bone Remodeling Particle Motion (Ca2+ / Hydroxyapatite flux)
        if (boneParticlesRef.current && boneRemodelingEnabledRef.current) {
          const positions = boneParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const count = positions.length / 3;
          const rateMultiplier = boneMineralizationRateRef.current * (boneDensityRef.current || 1.0);
          for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += 0.0012 * rateMultiplier;
            if (positions[i * 3 + 1] > 1.68) {
              positions[i * 3 + 1] = 0.12;
            }
          }
          boneParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          boneParticlesRef.current.visible = true;
        } else if (boneParticlesRef.current) {
          boneParticlesRef.current.visible = false;
        }

        // 5. Radial Exploded View Outward Offset along Centroid Vectors
        const explodeNorm = explodeValueRef.current / 100;
        Object.entries(ANATOMICAL_SYSTEMS).forEach(([sysKey, meta]) => {
          const grp = systemGroupsRef.current[sysKey as SystemId];
          if (grp) {
            const targetX = meta.explodeVec[0] * explodeNorm;
            const targetY = meta.explodeVec[1] * explodeNorm;
            const targetZ = meta.explodeVec[2] * explodeNorm;
            grp.position.x = THREE.MathUtils.lerp(grp.position.x, targetX, 0.08);
            grp.position.y = THREE.MathUtils.lerp(grp.position.y, targetY, 0.08);
            grp.position.z = THREE.MathUtils.lerp(grp.position.z, targetZ, 0.08);
          }
        });

      }

      // 6. Real-time 3D DOM Sprite Pins Screen Projection (60 FPS)
      if (container && cameraRef.current) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const projV = new THREE.Vector3();

        Object.values(INTERIOR_HISTOLOGY_DATABASE).forEach((pin) => {
          const pinEl = pinElementsRef.current[pin.id];
          if (!pinEl) return;

          const isSysVisible = visibleSystemsRef.current ? Boolean(visibleSystemsRef.current[pin.systemId as SystemId]) : false;
          const isSysActive = activeSystemIdRef.current === pin.systemId;
          const shouldShow = isSplitViewRef.current ? isSysVisible : isSysActive;

          if (!shouldShow) {
            pinEl.style.display = "none";
            return;
          }

          const [ax, ay, az] = pin.worldAnchor || pin.anchor;
          projV.set(ax, ay, az);
          if (splitProgressRef.current > 0.005) {
            const maxSeparation = 0.26;
            const currentOffset = (splitDistancePercentRef.current / 100) * maxSeparation * splitProgressRef.current;
            projV.x += projV.x < 0 ? -currentOffset : currentOffset;
          }

          projV.project(cameraRef.current!);
          const isFront = projV.z > -1.0 && projV.z < 1.0;
          const screenX = (projV.x * 0.5 + 0.5) * w;
          const screenY = (-projV.y * 0.5 + 0.5) * h;
          const inBounds = screenX >= 25 && screenX <= w - 25 && screenY >= 25 && screenY <= h - 25;

          if (isFront && inBounds) {
            pinEl.style.display = "flex";
            pinEl.style.left = `${screenX}px`;
            pinEl.style.top = `${screenY}px`;
          } else {
            pinEl.style.display = "none";
          }
        });
      }

      // 7. Real-Time 3D Labeled Diagram Leader Line Screen Projection (60 FPS)
      // Requirement 4: UI OVERLAY DETACHMENT PREVENTION: Verify target 3D mesh is loaded and visible
      let isTarget3DMeshActive = false;

      if (diagramEngineActiveRef.current && container && cameraRef.current) {
        if (isSplitViewRef.current && splitProgressRef.current > 0.005) {
          isTarget3DMeshActive = Boolean(splitContainerRef.current && splitContainerRef.current.visible && selectedStructureRef.current);
        } else if (rootBodyGroup && rootBodyGroup.visible) {
          if (selectedStructureRef.current) {
            const struct = selectedStructureRef.current;
            const catLower = (struct.category || "").toLowerCase();
            let sysId: SystemId = "skeletal";
            if (catLower.includes("cardio")) sysId = "cardiovascular";
            else if (catLower.includes("nerv")) sysId = "nervous";
            else if (catLower.includes("digest")) sysId = "digestive";
            else if (catLower.includes("resp")) sysId = "respiratory";
            else if (catLower.includes("integ") || catLower.includes("skin")) sysId = "integumentary";
            else if (catLower.includes("lymph")) sysId = "lymphatic";
            else if (catLower.includes("endocr")) sysId = "endocrine";
            else if (catLower.includes("urin")) sysId = "urinary";
            else if (catLower.includes("reprod")) sysId = "reproductive";
            else if (catLower.includes("musc")) sysId = "muscular";

            const grp = systemGroupsRef.current[sysId];
            const isSysVis = visibleSystemsRef.current ? Boolean(visibleSystemsRef.current[sysId]) : false;
            isTarget3DMeshActive = Boolean(isSysVis && grp && grp.visible && grp.children.length > 0);
          }
        }
      }

      if (
        isTarget3DMeshActive &&
        diagramEngineActiveRef.current &&
        container &&
        cameraRef.current &&
        leaderLineSvgRef.current &&
        anchorDotRef.current &&
        leaderTagRef.current
      ) {
        const anchor = activeDiagramAnchor.current;
        if (anchor) {
          const proj = anchor.clone().project(cameraRef.current);
          const isFront = proj.z > -1.0 && proj.z < 1.0;
          const w = container.clientWidth;
          const h = container.clientHeight;
          const sx = (proj.x * 0.5 + 0.5) * w;
          const sy = (-proj.y * 0.5 + 0.5) * h;
          const inBounds = sx >= 20 && sx <= w - 20 && sy >= 20 && sy <= h - 20;

          if (isFront && inBounds) {
            anchorDotRef.current.setAttribute("cx", sx.toString());
            anchorDotRef.current.setAttribute("cy", sy.toString());
            anchorDotRef.current.style.display = "block";

            if (anchorPulseRef.current) {
              anchorPulseRef.current.setAttribute("cx", sx.toString());
              anchorPulseRef.current.setAttribute("cy", sy.toString());
              anchorPulseRef.current.style.display = "block";
            }

            // Determine horizontal offset direction: if anchor is on left half, place tag to right
            const isRightSide = sx < w * 0.55;
            const elbowX = isRightSide ? sx + 50 : sx - 50;
            const elbowY = Math.max(30, sy - 40);
            const endX = isRightSide ? elbowX + 35 : elbowX - 35;

            leaderLineSvgRef.current.setAttribute(
              "points",
              `${sx},${sy} ${elbowX},${elbowY} ${endX},${elbowY}`
            );
            leaderLineSvgRef.current.style.display = "block";

            const tagEl = leaderTagRef.current;
            tagEl.style.display = "block";
            tagEl.style.opacity = "1";
            if (isRightSide) {
              tagEl.style.left = `${endX + 8}px`;
              tagEl.style.top = `${Math.max(10, elbowY - 28)}px`;
              tagEl.style.transform = "none";
            } else {
              tagEl.style.left = `${endX - 8}px`;
              tagEl.style.top = `${Math.max(10, elbowY - 28)}px`;
              tagEl.style.transform = "translateX(-100%)";
            }
          } else {
            leaderLineSvgRef.current.style.display = "none";
            anchorDotRef.current.style.display = "none";
            if (anchorPulseRef.current) anchorPulseRef.current.style.display = "none";
            leaderTagRef.current.style.display = "none";
          }
        }
      } else if (leaderLineSvgRef.current && leaderTagRef.current) {
        leaderLineSvgRef.current.style.display = "none";
        if (anchorDotRef.current) anchorDotRef.current.style.display = "none";
        if (anchorPulseRef.current) anchorPulseRef.current.style.display = "none";
        leaderTagRef.current.style.display = "none";
        leaderTagRef.current.style.opacity = "0";
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      if (splitContainerRef.current && sceneRef.current) {
        sceneRef.current.remove(splitContainerRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Update Dynamic Clipping Plane
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.localClippingEnabled = clippingEnabled;

    const sign = clipInverted ? -1 : 1;
    let normal = new THREE.Vector3(0, 0, -1);
    if (clipAxis === "x") normal = new THREE.Vector3(sign, 0, 0);
    else if (clipAxis === "y") normal = new THREE.Vector3(0, sign, 0);
    else if (clipAxis === "z") normal = new THREE.Vector3(0, 0, sign);

    clipPlaneRef.current.set(normal, clipDistance);
  }, [clippingEnabled, clipAxis, clipDistance, clipInverted]);

  const loadedCount = Object.values(loadedStatus).filter(Boolean).length;
  const errorCount = Object.values(loadingErrors).filter(Boolean).length;
  const isInitialLoading = (loadedCount + errorCount) < 11;
  const overallPercent = Math.min(100, Math.round(((loadedCount + errorCount) / 11) * 100));

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0D2B1D] flex flex-col selection:bg-[#0D2B1D] selection:text-white transition-colors duration-300 font-sans">
      {/* 1. Upper Public Header Navbar */}
      <Navbar />

      {/* 2. Top Title Bar & Production GLTF Pipeline Indicator */}
      <header className="px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-[#07160e]/80 backdrop-blur-md border-b border-[rgba(212,155,75,0.25)] flex flex-wrap items-center justify-between gap-3 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0D2B1D] text-[#D49B4B] flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-serif-heading text-[#0D2B1D] dark:text-[#EAE3D2] tracking-tight">
                AyurSetu 11-System Anatomical 3D Engine
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" />
                GLTF 2.0 PRODUCTION
              </span>
            </div>
            <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] font-serif">
              Sharira Rachana (शरीर रचना) • High-Accuracy 3D GLTF Meshes & Real-Time Biochemistry
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLearningStudioOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0D2B1D] to-[#174630] text-[#D49B4B] border border-[#D49B4B]/60 text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ring-1 ring-[#D49B4B]/30"
            title="Open BAMS Anatomy & Interactive Learning Studio"
          >
            <BookOpen className="w-4 h-4 text-[#D49B4B]" />
            <span>🎓 BAMS Learning Studio</span>
          </button>
          <span className="text-[11px] font-mono text-[#627067] px-2.5 py-1 rounded-lg bg-black/5 hidden sm:inline-block">
            Loaded: {loadedCount}/11 GLTF Models
          </span>
          <button
            type="button"
            onClick={handleXRayPreset}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Toggle X-Ray Transparency View"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D49B4B]" />
            <span>X-Ray View</span>
          </button>
          <button
            type="button"
            onClick={() => setMacroMicroModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#0D2B1D] text-[#D49B4B] text-xs font-bold hover:bg-[#153e2b] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Macro-to-Micro Modal</span>
          </button>
          <button
            type="button"
            onClick={handleToggleFocusCanvas}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${allPanelsHidden
              ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] ring-2 ring-[#D49B4B]/30"
              : "bg-white dark:bg-white/5 border-[rgba(212,155,75,0.3)] text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9]"
              }`}
            title="Focus Canvas: Collapse or Restore All Side Panels for 360° Inspection (HotKey: 'F')"
          >
            <Square className="w-3.5 h-3.5 text-[#D49B4B]" />
            <span>{allPanelsHidden ? "Restore Panels" : "🔲 Focus Canvas / Hide All Panels"}</span>
          </button>
          <button
            type="button"
            onClick={() => setDiagramEngineActive(!diagramEngineActive)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${diagramEngineActive
              ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B]/80"
              : "bg-white dark:bg-white/5 border-[rgba(212,155,75,0.3)] text-gray-500 hover:bg-[#F8F3E9]"
              }`}
            title="Toggle 3D Labeled Diagram Engine & Interactive Leader Lines"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#D49B4B]" />
            <span className="hidden xl:inline">3D Diagram Labels</span>
          </button>
          <button
            type="button"
            onClick={() => setLearningStudioOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0D2B1D] to-[#1a4a33] text-[#D49B4B] border border-[#D49B4B]/60 text-xs font-bold hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Open BAMS Anatomy Learning Studio (Curriculum, AI Companion, Quizzes, Flashcards & Revision)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D49B4B]" />
            <span>BAMS Learning Studio</span>
            {studiedStructures.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#D49B4B] text-[#0D2B1D] font-mono font-bold">
                {studiedStructures.length}
              </span>
            )}
          </button>
          <Link
            href="/student/ecosystem"
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Navigate to BAMS NCISM Syllabus & Learning Ecosystem"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">BAMS Syllabus Hub</span>
          </Link>
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] transition-all cursor-pointer"
            title="Reset Camera Orientation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Workspace: Viewport & Floating Vedic Glass Panels */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">

        {/* ----------------------------------------------------------------- */}
        {/* LEFT CONTROL MATRIX PANEL: 11 GLTF SYSTEMS, SLIDERS & CLIPPING    */}
        {/* ----------------------------------------------------------------- */}
        {leftSidebarOpen ? (
          <aside className="w-full lg:w-96 xl:w-[420px] bg-white/85 dark:bg-[#07160e]/85 backdrop-blur-xl border-r border-[rgba(212,155,75,0.25)] p-4 overflow-y-auto flex flex-col gap-4 z-20 shadow-xl max-h-[calc(100vh-112px)] transition-all duration-300">
            {/* Header with Minimize Button */}
            <div className="flex items-center justify-between pb-1 border-b border-[rgba(212,155,75,0.2)]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D49B4B]" />
                <span className="text-xs font-bold uppercase tracking-wider font-serif-heading text-[#0D2B1D] dark:text-[#EAE3D2]">
                  System Controls
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLeftSidebarOpen(false)}
                className="px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[#0D2B1D] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-semibold"
                title="Minimize System Controls Panel to 48px Strip"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Minimize &lt;</span>
              </button>
            </div>

            {/* Navigation Tab Bar */}
            <div className="grid grid-cols-4 p-1 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/20 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab("systems")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === "systems" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-[#627067] hover:text-[#0D2B1D]"
                  }`}
              >
                11 GLTF
              </button>
              <button
                onClick={() => setActiveTab("sliders")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === "sliders" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-[#627067] hover:text-[#0D2B1D]"
                  }`}
              >
                Physiology
              </button>
              <button
                onClick={() => setActiveTab("clipping")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === "clipping" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-[#627067] hover:text-[#0D2B1D]"
                  }`}
              >
                Clipping
              </button>
              <button
                onClick={() => setActiveTab("cellular")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === "cellular" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-[#627067] hover:text-[#0D2B1D]"
                  }`}
              >
                Biochem
              </button>
            </div>

            {/* TAB 1: 11 PRODUCTION GLTF SYSTEMS & OPACITY MATRIX */}
            {activeTab === "systems" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D49B4B]" />
                    11 GLTF System Meshes
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSoloSystem("skeletal")}
                      className="text-[10px] font-mono font-bold text-[#627067] dark:text-[#A9B9AE] hover:text-[#D49B4B] cursor-pointer"
                      title="Solo Skeletal System"
                    >
                      Solo Bones
                    </button>
                    <button
                      type="button"
                      onClick={handleShowAllSystems}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D49B4B]/20 hover:bg-[#D49B4B] text-[#D49B4B] hover:text-white transition-all cursor-pointer shadow-2xs"
                      title="Select All 11 Systems with 15% Translucent Skin Shell Overlay"
                    >
                      SELECT ALL (11)
                    </button>
                  </div>
                </div>

                {/* Systems List with Multi-Select Checkboxes and Status Badges */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {Object.values(ANATOMICAL_SYSTEMS).map((sys) => {
                    const isVisible = visibleSystems[sys.id];
                    const opacity = systemOpacities[sys.id];
                    const isSelected = activeSystemId === sys.id;
                    const isModelReady = loadedStatus[sys.id];
                    const otherActiveCount = (Object.keys(visibleSystems) as SystemId[]).filter(
                      (k) => k !== "skeletal" && visibleSystems[k]
                    ).length;
                    const isCompulsorySkeletal = sys.id === "skeletal" && otherActiveCount >= 1;

                    return (
                      <div
                        key={sys.id}
                        onClick={() => handleSelectSystem(sys.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                          ? "bg-[#F8F3E9] dark:bg-white/10 border-[#D49B4B] shadow-xs"
                          : "bg-white/60 dark:bg-white/5 border-[rgba(212,155,75,0.18)] hover:border-[#D49B4B]/50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden min-w-0">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              disabled={isCompulsorySkeletal}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!isCompulsorySkeletal) {
                                  toggleSystemVisibility(sys.id);
                                }
                              }}
                              className={`w-3.5 h-3.5 accent-[#D49B4B] rounded shrink-0 ${isCompulsorySkeletal ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                                }`}
                              title={
                                isCompulsorySkeletal
                                  ? "Compulsory foundation framework in multi-system overlay mode"
                                  : isVisible
                                    ? `Hide ${sys.name}`
                                    : `Show ${sys.name}`
                              }
                            />
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: sys.colorHex }}
                            />
                            <div className="truncate">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] truncate">
                                  {sys.name}
                                </h4>
                                {isCompulsorySkeletal && (
                                  <span
                                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40"
                                    title="Compulsory foundation framework anchoring viscera, vessels, and nerves"
                                  >
                                    Anchor: Compulsory
                                  </span>
                                )}
                                {isModelReady && (
                                  <span className="text-[8.5px] font-mono px-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                                    GLB
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#627067] dark:text-[#A9B9AE] truncate font-serif">
                                {sys.sanskritName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleSoloSystem(sys.id)}
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 hover:bg-[#D49B4B] hover:text-white transition-colors cursor-pointer"
                              title="Solo this system (360° isolated view, overrides multi-system rules)"
                            >
                              SOLO
                            </button>
                            <button
                              type="button"
                              disabled={isCompulsorySkeletal}
                              onClick={() => {
                                if (!isCompulsorySkeletal) {
                                  toggleSystemVisibility(sys.id);
                                }
                              }}
                              className={`p-1 rounded-lg transition-colors ${isCompulsorySkeletal
                                ? "cursor-not-allowed opacity-60 text-amber-600 dark:text-amber-400"
                                : isVisible
                                  ? "cursor-pointer text-[#0D2B1D] dark:text-[#EAE3D2]"
                                  : "cursor-pointer text-gray-400"
                                }`}
                              title={
                                isCompulsorySkeletal
                                  ? "Skeletal system is locked as compulsory base anchor while other systems are active"
                                  : isVisible
                                    ? "Hide system"
                                    : "Show system"
                              }
                            >
                              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Individual Layer Opacity Slider */}
                        {isVisible && (
                          <div className="mt-2 pt-2 border-t border-[rgba(212,155,75,0.15)] flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#627067] dark:text-[#A9B9AE] w-12 shrink-0">
                              Opacity: {Math.round(opacity * 100)}%
                            </span>
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.05"
                              value={opacity}
                              onChange={(e) => handleSystemOpacityChange(sys.id, parseFloat(e.target.value))}
                              className="w-full accent-[#D49B4B] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: DYNAMIC CONTEXT-AWARE PHYSIOLOGY & WORKING FUNCTION MATRIX */}
            {activeTab === "sliders" && (() => {
              // Determine whether we are in single/solo system context or multi-system overview
              const nonSkinActive = (Object.keys(visibleSystems) as SystemId[]).filter(
                (k) => visibleSystems[k] && (preserveSkinSilhouette ? k !== "integumentary" : true)
              );
              const isSingleSolo = nonSkinActive.length === 1 && !multiSystemPhysioExpanded;
              const targetSysId: SystemId = isSingleSolo ? nonSkinActive[0] : activeSystemId;
              const targetMeta = ANATOMICAL_SYSTEMS[targetSysId];

              return (
                <div className="space-y-3.5">
                  {/* Contextual Mode State Banner */}
                  <div className="p-2.5 rounded-xl bg-[#0D2B1D] text-[#D49B4B] border border-[#D49B4B]/40 shadow-xs flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div className="truncate">
                        <span className="font-mono text-[10px] uppercase tracking-wider block opacity-75">
                          {isSingleSolo ? "🎯 Solo System Context" : "🌐 Multi-System Suite"}
                        </span>
                        <span className="font-bold font-serif-heading text-[#EAE3D2] truncate">
                          {isSingleSolo ? targetMeta?.name : "All 11 Systems Active"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMultiSystemPhysioExpanded(!multiSystemPhysioExpanded)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#EAE3D2] text-[10px] font-mono font-semibold cursor-pointer shrink-0 transition-colors"
                      title="Toggle between single system contextual mode and all controls"
                    >
                      {isSingleSolo ? "Show All Controls" : "Context Filter"}
                    </button>
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* 01_SKELETAL CONTEXT CONTROLS                                  */}
                  {/* ------------------------------------------------------------- */}
                  {(isSingleSolo ? targetSysId === "skeletal" : true) && (
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-amber-500/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                        <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5 font-serif-heading">
                          <span>🦴</span> Skeletal Biomechanics &amp; Articulation
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                          01_SKELETAL
                        </span>
                      </div>

                      {/* Joint Articulation Angle Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Knee / Joint Articulation Angle:
                          </span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {jointArticulationAngle}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="1"
                          value={jointArticulationAngle}
                          onChange={(e) => setJointArticulationAngle(parseInt(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Extension (0°)</span>
                          <span>Mid-Flexion (45°)</span>
                          <span>Deep Flexion (90°)</span>
                        </div>
                      </div>

                      {/* Bone Density / Mineralization (T-Score) */}
                      <div className="space-y-1.5 pt-1 border-t border-amber-500/15">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Bone Density (Asthi Mineralization):
                          </span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {boneDensity.toFixed(2)}x (T: {((boneDensity - 1.0) * 2.5).toFixed(1)})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.05"
                          value={boneDensity}
                          onChange={(e) => setBoneDensity(parseFloat(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Osteoporotic (0.5x)</span>
                          <span>Normal (1.0x)</span>
                          <span>Osteosclerotic (1.5x)</span>
                        </div>
                      </div>

                      {/* Bone Remodeling Dynamic Particle Flux Toggle */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-[#627067] dark:text-[#A9B9AE]">
                          Osteoblast / Osteoclast Remodeling Flux:
                        </span>
                        <button
                          type="button"
                          onClick={() => setBoneRemodelingEnabled(!boneRemodelingEnabled)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${boneRemodelingEnabled
                            ? "bg-amber-600 text-white"
                            : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                            }`}
                        >
                          {boneRemodelingEnabled ? "FLUX ACTIVE" : "PAUSED"}
                        </button>
                      </div>

                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* 02_CARDIOVASCULAR CONTEXT CONTROLS                            */}
                  {/* ------------------------------------------------------------- */}
                  {(isSingleSolo ? targetSysId === "cardiovascular" : true) && (
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-red-500/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                        <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5 font-serif-heading">
                          <Heart className="w-4 h-4 fill-current text-red-500 animate-pulse" />
                          Cardiovascular Hemodynamics
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold">
                          02_CARDIO
                        </span>
                      </div>

                      {/* Heart Rate Slider (BPM) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Heart Rate (Hridaya Spandana):
                          </span>
                          <span className="font-mono font-bold text-red-600 dark:text-red-400">
                            {heartRateBPM} BPM
                          </span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="180"
                          step="2"
                          value={heartRateBPM}
                          onChange={(e) => setHeartRateBPM(parseInt(e.target.value))}
                          className="w-full accent-red-600 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Bradycardia (40)</span>
                          <span>Normal (72)</span>
                          <span>Tachycardia (180)</span>
                        </div>
                      </div>

                      {/* Systole / Diastole Phase Controls */}
                      <div className="space-y-1 pt-1 border-t border-red-500/15">
                        <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">
                          Cardiac Cycle Phase Lock:
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                          {[
                            { id: "auto", label: "⚡ Auto Cycle" },
                            { id: "systole", label: "🔴 Force Systole" },
                            { id: "diastole", label: "🔵 Force Diastole" }
                          ].map((phase) => (
                            <button
                              key={phase.id}
                              type="button"
                              onClick={() => setCardiacPhaseStage(phase.id as any)}
                              className={`py-1 rounded-lg border text-center font-bold transition-all cursor-pointer ${cardiacPhaseStage === phase.id
                                ? "bg-red-700 text-white border-red-700 shadow-2xs"
                                : "bg-black/5 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300 hover:border-red-400/40"
                                }`}
                            >
                              {phase.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Blood Vessel Layer Inspector */}
                      <div className="space-y-1 pt-1 border-t border-red-500/15">
                        <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">
                          Blood Vessel Wall Layer Inspector:
                        </span>
                        <div className="grid grid-cols-4 gap-1 text-[9.5px] font-mono">
                          {[
                            { id: "all", label: "All Layers" },
                            { id: "intima", label: "Intima" },
                            { id: "media", label: "Media" },
                            { id: "adventitia", label: "Adventitia" }
                          ].map((layer) => (
                            <button
                              key={layer.id}
                              type="button"
                              onClick={() => setBloodVesselLayerInspector(layer.id as any)}
                              className={`py-1 rounded-lg border text-center font-semibold transition-all cursor-pointer ${bloodVesselLayerInspector === layer.id
                                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] font-bold shadow-2xs"
                                : "bg-black/5 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300 hover:border-[#D49B4B]/40"
                                }`}
                            >
                              {layer.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chamber Slicing & Mitral / Tricuspid Valve Flaps info */}
                      <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300/30 text-[10px] leading-relaxed text-red-950 dark:text-red-200">
                        <span className="font-bold block mb-0.5">🔬 Chamber Bisection &amp; Valve Flaps:</span>
                        Split-view exposes 4 chambers with active Mitral &amp; Tricuspid valve leaflets opening in diastole and shutting in systole, with oxygenated red vs deoxygenated blue blood flows.
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* 04_DIGESTIVE CONTEXT CONTROLS                                 */}
                  {/* ------------------------------------------------------------- */}
                  {(isSingleSolo ? targetSysId === "digestive" : true) && (
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-orange-500/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-orange-500/20 pb-1.5">
                        <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5 font-serif-heading">
                          <Flame className="w-4 h-4 text-orange-500" />
                          Gastrointestinal Agni &amp; Motility
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-bold">
                          04_DIGESTIVE
                        </span>
                      </div>

                      {/* Gastric Secretion pH Slider (Jatharagni) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Gastric Acid pH (Jatharagni):
                          </span>
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            pH {gastricPH.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.5"
                          max="7.0"
                          step="0.1"
                          value={gastricPH}
                          onChange={(e) => setGastricPH(parseFloat(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Tikshnagni (1.5)</span>
                          <span>Samagni (2.0)</span>
                          <span>Mandagni (7.0)</span>
                        </div>
                      </div>

                      {/* Peristaltic Wave Speed Slider */}
                      <div className="space-y-1.5 pt-1 border-t border-orange-500/15">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Peristaltic Wave Speed (Smooth Muscle):
                          </span>
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            {peristalticSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                          value={peristalticSpeed}
                          onChange={(e) => setPeristalticSpeed(parseFloat(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Hypomotility (0.5x)</span>
                          <span>Normal Eumotility (1.0x)</span>
                          <span>Hypermotility (3.0x)</span>
                        </div>
                      </div>

                      {/* Mucosal Rugae Cross-Section info */}
                      <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-300/30 text-[10px] leading-relaxed text-orange-950 dark:text-orange-200">
                        <span className="font-bold block mb-0.5">🔬 Gastric Rugae &amp; Enteric Wall Layers:</span>
                        Split-view displays layered Serosa, Muscularis Externa, Submucosa and folded Rugae mucosa actively undulating with real-time peristaltic traveling waves.
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* 05_RESPIRATORY CONTEXT CONTROLS                               */}
                  {/* ------------------------------------------------------------- */}
                  {(isSingleSolo ? targetSysId === "respiratory" : true) && (
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-sky-500/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5">
                        <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5 font-serif-heading">
                          <Wind className="w-4 h-4 text-sky-500" />
                          Respiratory Mechanics &amp; Diffusion
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold">
                          05_RESP
                        </span>
                      </div>

                      {/* Respiration Rate Slider (RPM) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Respiration Rate (Prana Vayu):
                          </span>
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                            {respirationRateRPM} RPM
                          </span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="35"
                          step="1"
                          value={respirationRateRPM}
                          onChange={(e) => setRespirationRateRPM(parseInt(e.target.value))}
                          className="w-full accent-sky-500 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Bradypnea (8)</span>
                          <span>Eupnea (14)</span>
                          <span>Tachypnea (35)</span>
                        </div>
                      </div>

                      {/* Alveolar Gas Diffusion Shader Dynamic Toggle */}
                      <div className="flex items-center justify-between pt-1 border-t border-sky-500/15 text-xs">
                        <div>
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] block">
                            Alveolar Gas Diffusion (O2 / CO2):
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Dynamic gradient across blood-air barrier
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAlveolarDiffusionEnabled(!alveolarDiffusionEnabled)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${alveolarDiffusionEnabled
                            ? "bg-sky-600 text-white"
                            : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                            }`}
                        >
                          {alveolarDiffusionEnabled ? "DIFFUSION ON" : "DIFFUSION OFF"}
                        </button>
                      </div>

                      {/* Airway Slicing & Tracheobronchial Arborization Info */}
                      <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-300/30 text-[10px] leading-relaxed text-sky-950 dark:text-sky-200">
                        <span className="font-bold block mb-0.5">🔬 Bronchial Tree &amp; Particle Inflow:</span>
                        Dual-phase airflow particles stream down cartilaginous C-ring airways during inspiration and gently reverse on expiration while alveolar sacs expand.
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* 11_MUSCULAR CONTEXT CONTROLS                                  */}
                  {/* ------------------------------------------------------------- */}
                  {(isSingleSolo ? targetSysId === "muscular" : true) && (
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/5 border border-emerald-500/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                        <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5 font-serif-heading">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          Muscular Flexion &amp; Sarcomere Sliding
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                          11_MUSCULAR
                        </span>
                      </div>

                      {/* Muscle Contraction Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                            Isometric Contraction (Mamsa Bala):
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {muscleContractionPercent}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={muscleContractionPercent}
                          onChange={(e) => setMuscleContractionPercent(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-200 dark:bg-white/10 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>Resting Tone (0%)</span>
                          <span>Submaximal (50%)</span>
                          <span>Tetanic Flexion (100%)</span>
                        </div>
                      </div>

                      {/* Fascicle Cross-Section Inspector Note */}
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/30 text-[10px] leading-relaxed text-emerald-950 dark:text-emerald-200">
                        <span className="font-bold block mb-0.5">🔬 Sliding Filament Theory in Split-View:</span>
                        Cross-section exposes Myosin filaments and sliding Actin bars. Increasing contraction slides thin filaments toward the central M-line, shortening the sarcomere in real-time.
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* GLOBAL RADIAL EXPLODED VIEW SLIDER (Always available)          */}
                  {/* ------------------------------------------------------------- */}
                  <div className="p-3.5 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2]">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-[#D49B4B]" />
                        Radial Exploded View Outward
                      </span>
                      <span className="font-mono text-[#D49B4B]">{explodeValue}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={explodeValue}
                      onChange={(e) => setExplodeValue(parseInt(e.target.value))}
                      className="w-full accent-[#D49B4B] cursor-pointer h-2 bg-gray-200 rounded-lg"
                    />
                    <p className="text-[10px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                      Translates systems outward along their 3D centroid vectors for isolated inspection.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* TAB 3: FOCUS CLIPPING & SECTIONING PLANE */}
            {activeTab === "clipping" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5">
                      <Scissors className="w-4 h-4 text-[#D49B4B]" />
                      Interactive Clipping Plane
                    </span>
                    <button
                      type="button"
                      onClick={() => setClippingEnabled(!clippingEnabled)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${clippingEnabled ? "bg-[#0D2B1D] text-[#D49B4B]" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {clippingEnabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                    Real-time cross-sectional slicing plane directly applied to all loaded GLTF child mesh materials.
                  </p>

                  {/* Slicing Axis Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                      Slicing Plane Axis:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setClipAxis("x")}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${clipAxis === "x" ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B]" : "border-gray-200"
                          }`}
                      >
                        X (Sagittal)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClipAxis("y")}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${clipAxis === "y" ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B]" : "border-gray-200"
                          }`}
                      >
                        Y (Transverse)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClipAxis("z")}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${clipAxis === "z" ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B]" : "border-gray-200"
                          }`}
                      >
                        Z (Coronal)
                      </button>
                    </div>
                  </div>

                  {/* Slicing Depth Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Slicing Depth Offset:</span>
                      <span>{clipDistance.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="-1.2"
                      max="1.2"
                      step="0.02"
                      value={clipDistance}
                      onChange={(e) => setClipDistance(parseFloat(e.target.value))}
                      disabled={!clippingEnabled}
                      className="w-full accent-[#D49B4B] cursor-pointer h-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    />
                  </div>

                  {/* Invert Slice Direction */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">
                      Invert Cut Side
                    </span>
                    <button
                      type="button"
                      onClick={() => setClipInverted(!clipInverted)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${clipInverted ? "bg-[#D49B4B] text-white border-[#D49B4B]" : "border-gray-300"
                        }`}
                    >
                      {clipInverted ? "FLIPPED" : "NORMAL"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BIOCHEMICAL CHEMICAL REACTION SUITE */}
            {activeTab === "cellular" && (
              <div className="space-y-3">
                {/* Bone Remodeling Particle System Controls for Skeletal System */}
                {activeSystemId === "skeletal" && (
                  <div className="p-3.5 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#D49B4B]" />
                        Bone Remodeling Particle Flow
                      </span>
                      <button
                        type="button"
                        onClick={() => setBoneRemodelingEnabled(!boneRemodelingEnabled)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${boneRemodelingEnabled ? "bg-[#0D2B1D] text-[#D49B4B]" : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {boneRemodelingEnabled ? "ACTIVE" : "OFF"}
                      </button>
                    </div>

                    <p className="text-[10px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                      Live GPU stream: Golden osteoblastic mineralization (Ca²⁺ / Hydroxyapatite) vs cyan osteoclastic matrix resorption.
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span>Remodeling Rate:</span>
                        <span className="text-[#D49B4B] font-bold">{boneMineralizationRate.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={boneMineralizationRate}
                        onChange={(e) => setBoneMineralizationRate(parseFloat(e.target.value))}
                        disabled={!boneRemodelingEnabled}
                        className="w-full accent-[#D49B4B] cursor-pointer h-1.5 bg-gray-200 rounded-lg disabled:opacity-40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-1">
                      <div className="p-1.5 rounded-md bg-[#D49B4B]/10 border border-[#D49B4B]/30 text-[#855c1b] dark:text-[#D49B4B] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#D49B4B]" />
                        <span>Osteoblast (ALP)</span>
                      </div>
                      <div className="p-1.5 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#008ba3] dark:text-[#00E5FF] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                        <span>Osteoclast (H+)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.25)] space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#D49B4B]" />
                    <h4 className="text-xs font-bold uppercase text-[#0D2B1D] dark:text-[#EAE3D2]">
                      Active Chemical Equation
                    </h4>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0D2B1D] text-[#00E5FF] font-mono text-xs overflow-x-auto shadow-inner">
                    {activeSystem.chemicalEquation}
                  </div>
                  <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                    {activeSystem.biochemicalProcess}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-[#0288D1]" />
                    Cellular & Dhatu Dynamics
                  </h4>
                  <div className="text-[11px] space-y-1.5 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong className="text-[#0D2B1D] dark:text-[#D49B4B]">Target Cell:</strong>{" "}
                      {activeSystem.macroMicroData.cellType}
                    </p>
                    <p>
                      <strong className="text-[#0D2B1D] dark:text-[#D49B4B]">Key Enzyme:</strong>{" "}
                      {activeSystem.macroMicroData.keyEnzyme}
                    </p>
                    <p>
                      <strong className="text-[#0D2B1D] dark:text-[#D49B4B]">Ayurvedic Mechanism:</strong>{" "}
                      {activeSystem.macroMicroData.ayurvedicMechanism}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMacroMicroModalOpen(true)}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-[#0D2B1D] text-[#D49B4B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#153e2b] transition-all"
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    <span>Launch Deep Micro Viewer</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick System Info Footer */}
            <div className="mt-auto pt-3 border-t border-[rgba(212,155,75,0.2)] text-[10px] text-[#627067] flex items-center justify-between">
              <span>Asset Architecture: GLTF 2.0 Binary (.glb)</span>
              <span className="font-mono text-[#D49B4B]">PBR • ACES Filmic</span>
            </div>
          </aside>
        ) : (
          <aside className="w-12 bg-white/90 dark:bg-[#07160e]/90 backdrop-blur-xl border-r border-[rgba(212,155,75,0.25)] py-4 flex flex-col items-center gap-3 z-20 shadow-lg shrink-0 transition-all duration-300">
            <button
              type="button"
              onClick={() => setLeftSidebarOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-[#D49B4B]/40 hover:bg-[#F8F3E9] text-[#0D2B1D] dark:text-[#EAE3D2] transition-all cursor-pointer shadow-xs group"
              title="Expand System Controls Panel"
            >
              <ChevronRight className="w-4 h-4 text-[#D49B4B] group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="w-6 h-[1px] bg-[rgba(212,155,75,0.2)] my-1" />
            <button
              type="button"
              onClick={() => { setLeftSidebarOpen(true); setActiveTab("systems"); }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${activeTab === "systems" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-gray-400 hover:text-[#0D2B1D]"}`}
              title="11 GLTF Anatomy Systems"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setLeftSidebarOpen(true); setActiveTab("sliders"); }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${activeTab === "sliders" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-gray-400 hover:text-[#0D2B1D]"}`}
              title="Physiology Dynamic Sliders"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setLeftSidebarOpen(true); setActiveTab("clipping"); }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${activeTab === "clipping" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-gray-400 hover:text-[#0D2B1D]"}`}
              title="Cross-Section Clipping"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setLeftSidebarOpen(true); setActiveTab("cellular"); }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${activeTab === "cellular" ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs" : "text-gray-400 hover:text-[#0D2B1D]"}`}
              title="Cellular & Dhatu Agni"
            >
              <Activity className="w-4 h-4" />
            </button>
            <div className="w-6 h-[1px] bg-[rgba(212,155,75,0.2)] my-1" />
            <button
              type="button"
              onClick={handleXRayPreset}
              className="p-2 rounded-xl hover:bg-[#F8F3E9] text-gray-400 hover:text-[#D49B4B] transition-all cursor-pointer"
              title="X-Ray View"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleShowAllSystems}
              className="p-2 rounded-xl hover:bg-[#F8F3E9] text-gray-400 hover:text-[#0D2B1D] transition-all cursor-pointer"
              title="Show All Systems"
            >
              <Eye className="w-4 h-4" />
            </button>
          </aside>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* CENTER 3D VIEWPORT CANVAS (WARM ALABASTER CREAM #FBF9F5)          */}
        {/* ----------------------------------------------------------------- */}
        <main className="flex-1 relative min-h-[500px] h-[calc(100vh-112px)] overflow-hidden">
          {/* Canvas Mount */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Graceful WebGL Error Fallback Card */}
          {webglError && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#FBF9F5]/95 dark:bg-[#07160e]/95 p-6 text-center backdrop-blur-md">
              <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-[#0D2B1D] border border-amber-500/40 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                    3D Graphics Fallback Active
                  </h3>
                  <p className="text-xs text-[#627067] dark:text-[#A9B9AE] mt-1.5 leading-relaxed">
                    WebGL hardware acceleration is unavailable or restricted in your browser. All anatomical curricular content, Sanskrit correlations, interactive quizzes, flashcards, and AI explanations remain 100% accessible in the BAMS Learning Studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLearningStudioOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#D49B4B] hover:bg-[#b88237] text-[#0D2B1D] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch BAMS Learning Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TOP-RIGHT 3-ICON QUICK-ACTION STRIP (Glassmorphic, Fixed Corner)   */}
          {/* ================================================================= */}
          <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2">
            {/* Glassmorphic strip container */}
            <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-[#07160e]/80 backdrop-blur-xl border border-[rgba(212,155,75,0.35)] shadow-xl">

              {/* ICON 1: 👁 Skin Shell Toggle — cycles transparent → solid → hidden */}
              <button
                id="quick-action-skin-toggle"
                type="button"
                onClick={handleCycleSkinMode}
                className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                  skinMode !== "hidden"
                    ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                    : "bg-white/60 dark:bg-white/5 border-[rgba(212,155,75,0.25)] hover:bg-emerald-500/10 hover:border-emerald-400/50"
                }`}
                title={skinMode !== "hidden" ? "Hide Skin Shell" : "Show Skin Shell (15% Translucency)"}
              >
                {skinMode !== "hidden" ? (
                  <Eye className={`w-4 h-4 text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]`} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                )}
                {/* Active glow ring */}
                {skinMode !== "hidden" && (
                  <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40 animate-pulse" />
                )}
              </button>

              <div className="w-5 h-px bg-[rgba(212,155,75,0.25)]" />

              {/* ICON 2: ✂️ Symmetrical Split-View Toggle */}
              <button
                id="quick-action-split-toggle"
                type="button"
                onClick={handleToggleSplitView}
                className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                  isSplitView
                    ? "bg-[#D49B4B]/20 border-[#D49B4B]/70 shadow-[0_0_12px_rgba(212,155,75,0.5)]"
                    : "bg-white/60 dark:bg-white/5 border-[rgba(212,155,75,0.25)] hover:bg-[#D49B4B]/10 hover:border-[#D49B4B]/50"
                }`}
                title={isSplitView ? "Close Symmetrical Split-View" : "Activate Symmetrical Sagittal Split-View"}
              >
                <Scissors className={`w-4 h-4 transition-colors ${
                  isSplitView
                    ? "text-[#D49B4B] drop-shadow-[0_0_4px_rgba(212,155,75,0.8)]"
                    : "text-gray-400 group-hover:text-[#D49B4B]"
                }`} />
                {isSplitView && (
                  <span className="absolute inset-0 rounded-xl ring-2 ring-[#D49B4B]/40 animate-pulse" />
                )}
              </button>

              <div className="w-5 h-px bg-[rgba(212,155,75,0.25)]" />

              {/* ICON 3: 🧬 Macro-to-Micro View Toggle */}
              <button
                id="quick-action-micro-toggle"
                type="button"
                onClick={() => setMacroMicroModalOpen(true)}
                className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                  macroMicroModalOpen
                    ? "bg-cyan-500/20 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                    : "bg-white/60 dark:bg-white/5 border-[rgba(212,155,75,0.25)] hover:bg-cyan-500/10 hover:border-cyan-400/50"
                }`}
                title="Macro-to-Micro View: Zoom to Tissue & Cellular Level"
              >
                <Microscope className={`w-4 h-4 transition-colors ${
                  macroMicroModalOpen
                    ? "text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]"
                    : "text-gray-400 group-hover:text-cyan-400"
                }`} />
                {macroMicroModalOpen && (
                  <span className="absolute inset-0 rounded-xl ring-2 ring-cyan-400/40 animate-pulse" />
                )}
              </button>

            </div>

            {/* Tooltip labels (appear on hover via CSS group) */}
            <div className="flex flex-col items-end gap-1.5 text-[9px] font-mono font-bold tracking-wider pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-white">SKIN</span>
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-white mt-4">SPLIT</span>
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-white mt-4">MICRO</span>
            </div>
          </div>

          {/* Real-time 3D DOM Sprite Pins for Internal Histology */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {Object.values(INTERIOR_HISTOLOGY_DATABASE).map((pin) => {
              const isSelected = selectedStructure?.id === pin.id;
              const pinTitle = pin.title || pin.name;
              const pinColor = pin.colorCode || (ANATOMICAL_SYSTEMS[pin.systemId as SystemId]?.colorHex) || "#D49B4B";
              return (
                <div
                  key={pin.id}
                  ref={(el) => {
                    pinElementsRef.current[pin.id] = el;
                  }}
                  style={{ display: "none", transform: "translate(-50%, -100%)" }}
                  className="absolute pointer-events-auto flex flex-col items-center select-none cursor-pointer transition-all duration-75"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectPin(pin)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold font-mono tracking-tight transition-all cursor-pointer shadow-lg backdrop-blur-md border ${isSelected
                      ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] scale-110 ring-2 ring-[#D49B4B]/50"
                      : "bg-white/95 dark:bg-[#07160e]/95 text-[#0D2B1D] dark:text-[#EAE3D2] border-[rgba(212,155,75,0.35)] hover:scale-105 hover:border-[#D49B4B] hover:shadow-xl"
                      }`}
                    title={`Click to inspect interior histology: ${pinTitle}`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: pinColor }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ backgroundColor: pinColor }}
                      />
                    </span>
                    <span>{pinTitle}</span>
                  </button>
                  <div
                    className="w-0.5 h-3 shadow-xs"
                    style={{ backgroundColor: pinColor }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full shadow-xs"
                    style={{ backgroundColor: pinColor }}
                  />
                </div>
              );
            })}
          </div>

          {/* =================================================================== */}
          {/* 3D LABELED DIAGRAM ENGINE WITH ANIMATED INTERACTIVE LEADER LINES    */}
          {/* =================================================================== */}
          {diagramEngineActive && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              <svg className="w-full h-full absolute inset-0 pointer-events-none overflow-visible">
                <defs>
                  <filter id="leaderGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Animated SVG Leader Line */}
                <polyline
                  ref={leaderLineSvgRef}
                  points="0,0 0,0 0,0"
                  fill="none"
                  stroke="#D49B4B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#leaderGlow)"
                  style={{ display: "none" }}
                />
                {/* Center Anchor Dot on 3D Mesh */}
                <circle
                  ref={anchorDotRef}
                  cx="-100"
                  cy="-100"
                  r="4.5"
                  fill="#D49B4B"
                  stroke="#0D2B1D"
                  strokeWidth="2"
                  style={{ display: "none" }}
                />
                {/* Concentric Pulsing Ring on Mesh Anchor */}
                <circle
                  ref={anchorPulseRef}
                  cx="-100"
                  cy="-100"
                  r="12"
                  fill="none"
                  stroke="#D49B4B"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="animate-spin origin-center"
                  style={{ display: "none" }}
                />
              </svg>

              {/* Floating Glassmorphic Tag with Hierarchical Sub-Part Pins */}
              <div
                ref={leaderTagRef}
                className="absolute pointer-events-auto transition-opacity duration-200 select-none"
                style={{ left: "-9999px", top: "-9999px", display: "none" }}
              >
                {(() => {
                  const dData = getActiveDiagramData();
                  return (
                    <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border border-[#D49B4B]/60 shadow-2xl space-y-2 min-w-[250px] max-w-xs animate-in zoom-in-95 duration-150">
                      {/* Primary Label: Name & Sanskrit */}
                      <div className="flex items-start justify-between gap-2 border-b border-[rgba(212,155,75,0.25)] pb-1.5">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#D49B4B] block font-bold">
                            {dData.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading leading-tight">
                            {dData.primaryName}
                          </h4>
                          <p className="text-[10px] text-[#855c1b] dark:text-amber-300 font-serif italic mt-0.5">
                            {dData.sanskrit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRightSidebarOpen(true)}
                          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-[#D49B4B] cursor-pointer shrink-0"
                          title="Open in Anatomical Inspector Panel"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Hierarchical Sub-Part Layer Pins */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-gray-500 font-bold block">
                          HIERARCHICAL SUB-LAYERS:
                        </span>
                        <div className="flex flex-col gap-1">
                          {dData.subParts.map((part, pIdx) => {
                            const isPinActive = activeSubPartPin === part;
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setActiveSubPartPin(part);
                                  setRightSidebarOpen(true);
                                  setAllAccordionOpen(true);
                                }}
                                className={`text-left text-[10px] py-1 px-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-between border ${isPinActive
                                  ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] shadow-xs"
                                  : "bg-[#F8F3E9] dark:bg-white/5 border-transparent text-[#0D2B1D] dark:text-[#EAE3D2] hover:border-[#D49B4B]/40"
                                  }`}
                                title={`Inspect ${part} in detail`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isPinActive ? "bg-[#D49B4B]" : "bg-gray-400"}`} />
                                  <span className="truncate">{part}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-[#D49B4B] shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Action footer in floating tag */}
                      <div className="pt-1 border-t border-[rgba(212,155,75,0.2)] flex items-center justify-between text-[9px] font-mono">
                        <button
                          type="button"
                          onClick={() => setMacroMicroModalOpen(true)}
                          className="text-[#D49B4B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Microscope className="w-3.5 h-3.5" />
                          <span>Micro 10,000x</span>
                        </button>
                        <span className="text-gray-400">360° Tracked</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Clean Visual Loading Overlay (Zero Procedural Fallback Meshes) */}
          {isInitialLoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#FBF9F5]/90 dark:bg-[#07160e]/90 backdrop-blur-md transition-opacity duration-500 pointer-events-auto">
              <div className="max-w-md w-full mx-4 p-6 rounded-2xl bg-white/95 dark:bg-[#07160e]/95 border border-[rgba(212,155,75,0.35)] shadow-2xl text-center space-y-4">
                {/* Animated Vedic Compass Spinner */}
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#D49B4B]/20 border-t-[#D49B4B] animate-spin" />
                  <Compass className="w-7 h-7 text-[#0D2B1D] dark:text-[#EAE3D2] animate-pulse" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                    Loading Anatomical GLTF Models
                  </h3>
                  <p className="text-xs text-[#627067] dark:text-[#A9B9AE] mt-1 font-serif">
                    Streaming photorealistic biomedical 3D meshes: Skeletal • Heart • Brain • Viscera • Lungs • Skin
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-[#0D2B1D] dark:text-[#EAE3D2] font-semibold">
                    <span>Loading Production GLTF Assets</span>
                    <span>{overallPercent}% ({loadedCount}/11)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#0D2B1D]/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-linear-to-r from-[#D49B4B] to-[#0D2B1D] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, overallPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Active Stream Indicator */}
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 text-[11px] font-mono text-[#627067] dark:text-[#A9B9AE] flex items-center justify-center gap-2 truncate">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D49B4B] shrink-0" />
                  <span className="truncate">{loadingFile}</span>
                </div>

                {/* Systems Checklist Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
                  {Object.values(ANATOMICAL_SYSTEMS).map((sys) => {
                    const isDone = loadedStatus[sys.id];
                    return (
                      <div
                        key={sys.id}
                        className={`px-2 py-1 rounded-md border flex items-center justify-between transition-all ${isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-black/5 dark:bg-white/5 border-transparent text-[#627067] opacity-60"
                          }`}
                      >
                        <span className="truncate">{sys.id.slice(0, 7)}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D49B4B] animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Floating HUD Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            {/* Dynamic Dual-Sex Model Switcher: Male / Female */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-md border border-[#D49B4B] shadow-sm">
              <button
                type="button"
                onClick={() => handleSwitchModelSex("male")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${modelSex === "male"
                  ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs"
                  : "text-[#0D2B1D]/70 dark:text-[#EAE3D2]/70 hover:text-[#0D2B1D] dark:hover:text-white"
                  }`}
                title="Switch to Male Anatomical Model (Android skeletal frame & male reproductive structures)"
              >
                <span>♂️</span>
                <span>Male Body</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchModelSex("female")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${modelSex === "female"
                  ? "bg-[#0D2B1D] text-[#D49B4B] shadow-xs"
                  : "text-[#0D2B1D]/70 dark:text-[#EAE3D2]/70 hover:text-[#0D2B1D] dark:hover:text-white"
                  }`}
                title="Switch to Female Anatomical Model (Gynecoid skeletal frame, wider pelvic aperture & female reproductive organs)"
              >
                <span>♀️</span>
                <span>Female Body</span>
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#07160e]/90 backdrop-blur-md border border-[rgba(212,155,75,0.3)] text-xs font-mono font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE: {activeSystem.code}</span>
            </div>

            {/* System-Specific Contextual Action Pills in Floating Toolbar */}
            {activeSystemId === "skeletal" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/80 backdrop-blur-md border border-amber-500/50 text-[11px] font-mono font-bold text-amber-200 shadow-sm animate-in fade-in">
                <span>🦴 Articulation:</span>
                <span className="text-white px-1.5 py-0.5 rounded bg-amber-800/60">{jointArticulationAngle}°</span>
                <button
                  type="button"
                  onClick={() => setJointArticulationAngle((prev) => (prev >= 90 ? 0 : prev + 30))}
                  className="px-1.5 py-0.5 rounded bg-amber-700/70 hover:bg-amber-600 text-white cursor-pointer transition-colors"
                  title="Cycle Knee Articulation Angle (0°, 30°, 60°, 90°)"
                >
                  Step
                </button>
              </div>
            )}

            {activeSystemId === "cardiovascular" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/80 backdrop-blur-md border border-red-500/50 text-[11px] font-mono font-bold text-red-200 shadow-sm animate-in fade-in">
                <Heart className="w-3.5 h-3.5 fill-current text-red-400 animate-pulse" />
                <span>{heartRateBPM} BPM</span>
                <button
                  type="button"
                  onClick={() =>
                    setCardiacPhaseStage((prev) => (prev === "auto" ? "systole" : prev === "systole" ? "diastole" : "auto"))
                  }
                  className={`px-1.5 py-0.5 rounded uppercase text-[9.5px] cursor-pointer transition-colors ${cardiacPhaseStage === "systole"
                    ? "bg-red-600 text-white font-black"
                    : cardiacPhaseStage === "diastole"
                      ? "bg-blue-600 text-white font-black"
                      : "bg-red-900/60 text-red-200 hover:bg-red-800"
                    }`}
                  title="Toggle Cardiac Phase Stage: Auto Cycle, Force Systole, Force Diastole"
                >
                  {cardiacPhaseStage === "auto" ? "Cycle" : cardiacPhaseStage}
                </button>
              </div>
            )}

            {activeSystemId === "digestive" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-950/80 backdrop-blur-md border border-orange-500/50 text-[11px] font-mono font-bold text-orange-200 shadow-sm animate-in fade-in">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>pH {gastricPH.toFixed(1)}</span>
                <span className="text-orange-400/80">•</span>
                <span>🌊 {peristalticSpeed.toFixed(1)}x</span>
                <button
                  type="button"
                  onClick={() => setPeristalticSpeed((prev) => (prev >= 3.0 ? 0.5 : parseFloat((prev + 0.5).toFixed(1))))}
                  className="px-1.5 py-0.5 rounded bg-orange-800/60 hover:bg-orange-700 text-white text-[9.5px] cursor-pointer"
                  title="Cycle Peristaltic Wave Speed"
                >
                  Speed
                </button>
              </div>
            )}

            {activeSystemId === "respiratory" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/80 backdrop-blur-md border border-sky-500/50 text-[11px] font-mono font-bold text-sky-200 shadow-sm animate-in fade-in">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>{respirationRateRPM} RPM</span>
                <button
                  type="button"
                  onClick={() => setAlveolarDiffusionEnabled((prev) => !prev)}
                  className={`px-1.5 py-0.5 rounded text-[9.5px] cursor-pointer transition-colors ${alveolarDiffusionEnabled
                    ? "bg-sky-600 text-white"
                    : "bg-gray-700/60 text-gray-300 hover:bg-gray-600"
                    }`}
                  title="Toggle Alveolar Gas Exchange Shader Dynamic"
                >
                  {alveolarDiffusionEnabled ? "Diffusion ON" : "Diffusion OFF"}
                </button>
              </div>
            )}

            {activeSystemId === "muscular" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-200 shadow-sm animate-in fade-in">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Flex: {muscleContractionPercent}%</span>
                <button
                  type="button"
                  onClick={() => setMuscleContractionPercent((prev) => (prev >= 100 ? 0 : prev + 25))}
                  className="px-1.5 py-0.5 rounded bg-emerald-800/60 hover:bg-emerald-700 text-white text-[9.5px] cursor-pointer"
                  title="Cycle Sarcomere Sliding Contraction (0%, 25%, 50%, 75%, 100%)"
                >
                  Contract
                </button>
              </div>
            )}

            {/* Dedicated Skin Shell Opacity Mode Button (3-State: Transparent 15% | Solid 100% | Hidden 0%) */}
            <button
              type="button"
              onClick={handleCycleSkinMode}
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-md border border-[#D49B4B] text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Cycle Skin Shell Opacity: Transparent (15%) -> Solid (100%) -> Hidden (0%)"
            >
              <Eye className="w-3.5 h-3.5 text-[#D49B4B]" />
              <span className="hidden sm:inline">Skin:</span>
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold ${skinMode === "transparent"
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-500/40"
                  : skinMode === "solid"
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-500/40"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-400/40"
                  }`}
              >
                {skinMode === "transparent"
                  ? "Translucent (15%)"
                  : skinMode === "solid"
                    ? "Solid (100%)"
                    : "Hidden (0%)"}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-[#0D2B1D]/90 backdrop-blur-md border border-[#D49B4B]/80 text-[10.5px] font-mono font-bold text-[#D49B4B] shadow-sm tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D49B4B] animate-pulse shrink-0" />
              <span>UNRESTRICTED ACCESS • ALL 11 SYSTEMS UNLOCKED</span>
            </div>

            <button
              type="button"
              onClick={handleFitWholeBody}
              className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#07160e]/90 backdrop-blur-md border border-[rgba(212,155,75,0.3)] text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Fit Full Body in Frame (Head to Toe)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#D49B4B]" />
              <span className="hidden sm:inline">Fit Body in Frame</span>
            </button>

            {/* Reset Selection / Clear Highlight Button */}
            <button
              type="button"
              onClick={handleClearHighlight}
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-md border border-[#D49B4B] text-xs font-bold text-[#0D2B1D] dark:text-[#D49B4B] hover:bg-[#F8F3E9] dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Reset Selection / Clear Highlight & Return to Full Overview (0, 0, 2.5)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D49B4B]" />
              <span className="inline">Reset Selection</span>
            </button>

            {/* Anatomical Split-View / Symmetrical Cross-Section Button */}
            <button
              type="button"
              onClick={handleToggleSplitView}
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${isSplitView
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] ring-2 ring-[#D49B4B]/30"
                : "bg-white/95 dark:bg-[#07160e]/95 text-[#0D2B1D] dark:text-[#EAE3D2] border-[rgba(212,155,75,0.4)] hover:bg-[#F8F3E9] dark:hover:bg-white/10"
                }`}
              title="Toggle Anatomical Split-View & Symmetrical Cross-Section (Exposes bone marrow, myocardium, rugae, cortex)"
            >
              <Scissors className="w-3.5 h-3.5 text-[#D49B4B]" />
              <span className="inline">{isSplitView ? "CLOSE SPLIT VIEW" : "SPLIT VIEW / CROSS-SECTION"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${isRotating
                ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D]"
                : "bg-white/90 dark:bg-[#07160e]/90 text-[#0D2B1D] dark:text-[#EAE3D2] border-[rgba(212,155,75,0.3)] hover:bg-[#F8F3E9]"
                }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-white/90 dark:bg-[#07160e]/90 backdrop-blur-md border border-[rgba(212,155,75,0.3)] text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] transition-all cursor-pointer"
              title={isPaused ? "Resume Simulation" : "Pause Simulation"}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* FLOATING SYMMETRICAL SPLIT DISTANCE / CROSS-SECTION PANEL       */}
          {/* --------------------------------------------------------------- */}
          {isSplitView && (
            <div className="absolute top-16 right-4 z-30 w-80 p-3 rounded-2xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border border-[#D49B4B]/60 shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between border-b border-[rgba(212,155,75,0.25)] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-[#D49B4B]" />
                  <span className="text-xs font-bold font-serif-heading text-[#0D2B1D] dark:text-[#EAE3D2]">
                    Symmetrical Split-View
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D2B1D] text-[#D49B4B] font-bold border border-[#D49B4B]/30">
                  {splitDistancePercent}% (±{((splitDistancePercent / 100) * 26).toFixed(1)} cm)
                </span>
              </div>

              {/* Solo System Indicator */}
              <div className="text-[10.5px] font-mono text-[#627067] dark:text-[#A9B9AE] flex items-center justify-between">
                <span>Target System:</span>
                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] truncate max-w-[170px]">
                  {activeSystem?.name || "Active Anatomy"}
                </span>
              </div>

              {/* Symmetrical Separation Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9.5px] font-mono text-[#627067] dark:text-[#A9B9AE]">
                  <span>Sagittal Axis (0%)</span>
                  <span>Max Separation (100%)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={splitDistancePercent}
                  onChange={(e) => setSplitDistancePercent(Number(e.target.value))}
                  className="w-full accent-[#D49B4B] cursor-pointer h-1.5 bg-[#EAE3D2] dark:bg-white/10 rounded-lg"
                />
              </div>

              {/* Distance Presets */}
              <div className="grid grid-cols-4 gap-1 text-[9.5px] font-mono">
                {[
                  { label: "25%", val: 25 },
                  { label: "50%", val: 50 },
                  { label: "75%", val: 75 },
                  { label: "100%", val: 100 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setSplitDistancePercent(preset.val)}
                    className={`py-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${splitDistancePercent === preset.val
                      ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B]"
                      : "bg-white/60 dark:bg-white/5 text-[#0D2B1D] dark:text-[#EAE3D2] border-[rgba(212,155,75,0.2)] hover:bg-[#F8F3E9]"
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Histological Layers Hint */}
              <div className="p-2 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/25 text-[10px] leading-tight text-[#0D2B1D] dark:text-[#EAE3D2]">
                <span className="font-bold text-[#D49B4B] block mb-0.5">🔬 Cross-Sectional Inspection:</span>
                Click any exposed interior surface (marrow, myocardium, rugae, cortex) to inspect histological depth.
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* FLOATING UI COLOR-KEY LEGEND PANEL (TISSUE CLASSIFICATION)        */}
          {/* --------------------------------------------------------------- */}
          {!tissueDrawerOpen ? (
            <div className="absolute top-4 right-4 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setTissueDrawerOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-md border border-[#D49B4B]/60 text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                title="Expand Tissue Classification Drawer (5 Classes)"
              >
                <Layers className="w-3.5 h-3.5 text-[#D49B4B]" />
                <span>🔬 Tissues (5)</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#D49B4B]">
                  {Object.values(tissueVisibility).filter(Boolean).length}/5
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D49B4B]" />
              </button>
            </div>
          ) : (
            <div className="absolute top-4 right-4 z-20 w-72 sm:w-80 bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border border-[rgba(212,155,75,0.35)] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2">
              {/* Legend Header */}
              <div className="px-3.5 py-2.5 bg-[#0D2B1D] text-[#D49B4B] flex items-center justify-between border-b border-[#D49B4B]/30">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D49B4B]" />
                  <span className="text-xs font-bold uppercase tracking-wider font-serif-heading">
                    Tissue Classification
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">
                    5 Systems
                  </span>
                  <button
                    type="button"
                    onClick={() => setTissueDrawerOpen(false)}
                    className="text-white hover:text-[#D49B4B] p-1 rounded cursor-pointer transition-colors flex items-center gap-0.5 text-[10px] font-mono font-bold"
                    title="Collapse Tissue Drawer"
                  >
                    <ChevronUp className="w-3 h-3 text-[#D49B4B]" />
                    <span>Collapse ▴</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegendCollapsed(!legendCollapsed)}
                    className="text-white hover:text-[#D49B4B] p-0.5 rounded cursor-pointer transition-colors"
                    title={legendCollapsed ? "Expand Legend" : "Collapse Legend"}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${legendCollapsed ? "" : "rotate-90"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {!legendCollapsed && (
                <div className="p-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[#627067] dark:text-[#A9B9AE] leading-tight">
                      Bones are compulsorily selected. Remaining connective tissues can be selected or deselected:
                    </p>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#D49B4B] shrink-0 ml-1">
                      {Object.values(tissueVisibility).filter(Boolean).length}/5 Active
                    </span>
                  </div>

                  {/* Multi-Select Action Toolbar: Select All & Deselect Optional */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5 pb-0.5">
                    <button
                      type="button"
                      onClick={handleShowAllTissues}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-500/30 shadow-2xs"
                      title="Select all 5 tissue classes (Render full skeleton & all connective tissues)"
                    >
                      <Check className="w-3 h-3" />
                      <span>Select All (5/5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllTissues}
                      className="flex-1 py-1 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-rose-500/30 shadow-2xs"
                      title="Deselect all 4 optional connective tissues (Bones remain compulsory selected)"
                    >
                      <X className="w-3 h-3" />
                      <span>Deselect Optional</span>
                    </button>
                  </div>

                  {/* 5 Anatomical Classification Rows (Multi-Select Checkboxes with Active Results) */}
                  <div className="space-y-2">
                    {(() => {
                      const TISSUE_SUB_STRUCTURES: Record<
                        StructureClass,
                        { id: string; name: string; tag: string }[]
                      > = {
                        bone: [
                          { id: "axial_skeleton", name: "1) Axial Skeleton", tag: "80b" },
                          { id: "appendicular_skeleton", name: "2) Appendicular Skeleton", tag: "126b" },
                          { id: "tissue_architecture", name: "3) Tissue Architecture", tag: "5 Layers" },
                          { id: "femur", name: "Femur", tag: "Thigh" },
                          { id: "pelvis", name: "Pelvis", tag: "Hip Girdle" },
                        ],
                        cartilage: [
                          { id: "articular_cartilage", name: "Articular Hyaline Cartilage", tag: "Tarunasthi" },
                          { id: "knee_meniscus", name: "Lateral & Medial Menisci", tag: "Chakrika" },
                          { id: "costal_cartilage", name: "Costal Cartilage", tag: "Rib Cartilage" },
                          { id: "spine_disc", name: "Intervertebral Discs", tag: "Kasheruka" },
                        ],
                        ligament: [
                          { id: "knee_acl", name: "Anterior Cruciate (ACL)", tag: "Snayu" },
                          { id: "knee_pcl", name: "Posterior Cruciate (PCL)", tag: "Snayu" },
                          { id: "knee_mcl", name: "Medial Collateral (MCL)", tag: "Collateral" },
                          { id: "knee_lcl", name: "Lateral Collateral (LCL)", tag: "Collateral" },
                          { id: "hip_iliofemoral", name: "Iliofemoral Y-Ligament", tag: "Bigelow" },
                        ],
                        tendon: [
                          { id: "knee_patellar_tendon", name: "Patellar Tendon", tag: "Kandara" },
                          { id: "ankle_achilles_tendon", name: "Achilles Tendon", tag: "Kandara" },
                        ],
                        joint: [
                          { id: "knee_synovial_capsule", name: "Knee Synovial Capsule & Cavity", tag: "Sandhi Kosha" },
                        ],
                      };

                      return (
                        [
                          {
                            key: "bone",
                            label: "Bones (Asthi Dhatu)",
                            sub: "Cortical Bone (#EAE3D2)",
                            color: "#EAE3D2",
                            border: "border-gray-400",
                          },
                          {
                            key: "cartilage",
                            label: "Articular Cartilage",
                            sub: "Tarunasthi (#38BDF8)",
                            color: "#38BDF8",
                            border: "border-sky-400",
                          },
                          {
                            key: "ligament",
                            label: "Ligaments (Snayu)",
                            sub: "ACL/PCL & Collateral (#F59E0B)",
                            color: "#F59E0B",
                            border: "border-amber-400",
                          },
                          {
                            key: "tendon",
                            label: "Tendons (Kandara)",
                            sub: "Achilles & Patellar (#10B981)",
                            color: "#10B981",
                            border: "border-emerald-400",
                          },
                          {
                            key: "joint",
                            label: "Joint Cavities & Capsules",
                            sub: "Sandhi & Sleshaka Kapha (#EC4899)",
                            color: "#EC4899",
                            border: "border-pink-400",
                          },
                        ] as const
                      ).map((item) => {
                        const isBone = item.key === "bone";
                        const isVisible = isBone ? true : tissueVisibility[item.key];
                        return (
                          <div key={item.key} className="space-y-1">
                            <div
                              onClick={() => {
                                if (isBone) {
                                  handleSelectBoneCategory("axial_skeleton");
                                } else {
                                  handleToggleTissue(item.key);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${isVisible
                                ? isBone
                                  ? "bg-amber-500/10 dark:bg-amber-950/25 border-amber-500/50 shadow-2xs ring-1 ring-amber-500/30"
                                  : "bg-white/90 dark:bg-white/10 border-[#D49B4B]/40 shadow-2xs"
                                : "bg-gray-100/50 dark:bg-black/30 border-gray-200 dark:border-white/5 opacity-45"
                                }`}
                            >
                              {/* Checkbox and Color Indicator (Stop propagation to prevent double toggle) */}
                              <div className="flex items-center gap-2 select-none flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  disabled={isBone}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (!isBone) handleToggleTissue(item.key);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`accent-[#D49B4B] w-4 h-4 rounded shrink-0 ${isBone ? "cursor-not-allowed opacity-90" : "cursor-pointer"
                                    }`}
                                  title={isBone ? "Bones (Asthi Dhatu) are compulsorily selected" : `Toggle ${item.label}`}
                                />
                                <span
                                  className={`w-3 h-3 rounded-full shrink-0 border ${item.border}`}
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="truncate min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[11px] text-[#0D2B1D] dark:text-[#EAE3D2] block truncate">
                                      {item.label}
                                    </span>
                                    {isBone && (
                                      <span className="text-[7.5px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider shrink-0">
                                        Compulsory
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-[#627067] dark:text-[#A9B9AE] font-mono block truncate">
                                    {item.sub}
                                  </span>
                                </div>
                              </div>

                              {/* Status Badge & SOLO Button */}
                              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {isBone ? (
                                  <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-0.5" title="Compulsory structural foundation for connective tissues">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Anchor Foundation</span>
                                  </span>
                                ) : (
                                  <span
                                    className={`text-[8.5px] font-mono px-1 rounded ${isVisible
                                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold"
                                      : "bg-gray-200 dark:bg-white/10 text-gray-500"
                                      }`}
                                  >
                                    {isVisible ? "Active" : "Removed"}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSoloTissue(item.key)}
                                  className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-[#0D2B1D]/10 dark:bg-white/10 hover:bg-[#0D2B1D] hover:text-[#D49B4B] text-[#0D2B1D] dark:text-[#EAE3D2] transition-colors cursor-pointer"
                                  title={isBone ? "Isolate Bones (Deselect all 4 connective tissues)" : `Solo ${item.label} alongside compulsory bones`}
                                >
                                  SOLO
                                </button>
                              </div>
                            </div>

                            {/* ACTIVE RESULTS DISPLAY: SHOWN WHEN SELECTED, REMOVED ON DESELECTION */}
                            {isVisible && (
                              <div className="ml-5 pl-2.5 border-l-2 border-[#D49B4B]/40 py-1 space-y-1">
                                <div className="flex items-center justify-between text-[9px]">
                                  <span className="font-mono font-bold text-gray-500 uppercase tracking-wider">
                                    Available Results ({TISSUE_SUB_STRUCTURES[item.key].length}):
                                  </span>
                                  <span className="text-[8.5px] text-[#D49B4B] font-semibold">
                                    Click to inspect ↓
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {TISSUE_SUB_STRUCTURES[item.key].map((sub) => {
                                    const isCurrentSelected = selectedStructure?.id === sub.id;
                                    return (
                                      <button
                                        key={sub.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectBoneCategory(sub.id);
                                        }}
                                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-medium transition-all cursor-pointer flex items-center gap-1 border ${isCurrentSelected
                                          ? "bg-[#0D2B1D] text-[#D49B4B] border-[#D49B4B] shadow-xs font-bold"
                                          : "bg-white/80 dark:bg-white/5 text-[#0D2B1D] dark:text-[#EAE3D2] border-black/10 dark:border-white/10 hover:border-[#D49B4B] hover:bg-white dark:hover:bg-white/10"
                                          }`}
                                      >
                                        <span
                                          className="w-1.5 h-1.5 rounded-full shrink-0"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <span>{sub.name}</span>
                                        <span className="text-[8px] opacity-70 font-mono">({sub.tag})</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Empty state alert when all 5 are deselected */}
                  {Object.values(tissueVisibility).every((v) => !v) && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 text-[10px] text-amber-800 dark:text-amber-200 text-center space-y-1">
                      <p className="font-bold flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>All Tissues Deselected (Removed)</span>
                      </p>
                      <p className="text-[9px] opacity-85">
                        No structures are currently rendered. Check any tissue above or click "Select All" to restore.
                      </p>
                    </div>
                  )}

                  {/* Quick Dissection Presets */}
                  <div className="pt-2 border-t border-[rgba(212,155,75,0.2)] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Interactive Dissection Presets:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={handleKneeDissectionPreset}
                        className="py-1.5 px-2 rounded-lg bg-[#0D2B1D] text-[#D49B4B] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#153e2b] transition-all shadow-xs"
                        title="Focus on knee ligaments, cartilage and capsule"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Knee Dissection</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleConnectiveOnlyPreset}
                        className="py-1.5 px-2 rounded-lg bg-[#F8F3E9] dark:bg-white/10 border border-[#D49B4B]/30 text-[#0D2B1D] dark:text-[#EAE3D2] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#eadecc] transition-all"
                        title="Hide bone and isolate all connective tissue systems"
                      >
                        <Layers className="w-3 h-3 text-[#38BDF8]" />
                        <span>Connective Only</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleShowAllTissues}
                      className="w-full py-1 text-[10px] font-semibold text-[#627067] dark:text-[#A9B9AE] hover:text-[#0D2B1D] dark:hover:text-white underline text-center cursor-pointer"
                    >
                      Reset All 5 Tissues to 100% Visibility
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Bottom Physiology Ticker */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-[#07160e]/85 backdrop-blur-xl border border-[rgba(212,155,75,0.25)] shadow-lg text-xs">
            <div className="flex items-center gap-6 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#E53935]" />
                <span className="text-[#627067]">Cardiac:</span>
                <span className="font-mono font-bold text-[#E53935]">{heartRateBPM} BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#0288D1]" />
                <span className="text-[#627067]">Respiration:</span>
                <span className="font-mono font-bold text-[#0288D1]">{respirationRateRPM} RPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FB8C00]" />
                <span className="text-[#627067]">Jatharagni:</span>
                <span className="font-mono font-bold text-[#FB8C00]">pH {gastricPH.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-[#627067]">Conduction:</span>
                <span className="font-mono font-bold text-[#00E5FF]">118 m/s</span>
              </div>
            </div>

            <div className="text-[11px] text-[#627067] font-serif hidden md:block">
              GLTF/GLB models aligned at origin (0, 0, 0)
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT SYSTEM INSPECTOR CARD                                       */}
        {/* ----------------------------------------------------------------- */}
        {!rightSidebarOpen && (
          <button
            type="button"
            onClick={() => setRightSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 py-3.5 px-2 rounded-l-2xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border-l border-y border-[#D49B4B]/60 text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] shadow-xl flex flex-col items-center gap-1.5 cursor-pointer group transition-all"
            title="Expand Anatomical Inspector Panel"
          >
            <ChevronLeft className="w-4 h-4 text-[#D49B4B] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-[#627067] dark:text-[#A9B9AE] group-hover:text-[#0D2B1D] dark:group-hover:text-white">
              Inspector
            </span>
          </button>
        )}

        {rightSidebarOpen && (
          <aside className="w-full lg:w-80 xl:w-96 bg-white/85 dark:bg-[#07160e]/85 backdrop-blur-xl border-l border-[rgba(212,155,75,0.25)] p-4 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-112px)] z-20 shadow-xl transition-all duration-300">
            <div className="space-y-4">
              {/* Top Inspector Header with Minimize Button */}
              <div className="flex items-center justify-between pb-1 border-b border-[rgba(212,155,75,0.2)]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#D49B4B]" />
                  <span className="text-xs font-bold uppercase tracking-wider font-serif-heading text-[#0D2B1D] dark:text-[#EAE3D2]">
                    Anatomical Inspector
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRightSidebarOpen(false);
                    setSelectedStructure(null);
                  }}
                  className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-[#0D2B1D] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="Close Inspector Panel & Clear Selection"
                >
                  <span>Close ✕</span>
                </button>
              </div>

                  {/* System Header */}
                  <div className="p-3 rounded-xl bg-[#0D2B1D] text-[#D49B4B] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wider text-emerald-300 font-bold uppercase">
                        {activeSystem.code}
                      </span>
                      <span className="text-[9px] font-mono text-[#EAE3D2] px-1.5 py-0.5 rounded bg-white/10">
                        {activeSystem.gltfPath.split("/").pop()}
                      </span>
                    </div>
                    <h2 className="text-sm xl:text-base font-bold font-serif-heading text-[#D49B4B] leading-tight mt-1">
                      {activeSystem.name}
                    </h2>
                    <p className="text-xs text-[#EAE3D2] font-serif mt-0.5">
                      {activeSystem.sanskritName}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                    {activeSystem.description}
                  </p>

                  {/* SKELETAL SYSTEM: 206 BONE HIERARCHY NAVIGATOR */}
                  {activeSystemId === "skeletal" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#D49B4B]" />
                            Asthi Samsthana Hierarchy
                          </span>
                          <button
                            type="button"
                            onClick={handleFitWholeBody}
                            className="text-[10px] font-mono font-bold text-[#D49B4B] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Reframe full skeleton from head to toe"
                          >
                            <Maximize2 className="w-3 h-3" />
                            Fit Whole Skeleton
                          </button>
                        </div>

                        {/* Axial vs Appendicular Tabs/Badges */}
                        {/* 1) AXIAL SKELETON: Clickable Header & Sub-Bones */}
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectBoneCategory("axial")}
                            className={`w-full px-3 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${selectedBoneCategory === "axial"
                              ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-1 ring-[#D49B4B]/50"
                              : "bg-[#F8F3E9] dark:bg-white/5 border-[rgba(212,155,75,0.3)] hover:border-[#D49B4B] text-[#0D2B1D] dark:text-[#EAE3D2]"
                              }`}
                            title="Click to inspect all 80 bones and description of Axial Skeleton"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                              <div className="truncate">
                                <span className="text-xs font-bold font-serif-heading block truncate">
                                  1) Axial Skeleton (Akshiya - 80 bones)
                                </span>
                                <span className="text-[9px] opacity-80 font-mono block truncate">
                                  अक्षीय अस्थि • Skull, Spine, Ribs & Sternum
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                              80 bones
                            </span>
                          </button>
                          <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-[#D49B4B]/30 ml-2">
                            {BONE_HIERARCHY.filter((b) => b.group === "axial").map((cat) => {
                              const isCatSelected = selectedBoneCategory === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => handleSelectBoneCategory(cat.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer flex items-center justify-between border ${isCatSelected
                                    ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-xs"
                                    : "bg-white/70 dark:bg-white/5 border-[rgba(212,155,75,0.2)] hover:border-[#D49B4B]/50 text-[#0D2B1D] dark:text-[#EAE3D2]"
                                    }`}
                                >
                                  <div className="truncate min-w-0 pr-2">
                                    <span className="font-semibold block truncate">{cat.name}</span>
                                    <span className="text-[9px] opacity-75 font-serif block truncate">{cat.sanskritName}</span>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 shrink-0">
                                    {cat.boneCount}b
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* ACTIVE AXIAL SKELETON IN-PLACE BREAKDOWN & DESCRIPTION */}
                          {(selectedBoneCategory === "axial" || selectedStructure?.id === "axial_skeleton") && (
                            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs ml-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                                  Axial Parts Breakdown (80 Bones):
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-[#855c1b] dark:text-amber-300 font-bold">
                                  80 Total
                                </span>
                              </div>
                              <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                                Central longitudinal skeletal column sheltering the neurocranium, spinal cord, and thoracic organs while bearing and transmitting cephalic loads.
                              </p>
                              <div className="space-y-1 text-[10.5px]">
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Cranial & Facial Division (29b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">8 Cranial (Frontal, Parietal×2, Temporal×2, Occipital, Sphenoid, Ethmoid) + 14 Facial (Maxillae×2, Zygomatic×2, Nasal×2, Lacrimal×2, Palatine×2, Inf Conchae×2, Vomer, Mandible) + 1 Hyoid + 6 Auditory Ossicles.</span>
                                  </div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Vertebral Column (26 units):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">7 Cervical (C1–C7, Atlas/Axis) + 12 Thoracic (T1–T12) + 5 Lumbar (L1–L5) + Sacrum (5 fused) + Coccyx (4 fused segments).</span>
                                  </div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Thoracic Cage (25b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Sternum (Manubrium, Body, Xiphoid) + 24 Costal Ribs (7 true pairs, 3 false pairs, 2 floating pairs).</span>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-1 flex items-center justify-between border-t border-amber-500/20 text-[10px]">
                                <span className="font-serif italic text-[#855c1b] dark:text-amber-300">
                                  Asthi Dhatu • Shiro-Greeva, Prishta & Uras
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById("anatomical-inspector-panel");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="font-bold text-[#D49B4B] hover:underline cursor-pointer"
                                >
                                  View Inspector Details ↓
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2) APPENDICULAR SKELETON: Clickable Header & Sub-Bones */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectBoneCategory("appendicular")}
                            className={`w-full px-3 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${selectedBoneCategory === "appendicular"
                              ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-1 ring-[#D49B4B]/50"
                              : "bg-[#F8F3E9] dark:bg-white/5 border-[rgba(212,155,75,0.3)] hover:border-[#D49B4B] text-[#0D2B1D] dark:text-[#EAE3D2]"
                              }`}
                            title="Click to inspect all 126 bones and description of Appendicular Skeleton"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                              <div className="truncate">
                                <span className="text-xs font-bold font-serif-heading block truncate">
                                  2) Appendicular Skeleton (Shakhasthi - 126 bones)
                                </span>
                                <span className="text-[9px] opacity-80 font-mono block truncate">
                                  शाखास्थि • Pectoral, Pelvic Girdles & Limbs
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                              126 bones
                            </span>
                          </button>
                          <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-[#D49B4B]/30 ml-2">
                            {BONE_HIERARCHY.filter((b) => b.group === "appendicular").map((cat) => {
                              const isCatSelected = selectedBoneCategory === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => handleSelectBoneCategory(cat.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer flex items-center justify-between border ${isCatSelected
                                    ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-xs"
                                    : "bg-white/70 dark:bg-white/5 border-[rgba(212,155,75,0.2)] hover:border-[#D49B4B]/50 text-[#0D2B1D] dark:text-[#EAE3D2]"
                                    }`}
                                >
                                  <div className="truncate min-w-0 pr-2">
                                    <span className="font-semibold block truncate">{cat.name}</span>
                                    <span className="text-[9px] opacity-75 font-serif block truncate">{cat.sanskritName}</span>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 shrink-0">
                                    {cat.boneCount}b
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* ACTIVE APPENDICULAR SKELETON IN-PLACE BREAKDOWN & DESCRIPTION */}
                          {(selectedBoneCategory === "appendicular" || selectedStructure?.id === "appendicular_skeleton") && (
                            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs ml-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                                  Appendicular Parts Breakdown (126 Bones):
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-[#855c1b] dark:text-amber-300 font-bold">
                                  126 Total
                                </span>
                              </div>
                              <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                                Peripheral locomotion and manipulation framework engineered for upright bipedal propulsion, force distribution, and dexterous prehensile grasping.
                              </p>
                              <div className="space-y-1 text-[10.5px]">
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Pectoral Girdle (4b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">2 Clavicles (Akshakasthi - Collar bones) + 2 Scapulae (Amsaphalaka - Shoulder blades).</span>
                                  </div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Upper Extremities (60b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">2 Humerus, 2 Radius, 2 Ulna, 16 Carpals (8/wrist), 10 Metacarpals, 28 Hand Phalanges (14/hand).</span>
                                  </div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Pelvic Girdle (2b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">2 Os Coxae / Hip Bones (fused Ilium, Ischium, and Pubis meeting at the Acetabulum).</span>
                                  </div>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 flex items-start gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">Lower Extremities (60b):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">2 Femurs (Urvasthei), 2 Patellae, 2 Tibiae, 2 Fibulae, 14 Tarsals (7/ankle), 10 Metatarsals, 28 Toe Phalanges.</span>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-1 flex items-center justify-between border-t border-amber-500/20 text-[10px]">
                                <span className="font-serif italic text-[#855c1b] dark:text-amber-300">
                                  Shakhasthi • Vyana Vayu Locomotion
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById("anatomical-inspector-panel");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="font-bold text-[#D49B4B] hover:underline cursor-pointer"
                                >
                                  View Inspector Details ↓
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3) ANATOMICAL TISSUE ARCHITECTURE: Clickable Button */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectBoneCategory("tissue_architecture")}
                            className={`w-full px-3 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${selectedBoneCategory === "tissue_architecture"
                              ? "bg-[#0D2B1D] text-[#D49B4B] border-[#0D2B1D] shadow-md ring-1 ring-[#D49B4B]/50"
                              : "bg-white/80 dark:bg-white/5 border-[rgba(212,155,75,0.3)] hover:border-[#D49B4B] text-[#0D2B1D] dark:text-[#EAE3D2]"
                              }`}
                            title="Click to inspect 3) Anatomical Tissue Architecture (Cortical, Cancellous, Medullary, Periosteum, Cartilage)"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#D49B4B] shrink-0" />
                              <div className="truncate">
                                <span className="text-xs font-bold font-serif-heading block truncate">
                                  3) Anatomical Tissue Architecture
                                </span>
                                <span className="text-[9px] opacity-80 font-mono block truncate">
                                  अस्थि रचना • Cortical, Spongy, Marrow, Periosteum
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
                              5 Layers
                            </span>
                          </button>

                          {/* ACTIVE TISSUE ARCHITECTURE IN-PLACE BREAKDOWN & DESCRIPTION */}
                          {(selectedBoneCategory === "tissue_architecture" || selectedStructure?.id === "tissue_architecture") && (
                            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs mt-1.5 ml-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] font-serif-heading">
                                  5-Layer Tissue Matrix Breakdown:
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                                  5 Layers
                                </span>
                              </div>
                              <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                                Dual mechanical optimization providing compressive and torsional stiffness, mineral depot (99% body calcium), and hematopoiesis.
                              </p>
                              <div className="space-y-1 text-[10.5px]">
                                <button
                                  type="button"
                                  onClick={() => handleSelectBoneCategory("cortical_bone")}
                                  className="w-full p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 hover:border-[#D49B4B] text-left flex items-start gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#EAE3D2] border border-gray-400 mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">1. Cortical Bone (बाह्य दृढास्थि - 80% Mass):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Dense osteons, concentric lamellae, and Haversian canals.</span>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectBoneCategory("cancellous_bone")}
                                  className="w-full p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 hover:border-[#D49B4B] text-left flex items-start gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#D8CBB5] border border-gray-400 mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">2. Cancellous Bone (सुषिरास्थि - 20% Mass):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Trabecular honeycomb lattice distributing mechanical strain.</span>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectBoneCategory("medullary_cavity")}
                                  className="w-full p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 hover:border-[#D49B4B] text-left flex items-start gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#A83232] border border-red-800 mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">3. Medullary Cavity & Majja (मज्जा):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Hematopoietic red marrow & lipid-storing yellow marrow.</span>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectBoneCategory("periosteum")}
                                  className="w-full p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 hover:border-[#D49B4B] text-left flex items-start gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#D49B4B] border border-amber-600 mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">4. Periosteum (अस्थि-धरा कला):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Vascular fibrous layer & osteogenic cambium growth zone.</span>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectBoneCategory("articular_cartilage")}
                                  className="w-full p-1.5 rounded-lg bg-white/70 dark:bg-white/5 border border-black/5 hover:border-[#D49B4B] text-left flex items-start gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] border border-sky-400 mt-1 shrink-0" />
                                  <div>
                                    <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">5. Articular Cartilage (तरुणास्थि):</strong>
                                    <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Avascular hyaline joint cushion bathed in Sleshaka Kapha.</span>
                                  </div>
                                </button>
                              </div>
                              <div className="pt-1 flex items-center justify-between border-t border-amber-500/20 text-[10px]">
                                <span className="font-serif italic text-[#855c1b] dark:text-amber-300">
                                  Asthidhara Kala • Majjavaha Srotas
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById("anatomical-inspector-panel");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="font-bold text-[#D49B4B] hover:underline cursor-pointer"
                                >
                                  View Inspector Details ↓
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SELECTED STRUCTURE: 5-SECTION ACCORDION INSPECTION PANEL */}
                      {selectedStructure ? (
                        <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#07160e]/95 backdrop-blur-xl border border-[#D49B4B]/40 space-y-3 shadow-xl">
                          {/* Header Card */}
                          <div className="p-3 rounded-xl bg-[#0D2B1D] text-[#D49B4B] border border-[#D49B4B]/30 shadow-sm relative overflow-hidden">
                            <div
                              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                              style={{ backgroundColor: selectedStructure.colorCode }}
                            />
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs"
                                style={{
                                  backgroundColor: `${selectedStructure.colorCode}25`,
                                  color: selectedStructure.colorCode,
                                  border: `1px solid ${selectedStructure.colorCode}60`,
                                }}
                              >
                                {selectedStructure.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!selectedStructure) return;
                                    const id = selectedStructure.id;
                                    setStudiedStructures((prev) => {
                                      const next = prev.includes(id)
                                        ? prev.filter((x) => x !== id)
                                        : [...prev, id];
                                      if (typeof window !== "undefined") {
                                        localStorage.setItem("aayuraura_anatomy_completed", JSON.stringify(next));
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                    selectedStructure && studiedStructures.includes(selectedStructure.id)
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                                  }`}
                                  title={selectedStructure && studiedStructures.includes(selectedStructure.id) ? "Marked as Studied" : "Mark as Studied"}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{selectedStructure && studiedStructures.includes(selectedStructure.id) ? "Studied" : "Mark Studied"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLearningStudioOpen(true)}
                                  className="px-2 py-0.5 rounded bg-[#D49B4B]/20 hover:bg-[#D49B4B] text-[#D49B4B] hover:text-[#0D2B1D] text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                                  title="Study in BAMS Learning Studio"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Study</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={toggleAllAccordion}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#D49B4B] text-[10px] font-mono font-bold cursor-pointer transition-colors"
                                  title={allAccordionOpen ? "Collapse all 5 sections" : "Expand all 5 sections"}
                                >
                                  {allAccordionOpen ? "Collapse All" : "Expand All"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleClearHighlight}
                                  className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                                  title="Reset Selection / Clear Highlight"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedStructure(null)}
                                  className="text-gray-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                                  title="Close Inspector"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h3 className="text-base font-bold text-white font-serif-heading mt-2 leading-tight">
                              {selectedStructure.commonName}
                            </h3>
                            <p className="text-xs font-serif italic text-[#D49B4B] mt-0.5">
                              {selectedStructure.latinName}
                            </p>
                          </div>

                          {/* Internal Histology & Cross-Section Banner */}
                          {(selectedStructure.isInternalSplit || selectedStructure.histologicalLayer) && (
                            <div className="p-3 rounded-xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-emerald-500/15 border border-amber-500/30 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                  <Microscope className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  Internal Split-View Histology
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0D2B1D] text-[#D49B4B]">
                                  CROSS-SECTION
                                </span>
                              </div>
                              {selectedStructure.histologicalLayer && (
                                <div>
                                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block">
                                    Histological Layer:
                                  </span>
                                  <span className="text-xs font-bold text-[#0D2B1D] dark:text-[#EAE3D2] block">
                                    {selectedStructure.histologicalLayer}
                                  </span>
                                </div>
                              )}
                              {selectedStructure.tissueType && (
                                <div>
                                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block">
                                    Microscopic Tissue Type:
                                  </span>
                                  <span className="text-xs text-[#0D2B1D] dark:text-[#EAE3D2] block">
                                    {selectedStructure.tissueType}
                                  </span>
                                </div>
                              )}
                              {selectedStructure.biochemicalFunction && (
                                <div>
                                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block">
                                    Biochemical / Physiological Action:
                                  </span>
                                  <span className="text-xs text-[#627067] dark:text-[#A9B9AE] leading-relaxed block">
                                    {selectedStructure.biochemicalFunction}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ACCORDION SECTIONS */}
                          <div className="space-y-2 text-xs">
                            {/* Section 1: Sub-Parts & Landmarks */}
                            <div className="rounded-xl border border-[rgba(212,155,75,0.25)] bg-white/70 dark:bg-white/5 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleAccordionSection("subParts")}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Layers className="w-3.5 h-3.5 text-[#D49B4B]" />
                                  <span className="text-xs">1. Sub-Parts & Landmarks</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-[#D49B4B] transition-transform duration-200 ${openAccordion.subParts ? "rotate-180" : ""
                                    }`}
                                />
                              </button>
                              {openAccordion.subParts && (
                                <div className="px-3 pb-3 pt-1 space-y-2.5 text-[11px] border-t border-[rgba(212,155,75,0.15)]">
                                  {(() => {
                                    const getSubPartTitles = (id: string, category: string) => {
                                      if (id === "axial_skeleton" || id.includes("axial")) {
                                        return {
                                          proximal: "Cranial & Facial Division (29 Bones):",
                                          shaft: "Vertebral Column Axis (26 Functional Units):",
                                          distal: "Thoracic Cage & Sternum (25 Bones):",
                                        };
                                      }
                                      if (id === "appendicular_skeleton" || id.includes("appendicular")) {
                                        return {
                                          proximal: "Pectoral & Pelvic Girdles (6 Bones):",
                                          shaft: "Upper Extremity Chain (60 Bones):",
                                          distal: "Lower Extremity Column (60 Bones):",
                                        };
                                      }
                                      if (id === "tissue_architecture") {
                                        return {
                                          proximal: "Cortical Shell & Periosteum (Compact Bone):",
                                          shaft: "Trabecular Lattice & Endosteum (Spongy Bone):",
                                          distal: "Medullary Cavity & Articular Cartilage:",
                                        };
                                      }
                                      if (category === "Cartilage" || id.includes("cartilage") || id.includes("meniscus") || id.includes("disc")) {
                                        return {
                                          proximal: "Superior / Chondral Surface Layers:",
                                          shaft: "Extracellular Matrix & Fibrocartilage Zone:",
                                          distal: "Subchondral Interface & Tidemark Anchor:",
                                        };
                                      }
                                      if (category === "Ligament" || id.includes("ligament") || id.includes("acl") || id.includes("pcl")) {
                                        return {
                                          proximal: "Origin Footprint / Proximal Enthesis:",
                                          shaft: "Midsubstance Fibrous Fascicles:",
                                          distal: "Insertion Footprint / Distal Enthesis:",
                                        };
                                      }
                                      if (category === "Tendon" || id.includes("tendon")) {
                                        return {
                                          proximal: "Myotendinous Muscular Junction:",
                                          shaft: "Tendon Body / Collagen Fascicles:",
                                          distal: "Osteotendinous Insertion Footprint:",
                                        };
                                      }
                                      if (category === "Joint Capsule" || id.includes("joint") || id.includes("capsule")) {
                                        return {
                                          proximal: "Superior Fibrous Capsule & Ligaments:",
                                          shaft: "Synovial Intima & Joint Cavity Volume:",
                                          distal: "Inferior Articular Boundary & Recesses:",
                                        };
                                      }
                                      return {
                                        proximal: "Proximal Epiphysis / Superior Features:",
                                        shaft: "Diaphysis / Shaft / Body:",
                                        distal: "Distal Epiphysis / Inferior Features:",
                                      };
                                    };

                                    const titles = getSubPartTitles(selectedStructure.id, selectedStructure.category);

                                    return (
                                      <>
                                        {selectedStructure.subParts.proximal?.length > 0 && (
                                          <div>
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block">
                                              {titles.proximal}
                                            </span>
                                            <ul className="mt-1 space-y-1">
                                              {selectedStructure.subParts.proximal.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-[#0D2B1D] dark:text-[#EAE3D2]">
                                                  <span
                                                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                                    style={{ backgroundColor: selectedStructure.colorCode }}
                                                  />
                                                  <span>{pt}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {selectedStructure.subParts.shaft?.length > 0 && (
                                          <div>
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block">
                                              {titles.shaft}
                                            </span>
                                            <ul className="mt-1 space-y-1">
                                              {selectedStructure.subParts.shaft.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-[#0D2B1D] dark:text-[#EAE3D2]">
                                                  <span
                                                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                                    style={{ backgroundColor: selectedStructure.colorCode }}
                                                  />
                                                  <span>{pt}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {selectedStructure.subParts.distal?.length > 0 && (
                                          <div>
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block">
                                              {titles.distal}
                                            </span>
                                            <ul className="mt-1 space-y-1">
                                              {selectedStructure.subParts.distal.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-[#0D2B1D] dark:text-[#EAE3D2]">
                                                  <span
                                                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                                    style={{ backgroundColor: selectedStructure.colorCode }}
                                                  />
                                                  <span>{pt}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* Section 2: Biomechanical Functions */}
                            <div className="rounded-xl border border-[rgba(212,155,75,0.25)] bg-white/70 dark:bg-white/5 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleAccordionSection("functions")}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Zap className="w-3.5 h-3.5 text-[#D49B4B]" />
                                  <span className="text-xs">2. Biomechanical Functions</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-[#D49B4B] transition-transform duration-200 ${openAccordion.functions ? "rotate-180" : ""
                                    }`}
                                />
                              </button>
                              {openAccordion.functions && (
                                <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,155,75,0.15)]">
                                  <ul className="space-y-1.5 text-[11px]">
                                    {selectedStructure.functions.map((fn, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[#0D2B1D] dark:text-[#EAE3D2]"
                                      >
                                        <Activity
                                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                                          style={{ color: selectedStructure.colorCode }}
                                        />
                                        <span className="leading-relaxed">{fn}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Section 3: Articulations & Connections */}
                            <div className="rounded-xl border border-[rgba(212,155,75,0.25)] bg-white/70 dark:bg-white/5 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleAccordionSection("articulations")}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Compass className="w-3.5 h-3.5 text-[#D49B4B]" />
                                  <span className="text-xs">3. Articulations & Connections</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-[#D49B4B] transition-transform duration-200 ${openAccordion.articulations ? "rotate-180" : ""
                                    }`}
                                />
                              </button>
                              {openAccordion.articulations && (
                                <div className="px-3 pb-3 pt-1 space-y-2 text-[11px] border-t border-[rgba(212,155,75,0.15)]">
                                  <div>
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold block">
                                      Adjacent Articulations & Joints:
                                    </span>
                                    <ul className="mt-1 space-y-1">
                                      {selectedStructure.articulations.map((art, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-[#0D2B1D] dark:text-[#EAE3D2]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#D49B4B] mt-1.5 shrink-0" />
                                          <span>{art}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {selectedStructure.connectedLigaments?.length > 0 && (
                                    <div className="pt-1 border-t border-black/5 dark:border-white/5">
                                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold block">
                                        Connected Ligaments & Insertions:
                                      </span>
                                      <ul className="mt-1 space-y-1">
                                        {selectedStructure.connectedLigaments.map((lig, i) => (
                                          <li key={i} className="flex items-start gap-1.5 text-[#0D2B1D] dark:text-[#EAE3D2]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <span>{lig}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Section 4: Modern Vedic Tech / Ayurvedic Metadata */}
                            <div className="rounded-xl border border-[rgba(212,155,75,0.25)] bg-white/70 dark:bg-white/5 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleAccordionSection("ayurveda")}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-[#D49B4B]" />
                                  <span className="text-xs">4. Ayurvedic Metadata</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-[#D49B4B] transition-transform duration-200 ${openAccordion.ayurveda ? "rotate-180" : ""
                                    }`}
                                />
                              </button>
                              {openAccordion.ayurveda && (
                                <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,155,75,0.15)]">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5">
                                      <span className="text-gray-500 block text-[9px] uppercase font-bold">
                                        Dhatu (Tissue Matrix):
                                      </span>
                                      <span className="font-bold text-[#0D2B1D] dark:text-[#D49B4B] block text-[11px] mt-0.5">
                                        {selectedStructure.ayurvedicMetadata.dhatu}
                                      </span>
                                    </div>

                                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5">
                                      <span className="text-gray-500 block text-[9px] uppercase font-bold">
                                        Srotas (Channel):
                                      </span>
                                      <span className="font-bold text-[#0D2B1D] dark:text-emerald-400 block text-[11px] mt-0.5">
                                        {selectedStructure.ayurvedicMetadata.srotas}
                                      </span>
                                    </div>

                                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5">
                                      <span className="text-gray-500 block text-[9px] uppercase font-bold">
                                        Dosha Affinity:
                                      </span>
                                      <span className="font-bold text-[#0D2B1D] dark:text-sky-400 block text-[11px] mt-0.5">
                                        {selectedStructure.ayurvedicMetadata.doshaAffinity}
                                      </span>
                                    </div>

                                    <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5">
                                      <span className="text-gray-500 block text-[9px] uppercase font-bold">
                                        Upadhatu:
                                      </span>
                                      <span className="font-bold text-[#0D2B1D] dark:text-purple-400 block text-[11px] mt-0.5">
                                        {selectedStructure.ayurvedicMetadata.upadhatu}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Section 5: Clinical Notes */}
                            <div className="rounded-xl border border-[rgba(212,155,75,0.25)] bg-white/70 dark:bg-white/5 overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleAccordionSection("clinical")}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-bold text-[#0D2B1D] dark:text-[#EAE3D2] hover:bg-[#F8F3E9] dark:hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#D49B4B]" />
                                  <span className="text-xs">5. Clinical Relevance & Notes</span>
                                </div>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-[#D49B4B] transition-transform duration-200 ${openAccordion.clinical ? "rotate-180" : ""
                                    }`}
                                />
                              </button>
                              {openAccordion.clinical && (
                                <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,155,75,0.15)]">
                                  <p className="text-[11px] leading-relaxed p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#0D2B1D] dark:text-[#EAE3D2] font-medium">
                                    {selectedStructure.clinicalNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[rgba(212,155,75,0.2)]">
                            <button
                              type="button"
                              onClick={() => {
                                const sysKey = selectedStructure.category.toLowerCase() as SystemId;
                                if (sysKey in ANATOMICAL_SYSTEMS) {
                                  handleSoloSystem(sysKey);
                                } else {
                                  const catKey = selectedStructure.category.toLowerCase().replace(" capsule", "") as StructureClass;
                                  handleSoloTissue(catKey in tissueVisibility ? (catKey as StructureClass) : "bone");
                                }
                              }}
                              className="py-1.5 px-2 rounded-lg bg-[#0D2B1D] text-[#D49B4B] text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-[#153e2b] transition-all shadow-xs"
                            >
                              Isolate {selectedStructure.category}
                            </button>
                            <button
                              type="button"
                              onClick={handleClearHighlight}
                              className="py-1.5 px-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Selection</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.25)] space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between pb-1 border-b border-[rgba(212,155,75,0.15)]">
                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("tissue_architecture")}
                              className="text-xs font-bold uppercase tracking-wider text-[#0D2B1D] dark:text-[#EAE3D2] hover:text-[#D49B4B] flex items-center gap-1.5 cursor-pointer text-left font-serif-heading"
                              title="Click to inspect 3) Anatomical Tissue Architecture"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#D49B4B]" />
                              <span>3) Anatomical Tissue Architecture</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("tissue_architecture")}
                              className="text-[10px] font-mono font-bold text-[#D49B4B] hover:underline cursor-pointer"
                            >
                              Inspect All
                            </button>
                          </div>

                          <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                            Click any tissue layer below or in the 3D viewport to inspect its bone parts, histological architecture, and classical Ayurvedic Sharira Rachana:
                          </p>

                          {/* Interactive 5 Physical & Ayurvedic Bone Layers */}
                          <div className="space-y-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("cortical_bone")}
                              className="w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all flex items-start gap-2 cursor-pointer border border-transparent hover:border-[#D49B4B]/30"
                              title="Inspect Cortical Bone architecture"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#EAE3D2] border border-gray-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">1. Cortical Bone (बाह्य दृढास्थि):</strong>
                                <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Dense osteon matrix, concentric lamellae & Haversian systems.</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("cancellous_bone")}
                              className="w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all flex items-start gap-2 cursor-pointer border border-transparent hover:border-[#D49B4B]/30"
                              title="Inspect Cancellous / Spongy Bone architecture"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#D8CBB5] border border-gray-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">2. Cancellous Bone (सुषिरास्थि):</strong>
                                <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Trabecular honeycomb lattice distributing mechanical strain.</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("medullary_cavity")}
                              className="w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all flex items-start gap-2 cursor-pointer border border-transparent hover:border-[#D49B4B]/30"
                              title="Inspect Medullary Cavity & Majja Dhatu"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#A83232] border border-red-800 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">3. Medullary Cavity & Majja (मज्जा):</strong>
                                <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Red & yellow marrow cavity powering hematopoiesis.</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("periosteum")}
                              className="w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all flex items-start gap-2 cursor-pointer border border-transparent hover:border-[#D49B4B]/30"
                              title="Inspect Periosteum & Asthi-Dhara Kala"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#D49B4B] border border-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">4. Periosteum (अस्थि-धरा कला):</strong>
                                <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Osteogenic cambium layer & Sharpey's perforating fibers.</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectBoneCategory("articular_cartilage")}
                              className="w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all flex items-start gap-2 cursor-pointer border border-transparent hover:border-[#D49B4B]/30"
                              title="Inspect Articular Hyaline Cartilage"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] border border-sky-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#0D2B1D] dark:text-[#EAE3D2]">5. Articular Cartilage (तरुणास्थि):</strong>
                                <span className="text-[#627067] dark:text-[#A9B9AE] ml-1">Hyaline joint cushion bathed in Sleshaka Kapha.</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vedic Ayurvedic Metadata Box */}
                  <div className="p-3.5 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Srotas (Channel):</span>
                      <span className="font-bold text-[#0D2B1D] dark:text-emerald-300">{activeSystem.srotas}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Dhatu (Tissue):</span>
                      <span className="font-bold text-[#0D2B1D] dark:text-emerald-300">{activeSystem.dhatu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Dosha Affinity:</span>
                      <span className="font-bold text-[#D49B4B]">{activeSystem.dosha}</span>
                    </div>
                  </div>

                  {/* Biochemical Reaction Preview */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2B1D] dark:text-[#EAE3D2]">
                      Physiological Mechanism
                    </h3>
                    <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-mono text-[#0D2B1D] dark:text-emerald-300">
                      {activeSystem.chemicalEquation}
                    </div>
                    <p className="text-[11px] text-[#627067] dark:text-[#A9B9AE] leading-relaxed">
                      {activeSystem.biochemicalProcess}
                    </p>
                  </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 mt-4 border-t border-[rgba(212,155,75,0.2)] space-y-2">
              <button
                type="button"
                onClick={() => setAiExplainerOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>AI Anatomy Explainer</span>
              </button>
              <button
                type="button"
                onClick={() => setLearningStudioOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D49B4B] to-[#b37e33] hover:brightness-110 text-[#0D2B1D] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <BookOpen className="w-4 h-4 text-[#0D2B1D]" />
                <span>Open BAMS Learning Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setMacroMicroModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D2B1D] hover:bg-[#153e2b] text-[#D49B4B] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Microscope className="w-4 h-4" />
                <span>Explore Molecular View</span>
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                className="w-full py-2 px-4 rounded-xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.3)] hover:bg-[#F8F3E9] text-xs font-semibold text-[#0D2B1D] dark:text-[#EAE3D2] transition-all cursor-pointer"
              >
                Reset 3D Canvas
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. MACRO-TO-MICRO MOLECULAR INSPECTION MODAL (1x ➔ 100x ➔ 10,000x)  */}
      {/* =================================================================== */}
      <MolecularInspectionViewer
        systemId={activeSystemId}
        isOpen={macroMicroModalOpen}
        onClose={() => setMacroMicroModalOpen(false)}
      />

      {/* =================================================================== */}
      {/* 5. AI ANATOMY & SUBJECT EXPLAINER MODAL                             */}
      {/* =================================================================== */}
      <AIAnatomyExplainerModal
        structureName={selectedStructure?.commonName || activeSystem.name}
        sanskritName={selectedStructure?.ayurvedicMetadata?.dhatu || activeSystem.sanskritName}
        region={selectedStructure?.category || "Full Body"}
        isOpen={aiExplainerOpen}
        onClose={() => setAiExplainerOpen(false)}
      />

      {/* =================================================================== */}
      {/* 6. BAMS ANATOMY LEARNING STUDIO MODAL                               */}
      {/* =================================================================== */}
      <AnatomyLearningStudio
        isOpen={learningStudioOpen}
        onClose={() => setLearningStudioOpen(false)}
        selectedStructure={selectedStructure}
        activeSystemId={activeSystemId}
        onSelectStructure={(struct) => {
          setSelectedStructure(struct);
          setRightSidebarOpen(true);
          setAllAccordionOpen(true);
          setLearningStudioOpen(false);
        }}
      />
    </div>
  );
}
