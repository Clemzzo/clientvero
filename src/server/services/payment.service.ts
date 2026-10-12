import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { invoices, payments, type PaymentMetadata } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import { canRecordPayment, openInvoiceStatuses } from "@/features/invoices/invoice-status";
import { formatMoney } from "@/lib/utils/format";
import { toCents } from "@/lib/utils/money";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { invoiceActivity } from "@/server/services/invoice-activity";
import { getInvoice, lockInvoice } from "@/server/services/invoice.service";
import type { RecordPaymentInput } from "@/validators/invoices";

const paymentMissing = "This payment no longer exists.";
const openStatuses = sql.join(
  openInvoiceStatuses.map((status) => sql`${status}`),
  sql`, `,
);

function actor(ctx: WorkspaceActor) {
  return { organizationId: ctx.organization.id, actorUserId: ctx.user.id };
}

function settleInvoice(organizationId: string, invoiceId: string) {
  return db.execute(sql`
    with received as (
      select coalesce(sum(${payments.amount}), 0) as paid, max(${payments.paidAt}) as last_paid_at
      from ${payments}
      where ${payments.invoiceId} = ${invoiceId} and ${payments.status} = 'SUCCEEDED'
    )
    update ${invoices} set
      amount_paid = received.paid,
      amount_due = ${invoices.total} - received.paid,
      status = case
        when received.paid >= ${invoices.total} then 'PAID'
        when received.paid > 0 then 'PARTIALLY_PAID'
        when ${invoices.viewedAt} is not null then 'VIEWED'
        else 'SENT'
      end::invoice_status,
      paid_at = case when received.paid >= ${invoices.total} then received.last_paid_at end,
      updated_at = now()
    from received
    where ${invoices.id} = ${invoiceId}
      and ${invoices.organizationId} = ${organizationId}
      and ${invoices.status} in (${openStatuses}, 'PAID')
  `);
}

function paymentIsNew(paymentId: string) {
  return sql`exists (select 1 from ${payments} where ${payments.id} = ${paymentId} and ${payments.createdAt} = now())`;
}

async function findPayment(organizationId: string, paymentId: string) {
  const [payment] = await db
    .select({ id: payments.id, invoiceId: payments.invoiceId, amount: payments.amount, currency: payments.currency })
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.organizationId, organizationId)))
    .limit(1);

  return payment ?? null;
}

export async function recordPayment(ctx: WorkspaceActor, invoiceId: string, input: RecordPaymentInput): Promise<void> {
  const organizationId = ctx.organization.id;
  const existing = await findPayment(organizationId, input.id);

  if (existing) {
    if (existing.invoiceId === invoiceId) return;
    throw new ConflictError("This payment was already recorded. Reload the page and try again.");
  }

  const invoice = await getInvoice(organizationId, invoiceId);

  if (!canRecordPayment(invoice.status)) {
    throw new ConflictError(
      invoice.status === "DRAFT" ? "Send the invoice before recording a payment." : "This invoice isn't waiting for payment.",
    );
  }

  if (toCents(input.amount) > toCents(invoice.amountDue)) {
    throw new ValidationError(`That's more than the ${formatMoney(invoice.amountDue, invoice.currency)} still due.`);
  }

  const metadata: PaymentMetadata = { method: input.method, note: input.note };
  const isNew = paymentIsNew(input.id);

  await db.batch([
    lockInvoice(invoiceId),
    db.execute(sql`
      insert into ${payments} (id, organization_id, invoice_id, recorded_by, amount, currency, status, provider, reference, paid_at, metadata)
      select ${input.id}, ${organizationId}, ${invoices.id}, ${ctx.user.id}, ${input.amount}::numeric, ${invoices.currency},
        'SUCCEEDED', 'MANUAL', ${input.reference}, ${`${input.paidAt}T12:00:00Z`}::timestamptz, ${JSON.stringify(metadata)}::jsonb
      from ${invoices}
      where ${invoices.id} = ${invoiceId}
        and ${invoices.organizationId} = ${organizationId}
        and ${invoices.deletedAt} is null
        and ${invoices.status} in (${openStatuses})
        and ${invoices.amountDue} >= ${input.amount}::numeric
      on conflict (id) do nothing
    `),
    settleInvoice(organizationId, invoiceId),
    invoiceActivity(actor(ctx), invoiceId, activityActions.paymentReceived, {
      when: isNew,
      metadata: { amount: input.amount, currency: invoice.currency },
    }),
    invoiceActivity(actor(ctx), invoiceId, activityActions.invoicePaid, {
      when: sql`${isNew} and ${invoices.status} = 'PAID'`,
    }),
  ]);

  const recorded = await findPayment(organizationId, input.id);

  if (!recorded || recorded.invoiceId !== invoiceId) {
    throw new ConflictError("This invoice changed while you were recording the payment. Reload and try again.");
  }
}

export async function removePayment(ctx: WorkspaceActor, paymentId: string): Promise<string> {
  const organizationId = ctx.organization.id;
  const payment = await findPayment(organizationId, paymentId);

  if (!payment) {
    throw new NotFoundError(paymentMissing);
  }

  const [, , [removed]] = await db.batch([
    lockInvoice(payment.invoiceId),
    invoiceActivity(actor(ctx), payment.invoiceId, activityActions.paymentRemoved, {
      when: sql`exists (select 1 from ${payments} where ${payments.id} = ${paymentId})`,
      metadata: { amount: payment.amount, currency: payment.currency },
    }),
    db
      .delete(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.organizationId, organizationId)))
      .returning({ id: payments.id }),
    settleInvoice(organizationId, payment.invoiceId),
  ]);

  if (!removed) {
    throw new NotFoundError(paymentMissing);
  }

  return payment.invoiceId;
}
