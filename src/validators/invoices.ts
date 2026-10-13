import { z } from "zod";

import { addDays, todayIso } from "@/features/invoices/invoice-dates";
import { invoiceFilters } from "@/features/invoices/invoice-status";
import { paymentMethodFilters, paymentMethods } from "@/features/invoices/payment-methods";
import { currencyCodes } from "@/features/organizations/business-profile";
import { invoiceTotals, toCents } from "@/lib/utils/money";
import { optionalDate, optionalMoney, optionalText, pageNumber, searchQuery } from "@/validators/fields";

export const INVOICES_PAGE_SIZE = 20;
export const MAX_INVOICE_ITEMS = 50;
export const PAYMENTS_PAGE_SIZE = 25;

const quantity = z
  .string({ error: "Enter a quantity." })
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/, "Use a number like 1 or 1.5.")
  .pipe(z.string().refine((value) => toCents(value) > 0n, "Quantity must be more than 0."));

const unitPrice = z
  .string({ error: "Enter a price." })
  .trim()
  .transform((value) => value.replaceAll(",", ""))
  .pipe(z.string().regex(/^\d{1,12}(\.\d{1,2})?$/, "Enter a price like 1500 or 1500.50."));

const itemSchema = z.object({
  description: z.string().trim().min(1, "Describe each line.").max(500, "Use 500 characters or fewer."),
  quantity,
  unitPrice,
});

const itemsSchema = z
  .string({ error: "Add at least one line." })
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The invoice lines couldn't be read." });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(itemSchema, { error: "Check each line has a description, quantity and price." })
      .min(1, "Add at least one line.")
      .max(MAX_INVOICE_ITEMS, `Use ${MAX_INVOICE_ITEMS} lines or fewer.`),
  );

const requiredDate = (message: string) => optionalDate.refine((value) => value !== null, message).transform((value) => value as string);

const optionalId = z
  .string()
  .optional()
  .transform((value) => value || null)
  .pipe(z.uuid().nullable());

function subtotalOf(input: { items: { quantity: string; unitPrice: string }[]; discount: string }) {
  try {
    return invoiceTotals(input).subtotal;
  } catch {
    return null;
  }
}

export const invoiceFormSchema = z
  .object({
    clientId: z.uuid({ error: "Choose a client." }),
    projectId: optionalId,
    currency: z.enum(currencyCodes as [string, ...string[]], { error: "Choose a currency." }),
    issueDate: requiredDate("Choose the issue date."),
    dueDate: requiredDate("Choose the due date."),
    discount: optionalMoney.transform((value) => value ?? "0"),
    notes: optionalText(2000),
    paymentInstructions: optionalText(2000),
    items: itemsSchema,
  })
  .refine((input) => input.dueDate >= input.issueDate, {
    path: ["dueDate"],
    message: "The due date can't be before the issue date.",
  })
  .superRefine((input, ctx) => {
    const subtotal = subtotalOf(input);
    if (subtotal === null) return;

    if (toCents(input.discount) > toCents(subtotal)) {
      ctx.addIssue({ code: "custom", path: ["discount"], message: "Discount can't be more than the subtotal." });
    } else if (toCents(input.discount) === toCents(subtotal)) {
      ctx.addIssue({ code: "custom", path: ["discount"], message: "The invoice total must be more than 0." });
    }
  });

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;

export const invoiceIdSchema = z.uuid();

export const invoicePublicIdSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);

export const invoiceListQuerySchema = z.object({
  q: searchQuery,
  status: z.enum(invoiceFilters).catch("all"),
  page: pageNumber,
});

export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;

export const invoicePrefillSchema = z.object({
  clientId: optionalId.catch(null),
  projectId: optionalId.catch(null),
});

export const recordPaymentSchema = z.object({
  id: z.uuid({ error: "Reload the page and try again." }),
  amount: optionalMoney.refine((value) => value !== null && toCents(value) > 0n, "Enter the amount received.").transform((value) => value as string),
  paidAt: requiredDate("Choose the date you were paid.").refine((value) => value <= addDays(todayIso(), 1), "The payment date can't be in the future."),
  method: z.enum(paymentMethods, { error: "Choose how you were paid." }),
  reference: optionalText(120),
  note: optionalText(500),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const paymentIdSchema = z.uuid();

export const paymentListQuerySchema = z.object({
  q: searchQuery,
  method: z.enum(paymentMethodFilters).catch("all"),
  page: pageNumber,
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
