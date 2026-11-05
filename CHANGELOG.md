# Changelog

All notable changes to this project will be documented in this file.

## [3.3.0] — 2026-11-05

### Added — storefront (shop): one-click Marathi for the entire site (v0.12.0)
- A single click flips the whole storefront between English and Marathi — pill button in the desktop header + 4th slot in the mobile bottom dock. Instant client-side switch via React context; the locale persists in the `sss_locale` cookie (1 year) which the root layout reads server-side, so returning Marathi visitors get Marathi **server-rendered** (`<html lang="mr">`, no English flash, hydration-safe by construction).
- Static strings via a 227-key dictionary + category map + festive overrides (`shop/src/lib/i18n.ts`) — every page covered: home, product detail, cart, checkout, order confirmation, 404, festive strips, and all aria-labels.
- DB-driven strings (product names/brands/units/descriptions) resolve in three layers: built-in grocery glossary → unit-pattern regex → batched `POST /api/translate` (LLM, ≤120 strings/request, server-side in-memory cache + client localStorage cache). Search matches both scripts (typing "दूध" finds "Amul Taaza Toned Milk"). Dep added: `z-ai-web-dev-sdk` (the route degrades gracefully to glossary-only if the LLM is unavailable).
- Noto Sans Devanagari appended as a per-character fallback after the Latin faces; deterministic hand-written Marathi month tables for dates; order ETAs server-computed (`OrderView.etaDate`).
- QA: full Marathi render verified on every page + a Marathi E2E COD order; cookie hard-reload server-render checks; zero hydration errors; mobile 390px no-overflow; lint clean.

### Fixed — pre-existing bugs surfaced by the v0.12 QA sweep
- `<RecentlyViewed />` crashed the home page for any visitor with browsing history (the v0.11 redesign dropped its `products` prop) — prop restored.
- The marquee rendered raw dictionary keys ("marquee.1 …") in both locales — now translated.
- `data-split="lines"` on locale-dynamic text (the promise statement) downgraded to `data-reveal` — never data-split anything that can re-render.
- Footer address was hardcoded English — now localized (पुणे, महाराष्ट्र, भारत).

## [3.2.0] — 2026-11-05

### Added — storefront (shop): "Fresh Cart" redesign (v0.11.0), built with the /awwwards skill
- Candy-bright pop market: electric lime `#c8f135` + tomato coral `#ff5233` + mango `#ffc531` on fresh cream, deep-emerald fields, Unbounded display type, Space Mono data, sticker price chips, pill buttons with springy hovers. Color-field section journey (lime marquee → coral deal → pine promise → ink footer). Festive strips retinted vivid (Diwali = coral).
- Ported the skill's motion engine: Lenis on the GSAP ticker, declarative reveals (`data-split/reveal/parallax/intro`), real-progress loader, and page transitions as three color panels (lime→coral→pine) stagger-wiping between routes. Deps added: `gsap`, `lenis`.
- Engine hardened for this client-fetched storefront: ScrollTrigger refresh on fonts/load, MutationObserver wiring late-mounted reveals, and Tailwind 4 cascade-layer fix (element resets now in `@layer base` so utilities like `sm:hidden` work — this had duplicated the header logo).
- QA: desktop + mobile 390 (no overflow) + reduced motion (0 hidden) + golden path (cart → checkout COD → order) verified; VLM-reviewed; lint clean. Production build passes (19 routes).

## [3.1.3] — 2026-10-29

### Changed — storefront (shop): logo hard-coded inline (production cache-proof)
- Production kept showing the old logo after deploys: header/footer referenced `/logo.svg`/`logo-mark.svg` as asset URLs, and same-URL-new-content is a cache trap (CDN + browser). The logo is now hard-coded as inline SVG markup — `shop/src/components/brand-logo.tsx` (`BrandLogoMark` mobile tile, `BrandLogoLockup` full lockup) wired into header + footer; the logo ships inside the HTML, so no cache can ever serve a stale one. Poppins (500/600/800) loaded via next/font so the wordmark renders in its designed typeface on every device.

## [3.1.2] — 2026-10-29

### Fixed — storefront (shop): React 19 hydration mismatch for prefers-reduced-motion users
- framer-motion's `useReducedMotion()` returns `null` during SSR but the real preference on reduced-motion clients, so every `initial={reduce ? false : {...}}` / `style={reduce ? undefined : { y }}` / Reveal tree-swap produced hydration mismatches (server HTML carried animated initial states; client rendered static ones). Replaced with a hydration-safe `useSyncExternalStore` hook (`shop/src/hooks/use-prefers-reduced-motion.ts`, server snapshot `false`) in all consumers (hero, reveal, parallax, floating produce, cart page, cart badge, countdown, scroll-to-top, toast). Verified with emulated `prefers-reduced-motion: reduce`: home/cart/product hydrate with a clean console; default mode animations unchanged.

