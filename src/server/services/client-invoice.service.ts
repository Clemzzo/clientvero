import "server-only";

import { and, desc, eq, isNull, ne, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, organizations, projects, type Invoice } from "@/db/schema";
import { activityActions, activityActorTypes, activityResources } from "@/features/activity/activity-actions";
import { businessParty, clientParty, type InvoiceDocumentData } from "@/features/invoices/invoice-document";
import { notificationTypes } from "@/features/notifications/notification-types";
import type { PortalContext } from "@/server/auth/portal-session";
import { NotFoundError } from "@/server/errors";
import type { InvoiceListRow } from "@/server/repositories/invoice.repository";
import { invoiceActivity } from "@/server/services/invoice-activity";
import { listInvoiceItems, toDocument } from "@/server/services/invoice.service";
import { notifyMembersIf } from "@/server/services/notification.service";

export type ClientInvoice = Pick<Invoice, "id" | "organizationId" | "status" | "dueDate" | "paidAt" | "publicId"> & {
  organizationName: string;
  clientName: string;
  document: InvoiceDocumentData;
};

const PORTAL_INVOICE_LIMIT = 100;
const unavailable = "This invoice isn't available.";

const sentInvoice = and(isNull(invoices.deletedAt), ne(invoices.status, "DRAFT"))!;

async function findClientInvoice(where: SQL | undefined): Promise<ClientInvoice | null> {
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
    })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .innerJoin(organizations, eq(organizations.id, invoices.organizationId))
    .where(and(sentInvoice, where))
    .limit(1);

  if (!row) return null;

  const { invoice } = row;
  const items = await listInvoiceItems(invoice.organizationId, invoice.id);

  return {
    id: invoice.id,
    organizationId: invoice.organizationId,
    status: invoice.status,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    publicId: invoice.publicId,
    organizationName: row.business.name,
    clientName: row.client.name,
    document: toDocument(invoice, items, businessParty(row.business), clientParty(row.client)),
  };
}

export function getPublicInvoice(publicId: string): Promise<ClientInvoice | null> {
  return findClientInvoice(eq(invoices.publicId, publicId));
}

export async function getPortalInvoice(context: PortalContext, invoiceId: string): Promise<ClientInvoice> {
  const invoice = await findClientInvoice(
    and(
      eq(invoices.id, invoiceId),
      eq(invoices.organizationId, context.organization.id),
      eq(invoices.clientId, context.client.id),
    ),
  );

  if (!invoice) {
    throw new NotFoundError(unavailable);
  }

  return invoice;
}

export function listPortalInvoices(context: PortalContext): Promise<InvoiceListRow[]> {
  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      currency: invoices.currency,
      total: invoices.total,
      amountPaid: invoices.amountPaid,
      amountDue: invoices.amountDue,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      clientId: invoices.clientId,
      clientName: clients.name,
      projectName: projects.name,
    })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .leftJoin(projects, eq(projects.id, invoices.projectId))
    .where(
      and(
        sentInvoice,
        eq(invoices.organizationId, context.organization.id),
        eq(invoices.clientId, context.client.id),
      ),
    )
    .orderBy(desc(invoices.issueDate), desc(invoices.createdAt))
    .limit(PORTAL_INVOICE_LIMIT);
}

export async function markInvoiceViewed(
  invoice: Pick<ClientInvoice, "id" | "organizationId" | "status" | "clientName" | "document">,
): Promise<void> {
  if (invoice.status !== "SENT") return;

  const viewedAt = new Date();
  const viewedNow = sql`exists (select 1 from ${invoices} where ${invoices.id} = ${invoice.id} and ${invoices.viewedAt} = ${viewedAt})`;

  await db.batch([
    db
      .update(invoices)
      .set({ status: "VIEWED", viewedAt })
      .where(and(eq(invoices.id, invoice.id), eq(invoices.organizationId, invoice.organizationId), eq(invoices.status, "SENT"))),
    invoiceActivity(
      { organizationId: invoice.organizationId, actorUserId: null, actorType: activityActorTypes.client },
      invoice.id,
      activityActions.invoiceViewed,
      { when: sql`${invoices.viewedAt} = ${viewedAt}`, metadata: { clientName: invoice.clientName } },
    ),
    notifyMembersIf(
      {
        organizationId: invoice.organizationId,
        type: notificationTypes.invoiceViewed,
        title: "Invoice viewed",
        message: `${invoice.clientName} opened invoice ${invoice.document.invoiceNumber}.`,
        resourceType: activityResources.invoice,
        resourceId: invoice.id,
      },
      viewedNow,
    ),
  ]);
}
