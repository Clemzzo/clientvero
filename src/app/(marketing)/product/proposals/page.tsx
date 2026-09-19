import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProposalDocumentPreview } from "@/components/marketing/product/proposals/proposal-document-preview";
import {
  ProposalAcceptance,
  ProposalBuilder,
  ProposalTracking,
} from "@/components/marketing/product/proposals/proposal-sections";
import { plans } from "@/features/subscriptions/plans";

function freeProposalsLine() {
  const proposals = plans.find((plan) => plan.id === "free")?.limits.proposalsPerMonth;

  return proposals
    ? `Send up to ${proposals} proposals a month on the Free plan and see the moment each one is opened. No credit card required.`
    : "Send proposals free and see the moment each one is opened. No credit card required.";
}

export const metadata: Metadata = {
  title: "Online proposals",
  description:
    "Build clear proposals with scope, pricing, timeline, and terms, send them as a private link, see when they're opened, and let clients accept online.",
};

export default function ProposalsProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Proposals"
        title="Send proposals clients can say yes to."
        intro="Put scope, pricing, timeline, and terms in one clear proposal, send it as a private link, and let your client accept it online. You'll know the moment they open it."
        preview={<ProposalDocumentPreview />}
      />
      <ProposalBuilder />
      <ProposalTracking />
      <ProposalAcceptance />
      <FinalCta title="Get your next proposal accepted online." description={freeProposalsLine()} />
    </>
  );
}
