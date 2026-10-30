// ============================================================
// AAYURAURA OFFLINE STORAGE & CLIENT-SIDE CACHE ENGINE
// Manages local student notes, NCISM shlokas, and flashcards.
// ============================================================

export interface OfflineNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

export interface OfflineShloka {
  id: string;
  treatise: string;
  sthana: string;
  chapter: string;
  verse: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  clinicalCommentary: string;
  subject: string;
  isBookmarked?: boolean;
}

export interface OfflineFlashcard {
  id: string;
  category: string;
  term: string;
  sanskritName: string;
  front: string;
  back: string;
  mnemonicHint: string;
}

export interface OfflineTopicSummary {
  id: string;
  subject: string;
  title: string;
  professionalYear: string;
  summaryPoints: string[];
  clinicalSignificance: string;
}

// ------------------------------------------------------------
// CURATED HIGH-YIELD NCISM CLASSICAL SHLOKAS (100% OFFLINE)
// ------------------------------------------------------------
export const DEFAULT_OFFLINE_SHLOKAS: OfflineShloka[] = [
  {
    id: "shloka-swastha-sushruta",
    treatise: "Sushruta Samhita",
    sthana: "Sutrasthana",
    chapter: "Chapter 15 (Dosha-Dhatu-Mala Kshaya-Vriddhi)",
    verse: "Verse 41",
    sanskrit: "समदोषः समाग्निश्च समधातुमलक्रियः ।\nप्रसन्नात्मेन्द्रियमनाः स्वस्थ इत्यभिधीयते ॥",
    transliteration: "samadoṣaḥ samāgniśca samadhātumalakriyaḥ |\nprasannātmendriyamanaḥ svastha ityabhidhīyate ||",
    translation: "One who has balanced Doshas (Vata, Pitta, Kapha), balanced Agni (digestive fire), balanced Dhatus (tissues), and normal excretory functions (Mala), along with tranquility of Soul (Atma), Senses (Indriya), and Mind (Manas), is termed healthy (Swastha).",
    clinicalCommentary: "Foundational definition of holistic psychosomatic health in Ayurveda. Demonstrates that Swastha goes beyond physical biomarkers to include sensory and spiritual well-being.",
    subject: "Swasthavritta"
  },
  {
    id: "shloka-samanya-charaka",
    treatise: "Charaka Samhita",
    sthana: "Sutrasthana",
    chapter: "Chapter 1 (Dirghanjivitiya Adhyaya)",
    verse: "Verse 44",
    sanskrit: "सर्वदा सर्वभावानां सामान्यं वृद्धिकारणम् ।\nह्रासहेतुर्विशेषश्च प्रवृत्तिरुभयस्य तु ॥",
    transliteration: "sarvadā sarvabhāvānāṃ sāmānyaṃ vṛddhikāraṇam |\nhrāsaheturviśeṣaśca pravṛttirubhayasya tu ||",
    translation: "Similarity (Samanya) is always the cause of increase in all entities, whereas dissimilarity (Vishesha) is the cause of decrease. Both principles guide therapeutic administration.",
    clinicalCommentary: "The bedrock principle of Ayurvedic therapeutics (Dravya-Guna-Karma Chikitsa). For Dhatukshaya (tissue depletion), homologous substances are administered; for Vriddhi (excess), antagonistic herbs are selected.",
    subject: "Maulik Siddhanta"
  },
  {
    id: "shloka-trishana-charaka",
    treatise: "Charaka Samhita",
    sthana: "Sutrasthana",
    chapter: "Chapter 11 (Treshaniya Adhyaya)",
    verse: "Verse 3",
    sanskrit: "इह खलु पुरुषेणानुपरतसत्त्वबुद्धिपौरुषपराक्रमेण हितेप्सुना\nतिस्र एषणाः पर्येष्टव्या भवन्ति, तद्यथा— प्राणैषणा, धनैषणा, परलोकैषणा इति ॥",
    transliteration: "iha khalu puruṣeṇānuparatasattvabuddhipauruṣaparākrameṇa hitepsunā\ntisra eṣaṇāḥ paryeṣṭavyā bhavanti, tadyathā— prāṇaiṣaṇā, dhanaiṣaṇā, paralokaiṣaṇā iti ||",
    translation: "Every conscious human aspiring for welfare must pursue three fundamental desires: the desire for life (Pranaishana), the desire for wealth and sustenance (Dhanaishana), and the desire for spiritual emancipation and afterlife (Paralokaishana).",
    clinicalCommentary: "Pranaishana takes absolute precedence because without preservation of life and bodily health, no worldly livelihood or spiritual elevation can be realized.",
    subject: "Ayurveda Siddhanta"
  },
  {
    id: "shloka-chikitsa-chatushpada",
    treatise: "Charaka Samhita",
    sthana: "Sutrasthana",
    chapter: "Chapter 9 (Khuddaka Chatushpada)",
    verse: "Verse 3",
    sanskrit: "भिषग्द्रव्याण्युपस्थाता रोगी पादचतुष्टयम् ।\nगुणवत्सर्वमेवैतत्प्रसाधयति कर्म तु ॥",
    transliteration: "bhiṣag dravyāṇyupasthātā rogī pādacatuṣṭayam |\nguṇavat sarvamevaitat prasādhayati karma tu ||",
    translation: "The Physician (Bhishag), the Medicament (Dravya), the Nursing Attendant (Upasthata), and the Patient (Rogi) form the four pillars of treatment. When endowed with optimal qualities, they lead to complete cure.",
    clinicalCommentary: "Known as Chikitsa Chatushpada. The Vaidya is chief among the four, orchestrating therapeutic drug administration, caregiver protocols, and patient compliance.",
    subject: "Kayachikitsa"
  },
  {
    id: "shloka-panchakarma-snehana",
    treatise: "Ashtanga Hridaya",
    sthana: "Sutrasthana",
    chapter: "Chapter 16 (Snehadhyaya)",
    verse: "Verse 1",
    sanskrit: "स्नेहोऽनिलं हन्ति मृदूकरोति देहं मलानां विनिहन्ति सङ्गम् ।",
    transliteration: "sneho'nilaṃ hanti mṛdūkaroti dehaṃ malānāṃ vinihanti saṅgam |",
    translation: "Snehana (oleation) pacifies Vata Dosha, softens and lubricates the cellular matrix of the body, and dislodges obstructed morbid Malas (toxins).",
    clinicalCommentary: "Fundamental biological rationale for Purvakarma before administering Vamana or Virechana. Without preliminary Snehana and Swedana, attempting bio-cleansing may fracture brittle tissues.",
    subject: "Panchakarma"
  }
];

