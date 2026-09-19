import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { PortalFilesMessages } from "@/components/marketing/product/client-portal/portal-files-messages";
import { PortalHomePreview } from "@/components/marketing/product/client-portal/portal-home-preview";
import { PortalOverview } from "@/components/marketing/product/client-portal/portal-overview";
import { PortalPrivacy } from "@/components/marketing/product/client-portal/portal-privacy";
import { PortalProgress } from "@/components/marketing/product/client-portal/portal-progress";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { plans } from "@/features/subscriptions/plans";

function freePortalLine() {
  const clients = plans.find((plan) => plan.id === "free")?.limits.clients;

  return clients
    ? `Every plan includes a client portal, even Free for up to ${clients} clients. No credit card required.`
    : "Every plan includes a client portal, even Free. No credit card required.";
}

export const metadata: Metadata = {
  title: "Client portal",
  description:
    "Give every client a private portal to follow project progress, view invoices, download files, and message you, without status-update emails.",
};

export default function ClientPortalProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Client portal"
        title="A private portal for every client."
        intro="Invite clients to their own space to follow progress, view invoices, download files, and message you. They always know where things stand, and you stop writing status-update emails."
        preview={<PortalHomePreview />}
      />
      <PortalOverview />
      <PortalProgress />
      <PortalFilesMessages />
      <PortalPrivacy />
      <FinalCta title="Give every client a place to follow the work." description={freePortalLine()} />
    </>
  );
}
