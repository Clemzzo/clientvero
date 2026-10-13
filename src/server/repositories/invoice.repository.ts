import "server-only";

import { and, asc, desc, eq, ilike, inArray, isNull, lt, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, payments, projects, type InvoiceStatus, type PaymentStatus } from "@/db/schema";
import { clientParty, type InvoiceParty } from "@/features/invoices/invoice-document";
import { invoiceFilters, openInvoiceStatuses, type InvoiceFilter } from "@/features/invoices/invoice-status";
import { asPaymentMethod, type PaymentMethod } from "@/features/invoices/payment-methods";
import { todayInTimeZone } from "@/lib/utils/timezone";
import { paidThisPeriod } from "@/server/repositories/payment.repository";
import { escapeLike } from "@/server/repositories/search";
import { INVOICES_PAGE_SIZE, type InvoiceListQuery } from "@/validators/invoices";

const isOpen = inArray(invoices.status, [...openInvoiceStatuses]);
function isOverdue(today: string) {
  return and(isOpen, lt(invoices.dueDate, today))!;
}

function filterCondition(filter: Exclude<InvoiceFilter, "all">, today: string): SQL {
  const conditions: Record<Exclude<InvoiceFilter, "all">, SQL> = {
    draft: eq(invoices.status, "DRAFT"),
    outstanding: isOpen,
    overdue: isOverdue(today),
    paid: eq(invoices.status, "PAID"),
    cancelled: eq(invoices.status, "CANCELLED"),
  };
  return conditions[filter];
}

const listFields = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  status: invoices.status,
  currency: invoices.currency,
  total: invoices.total,
  amountPaid: invoices.amountPaid,
  amountDue: invoices.amountDue,
  issueDate: invoices.issueDate,
  dueDate: invoices.dueDate,
  paidAt: invoices.paidAt,
  clientId: invoices.clientId,
  clientName: clients.name,
  projectName: projects.name,
};

export type InvoiceListRow = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  issueDate: string;
  dueDate: string;
  paidAt: Date | null;
  clientId: string;
  clientName: string;
  projectName: string | null;
};

export type InvoiceListResult = {
  rows: InvoiceListRow[];
  total: number;
  pageCount: number;
  counts: Record<InvoiceFilter, number>;
};

export type InvoiceMoneySummary = {
  settledThisMonth: string;
  outstanding: string;
  overdue: string;
  overdueInvoices: number;
  openInOtherCurrencies: number;
};

export type PaymentRow = {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  reference: string | null;
  paidAt: Date;
  method: PaymentMethod;
  note: string | null;
};

export type BillableClient = {
  value: string;
  label: string;
  party: InvoiceParty;
};

export type ProjectOption = {
  value: string;
  label: string;
  clientId: string;
  currency: string;
};

function visibleInvoices(organizationId: string): SQL[] {
  return [eq(invoices.organizationId, organizationId), isNull(invoices.deletedAt)];
}

function searchFilter(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  return or(ilike(invoices.invoiceNumber, pattern), ilike(clients.name, pattern))!;
}

function listQuery(where: SQL | undefined) {
  return db
    .select(listFields)
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .leftJoin(projects, eq(projects.id, invoices.projectId))
    .where(where);
}

async function countByFilter(organizationId: string, q: string, today: string): Promise<Record<InvoiceFilter, number>> {
  const filters = visibleInvoices(organizationId);
  if (q) filters.push(searchFilter(q));

  const countWhere = (condition: SQL) => sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

  const [row] = await db
    .select({
      all: sql<number>`count(*)`.mapWith(Number),
      draft: countWhere(filterCondition("draft", today)),
      outstanding: countWhere(filterCondition("outstanding", today)),
      overdue: countWhere(filterCondition("overdue", today)),
      paid: countWhere(filterCondition("paid", today)),
      cancelled: countWhere(filterCondition("cancelled", today)),
    })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .where(and(...filters));

  return Object.fromEntries(invoiceFilters.map((filter) => [filter, row?.[filter] ?? 0])) as Record<InvoiceFilter, number>;
}

