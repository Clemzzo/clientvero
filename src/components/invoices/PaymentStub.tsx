import { Activity, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { IconTile } from "@/components/shared/IconTile";
import type { Invoice } from "@/db/schema";
import { paymentMethodLabels } from "@/features/invoices/payment-methods";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";
import type { PaymentRow } from "@/server/repositories/invoice.repository";
import type { ActivityEntry } from "@/server/services/activity.service";

import { paymentMethodIcons } from "./payment-method-icons";
import { RemovePaymentButton } from "./RemovePaymentButton";

type PaymentStubProps = {
  invoice: Pick<Invoice, "status" | "currency" | "createdAt" | "sentAt" | "viewedAt" | "paidAt" | "updatedAt">;
  payments: PaymentRow[];
  activity: ActivityEntry[];
  canRemovePayments: boolean;
};

type Step = { label: string; at: Date | null; dot: string };

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function Perforation() {
  return (
    <div aria-hidden className="relative my-1 h-4">
      <span className="absolute -left-2 top-0 size-4 rounded-full border border-ink-200 bg-ink-100 [clip-path:inset(0_0_0_50%)]" />
      <span className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-ink-200" />
      <span className="absolute -right-2 top-0 size-4 rounded-full border border-ink-200 bg-ink-100 [clip-path:inset(0_50%_0_0)]" />
    </div>
  );
}

function StubSection({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-5 py-4">
      <h2 className="flex items-center gap-2.5 text-[15px] font-semibold text-ink-900">
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function timeline(invoice: PaymentStubProps["invoice"]): Step[] {
  const closing: Step =
    invoice.status === "CANCELLED"
      ? { label: "Cancelled", at: invoice.updatedAt, dot: "bg-ink-500" }
      : { label: "Paid in full", at: invoice.paidAt, dot: "bg-mint-500" };

  return [
    { label: "Created", at: invoice.createdAt, dot: "bg-grape-500" },
    { label: "Sent", at: invoice.sentAt, dot: "bg-ocean-500" },
    { label: "Viewed by client", at: invoice.viewedAt, dot: "bg-ocean-500" },
    closing,
  ];
}

export function PaymentStub({ invoice, payments, activity, canRemovePayments }: PaymentStubProps) {
  return (
    <aside aria-label="Payments and history" className="relative rounded-2xl border border-ink-200 bg-white">
      <StubSection title="Payments" icon={<IconTile icon={<Wallet />} tone="mint" />}>
        {payments.length === 0 ? (
          <p className="text-[13.5px] text-ink-500">No payments yet. Record one when your client pays.</p>
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => {
              const amount = formatMoney(payment.amount, payment.currency);

              return (
                <li key={payment.id} className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-mint-50 text-mint-600 [&_svg]:size-3.5">
                    {paymentMethodIcons[payment.method]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-3">
                      <span className="text-[14px] font-medium text-ink-900">{paymentMethodLabels[payment.method]}</span>
                      <span className="font-display text-[15px] font-semibold tabular-nums text-ink-900">{amount}</span>
                    </p>
                    <p className="text-[12.5px] text-ink-500">
                      {dateFormat.format(payment.paidAt)}
                      {payment.reference && `, ref ${payment.reference}`}
                    </p>
                    {payment.note && <p className="mt-0.5 break-words text-[12.5px] text-ink-700">{payment.note}</p>}
                  </div>
                  {canRemovePayments && <RemovePaymentButton paymentId={payment.id} label={`the ${amount} payment`} />}
                </li>
              );
            })}
          </ul>
        )}
      </StubSection>

      <Perforation />

      <StubSection title="Timeline">
        <ol className="space-y-2.5">
          {timeline(invoice).map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-[13.5px]">
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", step.at ? step.dot : "border-2 border-ink-200 bg-white")} />
              <span className={cn("flex-1 font-medium", step.at ? "text-ink-900" : "text-ink-500")}>
                {step.label}
                <span className="sr-only">{step.at ? " (done)" : " (not yet)"}</span>
              </span>
              {step.at && (
                <time dateTime={step.at.toISOString()} className="text-[12.5px] tabular-nums text-ink-500">
                  {dateTimeFormat.format(step.at)}
                </time>
              )}
            </li>
          ))}
        </ol>
      </StubSection>

      <Perforation />

      <StubSection title="Activity">
        {activity.length === 0 ? (
          <p className="flex items-center gap-2 text-[13.5px] text-ink-500">
            <Activity aria-hidden className="size-4" />
            Changes to this invoice show up here.
          </p>
        ) : (
          <ActivityTimeline entries={activity} showSubject={false} />
        )}
      </StubSection>
    </aside>
  );
}
