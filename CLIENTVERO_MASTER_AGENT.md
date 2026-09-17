# ClientVero — Master PRD + Agent Implementation Bundle
> Single source of truth for building ClientVero MVP. Follow the requirements and implementation rules below unless explicitly overridden by the project owner.
## How to use this file
- Treat the Product Requirements and Technical Architecture as authoritative product and engineering requirements.
- Treat the implementation appendix as the canonical starter patterns for database, auth, authorization, validation, services, and server actions.
- Complete missing production code rather than inventing a competing architecture.
- Preserve organization-level tenant isolation across every organization-owned query and mutation.
- Do not introduce microservices for the MVP.
---

# Part I — Final Product Requirements Document

# ClientVero — Final Product Requirements Document & Technical Implementation Specification

**Version:** 3.0  
**Status:** Final MVP Specification  
**Product:** ClientVero  
**Core Promise:** **Manage clients, deliver projects, and get paid — all from one place.**

---

## 1. Executive Summary

ClientVero is a client-operations SaaS for freelancers, independent professionals, consultants, developers, designers, and small agencies.

It unifies the core workflow:

**Leads → Clients → Proposals → Projects → Client Portal → Invoices → Payments → Files → Communication**

The product is intentionally simpler than an enterprise CRM and more connected than a collection of WhatsApp chats, Google Docs, spreadsheets, Notion pages, cloud folders, and separate invoicing tools.

The MVP is designed around one complete loop:

> **Capture a lead → win the client → send a proposal → manage the project → communicate professionally → invoice → get paid → complete the project.**

---

# 2. Product Vision

ClientVero's long-term vision is to become the **operating system for independent businesses**.

Long-term workflow:

**Marketing → Lead → CRM → Proposal → Contract → Payment → Project → Client Portal → Delivery → Retention → Repeat Business**

The MVP does not attempt to build every part of this vision. It establishes the core data model, tenant architecture, client workflow, and client portal required to expand safely.

---

# 3. Problem

Independent service businesses manage clients across too many disconnected tools.

Typical workflow:

- Lead arrives through X, LinkedIn, email, WhatsApp, referral, or a website.
- Lead is stored in a spreadsheet or inbox.
- Proposal is created in Google Docs or another document tool.
- Project is managed in Notion, Trello, or a similar tool.
- Files are shared through Google Drive.
- Communication happens in WhatsApp/email.
- Invoices are created separately.
- Payments are tracked manually.
- Clients repeatedly ask for status updates.

Consequences:

- fragmented information
- duplicated work
- missed follow-ups
- poor visibility
- payment delays
- context switching
- weak client experience

ClientVero should make the entire process feel like one connected workflow.

---

# 4. Target Users

## Primary

### Freelancers

Developers, designers, marketers, copywriters, video editors, photographers, consultants, and other independent service providers.

### Independent Professionals

Coaches, strategists, virtual assistants, business consultants, and similar professionals.

### Small Agencies

Teams of approximately 2–20 people that need lightweight CRM, project, billing, and client-communication functionality.

---

# 5. Product Principles

1. **Simple by default**
2. **Client-centric**
3. **Connected workflow**
4. **Professional client experience**
5. **Automation over administration**
6. **AI as an assistant, not the product**
7. **Security and tenant isolation from day one**

---

# 6. MVP Goals

A user must be able to:

- create an account
- create an organization
- complete onboarding
- manage leads
- convert leads into clients
- create and send proposals
- allow clients to view and accept proposals
- create projects
- manage milestones
- invite clients to the portal
- share files
- communicate with clients
- create and send invoices
- track payments
- receive notifications
- use AI assistance
- manage ClientVero billing

---

# 7. MVP Scope

## Included

- authentication
- organization/workspace
- roles and permissions
- onboarding
- dashboard
- leads
- clients
- client contacts
- proposals
- proposal acceptance
- projects
- milestones
- client portal
- invoices
- invoice items
- payment tracking
- files
- messages
- notifications
- activity logs
- AI usage tracking
- AI helpers
- search
- subscription billing
- admin dashboard
- transactional email
- analytics
- rate limiting
- tenant isolation

## Out of Scope

- full accounting
- payroll
- expense management
- advanced CRM automation
- complex Gantt charts
- advanced time tracking
- native mobile apps
- marketplace
- advanced AI agents
- enterprise SSO
- advanced financial reporting
- full email inbox replacement
- resource planning

---

# 8. Core User Journey

1. Add lead.
2. Qualify lead.
3. Convert lead to client.
4. Create proposal.
5. Send proposal.
6. Client views proposal.
7. Client accepts.
8. Create project.
9. Add milestones.
10. Invite client to portal.
11. Share files and updates.
12. Communicate with client.
13. Create invoice.
14. Track payment.
15. Complete project.

This journey is the primary MVP success path.

---

# 9. Authentication

Authentication is handled by **Clerk**.

Clerk is responsible for:

- sign-in
- sign-up
- sessions
- identity
- email verification
- social authentication where configured

The local `users` table stores:

- Clerk user ID
- application profile
- user preferences
- organization membership relationships

---

# 10. Multi-Tenancy

ClientVero is organization-based multi-tenant.

Every organization owns its business records.

Core rule:

> **Every organization-owned record must carry `organization_id`.**

Examples:

- leads
- clients
- proposals
- projects
- milestones
- invoices
- payments
- files
- messages
- notifications
- activities
- AI usage

Tenant isolation is enforced on the server.

Frontend filtering is never considered sufficient authorization.

---

# 11. Organization Roles

Initial roles:

- OWNER
- ADMIN
- MEMBER

The role system uses permissions/capabilities rather than scattering role checks throughout UI code.

---

# 12. Authorization Flow

Every protected request follows:

```text
Request
  ↓
Clerk authentication
  ↓
Resolve current user
  ↓
Resolve organization membership
  ↓
Check permission
  ↓
Validate resource tenant ownership
  ↓
Execute business operation
```

A typical server operation should look like:

```text
requireOrganizationContext()
       ↓
hasPermission()
       ↓
Zod validation
       ↓
service()
       ↓
Drizzle
       ↓
Neon
```

---

# 13. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Backend

- Next.js Server Actions
- Next.js Route Handlers
- Zod
- domain service layer
- optional repository layer for complex queries

## Database

- Neon PostgreSQL
- Drizzle ORM
- Drizzle Kit

## Authentication

- Clerk

## Payments

- Stripe

## Storage

- Cloudflare R2

## Cache / Rate Limiting

- Upstash Redis

## Email

- Resend

## Analytics

- PostHog

## AI

- OpenAI API

## Deployment

- Vercel

---

# 14. Why Neon PostgreSQL

Neon is the database-first PostgreSQL choice for the architecture.

The product already has dedicated systems for:

- authentication
- file storage
- subscriptions
- email
- analytics
- caching

Therefore PostgreSQL should primarily focus on relational application data.

Neon's branching, serverless PostgreSQL architecture, and compatibility with Drizzle fit the intended development model.

---

# 15. Architecture Style

ClientVero should be a **modular monolith** for the MVP.

Do not introduce microservices prematurely.

Architecture:

```text
Next.js
├── UI
├── Server Actions
├── Route Handlers
├── Services
├── Authorization
└── Validation
        ↓
Drizzle ORM
        ↓
Neon PostgreSQL

External infrastructure:
Clerk
Stripe
Cloudflare R2
Upstash
Resend
OpenAI
PostHog
```

Separate services only when actual scale or operational requirements justify them.

---

# 16. Repository Structure

