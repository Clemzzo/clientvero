import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Pencil, Users } from "lucide-react";

import { ConvertLeadButton } from "@/components/leads/ConvertLeadButton";
import { LeadDetails } from "@/components/leads/LeadDetails";
import { LeadStatusMenu } from "@/components/leads/LeadStatusMenu";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { BackLink } from "@/components/shared/BackLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { activityResources } from "@/features/activity/activity-actions";
import { leadStatusLabels, leadStatusTones } from "@/features/leads/lead-status";
import { noticeSchema } from "@/features/notices";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listActivity } from "@/server/services/activity.service";
import { getConversionClientId } from "@/server/services/lead-conversion.service";

import { loadLead } from "./load-lead";

export async function generateMetadata(props: PageProps<"/dashboard/leads/[id]">): Promise<Metadata> {
  const { lead } = await loadLead((await props.params).id);
  return { title: lead.name };
}

export default async function LeadPage(props: PageProps<"/dashboard/leads/[id]">) {
  const { ctx, lead } = await loadLead((await props.params).id);
  const activity = await listActivity(ctx.organization.id, activityResources.lead, lead.id);
  const canUpdate = hasPermission(ctx.membership.role, permissions.leadsUpdate);
  const canConvert = canUpdate && hasPermission(ctx.membership.role, permissions.clientsCreate);
  const isConverted = lead.status === "WON";
  const clientId = isConverted ? await getConversionClientId(ctx.organization.id, lead.id) : null;
  const notice = noticeSchema.parse((await props.searchParams).notice);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <UrlNotice notice={notice} message={`${lead.name} was added to your leads.`} />
      <BackLink href="/dashboard/leads">Leads</BackLink>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(24px,2.2vw,30px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
              {lead.name}
            </h1>
            <StatusBadge label={leadStatusLabels[lead.status]} tone={leadStatusTones[lead.status]} />
          </div>
          {lead.company && <p className="mt-1.5 text-[15px] text-ink-500">{lead.company}</p>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {canUpdate && !isConverted && (
            <LeadStatusMenu leadId={lead.id} leadName={lead.name} status={lead.status} variant="button" />
          )}
          {canUpdate && (
            <Button asChild variant="outline" className="h-10 rounded-lg">
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Pencil aria-hidden className="size-4" />
                Edit
              </Link>
            </Button>
          )}
          {canConvert && !isConverted && <ConvertLeadButton leadId={lead.id} leadName={lead.name} />}
          {clientId && (
            <Button asChild className="h-10 rounded-lg">
              <Link href={`/dashboard/clients/${clientId}`}>
                <Users aria-hidden className="size-4" />
                View client
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadDetails lead={lead} />
        </div>

        <Card>
          <CardHeader title="Activity" />
          {activity.length === 0 ? (
            <EmptyState icon={<Activity />} title="No activity yet" description="Changes to this lead will show up here." />
          ) : (
            <div className="mt-2 px-5 pb-3 sm:px-6">
              <ActivityTimeline entries={activity} showSubject={false} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
