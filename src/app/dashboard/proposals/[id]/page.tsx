import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";

import { ProposalActions } from "@/components/proposals/ProposalActions";
import { ProposalDocument } from "@/components/proposals/ProposalDocument";
import { ProposalStatusTimeline } from "@/components/proposals/ProposalStatusTimeline";
import { ProposalSummaryCard } from "@/components/proposals/ProposalSummaryCard";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { BackLink } from "@/components/shared/BackLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { Card, CardHeader } from "@/components/ui/card";
import { activityResources } from "@/features/activity/activity-actions";
import { noticeSchema } from "@/features/notices";
import { proposalStatusLabels, proposalStatusTones } from "@/features/proposals/proposal-status";
import { proposalPublicUrl } from "@/lib/utils/public-url";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listActivity } from "@/server/services/activity.service";
import { getSignerName } from "@/server/services/proposal.service";

import { loadProposal } from "./load-proposal";

export async function generateMetadata(props: PageProps<"/dashboard/proposals/[id]">): Promise<Metadata> {
  const { proposal } = await loadProposal((await props.params).id);
  return { title: proposal.title };
}

export default async function ProposalPage(props: PageProps<"/dashboard/proposals/[id]">) {
  const { ctx, proposal } = await loadProposal((await props.params).id);
  const notice = noticeSchema.parse((await props.searchParams).notice);
  const [activity, signerName] = await Promise.all([
    listActivity(ctx.organization.id, activityResources.proposal, proposal.id),
    proposal.status === "ACCEPTED" ? getSignerName(proposal) : null,
  ]);
  const role = ctx.membership.role;

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <UrlNotice
        notice={notice}
        message={notice === "proposal-created" ? "Proposal saved as a draft." : "Your changes were saved."}
      />
      <BackLink href="/dashboard/proposals">Proposals</BackLink>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(24px,2.2vw,30px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
              {proposal.title}
            </h1>
            <StatusBadge label={proposalStatusLabels[proposal.status]} tone={proposalStatusTones[proposal.status]} />
          </div>
          <p className="mt-1.5 text-[15px] text-ink-500">
            For{" "}
            <Link href={`/dashboard/clients/${proposal.clientId}`} className="font-medium text-ink-700 hover:text-brand-700">
              {proposal.clientName}
            </Link>
          </p>
        </div>

        <ProposalActions
          proposalId={proposal.id}
          status={proposal.status}
          publicUrl={proposalPublicUrl(proposal.publicId)}
          canManage={hasPermission(role, permissions.proposalsCreate)}
          canSendProposals={hasPermission(role, permissions.proposalsSend)}
        />
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ProposalDocument proposal={{ ...proposal, organizationName: ctx.organization.name }} />

        <aside className="space-y-4 lg:sticky lg:top-24">
          <ProposalSummaryCard proposal={proposal} />
          <ProposalStatusTimeline proposal={proposal} signerName={signerName} />
          <Card>
            <CardHeader title="Activity" />
            {activity.length === 0 ? (
              <EmptyState icon={<Activity />} title="No activity yet" description="Changes to this proposal show up here." />
            ) : (
              <div className="mt-2 px-5 pb-3 sm:px-6">
                <ActivityTimeline entries={activity} showSubject={false} />
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
