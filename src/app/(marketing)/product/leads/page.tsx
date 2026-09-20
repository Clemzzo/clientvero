import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { LeadConversion } from "@/components/marketing/product/leads/lead-conversion";
import { LeadPipeline } from "@/components/marketing/product/leads/lead-pipeline";
import { LeadRecordPreview } from "@/components/marketing/product/leads/lead-record-preview";
import { LeadSearch } from "@/components/marketing/product/leads/lead-search";
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
      <FinalCta
        title="Turn your next enquiry into a client."
        description="Start free and keep every enquiry in one list, from first message to new client. No credit card required."
      />
    </>
  );
}
