# Supabase Migration

This directory contains the SQL migration for the ERP database.

## Quick Setup

1. The schema is already pushed to Supabase via `npx prisma db push`
2. To re-apply manually, open the Supabase SQL Editor and run `migration.sql`
3. To seed demo data: `curl -X POST https://your-app.vercel.app/api/seed`

## Connection Details

- **Project URL**: https://mslhrgxicvnqddwkdzwv.supabase.co
- **Region**: ap-south-1 (Mumbai)
- **Pooler (IPv4)**: `aws-0-ap-south-1.pooler.supabase.com:5432`
- **Direct (IPv6)**: `db.mslhrgxicvnqddwkdzwv.supabase.co:5432`

## Environment Variables (for Vercel)

```
DATABASE_URL=postgresql://postgres.mslhrgxicvnqddwkdzwv:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.mslhrgxicvnqddwkdzwv:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://mslhrgxicvnqddwkdzwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FFf0V4iWbjtS11AyHi0SwA_724isZwM
```
