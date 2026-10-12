import { Banknote, CircleDollarSign, CreditCard, Landmark, ScrollText } from "lucide-react";
import type { ReactNode } from "react";

import type { PaymentMethod } from "@/features/invoices/payment-methods";

export const paymentMethodIcons: Record<PaymentMethod, ReactNode> = {
  BANK_TRANSFER: <Landmark />,
  CARD: <CreditCard />,
  CASH: <Banknote />,
  CHEQUE: <ScrollText />,
  OTHER: <CircleDollarSign />,
};
