import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { FileText, FolderKanban, UserPlus, Users } from "lucide-react";

import { GetStartedBanner } from "@/components/dashboard/GetStartedBanner";
import { MoneySummaryCard } from "@/components/dashboard/MoneySummaryCard";
import { PipelineCard } from "@/components/dashboard/PipelineCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { SetupChecklistCard, type SetupStep } from "@/components/dashboard/SetupChecklistCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { dashboardHighlights } from "@/features/dashboard/highlights";
import { noticeSchema } from "@/features/notices";
import { resolveTimeZone } from "@/lib/utils/timezone";
import { requireOrganizationContext } from "@/server/auth/organization";
import { getDashboardOverview } from "@/server/repositories/dashboard.repository";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Stat = ComponentProps<typeof StatCard>;

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const { user, organization } = await requireOrganizationContext();
  const notice = noticeSchema.parse((await props.searchParams).notice);
  const overview = await getDashboardOverview(organization.id, organization.currency, resolveTimeZone(user.timezone));
  const { leads, clients, projects, proposals } = overview;

  const stats: Stat[] = [
    {
      label: "Open leads",
      value: String(leads.open),
      icon: <UserPlus />,
      tone: "brand",
      href: "/dashboard/leads",
      hint: leads.total === 0 ? "Add your first lead to start" : `${leads.newThisWeek} new this week`,
    },
    {
      label: "Active clients",
      value: String(clients.active),
      icon: <Users />,
      tone: "grape",
      href: "/dashboard/clients",
      hint: clients.active === 0 ? "Convert a won lead to get started" : "Clients you're working with",
    },
    {
      label: "Active projects",
      value: String(projects.active),
      icon: <FolderKanban />,
      tone: "ocean",
      href: "/dashboard/projects",
      hint: projects.total === 0 ? "Start one from an accepted proposal" : "Planning, in progress or in review",
    },
    {
      label: "Pending proposals",
      value: String(proposals.pending),
      icon: <FileText />,
      tone: "sun",
      href: "/dashboard/proposals",
      hint: "Sent and awaiting a reply",
    },
  ];

  const setupSteps: SetupStep[] = [
    { label: "Create your workspace", done: true },
    { label: "Add your first lead", done: leads.total > 0, href: "/dashboard/leads/new" },
    { label: "Convert a lead to a client", done: clients.active > 0, href: "/dashboard/leads" },
    { label: "Send a proposal", done: proposals.sent > 0, href: "/dashboard/proposals/new" },
    { label: "Start a project", done: projects.total > 0, href: "/dashboard/projects/new" },
    { label: "Invite a client to the portal", done: overview.setup.portalInvited, href: "/dashboard/clients" },
    { label: "Send an invoice", done: overview.setup.invoiceSent, href: "/dashboard/invoices/new" },
  ];
  const setupComplete = setupSteps.every((step) => step.done);
  const nextStep = setupSteps.find((step) => !step.done && step.href);

  return (
    <div className="mx-auto max-w-300 space-y-6 px-4 py-8 sm:px-8 lg:py-10">
      <UrlNotice notice={notice} message={`Welcome to ${organization.name}! You've joined the workspace.`} />
      <PageHeader
        title={`Welcome back${user.firstName ? `, ${user.firstName}` : ""}`}
        description={dashboardHighlights({
          pendingProposals: proposals.pending,
          activeProjects: projects.active,
          newLeadsThisWeek: leads.newThisWeek,
        }).join(" · ")}
      />

      {nextStep?.href && (
        <GetStartedBanner
          title="Get started with ClientVero"
          description="Set up your workspace in a few steps — add leads, win clients, deliver projects and get paid, all from one place."
          primaryAction={{ label: nextStep.label, href: nextStep.href }}
          secondaryAction={{ label: "Read the guides", href: "/guides" }}
        />
      )}

      <ul aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCard {...stat} />
          </li>
        ))}
      </ul>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <PipelineCard leads={leads} currency={organization.currency} />
          <RecentActivityCard entries={overview.recentActivity} />
        </div>

        <aside aria-label="Money and setup" className="space-y-4">
          <MoneySummaryCard money={overview.money} currency={organization.currency} />
          {!setupComplete && <SetupChecklistCard steps={setupSteps} />}
        </aside>
      </div>
    </div>
  );
}
