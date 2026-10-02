"use client";

import { useReducer } from "react";

import type { SectionDraft } from "@/features/proposals/section-types";

export type EditableSection = SectionDraft & { key: string };

export type SectionAction =
  | { type: "add"; section: SectionDraft }
  | { type: "update"; key: string; changes: Partial<Pick<SectionDraft, "title" | "content">> }
  | { type: "move"; key: string; offset: -1 | 1 }
  | { type: "remove"; key: string };

function withKey(section: SectionDraft): EditableSection {
  return { ...section, key: crypto.randomUUID() };
}

function sectionsReducer(sections: EditableSection[], action: SectionAction): EditableSection[] {
  switch (action.type) {
    case "add":
      return [...sections, withKey(action.section)];
    case "update":
      return sections.map((section) => (section.key === action.key ? { ...section, ...action.changes } : section));
    case "remove":
      return sections.filter((section) => section.key !== action.key);
    case "move": {
      const from = sections.findIndex((section) => section.key === action.key);
      const to = from + action.offset;
      if (from < 0 || to < 0 || to >= sections.length) return sections;

      const next = [...sections];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    }
  }
}

export function useSections(initial: SectionDraft[]) {
  const [sections, dispatch] = useReducer(sectionsReducer, initial, (drafts) => drafts.map(withKey));
  const serialized = JSON.stringify(sections.map(({ title, content, sectionType }) => ({ title, content, sectionType })));

  return { sections, dispatch, serialized };
}