```text
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── onboarding/
│   ├── app/
│   ├── portal/
│   ├── proposal/
│   ├── invoice/
│   ├── admin/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── leads/
│   ├── clients/
│   ├── proposals/
│   ├── projects/
│   ├── invoices/
│   ├── portal/
│   └── shared/
│
├── features/
│   ├── leads/
│   ├── clients/
│   ├── proposals/
│   ├── projects/
│   ├── invoices/
│   ├── payments/
│   ├── files/
│   ├── messages/
│   ├── notifications/
│   ├── ai/
│   └── subscriptions/
│
├── server/
│   ├── auth/
│   ├── authorization/
│   ├── services/
│   ├── repositories/
│   └── actions/
│
├── db/
│   ├── index.ts
│   ├── schema/
│   └── migrations/
│
├── lib/
│   ├── clerk/
│   ├── stripe/
│   ├── r2/
│   ├── redis/
│   ├── resend/
│   ├── openai/
│   ├── posthog/
│   └── utils/
│
├── validators/
└── types/
```

---

# 17. Data Model

Core entities:

```text
users
organizations
organization_members

leads
clients
client_contacts

proposals
proposal_sections

projects
milestones

invoices
invoice_items
payments

files
messages
notifications

subscriptions
activity_logs
ai_usage
webhook_events
```

---

# 18. Database Conventions

## Primary Keys

Use UUIDs.

## Timestamps

All major entities:

```text
created_at
updated_at
```

Soft-deletable entities additionally include:

```text
deleted_at
```

## Money

Use PostgreSQL `NUMERIC`, not floating point.

## Tenant Keys

Organization-owned records contain:

```text
organization_id
```

## Public IDs

Public proposal and invoice URLs use opaque public IDs instead of internal UUIDs.

---

# 19. Database Enums

```text
organization_role
  OWNER
  ADMIN
  MEMBER

lead_status
  NEW
  QUALIFIED
  PROPOSAL_SENT
  NEGOTIATION
  WON
  LOST

proposal_status
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  DECLINED
  EXPIRED
  WITHDRAWN

project_status
  PLANNING
  IN_PROGRESS
  REVIEW
  COMPLETED
  PAUSED
  CANCELLED

milestone_status
  PENDING
  IN_PROGRESS
  COMPLETED

invoice_status
  DRAFT
  SENT
  VIEWED
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELLED

payment_status
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED

subscription_status
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELLED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  UNPAID
```

---

# 20. Drizzle Schema Starter

The accompanying implementation package contains the schema split by domain:

```text
src/db/schema/
├── common.ts
├── enums.ts
├── users.ts
├── organizations.ts
├── leads.ts
├── clients.ts
├── proposals.ts
├── projects.ts
├── invoices.ts
├── payments.ts
├── files.ts
├── messages.ts
├── notifications.ts
├── subscriptions.ts
├── activity.ts
├── ai.ts
├── webhooks.ts
├── relations.ts
└── index.ts
```

The schema starter implements:

- UUID primary keys
- organization foreign keys
- tenant-scoped indexes
- proposal/invoice public IDs
- organization-specific invoice numbering
- PostgreSQL numeric money columns
- audit/activity records
- AI usage records
- webhook idempotency records

---

# 21. Users Table

```text
users
-----
id
clerk_user_id
email
first_name
last_name
avatar_url
timezone
created_at
updated_at
```

`clerk_user_id` is unique.

---

# 22. Organizations Table

```text
organizations
-------------
id
name
slug
logo_url
website
business_type
country
currency
address
tax_id
created_at
updated_at
deleted_at
```

`slug` is unique.

---

# 23. Organization Membership

```text
organization_members
--------------------
id
organization_id
user_id
role
joined_at
created_at
updated_at
```

Constraint:

```text
UNIQUE(organization_id, user_id)
```

---

# 24. Leads

Fields:

```text
id
organization_id
assigned_to
name
email
phone
company
website
source
service
estimated_value
currency
status
notes
last_contacted_at
created_at
updated_at
deleted_at
```

Indexes:

```text
organization_id
organization_id + status
organization_id + created_at
```

---

# 25. Clients

Fields:

```text
id
organization_id
name
email
phone
company
website
address
country
notes
portal_enabled
portal_invited_at
created_at
updated_at
deleted_at
```

---

# 26. Client Contacts

```text
client_contacts
---------------
id
client_id
name
email
phone
role
is_primary
created_at
updated_at
```

Multiple contacts are supported so the client model can later accommodate agencies.

---

# 27. Lead Conversion

Lead conversion is transactional:

```text
Lead
 ↓
Create Client
 ↓
Copy relevant information
 ↓
Lead.status = WON
 ↓
Activity Log
```

No partial conversion should remain if one operation fails.

---

# 28. Proposals

Fields:

```text
id
organization_id
client_id
created_by
title
description
status
currency
subtotal
discount
tax
total
timeline
terms
expires_at
sent_at
viewed_at
accepted_at
declined_at
public_id
created_at
updated_at
deleted_at
```

---

# 29. Proposal Sections

```text
proposal_sections
-----------------
id
proposal_id
title
content
section_type
sort_order
created_at
updated_at
```

Types:

```text
INTRO
SCOPE
DELIVERABLES
TIMELINE
PRICING
TERMS
CUSTOM
```

---

# 30. Proposal Acceptance

Flow:

```text
Public proposal
 ↓
Validate public ID
 ↓
Validate status/expiration
 ↓
Transaction
 ↓
Set ACCEPTED
 ↓
Record accepted_at
 ↓
Create activity
 ↓
Create notification
 ↓
Optionally create project
```

Acceptance must be idempotent.

---

# 31. Projects

Fields:

```text
id
organization_id
client_id
proposal_id
created_by
name
description
status
budget
currency
start_date
due_date
completed_at
created_at
updated_at
deleted_at
```

---

# 32. Milestones

```text
milestones
----------
id
organization_id
project_id
name
description
status
due_date
completed_at
sort_order
created_at
updated_at
```

Project progress is calculated from completed milestones.

```text
completed milestones / total milestones × 100
```

---

# 33. Invoices

```text
invoices
--------
id
organization_id
client_id
project_id
created_by
invoice_number
status
currency
issue_date
due_date
subtotal
discount
tax
total
amount_paid
amount_due
notes
public_id
sent_at
viewed_at
paid_at
created_at
updated_at
deleted_at
```

Constraint:

```text
UNIQUE(organization_id, invoice_number)
```

---

# 34. Invoice Items

```text
invoice_items
-------------
id
invoice_id
description
quantity
unit_price
amount
sort_order
created_at
updated_at
```

---

# 35. Payments

Client invoice payments are separate from ClientVero subscription billing.

```text
payments
--------
id
organization_id
invoice_id
amount
currency
status
provider
provider_payment_id
reference
paid_at
metadata
created_at
updated_at
```

---

# 36. ClientVero Subscription

Subscription records represent the organization's ClientVero plan.

```text
subscriptions
-------------
id
organization_id
stripe_customer_id
stripe_subscription_id
plan
status
current_period_start
current_period_end
cancel_at_period_end
created_at
updated_at
```

---

# 37. Files

Metadata lives in PostgreSQL; binary objects live in Cloudflare R2.

```text
files
-----
id
organization_id
client_id
project_id
proposal_id
invoice_id
uploaded_by
name
object_key
mime_type
size_bytes
is_public
created_at
updated_at
deleted_at
```

---

# 38. Messages

MVP message model:

```text
messages
--------
id
organization_id
client_id
project_id
sender_user_id
sender_client_contact_id
content
is_read
created_at
updated_at
deleted_at
```

The sender model should enforce that a message originates from either an internal user or a client contact.

---

# 39. Notifications

```text
notifications
-------------
id
organization_id
user_id
type
title
message
resource_type
resource_id
is_read
created_at
read_at
```

---

# 40. Activity Logs

```text
activity_logs
-------------
id
organization_id
actor_user_id
actor_type
action
resource_type
resource_id
metadata
created_at
updated_at
```

Examples:

```text
LEAD_CREATED
LEAD_CONVERTED
CLIENT_CREATED
PROPOSAL_SENT
PROPOSAL_ACCEPTED
PROJECT_CREATED
MILESTONE_COMPLETED
INVOICE_SENT
PAYMENT_RECEIVED
FILE_UPLOADED
MESSAGE_SENT
```

