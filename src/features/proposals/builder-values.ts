import type { Proposal, ProposalSection } from "@/db/schema";
import { defaultSections, sectionTypes, type SectionDraft, type SectionType } from "@/features/proposals/section-types";
import { isZeroAmount } from "@/lib/utils/money";

export type ProposalBuilderValues = {
  clientId: string;
  title: string;
  description: string;
  currency: string;
  subtotal: string;
  discount: string;
  tax: string;
  timeline: string;
  terms: string;
  sections: SectionDraft[];
};

function asSectionType(value: string): SectionType {
  return (sectionTypes as readonly string[]).includes(value) ? (value as SectionType) : "CUSTOM";
}

export function newProposalValues(currency: string, clientId = ""): ProposalBuilderValues {
  return {
    clientId,
    title: "",
    description: "",
    currency,
    subtotal: "",
    discount: "",
    tax: "",
    timeline: "",
    terms: "",
    sections: defaultSections,
  };
}

export function editProposalValues(proposal: Proposal & { sections: ProposalSection[] }): ProposalBuilderValues {
  return {
    clientId: proposal.clientId,
    title: proposal.title,
    description: proposal.description ?? "",
    currency: proposal.currency,
    subtotal: proposal.subtotal,
    discount: isZeroAmount(proposal.discount) ? "" : proposal.discount,
    tax: isZeroAmount(proposal.tax) ? "" : proposal.tax,
    timeline: proposal.timeline ?? "",
    terms: proposal.terms ?? "",
    sections: proposal.sections.map((section) => ({
      title: section.title,
      content: section.content ?? "",
      sectionType: asSectionType(section.sectionType),
    })),
  };
}
