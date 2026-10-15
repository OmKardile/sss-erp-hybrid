# Changelog

All notable changes to this project will be documented in this file.

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
