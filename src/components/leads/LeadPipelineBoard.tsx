"use client";

import { useId, useOptimistic, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { LeadCard } from "@/components/leads/LeadCard";
import { useLeadStatusChange } from "@/components/leads/use-lead-status-change";
import type { Lead } from "@/db/schema";
import { leadStatusLabels, openLeadStatuses, pipelineStageColors, type OpenLeadStatus } from "@/features/leads/lead-status";
import { moveLead, type PipelineColumn as Column } from "@/features/leads/move-lead";
import { cn } from "@/lib/utils";

type LeadPipelineBoardProps = {
  columns: Column[];
  canUpdate: boolean;
  now: Date;
};

function isOpenStatus(value: unknown): value is OpenLeadStatus {
  return openLeadStatuses.includes(value as OpenLeadStatus);
}

function leadName(columns: Column[], leadId: unknown) {
  return columns.flatMap((column) => column.leads).find((lead) => lead.id === leadId)?.name ?? "Lead";
}

function stageName(statusId: unknown) {
  return isOpenStatus(statusId) ? leadStatusLabels[statusId] : "no stage";
}

export function LeadPipelineBoard({ columns, canUpdate, now }: LeadPipelineBoardProps) {
  if (!canUpdate) {
    return (
      <BoardGrid>
        {columns.map((column) => (
          <PipelineColumn key={column.status} column={column}>
            {column.leads.map((lead) => (
              <li key={lead.id}>
                <LeadCard lead={lead} canUpdate={false} now={now} />
              </li>
            ))}
          </PipelineColumn>
        ))}
      </BoardGrid>
    );
  }

  return <DraggableBoard columns={columns} now={now} />;
}

function DraggableBoard({ columns, now }: { columns: Column[]; now: Date }) {
  const [optimisticColumns, applyMove] = useOptimistic(
    columns,
    (current, move: { leadId: string; toStatus: OpenLeadStatus }) => moveLead(current, move.leadId, move.toStatus),
  );
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const dndId = useId();
  const { changeStatus } = useLeadStatusChange();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${leadName(optimisticColumns, active.id)}.`,
    onDragOver: ({ active, over }) => `${leadName(optimisticColumns, active.id)} is over ${stageName(over?.id)}.`,
    onDragEnd: ({ active, over }) =>
      isOpenStatus(over?.id)
        ? `${leadName(optimisticColumns, active.id)} moved to ${stageName(over.id)}.`
        : `${leadName(optimisticColumns, active.id)} was dropped outside the pipeline.`,
    onDragCancel: ({ active }) => `Cancelled moving ${leadName(optimisticColumns, active.id)}.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveLead((active.data.current?.lead as Lead | undefined) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveLead(null);
    const lead = active.data.current?.lead as Lead | undefined;

    if (!lead || !isOpenStatus(over?.id) || over.id === lead.status) return;

    const toStatus = over.id;
    changeStatus(lead, toStatus, { optimisticUpdate: () => applyMove({ leadId: lead.id, toStatus }) });
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveLead(null)}
    >
      <BoardGrid>
        {optimisticColumns.map((column) => (
          <DroppableColumn key={column.status} column={column}>
            {column.leads.map((lead) => (
              <DraggableLeadCard key={lead.id} lead={lead} now={now} />
            ))}
          </DroppableColumn>
        ))}
      </BoardGrid>

      <DragOverlay dropAnimation={null}>
        {activeLead && (
          <div className="rotate-2 cursor-grabbing">
            <LeadCard lead={activeLead} canUpdate={false} now={now} dragHandle={<HandleIcon />} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function BoardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
      <div className="grid min-w-220 grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function DroppableColumn({ column, children }: { column: Column; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <PipelineColumn column={column} dropRef={setNodeRef} isOver={isOver}>
      {children}
    </PipelineColumn>
  );
}

type PipelineColumnProps = {
  column: Column;
  children: ReactNode;
  dropRef?: (element: HTMLElement | null) => void;
  isOver?: boolean;
};

function PipelineColumn({ column, children, dropRef, isOver = false }: PipelineColumnProps) {
  const headingId = `stage-${column.status}`;

  return (
    <section
      ref={dropRef}
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col rounded-2xl border border-ink-200 bg-ink-100/60 p-2.5 transition-colors",
        isOver && "bg-brand-50/60 ring-2 ring-brand-300",
      )}
    >
      <header className="flex items-center justify-between gap-2 px-1.5 pb-2.5 pt-1">
        <h2 id={headingId} className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
          <span aria-hidden className={cn("size-2 rounded-full", pipelineStageColors[column.status])} />
          {leadStatusLabels[column.status]}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-ink-700 tabular-nums">
          {column.total}
        </span>
      </header>

      {column.leads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 px-3 py-6 text-center text-[13px] text-ink-500">
          No leads in this stage
        </p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}

      {column.total > column.leads.length && (
        <Link
          href={`/dashboard/leads?status=${column.status}`}
          className="mt-2 rounded-lg px-2 py-1.5 text-center text-[13px] font-semibold text-brand-700 hover:bg-white"
        >
          View all {column.total}
        </Link>
      )}
    </section>
  );
}

function DraggableLeadCard({ lead, now }: { lead: Lead; now: Date }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label={`Drag ${lead.name}`}
      className="-ml-1.5 mt-0.5 grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <HandleIcon />
    </button>
  );

  return (
    <li ref={setNodeRef}>
      <LeadCard lead={lead} canUpdate now={now} dragHandle={handle} isDragging={isDragging} />
    </li>
  );
}

function HandleIcon() {
  return <GripVertical aria-hidden className="size-4" />;
}
