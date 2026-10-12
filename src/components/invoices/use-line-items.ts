"use client";

import { useReducer } from "react";

import type { LineDraft } from "@/features/invoices/builder-values";

export type EditableLine = LineDraft & { key: string };

export type LineAction =
  | { type: "add"; key: string }
  | { type: "update"; key: string; changes: Partial<LineDraft> }
  | { type: "move"; key: string; offset: -1 | 1 }
  | { type: "remove"; key: string };

function withKey(line: LineDraft): EditableLine {
  return { ...line, key: crypto.randomUUID() };
}

function linesReducer(lines: EditableLine[], action: LineAction): EditableLine[] {
  switch (action.type) {
    case "add":
      return [...lines, { key: action.key, description: "", quantity: "1", unitPrice: "" }];
    case "update":
      return lines.map((line) => (line.key === action.key ? { ...line, ...action.changes } : line));
    case "remove":
      return lines.length > 1 ? lines.filter((line) => line.key !== action.key) : lines;
    case "move": {
      const from = lines.findIndex((line) => line.key === action.key);
      const to = from + action.offset;
      if (from < 0 || to < 0 || to >= lines.length) return lines;

      const next = [...lines];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    }
  }
}

export function useLineItems(initial: LineDraft[]) {
  const [lines, dispatch] = useReducer(linesReducer, initial, (drafts) => drafts.map(withKey));
  const serialized = JSON.stringify(lines.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })));

  return { lines, dispatch, serialized };
}
