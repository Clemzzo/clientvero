import type { Metadata } from "next";

import { Pricing } from "@/components/marketing/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple monthly plans for freelancers and small agencies. Start free, then upgrade when you need more clients or a team.",
};

export default function PricingPage() {
  return <Pricing />;
}
