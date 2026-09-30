import { Check, LayoutDashboard, Link2 } from "lucide-react";

import { StatusPill } from "@/components/marketing/feature-previews";
import { DocumentLinkBar, ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const invoiceContents = [
  "Your business name and logo",
  "Invoice number, issue date, and due date",
  "Each line item, with tax, discount, and total",
  "What's been paid and what's still due",
  "How to pay you",
];

const delivery = [
  { title: "A private link", detail: "Sent by email. The link can't be guessed from the invoice number.", icon: Link2 },
  {
    title: "In their client portal",
    detail: "Clients with portal access find every invoice in one place.",
    icon: LayoutDashboard,
  },
];

const lineItems = [
  { description: "Brand strategy workshop", quantity: "1 × $2,000.00", amount: "$2,000.00" },
  { description: "Logo and identity system", quantity: "1 × $2,500.00", amount: "$2,500.00" },
  { description: "Brand guidelines", quantity: "2 × $250.00", amount: "$500.00" },
];

const totals = [
  { label: "Subtotal", amount: "$5,000.00" },
  { label: "Tax (8%)", amount: "$400.00" },
  { label: "Total", amount: "$5,400.00" },
  { label: "Paid", amount: "−$2,700.00" },
];

const invoiceDates = [
  { label: "Billed to", value: "Lumen Labs" },
  { label: "Issued", value: "10 Sep 2026" },
  { label: "Due", value: "24 Sep 2026" },
];

function ClientInvoicePreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]"
    >
      <DocumentLinkBar url="clientvero.com/invoice/Xa81pQ2vL" />

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-950 text-[10px] font-bold text-white">
              NS
            </span>
            <span className="truncate text-[12.5px] font-semibold text-ink-900">Northwind Studio</span>
          </span>
          <StatusPill tone="amber">Partially paid</StatusPill>
        </div>

        <p className="mt-6 font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink-900">INV-0043</p>

        <dl className="mt-4 grid grid-cols-3 gap-3">
          {invoiceDates.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-[10.5px] text-ink-400">{item.label}</dt>
              <dd className="truncate text-[12px] font-medium text-ink-900">{item.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-5 divide-y divide-ink-100 border-y border-ink-200">
          {lineItems.map((item) => (
            <li key={item.description} className="flex items-start justify-between gap-4 py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-ink-900">{item.description}</span>
                <span className="block text-[11px] tabular-nums text-ink-400">{item.quantity}</span>
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-ink-700">{item.amount}</span>
            </li>
          ))}
        </ul>

        <dl className="ml-auto mt-3 max-w-60 space-y-1.5">
          {totals.map((row) => (
            <div
              key={row.label}
              className={cn(
                "flex justify-between gap-4 text-[11.5px]",
                row.label === "Total" ? "font-semibold text-ink-900" : "text-ink-500",
              )}
            >
              <dt>{row.label}</dt>
              <dd className="tabular-nums">{row.amount}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 border-t border-ink-200 bg-ink-50 px-5 py-4 sm:grid-cols-2 sm:items-center sm:px-6">
        <span>
          <span className="block text-[11px] text-ink-400">Amount due</span>
          <span className="block font-display text-[20px] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
            $2,700.00 <span className="text-[12px] font-semibold text-ink-400">USD</span>
          </span>
        </span>
        <span className="rounded-lg border border-ink-200 bg-white px-3 py-2">
          <span className="block text-[11px] text-ink-400">How to pay</span>
          <span className="block text-[11.5px] font-medium text-ink-900">Bank transfer to Northwind Studio</span>
          <span className="block text-[11px] text-ink-500">Use reference INV-0043</span>
        </span>
      </div>
    </div>
  );
}

export function InvoiceClientView() {
  return (
    <ProductSection
      id="client-view"
      title="An invoice your client can act on."
      intro="Everything your client needs to pay you is on one clear page, including exactly how to pay and what's left to pay."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div className="space-y-10">
          <div>
            <h3 className="text-[14px] font-semibold text-ink-900">What&apos;s on every invoice</h3>
            <ul className="mt-5 space-y-3">
              {invoiceContents.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink-700">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[14px] font-semibold text-ink-900">How your client gets it</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {delivery.map((item) => (
                <li key={item.title} className="rounded-xl border border-ink-200 p-4">
                  <p className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-900">
                    <item.icon aria-hidden className="size-4 shrink-0 text-brand-600" />
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-normal text-ink-500">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ClientInvoicePreview />
      </div>
    </ProductSection>
  );
}