---

# 41. AI Usage

```text
ai_usage
--------
id
organization_id
user_id
feature
model
input_tokens
output_tokens
estimated_cost
created_at
updated_at
```

This supports future usage limits and cost tracking.

---

# 42. Webhook Events

```text
webhook_events
--------------
id
provider
event_id
event_type
payload
processed_at
failed_at
error_message
created_at
updated_at
```

`event_id` is unique.

This table is the basis for idempotent webhook processing.

---

# 43. Database Relationship Map

```text
Organization
│
├── Members
├── Leads
├── Clients
│   ├── Contacts
│   ├── Projects
│   │   ├── Milestones
│   │   ├── Files
│   │   └── Messages
│   ├── Proposals
│   │   └── Proposal Sections
│   └── Invoices
│       ├── Invoice Items
│       └── Payments
│
├── Files
├── Notifications
├── Activity Logs
├── AI Usage
└── Subscription
```

---

# 44. Server Service Layer

Domain logic lives in:

```text
src/server/services/
```

Examples:

```text
lead.service.ts
client.service.ts
proposal.service.ts
project.service.ts
milestone.service.ts
invoice.service.ts
payment.service.ts
file.service.ts
message.service.ts
notification.service.ts
activity.service.ts
ai.service.ts
subscription.service.ts
```

A service should contain business rules, not React/UI concerns.

---

# 45. Server Actions

Examples:

```text
createLeadAction
updateLeadAction
convertLeadAction

createClientAction
updateClientAction

createProposalAction
sendProposalAction
withdrawProposalAction
acceptProposalAction

createProjectAction
updateProjectAction
completeMilestoneAction

createInvoiceAction
sendInvoiceAction
markInvoicePaidAction

sendMessageAction
markNotificationReadAction
```

Every action should:

1. authenticate
2. resolve organization
3. authorize
4. validate input
5. call service
6. trigger side effects

---

# 46. Validation

Use Zod for:

- forms
- Server Actions
- API inputs
- query parameters
- webhook payloads when appropriate

Example:

```text
UI
 ↓
Zod
 ↓
Server Action
 ↓
Zod again
 ↓
Authorization
 ↓
Service
```

Never trust client-side validation alone.

---

# 47. Repository Layer

A repository layer is optional for simple CRUD.

Use repositories for:

- dashboard aggregates
- complex search
- reporting
- complex joins
- reusable query logic

Pattern:

```text
Service
 ↓
Repository
 ↓
Drizzle
 ↓
Neon
```

---

# 48. Organization Context Starter

The starter includes:

```text
requireCurrentUser()
requireOrganizationContext(organizationId)
```

These helpers:

- verify Clerk authentication
- resolve the local user
- verify organization membership
- return user, organization, and membership context

---

# 49. Permission Starter

The implementation includes centralized capabilities such as:

```text
organization.read
organization.update

team.read
team.manage

leads.read
leads.create
leads.update

clients.read
clients.create
clients.update

proposals.read
proposals.create
proposals.send

projects.read
projects.create
projects.update

invoices.read
invoices.create
invoices.send

billing.read
billing.manage
```

Roles map to these capabilities.

---

# 50. Example Secure Mutation

```text
createLeadAction()
       ↓
parse organizationId
       ↓
requireOrganizationContext()
       ↓
hasPermission(leads.create)
       ↓
Zod validation
       ↓
leadService.create()
       ↓
Drizzle insert with organizationId
       ↓
Activity event
```

A client-supplied resource ID is never trusted without checking its organization.

---

# 51. Tenant Isolation Query Rule

Bad:

```sql
SELECT *
FROM clients
WHERE id = $1;
```

Correct:

```sql
SELECT *
FROM clients
WHERE id = $1
AND organization_id = $2;
```

Equivalent Drizzle queries should always carry tenant scope.

---

# 52. Client Portal

The portal is one of the product's strongest differentiators.

Clients can see:

- projects
- milestones
- progress
- invoices
- files
- messages

Clients cannot see:

- internal notes
- leads
- organization settings
- private activity
- unrelated clients
- internal-only conversations

---

# 53. Client Portal Identity

Internal users and clients are separate concepts.

Recommended MVP:

```text
Invite client
 ↓
Secure invitation token
 ↓
Verify client identity
 ↓
Create client portal session
 ↓
Resolve client
 ↓
Resolve organization
```

Authorization starts from the portal identity, not an arbitrary `client_id` sent by the browser.

---

# 54. Public Proposal

Route:

```text
/proposal/[publicId]
```

The page renders:

- business branding
- proposal title
- introduction
- scope
- deliverables
- pricing
- timeline
- terms
- acceptance action

The internal UUID is not exposed as the public identifier.

---

# 55. Public Invoice

Route:

```text
/invoice/[publicId]
```

Shows:

- business
- invoice number
- client
- dates
- line items
- totals
- payment status
- payment instructions

---

# 56. File Storage

Upload flow:

```text
Select file
 ↓
Server authorization
 ↓
Validate size/type
 ↓
Generate signed R2 upload URL
 ↓
Browser uploads directly to R2
 ↓
Save file metadata in Neon
```

Download flow:

```text
Request file
 ↓
Authorize
 ↓
Generate signed R2 URL
 ↓
Return temporary URL
```

---

# 57. Redis

Upstash Redis handles:

- rate limiting
- caching
- AI protection
- temporary state

PostgreSQL remains the source of truth.

---

# 58. Rate Limiting

Suggested starting limits:

```text
AI: 20 requests/hour/user

Messages: 60/minute/user

Public document actions: 30/minute/IP

Portal authentication: 10 attempts/15 minutes/IP
```

These are configurable starting values.

---

# 59. AI

Initial AI tools:

- proposal generation
- milestone generation
- client-update generation
- meeting/conversation summary

AI flow:

```text
UI
 ↓
Server Action
 ↓
Authentication
 ↓
Permission/plan check
 ↓
Rate limit
 ↓
OpenAI
 ↓
Track usage
 ↓
Return result
```

The browser never directly calls OpenAI.

---

# 60. Stripe

Stripe handles ClientVero's subscription billing.

Flow:

```text
Choose plan
 ↓
Stripe Checkout
 ↓
Stripe
 ↓
Webhook
 ↓
Verify signature
 ↓
Check webhook_events
 ↓
Update subscriptions
```

Browser state is never the authority for payment completion.

---

# 61. Client Payments

Client invoice payments are a separate domain from ClientVero subscription billing.

The `payments` table is designed for future payment provider integrations.

The MVP may support manual payment recording before adding online client payment processing.

---

# 62. Resend

Transactional emails:

- welcome
- client invitation
- proposal sent
- proposal accepted
- proposal declined
- invoice sent
- invoice overdue
- payment confirmation
- new message
- project update

Email sending should be hidden behind an internal service.

---

# 63. PostHog

Important events:

```text
user_signed_up
onboarding_completed
organization_created
lead_created
lead_converted
client_created
proposal_created
proposal_sent
proposal_viewed
proposal_accepted
project_created
milestone_completed
portal_invited
portal_viewed
invoice_created
invoice_sent
invoice_paid
ai_request_created
subscription_started
subscription_upgraded
subscription_cancelled
```

Do not send unnecessary sensitive client data to analytics.

---

# 64. Dashboard

Primary dashboard metrics:

- total leads
- active clients
- active projects
- pending proposals
- outstanding invoices
- revenue
- overdue invoices

Sections:

- pipeline summary
- active projects
- outstanding invoices
- recent activity
- upcoming work

Use aggregated queries rather than dozens of sequential database calls.

---

# 65. Lead Screens

```text
/app/leads
/app/leads/new
/app/leads/[id]
/app/leads/[id]/edit
```

Components:

- page header
- search
- filters
- pipeline/list toggle
- table
- pagination
- lead form
- activity timeline
- convert-to-client action

