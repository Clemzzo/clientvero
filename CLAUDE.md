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

Built so far:

- **Marketing site** (`src/app/(marketing)`): landing, pricing, product, solutions, and guides pages.
- **Auth pages** (`src/app/(auth)`): `/sign-up`, `/sign-in`, `/verify-email` (6-digit OTP), built from shared parts in `src/components/auth` and `src/components/shared` (`TextField`, `FormField`, `SubmitButton`, `FormAlert`).
- **Rate limiting**: Upstash limits on every auth action and every workspace write (`authLimits` / `workspaceLimits` in `src/lib/redis/rate-limit.ts`; actions call `requireWithinLimit()` from `src/server/actions/rate-limit-guard.ts` after the permission check). Fails open if Upstash is unreachable.
- **Auth backend**:
  - Neon Auth instance: `src/lib/auth/server.ts`
  - API route: `src/app/api/auth/[...path]`
  - Route protection for `/dashboard`, `/onboarding`, `/admin`: `src/proxy.ts`
  - Sign-up, sign-in, sign-out, and email-verification (OTP) server actions: `src/server/actions/auth.ts`. Neon sends the code on sign-up and sign-in; the app only sends one for "resend".
  - Current-account helper: `getCurrentAccount()` / `requireCurrentAccount()` in `src/server/auth/current-user.ts` return the local user **and** their workspace membership in one query (provisioning the `users` row on first use). Cached per request.
  - Sessions: signing in without "Remember me" creates a browser-session cookie (ends when the browser closes); ticked lasts 7 days. The automatic sign-in right after email verification uses Neon's default 7-day session.
- **Onboarding** (`/onboarding`): two-step form that creates the user's organization and OWNER membership (`src/server/services/organization.service.ts`, `src/server/actions/onboarding.ts`). Users who already have a workspace are redirected to `/dashboard`.
- **Post-sign-in routing** (`src/server/auth/redirect-after-sign-in.ts`): signed-in users with a workspace go to the safe `next` path or `/dashboard`; without one, to `/onboarding`. Used by `signInAction` and the sign-in/sign-up pages.
- **Workspace** (`/dashboard`, `src/app/dashboard`): the signed-in app. Its layout sends users without a workspace to `/onboarding` and wraps every page in the app shell (`src/components/layout/app-shell.tsx`). Legacy `/app/*` URLs redirect here (`next.config.ts`).
- **Authorization**: `requireOrganizationContext()` (`src/server/auth/organization.ts`) resolves user + organization + membership from the session — never from the browser. `requirePermission(ctx, permissions.x)` (`src/server/authorization/permissions.ts`) is the only role check. Errors: `src/server/errors.ts`.
- **Activity log**: `activityInsert()` returns an unexecuted insert to put in `db.batch([...])` next to the main write; `listActivity()` / `listRecentActivity()` read it (`src/server/services/activity.service.ts`).
- **Dashboard overview** (`/dashboard`): aggregates from `src/server/repositories/dashboard.repository.ts`; tiles for features not yet built return 0 until their feature replaces the zero.
- **Leads** (`/dashboard/leads`): list (search, status filter, pagination) and pipeline views, create, detail with activity, edit, and "Move to…" status changes. WON is set only by "Convert to client", and a converted lead's status is locked. OWNER/ADMIN can archive (soft delete) or permanently delete a lead from the list table (`leads.delete`, PRD §86); archived leads are restored or permanently deleted at `/dashboard/leads/archived`. Code: `src/app/dashboard/leads`, `src/components/leads`, `src/validators/leads.ts`, `src/server/{repositories/lead.repository.ts,services/lead.service.ts,actions/leads.ts}`.
- **Clients** (`/dashboard/clients`): list with search and pagination, create, edit, and a detail page with Overview / Contacts / Activity tabs. Contacts (add, edit, remove, one primary) are edited in dialogs. OWNER/ADMIN can archive or permanently delete a client from the list table (`clients.delete`); permanent deletion removes its contacts and activity history and is refused while the client has proposals. Row menus use the shared `RowDeleteMenu`, which offers both options. Archived clients are restored or permanently deleted at `/dashboard/clients/archived`; both Archived screens share `ArchivedRecordsSection` / `ArchivedRowActions`. Code: `src/app/dashboard/clients`, `src/components/clients`, `src/validators/clients.ts`, `src/server/{repositories/client.repository.ts,services/client.service.ts,services/client-contact.service.ts,actions/clients.ts}`.
- **Lead conversion** (`src/server/services/lead-conversion.service.ts`): one `db.batch` with an advisory lock and guarded inserts — creates the client, marks the lead WON, and logs `LEAD_CONVERTED` + `CLIENT_CREATED`, or does nothing. Converting twice raises `ConflictError`.
- **Proposals** (`/dashboard/proposals`): list with status tabs and search, a two-column builder (sections, amount/discount/tax with a live total), detail with status timeline and activity, preview, send (share link) and withdraw. Only DRAFT/WITHDRAWN proposals are editable. Code: `src/app/dashboard/proposals`, `src/components/proposals`, `src/validators/proposals.ts`, `src/server/{repositories/proposal.repository.ts,services/proposal.service.ts,actions/proposals.ts}`. Money maths: `src/lib/utils/money.ts` (BigInt cents, never floats).
- **Public proposal page** (`/proposal/[publicId]`, no sign-in, `noindex`): `src/server/services/public-proposal.service.ts`. The first view marks VIEWED (via `after()`); accept (typed name) and decline are idempotent, rate-limited per IP (`publicLimits`), and the first response closes the link.
- **Tests**: Vitest (`npm test`). Integration tests run against the database in `.env.local` (the development branch) and clean up after themselves.
- **Database**: `users`, `organizations`, `organization_members`, `activity_logs`, `leads`, `clients`, `client_contacts`, `proposals`, and `proposal_sections` exist (`src/db/schema`). Add other tables with their features, following the Part III starter code.
  - The db client is Neon's HTTP driver: `db.transaction()` is **not** supported. Use `db.batch([...])` for all-or-nothing writes.

