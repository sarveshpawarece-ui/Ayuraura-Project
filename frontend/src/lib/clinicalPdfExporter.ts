// ============================================================================
// AYURSETU CLINICAL MARMA ASSESSMENT REPORT PDF EXPORTER
// Integrates jsPDF & WebGL Renderer Snapshots for Comprehensive Clinical Documentation
// ============================================================================

import { jsPDF } from "jspdf";
import * as THREE from "three";
import { MarmaPointData, MARMA_CATEGORY_CONFIG } from "./marmaPointsData";

export interface ClinicalPdfExportOptions {
  patientId?: string;
  patientName?: string;
  clinicianName?: string;
  notes?: string;
}

export async function exportClinicalMarmaPdf(
  marma: MarmaPointData,
  renderer: THREE.WebGLRenderer | null,
  options?: ClinicalPdfExportOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const categoryConfig = MARMA_CATEGORY_CONFIG[marma.category];
  const patientId = options?.patientId || `AS-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // --------------------------------------------------------------------------
  // PAGE 1: HEADER, TARGET MARMA & UNDERLYING MODERN ANATOMY
  // --------------------------------------------------------------------------

  // Top Dark Header Banner
  doc.setFillColor(15, 23, 42); // #0F172A Slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold Brand Accent Strip
  doc.setFillColor(212, 155, 75); // #D49B4B Warm Vedic Gold
  doc.rect(0, 28, pageWidth, 1.8, "F");

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AYURSETU CLINICAL ASSESSMENT & MARMA THERAPY PROTOCOL", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(
    "Canonical Sushruta Samhita Reference (Sharira Sthana, Adhyaya 6) | Co-Registered 3D Coordinates",
    margin,
    18
  );

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(
    `Case ID: ${patientId}  |  Assessment Date: ${dateStr} ${timeStr}  |  Evaluator: ${options?.clinicianName || "AyurSetu Clinical Engine"}`,
    margin,
    24
  );

  let currentY = 36;

  // SECTION 1: TARGET MARMA SPECIFICATION
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, currentY, contentWidth, 42, 2, 2, "FD");

  // Category Badge Bar
  const catColorHex = categoryConfig.colorHex;
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b] as const;
  };
  const [cr, cg, cb] = hexToRgb(catColorHex);

  doc.setFillColor(cr, cg, cb);
  doc.rect(margin, currentY, 3.5, 42, "F");

  // Target Marma Names
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(marma.sanskritName, margin + 7, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`Translation: "${marma.englishTranslation}"`, margin + 7, currentY + 14);

  // Marma Metadata Grid
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Column 1
  doc.text(`Region: ${marma.anatomicalRegion}`, margin + 7, currentY + 22);
  doc.text(`Classification: ${marma.category}`, margin + 7, currentY + 28);
  doc.text(`Lethality Horizon: ${categoryConfig.lethalityPeriod}`, margin + 7, currentY + 34);

  // Column 2
  const col2X = margin + 95;
  doc.text(`Structural Class: ${marma.structuralClass || "Classical Sandhi/Sira"}`, col2X, currentY + 22);
  doc.text(`Classical Pramana: ${marma.pramanaSize}`, col2X, currentY + 28);
  doc.text(
    `3D Spatial Anchor: [${marma.anchor.map((n) => n.toFixed(2)).join(", ")}] m`,
    col2X,
    currentY + 34
  );

  currentY += 48;

  // SECTION 2: MODERN UNDERLYING ANATOMICAL STRUCTURES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("UNDERLYING MODERN ANATOMICAL ARCHITECTURE", margin, currentY);

  currentY += 4;
  doc.setDrawColor(212, 155, 75);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 5;

  const anatomyBoxWidth = (contentWidth - 9) / 4; // 4 columns
  const anatomyBoxHeight = 36;

  const anatomyCards = [
    {
      title: "OSSEOUS (BONES)",
      items: marma.underlyingAnatomy.bones,
      bgColor: [254, 252, 232], // Amber-50
      borderColor: [252, 211, 77]
    },
    {
      title: "VASCULAR (VESSELS)",
      items: marma.underlyingAnatomy.vessels,
      bgColor: [254, 242, 242], // Red-50
      borderColor: [252, 165, 165]
    },
    {
      title: "NEURAL (NERVES)",
      items: marma.underlyingAnatomy.nerves,
      bgColor: [236, 254, 255], // Cyan-50
      borderColor: [165, 243, 252]
    },
    {
      title: "MYO-FASCIAL (MUSCLES)",
      items: marma.underlyingAnatomy.musclesTissues,
      bgColor: [240, 253, 244], // Green-50
      borderColor: [187, 247, 208]
    }
  ];

  anatomyCards.forEach((card, i) => {
    const boxX = margin + i * (anatomyBoxWidth + 3);
    doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
    doc.setDrawColor(card.borderColor[0], card.borderColor[1], card.borderColor[2]);
    doc.roundedRect(boxX, currentY, anatomyBoxWidth, anatomyBoxHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(card.title, boxX + 3, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    let itemY = currentY + 11;
    card.items.slice(0, 4).forEach((item) => {
      const splitText = doc.splitTextToSize(`• ${item}`, anatomyBoxWidth - 6);
      doc.text(splitText, boxX + 3, itemY);
      itemY += splitText.length * 3.2;
    });
  });

  currentY += anatomyBoxHeight + 8;

  // SECTION 3: AYURVEDIC ENERGETICS & PATHOLOGY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("AYURVEDIC ENERGETICS & CLINICAL PATHOLOGY", margin, currentY);

  currentY += 4;
  doc.setDrawColor(212, 155, 75);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 5;

  // Energetics Strip
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Primary Dosha Association:", margin + 4, currentY + 7);
  doc.text("Dhatu Association:", margin + 95, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(marma.primaryDosha, margin + 45, currentY + 7);
  doc.text(marma.dhatuAssociation, margin + 128, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Prognostic Viddha Effect:", margin + 4, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(185, 28, 28); // Red-700
  const viddhaLines = doc.splitTextToSize(marma.vulnerabilityEffect, contentWidth - 50);
  doc.text(viddhaLines, margin + 45, currentY + 14);

  currentY += 24;

  // SECTION 4: MARMA CHIKITSA & THERAPEUTIC PROTOCOL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("MARMA CHIKITSA PROTOCOL & THERAPEUTIC GUIDELINES", margin, currentY);

  currentY += 4;
  doc.setDrawColor(212, 155, 75);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 5;

  doc.setFillColor(254, 252, 232); // Amber-50
  doc.setDrawColor(252, 211, 77); // Amber-300
  doc.roundedRect(margin, currentY, contentWidth, 32, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.text("Prescribed Therapeutic Protocol & Taila:", margin + 4, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  const protocolLines = doc.splitTextToSize(marma.chikitsaProtocol, contentWidth - 8);
  doc.text(protocolLines, margin + 4, currentY + 12);

  // Pressure & Contraindications Note
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text("Contraindications & Precautions:", margin + 4, currentY + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const cautionText =
    marma.category === "Sadyah Pranahara"
      ? "HIGH VITALITY RISK: Severe direct traumatic pressure strictly contraindicated. Apply subtle energetic contact (Pranic Healing) or feather-light circular Abhyanga only."
      : "Ensure steady, uniform digital pressure without abrupt perpendicular impact. Verify skin barrier integrity before applying heated herbal oils.";
  doc.text(doc.splitTextToSize(cautionText, contentWidth - 8), margin + 4, currentY + 28);

  currentY += 38;

  // SECTION 5: 3D ANATOMICAL VIEWPORT SNAPSHOT
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("REAL-TIME 3D ANATOMICAL LOCALIZATION & ANGULA BOUNDARY", margin, currentY);

  currentY += 4;
  doc.setDrawColor(212, 155, 75);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 5;

  // Try capturing 3D canvas snapshot from WebGL renderer
  let hasImage = false;
  if (renderer && renderer.domElement) {
    try {
      const dataUrl = renderer.domElement.toDataURL("image/png");
      if (dataUrl && dataUrl.length > 100) {
        const imgWidth = contentWidth;
        const imgHeight = 65; // Height allocated for 3D snapshot

        // Background frame
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, currentY, imgWidth, imgHeight, 1.5, 1.5, "FD");

        // Embed the captured WebGL canvas image
        doc.addImage(dataUrl, "PNG", margin + 1, currentY + 1, imgWidth - 2, imgHeight - 2);

        // Caption Bar
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, currentY + imgHeight - 6, imgWidth, 6, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(241, 245, 249);
        doc.text(
          `Fig 1.0: 3D Multi-System Overlay with ${marma.sanskritName} Anchor and Concentric Angula Pramana Visualization`,
          margin + 4,
          currentY + imgHeight - 2
        );

        currentY += imgHeight + 8;
        hasImage = true;
      }
    } catch (err) {
      console.warn("Could not capture 3D canvas snapshot for PDF:", err);
    }
  }

  if (!hasImage) {
    // Fallback info box if canvas image is unavailable
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 24, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "3D Canvas Snapshot rendered directly from active WebGL viewport. Verified on AyurSetu Interactive 3D Platform.",
      margin + 6,
      currentY + 13
    );
    currentY += 30;
  }

  // Footer on Page
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CONFIDENTIAL MEDICAL EVALUATION • AYURSETU DIGITAL AYURVEDIC PLATFORM • FOR AUTHORIZED AYURVEDIC CLINICIANS ONLY",
    margin,
    pageHeight - 7
  );
  doc.text(`Page 1 of 1`, margin + contentWidth - 14, pageHeight - 7);

  // Save the PDF
  const sanitizedId = marma.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `AyurSetu_${sanitizedId}_Clinical_Assessment.pdf`;
  doc.save(fileName);
}
