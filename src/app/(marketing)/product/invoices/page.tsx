import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/FinalCta";
import { InvoiceBuilder } from "@/components/marketing/product/invoices/InvoiceBuilder";
import { InvoiceClientView } from "@/components/marketing/product/invoices/InvoiceClientView";
import { InvoiceDashboardPreview } from "@/components/marketing/product/invoices/InvoiceDashboardPreview";
import { InvoicePayments } from "@/components/marketing/product/invoices/InvoicePayments";
import { ProductHero } from "@/components/marketing/product/ProductHero";
import { plans } from "@/features/subscriptions/plans";

function freeInvoicesLine() {
  const invoices = plans.find((plan) => plan.id === "free")?.limits.invoicesPerMonth;

  return invoices
    ? `Send up to ${invoices} invoices a month on the Free plan and always know what you're owed. No credit card required.`
    : "Send invoices free and always know what you're owed. No credit card required.";
}

export const metadata: Metadata = {
  title: "Invoicing",
  description:
    "Create numbered invoices in minutes, send them as a private link, record payments as they arrive, and always know what's outstanding.",
};

export default function InvoicesProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Invoices"
        title="Send invoices. Know what's been paid."
        intro="Create numbered invoices in minutes, send them as a private link, and record payments as they come in. You'll always know what's outstanding and what's overdue."
        preview={<InvoiceDashboardPreview />}
      />
      <InvoiceBuilder />
      <InvoiceClientView />
      <InvoicePayments />
      <FinalCta title="Send your next invoice in minutes." description={freeInvoicesLine()} />
    </>
  );
}
