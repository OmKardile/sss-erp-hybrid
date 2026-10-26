/**
 * Festive theme engine — Indian festival calendar + storefront themes.
 *
 * Design intent (Blinkit/Zepto-style festive merchandising, adapted to this
 * store's rules): during a festival window the storefront gets a festive
 * strip under the header, a themed hero, themed section titles, a festive
 * coupon and a Deal-of-the-Day badge label. NO animations, NO emojis —
 * only real photos and Lucide icons.
 *
 * This module is PURE: no React, no server-only imports. It is imported by
 * the storefront (client components) AND by the auto-improver service
 * (mini-services/improver) so both agree on the active theme.
 *
 * All windows are IST (Asia/Kolkata). Movable festivals (Diwali, Holi, Eid,
 * Ganesh Chaturthi, Navratri …) use marketing-grade approximations — they are
 * reviewed by the improver's LLM check and maintained in decisions.md.
 */

export interface FestiveCoupon {
  /** Uppercase code the customer types at checkout. */
  code: string;
  /** One-line customer-facing description. */
  text: string;
  /** Minimum subtotal (₹) required to use the coupon. */
  minSubtotal: number;
  /** Percent discount applied to the subtotal (0 for flat coupons). */
  percentOff?: number;
  /** Flat rupee discount (mutually exclusive with percentOff). */
  flatOff?: number;
  /** Discount cap (₹) so a percent coupon can't runaway on large carts. */
  maxDiscount?: number;
}

export interface FestiveTheme {
  /** Stable id, e.g. "diwali". */
  id: string;
  /** Festival display name, e.g. "Diwali". */
  festival: string;
  /** Thin strip under the header (all pages). Short, offers-focused. */
  greeting: string;
  /** Tailwind classes for the strip background/text (accessible pairs). */
  stripClass: string;
  /** Lucide icon name for the strip (rendered by the component). */
  stripIcon: "flame" | "sparkles" | "star" | "heart" | "moon" | "flag" | "gift";
  /** Hero kicker — small line above the headline. */
  kicker: string;
  /** Hero headline (may contain a \n for a two-line composition). */
  headline: string;
  /** Hero sub-line. */
  subline: string;
  /** Festive hero photo (under /public/products/festive/). null = default hero. */
  heroImage: string | null;
  /** Featured rail title during the window. */
  sectionTitle: string;
  /** Featured rail subtitle. */
  sectionSub: string;
  /** Deal-of-the-day badge label. */
  badgeLabel: string;
  /** Coupon offered during the window (validated server-side at checkout). */
  coupon: FestiveCoupon | null;
  /** Human label for when offers end, e.g. "Offers end 14 Nov". */
  endsLabel: string;
}