export async function listInvoices(organizationId: string, query: InvoiceListQuery, today: string): Promise<InvoiceListResult> {
  const filters = visibleInvoices(organizationId);
  if (query.q) filters.push(searchFilter(query.q));
  if (query.status !== "all") filters.push(filterCondition(query.status, today));

  const [rows, counts] = await Promise.all([
    listQuery(and(...filters))
      .orderBy(desc(invoices.createdAt), desc(invoices.id))
      .limit(INVOICES_PAGE_SIZE)
      .offset((query.page - 1) * INVOICES_PAGE_SIZE),
    countByFilter(organizationId, query.q, today),
  ]);

  const total = counts[query.status];
  return { rows, total, pageCount: Math.max(1, Math.ceil(total / INVOICES_PAGE_SIZE)), counts };
}

export function listClientInvoices(organizationId: string, clientId: string): Promise<InvoiceListRow[]> {
  return listQuery(and(...visibleInvoices(organizationId), eq(invoices.clientId, clientId)))
    .orderBy(desc(invoices.createdAt))
    .limit(50);
}

export async function getInvoiceMoneySummary(
  organizationId: string,
  currency: string,
  timeZone: string,
): Promise<InvoiceMoneySummary> {
  const inCurrency = eq(invoices.currency, currency);
  const overdue = isOverdue(todayInTimeZone(timeZone));

  const [[totals], [settled]] = await Promise.all([
    db
      .select({
        outstanding: sql<string>`coalesce(sum(${invoices.amountDue}) filter (where ${isOpen} and ${inCurrency}), 0)::text`,
        overdue: sql<string>`coalesce(sum(${invoices.amountDue}) filter (where ${overdue} and ${inCurrency}), 0)::text`,
        overdueInvoices: sql<number>`count(*) filter (where ${overdue} and ${inCurrency})`.mapWith(Number),
        openInOtherCurrencies: sql<number>`count(*) filter (where ${isOpen} and ${invoices.currency} <> ${currency})`.mapWith(Number),
      })
      .from(invoices)
      .where(and(...visibleInvoices(organizationId))),
    db
      .select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)::text` })
      .from(payments)
      .where(
        and(
          eq(payments.organizationId, organizationId),
          eq(payments.status, "SUCCEEDED"),
          eq(payments.currency, currency),
          paidThisPeriod("month", timeZone),
        ),
      ),
  ]);

  return { ...totals, settledThisMonth: settled.total };
}

export async function listInvoicePayments(organizationId: string, invoiceId: string): Promise<PaymentRow[]> {
  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      reference: payments.reference,
      paidAt: payments.paidAt,
      metadata: payments.metadata,
    })
    .from(payments)
    .where(and(eq(payments.organizationId, organizationId), eq(payments.invoiceId, invoiceId)))
    .orderBy(desc(payments.paidAt), desc(payments.createdAt));

  return rows.map(({ metadata, ...row }) => ({
    ...row,
    method: asPaymentMethod(metadata?.method),
    note: metadata?.note ?? null,
  }));
}

export function listInvoiceProjectOptions(organizationId: string): Promise<ProjectOption[]> {
  return db
    .select({ value: projects.id, label: projects.name, clientId: projects.clientId, currency: projects.currency })
    .from(projects)
    .where(and(eq(projects.organizationId, organizationId), isNull(projects.deletedAt)))
    .orderBy(asc(projects.name))
    .limit(500);
}

export async function listBillableClients(organizationId: string): Promise<BillableClient[]> {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      company: clients.company,
      email: clients.email,
      address: clients.address,
      country: clients.country,
    })
    .from(clients)
    .where(and(eq(clients.organizationId, organizationId), isNull(clients.deletedAt)))
    .orderBy(asc(clients.name))
    .limit(500);

  return rows.map((row) => ({ value: row.id, label: row.name, party: clientParty(row) }));
}
