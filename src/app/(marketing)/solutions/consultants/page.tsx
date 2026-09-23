import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ConsultantAiAssist } from "@/components/marketing/solutions/consultants/ConsultantAiAssist";
import { ConsultantBilling } from "@/components/marketing/solutions/consultants/ConsultantBilling";
import { ConsultantEngagementPreview } from "@/components/marketing/solutions/consultants/ConsultantEngagementPreview";
import { ConsultantPhases } from "@/components/marketing/solutions/consultants/ConsultantPhases";
import { ConsultantProposals } from "@/components/marketing/solutions/consultants/ConsultantProposals";
import { ConsultantStakeholders } from "@/components/marketing/solutions/consultants/ConsultantStakeholders";
import { formatPlanPrice, plans } from "@/features/subscriptions/plans";

function proPlanLine() {
  const pro = plans.find((plan) => plan.id === "pro");

  return pro
    ? `Start free, then move to Pro for ${formatPlanPrice(pro)} a month for unlimited clients, the full portal, and AI drafts.`
    : "Start free, then upgrade when you need unlimited clients, the full portal, and AI drafts.";
}

export const metadata: Metadata = {
  title: "For consultants",
  description:
    "Send proposals that sell your expertise, keep every stakeholder in one client record, deliver in clear phases, and bill each one from a single workspace.",
};

export default function ConsultantsSolutionPage() {
  return (
    <>
      <ProductHero
        eyebrow="For consultants"
        title="Look established from day one."
        intro="Proposals, stakeholders, engagement phases, reports, and invoices in one workspace. Give every client the experience of working with a firm, even when the firm is you."
        preview={<ConsultantEngagementPreview />}
      />
      <ConsultantProposals />
      <ConsultantStakeholders />
      <ConsultantPhases />
      <ConsultantAiAssist />
      <ConsultantBilling />
      <FinalCta title="Run every engagement like a firm." description={proPlanLine()} />
    </>
  );
}