## [3.1.1] — 2026-10-29

### Fixed — storefront (shop)
- **framer-motion "non-static position" dev warning**: `useScroll({ target })` measures against the document scroll container (`<html>`), which was `position: static` — every parallax component warned in dev and risked imprecise scroll offsets. Fixed with `html { position: relative }` in `shop/src/app/globals.css`.
- Sandbox-recovery audit: `.env` restored (a sandbox reset had wiped it, taking every DB-backed API down with 500/503), stale Turbopack CSS cache cleared (`rm -rf .next`), and the full API surface re-verified green (health, products, cart CRUD, reviews, checkout → order page, sync, merch, orders).

## [3.1.0] — 2026-10-23

### Changed — storefront: real photography everywhere (no emojis/animations)
- Storefront redesign: all 78 emoji usages removed (hero floats, category tiles, product-card fallbacks, cart, checkout, order confirmation confetti, footer lists, empty states); 11 decorative CSS animations removed.
- 28 real photos added to `shop/public/products/` (19 products, 8 categories `cat-*.jpg`, 1 hero) — sourced from the public web (Pexels/Unsplash/retail), VLM-verified as real photos with no stock watermarks, normalized to JPEG <=1600px (~4 MB).
- New image system in `shop/src/lib/config.ts`: `CATEGORY_IMAGE` map + `resolveProductImage()` (product photo -> category photo -> generic fallback); removed `CATEGORY_EMOJI` / `CATEGORY_COLORS` gradient placeholders.
- All 29 products in the e-commerce Supabase DB updated with real image paths (already live in the deployed storefront's product cards).
- Order confirmation: clean check icon + Lucide icon tracker (no confetti/party emojis); category tiles use real photos instead of gradients+emoji; hero uses a real supermarket photo.
- Footer credit kept per owner's instruction: "Crafted with heart for Bro - Designed & developed by Omkar Kardile".

### Fixed
- `shop/src/app/api/sync/route.ts`: ERP -> storefront sync no longer overwrites `ShopProduct.image` with null when the ERP product has no photo (previously every "Sync Now" would wipe storefront images).
- `shop/src/app/api/seed/route.ts`: demo seed now includes real image paths for all 16 products.

### Notes
- The same storefront code is also maintained as a standalone repo (`OmKardile/shubhamsupershopee`) used as the development/preview copy; changes flow back here for deployment.
- Recommend eventually replacing web-sourced product photos with the shop's own product photography.

## [3.0.0] — 2025-10-15

### Added
- Complete redesign from React+Vite+localStorage to Next.js 16 App Router + TypeScript + Prisma/Supabase
- 14 ERP modules: Dashboard, POS, Products, Purchases, Income, Expenses, Udhar, Customers, Suppliers, Sales Analytics, Yearly Overview, Reports, Audit Log, Settings
- E-commerce storefront (separate Next.js app at `/shop`) with product grid, cart, checkout, order confirmation
- Two separate Supabase PostgreSQL databases (ERP + e-commerce)
- Product sync: ERP → storefront (token-protected API)
- Order reverse-sync: storefront orders → ERP income entries
- GST/tax support in POS with configurable rate
- Barcode/SKU scan input in POS
- Customer & supplier ledger statements with running balances
- Restock Center with bulk purchase order creation
- Expiry tracking with urgency grouping
- Sales targets with auto-suggest based on historical averages
- Inventory valuation (FIFO / selling price / purchase price)
- Business Health Score (composite 0-100 metric across 5 dimensions)
- Global Search (⌘/) across all entity types
- Command Palette (⌘K) with nav + actions
- Multi-currency API + UI toggle
- Smart Alerts widget (low-stock, overdue udhar, expiring, target-behind)
- Notification stubs with email-alert send
- Backup/restore (full DB JSON export/import, v4)
- Print/PDF export for reports + thermal-printer receipt format
- Date-range selector on dashboard
- Bulk CSV product import
- Inventory adjustment (stock-take) with audit log
- Audit Log timeline (unified view of all record changes)
- Vercel Speed Insights integration
- Developer credit: "Designed & developed by Omkar Kardile"

### Changed
- Database: localStorage → Prisma ORM + Supabase PostgreSQL
- Framework: React + Vite → Next.js 16 App Router
- Deployment: Render Static Site → Vercel Web Service

---

<sub>Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/)</sub>