// ------------------------------------------------------------
// CURATED ACTIVE RECALL FLASHCARDS (100% OFFLINE)
// ------------------------------------------------------------
export const DEFAULT_OFFLINE_FLASHCARDS: OfflineFlashcard[] = [
  {
    id: "fc-ashwagandha",
    category: "Dravyaguna (Pharmacology)",
    term: "Ashwagandha",
    sanskritName: "Withania somnifera (Solanaceae)",
    front: "Rasa, Virya, Vipaka, and Karma of Ashwagandha?",
    back: "• Rasa: Tikta, Kashaya, Madhura\n• Guna: Laghu, Snigdha\n• Virya: Ushna (Hot potency)\n• Vipaka: Madhura\n• Karma: Balya, Rasayana, Vata-Kaphashamaka, Nidrajanana",
    mnemonicHint: "Think 'Horse smell' (Ashwa-Gandha) conferring vigor and calming Vata disorders."
  },
  {
    id: "fc-vamana-vega",
    category: "Panchakarma Procedures",
    term: "Vamana Shuddhi Lakshana",
    sanskritName: "Antiki Lakshana (Termination signs)",
    front: "What is the order of evacuation in Samyak Vamana?",
    back: "Order of emesis:\n1. Kapha (Mucus/saliva first)\n2. Pitta (Bile ending - Pittanta)\n3. Clear stomach contents\nPresence of bile (Pittanta) signifies complete gastric clearance.",
    mnemonicHint: "Rule: 'Ka-Pi' — Kapha first, Pitta at the end."
  },
  {
    id: "fc-ashtavidha-pariksha",
    category: "Roga Nidana (Diagnostics)",
    term: "Ashtavidha Pariksha (Eight-Fold Examination)",
    sanskritName: "Yogaratnakara Clinical Diagnostics",
    front: "Enumerate the 8 clinical checkpoints of Ashtavidha Pariksha.",
    back: "1. Nadi (Pulse)\n2. Mutra (Urine)\n3. Mala (Feces)\n4. Jihwa (Tongue)\n5. Shabda (Voice/Speech)\n6. Sparsha (Touch/Skin)\n7. Druk (Eyes/Vision)\n8. Akriti (General Facies & Demeanor)",
    mnemonicHint: "Na-Mu-Ma-Ji-Sha-Spa-Dru-Ak"
  },
  {
    id: "fc-bhasma-pariksha",
    category: "Rasashastra (Alchemy & Pharmaceutics)",
    term: "Bhasma Pariksha (Standardization Tests)",
    sanskritName: "Classical Quality Control Tests",
    front: "What are the 4 classical physical tests for properly incinerated Bhasma?",
    back: "1. Varitara: Floats on still water\n2. Rekhapurnata: Penetrates skin furrow lines\n3. Apunarbhava: Cannot be reduced back to metal with Mitra Panchaka\n4. Niruttha: Does not gain weight when heated with silver",
    mnemonicHint: "Va-Re-A-Ni test battery for nanometal safety."
  }
];

