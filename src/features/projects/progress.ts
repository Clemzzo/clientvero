import type { ProjectStatus } from "@/db/schema";

const MAX_OPEN_PROGRESS = 99;

export function projectProgress(completed: number, total: number, status: ProjectStatus): number {
  if (status === "COMPLETED") return 100;
  if (total <= 0) return 0;

  const percentage = Math.round((Math.min(completed, total) / total) * 100);
  return Math.min(percentage, MAX_OPEN_PROGRESS);
}
