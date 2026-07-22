# Buyer Signal Map

A production-ready MVP lead-magnet web app for **Streamline Connex**.

A visitor enters their **company website URL** and **email**. The app fetches and
analyzes the site, infers the company's offering / ICP / industries / business
model, and generates a personalized **Buyer Signal Report** — 5–8 environments
where that company's ideal prospects are actively revealing buying signals right
now, and exactly what Streamline Connex would do with each one.

Report generation is powered by **Claude** (`@anthropic-ai/sdk`) through a
two-stage, structured-output pipeline so reports are consistent and on-brand.

- **Frontend:** Next.js 14 (App Router), React, Tailwind — a premium, consultative
  landing page + polished results page with loading/progress and error states.
- **Backend:** Next.js Route Handlers running a modular generation pipeline.
- **Engine:** Claude with a stable system prompt + JSON schema per stage.

> **Runs out of the box.** With no API key it starts in **demo mode** and returns
> a deterministic sample report so the whole flow is demonstrable. Set
> `ANTHROPIC_API_KEY` for live, tailored reports.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — app runs in demo mode without a key
npm run dev                    # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run build`.

Health check: `GET /api/health` reports the model, demo mode, and whether the
storage backend is writable.

---

## Configuration

All env vars are optional for a local demo. See `.env.example` for the full list.

| Variable | Purpose | Default |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Enables live report generation | _(unset → demo mode)_ |
| `ANTHROPIC_MODEL` | Model for extraction + synthesis | `claude-opus-4-8` |
| `DEMO_MODE` | Force sample reports even with a key | `false` |
| `DATA_DIR` | Where submissions/reports are stored (JSON) | `.data` |
| `EMAIL_PROVIDER` | `console` (log only) or `resend` | `console` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend delivery | — |
| `CRM_PROVIDER` | `none` or `webhook` | `none` |
| `CRM_WEBHOOK_URL` | Where to POST leads | — |
| `NEXT_PUBLIC_BOOK_URL`, `NEXT_PUBLIC_AUDIT_URL`, `NEXT_PUBLIC_SITE_URL` | CTA links | streamlineconnex.com |
| `NEXT_PUBLIC_APP_URL` | Absolute base URL for links in emails | request-derived |

For higher volume at lower cost, set `ANTHROPIC_MODEL=claude-sonnet-5`.

---

## How it works

```
POST /api/generate {url,email}
  → validate (+ SSRF guard)
  → pipeline: fetch site ▸ analyze (Claude) ▸ score/rank ▸ synthesize (Claude)
  → persist submission ▸ email hook ▸ CRM hook
  → returns { id, submission }
router.push(/report/[id])  → polished results page
```

- **Extraction** and **synthesis** are two separate Claude calls with separate
  stable system prompts and JSON schemas (`src/lib/prompts/`), so each can be
  tuned independently.
- Structured output is enforced via forced tool-use and validated at runtime with
  Zod (`src/lib/schema.ts`).
- An unreadable website **degrades gracefully** to a low-confidence `partial`
  report rather than losing the lead.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full data model, prompt flow,
routes, and extension points.

---

## Project structure

```
src/
  app/
    page.tsx                 Landing page + lead form
    report/[id]/page.tsx     Results page (sessionStorage cache → API fallback)
    api/generate/route.ts    Validate → pipeline → persist → email/CRM
    api/reports/[id]/route.ts Fetch a stored report
    api/health/route.ts      Readiness
  components/                LeadForm, ReportView, SignalCard, header/footer, logo
  lib/
    pipeline.ts              Orchestrates the stages (extension seam)
    fetcher.ts               Fetch + clean site (dependency-free)
    analyze.ts / report.ts   Claude calls (stages 2 & 4)
    score.ts                 Deterministic scoring/ranking (stage 3 seam)
    anthropic.ts             Claude client + structured-output helper
    schema.ts                Zod schemas + types (the structured contract)
    prompts/                 Stable system prompts + JSON schemas (separate from UI)
    store/                   LeadStore interface + JSON-file implementation
    email/  crm/             EmailService / CrmService interfaces + implementations
    validation.ts            URL/email validation + SSRF guard
    brand.ts / config.ts     Brand + env config
    demo.ts                  Deterministic sample (no-key / demo mode)
```

---

## Deploy

The app is a standard Next.js server — deploy anywhere that runs Node:

- **Node host / container** (`npm run build && npm start`) with a persistent disk
  for `DATA_DIR` — recommended for the default JSON store.
- **Vercel / serverless** — set `ANTHROPIC_API_KEY` and, because serverless disks
  are ephemeral, swap the `LeadStore` for a database (see below). Results pages
  still render from the client-side cache regardless.

## Extending it

Built to grow into a High-Intent Signal Discovery harness and beyond:

- **External signal data / scoring** — enrich in `pipeline.ts` between analyze and
  synthesize; `score.ts` already normalizes and re-ranks, so scored data drops in.
- **Database** — implement the `LeadStore` interface (`src/lib/store/index.ts`).
- **Email / CRM** — interfaces already in place; set env vars to activate Resend
  or a CRM webhook, or add a native integration.
- **Accounts / workspaces / repeat scans / history** — every run is an addressable
  `LeadSubmission`; add an `accountId` and index for saved workspaces.
- **Streaming progress** — `/api/generate` can become an SSE endpoint without
  touching the pipeline.
