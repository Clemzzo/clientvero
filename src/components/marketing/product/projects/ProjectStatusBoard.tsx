import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { ProgressFill } from "@/components/marketing/DashboardMotion";
import { StatusPill, type Tone } from "@/components/marketing/FeaturePreviews";
import { ProductSection } from "@/components/marketing/product/ProductSection";
import { cn } from "@/lib/utils";

const filters = ["All", "In progress", "Review", "Planning", "Completed"];

const projects: { name: string; client: string; status: string; tone: Tone; progress: number; due: string }[] = [
  { name: "Website redesign", client: "BrightPath Studio", status: "In progress", tone: "brand", progress: 50, due: "18 Oct" },
  { name: "Brand identity", client: "Lumen Labs", status: "Review", tone: "amber", progress: 80, due: "9 Oct" },
  { name: "Product launch video", client: "Park & Co.", status: "Planning", tone: "violet", progress: 0, due: "4 Nov" },
  { name: "SEO audit", client: "Marco Silva", status: "Completed", tone: "emerald", progress: 100, due: "22 Sep" },
];

const lifecycle: { status: string; tone: Tone }[] = [
  { status: "Planning", tone: "violet" },
  { status: "In progress", tone: "brand" },
  { status: "Review", tone: "amber" },
  { status: "Completed", tone: "emerald" },
];

const columns = "grid-cols-[minmax(0,1fr)_88px] sm:grid-cols-[minmax(0,1fr)_120px_56px_96px]";

function ProjectListPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]"
    >
      <div className="flex gap-2 overflow-hidden px-5 py-4 sm:px-6">
        {filters.map((filter, index) => (
          <div
            key={filter}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11.5px] font-medium",
              index === 0 ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500",
            )}
          >
            {filter}
          </div>
        ))}
      </div>

      <div className={cn("grid gap-3 border-y border-ink-200 bg-ink-50 px-5 py-2 text-[10.5px] text-ink-400 sm:px-6", columns)}>
        <div>Project</div>
        <div className="hidden sm:block">Progress</div>
        <div className="hidden sm:block">Due</div>
        <div className="text-right">Status</div>
      </div>

      <ul className="divide-y divide-ink-200">
        {projects.map((project, index) => (
          <li key={project.name} className={cn("grid items-center gap-3 px-5 py-3 sm:px-6", columns)}>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-ink-900">{project.name}</div>
              <div className="truncate text-[11px] text-ink-400">{project.client}</div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <ProgressFill
                  value={project.progress}
                  delay={index * 0.08}
                  className={project.progress === 100 ? "bg-emerald-500" : "bg-brand-600"}
                />
              </div>
              <div className="w-8 text-right text-[11px] tabular-nums text-ink-500">{project.progress}%</div>
            </div>
            <div className="hidden text-[11.5px] tabular-nums text-ink-500 sm:block">{project.due}</div>
            <div className="flex justify-end">
              <StatusPill tone={project.tone}>{project.status}</StatusPill>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-5 py-3 text-[11px] text-ink-400 sm:px-6">
        <div>Showing 1–4 of 12</div>
        <div className="flex gap-1.5">
          <div className="grid size-7 place-items-center rounded-md border border-ink-200 text-ink-300">
            <ChevronLeft className="size-3.5" />
          </div>
          <div className="grid size-7 place-items-center rounded-md border border-ink-200 text-ink-700">
            <ChevronRight className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusLifecycle() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">A status for every stage</h3>
        <p className="mt-1 text-[13.5px] text-ink-500">Pause or cancel a project at any point, and pick it up later.</p>
      </div>
      <ol className="flex flex-wrap items-center gap-2">
        {lifecycle.map((stage, index) => (
          <li key={stage.status} className="flex items-center gap-2">
            <StatusPill tone={stage.tone}>{stage.status}</StatusPill>
            {index < lifecycle.length - 1 && <ArrowRight aria-hidden className="size-3.5 text-ink-300" />}
          </li>
        ))}
        <li className="flex items-center gap-2 border-l border-ink-200 pl-3 lg:ml-1">
          <StatusPill tone="ink">Paused</StatusPill>
          <StatusPill tone="rose">Cancelled</StatusPill>
        </li>
      </ol>
    </div>
  );
}

export function ProjectStatusBoard() {
  return (
    <ProductSection
      id="status"
      title="Every project, at a glance."
      intro="See what's in progress, what's waiting on review, and what's due next. Filter by status to focus on the work in front of you."
      className="bg-ink-50"
    >
      <div className="space-y-5">
        <ProjectListPreview />
        <StatusLifecycle />
      </div>
    </ProductSection>
  );
}
