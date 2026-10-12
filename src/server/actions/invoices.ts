"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { invoicePublicUrl } from "@/lib/utils/public-url";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission, type Permission } from "@/server/authorization/permissions";
import { cancelInvoice, createInvoice, deleteDraftInvoice, sendInvoice, updateInvoice } from "@/server/services/invoice.service";
import { recordPayment, removePayment } from "@/server/services/payment.service";
import type { FormState } from "@/types/form-state";
import { invoiceFormSchema, invoiceIdSchema, paymentIdSchema, recordPaymentSchema } from "@/validators/invoices";

const invoiceFields = [
  "clientId",
  "projectId",
  "currency",
  "issueDate",
  "dueDate",
  "discount",
  "notes",
  "paymentInstructions",
  "items",
] as const;

const paymentFields = ["id", "amount", "paidAt", "method", "reference", "note"] as const;

const invalidForm = "Check the highlighted fields and try again.";
const invoiceMissing = "This invoice no longer exists.";
const workspaceErrors = { scope: "invoices", notFound: invoiceMissing };
const paymentErrors = { scope: "payments", notFound: "This payment no longer exists." };

export type InvoiceActionResult = { error?: string };

export type PaymentFormState = FormState | { done: true };

async function requireInvoiceWriter(permission: Permission) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permission);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateInvoices(invoiceId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/clients", "layout");
  if (invoiceId) revalidatePath(`/dashboard/invoices/${invoiceId}`);
}

export async function createInvoiceAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let invoiceId: string;

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesCreate);

    const parsed = invoiceFormSchema.safeParse(readFormFields(formData, invoiceFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    invoiceId = await createInvoice(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateInvoices(invoiceId);
  redirect(`/dashboard/invoices/${invoiceId}?notice=invoice-created`);
}

export async function updateInvoiceAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    return { error: invoiceMissing };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesCreate);

    const parsed = invoiceFormSchema.safeParse(readFormFields(formData, invoiceFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateInvoice(ctx, invoiceId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateInvoices(invoiceId.data);
  redirect(`/dashboard/invoices/${invoiceId.data}?notice=invoice-saved`);
}

export async function sendInvoiceAction(id: string): Promise<InvoiceActionResult & { publicUrl?: string }> {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    return { error: invoiceMissing };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesSend);
    const publicId = await sendInvoice(ctx, invoiceId.data);
    revalidateInvoices(invoiceId.data);
    return { publicUrl: invoicePublicUrl(publicId) };
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }
}

export async function cancelInvoiceAction(id: string): Promise<InvoiceActionResult> {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    return { error: invoiceMissing };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesSend);
    await cancelInvoice(ctx, invoiceId.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateInvoices(invoiceId.data);
  return {};
}

export async function deleteInvoiceAction(id: string): Promise<InvoiceActionResult> {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    return { error: invoiceMissing };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesDelete);
    await deleteDraftInvoice(ctx, invoiceId.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateInvoices();
  redirect("/dashboard/invoices");
}

export async function recordPaymentAction(id: string, _previous: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    return { error: invoiceMissing };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesSend);

    const parsed = recordPaymentSchema.safeParse(readFormFields(formData, paymentFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await recordPayment(ctx, invoiceId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, workspaceErrors) };
  }

  revalidateInvoices(invoiceId.data);
  return { done: true };
}

export async function removePaymentAction(id: string): Promise<InvoiceActionResult> {
  const paymentId = paymentIdSchema.safeParse(id);

  if (!paymentId.success) {
    return { error: paymentErrors.notFound };
  }

  try {
    const ctx = await requireInvoiceWriter(permissions.invoicesDelete);
    const invoiceId = await removePayment(ctx, paymentId.data);
    revalidateInvoices(invoiceId);
  } catch (error) {
    return { error: toActionError(error, paymentErrors) };
  }

  return {};
}
