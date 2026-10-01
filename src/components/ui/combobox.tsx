"use client";

import { useId, useRef, useState } from "react";
import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/option";

const baseStyles = "flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md bg-white pl-4 pr-3.5 text-left text-[15px] transition-colors";
const borderStyles = "border border-ink-400/30 hover:border-ink-400/50 data-[state=open]:border-brand-600";
const focusStyles = "focus-visible:border-brand-600 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-brand-600";
const invalidStyles = "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive";
const disabledStyles = "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500";

type ComboboxProps = {
  id: string;
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function Combobox({
  id,
  name,
  options,
  defaultValue = "",
  placeholder = "Select…",
  searchPlaceholder,
  required,
  invalid,
  describedBy,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);
  const searchable = Boolean(searchPlaceholder);

  function choose(option: Option) {
    setValue(option.value);
    setOpen(false);
  }

  function focusListOnOpen(event: Event) {
    if (searchable) return;
    event.preventDefault();
    listRef.current?.focus();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn(baseStyles, borderStyles, focusStyles, invalidStyles, disabledStyles)}
          >
            <span className={cn("truncate", selected ? "text-ink-900" : "text-ink-400")}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-400" />
          </button>
        </PopoverTrigger>

        <HiddenValue name={name} value={value} required={required} onFocus={() => triggerRef.current?.focus()} />
      </div>

      <PopoverContent onOpenAutoFocus={focusListOnOpen}>
        <Command ref={listRef} defaultValue={selected?.label} tabIndex={-1} className="outline-none">
          {searchable && <SearchBox placeholder={searchPlaceholder} />}

          <Command.List id={listId} className="max-h-70 overflow-y-auto p-1.5">
            <Command.Empty className="px-3 py-6 text-center text-[14px] text-ink-500">No results.</Command.Empty>

            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.label}
                keywords={[option.value]}
                onSelect={() => choose(option)}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-[14px] text-ink-700 data-[selected=true]:bg-brand-50 data-[selected=true]:text-ink-900"
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check aria-hidden className="size-4 shrink-0 text-brand-600" />}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SearchBox({ placeholder }: { placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-ink-200 px-3.5">
      <Search aria-hidden className="size-4 shrink-0 text-ink-400" />
      <Command.Input
        placeholder={placeholder}
        className="h-11 w-full bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-ink-400"
      />
    </div>
  );
}

type HiddenValueProps = {
  name: string;
  value: string;
  required?: boolean;
  onFocus: () => void;
};

function HiddenValue({ name, value, required, onFocus }: HiddenValueProps) {
  return (
    <input
      name={name}
      value={value}
      required={required}
      onChange={() => {}}
      onFocus={onFocus}
      tabIndex={-1}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
    />
  );
}
