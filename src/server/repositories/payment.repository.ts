import "server-only";

import { and, desc, eq, ilike, isNotNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, payments, users } from "@/db/schema";
import {
  asPaymentMethod,
  paymentMethodFilters,
  paymentMethods,
  type PaymentMethod,
  type PaymentMethodFilter,
} from "@/features/invoices/payment-methods";
import { escapeLike } from "@/server/repositories/search";
import { PAYMENTS_PAGE_SIZE, type PaymentListQuery } from "@/validators/invoices";

export type PaymentScope = { clientId?: string };

export type PaymentLedgerRow = {
  id: string;
  amount: string;
  currency: string;
  paidAt: Date;
  reference: string | null;
  method: PaymentMethod;
  note: string | null;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientArchived: boolean;
  recordedByName: string | null;
};

export type PaymentListResult = {
  rows: PaymentLedgerRow[];
  total: number;
  pageCount: number;
  counts: Record<PaymentMethodFilter, number>;
};

export type PaymentTotals = {
  thisMonth: string;
  thisYear: string;
  allTime: string;
  otherCurrencyCount: number;
};

const namedMethods = sql.join(
  paymentMethods.filter((method) => method !== "OTHER").map((method) => sql`${method}`),
  sql`, `,
);

const methodOf = sql<string>`case when ${payments.metadata} ->> 'method' in (${namedMethods}) then ${payments.metadata} ->> 'method' else 'OTHER' end`;

export function paidThisPeriod(period: "month" | "year", timeZone: string): SQL {
  return sql`(${payments.paidAt} at time zone 'UTC')::date >= date_trunc(${period}, now() at time zone ${timeZone})::date`;
}

function scopedPayments(organizationId: string, scope: PaymentScope): SQL[] {
  const filters = [eq(payments.organizationId, organizationId), eq(payments.status, "SUCCEEDED")];
  if (scope.clientId) filters.push(eq(invoices.clientId, scope.clientId));
  return filters;
}

function searchFilter(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  return or(ilike(invoices.invoiceNumber, pattern), ilike(clients.name, pattern), ilike(payments.reference, pattern))!;
}

const invoiceJoin = and(eq(invoices.id, payments.invoiceId), eq(invoices.organizationId, payments.organizationId));
const clientJoin = and(eq(clients.id, invoices.clientId), eq(clients.organizationId, invoices.organizationId));

function displayName(user: { firstName: string | null; lastName: string | null; email: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

async function countByMethod(where: SQL | undefined): Promise<Record<PaymentMethodFilter, number>> {
  const countFor = (method: PaymentMethod) => sql<number>`count(*) filter (where ${methodOf} = ${method})`.mapWith(Number);

  const [row] = await db
    .select({
      all: sql<number>`count(*)`.mapWith(Number),
      BANK_TRANSFER: countFor("BANK_TRANSFER"),
      CARD: countFor("CARD"),
      CASH: countFor("CASH"),
      CHEQUE: countFor("CHEQUE"),
      OTHER: countFor("OTHER"),
    })
    .from(payments)
    .innerJoin(invoices, invoiceJoin)
    .innerJoin(clients, clientJoin)
    .where(where);

  return Object.fromEntries(paymentMethodFilters.map((filter) => [filter, row?.[filter] ?? 0])) as Record<PaymentMethodFilter, number>;
}

export async function listPayments(
  organizationId: string,
  query: PaymentListQuery,
  scope: PaymentScope = {},
): Promise<PaymentListResult> {
  const filters = scopedPayments(organizationId, scope);
  if (query.q) filters.push(searchFilter(query.q));
  const countWhere = and(...filters);
  if (query.method !== "all") filters.push(eq(methodOf, query.method));

  const [rows, counts] = await Promise.all([
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        currency: payments.currency,
        paidAt: payments.paidAt,
        reference: payments.reference,
        metadata: payments.metadata,
        invoiceId: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: clients.id,
        clientName: clients.name,
        clientArchived: sql<boolean>`${isNotNull(clients.deletedAt)}`,
        recorderFirstName: users.firstName,
        recorderLastName: users.lastName,
        recorderEmail: users.email,
      })
      .from(payments)
      .innerJoin(invoices, invoiceJoin)
      .innerJoin(clients, clientJoin)
      .leftJoin(users, eq(users.id, payments.recordedBy))
      .where(and(...filters))
      .orderBy(desc(payments.paidAt), desc(payments.createdAt), desc(payments.id))
      .limit(PAYMENTS_PAGE_SIZE)
      .offset((query.page - 1) * PAYMENTS_PAGE_SIZE),
    countByMethod(countWhere),
  ]);

  const total = counts[query.method];

  return {
    rows: rows.map(({ metadata, recorderFirstName, recorderLastName, recorderEmail, ...row }) => ({
      ...row,
      method: asPaymentMethod(metadata?.method),
      note: metadata?.note ?? null,
      recordedByName: displayName({ firstName: recorderFirstName, lastName: recorderLastName, email: recorderEmail }),
    })),
    total,
    pageCount: Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE)),
    counts,
  };
}

export async function getPaymentTotals(
  organizationId: string,
  currency: string,
  timeZone: string,
  scope: PaymentScope = {},
): Promise<PaymentTotals> {
  const inCurrency = eq(payments.currency, currency);
  const sumWhere = (condition: SQL) => sql<string>`coalesce(sum(${payments.amount}) filter (where ${condition}), 0)::text`;

  const [totals] = await db
    .select({
      thisMonth: sumWhere(and(inCurrency, paidThisPeriod("month", timeZone))!),
      thisYear: sumWhere(and(inCurrency, paidThisPeriod("year", timeZone))!),
      allTime: sumWhere(inCurrency),
      otherCurrencyCount: sql<number>`count(*) filter (where ${payments.currency} <> ${currency})`.mapWith(Number),
    })
    .from(payments)
    .innerJoin(invoices, invoiceJoin)
    .where(and(...scopedPayments(organizationId, scope)));

  return totals;
}
