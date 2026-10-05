import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/clients/ClientForm";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { countryOptions } from "@/features/organizations/business-profile";
import { createClientAction } from "@/server/actions/clients";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";

export const metadata: Metadata = {
  title: "New client",
};

export default async function NewClientPage() {
  const { membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.clientsCreate)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/clients">Clients</BackLink>
      <div className="mt-4">
        <PageHeader title="New client" description="Only the name is required. Add an email if you want to invite them to your client portal." />
      </div>
      <div className="mt-8">
        <ClientForm action={createClientAction} countries={countryOptions()} cancelHref="/dashboard/clients" />
      </div>
    </div>
  );
}