Local development uses the Neon `development` branch; see `.env.example` for the required variables. Never point `.env.local` at the `production` branch.

Commands:

```bash
npm run dev            # Next.js dev server
npm run build          # production build
npm run lint
npm run typecheck
npm test               # vitest (uses .env.local → development branch)
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # apply migrations to the branch in DATABASE_URL
npm run db:studio      # drizzle studio
```

## Stack

**Frontend:** Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion
**Backend:** Server Actions · Route Handlers · Zod · domain service layer · optional repository layer
**Data:** Neon PostgreSQL · Drizzle ORM · Drizzle Kit
**Infra:** Neon Auth — managed Better Auth (auth) · Neon Object Storage, S3-compatible (files) · Stripe (subscriptions) · Upstash Redis (rate limit/cache) · Resend (email) · PostHog (analytics) · OpenAI (AI) · Vercel (deploy)

**Architecture: modular monolith.** No microservices for the MVP. No alternative ORM. No global client store holding the application data model.

## Repository structure

```
src/
├── app/          (marketing) (auth) onboarding dashboard portal proposal invoice admin api
├── components/   ui layout dashboard leads clients proposals projects invoices portal shared
├── features/     leads clients proposals projects invoices payments files messages notifications ai subscriptions
├── server/       auth authorization services repositories actions
├── db/           index.ts schema/ migrations/
├── lib/          auth storage stripe redis resend openai posthog utils
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

Conventions: UUID primary keys · `created_at`/`updated_at` on all major entities · `deleted_at` for soft-deletable ones (leads, clients, projects, proposals, invoices, files, messages; leads and clients can also be hard-deleted) · `UNIQUE(organization_id, invoice_number)` · `UNIQUE(organization_id, user_id)` on memberships · unique `webhook_events.event_id`.

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

Neon Auth · org membership checks · role permissions · tenant-scoped reads and mutations · presigned storage URLs · opaque public IDs · webhook signature verification · webhook idempotency · server-side validation · rate limiting · secrets in env vars · XSS protections · parameterized queries · destructive-operation confirmation · activity/audit trail.

**Mandatory tenant tests:** Org A cannot read Org B's client or project (expect not-found/denied) · Client A cannot reach Client B's resources · only the intentionally public proposal resolves by public ID.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
