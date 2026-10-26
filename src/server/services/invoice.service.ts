import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoiceItems, invoices, organizations, projects, type Invoice, type InvoiceItem } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import type { InvoicePrefill } from "@/features/invoices/builder-values";
import { businessParty, clientParty, type InvoiceDocumentData } from "@/features/invoices/invoice-document";
import { canCancel, canDelete, canEdit, editableInvoiceStatuses } from "@/features/invoices/invoice-status";
import { invoiceTotals } from "@/lib/utils/money";
import { generatePublicId } from "@/lib/utils/public-id";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { getClient } from "@/server/services/client.service";
import { invoiceActivity } from "@/server/services/invoice-activity";
import { requireWithinPlan } from "@/server/services/plan-limit.service";
import { requireProject } from "@/server/services/project.service";
import type { InvoiceFormInput } from "@/validators/invoices";

export type InvoiceDetail = Invoice & {
  items: InvoiceItem[];
  clientName: string;
  projectName: string | null;
  document: InvoiceDocumentData;
};

const invoiceMissing = "This invoice no longer exists.";
const lockedMessage = "Invoices with payments can't be edited.";

function invoiceScope(organizationId: string, invoiceId: string) {
  return and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId), isNull(invoices.deletedAt));
}

function actor(ctx: WorkspaceActor) {
  return { organizationId: ctx.organization.id, actorUserId: ctx.user.id };
}

export function lockInvoice(invoiceId: string) {
  return db.execute(sql`select pg_advisory_xact_lock(hashtext(${invoiceId}))`);
}

function nextInvoiceNumber(organizationId: string) {
  const sequence = organizations.invoiceSequence;

  return sql<string>`(
    select 'INV-' || case when ${sequence} < 10000 then lpad(${sequence}::text, 4, '0') else ${sequence}::text end
    from ${organizations} where ${organizations.id} = ${organizationId}
  )`;
}

function invoiceValues(input: InvoiceFormInput) {
  const { subtotal, total } = invoiceTotals(input);

  return {
    clientId: input.clientId,
    projectId: input.projectId,
    currency: input.currency,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    subtotal,
    discount: input.discount,
    total,
    amountDue: total,
    notes: input.notes,
    paymentInstructions: input.paymentInstructions,
  };
}

function itemRows(organizationId: string, invoiceId: string, input: InvoiceFormInput) {
  const { amounts } = invoiceTotals(input);

  return input.items.map((item, index) => ({
    organizationId,
    invoiceId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: amounts[index],
    sortOrder: index,
  }));
}

function insertItemsWhen(rows: ReturnType<typeof itemRows>, condition: ReturnType<typeof sql>) {
  const values = sql.join(
    rows.map(
      (row) =>
        sql`(${row.organizationId}::uuid, ${row.invoiceId}::uuid, ${row.description}, ${row.quantity}::numeric, ${row.unitPrice}::numeric, ${row.amount}::numeric, ${row.sortOrder}::int)`,
    ),
    sql`, `,
  );

  return db.execute(sql`
    insert into ${invoiceItems} (organization_id, invoice_id, description, quantity, unit_price, amount, sort_order)
    select * from (values ${values}) as lines
    where ${condition}
  `);
}

function ignoreNotFound(error: unknown): null {
  if (error instanceof NotFoundError) return null;
  throw error;
}

function orInvalid<T>(promise: Promise<T>, message: string): Promise<T> {
  return promise.catch((error: unknown) => {
    throw error instanceof NotFoundError ? new ValidationError(message) : error;
  });
}

async function requireBillingTarget(organizationId: string, input: Pick<InvoiceFormInput, "clientId" | "projectId">) {
  await orInvalid(getClient(organizationId, input.clientId), "Choose a client from your workspace.");
  if (!input.projectId) return;

  const project = await orInvalid(requireProject(organizationId, input.projectId), "Choose a project from your workspace.");
  if (project.clientId !== input.clientId) {
    throw new ValidationError("That project belongs to a different client.");
  }
}

