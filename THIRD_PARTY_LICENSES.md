# AAYURAURA — THIRD-PARTY ASSET & LICENSE AUDIT

**Version:** 1.0.0-Production  
**Audit Date:** October 2026  
**Auditor:** Senior Production Software Architect & Compliance Auditor  
**Project:** Aayuraura — BAMS Academic & Clinical Intelligence Platform  

---

## 1. Executive Summary

This document provides a comprehensive inventory and compliance evaluation of third-party dependencies, libraries, 3D anatomical models, textures, icons, fonts, and educational assets utilized across the **Aayuraura** platform.

> [!IMPORTANT]
> **Legal Notice:** This document constitutes a technical compliance and copyright audit. It identifies licensing risks, attribution mandates, and recommended actions. It does not replace formal legal counsel regarding commercial IP clearance.

---

## 2. Software Dependencies & Libraries

### Frontend Dependencies (`frontend/package.json`)

| Package Name | Version | Source / Author | License | Attribution Requirement | Commercial Use | Modification | Risk Assessment | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **next** | 16.3.3 | Vercel Inc. | **MIT** | Include MIT notice in bundle | Permitted | Permitted | **Low Risk** | Standard Next.js runtime; compliant. |
| **react** | 19.2.8 | Meta Platforms, Inc. | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Permitted for all deployments. |
| **react-dom** | 19.2.8 | Meta Platforms, Inc. | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Permitted for all deployments. |
| **three** | 0.185.1 | Ricardo Cabello (Mr.doob) | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | WebGL 3D rendering engine. |
| **lucide-react** | 1.37.0 | Lucide Contributors | **ISC** | Include ISC notice | Permitted | Permitted | **Low Risk** | Clean modern vector icon set. |
| **framer-motion** | 13.1.1 | Motion Software Ltd. | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Micro-animation library. |
| **recharts** | 3.10.1 | Recharts Group | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | React SVG charting for student KPIs. |
| **axios** | 1.20.0 | Matt Zabriskie | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | HTTP client. |
| **jspdf** | 4.2.1 | Parashuram & James Hall | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Client-side certificate generation. |
| **html2canvas** | 1.4.1 | Niklas von Hertzen | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Client-side DOM snapshot rendering. |
| **tailwindcss** | 4.0.0 | Tailwind Labs Inc. | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Utility CSS engine. |
| **clsx** | 2.1.1 | Luke Edwards | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Utility for class composition. |
| **tailwind-merge** | 3.6.0 | Dany Castillo | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Utility for Tailwind conflict resolution. |

### Backend Dependencies (`backend/requirements.txt`)

| Package Name | Version | Source / Author | License | Attribution Requirement | Commercial Use | Modification | Risk Assessment | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **fastapi** | >=0.110.0 | Sebastián Ramírez (tiangolo) | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Core REST API framework. |
| **uvicorn** | >=0.28.0 | Encode OSS | **BSD-3-Clause** | Retain copyright notice | Permitted | Permitted | **Low Risk** | High-performance ASGI server. |
| **sqlalchemy** | >=2.0.28 | Michael Bayer | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Async ORM & DB engine. |
| **pydantic** | >=2.6.0 | Samuel Colvin | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Data validation engine. |
| **pydantic-settings** | >=2.2.0 | Pydantic team | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Env var parsing. |
| **asyncpg** | >=0.29.0 | MagicStack Inc. | **Apache-2.0** | Include Apache notice | Permitted | Permitted | **Low Risk** | Async PostgreSQL driver. |
| **aiosqlite** | >=0.20.0 | John Reese | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | Async SQLite driver. |
| **pyjwt** | >=2.8.0 | José Padilla | **MIT** | Include MIT notice | Permitted | Permitted | **Low Risk** | JWT encoding & decoding. |
| **bcrypt** | >=4.1.2 | PyCA | **Apache-2.0** | Include Apache notice | Permitted | Permitted | **Low Risk** | Cryptographic password hashing. |
| **scikit-learn** | >=1.4.1 | Scikit-learn Developers | **BSD-3-Clause** | Retain copyright notice | Permitted | Permitted | **Low Risk** | Career recommendation matching. |
| **numpy** | >=1.26.4 | NumPy Developers | **BSD-3-Clause** | Retain copyright notice | Permitted | Permitted | **Low Risk** | Matrix mathematics. |
| **pandas** | >=2.2.1 | Pandas Development Team | **BSD-3-Clause** | Retain copyright notice | Permitted | Permitted | **Low Risk** | Tabular analytics. |
| **httpx** | >=0.27.0 | Encode OSS | **BSD-3-Clause** | Retain copyright notice | Permitted | Permitted | **Low Risk** | Async HTTP client. |

