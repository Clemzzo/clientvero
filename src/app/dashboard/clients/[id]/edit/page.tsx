import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/clients/ClientForm";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { countryOptions } from "@/features/organizations/business-profile";
import { updateClientAction } from "@/server/actions/clients";
import { hasPermission, permissions } from "@/server/authorization/permissions";

import { loadClient } from "../load-client";

export async function generateMetadata(props: PageProps<"/dashboard/clients/[id]/edit">): Promise<Metadata> {
  const { client } = await loadClient((await props.params).id);
  return { title: `Edit ${client.name}` };
}

export default async function EditClientPage(props: PageProps<"/dashboard/clients/[id]/edit">) {
  const { ctx, client } = await loadClient((await props.params).id);

  if (!hasPermission(ctx.membership.role, permissions.clientsUpdate)) {
    notFound();
  }

  const detailHref = `/dashboard/clients/${client.id}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href={detailHref}>{client.name}</BackLink>
      <div className="mt-4">
        <PageHeader title="Edit client" />
      </div>
      <div className="mt-8">
        <ClientForm
          action={updateClientAction.bind(null, client.id)}
          countries={countryOptions()}
          client={client}
          cancelHref={detailHref}
        />
      </div>
    </div>
  );
}
