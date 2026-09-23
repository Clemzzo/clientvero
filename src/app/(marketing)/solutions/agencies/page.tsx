import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { AgencyActivity } from "@/components/marketing/solutions/agencies/AgencyActivity";
import { AgencyClientView } from "@/components/marketing/solutions/agencies/AgencyClientView";
import { AgencyPipeline } from "@/components/marketing/solutions/agencies/AgencyPipeline";
import { AgencyPlan } from "@/components/marketing/solutions/agencies/AgencyPlan";
import { AgencyRoles } from "@/components/marketing/solutions/agencies/AgencyRoles";
import { AgencyWorkspacePreview } from "@/components/marketing/solutions/agencies/AgencyWorkspacePreview";
import { formatPlanPrice, plans } from "@/features/subscriptions/plans";

function agencyPlanLine() {
  const agency = plans.find((plan) => plan.id === "agency");

  return agency
    ? `The Agency plan is ${formatPlanPrice(agency)} a month for your whole workspace, with roles, permissions, and a portal for every client.`
    : "Bring your whole team into one workspace, with roles, permissions, and a portal for every client.";
}

export const metadata: Metadata = {
  title: "For small agencies",
  description:
    "Give your team of 2–20 one shared workspace for leads, clients, projects, and invoices, with roles, a shared activity log, and a private portal for every client.",
};

export default function AgenciesSolutionPage() {
  return (
    <>
      <ProductHero
        eyebrow="For small agencies"
        title="Keep a team of 2–20 aligned."
        intro="One shared workspace for your leads, clients, projects, and invoices. Everyone knows who owns what, and every client gets the same polished experience."
        preview={<AgencyWorkspacePreview />}
      />
      <AgencyRoles />
      <AgencyPipeline />
      <AgencyActivity />
      <AgencyClientView />
      <AgencyPlan />
      <FinalCta title="Run your studio from one shared workspace." description={agencyPlanLine()} />
    </>
  );
}
