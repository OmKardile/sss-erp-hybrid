# DESIGN — Shubham Super Shopee, v0.11.0 "Fresh Cart"

Built with the /awwwards skill (juliobsz/skills). Phases 0–2 artifacts; later passes
must stay consistent with this file.

## Brief (Phase 0)

- **Subject**: Shubham Super Shopee, a real local grocery store in Pune, selling daily
  essentials online. COD & UPI, about 2-hour delivery, open 7 AM to 10 PM.
- **Audience**: Pune households ordering groceries, mostly on mid-range Android phones.
- **Job**: sell groceries (basket → bill → order), feel vivid and alive.
- **Owner's directive** (explicit, twice): "light up the damn colors", "extraordinary
  UI", and after the kraft-paper direction: "no no no, go for something else" —
  muted/beige reads as depressing here. This design is the direct answer: saturated
  color everywhere, playful energy, zero beige.
- **Constraints**: existing Next.js 16 App Router + Tailwind 4 project; commerce flows
  (cart, checkout, order, product, reviews) keep working; festive engine keeps working
  (Diwali window live at launch). Stack: the project's own; ported GSAP/Lenis engine
  from the skill. No WebGL (audience is mid-range phones).

## Concept Card (Phase 1)

```
Idea:        a delivery cart racing through a sunlit mandi — every section is a
             stall of a different color, prices are stickers slapped on fruit,
             and everything bounces
Metaphor:    a candy-bright pop market
Signature:   the color-field journey — the page wipes through electric lime,
             coral and deep emerald fields (curtain + sections share the trio)
Emotion:     first 3 seconds: juicy, alive, fun — fruit-market energy, not a bank
Motion verb: pop and bounce (springy overshoot; stickers tilt; fields wipe)
Screenshot:  mega "FRESH." in Unbounded over an electric lime field, mango
             price stickers tilted, a coral deal band
```

Anchor: a Pune grocery's own colors (market lime, tomato coral, mango amber —
the same family as the brand's emerald + amber). The user's own words: lit up.

## Art direction system (Phase 2)

### Palette (saturated, by role)

| Role | Name | Hex | Use |
|---|---|---|---|
| ground | cream | `#f7f9ef` | base ground (fresh, green-tinted white) |
| ink | ink | `#0e1b12` | type, pills, footer field |
| field 1 | pop | `#c8f135` | electric lime — hero accents, marquee, fields |
| field 2 | heat | `#ff5233` | tomato coral — deal field, CTA fills, alerts |
| field 3 | mango | `#ffc531` | mango — price stickers, badges |
| field 4 | pine | `#07332a` | deep emerald — promise field, footer, curtain |
| muted | sage | `#55654f` | secondary text (AA on cream/white) |
| card | white | `#ffffff` | cards pop on the color fields |

Color is NOT decoration-on-neutral: full sections commit to a field color
(lime marquee, coral deal, pine promise, ink footer). Color changes between
sections are motivated (stall changes in the market).

### Type

- **Display — Unbounded** (Google, 500/700/900): wide, rounded, instantly
  distinctive; mega words are short (FRESH. PUNE. CART.). Tracking -0.01em,
  leading 0.95, uppercase.
- **Text/UI — Schibsted Grotesk** (kept): 400/500/700. Body 16–18px.
- **Data — Space Mono** (kept): prices, weights, hours, countdowns, bills.
- Logo wordmark stays Poppins (inline SVG, unchanged).

### Shape & motion language

- Radius rule: everything rounds — cards 1.5rem, buttons/chips are full pills,
  photos 1.25rem. The only straight things are hairlines. No hard shadows:
  colored soft glows (lime/coral/ink at low alpha).
- Stickers: mango chips with a 2.5px white border, slight rotation (-3°…2°),
  Space Mono numerals; they bob at rest (CSS `bob`, 4s, ±8px) and pop on hover.
- Eases: entrances `expo.out`, fields/curtain `expo.inOut`, UI springs
  `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot). Stagger 40–80ms.
- Curtain: 3 stacked color panels (pop → heat → pine) stagger-wipe between pages.

### Micro-interactions (one per role)

| Role | Treatment |
|---|---|
| Primary CTAs | ink pill; hover fills coral + springs up 2px + glow |
| Product cards | lift −4px + tiny tilt + colored glow grows; photo zooms in clip |
| Nav links | lime pill fill (text flips to ink) |
| Price | sticker: un-tilts + scales 1.06 |
| Utility links | color change only |

### Composition plan (families, one each)

```
HERO (poster)         cream field, mega type, floating product stickers + photo cluster
MARQUEE (ticker)      pop lime band, ink Unbounded cries, spring separators
CATEGORIES (grid)     white, rounded photo tiles with per-stall color rings
DEAL (data/facts)     HEAT coral field, white card, giant price, countdown
FEATURED (index list) cream, rows + cursor preview (desktop), inline thumbs (phone)
SHELF (grid)          white, filter pills, candy cards
PROMISE (statement)   PINE emerald field, cream type, real facts in mono
FOOTER (finale)       ink field, lime giant name, hours, links
```

### Decisions

- The GSAP/Lenis engine, marquee, index preview and reveal system stay (ported
  from the skill in this version); only the skin changes from the kraft pass.
- Loader: cream + three color bars + Space Mono percent; exits with the bars
  staggering away. ≤2.6s, real progress.
- Idle state: sticker bob + marquee = the market breathes at rest; both stop
  under reduced motion and the page is complete.
- Festive engine (Diwali) keeps its copy + photo; the fields carry the mood.
- Commerce pages: `.glass` remaps to white candy cards; accent colors shift to
  the new trio via token overrides; layouts untouched (they work).
