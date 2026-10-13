export const paymentMethods = ["BANK_TRANSFER", "CARD", "CASH", "CHEQUE", "OTHER"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CASH: "Cash",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export function asPaymentMethod(value: string | undefined): PaymentMethod {
  return (paymentMethods as readonly string[]).includes(value ?? "") ? (value as PaymentMethod) : "OTHER";
}

export const paymentMethodFilters = ["all", ...paymentMethods] as const;

export type PaymentMethodFilter = (typeof paymentMethodFilters)[number];

export const paymentMethodFilterLabels: Record<PaymentMethodFilter, string> = {
  all: "All",
  ...paymentMethodLabels,
};
