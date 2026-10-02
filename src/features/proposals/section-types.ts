export const sectionTypes = ["INTRO", "SCOPE", "DELIVERABLES", "TIMELINE", "PRICING", "TERMS", "CUSTOM"] as const;

export type SectionType = (typeof sectionTypes)[number];

export type SectionDraft = {
  title: string;
  content: string;
  sectionType: SectionType;
};

export const sectionTemplates: { label: string; section: SectionDraft }[] = [
  { label: "Introduction", section: { title: "Introduction", content: "", sectionType: "INTRO" } },
  { label: "Scope of work", section: { title: "Scope of work", content: "", sectionType: "SCOPE" } },
  { label: "Deliverables", section: { title: "Deliverables", content: "", sectionType: "DELIVERABLES" } },
  { label: "Custom section", section: { title: "", content: "", sectionType: "CUSTOM" } },
];

export const defaultSections: SectionDraft[] = sectionTemplates.slice(0, 3).map(({ section }) => section);
