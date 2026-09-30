import { Filter, Search, UserPlus } from "lucide-react";

import {
  FeatureCards,
  ProductSection,
  type FeatureCard,
} from "@/components/marketing/product/product-section";

const tools: FeatureCard[] = [
  { title: "Search", detail: "Look up any lead by name, company, or email.", icon: Search },
  { title: "Filter", detail: "Narrow the list by status or where the lead came from.", icon: Filter },
  {
    title: "Assign",
    detail: "On the Agency plan, give a lead to a teammate so nothing slips.",
    icon: UserPlus,
  },
];

export function LeadSearch() {
  return (
    <ProductSection
      id="find"
      title="Find any lead in seconds."
      intro="A growing list stays easy to work with."
      className="bg-ink-50"
    >
      <FeatureCards items={tools} />
    </ProductSection>
  );
}
