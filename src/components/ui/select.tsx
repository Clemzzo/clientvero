"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger>;
type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;
type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-ink-400/30 bg-white px-3.5 text-left text-[14px] text-ink-900 transition-colors",
        "hover:border-ink-400/50 data-[state=open]:border-brand-600",
        "focus-visible:border-brand-600 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-brand-600",
        "disabled:cursor-not-allowed disabled:opacity-60 data-placeholder:text-ink-500",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", sideOffset = 6, ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "menu-in z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[0_16px_40px_-20px_rgba(7,11,24,0.35)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-2.5 pr-8 text-[14px] font-medium text-ink-700 outline-none transition-colors",
        "data-highlighted:bg-ink-50 data-highlighted:text-ink-900 data-disabled:pointer-events-none data-disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check aria-hidden className="size-4 text-brand-600" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
