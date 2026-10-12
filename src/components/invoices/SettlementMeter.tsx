"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

import type { InvoiceStatus } from "@/db/schema";
import { duePhrase } from "@/features/invoices/due-phrase";
import { displayStatus } from "@/features/invoices/invoice-status";
import { paidShare } from "@/features/invoices/paid-share";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";

import { duePhraseStyles } from "./invoice-tones";

type SettlementMeterProps = {
  status: InvoiceStatus;
  currency: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  dueDate: string;
  paidAt: Date | null;
  today: string;
  audience?: "team" | "client";
};

const easing = [0.22, 1, 0.36, 1] as const;

function useCountedAmount(amount: string, currency: string, reduceMotion: boolean) {
  const [shown, setShown] = useState(() => formatMoney(amount, currency));
  const previous = useRef(Number(amount));

  useEffect(() => {
    const from = previous.current;
    const to = Number(amount);
    previous.current = to;

    if (reduceMotion || from === to) {
      setShown(formatMoney(amount, currency));
      return;
    }

    const controls = animate(from, to, {
      duration: 0.6,
      ease: easing,
      onUpdate: (value) => setShown(formatMoney(value.toFixed(2), currency)),
      onComplete: () => setShown(formatMoney(amount, currency)),
    });

    return () => controls.stop();
  }, [amount, currency, reduceMotion]);

  return shown;
}

function headline(props: SettlementMeterProps, status: InvoiceStatus) {
  const due = duePhrase({ status, dueDate: props.dueDate, paidAt: props.paidAt }, props.today);

  switch (status) {
    case "DRAFT":
      return { amount: props.total, caption: "Not sent yet", tone: "text-grape-700" };
    case "CANCELLED":
      return { amount: props.total, caption: "Cancelled. Nothing to collect.", tone: "text-ink-500" };
    case "PAID":
      return { amount: props.total, caption: `${due.text}, in full`, tone: duePhraseStyles.settled };
    default:
      return { amount: props.amountDue, caption: due.text, tone: duePhraseStyles[due.tone] };
  }
}

export function SettlementMeter(props: SettlementMeterProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const status = displayStatus(props, props.today);
  const { amount, caption, tone } = headline(props, status);
  const shownAmount = useCountedAmount(amount, props.currency, reduceMotion);
  const percent = paidShare(props.amountPaid, props.total);
  const showBar = status !== "DRAFT" && status !== "CANCELLED";
  const late = status === "OVERDUE";
  const label = status === "PAID" || status === "DRAFT" || status === "CANCELLED" ? "Total" : props.audience === "client" ? "Amount due" : "Still due";

  return (
    <section
      aria-label="Payment progress"
      className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:gap-10 print:hidden"
    >
      <div className="min-w-0 lg:w-[38%]">
        <p className="text-[13px] text-ink-500">{label}</p>
        <p
          aria-live="polite"
          className={cn(
            "font-display text-[clamp(36px,4vw,52px)] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            status === "PAID" ? "text-mint-700" : "text-ink-900",
          )}
        >
          {shownAmount}
        </p>
        <p className={cn("mt-2 text-[14px] font-medium", tone)}>{caption}</p>
      </div>

      {showBar && (
        <div className="min-w-0 flex-1">
          <div
            role="progressbar"
            aria-label="Share of the invoice paid"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(percent)}
            className={cn("h-4 w-full overflow-hidden rounded-full", late ? "bg-coral-100" : "bg-sun-100")}
          >
            <motion.div
              className="h-full rounded-full bg-mint-500"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: easing }}
            />
          </div>
          <p className="mt-2.5 text-[13.5px] tabular-nums text-ink-500">
            <span className="font-semibold text-ink-900">{formatMoney(props.amountPaid, props.currency)}</span> of{" "}
            {formatMoney(props.total, props.currency)} paid
          </p>
        </div>
      )}
    </section>
  );
}
