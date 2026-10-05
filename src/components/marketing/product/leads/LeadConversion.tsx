import { CheckList, HandoffPreview, ProductSection } from "@/components/marketing/product/ProductSection";

const carriedOver = ["Name and email", "Phone number", "Company and website"];

const conversionSteps = [
  "The lead is marked Won",
  "Its notes and activity stay attached",
  "If anything fails, nothing is half-converted",
];

export function LeadConversion() {
  return (
    <ProductSection
      id="convert"
      title="From lead to client in one click."
      intro="When a lead says yes, convert it and start sending proposals straight away. No retyping details into another tool."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <CheckList title="What carries over" items={carriedOver} />
          <CheckList title="What happens" items={conversionSteps} />
        </div>
        <HandoffPreview
          from={{ label: "Lead", status: "Won", tone: "emerald", title: "Olivia Park", detail: "Park & Co." }}
          to={{
            label: "Client",
            status: "Active",
            tone: "brand",
            title: "Park & Co.",
            detail: "olivia@parkandco.com",
          }}
        />
      </div>
    </ProductSection>
  );
}