---

# 66. Client Screens

```text
/app/clients
/app/clients/new
/app/clients/[id]
/app/clients/[id]/edit
```

Client tabs:

```text
Overview
Projects
Proposals
Invoices
Payments
Files
Messages
Activity
```

---

# 67. Proposal Screens

```text
/app/proposals
/app/proposals/new
/app/proposals/[id]
/app/proposals/[id]/edit
/app/proposals/[id]/preview
```

Builder includes:

- client selector
- title
- introduction
- custom sections
- pricing
- timeline
- terms
- AI assistant
- preview
- send

---

# 68. Project Screens

```text
/app/projects
/app/projects/new
/app/projects/[id]
/app/projects/[id]/settings
```

Project sections:

- overview
- milestones
- files
- messages
- activity
- settings

---

# 69. Invoice Screens

```text
/app/invoices
/app/invoices/new
/app/invoices/[id]
/app/invoices/[id]/edit
```

Features:

- invoice creation
- line items
- tax
- discount
- due date
- preview
- send
- payment history
- manual mark-as-paid

---

# 70. Other Application Screens

```text
/app/payments
/app/files
/app/messages
/app/notifications
```

---

# 71. Settings

```text
/app/settings/profile
/app/settings/business
/app/settings/team
/app/settings/notifications
/app/settings/billing
```

---

# 72. Admin

```text
/admin
/admin/users
/admin/organizations
/admin/subscriptions
/admin/feedback
/admin/activity
```

Platform admins only.

---

# 73. Public Website

```text
/
/pricing
/product/leads
```

Landing page (`/`) sections:

```text
Navigation
Hero
Dashboard Preview
Social Proof
Problem
Solution
Feature Grid
Client Portal Showcase
How It Works
FAQ
Testimonials
Final CTA
Footer
```

FAQ answers common buying questions and must only describe capabilities within MVP scope.

Pricing lives on its own page (`/pricing`), linked from the main navigation, and renders the plans from the pricing configuration (see §95), followed by the same FAQ used on the landing page.

Product pages (`/product/*`) explain one capability in depth, are linked from the Product menu, and may only describe MVP-scope features. Other Product menu items link to their landing-page section until their page exists.

Hero message:

> **Run your entire client business from one place.**

Supporting message:

> Manage leads, proposals, projects, payments, files, and client communication without jumping between WhatsApp, email, spreadsheets, and multiple tools.

CTAs:

**Start for free**

**See how it works**

---

# 74. UI Direction

Visual personality:

- clean
- modern
- spacious
- premium SaaS
- professional
- restrained color
- rounded cards
- subtle shadows
- clear typography
- meaningful animation

Avoid an overloaded enterprise CRM appearance.

---

# 75. Core Components

Reusable components:

```text
PageHeader
SearchInput
FilterBar
DataTable
DataTablePagination
StatusBadge
EmptyState
LoadingState
ErrorState
ConfirmDialog
FormField
Modal
Drawer
Dropdown
Tabs
Avatar
ActivityTimeline
FileUploader
DatePicker
CurrencyInput
RichTextEditor
```

---

# 76. State Management

Prefer server state.

Use client state for:

- dialogs
- temporary form values
- UI filters
- editor state
- small interaction state

Do not place the entire application data model into Zustand or another global client store.

---

# 77. Data Fetching

Use Server Components for initial reads where appropriate.

```text
Server Component
 ↓
Service
 ↓
Drizzle
 ↓
Neon
```

Use Client Components only where interaction requires them.

---

# 78. Pagination

Large lists must support pagination:

- leads
- clients
- proposals
- projects
- invoices
- files
- messages
- activity

Cursor pagination is preferred at scale.

---

# 79. Search

Global search:

```text
Leads
Clients
Projects
Proposals
Invoices
```

Every search query must carry organization scope.

---

# 80. Caching

Good candidates:

- organization settings
- pricing config
- dashboard aggregates
- static marketing content

Do not aggressively cache:

- messages
- payment status
- proposal acceptance state

---

# 81. Transactions

Use PostgreSQL transactions for workflows such as:

### Lead conversion

```text
create client
update lead
create activity
```

### Proposal acceptance

```text
update proposal
create activity
create notification
```

### Payment recording

```text
create payment
update invoice
create activity
create notification
```

---

# 82. Idempotency

Required for:

- Stripe webhooks
- proposal acceptance
- payment recording
- subscription synchronization
- duplicate email callbacks

Use unique event IDs or idempotency keys.

---

# 83. Error Handling

Use structured application errors:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
RateLimitError
ExternalServiceError
DatabaseError
```

Public errors should be safe and human-readable.

Sensitive implementation details must stay server-side.

---

# 84. Financial Integrity

Rules:

- use decimal/numeric database types
- always associate money with currency
- calculate totals on the trusted server
- validate invoice item values
- make invoice/payment operations transactional where needed
- keep ClientVero subscriptions separate from client invoice payments

---

# 85. Invoice Numbering

Use organization-specific numbering.

Example:

```text
INV-0001
INV-0002
INV-0003
```

Do not generate numbers using a simple row count.

Use a concurrency-safe strategy such as a dedicated counter or PostgreSQL sequence strategy.

---

# 86. Soft Deletion

Soft-delete where recovery or history matters:

- leads
- clients
- projects
- proposals
- invoices
- files
- messages

Financial records should generally remain auditable rather than being physically removed.

---

# 87. Security Requirements

Before launch:

```text
[ ] Clerk authentication
[ ] organization membership checks
[ ] role permissions
[ ] tenant-scoped reads
[ ] tenant-scoped mutations
[ ] signed R2 URLs
[ ] public opaque IDs
[ ] webhook verification
[ ] webhook idempotency
[ ] server-side validation
[ ] rate limiting
[ ] secure secrets
[ ] XSS protections
[ ] SQL-injection-safe queries
[ ] destructive-operation confirmation
[ ] activity/audit trail
```

---

# 88. Portal Security Requirements

Client access must be resolved from authenticated portal identity.

Never authorize a client solely from:

```text
client_id
```

supplied by the browser.

Portal authorization chain:

```text
Client Identity
 ↓
Client
 ↓
Organization
 ↓
Requested Resource
```

---

# 89. File Security

R2 object keys are private by default.

Use signed URLs with expiration.

Validate:

- MIME type
- maximum size
- organization ownership
- resource association

---

# 90. Performance Requirements

Priorities:

- fast initial load
- server-side data fetching
- indexed tenant queries
- pagination
- optimized images
- direct R2 uploads
- selective caching
- minimal unnecessary client JavaScript

The experience should remain fast as an organization accumulates clients and projects.

---

# 91. Observability

Monitor:

- server errors
- database failures
- failed webhooks
- Stripe failures
- AI failures
- email failures
- authorization failures

PostHog handles product analytics, not full error monitoring.

---

# 92. Environment Separation

```text
Local
 ↓
Development
 ↓
Staging
 ↓
Production
```

Use separate database and provider credentials per environment.

Neon branches can support safe development/staging workflows.

---

# 93. Testing Strategy

## Unit

- validation
- services
- calculations
- permissions

## Integration

- database workflows
- tenant isolation
- proposal acceptance
- invoice calculations
- subscription synchronization
- webhook processing

## End-to-End

```text
Signup
Onboarding
Create Lead
Convert Client
Create Proposal
Send Proposal
Accept Proposal
Create Project
Complete Milestone
Create Invoice
Portal Access
```

---

# 94. Mandatory Tenant Tests

### Organization A requests Organization B client

Expected:

```text
Not Found / Access Denied
```

### Organization A uses Organization B project ID

Expected:

```text
Not Found / Access Denied
```

### Client A requests Client B resource

Expected:

```text
Access Denied
```

### Public proposal ID changes

Expected:

Only the intentionally public proposal is returned.

---

# 95. Subscription Plans

Initial hypothesis:

## Free

$0/month

- limited clients
- limited projects
- limited proposals
- limited invoices
- basic portal

## Pro

$5/month

- unlimited clients
- unlimited projects
- proposals
- invoices
- client portal
- AI features
- automation

## Agency

$10/month

- team members
- larger AI limits
- agency functionality
- advanced team features

Pricing should be configuration-driven.

---

# 96. Product Analytics Funnel

```text
Visitor
 ↓
