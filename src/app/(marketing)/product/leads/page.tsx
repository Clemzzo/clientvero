import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { LeadRecordPreview } from "@/components/marketing/product/lead-record-preview";
import { LeadConversion, LeadPipeline, LeadSearch } from "@/components/marketing/product/lead-sections";
import { ProductHero } from "@/components/marketing/product/product-hero";

export const metadata: Metadata = {
  title: "Lead management",
  description:
    "Keep every enquiry in one list, track each lead through clear stages, and convert the right ones into clients in one step.",
};

export default function LeadsProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Leads"
        title="Capture every enquiry. Win the right ones."
        intro="Keep every lead from email, referrals, social, and your website in one list, see where each one stands, and turn the good ones into clients in one step."
        preview={<LeadRecordPreview />}
      />
      <LeadPipeline />
      <LeadConversion />
      <LeadSearch />
      <FinalCta />
    </>
  );
}
