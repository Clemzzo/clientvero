import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { ClientRecordPreview } from "@/components/marketing/product/clients/client-record-preview";
import { ClientAccess, ClientRecord } from "@/components/marketing/product/clients/client-sections";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { plans } from "@/features/subscriptions/plans";

function freeClientsLine() {
  const clients = plans.find((plan) => plan.id === "free")?.limits.clients;

  return clients
    ? `Manage up to ${clients} clients on the Free plan, with a client portal included. No credit card required.`
    : "Manage your clients free, with a client portal included. No credit card required.";
}

export const metadata: Metadata = {
  title: "Client management",
  description:
    "Keep contacts, projects, proposals, invoices, files, and messages together for every client, and invite them to a private portal.",
};

export default function ClientsProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Clients"
        title="Every client relationship in one place."
        intro="Keep contacts, projects, proposals, invoices, files, and messages together for each client, so you never dig through old emails to find what was agreed."
        preview={<ClientRecordPreview />}
      />
      <ClientRecord />
      <ClientAccess />
      <FinalCta title="Give every client one clear record." description={freeClientsLine()} />
    </>
  );
}
