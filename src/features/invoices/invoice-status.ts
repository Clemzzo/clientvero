import type { InvoiceStatus } from "@/db/schema";
import { isZeroAmount } from "@/lib/utils/money";

export const openInvoiceStatuses = ["SENT", "VIEWED", "PARTIALLY_PAID"] as const satisfies readonly InvoiceStatus[];

export const editableInvoiceStatuses = ["DRAFT", "SENT", "VIEWED"] as const satisfies readonly InvoiceStatus[];

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PARTIALLY_PAID: "Partly paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export type InvoiceTone = "draft" | "inFlight" | "partial" | "late" | "settled" | "void";

export const invoiceTones: Record<InvoiceStatus, InvoiceTone> = {
  DRAFT: "draft",
  SENT: "inFlight",
  VIEWED: "inFlight",
  PARTIALLY_PAID: "partial",
  PAID: "settled",
  OVERDUE: "late",
  CANCELLED: "void",
};

export const invoiceFilters = ["all", "draft", "outstanding", "overdue", "paid", "cancelled"] as const;

export type InvoiceFilter = (typeof invoiceFilters)[number];

export const invoiceFilterLabels: Record<InvoiceFilter, string> = {
  all: "All",
  draft: "Drafts",
  outstanding: "Outstanding",
  overdue: "Overdue",
  paid: "Paid",
  cancelled: "Cancelled",
};

type StatusFacts = { status: InvoiceStatus; dueDate: string };

export function isOpen(status: InvoiceStatus) {
  return (openInvoiceStatuses as readonly InvoiceStatus[]).includes(status);
}

export function displayStatus({ status, dueDate }: StatusFacts, today: string): InvoiceStatus {
  return isOpen(status) && dueDate < today ? "OVERDUE" : status;
}

export function canEdit({ status, amountPaid }: { status: InvoiceStatus; amountPaid: string }) {
  return (editableInvoiceStatuses as readonly InvoiceStatus[]).includes(status) && isZeroAmount(amountPaid);
}

export function canSend(status: InvoiceStatus) {
  return status === "DRAFT";
}

export function canCancel({ status, amountPaid }: { status: InvoiceStatus; amountPaid: string }) {
  return (status === "SENT" || status === "VIEWED") && isZeroAmount(amountPaid);
}

export const canRecordPayment = isOpen;

export function canDelete(status: InvoiceStatus) {
  return status === "DRAFT";
}
