"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Microscope,
  X,
  Zap,
  Activity,
  Layers,
  RotateCw,
  Eye,
  ShieldCheck,
  Atom,
  Flame
} from "lucide-react";
import { SystemId, ANATOMICAL_SYSTEMS } from "@/lib/anatomicalSystemsData";

// ============================================================================
// MOLECULAR STRUCTURE DATA & CPK ATOM DEFINITIONS
// ============================================================================

interface AtomSpec {
  element: "C" | "H" | "O" | "N" | "P" | "Ca" | "Fe" | "Na" | "K" | "Cl";
  position: [number, number, number];
  name?: string;
}

interface BondSpec {
  from: number; // index in atoms array
  to: number;
  order?: number; // 1 = single, 2 = double
}

interface MoleculeData {
  id: string;
  name: string;
  chemicalFormula: string;
  category: string;
  ayurvedicDhatuAgni: string;
  dhatuAgniDescription: string;
  molecularWeight: string;
  description: string;
  ions: {
    na: string;
    k: string;
    ca: string;
    cl: string;
  };
  atoms: AtomSpec[];
  bonds: BondSpec[];
}

const ELEMENT_STYLES: Record<string, { color: string; radius: number; spaceRadius: number }> = {
  C: { color: "#374151", radius: 0.18, spaceRadius: 0.35 },   // Dark Slate
  H: { color: "#F3F4F6", radius: 0.12, spaceRadius: 0.25 },   // Light Grey
  O: { color: "#EF4444", radius: 0.20, spaceRadius: 0.38 },   // Crimson Red
  N: { color: "#3B82F6", radius: 0.20, spaceRadius: 0.38 },   // Royal Blue
  P: { color: "#F59E0B", radius: 0.24, spaceRadius: 0.45 },   // Amber Orange
  Ca: { color: "#10B981", radius: 0.28, spaceRadius: 0.50 },  // Emerald Green
  Fe: { color: "#8B5CF6", radius: 0.26, spaceRadius: 0.48 },  // Purple Metallic
  Na: { color: "#06B6D4", radius: 0.24, spaceRadius: 0.45 },  // Cyan
  K: { color: "#A855F7", radius: 0.28, spaceRadius: 0.50 },   // Violet
  Cl: { color: "#22C55E", radius: 0.22, spaceRadius: 0.40 },  // Lime Green
};

