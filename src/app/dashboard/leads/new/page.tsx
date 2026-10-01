import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/shared/BackLink";
import { LeadForm } from "@/components/leads/LeadForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { createLeadAction } from "@/server/actions/leads";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";

export const metadata: Metadata = {
  title: "New lead",
};

export default async function NewLeadPage() {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.leadsCreate)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/leads">Leads</BackLink>
      <div className="mt-4">
        <PageHeader title="New lead" description="Only the name is required. You can fill in the rest later." />
      </div>
      <div className="mt-8">
        <LeadForm action={createLeadAction} defaultCurrency={organization.currency} cancelHref="/dashboard/leads" />
      </div>
    </div>
  );
}
