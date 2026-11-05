/**
 * EN → MR grocery glossary (pure module — shared by the client name store
 * `src/lib/mr-names.ts` and the server route `src/app/api/translate`).
 *
 * Seeds the exact catalog (QA + production items) so the most common
 * names translate INSTANTLY with zero network; the /api/translate LLM
 * endpoint covers anything not listed here.
 */

/** Exact-match seeds: product names from the live catalogs. */
export const MR_GLOSSARY: Record<string, string> = {
  /* QA catalog (db/qa.db seeds) */
  "Banana — Robusta": "केळी — रोबस्टा",
  "Maggi 2-Minute Masala Noodles": "मॅगी 2-मिनिट मसाला नूडल्स",
  "Amul Taaza Toned Milk": "अमूल ताजा टोन्ड दूध",
  "Aashirvaad Atta — Whole Wheat": "आशीर्वाद अट्टा — गव्हाचा",
  "Fortune Sunflower Refined Oil": "फॉर्च्युन सूर्यफूल रिफाइंड तेल",
  "Fortune Sunflower Oil": "फॉर्च्युन सूर्यफूल तेल",
  "Lays — India's Magic Masala": "लेज़ — इंडियाज़ मॅजिक मसाला",
  "Mother Dairy Curd": "मदर डेअरी दही",
  "Tomato — Hybrid": "टोमॅटो — हायब्रीड",
  "Onion — Loose": "कांदा — सुटा",
  "Modern Bread — Sandwich": "मॉडर्न ब्रेड — सॅन्डविच",
  "Colgate Strong Teeth Toothpaste": "कोलगेट स्ट्रॉन्ग टीथ टूथपेस्ट",
  "Dabur Honey — 100% Pure": "डाबर मध — 100% शुद्ध",
  "Coca-Cola — PET Bottle": "कोका-कोला — PET बाटली",
  "Surf Excel Easy Wash Detergent": "सर्फ एक्सेल ईझी वॉश डिटर्जंट",
  "Tata Salt — Iodised": "टाटा मीठ — आयोडीनयुक्त",
  "Britannia Marie Gold Biscuits": "ब्रिटानिया मेरी गोल्ड बिस्किटे",
  /* production catalog (Supabase) extras seen in v0.10 QA sweeps */
  "Amul Butter": "अमूल बटर",
  "Fresh Tomato": "ताजे टोमॅटो",
  "Basmati Rice": "बासमती भात",
  "Toor Dal": "तूरडाळ",
};

/** Unit tokens → Marathi (used by the pattern translator below). */
const UNIT_MR: Record<string, string> = {
  dozen: "डझन",
  kg: "किलो",
  g: "ग्रॅम",
  gm: "ग्रॅम",
  gram: "ग्रॅम",
  grams: "ग्रॅम",
  l: "लि",
  ltr: "लि",
  litre: "लि",
  ml: "मिली",
  pcs: "नग",
  piece: "नग",
  pack: "पॅक",
};

const UNIT_RE =
  /^(\d+(?:\.\d+)?)\s*(dozen|kg|kgs|g|gm|gram|grams|l|ltr|litre|ml|mls|pcs|piece|pieces|pack)\s*(\+.*)?$/i;

/**
 * Instantly translate unit strings like "1 kg" / "500 ml" / "5 kg + 1 free"
 * without any network. Returns null when the string isn't a pure unit.
 */
export function translateUnit(s: string): string | null {
  const m = s.trim().match(UNIT_RE);
  if (!m) return null;
  const unit = UNIT_MR[m[2].toLowerCase()];
  if (!unit) return null;
  return `${m[1]} ${unit}${m[3] ? ` ${m[3]}` : ""}`;
}