// ------------------------------------------------------------
// LOCAL STORAGE KEYS
// ------------------------------------------------------------
const STORAGE_KEYS = {
  NOTES: "aayuraura_offline_notes",
  BOOKMARKED_SHLOKAS: "aayuraura_offline_bookmarked_shlokas",
  CUSTOM_SHLOKAS: "aayuraura_offline_custom_shlokas",
  FLASHCARDS: "aayuraura_offline_flashcards",
  DRAFT_NOTE: "aayuraura_draft_note_autosave",
};

export const offlineStorage = {
  // 1. NOTES MANAGEMENT
  getNotes(): OfflineNote[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) {
        // Seed default starter note
        const defaultNotes: OfflineNote[] = [
          {
            id: "note-offline-sample-1",
            title: "Panchakarma Clinical Postings Summary",
            subject: "Panchakarma",
            content: "Observed Matra Basti administration with Sahacharadi Taila (60ml). Patient rested in left lateral position for 15 minutes. Key retention time achieved: 4 hours.",
            tags: ["Panchakarma", "Clinical Logbook", "Basti"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: true
          }
        ];
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(defaultNotes));
        return defaultNotes;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNote(note: Omit<OfflineNote, "id" | "createdAt" | "updatedAt" | "isSynced"> & { id?: string }): OfflineNote {
    const existing = this.getNotes();
    const now = new Date().toISOString();

    if (note.id) {
      // Update existing
      const updated = existing.map((n) =>
        n.id === note.id
          ? {
              ...n,
              title: note.title,
              subject: note.subject,
              content: note.content,
              tags: note.tags,
              updatedAt: now,
              isSynced: false,
            }
          : n
      );
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
      return updated.find((n) => n.id === note.id)!;
    }

    // Create new
    const newNote: OfflineNote = {
      id: "note-off-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: note.title,
      subject: note.subject,
      content: note.content,
      tags: note.tags,
      createdAt: now,
      updatedAt: now,
      isSynced: false
    };
    const updatedList = [newNote, ...existing];
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedList));
    return newNote;
  },

  deleteNote(id: string): void {
    const existing = this.getNotes();
    const filtered = existing.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  },

  // 2. SHLOKAS MANAGEMENT
  getShlokas(): OfflineShloka[] {
    if (typeof window === "undefined") return DEFAULT_OFFLINE_SHLOKAS;
    try {
      const bookmarked = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKED_SHLOKAS) || "[]");
      const customShlokas: OfflineShloka[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SHLOKAS) || "[]");

      const combined = [...DEFAULT_OFFLINE_SHLOKAS, ...customShlokas];
      return combined.map((s) => ({
        ...s,
        isBookmarked: bookmarked.includes(s.id)
      }));
    } catch {
      return DEFAULT_OFFLINE_SHLOKAS;
    }
  },

  toggleBookmarkShloka(id: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const bookmarked: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKED_SHLOKAS) || "[]");
      let next: string[];
      let isBookmarked: boolean;

      if (bookmarked.includes(id)) {
        next = bookmarked.filter((x) => x !== id);
        isBookmarked = false;
      } else {
        next = [...bookmarked, id];
        isBookmarked = true;
      }
      localStorage.setItem(STORAGE_KEYS.BOOKMARKED_SHLOKAS, JSON.stringify(next));
      return isBookmarked;
    } catch {
      return false;
    }
  },

  // 3. FLASHCARDS MANAGEMENT
  getFlashcards(): OfflineFlashcard[] {
    if (typeof window === "undefined") return DEFAULT_OFFLINE_FLASHCARDS;
    try {
      const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLASHCARDS) || "[]");
      return [...DEFAULT_OFFLINE_FLASHCARDS, ...custom];
    } catch {
      return DEFAULT_OFFLINE_FLASHCARDS;
    }
  },

  // 4. AUTOSAVE DRAFT FOR NOTE TAKING
  saveDraft(draft: { title: string; subject: string; content: string }): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DRAFT_NOTE, JSON.stringify(draft));
  },

  getDraft(): { title: string; subject: string; content: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT_NOTE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearDraft(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.DRAFT_NOTE);
  },

  // 5. STORAGE DIAGNOSTICS & CLEAR CACHE
  getStorageSummary(): { notesCount: number; shlokasCount: number; flashcardsCount: number; estimatedSizeKb: number } {
    if (typeof window === "undefined") {
      return { notesCount: 0, shlokasCount: 5, flashcardsCount: 4, estimatedSizeKb: 12 };
    }
    const notes = this.getNotes();
    const shlokas = this.getShlokas();
    const flashcards = this.getFlashcards();

    // Estimate storage bytes
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("aayuraura_")) {
        const value = localStorage.getItem(key) || "";
        totalBytes += (key.length + value.length) * 2; // UTF-16 approximation
      }
    }

    return {
      notesCount: notes.length,
      shlokasCount: shlokas.length,
      flashcardsCount: flashcards.length,
      estimatedSizeKb: Math.max(12, Math.round(totalBytes / 1024))
    };
  },

  clearOfflineCache(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKED_SHLOKAS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SHLOKAS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_NOTE);
  }
};
