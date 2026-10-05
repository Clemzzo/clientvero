import type { Project, Proposal } from "@/db/schema";

export type ProjectFormValues = {
  clientId: string;
  proposalId: string;
  name: string;
  description: string;
  budget: string;
  currency: string;
  startDate: string;
  dueDate: string;
};

export function newProjectValues(currency: string, clientId = ""): ProjectFormValues {
  return { clientId, proposalId: "", name: "", description: "", budget: "", currency, startDate: "", dueDate: "" };
}

export function projectValuesFromProposal(proposal: Proposal): ProjectFormValues {
  return {
    clientId: proposal.clientId,
    proposalId: proposal.id,
    name: proposal.title,
    description: proposal.description ?? "",
    budget: proposal.total,
    currency: proposal.currency,
    startDate: "",
    dueDate: "",
  };
}

export function existingProjectValues(project: Project): ProjectFormValues {
  return {
    clientId: project.clientId,
    proposalId: project.proposalId ?? "",
    name: project.name,
    description: project.description ?? "",
    budget: project.budget ?? "",
    currency: project.currency,
    startDate: project.startDate ?? "",
    dueDate: project.dueDate ?? "",
  };
}