Signup
 ↓
Onboarding
 ↓
First Client
 ↓
First Proposal
 ↓
Proposal Sent
 ↓
Project Created
 ↓
Invoice Created
 ↓
Portal Used
 ↓
Payment Recorded
 ↓
Paid Subscription
```

---

# 97. North Star Metric

**Active client workflows managed through ClientVero per month.**

The metric should capture meaningful business activity rather than vanity page views.

---

# 98. Validation Strategy

## Phase 1

Landing page + waitlist.

## Phase 2

Interview 30–50 potential users.

## Phase 3

Beta with approximately 20–50 users.

Measure:

- first-client activation
- proposals sent
- projects created
- invoices created
- portal adoption
- repeat usage
- willingness to pay

---

# 99. Product Hypothesis

> **Freelancers and small service businesses will pay for a simpler platform that connects their client workflow and gives their clients a professional portal.**

The client portal is therefore a core MVP capability.

---

# 100. Competitive Positioning

ClientVero should be positioned as:

**Simpler than a CRM.**

**More connected than a project-management tool.**

**More professional than WhatsApp + spreadsheets.**

**More client-friendly than internal project-management software.**

Core positioning:

> **One workspace for running your client business.**

---

# 101. Eight-Week Roadmap

## Week 1 — Foundation

- Next.js
- Clerk
- Neon
- Drizzle
- schema
- migrations
- organization architecture
- authorization
- app shell

## Week 2 — CRM

- onboarding
- leads
- clients
- client profiles
- activity

## Week 3 — Proposals

- proposal builder
- templates
- public proposal
- acceptance
- email notifications

## Week 4 — Projects

- project creation
- milestones
- progress
- project activity
- files

## Week 5 — Client Portal

- portal invitation
- portal identity
- project view
- files
- messages
- invoices

## Week 6 — Billing

- invoices
- payment tracking
- Stripe subscriptions
- plan management

## Week 7 — AI & Polish

- AI tools
- notifications
- search
- rate limiting
- caching
- UX refinement

## Week 8 — Launch Hardening

- security
- tenant testing
- performance
- responsive QA
- analytics
- error handling
- production deployment

---

# 102. Development Sequence

For each feature:

```text
1. Schema
2. Migration
3. Validation
4. Query/repository
5. Service
6. Authorization
7. Server Action/API
8. UI
9. Analytics
10. Email/notification side effects
11. Tests
```

This should be the default engineering workflow.

---

# 103. Feature Dependency Map

```text
Authentication
      ↓
Organizations
      ↓
Leads
      ↓
Clients
      ├── Proposals
      │      ↓
      │   Acceptance
      │      ↓
      │   Projects
      │      ↓
      │   Milestones
      │
      └── Invoices
             ↓
          Payments

Projects
   ↓
Client Portal
   ├── Files
   └── Messages
```

Across all domains:

```text
Authorization
Activity
Notifications
Analytics
AI
Email
Rate Limiting
```

---

# 104. Final Acceptance Criteria

## Account

- user can sign up
- user can sign in
- user can complete onboarding
- user can create organization

## Leads

- create
- update
- filter
- move status
- convert to client

## Clients

- create
- update
- view history
- add contacts
- invite to portal

## Proposals

- create
- edit
- preview
- send
- client views
- client accepts/declines

## Projects

- create
- edit
- milestones
- progress
- files
- messages

## Portal

- invitation
- authentication
- project view
- invoices
- files
- messages

## Invoices

- create
- send
- view
- track
- record payment
- calculate outstanding balance

## Billing

- subscribe
- upgrade
- downgrade
- cancel

## AI

- generate proposal
- generate milestone suggestions
- generate client update
- track AI usage

## Security

- no cross-tenant access
- portal isolation works
- protected actions require authentication
- permissions are enforced
- webhooks are verified
- file access is protected

---

# 105. Definition of Technical Completion

```text
[ ] Next.js app deployed
[ ] Clerk configured
[ ] Neon configured
[ ] Drizzle migrations working
[ ] multi-tenancy implemented
[ ] permissions implemented
[ ] leads implemented
[ ] clients implemented
[ ] proposals implemented
[ ] proposal acceptance implemented
[ ] projects implemented
[ ] milestones implemented
[ ] client portal implemented
[ ] invoices implemented
[ ] payments implemented
[ ] Stripe subscriptions implemented
[ ] R2 file storage implemented
[ ] messages implemented
[ ] notifications implemented
[ ] Resend emails implemented
[ ] Upstash rate limits implemented
[ ] AI service implemented
[ ] PostHog events implemented
[ ] tenant tests passing
[ ] production security review completed
```

---

# 106. Final Product Architecture

```text
                         CLIENTVERO
                              │
             ┌────────────────┴────────────────┐
             │                                 │
       Public Website                    Authenticated App
             │                                 │
             │                       ┌─────────┴──────────┐
             │                       │                    │
             │                   Workspace            Portal
             │                       │                    │
             │              ┌────────┼────────┐          │
             │              │        │        │          │
             │            Leads    Clients   Projects     │
             │                       │        │           │
             │                       │        ├── Milestones
             │                       │        ├── Files
             │                       │        └── Messages
             │                       │
             │              ┌────────┴────────┐
             │              │                 │
             │          Proposals          Invoices
             │              │                 │
             │        Acceptance          Payments
             │
             └───────────────────────────────────────────

                         NEXT.JS BACKEND
                                │
                ┌───────────────┼────────────────┐
                │               │                │
             Actions         Services       Authorization
                │               │                │
                └───────────────┼────────────────┘
                                │
                             Drizzle
                                │
                         Neon PostgreSQL
                                │
       ┌─────────────┬──────────┼──────────┬─────────────┐
       │             │          │          │             │
     Clerk        Stripe       R2       Upstash       Resend
                                              │
                                           OpenAI
                                              │
                                           PostHog

                              Vercel
```

---

# 107. Long-Term Roadmap

## Phase 2

- contracts
- e-signatures
- recurring invoices
- online client payments
- automated reminders
- advanced portal
- tasks
- comments
- recurring projects

## Phase 3

- advanced CRM
- automation rules
- email integrations
- calendar integration
- time tracking
- expenses
- reports
- team management

## Phase 4

- AI workflow assistant
- intelligent follow-ups
- AI lead qualification
- AI project summaries
- predictive business insights

## Phase 5

- mobile apps
- marketplace
- advanced agency features
- enterprise functionality

---

# 108. Long-Term AI Vision

The goal is not to add a generic chatbot.

ClientVero should eventually understand the user's client business.

Examples:

> "Follow up with all leads I haven't contacted in 7 days."

> "Summarize everything that happened with Acme this month."

> "Create a project plan from this accepted proposal."

> "Which invoices are likely to become overdue?"

> "Draft updates for clients whose projects are delayed."

This creates an AI layer across the workflow.

---

# 109. Definition of Product Success

ClientVero is successful when a user can genuinely say:

> **"I don't need WhatsApp, Google Docs, spreadsheets, Notion, and separate tools just to manage my clients anymore."**

The product must make the following loop feel natural:

**Lead → Client → Proposal → Project → Portal → Invoice → Payment → Completion**

---

# 110. Implementation Starter Included

The accompanying starter package contains:

```text
README.md
package.json
drizzle.config.ts
.env.example

src/db/index.ts