---

## 3. 3D Anatomical Assets & Compression Utilities

| Asset / Path | Type / Size | Source / Upstream | Verified License | Attribution Required | Status & Risk | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Draco Decoder** (`frontend/public/draco/`) | JS / WASM (~1MB) | Google Draco 3D project | **Apache-2.0** | Yes (`README.md` included) | **Verified Safe** | Attribution notice already preserved in directory. |
| **01_skeletal.glb** | 3D GLTF (1.68 MB) | Anatomical scan library | Presumed **CC BY-SA 2.1 JP / NIH 3D** | Yes | **Medium Risk (Unverified Origin)** | Retain for educational SIH use; obtain formal provenance verification before commercial distribution. |
| **02_cardiovascular.glb** | 3D GLTF (7.55 MB) | Open anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **03_nervous.glb** | 3D GLTF (6.59 MB) | Open anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **04_digestive.glb** | 3D GLTF (12.51 MB) | Open anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **05_respiratory.glb** | 3D GLTF (17.14 MB) | Open anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **06_integumentary.glb** | 3D GLTF (1.70 MB) | Anatomical base mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **07_lymphatic.glb** | 3D GLTF (97 KB) | Anatomical diagrammatic mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Low Risk** | Minimal geometric conduit layout. |
| **08_endocrine.glb** | 3D GLTF (183 KB) | Anatomical glandular mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Low Risk** | Minimal geometric layout. |
| **09_urinary.glb** | 3D GLTF (8.07 MB) | Anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **10_reproductive.glb** | 3D GLTF (68-149 KB) | Anatomical scan repository | Presumed **CC BY 4.0 / CC0** | Yes | **Low Risk** | Minimal organ mesh. |
| **11_muscular.glb** | 3D GLTF (1.52 MB) | Musculoskeletal anatomical mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |
| **stomach.glb** | 3D GLTF (22.69 MB) | High-definition organ mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | High file size; compress via Draco for production optimization. |
| **human_body.glb** | 3D GLTF (1.70 MB) | Human outer contour mesh | Presumed **CC BY 4.0 / CC0** | Yes | **Medium Risk (Unverified Origin)** | Verify original author on Sketchfab/NIH 3D exchange. |

---

## 4. Visual Media, Artwork & Fonts

| Asset / Path | Source / Creator | License Status | Commercial Use | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **logo-emblem.png**, **logo.png** | Original project artwork | Proprietary to Aayuraura / Ministry of Ayush SIH 2026 | Permitted | Retain as official branding. |
| **hero-diorama.png**, **hero-bg.jpg** | Curated platform visual | Proprietary / Creative Commons Unsplash / AI Artwork | Permitted with attribution | Retained in assets directory. |
| **anatomy previews** (`/images/anatomy/*.jpg`) | Rendered thumbnails of 3D models | Derived from 3D models | Permitted | Retain as cached previews. |
| **Inter, Playfair Display, Cinzel** | Google Fonts | **SIL Open Font License (OFL) 1.1** | Permitted | Loaded via `next/font/google` (zero external network tracking). |

---

## 5. Classical Ayurvedic Educational Content

| Content Element | Source Treatises | Historical Era | Copyright Status | Legal Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Sanskrit Shlokas** (Devanagari & IAST) | *Charaka Samhita*, *Sushruta Samhita*, *Ashtanga Hridaya*, *Madhava Nidana* | ~1000 BCE – 700 CE | **Public Domain** | Ancient treatises are universally in the public domain. Free to read, recite, and publish worldwide. |
| **English Meanings & Clinical Pearls** | Aayuraura Academic Team | Contemporary (2026) | **Original Work** | Authored specifically for pedagogical training of BAMS scholars under NCISM guidelines. |
| **NCISM Curriculum Structure** | NCISM Guidelines | Public Educational Standard | **Permitted for Education** | Official syllabus subject codes, hour weightages, and competencies used under educational fair use. |

---

## 6. Action Items Requiring Human Review Prior to Commercial Release

1. **3D Models Provenance Confirmation**: Before commercial monetization or non-educational packaging, the administrative team should confirm upstream attribution credits for the 12 organ system GLTF meshes or replace them with licensed Zygote/NIH 3D meshes.
2. **Third-Party Model License File**: An in-app attribution dialog or link pointing to this document should be provided in the 3D Sharira Rachana Lab info modal.
