import type { Lead } from "@/db/schema";
import type { OpenLeadStatus } from "@/features/leads/lead-status";

export type PipelineColumn = {
  status: OpenLeadStatus;
  leads: Lead[];
  total: number;
};

export function moveLead(columns: PipelineColumn[], leadId: string, toStatus: OpenLeadStatus): PipelineColumn[] {
  const lead = columns.flatMap((column) => column.leads).find((candidate) => candidate.id === leadId);

  if (!lead || lead.status === toStatus || !columns.some((column) => column.status === toStatus)) {
    return columns;
  }

  return columns.map((column) => {
    if (column.status === lead.status) {
      return { ...column, leads: column.leads.filter((candidate) => candidate.id !== leadId), total: column.total - 1 };
    }

    if (column.status === toStatus) {
      return { ...column, leads: [{ ...lead, status: toStatus }, ...column.leads], total: column.total + 1 };
    }

    return column;
  });
}
