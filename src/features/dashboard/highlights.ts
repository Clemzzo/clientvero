type HighlightCounts = {
  pendingProposals: number;
  activeProjects: number;
  newLeadsThisWeek: number;
};

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function dashboardHighlights({ pendingProposals, activeProjects, newLeadsThisWeek }: HighlightCounts): string[] {
  const highlights = [
    pendingProposals > 0 && `${plural(pendingProposals, "proposal", "proposals")} awaiting a reply`,
    activeProjects > 0 && plural(activeProjects, "active project", "active projects"),
    newLeadsThisWeek > 0 && `${plural(newLeadsThisWeek, "new lead", "new leads")} this week`,
  ].filter((highlight): highlight is string => Boolean(highlight));

  return highlights.length > 0 ? highlights : ["Add a lead or a client to get your workspace moving."];
}
