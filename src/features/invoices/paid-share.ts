import { toCents } from "@/lib/utils/money";

export function paidShare(amountPaid: string, total: string): number {
  const whole = toCents(total);
  if (whole <= 0n) return 0;

  const basisPoints = (toCents(amountPaid) * 10_000n) / whole;
  return Math.min(100, Number(basisPoints) / 100);
}
