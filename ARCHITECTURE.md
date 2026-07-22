# Buyer Signal Map — Architecture & Plan

A lead-magnet web app for **Streamline Connex**. A visitor enters their company
website URL + email, the system analyzes the site, infers their business and ICP,
and generates a personalized **Buyer Signal Report** showing 5–8 places their
future customers are actively revealing buying signals right now.

Report generation is powered by **Claude** (`@anthropic-ai/sdk`) using a two-stage
prompt pipeline with structured outputs so reports are consistent.

---

## 1. App architecture

Single deployable **Next.js 14 (App Router) + TypeScript** app.

```
Frontend (React / Tailwind)                 Backend (Route Handlers)
  /                Landing + LeadForm  ─────▶  POST /api/generate
  /report/[id]     Results page        ◀────   GET  /api/reports/[id]
                                                GET  /api/health

lib/  (framework-agnostic business logic — no React imports)
  pipeline.ts      orchestrates the stages (the extension seam)
  fetcher.ts       fetch + clean target website  (STAGE 1)
  analyze.ts       Claude call #1: site  -> CompanyProfile  (STAGE 2)
  report.ts        Claude call #2: profile -> BuyerSignalReport (STAGE 4)
  score.ts         deterministic signal scoring/normalization (STAGE 3 seam)
  anthropic.ts     Claude client + structured-output helper (tool-use)
  schema.ts        Zod schemas + TS types (structured contract)
  prompts/         stable system prompts + JSON schemas (separate from UI)
  store/           LeadStore interface + JSON-file implementation
  email/           EmailService interface + console/Resend implementations
  crm/             CrmService interface + noop/webhook implementations
  validation.ts    URL/email validation, normalization, SSRF guard
  brand.ts         Streamline Connex brand + CTA config
  config.ts        env-driven configuration
  demo.ts          deterministic sample report (no-key / DEMO_MODE)
```

The pipeline is intentionally modular so a future **High-Intent Signal Discovery
harness** can be inserted between "analyze" and "report" (see §6).

## 2. Data model

```
LeadSubmission {
  id, createdAt, email, inputUrl, normalizedUrl, hostname,
  status: 'complete' | 'partial' | 'failed',
  fetch: { ok, statusCode?, title?, error? },
  profile: CompanyProfile,
  report: BuyerSignalReport,
  meta: { model, demo, generationMs, source: 'live' | 'demo' }
}

CompanyProfile {
  companyName, offering, category, targetAudience, businessModel,
  industriesServed[], icpRoles[], notableDetails[], confidence
}

BuyerSignalReport {
  howWeSeeYourBusiness, positioningSummary,
  signals: BuyerSignal[5..8], summary, recommendedNextStep
}

BuyerSignal {
  name, signalType, whereItAppears, whyItMatters, whatWeWouldDo,
  opportunity: { metric, low, high }, priority, score(0..100)
}
```

Persistence is behind a `LeadStore` interface. Default = append to
`DATA_DIR/leads/<id>.json` + an index. Swap for Postgres/Supabase/Dynamo later
by implementing one interface (see `lib/store/index.ts`).

## 3. Prompt flow

1. **Extraction** (`prompts/extraction.ts`) — stable system prompt + strict
   JSON schema. Input: cleaned site text. Output: `CompanyProfile`.
2. **Synthesis** (`prompts/synthesis.ts`) — stable system prompt encoding the
   Streamline Connex point of view + strict JSON schema. Input: `CompanyProfile`.
   Output: `BuyerSignalReport`.

Both use Claude tool-use forced tool_choice for structured output (portable and
schema-validated with Zod). Site extraction is deliberately separate from final
report synthesis so each can be tuned/scored independently.

## 4. Routes / pages

- `GET  /`                 — landing + lead form (URL + email), how-it-works, trust.
- `POST /api/generate`     — validate -> pipeline -> persist -> email/CRM hooks.
- `GET  /report/[id]`      — polished, consultative results page.
- `GET  /api/reports/[id]` — fetch a stored report (results page fallback).
- `GET  /api/health`       — readiness (model configured?, storage writable?).

## 5. API flow (happy path)

```
LeadForm ──POST /api/generate {url,email}──▶ validate ─▶ pipeline.run()
   │                                            fetch ▸ analyze ▸ score ▸ report
   │                                            store.save() ▸ email.send() ▸ crm.route()
   ◀──── {id, record} ──── (also cached in sessionStorage) ───────────────┘
router.push(/report/[id])  ──▶  results page (sessionStorage or GET /api/reports/[id])
```

Loading/progress: the form drives a staged progress UI while awaiting the single
request. Validation errors return 400 with field-level messages; an unreadable
website degrades to a `partial` report (low confidence) rather than losing the lead.

## 6. Future extension points

- **High-Intent Signal Discovery harness** — insert a stage in `pipeline.ts`
  between `analyze` and `report` that enriches the profile with external signal
  data; `score.ts` already normalizes/re-ranks signals so scored external data
  drops in cleanly.
- **Signal scoring** — `score.ts` is deterministic and swappable for a real model.
- **CRM / email** — interfaces already in place; set env vars to activate.
- **Saved workspaces / repeat scans / account history** — every run is an
  addressable `LeadSubmission`; add an `accountId`/`workspaceId` field and index.
- **Streaming progress** — `/api/generate` can become an SSE endpoint without
  changing the pipeline.
