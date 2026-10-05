import { activityResources, type ActivityResource } from "@/features/activity/activity-actions";

export const activityFilters = ["all", "leads", "clients", "proposals", "projects"] as const;

export type ActivityFilter = (typeof activityFilters)[number];

export const activityFilterResources: Record<Exclude<ActivityFilter, "all">, ActivityResource> = {
  leads: activityResources.lead,
  clients: activityResources.client,
  proposals: activityResources.proposal,
  projects: activityResources.project,
};

export const activityFilterLabels: Record<ActivityFilter, string> = {
  all: "All",
  leads: "Leads",
  clients: "Clients",
  proposals: "Proposals",
  projects: "Projects",
};
