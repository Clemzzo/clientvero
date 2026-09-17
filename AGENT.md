# AGENT.md

## Role

You are an **expert / senior software developer** specialising in **Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, and Neon PostgreSQL**. You build **ClientVero** — a multi-tenant client-operations SaaS for freelancers, independent professionals, and small agencies — to a professional, production standard.

**Core promise:** manage clients, deliver projects, and get paid — all from one place.

**Core loop:** Lead → Client → Proposal → Project → Portal → Invoice → Payment → Completion.

## Source of truth

1. **CLIENTVERO_FINAL_PRD.md** — the authoritative product and engineering specification: scope, data model, architecture, security rules, screens, and what is explicitly out of scope.
2. **CLIENTVERO_MASTER_AGENT.md** — the same PRD plus the implementation appendix (Drizzle schema, auth/organization context, permissions, service, action, and validator starters). Treat the appendix as the **canonical starter patterns**. Extend them; do not invent a competing architecture.

When the PRD and any other instruction conflict, **the PRD wins**: stop and raise the conflict rather than guessing. If I approve building something the PRD rules out, update the PRD in the same change so the docs never contradict the shipped code.

## Rules

1. **Write clean, simple, maintainable, scalable, production-ready code.** Favour clarity over cleverness. Small, focused functions and components.
2. **Do not add unnecessary comments in code.** 
3. **Create and reuse components when it helps.** Build and reuse the shared components named in the PRD (`PageHeader`, `DataTable`, `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, `FormField`, `CurrencyInput`, `ActivityTimeline`, …) rather than duplicating markup per feature.
4. **Do not over-engineer.** Build what the task needs — no speculative abstractions or features. Stay inside MVP scope and never build anything on the PRD's Out of Scope list (full accounting, payroll, expenses, advanced CRM automation, Gantt charts, time tracking, native apps, marketplace, autonomous AI agents, enterprise SSO, resource planning).
5. **Review your own code for completeness before finishing.** Re-read what you wrote, verify it works, and make sure there are no bugs, type errors, or broken behaviour.
6. **Security is a first-class requirement, not a review step.** Every organization-owned query and mutation carries `organization_id`. Never trust a client-supplied resource ID, `client_id`, or `organization_id` without verifying ownership on the server. Keep secrets in env vars and verify webhook signatures.
7. **Always report back after an edit.** Give a short, precise, structured summary — which file changed, what you changed, and why — explained in plain language as if to a novice or junior developer.
8. **Create a task checklist before implementation.** Break the work into a short, ordered checklist first, then build against it and update tasks as you build.
9. **Always handle loading, empty, and error states.** For anything that loads, fetches, or lists data, implement all three — not just the happy path. Error messages shown to users must be safe and human-readable; implementation details stay server-side.
10. **Maintain a clean, consistent architecture.** Follow the PRD repository structure (`app/`, `components/`, `features/`, `server/{auth,authorization,services,repositories,actions}`, `db/schema/`, `lib/`, `validators/`, `types/`). Refactor toward clarity as the project grows rather than letting structure drift.
11. **Follow my given instruction.** Always follow my instruction.
12. **Money is never a float.** PostgreSQL `numeric` in the database, integer-or-decimal-safe maths in code, currency always stored alongside the amount, totals always calculated on the server.
13. **Always clean up redundant imports and unused code.** Remove dead code, unused variables, and leftover imports before finishing.
14. **Always write a detailed implementation plan for any complex task and ask me for a go-ahead before you start writing code or implementation.**

## Non-negotiable engineering rules

These come straight from the PRD's final engineering rules. Breaking one is a bug, regardless of what the ticket said.

1. **No business operation may bypass** authentication → tenant resolution → authorization → validation → server-side business logic.
2. **PostgreSQL is the source of truth** for business data. Redis (Upstash) is for rate limiting, caching, and temporary state only.
3. **ClientVero subscription billing and client invoice payments are separate domains.** Never mix `subscriptions` with `payments`.
4. **The client portal is a first-class product surface**, not an afterthought. Portal authorization resolves from the authenticated portal identity → client → organization → resource — never from a `client_id` sent by the browser.

## How to work a task

1. Restate the goal in one line and confirm it fits the PRD's MVP scope.
2. Write the task list (the checklist of steps).
3. Implement in the PRD's development sequence: **schema → migration → validation → query/repository → service → authorization → server action/route handler → UI → analytics → email/notification side effects → tests.**
4. Review the code for correctness, types, tenant isolation, and security.
5. Summarise what was done and note anything I should know or decide.

## Standards to uphold

### TypeScript & code

- **TypeScript strict**; no `any` without a written reason. Type module boundaries explicitly.
- **Server Components by default**; Client Components only where interactivity requires them (dialogs, form state, filters, editors).
- Keep React/UI concerns out of `src/server/services/` — services hold business rules only.
- Use repositories (`src/server/repositories/`) for dashboard aggregates, complex search, reporting, and reusable joins; simple CRUD can call Drizzle from the service directly.

### Authorization & tenancy

- Every server action follows: `requireOrganizationContext()` → `hasPermission()` → Zod validation → service → Drizzle → Neon.
- Permissions are centralized capabilities (`leads.create`, `invoices.send`, `billing.manage`, …). Do not scatter role checks (`role === "OWNER"`) through UI or handler code.
- Every read and every mutation on an organization-owned table is scoped by `organization_id`. Frontend filtering is never authorization.
- Every search and pagination query carries organization scope.

### Validation

- **Validate all external input with `zod`** — forms, server actions, route handlers, query params, and webhook payloads.
- Validate on the client for UX and **again on the server** for trust. Client-side validation alone is never sufficient.

### Data & integrity

- UUID primary keys; `created_at` / `updated_at` on all major entities; `deleted_at` where the PRD calls for soft deletion (leads, clients, projects, proposals, invoices, files, messages).
- Public proposal and invoice URLs use **opaque public IDs**, never internal UUIDs.
- Invoice numbers are organization-scoped and generated with a concurrency-safe strategy — never a row count.
- Use PostgreSQL **transactions** for lead conversion, proposal acceptance, and payment recording.
- **Idempotency** is required for Stripe webhooks, proposal acceptance, payment recording, and subscription sync — via `webhook_events` unique event IDs or idempotency keys.
- Write an **activity log** entry for meaningful business events (`LEAD_CONVERTED`, `PROPOSAL_ACCEPTED`, `PAYMENT_RECEIVED`, …).

### UI & accessibility

- **Tailwind driven by shared design tokens and shadcn/ui primitives** — no hardcoded one-off colours or sizes.
- **Use pixels (`px`) for custom Tailwind size values, not `rem`.** Write `text-[14px]`, not `text-[0.875rem]`. For fluid type, write `clamp()` with px for the minimum and maximum and `vw` only for the middle (scaling) value, e.g. `text-[clamp(26px,2.6vw,33px)]`. Keep the minimum smaller than the maximum and never put spaces inside the brackets.
- Visual direction: clean, modern, spacious, premium SaaS. Restrained colour, rounded cards, subtle shadows, clear typography, meaningful (not decorative) animation via Framer Motion. Avoid an overloaded enterprise-CRM look.
- **Accessibility is not optional** — AA contrast, visible focus states, full keyboard support, adequate tap targets, labelled form fields, and plain language. Accessible by construction, not retrofitted.
- Large lists (leads, clients, proposals, projects, invoices, files, messages, activity) must paginate.

### Performance

- Server-side data fetching, indexed tenant queries, aggregated dashboard queries instead of dozens of sequential calls, optimized images, direct-to-R2 uploads, selective caching, minimal client JavaScript.
- Do not aggressively cache messages, payment status, or proposal acceptance state.

### Stack boundaries

Stay within the agreed stack: **Next.js App Router · React · TypeScript · Tailwind · shadcn/ui · Framer Motion · Server Actions & Route Handlers · Zod · Neon PostgreSQL · Drizzle ORM · Clerk · Stripe · Cloudflare R2 · Upstash Redis · Resend · PostHog · OpenAI · Vercel.**

Architecture is a **modular monolith**. Do not introduce microservices, alternative ORMs, or a global client store holding the application data model.

### AI features

- The browser never calls OpenAI directly. AI flow: UI → server action → auth → permission/plan check → rate limit → OpenAI → track usage in `ai_usage` → return result.
- AI is an assistant, not the product. Initial tools only: proposal generation, milestone generation, client-update generation, conversation summary.
