import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { CheckItems, ProductSection } from "@/components/marketing/product/product-section";
import { teamMember, type TeamMember } from "@/components/marketing/solutions/agencies/agencyTeam";
import { TeamAvatar } from "@/components/marketing/solutions/agencies/TeamAvatar";

type Lead = { name: string; service: string; value: string; owner: TeamMember };

const columns: { stage: string; tone: Tone; leads: Lead[] }[] = [
  {
    stage: "New",
    tone: "brand",
    leads: [
      { name: "Harbor & Co.", service: "Website", value: "$8,400", owner: teamMember("dee") },
      { name: "Oakline", service: "Social campaign", value: "$3,200", owner: teamMember("olivia") },
    ],
  },
  {
    stage: "Qualified",
    tone: "amber",
    leads: [{ name: "Fieldnote", service: "Brand refresh", value: "$6,900", owner: teamMember("tom") }],
  },
  {
    stage: "Proposal sent",
    tone: "violet",
    leads: [
      { name: "Kite Health", service: "Product site", value: "$12,500", owner: teamMember("sarah") },
      { name: "Moss & Main", service: "Packaging", value: "$4,100", owner: teamMember("dee") },
    ],
  },
];

const pipelinePoints = [
  "Assign every lead to a teammate",
  "Filter the pipeline by status or owner",
  "Convert a lead into a client the whole team can see",
  "Everyone works from the same record",
];

function PipelineBoard() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.stage} className="min-w-0 rounded-2xl bg-white/70 p-2.5 ring-1 ring-ink-200">
            <div className="flex items-center justify-between px-1">
              <StatusPill tone={column.tone}>{column.stage}</StatusPill>
              <span className="text-[11px] font-semibold text-ink-400">{column.leads.length}</span>
            </div>
            <ul className="mt-2.5 space-y-2">
              {column.leads.map((lead) => (
                <li
                  key={lead.name}
                  className="rounded-xl border border-ink-200 bg-white p-3 shadow-[0_8px_20px_-16px_rgba(7,11,24,0.3)]"
                >
                  <div className="truncate text-[12.5px] font-semibold text-ink-900">{lead.name}</div>
                  <div className="truncate text-[11px] text-ink-400">{lead.service}</div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold tabular-nums text-ink-700">{lead.value}</span>
                    <TeamAvatar member={lead.owner} size={22} className="ring-2 ring-white" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgencyPipeline() {
  return (
    <ProductSection
      id="pipeline"
      title="Share the pipeline, not a spreadsheet."
      intro="Every enquiry lands in one board your whole team can see, with a clear owner, so no lead waits on someone who thought someone else had it."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-center lg:gap-16">
        <PipelineBoard />
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">Clear ownership from the first hello</h3>
          <CheckItems items={pipelinePoints} className="mt-5" />
        </div>
      </div>
    </ProductSection>
  );
}
