"use client";

import { useEffect, useRef, type Dispatch, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { MAX_INVOICE_ITEMS } from "@/validators/invoices";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";

import type { EditableLine, LineAction } from "./use-line-items";

type LineItemsGridProps = {
  lines: EditableLine[];
  amounts: string[];
  currency: string;
  dispatch: Dispatch<LineAction>;
  error?: string;
};

const cell =
  "h-11 w-full min-w-0 bg-transparent px-3 text-[14.5px] text-ink-900 outline-none placeholder:text-ink-400 focus-visible:bg-brand-50/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600";
const rowButton =
  "grid size-7 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-30";

export function LineItemsGrid({ lines, amounts, currency, dispatch, error }: LineItemsGridProps) {
  const pendingFocus = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const atLimit = lines.length >= MAX_INVOICE_ITEMS;

  useEffect(() => {
    if (!pendingFocus.current) return;
    gridRef.current?.querySelector<HTMLInputElement>(`[data-line="${pendingFocus.current}"]`)?.focus();
    pendingFocus.current = null;
  }, [lines]);

  function addLine() {
    if (atLimit) return;
    const key = crypto.randomUUID();
    pendingFocus.current = key;
    dispatch({ type: "add", key });
  }

  function addOnEnter(event: KeyboardEvent<HTMLInputElement>, isLast: boolean) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (isLast) addLine();
  }

  return (
    <section aria-labelledby="line-items-title" className="rounded-2xl border border-ink-200 bg-white">
      <header className="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <IconTile icon={<ListOrdered />} tone="ocean" />
        <div>
          <h2 id="line-items-title" className="text-[15px] font-semibold text-ink-900">
            Line items
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-500">Press Enter in the last price to add another line.</p>
        </div>
      </header>

      <div ref={gridRef} className="mt-4 px-3 sm:px-4">
        <div className="hidden grid-cols-[minmax(0,1fr)_72px_128px_120px_88px] border-b border-ink-200 px-0 pb-2 text-[12.5px] font-medium text-ink-500 sm:grid">
          <span className="px-3">Description</span>
          <span className="px-3 text-right">Qty</span>
          <span className="px-3 text-right">Price</span>
          <span className="px-3 text-right">Amount</span>
          <span className="sr-only">Actions</span>
        </div>

        <ol className="divide-y divide-ink-200">
          {lines.map((line, index) => {
            const number = index + 1;
            const isLast = index === lines.length - 1;

            return (
              <li
                key={line.key}
                className="group grid grid-cols-[minmax(0,1fr)_88px] items-center gap-y-1 py-2 sm:grid-cols-[minmax(0,1fr)_72px_128px_120px_88px] sm:gap-y-0 sm:py-0"
              >
                <input
                  data-line={line.key}
                  aria-label={`Line ${number} description`}
                  value={line.description}
                  maxLength={500}
                  placeholder="What you did or delivered"
                  onChange={(event) => dispatch({ type: "update", key: line.key, changes: { description: event.target.value } })}
                  onKeyDown={(event) => addOnEnter(event, false)}
                  className={cn(cell, "rounded-md")}
                />
                <div className="col-span-2 grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)] sm:contents">
                  <input
                    aria-label={`Line ${number} quantity`}
                    value={line.quantity}
                    inputMode="decimal"
                    onChange={(event) => dispatch({ type: "update", key: line.key, changes: { quantity: event.target.value } })}
                    onKeyDown={(event) => addOnEnter(event, false)}
                    className={cn(cell, "rounded-md text-right tabular-nums")}
                  />
                  <input
                    aria-label={`Line ${number} price in ${currency}`}
                    value={line.unitPrice}
                    inputMode="decimal"
                    placeholder="0.00"
                    onChange={(event) => dispatch({ type: "update", key: line.key, changes: { unitPrice: event.target.value } })}
                    onKeyDown={(event) => addOnEnter(event, isLast)}
                    className={cn(cell, "rounded-md text-right tabular-nums")}
                  />
                  <output
                    aria-label={`Line ${number} amount`}
                    className="flex h-11 items-center justify-end px-3 text-[14.5px] font-medium tabular-nums text-ink-900"
                  >
                    {formatMoney(amounts[index] ?? "0", currency)}
                  </output>
                </div>
                <div className="col-start-2 row-start-1 flex justify-end gap-0.5 transition-opacity sm:col-start-auto sm:row-start-auto sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                  <button
                    type="button"
                    aria-label={`Move line ${number} up`}
                    disabled={index === 0}
                    onClick={() => dispatch({ type: "move", key: line.key, offset: -1 })}
                    className={rowButton}
                  >
                    <ArrowUp aria-hidden className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move line ${number} down`}
                    disabled={isLast}
                    onClick={() => dispatch({ type: "move", key: line.key, offset: 1 })}
                    className={rowButton}
                  >
                    <ArrowDown aria-hidden className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove line ${number}`}
                    disabled={lines.length === 1}
                    onClick={() => dispatch({ type: "remove", key: line.key })}
                    className={cn(rowButton, "hover:bg-coral-50 hover:text-coral-700")}
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 px-5 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={addLine}
          disabled={atLimit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 -ml-2 text-[14px] font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:opacity-40"
        >
          <Plus aria-hidden className="size-4" />
          Add line
        </button>
        {atLimit && <p className="text-[13px] text-ink-500">Invoices can have up to {MAX_INVOICE_ITEMS} lines.</p>}
      </div>

      {error && (
        <p id="field-items-error" role="alert" className="px-5 pb-4 text-[13px] text-destructive sm:px-6">
          {error}
        </p>
      )}
    </section>
  );
}