export async function getInvoice(organizationId: string, invoiceId: string): Promise<InvoiceDetail> {
  const [row] = await db
    .select({
      invoice: invoices,
      client: { name: clients.name, company: clients.company, email: clients.email, address: clients.address, country: clients.country },
      business: {
        name: organizations.name,
        slug: organizations.slug,
        logoKey: organizations.logoKey,
        address: organizations.address,
        website: organizations.website,
      },
      projectName: projects.name,
    })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .innerJoin(organizations, eq(organizations.id, invoices.organizationId))
    .leftJoin(projects, eq(projects.id, invoices.projectId))
    .where(invoiceScope(organizationId, invoiceId))
    .limit(1);

  if (!row) {
    throw new NotFoundError(invoiceMissing);
  }

  const items = await listInvoiceItems(organizationId, invoiceId);

  return {
    ...row.invoice,
    items,
    clientName: row.client.name,
    projectName: row.projectName,
    document: toDocument(row.invoice, items, businessParty(row.business), clientParty(row.client)),
  };
}

export function listInvoiceItems(organizationId: string, invoiceId: string): Promise<InvoiceItem[]> {
  return db
    .select()
    .from(invoiceItems)
    .where(and(eq(invoiceItems.organizationId, organizationId), eq(invoiceItems.invoiceId, invoiceId)))
    .orderBy(asc(invoiceItems.sortOrder));
}

export function toDocument(
  invoice: Invoice,
  items: InvoiceItem[],
  business: InvoiceDocumentData["business"],
  client: InvoiceDocumentData["client"],
): InvoiceDocumentData {
  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    items: items.map(({ description, quantity, unitPrice, amount }) => ({ description, quantity, unitPrice, amount })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    notes: invoice.notes,
    paymentInstructions: invoice.paymentInstructions,
    business,
    client,
  };
}

export async function getInvoicePrefill(
  organizationId: string,
  currency: string,
  target: { clientId: string | null; projectId: string | null },
): Promise<InvoicePrefill> {
  const [project, latest] = await Promise.all([
    target.projectId ? requireProject(organizationId, target.projectId).catch(ignoreNotFound) : null,
    db
      .select({ paymentInstructions: invoices.paymentInstructions })
      .from(invoices)
      .where(and(eq(invoices.organizationId, organizationId), isNotNull(invoices.paymentInstructions)))
      .orderBy(desc(invoices.createdAt))
      .limit(1),
  ]);
  const paymentInstructions = latest[0]?.paymentInstructions ?? "";

  if (project) {
    return { clientId: project.clientId, projectId: project.id, currency: project.currency, paymentInstructions, firstLine: project.name };
  }

  const client = target.clientId ? await getClient(organizationId, target.clientId).catch(ignoreNotFound) : null;
  return { clientId: client?.id ?? "", projectId: "", currency, paymentInstructions, firstLine: "" };
}

export async function createInvoice(ctx: WorkspaceActor, input: InvoiceFormInput): Promise<string> {
  const organizationId = ctx.organization.id;
  await requireBillingTarget(organizationId, input);
  await requireWithinPlan(ctx, "invoicesPerMonth");
  const invoiceId = randomUUID();

  await db.batch([
    db
      .update(organizations)
      .set({ invoiceSequence: sql`${organizations.invoiceSequence} + 1` })
      .where(eq(organizations.id, organizationId)),
    db.insert(invoices).values({
      ...invoiceValues(input),
      id: invoiceId,
      organizationId,
      createdBy: ctx.user.id,
      invoiceNumber: nextInvoiceNumber(organizationId),
      publicId: generatePublicId(),
    }),
    db.insert(invoiceItems).values(itemRows(organizationId, invoiceId, input)),
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoiceCreated),
  ]);

  return invoiceId;
}

