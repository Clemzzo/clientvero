import { ChartNoAxesColumn, Flag, FolderKanban, MessageSquare, Paperclip, ReceiptText } from "lucide-react";

import { FeatureCards, ProductSection, type FeatureCard } from "@/components/marketing/product/product-section";

const portalAreas: FeatureCard[] = [
  { title: "Projects", detail: "Every project you're working on for them, with its current status.", icon: FolderKanban },
  { title: "Milestones", detail: "The steps of each project, what's done, and what's due next.", icon: Flag },
  {
    title: "Progress",
    detail: "A clear percentage that moves forward each time you complete a milestone.",
    icon: ChartNoAxesColumn,
  },
  { title: "Invoices", detail: "What they've been billed, what's paid, and what's still due.", icon: ReceiptText },
  { title: "Files", detail: "Deliverables and documents you've shared, ready to download.", icon: Paperclip },
  { title: "Messages", detail: "One conversation per project, instead of a scattered email thread.", icon: MessageSquare },
];

export function PortalOverview() {
  return (
    <ProductSection
      id="overview"
      title="One place for everything you share."
      intro="Your client signs in and finds the work you're doing for them, laid out clearly. No attachments to dig for, no asking where things stand."
      className="bg-ink-50"
    >
      <FeatureCards items={portalAreas} />
    </ProductSection>
  );
}
