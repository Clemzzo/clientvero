import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { FreelancerDeskPreview } from "@/components/marketing/solutions/freelancers/FreelancerDeskPreview";
import { FreelancerLoop } from "@/components/marketing/solutions/freelancers/FreelancerLoop";
import { FreelancerPayments } from "@/components/marketing/solutions/freelancers/FreelancerPayments";
import { FreelancerPricing } from "@/components/marketing/solutions/freelancers/FreelancerPricing";
import { FreelancerProfessional } from "@/components/marketing/solutions/freelancers/FreelancerProfessional";
import { FreelancerToolSwap } from "@/components/marketing/solutions/freelancers/FreelancerToolSwap";
import { plans } from "@/features/subscriptions/plans";

function freeFreelancerLine() {
  const clients = plans.find((plan) => plan.id === "free")?.limits.clients;

  return clients
    ? `Start free with up to ${clients} clients and a client portal included. No credit card required.`
    : "Start free with a client portal included. No credit card required.";
}

export const metadata: Metadata = {
  title: "For freelancers",
  description:
    "Run your freelance business from one place: track leads, send proposals, share progress in a client portal, and get paid without the admin.",
};

export default function FreelancersSolutionPage() {
  return (
    <>
      <ProductHero
        eyebrow="For freelancers"
        title="Run solo without the admin."
        intro="Leads, proposals, projects, invoices, and client updates in one workspace built for a business of one. Spend your hours on client work, not on keeping five apps in sync."
        preview={<FreelancerDeskPreview />}
      />
      <FreelancerToolSwap />
      <FreelancerLoop />
      <FreelancerProfessional />
      <FreelancerPayments />
      <FreelancerPricing />
      <FinalCta title="Spend less time on admin and more on the work." description={freeFreelancerLine()} />
    </>
  );
}
