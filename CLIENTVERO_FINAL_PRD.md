# ClientVero — Final Product Requirements Document & Technical Implementation Specification

**Version:** 1.0  
**Status:** MVP Specification  
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
