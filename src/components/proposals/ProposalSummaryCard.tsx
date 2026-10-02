import { Card, CardHeader } from "@/components/ui/card";
import type { Proposal } from "@/db/schema";
import { formatMoney } from "@/lib/utils/format";
import { isZeroAmount } from "@/lib/utils/money";

type ProposalSummaryCardProps = {
  proposal: Pick<Proposal, "currency" | "subtotal" | "discount" | "tax" | "total">;
};

export function ProposalSummaryCard({ proposal }: ProposalSummaryCardProps) {
  const rows = [
    { label: "Amount", value: proposal.subtotal },
    { label: "Discount", value: `-${proposal.discount}`, hidden: isZeroAmount(proposal.discount) },
    { label: "Tax", value: proposal.tax, hidden: isZeroAmount(proposal.tax) },
  ].filter((row) => !row.hidden);

  return (
    <Card>
      <CardHeader title="Summary" />
      <div className="mx-5 mt-4 rounded-xl border border-mint-200 bg-mint-50 px-4 py-4 sm:mx-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mint-800">Total</p>
        <p className="mt-1 font-display text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums text-mint-800">
          {formatMoney(proposal.total, proposal.currency)}
        </p>
      </div>
      <dl className="divide-y divide-ink-200 px-5 pb-2 pt-2 sm:px-6">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-3 text-[14px]">
            <dt className="text-ink-500">{row.label}</dt>
            <dd className="font-medium tabular-nums text-ink-900">{formatMoney(row.value, proposal.currency)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
