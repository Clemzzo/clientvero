import type { InvoiceStatus } from "@/db/schema";
import { daysBetween } from "@/features/invoices/invoice-dates";
import { isOpen } from "@/features/invoices/invoice-status";
import { formatDate } from "@/lib/utils/format";

export type DuePhrase = { text: string; tone: "settled" | "late" | "soon" | "neutral" };

type DueFacts = { status: InvoiceStatus; dueDate: string; paidAt: Date | null };

const SOON_DAYS = 3;

function plural(count: number, unit: string) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

export function duePhrase({ status, dueDate, paidAt }: DueFacts, today: string): DuePhrase {
  if (status === "PAID") {
    return { text: paidAt ? `Paid ${formatDate(paidAt.toISOString().slice(0, 10))}` : "Paid", tone: "settled" };
  }

  if (status === "CANCELLED") {
    return { text: "Cancelled", tone: "neutral" };
  }

  if (!isOpen(status)) {
    return { text: `Due ${formatDate(dueDate)}`, tone: "neutral" };
  }

  const days = daysBetween(today, dueDate);

  if (days < 0) return { text: `${plural(-days, "day")} late`, tone: "late" };
  if (days === 0) return { text: "Due today", tone: "soon" };
  if (days === 1) return { text: "Due tomorrow", tone: "soon" };

  return { text: `Due in ${plural(days, "day")}`, tone: days <= SOON_DAYS ? "soon" : "neutral" };
}
