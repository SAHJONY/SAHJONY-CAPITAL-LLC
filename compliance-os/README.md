# SAHJONY Compliance OS

Enterprise compliance control plane for BSA/AML operations, sanctions screening evidence, suspicious-activity review, remittance behavior baselines, SAR/STR case management, and immutable-style decision logging.

## Stack
- Next.js 16.3.4 / React 19 / TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel target runtime
- Locales: Spanish, English, French, Portuguese, Arabic (RTL)

## Production safety model
1. Sanctions `blocked` or `review` states override behavioral low-risk signals.
2. `pending`/`error` sanctions states never become automatic CLEAR.
3. Stable remittance corridor/recipient/cadence signals can lower anomaly scores but cannot bypass KYC, fraud, sanctions, or mandatory review.
4. SAR/STR records are workflow/case-management objects; filing decisions require authorized compliance review.
5. Audit event tables are insert/read only for application users.

## Environment
Copy `.env.example` and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not expose a Supabase secret/service key to the browser.

## Commands
```bash
npm install
npm run dev
npm run build
```

## Routes
- `/{locale}` dashboard
- `/{locale}/transactions`
- `/{locale}/screening`
- `/{locale}/alerts`
- `/{locale}/cases`
- `/{locale}/sar`
- `/{locale}/audit`
- `POST /api/risk-score`
- `GET /api/health`

## Required go-live gates
- Connect and validate an approved sanctions provider/feed for OFAC, UN, EU and UK HMT datasets.
- Enable Supabase leaked-password protection and review inherited SECURITY DEFINER views before broad production use.
- Configure MFA policy for privileged roles.
- Run legal/compliance review for each jurisdiction before enabling regulatory filing automation.
- Complete load, penetration, RLS, disaster-recovery and audit-log integrity tests.
