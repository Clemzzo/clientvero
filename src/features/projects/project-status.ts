import type { ProjectStatus } from "@/db/schema";
import type { StatusTone } from "@/types/status-tone";

export const projectStatuses = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "PAUSED",
  "CANCELLED",
] as const satisfies readonly ProjectStatus[];

export const activeProjectStatuses = ["PLANNING", "IN_PROGRESS", "REVIEW"] as const satisfies readonly ProjectStatus[];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  REVIEW: "In review",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};

export const projectStatusTones: Record<ProjectStatus, StatusTone> = {
  PLANNING: "neutral",
  IN_PROGRESS: "brand",
  REVIEW: "warning",
  COMPLETED: "mint",
  PAUSED: "neutral",
  CANCELLED: "danger",
};

export const projectFilters = ["all", "active", "paused", "completed", "cancelled"] as const;

export type ProjectFilter = (typeof projectFilters)[number];

export const projectFilterStatuses: Record<Exclude<ProjectFilter, "all">, readonly ProjectStatus[]> = {
  active: activeProjectStatuses,
  paused: ["PAUSED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
};
