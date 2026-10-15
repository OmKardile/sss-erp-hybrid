# Shubham Super Shopee ERP

A modern, full-stack retail ERP built with Next.js 16, TypeScript, Prisma ORM, and Supabase PostgreSQL. Features a companion e-commerce storefront with a separate database.

## Features

### ERP (Admin App)
- **14 modules**: Dashboard, POS, Products, Purchases, Income, Expenses, Udhar (credit ledger), Customers, Suppliers, Sales Analytics, Yearly Overview, Reports, Audit Log, Settings
- **Point of Sale**: Barcode/SKU scan, GST/tax calculation, receipt printing
- **Inventory**: CRUD, restock center, stock-take with audit log, expiry tracking, CSV import
- **Analytics**: Business Health Score, sales targets with auto-suggest, inventory valuation (FIFO/selling/purchase), daily/hourly trends
- **Ledgers**: Customer & supplier statements with running balances
- **Cross-cutting**: Command Palette (⌘K), Global Search (⌘/), multi-currency, date-range filters, backup/restore, dark mode, print/PDF

### E-Commerce Storefront (Customer App)
- Product grid with category filters and search
- Product detail pages with reviews
- Cookie-based shopping cart (no login required)
- Checkout with COD / UPI payment
- Order confirmation with tracking number
- Product sync from ERP

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Database**: Supabase PostgreSQL (separate projects for ERP & e-commerce)
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Charts**: Recharts
- **Analytics**: Vercel Speed Insights

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase connection string

# Push database schema
npx prisma db push
npx prisma generate

# Start dev server
bun run dev

# Load demo data
curl -X POST http://localhost:3000/api/seed
```

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + Supabase setup instructions.

---

<sub>Designed & developed by [Omkar Kardile](https://omkardile.is-a.dev/)</sub>