src/db/schema/
├── common.ts
├── enums.ts
├── users.ts
├── organizations.ts
├── leads.ts
├── clients.ts
├── proposals.ts
├── projects.ts
├── invoices.ts
├── payments.ts
├── files.ts
├── messages.ts
├── notifications.ts
├── subscriptions.ts
├── activity.ts
├── ai.ts
├── webhooks.ts
├── relations.ts
└── index.ts

src/server/auth/
├── current-user.ts
└── organization.ts

src/server/authorization/
└── permissions.ts

src/server/services/
└── lead.service.ts

src/server/actions/
└── create-lead.ts

src/validators/
└── leads.ts
```

This starter establishes the intended conventions for expanding the remaining feature domains.

---

# 111. Final Engineering Rule

The most important rule in the entire implementation is:

> **No business operation should be allowed to bypass authentication, tenant resolution, authorization, validation, and server-side business logic.**

The second most important rule is:

> **PostgreSQL is the source of truth for business data; Redis is not.**

The third is:

> **ClientVero subscription billing and client project payments are separate domains.**

The fourth is:

> **The client portal must be treated as a first-class product surface, not an afterthought.**

---

# 112. Final MVP Stack

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
Framer Motion

Next.js Server Actions
Route Handlers
Zod

Neon PostgreSQL
Drizzle ORM

Clerk
Stripe
Cloudflare R2
Upstash Redis
Resend
PostHog
OpenAI
Vercel
```

---

# 113. Final Decision

ClientVero should launch as a focused, polished, multi-tenant modular monolith.

Build the complete client workflow first.

Do not overbuild accounting, advanced CRM automation, native mobile apps, or autonomous AI before validating that users repeatedly depend on the core workflow.

The MVP should optimize for:

**simple setup → fast activation → complete client workflow → excellent portal experience → recurring usage → willingness to pay.**


---

# Part II — Agent Build Instructions

## 1. Mission
Build ClientVero as a production-ready, polished SaaS MVP according to Part I. Prioritize the complete workflow: Lead → Client → Proposal → Project → Client Portal → Invoice → Payment → Completion.

## 2. Non-Negotiable Rules
- Use Next.js + TypeScript and keep the MVP as a modular monolith.
- Use Neon PostgreSQL as the source of truth and Drizzle ORM for database access.
- Use Clerk for authentication, with a local users table and organization memberships.
- Every organization-owned record must be scoped by organization_id and checked server-side.
- Every protected mutation must authenticate, resolve organization, authorize, validate, execute service logic, and then trigger side effects.
- Never authorize a resource solely from a client-supplied ID without tenant validation.
- Keep ClientVero subscription billing separate from client project invoice payments.
- Keep R2 private by default and use signed URLs for file access.
- Keep OpenAI calls server-side and rate-limited; track AI usage.
- Use idempotency for Stripe webhooks and other retriable workflow operations.
- Do not move the entire application state into a global client store.
- Do not add microservices unless actual scale or operational requirements justify the split.

## 3. Delivery Order

1. Foundation and environment configuration
2. Database schema and migrations
3. Clerk user/org provisioning and authorization
4. Application shell and onboarding
5. Leads and clients
6. Proposals and public proposal acceptance
7. Projects and milestones
8. Client portal
9. Invoices and payment tracking
10. Files and messaging
11. Notifications and email
12. Stripe subscriptions
13. AI helpers
14. Search, caching, rate limiting, analytics
15. Testing, security hardening, responsive QA, deployment

## 4. Definition of Done
A feature is not done until its schema, validation, authorization, service logic, UI, side effects, analytics, error states, and tests are implemented where applicable.

---

# Part III — Implementation Starter Source

The following source files are included as starter implementation patterns. Preserve their intent and extend them consistently.

## `.env.example`

```dotenv
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

OPENAI_API_KEY=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## `README.md`

```markdown
# ClientVero MVP Technical Starter

This starter is the implementation appendix for the ClientVero PRD.

## Stack

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Drizzle ORM
- Clerk
- Tailwind CSS
- shadcn/ui
- Stripe
- Cloudflare R2
- Upstash Redis
- Resend
- PostHog
- OpenAI

## Suggested setup

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run dev
```

The starter intentionally keeps business logic in services and uses organization-scoped queries.

## Important

The schema is an MVP foundation, not a final production migration. Review constraints, indexes, retention policies, and provider-specific configuration before production deployment.

## Schema notes

`src/db/schema/relations.ts` provides the Drizzle relations required by relational queries such as organization membership lookups.
```

## `drizzle.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## `package.json`

```json
{
  "name": "clientvero",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@clerk/nextjs": "latest",
    "@neondatabase/serverless": "latest",
    "@opentelemetry/api": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "drizzle-orm": "latest",
    "next": "latest",
    "openai": "latest",
    "posthog-js": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-hook-form": "latest",
    "resend": "latest",
    "stripe": "latest",
    "tailwind-merge": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "latest",
    "typescript": "latest"
  }
}
```

## `src/db/index.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
```

## `src/db/schema/activity.ts`

```typescript
import { index, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";
import { organizations } from "./organizations";
import { users } from "./users";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorType: varchar("actor_type", { length: 40 }).notNull().default("USER"),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 80 }).notNull(),
    resourceId: uuid("resource_id").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => ({
    orgCreatedIdx: index("activity_logs_org_created_idx").on(table.organizationId, table.createdAt),
    resourceIdx: index("activity_logs_resource_idx").on(table.resourceType, table.resourceId),
  }),
);
```

## `src/db/schema/ai.ts`

```typescript
import { integer, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";
import { organizations } from "./organizations";
import { users } from "./users";

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    feature: varchar("feature", { length: 80 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    estimatedCost: numeric("estimated_cost", { precision: 14, scale: 6 }),
    ...timestamps,
  },
);
```

## `src/db/schema/clients.ts`

```typescript
import { index, pgTable, text, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { organizations } from "./organizations";

export const clients = pgTable(
  "clients",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 200 }),
    website: text("website"),
    address: text("address"),
    country: varchar("country", { length: 120 }),
    notes: text("notes"),
    portalEnabled: boolean("portal_enabled").notNull().default(false),
    portalInvitedAt: timestamp("portal_invited_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgIdx: index("clients_org_idx").on(table.organizationId),
    orgEmailIdx: index("clients_org_email_idx").on(table.organizationId, table.email),
    orgCreatedIdx: index("clients_org_created_idx").on(table.organizationId, table.createdAt),
  }),
);

