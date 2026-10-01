import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeadForm } from "@/components/leads/LeadForm";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { updateLeadAction } from "@/server/actions/leads";
import { hasPermission, permissions } from "@/server/authorization/permissions";

import { loadLead } from "../load-lead";

export async function generateMetadata(props: PageProps<"/dashboard/leads/[id]/edit">): Promise<Metadata> {
  const { lead } = await loadLead((await props.params).id);
  return { title: `Edit ${lead.name}` };
}

export default async function EditLeadPage(props: PageProps<"/dashboard/leads/[id]/edit">) {
  const { ctx, lead } = await loadLead((await props.params).id);

  if (!hasPermission(ctx.membership.role, permissions.leadsUpdate)) {
    notFound();
  }

  const detailHref = `/dashboard/leads/${lead.id}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href={detailHref}>{lead.name}</BackLink>
      <div className="mt-4">
        <PageHeader title="Edit lead" />
      </div>
      <div className="mt-8">
        <LeadForm
          action={updateLeadAction.bind(null, lead.id)}
          defaultCurrency={ctx.organization.currency}
          lead={lead}
          cancelHref={detailHref}
        />
      </div>
    </div>
  );
}
