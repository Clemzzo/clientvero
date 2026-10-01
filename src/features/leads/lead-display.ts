import type { Lead } from "@/db/schema";
import { formatMoney } from "@/lib/utils/format";

export function leadValue(lead: Pick<Lead, "estimatedValue" | "currency">): string | null {
  return lead.estimatedValue && lead.currency ? formatMoney(lead.estimatedValue, lead.currency) : null;
}
