import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { MR_GLOSSARY } from "@/lib/mr-glossary";
import { CATEGORY_MR } from "@/lib/i18n";

/**
 * POST /api/translate — batch-translate DB-driven strings (product names,
 * brands, categories, units) from English to Marathi via the LLM skill
 * (z-ai-web-dev-sdk, backend-only per the skill contract).
 *
 * Caching: glossary first (in code, zero cost), then a server-side
 * in-memory Map — every visitor after the first gets instant results
 * for the same catalog strings. The client additionally caches learned
 * translations in localStorage.
 *
 * Body:    { items: string[] }   (≤120 strings, each ≤160 chars)
 * Returns: { translations: Record<string, string> } — only the strings
 *          that resolved; the client keeps English for the rest.
 */

export const dynamic = "force-dynamic";

const MAX_ITEMS = 120;
const MAX_LEN = 160;

/** Server-side cache of LLM translations (per server instance). */
const cache = new Map<string, string>();

const SYSTEM_PROMPT = [
  "You translate UI strings for an Indian online grocery store in Pune, Maharashtra from English to Marathi (मराठी).",
  "The user message is a JSON array of strings: grocery product names, brand names, category names, or unit strings.",
  "Rules:",
  "1) Use natural Marathi grocery vocabulary — कांदा, टोमॅटो, भाजी, फळे, अट्टा, तांदूळ, तूरडाळ, तेल, दूध, दही, मीठ, साबण, पावडर.",
  "2) Well-known Indian brands use their common Marathi transliteration (अमूल, मॅगी, टाटा, ब्रिटानिया, फॉर्च्युन, डाबर, कोलगेट, आशीर्वाद, मदर डेअरी); unknown foreign brands stay in Latin script.",
  "3) Keep numerals and units short and natural: 5 किलो, 500 मिली, 1 लि, 70 ग्रॅम, 1 डझन.",
  "4) Keep each translation SHORT — it must fit a small product card.",
  "5) Respond with ONLY a valid JSON object mapping every input string exactly to its Marathi translation. No commentary, no markdown fences.",
].join("\n");

function extractJson(raw: string): Record<string, unknown> | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(s.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawItems = (body as { items?: unknown })?.items;
  if (!Array.isArray(rawItems)) {
    return NextResponse.json(
      { error: "items must be an array of strings" },
      { status: 400 },
    );
  }

  const clean: string[] = [];
  const seen = new Set<string>();
  for (const item of rawItems) {
    if (typeof item !== "string") continue;
    const s = item.trim();
    if (!s || s.length > MAX_LEN || seen.has(s)) continue;
    seen.add(s);
    clean.push(s);
    if (clean.length >= MAX_ITEMS) break;
  }

  if (clean.length === 0) {
    return NextResponse.json({ translations: {} });
  }

  const translations: Record<string, string> = {};
  const need: string[] = [];

  for (const s of clean) {
    const gloss = MR_GLOSSARY[s] ?? CATEGORY_MR[s];
    if (gloss) {
      translations[s] = gloss;
      continue;
    }
    const cached = cache.get(s);
    if (cached) {
      translations[s] = cached;
      continue;
    }
    need.push(s);
  }

  if (need.length > 0) {
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(need) },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = extractJson(raw);
      if (parsed) {
        for (const s of need) {
          const v = parsed[s];
          if (typeof v === "string" && v.trim()) {
            const mr = v.trim();
            cache.set(s, mr);
            translations[s] = mr;
          }
        }
      }
    } catch (err) {
      // LLM unavailable → return what we have (glossary + cache);
      // the client silently keeps English for the rest.
      console.error("[api/translate] LLM call failed:", err);
      return NextResponse.json(
        { translations, degraded: true },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ translations });
}