// Canonical 3D Molecular Structures per Anatomical System
const SYSTEM_MOLECULES: Record<SystemId, MoleculeData> = {
  skeletal: {
    id: "hydroxyapatite",
    name: "Hydroxyapatite Crystal Matrix",
    chemicalFormula: "Ca₁₀(PO₄)₆(OH)₂",
    category: "Crystalline Bio-Mineral",
    ayurvedicDhatuAgni: "Asthyagni (अस्थ्यग्नि)",
    dhatuAgniDescription:
      "Asthyagni converts Poshaka Medas into rigid Asthi Dhatu via Prithvi and Tejas Mahabhuta condensation, generating Upadhatu (Teeth & Nails).",
    molecularWeight: "1,004.6 g/mol",
    description:
      "Hexagonal crystal lattice constituting 70% of human bone dry weight, resisting tensile and compressive forces with bone collagen fibrils.",
    ions: { na: "142 mEq/L", k: "4.5 mEq/L", ca: "2.4 mmol/L", cl: "103 mEq/L" },
    atoms: [
      { element: "Ca", position: [0, 0, 0], name: "Ca²⁺ Center" },
      { element: "Ca", position: [0.85, 0, 0], name: "Ca²⁺ Col 1" },
      { element: "Ca", position: [-0.85, 0, 0], name: "Ca²⁺ Col 2" },
      { element: "Ca", position: [0.42, 0.73, 0], name: "Ca²⁺ Col 3" },
      { element: "Ca", position: [-0.42, 0.73, 0], name: "Ca²⁺ Col 4" },
      { element: "Ca", position: [0.42, -0.73, 0], name: "Ca²⁺ Col 5" },
      { element: "Ca", position: [-0.42, -0.73, 0], name: "Ca²⁺ Col 6" },
      { element: "P", position: [0, 1.2, 0.3], name: "Phosphate P" },
      { element: "O", position: [0, 1.5, 0.3], name: "Phosphate O1" },
      { element: "O", position: [0.35, 1.1, 0.5], name: "Phosphate O2" },
      { element: "O", position: [-0.35, 1.1, 0.5], name: "Phosphate O3" },
      { element: "O", position: [0, 0.9, -0.1], name: "Phosphate O4" },
      { element: "P", position: [0, -1.2, -0.3], name: "Phosphate P" },
      { element: "O", position: [0, -1.5, -0.3], name: "Phosphate O1" },
      { element: "O", position: [0.35, -1.1, -0.5], name: "Phosphate O2" },
      { element: "O", position: [-0.35, -1.1, -0.5], name: "Phosphate O3" },
      { element: "O", position: [0, -0.9, 0.1], name: "Phosphate O4" },
      { element: "O", position: [0, 0, 0.8], name: "Hydroxide O" },
      { element: "H", position: [0, 0, 1.1], name: "Hydroxide H" },
    ],
    bonds: [
      { from: 7, to: 8 },
      { from: 7, to: 9 },
      { from: 7, to: 10 },
      { from: 7, to: 11 },
      { from: 12, to: 13 },
      { from: 12, to: 14 },
      { from: 12, to: 15 },
      { from: 12, to: 16 },
      { from: 17, to: 18 },
      { from: 0, to: 17 },
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 0, to: 5 },
      { from: 0, to: 6 },
    ],
  },
  cardiovascular: {
    id: "hemoglobin_heme",
    name: "Hemoglobin Heme B Complex (Fe²⁺ - O₂)",
    chemicalFormula: "C₃₄H₃₂FeN₄O₄ + O₂",
    category: "Porphyrin Metalloprotein",
    ayurvedicDhatuAgni: "Raktagni (रक्ताग्नि)",
    dhatuAgniDescription:
      "Raktagni metabolizes Rasa Dhatu with Ranjaka Pitta in liver/spleen, imbuing bright red coloration and carrying Prana Vayu life force.",
    molecularWeight: "616.5 g/mol (Heme)",
    description:
      "Octahedral coordination complex where ferrous iron (Fe²⁺) reversibly binds diatomic oxygen (O₂) with positive cooperativity.",
    ions: { na: "140 mEq/L", k: "4.0 mEq/L", ca: "1.2 mmol/L", cl: "102 mEq/L" },
    atoms: [
      { element: "Fe", position: [0, 0, 0], name: "Central Fe²⁺" },
      { element: "N", position: [0.7, 0, 0], name: "Pyrrole N1" },
      { element: "N", position: [-0.7, 0, 0], name: "Pyrrole N2" },
      { element: "N", position: [0, 0.7, 0], name: "Pyrrole N3" },
      { element: "N", position: [0, -0.7, 0], name: "Pyrrole N4" },
      { element: "C", position: [1.2, 0.5, 0], name: "C1" },
      { element: "C", position: [1.2, -0.5, 0], name: "C2" },
      { element: "C", position: [-1.2, 0.5, 0], name: "C3" },
      { element: "C", position: [-1.2, -0.5, 0], name: "C4" },
      { element: "C", position: [0.5, 1.2, 0], name: "C5" },
      { element: "C", position: [-0.5, 1.2, 0], name: "C6" },
      { element: "C", position: [0.5, -1.2, 0], name: "C7" },
      { element: "C", position: [-0.5, -1.2, 0], name: "C8" },
      { element: "O", position: [0, 0, 0.85], name: "Ligand O1" },
      { element: "O", position: [0.35, 0, 1.35], name: "Ligand O2" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 1, to: 5 },
      { from: 1, to: 6 },
      { from: 2, to: 7 },
      { from: 2, to: 8 },
      { from: 3, to: 9 },
      { from: 3, to: 10 },
      { from: 4, to: 11 },
      { from: 4, to: 12 },
      { from: 5, to: 9 },
      { from: 6, to: 11 },
      { from: 7, to: 10 },
      { from: 8, to: 12 },
      { from: 0, to: 13 },
      { from: 13, to: 14 },
    ],
  },
  muscular: {
    id: "actin_myosin_atp",
    name: "Actin-Myosin ATP Hydrolysis Pocket",
    chemicalFormula: "ATP + H₂O ➔ ADP + Pi + Energy",
    category: "Contractile Mechanochemical Filament",
    ayurvedicDhatuAgni: "Mamsagni (मांसाग्नि)",
    dhatuAgniDescription:
      "Mamsagni converts Rakta into Mamsa Dhatu, nourishing muscle bulk, strength (Bala), and tendon Upadhatus (Snayu & Kandara).",
    molecularWeight: "507.18 g/mol (ATP)",
    description:
      "Cross-bridge power stroke: Ca²⁺ binding triggers troponin conformational displacement, enabling myosin heads to pivot and contract sarcomeres.",
    ions: { na: "10 mEq/L (intra)", k: "140 mEq/L (intra)", ca: "0.1 µmol/L ➔ 10 µmol/L", cl: "4 mEq/L" },
    atoms: [
      { element: "P", position: [0, 0, 0], name: "Alpha Phosphate" },
      { element: "O", position: [0, 0.45, 0], name: "Alpha O" },
      { element: "O", position: [0.35, -0.2, 0.2], name: "Alpha O" },
      { element: "P", position: [-0.85, 0, 0], name: "Beta Phosphate" },
      { element: "O", position: [-0.85, 0.45, 0], name: "Beta O" },
      { element: "P", position: [-1.7, 0, 0], name: "Gamma Phosphate" },
      { element: "O", position: [-1.7, 0.45, 0], name: "Gamma O (Cleaved)" },
      { element: "O", position: [-2.1, -0.2, 0], name: "Pi Terminal O" },
      { element: "Ca", position: [0.8, 0.7, 0.5], name: "Troponin Ca²⁺" },
      { element: "C", position: [0.85, -0.4, 0], name: "Ribose C" },
      { element: "N", position: [1.6, -0.6, 0], name: "Adenine N" },
      { element: "C", position: [2.1, -0.2, 0], name: "Adenine Ring" },
      { element: "N", position: [2.6, -0.7, 0], name: "Adenine Amino" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 5, to: 6 },
      { from: 5, to: 7 },
      { from: 0, to: 9 },
      { from: 9, to: 10 },
      { from: 10, to: 11 },
      { from: 11, to: 12 },
    ],
  },
  nervous: {
    id: "acetylcholine_synapse",
    name: "Acetylcholine Neurotransmitter & Na⁺/K⁺ Gate",
    chemicalFormula: "CH₃COOCH₂CH₂N⁺(CH₃)₃",
    category: "Cholinergic Neurotransmitter",
    ayurvedicDhatuAgni: "Majjagni (मज्जाग्नि)",
    dhatuAgniDescription:
      "Majjagni purifies Asthi into oily, insulating Majja Dhatu, supporting cranial and neural conductive tissue (Akasha & Vata conveyance).",
    molecularWeight: "146.2 g/mol",
    description:
      "Depolarizing neurotransmitter opening postsynaptic nicotinic ligand-gated ion channels for rapid sodium (Na⁺) influx and action potential propagation.",
    ions: { na: "145 mEq/L (extra) / 12 mEq/L (intra)", k: "4 mEq/L (extra) / 140 mEq/L (intra)", ca: "1.3 mmol/L", cl: "105 mEq/L" },
    atoms: [
      { element: "N", position: [0, 0, 0], name: "Quaternary Nitrogen" },
      { element: "C", position: [0.65, 0, 0], name: "Methyl 1" },
      { element: "C", position: [-0.65, 0.3, 0], name: "Methyl 2" },
      { element: "C", position: [0, -0.65, 0.3], name: "Methyl 3" },
      { element: "C", position: [0, 0.65, -0.3], name: "Choline CH2" },
      { element: "C", position: [0.5, 1.2, -0.2], name: "Choline CH2" },
      { element: "O", position: [0.3, 1.7, 0.3], name: "Ester Oxygen" },
      { element: "C", position: [-0.3, 2.2, 0.2], name: "Carbonyl Carbon" },
      { element: "O", position: [-0.8, 2.3, -0.7], name: "Carbonyl Oxygen" },
      { element: "C", position: [-0.5, 2.7, 1.4], name: "Acetyl Methyl" },
      { element: "Na", position: [1.6, 0.8, -1.0], name: "Transiting Na⁺" },
      { element: "K", position: [-1.6, -0.8, 1.0], name: "Counter K⁺" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
      { from: 7, to: 9 },
    ],
  },
  respiratory: {
    id: "surfactant_dppc",
    name: "Pulmonary Surfactant (DPPC Monolayer)",
    chemicalFormula: "C₄₀H₈₀NO₈P",
    category: "Alveolar Amphiphilic Phospholipid",
    ayurvedicDhatuAgni: "Pranavaha Agni & Bodhaka Kapha",
    dhatuAgniDescription:
      "Bodhaka & Kledaka Kapha maintain protective moisture in the respiratory mucosa, preventing alveolar collapse under Prana Vayu movement.",
    molecularWeight: "734.0 g/mol",
    description:
      "Synthesized by Type II alveolar cells to lower surface tension at the air-water interface, preventing alveolar atelectasis during expiration.",
    ions: { na: "138 mEq/L", k: "4.2 mEq/L", ca: "2.2 mmol/L", cl: "100 mEq/L" },
    atoms: [
      { element: "P", position: [0, 0, 0], name: "Phosphate Core" },
      { element: "O", position: [0, 0.45, 0], name: "O" },
      { element: "O", position: [0, -0.45, 0], name: "O" },
      { element: "O", position: [0.45, 0, 0], name: "O" },
      { element: "O", position: [-0.45, 0, 0], name: "O" },
      { element: "C", position: [0.8, 0, 0.5], name: "Choline Base" },
      { element: "N", position: [1.4, 0, 0.7], name: "Choline N" },
      { element: "C", position: [-0.8, 0.3, -0.4], name: "Glycerol C1" },
      { element: "C", position: [-1.4, 0.5, -0.8], name: "Fatty Chain 1" },
      { element: "C", position: [-2.0, 0.7, -1.2], name: "Fatty Chain 1" },
      { element: "C", position: [-0.8, -0.3, 0.4], name: "Glycerol C2" },
      { element: "C", position: [-1.4, -0.5, 0.8], name: "Fatty Chain 2" },
      { element: "C", position: [-2.0, -0.7, 1.2], name: "Fatty Chain 2" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 3, to: 5 },
      { from: 5, to: 6 },
      { from: 4, to: 7 },
      { from: 7, to: 8 },
      { from: 8, to: 9 },
      { from: 4, to: 10 },
      { from: 10, to: 11 },
      { from: 11, to: 12 },
    ],
  },
  digestive: {
    id: "pepsinogen_hcl",
    name: "Gastric H⁺/K⁺ ATPase & Pepsin Cleavage",
    chemicalFormula: "ATP + H⁺(intra) + K⁺(extra) ➔ H⁺(lumen) + K⁺(intra)",
    category: "Acid-Secreting Proton Pump & Zymogen",
    ayurvedicDhatuAgni: "Jatharagni & Pachaka Pitta (पाचकाग्नि)",
    dhatuAgniDescription:
      "Jatharagni represents supreme digestive fire seated in Grahani; Pachaka Pitta hydrolyzes diet into Ahara Rasa and excretes Kitta.",
    molecularWeight: "34,500 Da (Pepsin)",
    description:
      "Parietal cells secrete HCl via H⁺/K⁺-ATPase against a 1-million-fold gradient (pH ~1.5) to cleave pepsinogen into active endopeptidase pepsin.",
    ions: { na: "140 mEq/L", k: "5 mEq/L (serum) / 15 mEq/L (gastric)", ca: "1.2 mmol/L", cl: "160 mEq/L (gastric juice)" },
    atoms: [
      { element: "P", position: [0, 0, 0], name: "ATP Phosphate" },
      { element: "O", position: [0, 0.45, 0], name: "Phosphate O" },
      { element: "O", position: [0.45, 0, 0], name: "Phosphate O" },
      { element: "C", position: [-0.6, 0, 0], name: "Aspartate Residue" },
      { element: "O", position: [-1.1, 0.3, 0], name: "Aspartate Carbonyl" },
      { element: "K", position: [1.2, 0.6, 0.4], name: "Exchange K⁺" },
      { element: "H", position: [-0.5, 0.9, -0.4], name: "Secreted H⁺" },
      { element: "Cl", position: [1.0, -0.8, -0.3], name: "Lumen Cl⁻" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 3, to: 4 },
    ],
  },
  integumentary: {
    id: "keratin_cholecalciferol",
    name: "Keratin Intermediate Filament & Vitamin D₃",
    chemicalFormula: "C₂₇H₄₄O (Cholecalciferol)",
    category: "Cytoskeletal Scleroprotein & Secosteroid",
    ayurvedicDhatuAgni: "Bhrajaka Pitta (भ्राजक पित्त)",
    dhatuAgniDescription:
      "Bhrajaka Pitta resides in the seven Twak layers, bestowing luster (Varna), radiant complexion, and absorbing transdermal Taila/Lepa.",
    molecularWeight: "384.6 g/mol",
    description:
      "Cysteine-rich alpha-helical coiled-coil coiled keratins forming desmosomal tone filaments, resisting mechanical friction and microbial invasion.",
    ions: { na: "140 mEq/L", k: "4.5 mEq/L", ca: "2.3 mmol/L", cl: "102 mEq/L" },
    atoms: [
      { element: "C", position: [0, 0, 0], name: "Sterol Ring A" },
      { element: "C", position: [0.5, 0.4, 0], name: "C" },
      { element: "C", position: [1.0, 0, 0], name: "C" },
      { element: "O", position: [1.4, -0.3, 0.2], name: "3β-Hydroxyl O" },
      { element: "H", position: [1.8, -0.5, 0.3], name: "3β-Hydroxyl H" },
      { element: "C", position: [0, -0.6, 0], name: "Triene Seco Link" },
      { element: "C", position: [-0.6, -0.9, 0], name: "Ring C" },
      { element: "C", position: [-1.2, -0.6, 0], name: "Ring D" },
      { element: "C", position: [-1.8, -1.0, 0.4], name: "Aliphatic Tail" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 0, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
    ],
  },
  lymphatic: {
    id: "immunoglobulin_g",
    name: "Immunoglobulin G & Perforin-Granzyme Pore",
    chemicalFormula: "IgG (H₂L₂) ~150 kDa",
    category: "Glycoprotein Antibody & Cytolytic Serine Protease",
    ayurvedicDhatuAgni: "Ojas & Rasagni (ओजस् व रसाग्नि)",
    dhatuAgniDescription:
      "Ojas is the quintessence of all seven Dhatus; Vyadhikshamatwa (immunity) depends on pure Rasa Dhatu and supreme unvitiated Ojas.",
    molecularWeight: "150,000 Da",
    description:
      "Bivalent Y-shaped immunoglobulin with Fab antigen-binding domains and Fc region triggering complement cascade C1q and macrophage phagocytosis.",
    ions: { na: "142 mEq/L", k: "4.3 mEq/L", ca: "2.4 mmol/L", cl: "104 mEq/L" },
    atoms: [
      { element: "C", position: [0, 0, 0], name: "Hinge Region C" },
      { element: "N", position: [0, 0.5, 0], name: "Disulfide N" },
      { element: "C", position: [0.6, 0.9, 0.3], name: "Fab Left Heavy" },
      { element: "C", position: [1.2, 1.4, 0.5], name: "Fab Left Variable" },
      { element: "C", position: [-0.6, 0.9, 0.3], name: "Fab Right Heavy" },
      { element: "C", position: [-1.2, 1.4, 0.5], name: "Fab Right Variable" },
      { element: "C", position: [0, -0.6, -0.2], name: "Fc Stem CH2" },
      { element: "C", position: [0, -1.2, -0.3], name: "Fc Stem CH3" },
      { element: "O", position: [0.3, -1.5, -0.1], name: "Glycan Core" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 1, to: 4 },
      { from: 4, to: 5 },
      { from: 0, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
    ],
  },
  endocrine: {
    id: "thyroxine_t4",
    name: "Thyroxine (T₄) & cAMP Second Messenger",
    chemicalFormula: "C₁₅H₁₁I₄NO₄",
    category: "Tyrosine-Derived Iodinated Hormone",
    ayurvedicDhatuAgni: "Koshthagni & Sukshma Dhatu Paka",
    dhatuAgniDescription:
      "Endocrine secretions act as cellular messengers of Dhatu Agnis, regulating basal metabolic rate and tissue transformation rates.",
    molecularWeight: "776.87 g/mol",
    description:
      "Tetraiodothyronine produced by thyroid follicular cells, deiodinated in peripheral tissues into active T₃, stimulating mitochondrial respiration.",
    ions: { na: "141 mEq/L", k: "4.1 mEq/L", ca: "2.3 mmol/L", cl: "103 mEq/L" },
    atoms: [
      { element: "C", position: [0, 0, 0], name: "Inner Ring" },
      { element: "C", position: [0.6, 0.3, 0], name: "C" },
      { element: "O", position: [1.2, 0, 0], name: "Ether Link" },
      { element: "C", position: [1.8, 0.3, 0], name: "Outer Ring" },
      { element: "C", position: [2.4, 0, 0], name: "C" },
      { element: "O", position: [3.0, -0.2, 0.2], name: "Phenolic OH" },
      { element: "C", position: [-0.6, 0.3, 0], name: "Alanine Chain" },
      { element: "N", position: [-1.2, 0, 0.3], name: "Amino Group" },
      { element: "P", position: [-0.5, -0.8, -0.4], name: "cAMP Core" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 0, to: 6 },
      { from: 6, to: 7 },
    ],
  },
  urinary: {
    id: "urea_aquaporin",
    name: "Urea Molecule & Aquaporin Water Channel",
    chemicalFormula: "CH₄N₂O & H₂O",
    category: "Nitrogenous Waste Solute & Tetrameric Pore",
    ayurvedicDhatuAgni: "Kitta-Paka & Mutravaha Agni",
    dhatuAgniDescription:
      "Apana Vayu regulates the excretion of Kitta Mala (Mutra and Purisha); proper water absorption sustains liquid equilibrium (Udaka).",
    molecularWeight: "60.06 g/mol (Urea)",
    description:
      "Ammonia detoxified into urea in the ornithine cycle; concentrated in collecting ducts via counter-current gradient and Aquaporin-2 channels.",
    ions: { na: "140 mEq/L (serum) / 80-180 mEq/L (urine)", k: "4.5 mEq/L (serum) / 40-80 mEq/L (urine)", ca: "2.4 mmol/L", cl: "105 mEq/L" },
    atoms: [
      { element: "C", position: [0, 0, 0], name: "Carbonyl Carbon" },
      { element: "O", position: [0, 0.65, 0], name: "Carbonyl Oxygen" },
      { element: "N", position: [0.6, -0.4, 0], name: "Amine N1" },
      { element: "H", position: [1.1, -0.2, 0.2], name: "H1" },
      { element: "H", position: [0.8, -0.9, -0.2], name: "H2" },
      { element: "N", position: [-0.6, -0.4, 0], name: "Amine N2" },
      { element: "H", position: [-1.1, -0.2, 0.2], name: "H3" },
      { element: "H", position: [-0.8, -0.9, -0.2], name: "H4" },
      { element: "O", position: [0, 0, 1.4], name: "Aquaporin H₂O" },
      { element: "H", position: [0.3, 0.2, 1.7], name: "Water H" },
      { element: "H", position: [-0.3, 0.2, 1.7], name: "Water H" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 0, to: 5 },
      { from: 5, to: 6 },
      { from: 5, to: 7 },
      { from: 8, to: 9 },
      { from: 8, to: 10 },
    ],
  },
  reproductive: {
    id: "progesterone_estradiol",
    name: "Steroid Hormones (Estradiol & Testosterone)",
    chemicalFormula: "C₁₈H₂₄O₂ (Estradiol) / C₁₉H₂₈O₂ (Testosterone)",
    category: "Cyclopentanoperhydrophenanthrene Core",
    ayurvedicDhatuAgni: "Shukragni & Arthavagni (शुक्राग्नि व आर्तवाग्नि)",
    dhatuAgniDescription:
      "Shukra and Artava are the finest refined reproductive Dhatus, carrying Garbhotpadana (procreative) energy and radiant vigor.",
    molecularWeight: "272.38 g/mol",
    description:
      "Cholesterol-derived lipophilic steroid hormones binding intracellular nuclear receptors to regulate gametogenesis and secondary sexual traits.",
    ions: { na: "142 mEq/L", k: "4.2 mEq/L", ca: "2.3 mmol/L", cl: "103 mEq/L" },
    atoms: [
      { element: "C", position: [0, 0, 0], name: "A-Ring C3" },
      { element: "O", position: [0, -0.6, 0], name: "Phenolic O" },
      { element: "C", position: [0.6, 0.4, 0], name: "C" },
      { element: "C", position: [1.2, 0, 0], name: "B-Ring C" },
      { element: "C", position: [1.8, 0.4, 0], name: "C-Ring C" },
      { element: "C", position: [2.4, 0, 0], name: "D-Ring C" },
      { element: "C", position: [2.9, 0.5, 0.2], name: "C17" },
      { element: "O", position: [3.4, 0.8, 0.4], name: "17β-Hydroxyl" },
      { element: "H", position: [3.8, 1.0, 0.5], name: "H" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
    ],
  },
};

// ============================================================================
// COMPONENT: MOLECULAR INSPECTION VIEWER (MACRO ➔ TISSUE ➔ MOLECULAR)
// ============================================================================

interface MolecularInspectionViewerProps {
  systemId: SystemId;
  isOpen: boolean;
  onClose: () => void;
}

export default function MolecularInspectionViewer({
  systemId,
  isOpen,
  onClose,
}: MolecularInspectionViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<"macro" | "tissue" | "molecular">("molecular");
  const [renderMode, setRenderMode] = useState<"ball_and_stick" | "space_filling">("ball_and_stick");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const reqAnimRef = useRef<number | null>(null);

  const systemMeta = ANATOMICAL_SYSTEMS[systemId as SystemId] || ANATOMICAL_SYSTEMS.skeletal;
  const moleculeData = SYSTEM_MOLECULES[systemId] || SYSTEM_MOLECULES.skeletal;

  // Initialize and update 3D Molecular Three.js Scene
  useEffect(() => {
    if (!isOpen || zoomLevel !== "molecular") return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    // Dedicated Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07160E"); // Deep Vedic emerald black
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.minDistance = 1.5;
    controls.maxDistance = 12.0;
    controlsRef.current = controls;

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xfffaed, 1.8);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd49b4b, 1.0);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    rimLight.position.set(0, -6, 5);
    scene.add(rimLight);

    // Build 3D Molecular Structure (Ball-and-Stick / Space-Filling)
    const moleculeGroup = new THREE.Group();
    moleculeGroupRef.current = moleculeGroup;
    scene.add(moleculeGroup);

    // Atoms
    moleculeData.atoms.forEach((atom, idx) => {
      const style = ELEMENT_STYLES[atom.element] || { color: "#9CA3AF", radius: 0.2, spaceRadius: 0.4 };
      const rad = renderMode === "space_filling" ? style.spaceRadius : style.radius;

      const sphereGeo = new THREE.SphereGeometry(rad, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(style.color),
        roughness: 0.25,
        metalness: 0.25,
        emissive: new THREE.Color(style.color),
        emissiveIntensity: 0.12,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...atom.position);
      sphere.userData = { atom, index: idx };
      moleculeGroup.add(sphere);
    });

    // Covalent & Ionic Bonds (only shown in ball_and_stick mode)
    if (renderMode === "ball_and_stick") {
      const bondMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#CBD5E1"),
        roughness: 0.3,
        metalness: 0.1,
      });

      moleculeData.bonds.forEach((bond) => {
        const atomA = moleculeData.atoms[bond.from];
        const atomB = moleculeData.atoms[bond.to];
        if (!atomA || !atomB) return;

        const posA = new THREE.Vector3(...atomA.position);
        const posB = new THREE.Vector3(...atomB.position);
        const distance = posA.distanceTo(posB);
        const center = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

        const cylinderGeo = new THREE.CylinderGeometry(0.045, 0.045, distance, 16);
        const bondMesh = new THREE.Mesh(cylinderGeo, bondMat);
        bondMesh.position.copy(center);

        // Orient cylinder along vector from A to B
        const orientation = new THREE.Vector3().subVectors(posB, posA).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, orientation);
        bondMesh.quaternion.copy(quat);

        moleculeGroup.add(bondMesh);
      });
    }

    // Centering the molecular lattice
    const box = new THREE.Box3().setFromObject(moleculeGroup);
    const center = box.getCenter(new THREE.Vector3());
    moleculeGroup.position.sub(center);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();
    reqAnimRef.current = animId;

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
      container.innerHTML = "";
    };
  }, [isOpen, zoomLevel, renderMode, autoRotate, moleculeData, systemId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#FBF9F5] dark:bg-[#07160E] border border-[#D49B4B]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ================================================================= */}
        {/* MODAL HEADER WITH LEVEL SELECTOR                                  */}
        {/* ================================================================= */}
        <div className="px-6 py-4 bg-[#0D2B1D] text-[#D49B4B] flex flex-wrap items-center justify-between gap-4 border-b border-[#D49B4B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#D49B4B] shadow-inner">
              <Microscope className="w-5 h-5 text-[#D49B4B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif-heading text-[#D49B4B]">
                  Macro-to-Micro Molecular Cascade
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 font-bold">
                  {systemMeta.code}
                </span>
              </div>
              <p className="text-xs text-[#EAE3D2] font-serif">
                {systemMeta.name} • {systemMeta.sanskritName}
              </p>
            </div>
          </div>

          {/* 3-Level Micro Transition Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/10 border border-[#D49B4B]/30 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => setZoomLevel("macro")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                zoomLevel === "macro"
                  ? "bg-[#D49B4B] text-[#0D2B1D] shadow-sm font-bold"
                  : "text-[#EAE3D2] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>1x Macro</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel("tissue")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                zoomLevel === "tissue"
                  ? "bg-[#D49B4B] text-[#0D2B1D] shadow-sm font-bold"
                  : "text-[#EAE3D2] hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>100x Tissue</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel("molecular")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                zoomLevel === "molecular"
                  ? "bg-[#D49B4B] text-[#0D2B1D] shadow-sm font-bold"
                  : "text-[#EAE3D2] hover:text-white"
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>10,000x Molecular 3D</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close Molecular View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* MODAL MAIN CONTENT (DUAL COLUMN: 3D VIEWPORT / DIAGRAM + INSPECTOR)*/}
        {/* ================================================================= */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: INTERACTIVE 3D MOLECULAR VIEWPORT OR TISSUE/MACRO DIAGRAM */}
          <div className="flex-1 relative flex flex-col bg-[#07160E] border-b lg:border-b-0 lg:border-r border-[#D49B4B]/20 min-h-[360px] lg:min-h-[500px]">
            
            {/* 1. 10,000x MOLECULAR 3D VIEW */}
            {zoomLevel === "molecular" && (
              <>
                <div ref={mountRef} className="w-full h-full flex-1 relative cursor-grab active:cursor-grabbing" />
                
                {/* Floating 3D Molecular Controls Toolbar */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
                  <div className="px-3 py-1.5 rounded-xl bg-[#0D2B1D]/90 backdrop-blur-md border border-[#D49B4B]/40 text-xs font-mono font-bold text-[#D49B4B] flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{moleculeData.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRenderMode(renderMode === "ball_and_stick" ? "space_filling" : "ball_and_stick")}
                    className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D49B4B]" />
                    <span>{renderMode === "ball_and_stick" ? "Ball-and-Stick" : "Space-Filling (CPK)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                      autoRotate
                        ? "bg-[#D49B4B] text-[#0D2B1D] border-[#D49B4B]"
                        : "bg-black/60 text-white border-white/20 hover:bg-black/80"
                    }`}
                    title="Toggle Orbital Auto-Rotation"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Left: Element Legend */}
                <div className="absolute bottom-4 left-4 z-10 p-2 rounded-xl bg-[#0D2B1D]/80 backdrop-blur-md border border-[#D49B4B]/30 text-[10px] font-mono text-[#EAE3D2] flex items-center gap-2.5 shadow-lg flex-wrap max-w-sm">
                  <span className="font-bold text-[#D49B4B]">CPK Elements:</span>
                  {Array.from(new Set(moleculeData.atoms.map((a) => a.element))).map((el) => {
                    const style = ELEMENT_STYLES[el];
                    return (
                      <span key={el} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: style?.color }} />
                        <span>{el}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Bottom Right: Scale indicator */}
                <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-300">
                  <span>Scale: ~1.5 Ångströms (0.15 nm)</span>
                </div>
              </>
            )}

            {/* 2. 100x TISSUE LEVEL HISTOLOGICAL CROSS-SECTION */}
            {zoomLevel === "tissue" && (
              <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center overflow-y-auto space-y-6">
                <div className="max-w-md w-full p-5 rounded-2xl bg-white/5 border border-[#D49B4B]/30 backdrop-blur-md space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D49B4B]/20 border border-[#D49B4B]/50 flex items-center justify-center text-[#D49B4B]">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#D49B4B] font-serif-heading">
                      100x Histological Cross-Section
                    </h4>
                    <p className="text-xs text-gray-300 mt-1">
                      {systemMeta.macroMicroData.cellType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                      <span className="text-[10px] text-gray-400 font-mono block">Subcellular Organelles</span>
                      <strong className="text-emerald-400 text-[11px] block mt-1">
                        {systemMeta.macroMicroData.organelles}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                      <span className="text-[10px] text-gray-400 font-mono block">Catalytic Regulatory Enzyme</span>
                      <strong className="text-[#D49B4B] text-[11px] block mt-1">
                        {systemMeta.macroMicroData.keyEnzyme}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0D2B1D]/60 border border-[#D49B4B]/30 text-left text-xs leading-relaxed text-gray-200">
                    <strong className="text-[#D49B4B] block mb-1">Microscopic Tissue Mechanics:</strong>
                    {systemMeta.description}
                  </div>
                </div>
              </div>
            )}

            {/* 3. 1x MACRO LEVEL WHOLE ORGAN VIEW */}
            {zoomLevel === "macro" && (
              <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center overflow-y-auto space-y-4">
                <div className="max-w-md w-full p-5 rounded-2xl bg-white/5 border border-[#D49B4B]/30 backdrop-blur-md space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <Eye className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#D49B4B] font-serif-heading">
                      1x Macro Whole Organ View
                    </h4>
                    <p className="text-xs text-gray-300 mt-1">
                      {systemMeta.name} • {systemMeta.sanskritName}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Srotas Channel:</span>
                      <span className="text-amber-300 font-semibold">{systemMeta.srotas}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Governing Dosha:</span>
                      <span className="text-cyan-300 font-semibold">{systemMeta.dosha}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target Dhatu:</span>
                      <span className="text-emerald-300 font-semibold">{systemMeta.dhatu}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed text-left">
                    {systemMeta.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* RIGHT: BIOCHEMICAL EQUILIBRIUM & AYURVEDIC DHATU AGNI INSPECTOR */}
          {/* =============================================================== */}
          <div className="w-full lg:w-[420px] bg-white dark:bg-[#07160E] p-6 overflow-y-auto flex flex-col gap-4 text-xs">
            
            {/* 1. Biochemical Equation Card */}
            <div className="p-4 rounded-2xl bg-[#F8F3E9] dark:bg-white/5 border border-[#D49B4B]/30 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0D2B1D] dark:text-[#EAE3D2] uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D49B4B]" />
                  Biochemical Reaction
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0D2B1D] text-[#D49B4B] text-[9.5px] font-mono font-bold">
                  EQUILIBRIUM
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D2B1D] text-[#00E5FF] font-mono text-xs text-center shadow-inner overflow-x-auto border border-[#00E5FF]/20">
                {systemMeta.chemicalEquation}
              </div>
              <p className="text-[#627067] dark:text-[#A9B9AE] leading-relaxed text-[11px]">
                {systemMeta.biochemicalProcess}
              </p>
            </div>

            {/* 2. Cellular Ion Exchange Counters */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.25)] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0D2B1D] dark:text-[#D49B4B] uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Cellular Ion Exchange (Na⁺ / K⁺ / Ca²⁺)
                </span>
                <span className="text-[9.5px] font-mono text-gray-500">Concentrations</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#F8F3E9] dark:bg-white/5 border border-black/5 flex items-center justify-between">
                  <span className="text-gray-500 font-mono text-[10px]">Sodium [Na⁺]:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                    {moleculeData.ions.na}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8F3E9] dark:bg-white/5 border border-black/5 flex items-center justify-between">
                  <span className="text-gray-500 font-mono text-[10px]">Potassium [K⁺]:</span>
                  <strong className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                    {moleculeData.ions.k}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8F3E9] dark:bg-white/5 border border-black/5 flex items-center justify-between">
                  <span className="text-gray-500 font-mono text-[10px]">Calcium [Ca²⁺]:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    {moleculeData.ions.ca}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8F3E9] dark:bg-white/5 border border-black/5 flex items-center justify-between">
                  <span className="text-gray-500 font-mono text-[10px]">Chloride [Cl⁻]:</span>
                  <strong className="text-lime-600 dark:text-lime-400 font-mono text-[11px]">
                    {moleculeData.ions.cl}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Classical Ayurvedic Dhatu Agni Metabolic Transformation */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0D2B1D]/10 to-[#D49B4B]/10 dark:from-[#0D2B1D]/40 dark:to-[#D49B4B]/20 border border-[#D49B4B]/40 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D49B4B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2B1D] dark:text-[#D49B4B] font-serif-heading">
                  Ayurvedic Dhatu Agni Transformation
                </h4>
              </div>
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#D49B4B]/20">
                <span className="font-semibold text-[#0D2B1D] dark:text-[#EAE3D2]">Active Agni Principle:</span>
                <span className="font-bold text-[#D49B4B] font-serif">{moleculeData.ayurvedicDhatuAgni}</span>
              </div>
              <p className="text-[#627067] dark:text-[#A9B9AE] leading-relaxed text-[11px]">
                {moleculeData.dhatuAgniDescription}
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-[#D49B4B]/20 text-[10.5px]">
                <strong className="text-[#0D2B1D] dark:text-amber-300 block mb-0.5">
                  Classical Sukshma Dhatu Paka:
                </strong>
                <span className="text-[#627067] dark:text-[#A9B9AE]">
                  {systemMeta.macroMicroData.ayurvedicMechanism}
                </span>
              </div>
            </div>

            {/* 4. Clinical Significance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[rgba(212,155,75,0.25)] space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#0D2B1D] dark:text-[#D49B4B] font-bold text-[11px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>NCISM Clinical Correlates</span>
              </div>
              <p className="text-[#627067] dark:text-[#A9B9AE] leading-relaxed text-[11px]">
                {systemMeta.macroMicroData.clinicalSignificance}
              </p>
            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* MODAL FOOTER                                                      */}
        {/* ================================================================= */}
        <div className="px-6 py-3 bg-[#F8F3E9] dark:bg-white/5 border-t border-[#D49B4B]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-[#627067] dark:text-[#A9B9AE] font-mono">
            <span>Formula: {moleculeData.chemicalFormula}</span>
            <span>•</span>
            <span>Mol Wt: {moleculeData.molecularWeight}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D2B1D] text-[#D49B4B] text-xs font-bold hover:bg-[#153e2b] transition-all cursor-pointer shadow-sm"
          >
            Return to 3D Anatomy Viewport
          </button>
        </div>

      </div>
    </div>
  );
}
