# FlyerFlow - Production Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Domain** - Register `flyerflow.ca` (or your preferred domain)
3. **PostgreSQL Database** - Vercel Postgres, Neon, Supabase, or Railway
4. **GitHub/GitLab/Bitbucket** - For repository hosting

---

## Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: FlyerFlow ready for production"

# Push to GitHub
git remote add origin https://github.com/yourusername/flyerflow.git
git push -u origin main
```

---

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the connection string

### Option B: Neon (Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → Copy connection string

### Option C: Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create project → Settings → Database → Copy connection string

### Run Migrations
```bash
# After setting DATABASE_URL in Vercel
npx prisma migrate deploy
# Or for initial setup:
npx prisma db push
```

---

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Step 4: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `flyerflow.ca` | Production |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` | `https://plausible.io/js/script.js` | Production |

---

## Step 5: Configure Custom Domain

1. In Vercel Dashboard → Settings → Domains
2. Add `flyerflow.ca` and `www.flyerflow.ca`
3. Configure DNS at your registrar:

### DNS Records (at your domain registrar)
```
Type    Name    Value
A       @       76.76.21.21          # Vercel IP
CNAME   www     cname.vercel-dns.com # Vercel CNAME
```

Or use Vercel's nameservers:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

---

## Step 6: Verify Deployment

1. Visit `https://flyerflow.ca`
2. Test:
   - ✅ Homepage loads
   - ✅ Location permission works
   - ✅ Stores and sales display
   - ✅ Filters work
   - ✅ Dark mode toggles
   - ✅ Legal pages accessible (/terms, /privacy, /affiliate-disclosure)
   - ✅ Health endpoint: `https://flyerflow.ca/api/health`
   - ✅ Sitemap: `https://flyerflow.ca/sitemap.xml`
   - ✅ Robots.txt: `https://flyerflow.ca/robots.txt`

---

## Step 7: Set Up Monitoring (Post-Launch)

### Uptime Monitoring
- **UptimeRobot** (Free): Add `https://flyerflow.ca/api/health`
- **Better Stack**: More features, generous free tier
- **Pingdom**: Paid, enterprise-grade

### Error Tracking (When Sentry supports Next.js 16)
```bash
# Once supported:
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Analytics
- **Plausible**: Add domain at [plausible.io](https://plausible.io)
- **Google Analytics 4**: Alternative if preferred

---

## Step 8: Post-Launch Checklist

- [ ] Domain resolves correctly (www and non-www)
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Database migrations run successfully
- [ ] Daily cron for flyer ingestion set up (Vercel Cron Jobs or external)
- [ ] Affiliate links tested and tracking
- [ ] Search Console: Submit sitemap at `https://flyerflow.ca/sitemap.xml`
- [ ] Social media accounts created (@flyerflow)
- [ ] Email addresses set up: legal@, privacy@, affiliates@, support@

---

## Vercel Cron Jobs (for daily flyer refresh)

In `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/ingest",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Create `/src/app/api/cron/ingest/route.ts` with your ingestion logic.

---

## Rollback Procedure

If issues arise:
1. Vercel Dashboard → Deployments → Click "..." on previous working deployment → "Promote to Production"
2. Or: `vercel rollback [deployment-url]`

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- FlyerFlow Issues: Create GitHub issue in your repo