export const clientContacts = pgTable("client_contacts", {
  id: id(),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  role: varchar("role", { length: 120 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  ...timestamps,
});
```

## `src/db/schema/common.ts`

```typescript
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () => uuid("id").defaultRandom().primaryKey();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};
```

## `src/db/schema/enums.ts`

```typescript
import { pgEnum } from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "NEW",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "WITHDRAWN",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "PAUSED",
  "CANCELLED",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "SENT",
  "VIEWED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "INCOMPLETE",
  "INCOMPLETE_EXPIRED",
  "UNPAID",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "PROPOSAL_ACCEPTED",
  "PROPOSAL_DECLINED",
  "INVOICE_SENT",
  "INVOICE_VIEWED",
  "INVOICE_OVERDUE",
  "PAYMENT_RECEIVED",
  "MESSAGE_RECEIVED",
  "MILESTONE_COMPLETED",
  "PROJECT_DEADLINE",
  "GENERAL",
]);
```

## `src/db/schema/files.ts`

```typescript
import { bigint, boolean, index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { organizations } from "./organizations";
import { clients } from "./clients";
import { projects } from "./projects";
import { proposals } from "./proposals";
import { invoices } from "./invoices";
import { users } from "./users";

export const files = pgTable(
  "files",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 500 }).notNull(),
    objectKey: text("object_key").notNull(),
    mimeType: varchar("mime_type", { length: 160 }),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    isPublic: boolean("is_public").notNull().default(false),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgIdx: index("files_org_idx").on(table.organizationId),
    projectIdx: index("files_project_idx").on(table.projectId),
    clientIdx: index("files_client_idx").on(table.clientId),
  }),
);
```

## `src/db/schema/index.ts`

```typescript
export * from "./common";
export * from "./enums";
export * from "./users";
export * from "./organizations";
export * from "./leads";
export * from "./clients";
export * from "./proposals";
export * from "./projects";
export * from "./invoices";
export * from "./payments";
export * from "./files";
export * from "./messages";
export * from "./notifications";
export * from "./subscriptions";
export * from "./activity";
export * from "./ai";
export * from "./webhooks";export * from "./relations";
```

## `src/db/schema/invoices.ts`

```typescript
import { index, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar, integer, date } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { invoiceStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { clients } from "./clients";
import { projects } from "./projects";
import { users } from "./users";

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    invoiceNumber: varchar("invoice_number", { length: 60 }).notNull(),
    status: invoiceStatusEnum("status").notNull().default("DRAFT"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 14, scale: 2 }).notNull().default("0"),
    tax: numeric("tax", { precision: 14, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    amountPaid: numeric("amount_paid", { precision: 14, scale: 2 }).notNull().default("0"),
    amountDue: numeric("amount_due", { precision: 14, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    publicId: varchar("public_id", { length: 80 }).notNull().unique(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgInvoiceNumberIdx: uniqueIndex("invoices_org_invoice_number_uidx")
      .on(table.organizationId, table.invoiceNumber),
    orgStatusIdx: index("invoices_org_status_idx").on(table.organizationId, table.status),
    clientIdx: index("invoices_client_idx").on(table.clientId),
    dueDateIdx: index("invoices_due_date_idx").on(table.organizationId, table.dueDate),
  }),
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: id(),
    invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull().default("1"),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull().default("0"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    invoiceSortIdx: index("invoice_items_invoice_sort_idx").on(table.invoiceId, table.sortOrder),
  }),
);
```

## `src/db/schema/leads.ts`

```typescript
import { index, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { leadStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const leads = pgTable(
  "leads",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 200 }),
    website: text("website"),
    source: varchar("source", { length: 100 }),
    service: varchar("service", { length: 160 }),
    estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    status: leadStatusEnum("status").notNull().default("NEW"),
    notes: text("notes"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgIdx: index("leads_org_idx").on(table.organizationId),
    orgStatusIdx: index("leads_org_status_idx").on(table.organizationId, table.status),
    orgCreatedIdx: index("leads_org_created_idx").on(table.organizationId, table.createdAt),
  }),
);
```

## `src/db/schema/messages.ts`

```typescript
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { organizations } from "./organizations";
import { clients, clientContacts } from "./clients";
import { projects } from "./projects";
import { users } from "./users";

export const messages = pgTable(
  "messages",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    senderUserId: uuid("sender_user_id").references(() => users.id, { onDelete: "set null" }),
    senderClientContactId: uuid("sender_client_contact_id").references(() => clientContacts.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").notNull().default(false), 
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgClientIdx: index("messages_org_client_idx").on(table.organizationId, table.clientId),
    projectIdx: index("messages_project_idx").on(table.projectId),
  }),
);
```

## `src/db/schema/notifications.ts`

```typescript
import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id } from "./common";
import { notificationTypeEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    message: text("message").notNull(),
    resourceType: varchar("resource_type", { length: 80 }),
    resourceId: uuid("resource_id"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => ({
    userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.isRead),
    orgCreatedIdx: index("notifications_org_created_idx").on(table.organizationId, table.createdAt),
  }),
);
```

## `src/db/schema/organizations.ts`

```typescript
import { pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { organizationRoleEnum } from "./enums";
import { users } from "./users";

export const organizations = pgTable("organizations", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  logoUrl: text("logo_url"),
  website: text("website"),
  businessType: varchar("business_type", { length: 120 }),
  country: varchar("country", { length: 120 }),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  address: text("address"),
  taxId: varchar("tax_id", { length: 120 }),
  ...timestamps,
  ...softDelete,
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").notNull().default("MEMBER"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => ({
    organizationUserUnique: uniqueIndex("organization_members_org_user_uidx")
      .on(table.organizationId, table.userId),
  }),
);
```

## `src/db/schema/payments.ts`

```typescript
import { index, jsonb, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";
import { paymentStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { invoices } from "./invoices";

export const payments = pgTable(
  "payments",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    provider: varchar("provider", { length: 40 }),
    providerPaymentId: varchar("provider_payment_id", { length: 160 }),
    reference: varchar("reference", { length: 160 }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => ({
    orgIdx: index("payments_org_idx").on(table.organizationId),
    invoiceIdx: index("payments_invoice_idx").on(table.invoiceId),
    providerPaymentIdx: index("payments_provider_payment_idx").on(table.providerPaymentId),
  }),
);
```

## `src/db/schema/projects.ts`

```typescript
import { index, numeric, pgTable, text, timestamp, uuid, varchar, integer, date } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { projectStatusEnum, milestoneStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { clients } from "./clients";
import { proposals } from "./proposals";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
    proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 240 }).notNull(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("PLANNING"),
    budget: numeric("budget", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    startDate: date("start_date"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgIdx: index("projects_org_idx").on(table.organizationId),
    orgStatusIdx: index("projects_org_status_idx").on(table.organizationId, table.status),
    clientIdx: index("projects_client_idx").on(table.clientId),
    dueDateIdx: index("projects_due_date_idx").on(table.organizationId, table.dueDate),
  }),
);

export const milestones = pgTable(
  "milestones",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 240 }).notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("PENDING"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    projectSortIdx: index("milestones_project_sort_idx").on(table.projectId, table.sortOrder),
    orgStatusIdx: index("milestones_org_status_idx").on(table.organizationId, table.status),
  }),
);
```

## `src/db/schema/proposals.ts`

```typescript
import { index, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { id, timestamps, softDelete } from "./common";
import { proposalStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { clients } from "./clients";
import { users } from "./users";

export const proposals = pgTable(
  "proposals",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    status: proposalStatusEnum("status").notNull().default("DRAFT"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 14, scale: 2 }).notNull().default("0"),
    tax: numeric("tax", { precision: 14, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    timeline: text("timeline"),
    terms: text("terms"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    declinedAt: timestamp("declined_at", { withTimezone: true }),
    publicId: varchar("public_id", { length: 80 }).notNull().unique(),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    orgIdx: index("proposals_org_idx").on(table.organizationId),
    orgStatusIdx: index("proposals_org_status_idx").on(table.organizationId, table.status),
    clientIdx: index("proposals_client_idx").on(table.clientId),
  }),
);

export const proposalSections = pgTable(
  "proposal_sections",
  {
    id: id(),
    proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    content: text("content"),
    sectionType: varchar("section_type", { length: 40 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    proposalSortIdx: index("proposal_sections_proposal_sort_idx").on(table.proposalId, table.sortOrder),
  }),
);
```

## `src/db/schema/relations.ts`

```typescript
import { relations } from "drizzle-orm";
import { users } from "./users";
import { organizations, organizationMembers } from "./organizations";
import { leads } from "./leads";
import { clients, clientContacts } from "./clients";
import { proposals, proposalSections } from "./proposals";
import { projects, milestones } from "./projects";
import { invoices, invoiceItems } from "./invoices";
import { payments } from "./payments";
import { files } from "./files";
import { messages } from "./messages";
import { notifications } from "./notifications";
import { subscriptions } from "./subscriptions";
import { activityLogs } from "./activity";
import { aiUsage } from "./ai";

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  leads: many(leads),
  clients: many(clients),
  proposals: many(proposals),
  projects: many(projects),
  invoices: many(invoices),
  files: many(files),
  messages: many(messages),
  notifications: many(notifications),
  subscription: one(subscriptions),
  activityLogs: many(activityLogs),
  aiUsage: many(aiUsage),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  contacts: many(clientContacts),
  proposals: many(proposals),
  projects: many(projects),
  invoices: many(invoices),
  files: many(files),
  messages: many(messages),
}));

