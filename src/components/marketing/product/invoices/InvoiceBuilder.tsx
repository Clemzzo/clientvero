import { CalendarDays, Eye, FolderKanban, Hash, ListPlus, Percent } from "lucide-react";

import { FeatureCards, ProductSection, type FeatureCard } from "@/components/marketing/product/product-section";

const builderTools: FeatureCard[] = [
  {
    title: "Line items",
    detail: "Add a quantity and unit price, and each line and the total are worked out for you.",
    icon: ListPlus,
  },
  {
    title: "Tax and discount",
    detail: "Apply a discount and your tax rate, in the currency you bill in.",
    icon: Percent,
  },
  {
    title: "Automatic numbering",
    detail: "Invoices are numbered in order, INV-0001, INV-0002, and a number is never used twice.",
    icon: Hash,
  },
  {
    title: "Due date",
    detail: "Set when payment is due. Once it passes, the invoice is marked Overdue.",
    icon: CalendarDays,
  },
  {
    title: "Linked to the work",
    detail: "Each invoice sits on the client's record, next to the project it's for.",
    icon: FolderKanban,
  },
  { title: "Preview", detail: "See the invoice exactly as your client will before you send it.", icon: Eye },
];

export function InvoiceBuilder() {
  return (
    <ProductSection
      id="builder"
      title="A professional invoice in a few minutes."
      intro="Pick the client, add what you did, and send. Totals are calculated for you, so they always add up."
      className="bg-ink-50"
    >
      <FeatureCards items={builderTools} />
    </ProductSection>
  );
}
