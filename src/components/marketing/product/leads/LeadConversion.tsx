import { CheckList, HandoffPreview, ProductSection } from "@/components/marketing/product/product-section";
import { createElement } from "react";

const carriedOver = 
["Name and email", 
  "Phone number", 
  "Company and website"];

const conversionSteps = [
  "The lead is marked Won",
  "Its notes and activity stay attached",
  "If anything fails, nothing is half-converted",
];

export function LeadConversion() {
  return createElement(
    ProductSection,
    {
      id: "convert",
      title: "From lead to client in one click.",
      intro: "When a lead says yes, convert it and start sending proposals straight away. No retyping details into another tool.",
      dark: true,
      children: createElement(
        "div",
        { className: "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16" },
        createElement(
          "div",
          { className: "grid gap-8 sm:grid-cols-2" },
          createElement(CheckList, { title: "What carries over", items: carriedOver }),
          createElement(CheckList, { title: "What happens", items: conversionSteps }),
        ),
        createElement(HandoffPreview, {
          from: { 
            label: "Lead", 
            status: "Won", 
            tone: "emerald", 
            title: "Olivia Park", 
            detail: "Park & Co." },
            
          to: {
            label: "Client",
            status: "Active",
            tone: "brand",
            title: "Park & Co.",
            detail: "Olivia Park, primary contact",
          },
        }),
      ),
    },
  );
}
