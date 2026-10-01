import * as React from "react";

import { cn } from "@/lib/utils";

const base = "min-h-28 w-full min-w-0 rounded-md bg-white px-4 py-3 text-[15px] leading-normal text-ink-900 transition-colors placeholder:text-ink-400";
const border = "border border-ink-400/30 hover:border-ink-400/50";
const focus = "focus-visible:border-brand-600 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-brand-600";
const invalid = "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive";
const disabled = "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(base, border, focus, invalid, disabled, className)} {...props} />;
}

export { Textarea };
