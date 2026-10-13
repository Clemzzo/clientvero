import type { Metadata } from "next";
import Link from "next/link";

import { InvoiceActionsMenu } from "@/components/invoices/InvoiceActionsMenu";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { InvoiceNumber } from "@/components/invoices/InvoiceNumber";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { PaymentStub } from "@/components/invoices/PaymentStub";
import { SettlementMeter } from "@/components/invoices/SettlementMeter";
import { BackLink } from "@/components/shared/BackLink";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { activityResources } from "@/features/activity/activity-actions";
import { displayStatus } from "@/features/invoices/invoice-status";
import { noticeSchema, type NoticeKey } from "@/features/notices";
import { invoicePublicUrl } from "@/lib/utils/public-url";
import { userToday } from "@/lib/utils/timezone";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listInvoicePayments } from "@/server/repositories/invoice.repository";
import { listActivity } from "@/server/services/activity.service";

import { loadInvoice } from "./load-invoice";

const noticeMessages: Partial<Record<NoticeKey, string>> = {
  "invoice-created": "Invoice saved as a draft. Send it when you're ready.",
  "invoice-saved": "Your changes were saved.",
  "invoice-locked": "This invoice has payments, so it can't be edited.",
};

export async function generateMetadata(props: PageProps<"/dashboard/invoices/[id]">): Promise<Metadata> {
  const { invoice } = await loadInvoice((await props.params).id);
  return { title: `${invoice.invoiceNumber} for ${invoice.clientName}` };
}

export default async function InvoicePage(props: PageProps<"/dashboard/invoices/[id]">) {
  const { ctx, invoice } = await loadInvoice((await props.params).id);
  const notice = noticeSchema.parse((await props.searchParams).notice);
  const [payments, activity] = await Promise.all([
    listInvoicePayments(ctx.organization.id, invoice.id),
    listActivity(ctx.organization.id, activityResources.invoice, invoice.id),
  ]);
  const role = ctx.membership.role;
  const today = userToday(ctx.user.timezone);

  return (
    <div className="min-h-full bg-ink-100">
      <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
        <UrlNotice notice={notice} message={(notice && noticeMessages[notice]) ?? "Done."} />
        <BackLink href="/dashboard/invoices">Invoices</BackLink>

        <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1>
                <InvoiceNumber value={invoice.invoiceNumber} className="text-[clamp(24px,2.2vw,30px)] font-extrabold" />
              </h1>
              <InvoiceStatusBadge status={displayStatus(invoice, today)} />
            </div>
            <p className="mt-1.5 text-[15px] text-ink-500">
              For{" "}
              <Link href={`/dashboard/clients/${invoice.clientId}`} className="font-medium text-ink-700 hover:text-brand-700">
                {invoice.clientName}
              </Link>
              {invoice.projectId && invoice.projectName && (
                <>
                  {", "}
                  <Link href={`/dashboard/projects/${invoice.projectId}`} className="font-medium text-ink-700 hover:text-brand-700">
                    {invoice.projectName}
                  </Link>
                </>
              )}
            </p>
          </div>

          <InvoiceActionsMenu
            invoice={{
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              status: invoice.status,
              currency: invoice.currency,
              amountPaid: invoice.amountPaid,
              amountDue: invoice.amountDue,
            }}
            publicUrl={invoicePublicUrl(invoice.publicId)}
            can={{
              manage: hasPermission(role, permissions.invoicesCreate),
              send: hasPermission(role, permissions.invoicesSend),
              delete: hasPermission(role, permissions.invoicesDelete),
            }}
          />
        </header>

        <div className="mt-6">
          <SettlementMeter
            status={invoice.status}
            currency={invoice.currency}
            total={invoice.total}
            amountPaid={invoice.amountPaid}
            amountDue={invoice.amountDue}
            dueDate={invoice.dueDate}
            paidAt={invoice.paidAt}
            today={today}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <InvoiceDocument invoice={invoice.document} className="max-w-190" />
          <PaymentStub
            invoice={invoice}
            payments={payments}
            activity={activity}
            canRemovePayments={hasPermission(role, permissions.invoicesDelete)}
          />
        </div>
      </div>
    </div>
  );
}
