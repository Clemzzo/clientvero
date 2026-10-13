import Link from "next/link";
import { Banknote, SearchX } from "lucide-react";

import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/format";
import type { PaymentListResult, PaymentTotals } from "@/server/repositories/payment.repository";

type ClientPaymentsProps = {
  clientId: string;
  result: PaymentListResult;
  totals: PaymentTotals;
  currency: string;
  page: number;
};

export function ClientPayments({ clientId, result, totals, currency, page }: ClientPaymentsProps) {
  const tabPath = `/dashboard/clients/${clientId}`;

  if (result.total === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Banknote />}
          title="No payments yet"
          description="Payments you record on this client's invoices will show up here."
          className="py-14"
        />
      </Card>
    );
  }

  if (result.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<SearchX />}
          title="This page is empty"
          description={`There ${result.pageCount === 1 ? "is only 1 page" : `are only ${result.pageCount} pages`} of payments.`}
          action={
            <Button asChild variant="outline" className="rounded-lg">
              <Link href={`${tabPath}?tab=payments`}>Go to the first page</Link>
            </Button>
          }
          className="py-14"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-ink-500">
        Received in total:{" "}
        <span className="font-display text-[16px] font-semibold tabular-nums text-ink-900">{formatMoney(totals.allTime, currency)}</span>
        {totals.otherCurrencyCount > 0 && ` (plus ${totals.otherCurrencyCount} in other currencies)`}
      </p>
      <PaymentsTable payments={result.rows} showClient={false} />
      <Pagination page={page} pageCount={result.pageCount} pathname={tabPath} searchParams={{ tab: "payments" }} />
    </div>
  );
}
