import { invoiceTotals } from "@/lib/utils/money";

const AMOUNT = /^\d{1,12}(\.\d{1,2})?$/;
const QUANTITY = /^\d{1,8}(\.\d{1,2})?$/;

function clean(value: string) {
  return value.replaceAll(",", "").trim();
}

export function previewTotals(lines: { quantity: string; unitPrice: string }[], discount: string) {
  const items = lines.map((line) => ({
    quantity: QUANTITY.test(clean(line.quantity)) ? clean(line.quantity) : "0",
    unitPrice: AMOUNT.test(clean(line.unitPrice)) ? clean(line.unitPrice) : "0",
  }));
  const safeDiscount = AMOUNT.test(clean(discount)) ? clean(discount) : "0";

  return { ...invoiceTotals({ items, discount: safeDiscount }), items, discount: safeDiscount };
}
