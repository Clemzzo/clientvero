import type { LucideIcon } from "lucide-react";

import type { Tone } from "@/components/marketing/feature-previews";
import {
  convertLeadToClient,
  invoiceAndGetPaid,
  planProjectsInMilestones,
  qualifyALead,
  setUpClientPortal,
  writeAWinningProposal,
} from "@/components/marketing/resources/guides/guide-content";

export const guideStages = [
  { id: "leads", label: "Leads" },
  { id: "clients", label: "Clients" },
  { id: "proposals", label: "Proposals" },
  { id: "projects", label: "Projects" },
  { id: "portal", label: "Portal" },
  { id: "invoices", label: "Invoices" },
] as const;

export type GuideStage = (typeof guideStages)[number]["id"];

export type GuideSection = {
  id: string;
  heading: string;
  body: string[];
  checklist?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  stage: GuideStage;
  readMinutes: number;
  icon: LucideIcon;
  tone: Tone;
  featured?: boolean;
  takeaways: string[];
  sections: GuideSection[];
  product: { label: string; href: string };
};

export const guides: Guide[] = [
  qualifyALead,
  convertLeadToClient,
  writeAWinningProposal,
  planProjectsInMilestones,
  setUpClientPortal,
  invoiceAndGetPaid,
];

function guideIndex(slug: string) {
  return guides.findIndex((guide) => guide.slug === slug);
}

export function stageLabel(stage: GuideStage) {
  return guideStages.find((item) => item.id === stage)?.label ?? stage;
}

export function guideHref(slug: string) {
  return `/guides/${slug}`;
}

export function guideStep(slug: string) {
  return guideIndex(slug) + 1;
}

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getFeaturedGuide() {
  return guides.find((guide) => guide.featured) ?? guides[0];
}

export function getNextGuide(slug: string) {
  return guides[(guideIndex(slug) + 1) % guides.length];
}
