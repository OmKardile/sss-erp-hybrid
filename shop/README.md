# Shubham Super Shopee — Storefront (shop/)

Production storefront for Shubham Super Shopee (Pune grocery delivery).
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + Supabase Postgres · framer-motion · Lordicon.

**Vercel setup (root directory = `shop/`)**

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root Directory | `shop/` |
| Build Command | default (`next build`) |
| Install Command | default |

## Environment variables (required)

Set these in **Vercel → Project → Settings → Environment Variables**, then **redeploy**:

| Variable | Value |
|---|---|
| `SHOP_DATABASE_URL` | `postgresql://postgres.jojtbeohxuqxhvukuebc:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20` — **transaction pooler, port 6543** (runtime) |
| `SHOP_DIRECT_URL` | `postgresql://postgres.jojtbeohxuqxhvukuebc:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres` — port 5432 (migrations only) |
| `ERP_SYNC_TOKEN` | `sss-erp-sync-2026` |
| `NEXT_PUBLIC_STORE_NAME` | `Shubham Super Shopee` |
| `NEXT_PUBLIC_STORE_PHONE` | `+91 98765 43210` |
| `NEXT_PUBLIC_STORE_ADDRESS` | `Pune, Maharashtra, India` |
| `NEXT_PUBLIC_UPI_ID` | `shubhamsupershopee@upi` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jojtbeohxuqxhvukuebc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `ERP_API_URL` | *(optional)* `https://<erp-app>.vercel.app/api` — enables order push to the ERP; without it orders stay local to the shop DB |

> **Ports matter**: runtime connections must use the **6543 transaction pooler** with `?pgbouncer=true&connection_limit=1` — the 5432 session pooler caps at ~15 clients and exhausts under load.

## Verify the deployment

```bash
curl https://<your-shop>.vercel.app/api/health
# expect: {"ok":true, ...,"db":{"connected":true,"products":29}}
```

If `ok:false`, the response names the missing env var or DB problem, e.g. `DB_ENV_MISSING` → add `SHOP_DATABASE_URL` and redeploy.

### Error codes (API returns these instead of opaque 500s since v0.8.0)
- `503 DB_ENV_MISSING` — `SHOP_DATABASE_URL` not set on the deployment
- `503 DB_UNREACHABLE` — DB host/credentials wrong or network blocked
- `503 DB_SCHEMA_MISSING` — tables absent (run migrations / seed)
- `503 ERP_ENV_MISSING` — ERP sync endpoint configured but token/URL missing

## Local development

```bash
cd shop
bun install
cp .env.example .env   # fill in real values
bun run dev            # http://localhost:3000
```
