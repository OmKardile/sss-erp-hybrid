# Changelog

All notable changes to this project will be documented in this file.

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
