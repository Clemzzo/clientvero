import { describe, expect, it } from "vitest";

import type { Lead } from "@/db/schema";
import { moveLead, type PipelineColumn } from "@/features/leads/move-lead";

function lead(id: string, status: Lead["status"]): Lead {
  return { id, status, name: id } as Lead;
}

function board(): PipelineColumn[] {
  return [
    { status: "NEW", leads: [lead("a", "NEW"), lead("b", "NEW")], total: 5 },
    { status: "QUALIFIED", leads: [lead("c", "QUALIFIED")], total: 1 },
    { status: "PROPOSAL_SENT", leads: [], total: 0 },
    { status: "NEGOTIATION", leads: [], total: 0 },
  ];
}

describe("moveLead", () => {
  it("moves a lead to the top of another column and updates both totals", () => {
    const result = moveLead(board(), "b", "QUALIFIED");

    expect(result[0]).toMatchObject({ total: 4 });
    expect(result[0].leads.map((item) => item.id)).toEqual(["a"]);
    expect(result[1]).toMatchObject({ total: 2 });
    expect(result[1].leads.map((item) => [item.id, item.status])).toEqual([
      ["b", "QUALIFIED"],
      ["c", "QUALIFIED"],
    ]);
  });

  it("returns the same columns when nothing should change", () => {
    const columns = board();

    expect(moveLead(columns, "a", "NEW")).toBe(columns);
    expect(moveLead(columns, "missing", "QUALIFIED")).toBe(columns);
  });

  it("never mutates its input", () => {
    const columns = board();
    const snapshot = structuredClone(columns);

    moveLead(columns, "a", "NEGOTIATION");

    expect(columns).toEqual(snapshot);
  });
});