export async function updateInvoice(ctx: WorkspaceActor, invoiceId: string, input: InvoiceFormInput): Promise<void> {
  const organizationId = ctx.organization.id;
  const invoice = await getInvoice(organizationId, invoiceId);

  if (!canEdit(invoice)) {
    throw new ConflictError(lockedMessage);
  }

  await requireBillingTarget(organizationId, input);
  const updatedAt = new Date();
  const wasUpdated = sql`exists (select 1 from ${invoices} where ${invoices.id} = ${invoiceId} and ${invoices.updatedAt} = ${updatedAt})`;

  const [, [updated]] = await db.batch([
    lockInvoice(invoiceId),
    db
      .update(invoices)
      .set({ ...invoiceValues(input), updatedAt })
      .where(
        and(
          invoiceScope(organizationId, invoiceId),
          inArray(invoices.status, [...editableInvoiceStatuses]),
          eq(invoices.amountPaid, "0"),
        ),
      )
      .returning({ id: invoices.id }),
    db
      .delete(invoiceItems)
      .where(and(eq(invoiceItems.organizationId, organizationId), eq(invoiceItems.invoiceId, invoiceId), wasUpdated)),
    insertItemsWhen(itemRows(organizationId, invoiceId, input), wasUpdated),
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoiceUpdated, { when: sql`${invoices.updatedAt} = ${updatedAt}` }),
  ]);

  if (!updated) {
    throw new ConflictError(lockedMessage);
  }
}

export async function sendInvoice(ctx: WorkspaceActor, invoiceId: string): Promise<string> {
  const sentAt = new Date();

  const [[sent]] = await db.batch([
    db
      .update(invoices)
      .set({ status: "SENT", sentAt, amountDue: sql`${invoices.total} - ${invoices.amountPaid}` })
      .where(and(invoiceScope(ctx.organization.id, invoiceId), eq(invoices.status, "DRAFT")))
      .returning({ publicId: invoices.publicId }),
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoiceSent, { when: sql`${invoices.sentAt} = ${sentAt}` }),
  ]);

  if (!sent) {
    await getInvoice(ctx.organization.id, invoiceId);
    throw new ConflictError("This invoice has already been sent.");
  }

  return sent.publicId;
}

export async function cancelInvoice(ctx: WorkspaceActor, invoiceId: string): Promise<void> {
  const invoice = await getInvoice(ctx.organization.id, invoiceId);

  if (!canCancel(invoice)) {
    throw new ConflictError("Only sent invoices without payments can be cancelled.");
  }

  const cancelledAt = new Date();

  const [, [cancelled]] = await db.batch([
    lockInvoice(invoiceId),
    db
      .update(invoices)
      .set({ status: "CANCELLED", updatedAt: cancelledAt })
      .where(
        and(
          invoiceScope(ctx.organization.id, invoiceId),
          inArray(invoices.status, ["SENT", "VIEWED"]),
          eq(invoices.amountPaid, "0"),
        ),
      )
      .returning({ id: invoices.id }),
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoiceCancelled, {
      when: sql`${invoices.updatedAt} = ${cancelledAt}`,
    }),
  ]);

  if (!cancelled) {
    throw new ConflictError("Only sent invoices without payments can be cancelled.");
  }
}

export async function deleteDraftInvoice(ctx: WorkspaceActor, invoiceId: string): Promise<void> {
  const invoice = await getInvoice(ctx.organization.id, invoiceId);

  if (!canDelete(invoice.status)) {
    throw new ConflictError("Only draft invoices can be deleted. Cancel a sent invoice instead.");
  }

  const isDraft = and(invoiceScope(ctx.organization.id, invoiceId), eq(invoices.status, "DRAFT"));

  const [, deleted] = await db.batch([
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoiceDeleted, { when: sql`${invoices.status} = 'DRAFT'` }),
    db.delete(invoices).where(isDraft).returning({ id: invoices.id }),
  ]);

  if (deleted.length === 0) {
    throw new ConflictError("Only draft invoices can be deleted. Cancel a sent invoice instead.");
  }
}
