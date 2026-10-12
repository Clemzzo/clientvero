import type { Invoice, InvoiceItem } from "@/db/schema";
import { addDays } from "@/features/invoices/invoice-dates";
import { formatQuantity } from "@/features/invoices/quantity";
import { isZeroAmount } from "@/lib/utils/money";

export const DEFAULT_PAYMENT_TERM_DAYS = 14;

export type LineDraft = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export type InvoiceBuilderValues = {
  clientId: string;
  projectId: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  discount: string;
  notes: string;
  paymentInstructions: string;
  items: LineDraft[];
};

export type InvoicePrefill = {
  clientId: string;
  projectId: string;
  currency: string;
  paymentInstructions: string;
  firstLine: string;
};

export function newInvoiceValues(prefill: InvoicePrefill, today: string): InvoiceBuilderValues {
  return {
    clientId: prefill.clientId,
    projectId: prefill.projectId,
    currency: prefill.currency,
    issueDate: today,
    dueDate: addDays(today, DEFAULT_PAYMENT_TERM_DAYS),
    discount: "",
    notes: "",
    paymentInstructions: prefill.paymentInstructions,
    items: [{ description: prefill.firstLine, quantity: "1", unitPrice: "" }],
  };
}

export function editInvoiceValues(invoice: Invoice & { items: InvoiceItem[] }): InvoiceBuilderValues {
  return {
    clientId: invoice.clientId,
    projectId: invoice.projectId ?? "",
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    discount: isZeroAmount(invoice.discount) ? "" : invoice.discount,
    notes: invoice.notes ?? "",
    paymentInstructions: invoice.paymentInstructions ?? "",
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: formatQuantity(item.quantity),
      unitPrice: item.unitPrice,
    })),
  };
}
