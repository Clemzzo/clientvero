import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { NotFoundError } from "@/server/errors";
import { getInvoice } from "@/server/services/invoice.service";
import { invoiceIdSchema } from "@/validators/invoices";

export const loadInvoice = cache(async (id: string) => {
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    notFound();
  }

  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.invoicesRead);

  try {
    return { ctx, invoice: await getInvoice(ctx.organization.id, invoiceId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