/** One festival window. start/end are inclusive ISO dates (IST). */
interface FestiveWindow {
  theme: FestiveTheme;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

/* ------------------------------------------------------------------ */
/* Festival calendar — explicit dated windows through early 2028.      */
/* Year-end windows are split so every window fits inside one year.    */
/* ------------------------------------------------------------------ */

const DIWALI_2026: FestiveTheme = {
  id: "diwali",
  festival: "Diwali",
  greeting: "Diwali Dhamaka — festive offers on every shelf",
  stripClass: "bg-orange-900 text-amber-100",
  stripIcon: "flame",
  kicker: "Diwali 2026 · 8 November",
  headline: "Light up your\nDiwali stock-up.",
  subline:
    "Festive essentials, sweets and daily needs — delivered across Pune before Lakshmi Puja.",
  heroImage: "/products/festive/diwali-hero.jpg",
  sectionTitle: "Diwali festive picks",
  sectionSub: "Stock-up favourites for the festival week",
  badgeLabel: "Diwali deal",
  coupon: {
    code: "DIWALI10",
    text: "10% off orders above ₹299 (up to ₹150)",
    minSubtotal: 299,
    percentOff: 10,
    maxDiscount: 150,
  },
  endsLabel: "Festive offers end 14 Nov",
};

const CHRISTMAS: FestiveTheme = {
  id: "christmas",
  festival: "Christmas",
  greeting: "Christmas week — cakes, cookies & festive stocking-up",
  stripClass: "bg-red-950 text-red-50",
  stripIcon: "gift",
  kicker: "Christmas · 25 December",
  headline: "Everything for the\nChristmas table.",
  subline:
    "Baking essentials, cookies, beverages and treats — delivered across Pune.",
  heroImage: "/products/festive/christmas-hero.jpg",
  sectionTitle: "Christmas picks",
  sectionSub: "Baking, treats and festive stock-up",
  badgeLabel: "Christmas deal",
  coupon: {
    code: "XMAS50",
    text: "₹50 off orders above ₹399",
    minSubtotal: 399,
    flatOff: 50,
  },
  endsLabel: "Offers end 27 Dec",
};

const NEW_YEAR: FestiveTheme = {
  id: "new-year",
  festival: "New Year",
  greeting: "New Year, fresh stock — party & pantry essentials",
  stripClass: "bg-stone-900 text-amber-200",
  stripIcon: "sparkles",
  kicker: "New Year 2027",
  headline: "New year,\nfresh shelves.",
  subline:
    "Start 2027 stocked up — party snacks, beverages and daily essentials.",
  heroImage: null,
  sectionTitle: "New Year picks",
  sectionSub: "Party & pantry essentials for 2027",
  badgeLabel: "New Year deal",
  coupon: {
    code: "HELLO2027",
    text: "7% off orders above ₹299 (up to ₹100)",
    minSubtotal: 299,
    percentOff: 7,
    maxDiscount: 100,
  },
  endsLabel: "Offers end 5 Jan",
};

const SANKRANTI: FestiveTheme = {
  id: "sankranti",
  festival: "Makar Sankranti",
  greeting: "Sankranti special — til, gul, jaggery & festive sweets",
  stripClass: "bg-amber-800 text-amber-50",
  stripIcon: "star",
  kicker: "Makar Sankranti · 14 January",
  headline: "Til-gul ani\nmeeth gul.",
  subline:
    "Sesame, jaggery and festive ingredients — Pune's Sankranti stock-up, delivered.",
  heroImage: null,
  sectionTitle: "Sankranti picks",
  sectionSub: "Til, gul and festive ingredients",
  badgeLabel: "Sankranti deal",
  coupon: {
    code: "TILGUL20",
    text: "₹20 off orders above ₹199",
    minSubtotal: 199,
    flatOff: 20,
  },
  endsLabel: "Offers end 16 Jan",
};

const REPUBLIC_DAY: FestiveTheme = {
  id: "republic-day",
  festival: "Republic Day",
  greeting: "Republic Day offers — stock up the tricolour way",
  stripClass: "bg-orange-900 text-orange-100",
  stripIcon: "flag",
  kicker: "Republic Day · 26 January",
  headline: "Republic Day\nstock-up sale.",
  subline: "Kitchen staples at honest prices — delivered across Pune.",
  heroImage: null,
  sectionTitle: "Republic Day picks",
  sectionSub: "Everyday staples, festive prices",
  badgeLabel: "Republic deal",
  coupon: {
    code: "RDAY26",
    text: "₹75 off orders above ₹499",
    minSubtotal: 499,
    flatOff: 75,
  },
  endsLabel: "Offers end 28 Jan",
};

const VALENTINES: FestiveTheme = {
  id: "valentines",
  festival: "Valentine's Week",
  greeting: "Valentine's Week — chocolates, snacks & date-night essentials",
  stripClass: "bg-rose-950 text-rose-100",
  stripIcon: "heart",
  kicker: "Valentine's Day · 14 February",
  headline: "Plan the evening,\nwe'll bring the snacks.",
  subline: "Chocolates, beverages and date-night treats — delivered in hours.",
  heroImage: null,
  sectionTitle: "Valentine's picks",
  sectionSub: "Chocolates, drinks & date-night treats",
  badgeLabel: "Valentine deal",
  coupon: {
    code: "VDAY40",
    text: "₹40 off orders above ₹299",
    minSubtotal: 299,
    flatOff: 40,
  },
  endsLabel: "Offers end 15 Feb",
};

const HOLI: FestiveTheme = {
  id: "holi",
  festival: "Holi",
  greeting: "Holi hai — colours, gujiya ingredients & party stock",
  stripClass: "bg-pink-950 text-pink-100",
  stripIcon: "sparkles",
  kicker: "Holi · 22 March 2027",
  headline: "Rang barse,\nthanda ready.",
  subline: "Colours, gujiya essentials, drinks and snacks for the Holi party.",
  heroImage: null,
  sectionTitle: "Holi picks",
  sectionSub: "Party stock & gujiya essentials",
  badgeLabel: "Holi deal",
  coupon: {
    code: "HOLI30",
    text: "₹30 off orders above ₹249",
    minSubtotal: 249,
    flatOff: 30,
  },
  endsLabel: "Offers end 24 Mar",
};

const GUDI_PADWA: FestiveTheme = {
  id: "gudi-padwa",
  festival: "Gudi Padwa",
  greeting: "Gudi Padwa — Maharashtrian New Year stock-up",
  stripClass: "bg-amber-800 text-amber-50",
  stripIcon: "star",
  kicker: "Gudi Padwa · April 2027",
  headline: "Navyasache\nGudi Padwa.",
  subline:
    "Puran poli essentials, festive groceries and new-year stock-up for Pune homes.",
  heroImage: null,
  sectionTitle: "Gudi Padwa picks",
  sectionSub: "Puran poli essentials & festive groceries",
  badgeLabel: "Padwa deal",
  coupon: {
    code: "GUDI25",
    text: "₹25 off orders above ₹249",
    minSubtotal: 249,
    flatOff: 25,
  },
  endsLabel: "Offers end 10 Apr",
};

const INDEPENDENCE_DAY: FestiveTheme = {
  id: "independence-day",
  festival: "Independence Day",
  greeting: "Independence Day offers — freedom from full prices",
  stripClass: "bg-orange-900 text-orange-100",
  stripIcon: "flag",
  kicker: "Independence Day · 15 August",
  headline: "Freedom week\nstock-up sale.",
  subline: "Everyday essentials at honest prices — delivered across Pune.",
  heroImage: null,
  sectionTitle: "Independence Day picks",
  sectionSub: "Everyday essentials, honest prices",
  badgeLabel: "Freedom deal",
  coupon: {
    code: "AUG15",
    text: "₹50 off orders above ₹399",
    minSubtotal: 399,
    flatOff: 50,
  },
  endsLabel: "Offers end 17 Aug",
};

const GANESH_CHATURTHI: FestiveTheme = {
  id: "ganesh-chaturthi",
  festival: "Ganesh Chaturthi",
  greeting: "Ganpati Bappa Morya — utsav stock-up & modak essentials",
  stripClass: "bg-red-950 text-orange-100",
  stripIcon: "flame",
  kicker: "Ganesh Chaturthi · September 2027",
  headline: "Ganpati utsav,\nPune-style.",
  subline:
    "Modak ingredients, prasad essentials and festive stock for ten days of Bappa.",
  heroImage: null,
  sectionTitle: "Ganpati utsav picks",
  sectionSub: "Modak & prasad essentials",
  badgeLabel: "Utsav deal",
  coupon: {
    code: "BAPPA10",
    text: "10% off orders above ₹299 (up to ₹150)",
    minSubtotal: 299,
    percentOff: 10,
    maxDiscount: 150,
  },
  endsLabel: "Offers end 13 Sep",
};

const NAVRATRI: FestiveTheme = {
  id: "navratri",
  festival: "Navratri",
  greeting: "Navratri special — fasting essentials & garba night stock",
  stripClass: "bg-red-900 text-amber-100",
  stripIcon: "flame",
  kicker: "Navratri · October 2027",
  headline: "Nine nights,\none full pantry.",
  subline: "Fasting essentials, sabudana, snacks and drinks for garba nights.",
  heroImage: null,
  sectionTitle: "Navratri picks",
  sectionSub: "Fasting essentials & garba-night stock",
  badgeLabel: "Navratri deal",
  coupon: {
    code: "NAVRATRI10",
    text: "10% off orders above ₹299 (up to ₹120)",
    minSubtotal: 299,
    percentOff: 10,
    maxDiscount: 120,
  },
  endsLabel: "Offers end 10 Oct",
};

const DIWALI_2027: FestiveTheme = {
  ...DIWALI_2026,
  kicker: "Diwali 2027 · late October",
  endsLabel: "Festive offers end 8 Nov",
};

/**
 * The calendar. Ordered chronologically; getActiveTheme picks the window
 * containing today (latest start wins on overlap).
 */
const CALENDAR: FestiveWindow[] = [
  { theme: DIWALI_2026, start: "2026-10-20", end: "2026-11-14" },
  { theme: CHRISTMAS, start: "2026-12-18", end: "2026-12-27" },
  { theme: NEW_YEAR, start: "2026-12-28", end: "2026-12-31" },
  { theme: NEW_YEAR, start: "2027-01-01", end: "2027-01-05" },
  { theme: SANKRANTI, start: "2027-01-12", end: "2027-01-16" },
  { theme: REPUBLIC_DAY, start: "2027-01-24", end: "2027-01-28" },
  { theme: VALENTINES, start: "2027-02-07", end: "2027-02-15" },
  { theme: HOLI, start: "2027-03-19", end: "2027-03-24" },
  { theme: GUDI_PADWA, start: "2027-04-06", end: "2027-04-10" },
  { theme: INDEPENDENCE_DAY, start: "2027-08-13", end: "2027-08-16" },
  { theme: GANESH_CHATURTHI, start: "2027-09-04", end: "2027-09-13" },
  { theme: NAVRATRI, start: "2027-09-30", end: "2027-10-10" },
  { theme: DIWALI_2027, start: "2027-10-24", end: "2027-11-08" },
  { theme: CHRISTMAS, start: "2027-12-18", end: "2027-12-27" },
  { theme: NEW_YEAR, start: "2027-12-28", end: "2027-12-31" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Current IST wall-clock date as "YYYY-MM-DD" (independent of host TZ). */
export function istDateStr(now: Date = new Date()): string {
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const d = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The active theme for an IST date, or null outside every window. */
export function getActiveTheme(now: Date = new Date()): FestiveTheme | null {
  const today = istDateStr(now);
  let active: FestiveWindow | null = null;
  for (const w of CALENDAR) {
    if (today >= w.start && today <= w.end) {
      if (!active || w.start >= active.start) active = w;
    }
  }
  return active?.theme ?? null;
}

/**
 * The next window starting within `withinDays` (IST). Used by the
 * auto-improver to prepare festive photos before a window opens.
 */
export function getUpcomingTheme(
  withinDays = 21,
  now: Date = new Date(),
): { theme: FestiveTheme; start: string } | null {
  const today = istDateStr(now);
  const limit = new Date(now.getTime() + withinDays * 86400000);
  const limitStr = istDateStr(limit);
  let next: FestiveWindow | null = null;
  for (const w of CALENDAR) {
    if (w.start > today && w.start <= limitStr) {
      if (!next || w.start < next.start) next = w;
    }
  }
  return next ? { theme: next.theme, start: next.start } : null;
}

/** Days of festive coverage remaining in the calendar from an IST date. */
export function calendarCoverageDays(now: Date = new Date()): number {
  const today = istDateStr(now);
  let lastEnd = today;
  for (const w of CALENDAR) {
    if (w.end > lastEnd) lastEnd = w.end;
  }
  const [y, m, d] = lastEnd.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1, d));
  const [ty, tm, td] = today.split("-").map(Number);
  const cur = new Date(Date.UTC(ty, tm - 1, td));
  return Math.round((last.getTime() - cur.getTime()) / 86400000);
}