export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
  client: one(clients, {
    fields: [clientContacts.clientId],
    references: [clients.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [proposals.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [proposals.createdBy],
    references: [users.id],
  }),
  sections: many(proposalSections),
}));

export const proposalSectionsRelations = relations(proposalSections, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalSections.proposalId],
    references: [proposals.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  proposal: one(proposals, {
    fields: [projects.proposalId],
    references: [proposals.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  milestones: many(milestones),
  invoices: many(invoices),
  files: many(files),
  messages: many(messages),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  organization: one(organizations, {
    fields: [milestones.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
  files: many(files),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organizationId],
    references: [organizations.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, {
    fields: [files.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [files.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  proposal: one(proposals, {
    fields: [files.proposalId],
    references: [proposals.id],
  }),
  invoice: one(invoices, {
    fields: [files.invoiceId],
    references: [invoices.id],
  }),
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  organization: one(organizations, {
    fields: [messages.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [messages.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  senderUser: one(users, {
    fields: [messages.senderUserId],
    references: [users.id],
  }),
  senderClientContact: one(clientContacts, {
    fields: [messages.senderClientContactId],
    references: [clientContacts.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [activityLogs.actorUserId],
    references: [users.id],
  }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiUsage.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [aiUsage.userId],
    references: [users.id],
  }),
}));
```

## `src/db/schema/subscriptions.ts`

```typescript
import { boolean, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";
import { subscriptionStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 160 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 160 }).unique(),
    plan: varchar("plan", { length: 60 }).notNull().default("FREE"),
    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    orgUnique: uniqueIndex("subscriptions_org_uidx").on(table.organizationId),
  }),
);
```

## `src/db/schema/users.ts`

```typescript
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";

export const users = pgTable("users", {
  id: id(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 100 }),
  ...timestamps,
});
```

## `src/db/schema/webhooks.ts`

```typescript
import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./common";

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: id(),
    provider: varchar("provider", { length: 40 }).notNull(),
    eventId: varchar("event_id", { length: 240 }).notNull().unique(),
    eventType: varchar("event_type", { length: 160 }).notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    ...timestamps,
  },
  (table) => ({
    providerIdx: index("webhook_events_provider_idx").on(table.provider),
  }),
);
```

## `src/server/actions/create-lead.ts`

```typescript
 "use server";

import { hasPermission, permissions } from "@/server/authorization/permissions";
import { requireOrganizationContext } from "@/server/auth/organization";
import { createLeadSchema } from "@/validators/leads";
import { createLead } from "@/server/services/lead.service";

export async function createLeadAction(input: unknown) {
  const parsed = createLeadSchema.parse(input);
  const context = await requireOrganizationContext(parsed.organizationId);

  if (!hasPermission(context.membership.role, permissions.leadsCreate)) {
    throw new Error("FORBIDDEN");
  }

  return createLead(parsed);
}
```

## `src/server/auth/current-user.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function requireCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!existing) {
    throw new Error("USER_NOT_PROVISIONED");
  }

  return existing;
}
```

## `src/server/auth/organization.ts`

```typescript
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { users } from "@/db/schema/users";

export async function requireOrganizationContext(organizationId: string) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("UNAUTHENTICATED");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("USER_NOT_PROVISIONED");
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, user.id),
    ),
    with: {
      organization: true,
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    organization: membership.organization,
    membership,
  };
}
```

## `src/server/authorization/permissions.ts`

```typescript
export const permissions = {
  organizationRead: "organization.read",
  organizationUpdate: "organization.update",
  teamRead: "team.read",
  teamManage: "team.manage",
  leadsRead: "leads.read",
  leadsCreate: "leads.create",
  leadsUpdate: "leads.update",
  clientsRead: "clients.read",
  clientsCreate: "clients.create",
  clientsUpdate: "clients.update",
  proposalsRead: "proposals.read",
  proposalsCreate: "proposals.create",
  proposalsSend: "proposals.send",
  projectsRead: "projects.read",
  projectsCreate: "projects.create",
  projectsUpdate: "projects.update",
  invoicesRead: "invoices.read",
  invoicesCreate: "invoices.create",
  invoicesSend: "invoices.send",
  billingRead: "billing.read",
  billingManage: "billing.manage",
} as const;

const rolePermissions = {
  OWNER: new Set(Object.values(permissions)),
  ADMIN: new Set([
    permissions.organizationRead,
    permissions.organizationUpdate,
    permissions.teamRead,
    permissions.teamManage,
    permissions.leadsRead,
    permissions.leadsCreate,
    permissions.leadsUpdate,
    permissions.clientsRead,
    permissions.clientsCreate,
    permissions.clientsUpdate,
    permissions.proposalsRead,
    permissions.proposalsCreate,
    permissions.proposalsSend,
    permissions.projectsRead,
    permissions.projectsCreate,
    permissions.projectsUpdate,
    permissions.invoicesRead,
    permissions.invoicesCreate,
    permissions.invoicesSend,
    permissions.billingRead,
    permissions.billingManage,
  ]),
  MEMBER: new Set([
    permissions.organizationRead,
    permissions.teamRead,
    permissions.leadsRead,
    permissions.leadsCreate,
    permissions.leadsUpdate,
    permissions.clientsRead,
    permissions.clientsCreate,
    permissions.clientsUpdate,
    permissions.proposalsRead,
    permissions.proposalsCreate,
    permissions.proposalsSend,
    permissions.projectsRead,
    permissions.projectsCreate,
    permissions.projectsUpdate,
    permissions.invoicesRead,
    permissions.invoicesCreate,
    permissions.invoicesSend,
  ]),
} as const;

export function hasPermission(
  role: keyof typeof rolePermissions,
  permission: string,
) {
  return rolePermissions[role].has(permission);
}
```

## `src/server/services/lead.service.ts`

```typescript
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { createLeadSchema } from "@/validators/leads";

export async function listLeads(organizationId: string) {
  return db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.organizationId, organizationId),
        isNull(leads.deletedAt),
      ),
    )
    .orderBy(desc(leads.createdAt));
}

export async function createLead(input: unknown) {
  const data = createLeadSchema.parse(input);

  const [lead] = await db
    .insert(leads)
    .values({
      organizationId: data.organizationId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      website: data.website || null,
      source: data.source || null,
      service: data.service || null,
      estimatedValue:
        data.estimatedValue === undefined ? null : data.estimatedValue.toFixed(2),
      currency: data.currency?.toUpperCase() || "USD",
      notes: data.notes || null,
    })
    .returning();

  return lead;
}
```

## `src/validators/leads.ts`

```typescript
import { z } from "zod";

export const createLeadSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  company: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  source: z.string().max(100).optional(),
  service: z.string().max(160).optional(),
  estimatedValue: z.coerce.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().max(5000).optional(),
});
```

---

# Part IV — Agent Checklist

- [ ] Read this entire file before modifying architecture.
- [ ] Use the existing starter schema and relation patterns as the baseline.
- [ ] Implement the remaining schema/service/action/UI domains in the same conventions.
- [ ] Add database migrations and seed data.
- [ ] Implement Clerk provisioning and organization onboarding.
- [ ] Implement server-side permissions for every domain.
- [ ] Build the complete primary workflow end-to-end before polishing secondary features.
- [ ] Add tenant-isolation tests before production deployment.
- [ ] Add Stripe webhook idempotency and subscription synchronization.
- [ ] Add signed R2 file upload/download flows.
- [ ] Add Resend transactional email templates.
- [ ] Add Upstash rate limiting and caching where specified.
- [ ] Add PostHog business events without sending unnecessary sensitive client data.
- [ ] Keep financial calculations server-side and use decimal database types.
- [ ] Finish responsive UX and empty/loading/error states across the app.
- [ ] Do a final security and production-readiness review before launch.
