import type { InvoiceTone } from "@/features/invoices/invoice-status";

type ToneStyle = {
  spine: string;
  badge: string;
};

export const invoiceToneStyles: Record<InvoiceTone, ToneStyle> = {
  draft: { spine: "bg-grape-500", badge: "bg-grape-50 text-grape-700" },
  inFlight: { spine: "bg-ocean-500", badge: "bg-ocean-50 text-ocean-700" },
  partial: { spine: "bg-sun-500", badge: "bg-sun-50 text-sun-700" },
  late: { spine: "bg-coral-500", badge: "bg-coral-50 text-coral-700" },
  settled: { spine: "bg-mint-500", badge: "bg-mint-50 text-mint-700" },
  void: { spine: "bg-ink-200", badge: "bg-ink-100 text-ink-500" },
};

export const duePhraseStyles = {
  settled: "text-mint-700",
  late: "text-coral-700",
  soon: "text-sun-700",
  neutral: "text-ink-500",
} as const;
