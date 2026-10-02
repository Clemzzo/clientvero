"use client";

import { useState, type Dispatch } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import type { EditableSection, SectionAction } from "@/components/proposals/use-sections";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { sectionTemplates } from "@/features/proposals/section-types";

type SectionEditorProps = {
  sections: EditableSection[];
  dispatch: Dispatch<SectionAction>;
  error?: string;
};

const MAX_SECTIONS = 20;

const iconButton =
  "grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40";

function RemoveSectionButton({ section, onRemove }: { section: EditableSection; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const label = section.title || "this section";

  return (
    <>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className={`${iconButton} hover:bg-red-50 hover:text-destructive`}
        onClick={() => (section.content.trim() ? setConfirming(true) : onRemove())}
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Remove ${label}?`}
        description="Its text will be removed from this proposal."
        confirmLabel="Remove section"
        pendingLabel="Removing…"
        tone="destructive"
        pending={false}
        onConfirm={() => {
          setConfirming(false);
          onRemove();
        }}
      />
    </>
  );
}

function SectionCard({
  section,
  index,
  total,
  dispatch,
}: {
  section: EditableSection;
  index: number;
  total: number;
  dispatch: Dispatch<SectionAction>;
}) {
  const titleId = `section-${section.key}-title`;
  const contentId = `section-${section.key}-content`;

  return (
    <Card className="group p-5 transition-shadow focus-within:shadow-[0_8px_24px_-16px_rgba(7,11,24,0.3)] sm:p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-7 min-w-9 place-items-center rounded-lg bg-mint-100 px-2 text-[12px] font-bold tabular-nums text-mint-700"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <label htmlFor={titleId} className="sr-only">
          Section {index + 1} title
        </label>
        <input
          id={titleId}
          value={section.title}
          required
          maxLength={240}
          placeholder="Section title"
          onChange={(event) => dispatch({ type: "update", key: section.key, changes: { title: event.target.value } })}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-display text-[17px] font-bold tracking-[-0.01em] text-ink-900 placeholder:text-ink-400 hover:border-ink-200 focus-visible:border-brand-600 focus-visible:outline-1 focus-visible:outline-brand-600"
        />
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={`Move ${section.title || "section"} up`}
            className={iconButton}
            disabled={index === 0}
            onClick={() => dispatch({ type: "move", key: section.key, offset: -1 })}
          >
            <ArrowUp aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Move ${section.title || "section"} down`}
            className={iconButton}
            disabled={index === total - 1}
            onClick={() => dispatch({ type: "move", key: section.key, offset: 1 })}
          >
            <ArrowDown aria-hidden className="size-4" />
          </button>
          <RemoveSectionButton section={section} onRemove={() => dispatch({ type: "remove", key: section.key })} />
        </div>
      </div>

      <label htmlFor={contentId} className="sr-only">
        Section {index + 1} content
      </label>
      <Textarea
        id={contentId}
        value={section.content}
        maxLength={10_000}
        placeholder="Write this section…"
        onChange={(event) => dispatch({ type: "update", key: section.key, changes: { content: event.target.value } })}
        className="mt-4 min-h-32 resize-none border-ink-200 bg-ink-50/40 field-sizing-content"
      />
    </Card>
  );
}

export function SectionEditor({ sections, dispatch, error }: SectionEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink-900">Sections</h2>
          <p className="mt-0.5 text-[13px] text-ink-500">What you&rsquo;ll do, what they&rsquo;ll get, and how it works.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-9 rounded-lg" disabled={sections.length >= MAX_SECTIONS}>
              <Plus aria-hidden className="size-4" />
              Add section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-48">
            {sectionTemplates.map((template) => (
              <DropdownMenuItem key={template.label} onSelect={() => dispatch({ type: "add", section: template.section })}>
                {template.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-10 text-center text-[14px] text-ink-500">
          Add a section to describe the work.
        </p>
      ) : (
        <ol className="space-y-3">
          {sections.map((section, index) => (
            <li key={section.key}>
              <SectionCard section={section} index={index} total={sections.length} dispatch={dispatch} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
