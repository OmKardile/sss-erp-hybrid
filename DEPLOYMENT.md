# Deployment Guide — Shubham Super Shopee ERP

## ⚡ What Changed vs Previous Version

| | Previous (Live) | New Version |
|---|---|---|
| **Framework** | React + Vite | Next.js 16 (App Router) |
| **Type** | Static SPA | Full-stack app (API routes + DB) |
| **Data** | localStorage (browser) | Prisma ORM + Database |
| **Deploy** | Render Static Site | **Needs Web Service** (NOT static) |

### 🚨 Critical: This version CANNOT be deployed as a static site
The new version has **server-side API routes** (`/api/*`) and a **database**. It requires a Node.js server runtime.

---

## Option A: Render (Web Service)

1. **Create a new Web Service** (not Static Site) on Render
2. Connect your GitHub repo: `OmKardile/sss-erp-hybrid`
3. Settings:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: `Node` (not Static)
   - **Plan**: Free or Starter ($7/mo for always-on)
4. **Environment Variables**:
   - `DATABASE_URL` = your Supabase PostgreSQL connection string
   - `NODE_ENV` = `production`
5. **Health Check**: `/` (returns 200)

### ⚠️ SQLite won't work on Render
Render's filesystem is ephemeral. You MUST use Supabase (PostgreSQL) for the database. See below.

---

## Option B: Vercel (Recommended for Next.js)

1. Go to https://vercel.com and import `OmKardile/sss-erp-hybrid`
2. Vercel auto-detects Next.js — no build config needed
3. **Environment Variables**:
   - `DATABASE_URL` = your Supabase PostgreSQL connection string
   - `NODE_ENV` = `production`
4. Deploy — Vercel handles API routes natively via serverless functions
5. **Note**: Set `output: "standalone"` removal may be needed for Vercel (it auto-optimizes). See `next.config.ts`.

---

## Connecting to Supabase

### Step 1: Create Supabase Project
1. Go to https://supabase.com → New Project
2. Name it `sss-erp` (or similar)
3. Set a strong database password
4. Choose region closest to your users
5. Wait for provisioning (~2 min)

### Step 2: Get Connection String
1. In Supabase Dashboard → **Settings** → **Database**
2. Under "Connection string", choose **URI** format
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Update Prisma Schema
The schema's datasource needs to change from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"   // ← change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 4: Set Environment Variable
In your `.env` (local) or deployment platform:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Step 5: Push Schema to Supabase
```bash
npx prisma db push    # Creates all tables in Supabase
npx prisma generate   # Regenerates client for PostgreSQL
```

### Step 6: Seed Demo Data
Once deployed, click "Load Demo" in the topbar, or call:
```bash
curl -X POST https://your-app.onrender.com/api/seed
```

---

## E-Commerce Page Plan (Phase 2)

### Architecture
```
┌─────────────────────────┐     ┌─────────────────────────┐
│   ERP (Admin)           │     │   E-Commerce (Customer)  │
│   Next.js App           │     │   Separate Next.js App   │
│                         │     │   or /shop route         │
│   Supabase DB #1        │     │   Supabase DB #2         │
│   - Products            │────▶│   - Product Catalogue    │
│   - Purchases           │     │     (synced from ERP)    │
│   - Income/Expenses     │     │   - Customer Orders      │
│   - Udhar               │     │   - Cart                 │
│   - Customers/Suppliers │     │   - Reviews              │
│   - Sales/Targets       │     │                          │
│   - Settings            │     │                          │
└─────────────────────────┘     └─────────────────────────┘
```

### Separate Supabase Databases
- **DB #1 (ERP)**: `sss-erp` — all admin/operations data
- **DB #2 (E-Commerce)**: `sss-ecommerce` — customer-facing catalogue + orders

The ERP syncs its product catalogue to the e-commerce DB (via API or scheduled job). Orders placed on the e-commerce site can be imported back into the ERP as income/sales.

### E-Commerce Features (planned)
- Product grid with search/filter
- Product detail pages
- Shopping cart
- Checkout (cash on delivery / UPI)
- Order confirmation
- Order tracking
- Customer reviews

### Deployment Decision (Render vs Vercel)
- **Vercel**: Best for Next.js, generous free tier, automatic preview deployments
- **Render**: Good if you want everything on one platform, supports background workers

Recommendation: Deploy ERP on **Render** (Web Service), E-Commerce on **Vercel** for best of both.
