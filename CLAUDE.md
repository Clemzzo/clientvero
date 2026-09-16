# CLAUDE.md

Project context for ClientVero. Read this first, every session.

## What ClientVero is

A multi-tenant client-operations SaaS for freelancers, independent professionals, and small agencies (2–20 people).

**Core promise:** manage clients, deliver projects, and get paid — all from one place.

**Core loop (the MVP success path):**

```
Lead → Client → Proposal → Project → Portal → Invoice → Payment → Completion
```

Positioning: simpler than a CRM, more connected than a project-management tool, more professional than WhatsApp + spreadsheets. The **client portal is a core differentiator**, not a bonus feature.

## Documents and precedence

| File | Role |
|---|---|
| `CLIENTVERO_FINAL_PRD.md` | **Source of truth.** Scope, data model, architecture, security rules, screens, out-of-scope list. |
| `CLIENTVERO_MASTER_AGENT.md` | Same PRD (Part I) + the implementation appendix (Part III): Drizzle schema, auth/org context, permissions, service/action/validator starters. **Canonical starter patterns — extend them, don't replace them.** |
| `AGENT.md` | How to work: coding rules, task workflow, standards to uphold. |
| `CLAUDE.md` | This file — orientation and the invariants that must never be broken. |

**Precedence:** direct instruction from the project owner → PRD → AGENT.md → default behaviour. When the PRD conflicts with anything else, the PRD wins — stop and raise it rather than guessing. If the owner approves something the PRD rules out, update the PRD in the same change.

## Current state

The repository is **pre-implementation**: only the specification documents exist. There is no `package.json`, `src/`, or migration history yet. Scaffold from the PRD's repository structure and the Part III starter code rather than from a generic Next.js template.

Once scaffolded, the expected commands are:

```bash
npm run dev            # Next.js dev server
npm run build          # production build
npm run lint
npm run typecheck
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # apply migrations
npm run db:studio      # drizzle studio
```

Verify against `package.json` before relying on these.

## Stack

**Frontend:** Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion
**Backend:** Server Actions · Route Handlers · Zod · domain service layer · optional repository layer
**Data:** Neon PostgreSQL · Drizzle ORM · Drizzle Kit
**Infra:** Clerk (auth) · Stripe (subscriptions) · Cloudflare R2 (files) · Upstash Redis (rate limit/cache) · Resend (email) · PostHog (analytics) · OpenAI (AI) · Vercel (deploy)

**Architecture: modular monolith.** No microservices for the MVP. No alternative ORM. No global client store holding the application data model.

## Repository structure

```
src/
├── app/          (marketing) (auth) onboarding app portal proposal invoice admin api
├── components/   ui layout dashboard leads clients proposals projects invoices portal shared
├── features/     leads clients proposals projects invoices payments files messages notifications ai subscriptions
├── server/       auth authorization services repositories actions
├── db/           index.ts schema/ migrations/
├── lib/          clerk stripe r2 redis resend openai posthog utils
├── validators/
└── types/
```

## Invariants — never break these

1. **No business operation bypasses the chain:** authentication → tenant resolution → authorization → validation → server-side business logic.
2. **Every organization-owned record carries `organization_id`,** and every read and mutation is scoped by it. Frontend filtering is never authorization. Never trust a client-supplied `id`, `client_id`, or `organization_id` without verifying ownership server-side.
3. **PostgreSQL is the source of truth.** Redis is for rate limiting, caching, and temporary state only.
4. **ClientVero subscription billing (`subscriptions`) and client invoice payments (`payments`) are separate domains.** Never mix them.
5. **Portal authorization starts from the authenticated portal identity** → client → organization → resource. Never from a `client_id` sent by the browser.
6. **Money is `numeric`, never float.** Currency always stored with the amount. Totals always calculated on the trusted server.
7. **Public proposal and invoice URLs use opaque public IDs,** never internal UUIDs.
8. **Idempotency is required** for Stripe webhooks, proposal acceptance, payment recording, and subscription sync.
9. **Validate every external input with Zod** — forms, server actions, route handlers, query params, webhook payloads — on the server, regardless of client-side validation.
10. **The browser never calls OpenAI directly.** AI goes through a server action with auth, plan check, rate limit, and `ai_usage` tracking.

## Data model

```
users · organizations · organization_members
leads · clients · client_contacts
proposals · proposal_sections
projects · milestones
invoices · invoice_items · payments
files · messages · notifications
subscriptions · activity_logs · ai_usage · webhook_events
```

Conventions: UUID primary keys · `created_at`/`updated_at` on all major entities · `deleted_at` for soft-deletable ones (leads, clients, projects, proposals, invoices, files, messages) · `UNIQUE(organization_id, invoice_number)` · `UNIQUE(organization_id, user_id)` on memberships · unique `webhook_events.event_id`.

Roles: `OWNER` · `ADMIN` · `MEMBER`, mapped to capability strings (`leads.create`, `invoices.send`, `billing.manage`, …). Do not scatter `role === "OWNER"` checks through UI or handler code.

Use PostgreSQL transactions for lead conversion, proposal acceptance, and payment recording.

## Build order

Feature dependency: Auth → Organizations → Leads → Clients → (Proposals → Acceptance → Projects → Milestones) and (Invoices → Payments); Projects → Portal → (Files, Messages).

Per feature, work in this sequence:

```
schema → migration → validation → query/repository → service → authorization
→ server action/route handler → UI → analytics → email/notification side effects → tests
```

## Out of scope for the MVP

Do not build: full accounting · payroll · expense management · advanced CRM automation · Gantt charts · advanced time tracking · native mobile apps · marketplace · autonomous AI agents · enterprise SSO · advanced financial reporting · full email inbox replacement · resource planning.

If something seems needed but sits on this list, raise it rather than building it.

## UI direction

Clean, modern, spacious, premium SaaS. Restrained colour, rounded cards, subtle shadows, clear typography, meaningful (not decorative) animation. Avoid an overloaded enterprise-CRM appearance.

Always implement **loading, empty, and error states** — not just the happy path. User-facing errors are safe and human-readable; implementation details stay server-side. Large lists always paginate.

## Security checklist before launch

Clerk auth · org membership checks · role permissions · tenant-scoped reads and mutations · signed R2 URLs · opaque public IDs · webhook signature verification · webhook idempotency · server-side validation · rate limiting · secrets in env vars · XSS protections · parameterized queries · destructive-operation confirmation · activity/audit trail.

**Mandatory tenant tests:** Org A cannot read Org B's client or project (expect not-found/denied) · Client A cannot reach Client B's resources · only the intentionally public proposal resolves by public ID.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
