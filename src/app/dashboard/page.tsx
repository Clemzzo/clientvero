import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FolderKanban, Plus, UserPlus, Users } from "lucide-react";

import { MoneySummaryCard } from "@/components/dashboard/MoneySummaryCard";
import { PipelineCard } from "@/components/dashboard/PipelineCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { SetupChecklistCard, type SetupStep } from "@/components/dashboard/SetupChecklistCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { requireOrganizationContext } from "@/server/auth/organization";
import { getDashboardOverview } from "@/server/repositories/dashboard.repository";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user, organization } = await requireOrganizationContext();
  const overview = await getDashboardOverview(organization.id, organization.currency);
  const { leads } = overview;

  const stats = [
    {
      label: "Open leads",
      value: leads.open,
      icon: <UserPlus />,
      hint: leads.total === 0 ? "Add your first lead to start" : `${leads.newThisWeek} new this week`,
    },
    {
      label: "Active clients",
      value: overview.clients.active,
      icon: <Users />,
      hint: overview.clients.active === 0 ? "Convert a won lead to get started" : "Clients you're working with",
    },
    {
      label: "Active projects",
      value: overview.projects.active,
      icon: <FolderKanban />,
      hint: overview.projects.total === 0 ? "Start one from an accepted proposal" : "Planning, in progress or in review",
    },
    {
      label: "Pending proposals",
      value: overview.proposals.pending,
      icon: <FileText />,
      hint: "Sent and awaiting a reply",
    },
  ];

  const setupSteps: SetupStep[] = [
    { label: "Create your workspace", done: true },
    { label: "Add your first lead", done: leads.total > 0, href: "/dashboard/leads/new" },
    { label: "Convert a lead to a client", done: overview.clients.active > 0, href: "/dashboard/leads" },
    { label: "Send a proposal", done: overview.proposals.sent > 0, href: "/dashboard/proposals/new" },
    { label: "Start a project", done: overview.projects.total > 0, href: "/dashboard/projects/new" },
    { label: "Invite a client to the portal", done: false },
    { label: "Send an invoice", done: false },
  ];

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title={`Welcome back${user.firstName ? `, ${user.firstName}` : ""}`}
        description={`Here's what's happening at ${organization.name}.`}
        actions={
          <Button asChild className="rounded-lg">
            <Link href="/dashboard/leads/new">
              <Plus aria-hidden className="size-4" />
              New lead
            </Link>
          </Button>
        }
      />

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCard icon={stat.icon} label={stat.label} value={String(stat.value)} hint={stat.hint} />
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineCard leads={leads} currency={organization.currency} />
        </div>
        <MoneySummaryCard money={overview.money} currency={organization.currency} />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityCard entries={overview.recentActivity} />
        </div>
        <SetupChecklistCard steps={setupSteps} />
      </div>
    </div>
  );
}
