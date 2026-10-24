"use client";

import { useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "value"> & {
  name: string;
  defaultChecked?: boolean;
};

export function Switch({ name, defaultChecked = false, className, disabled, ...props }: SwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-brand-600" : "bg-ink-400",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-150 motion-reduce:transition-none",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
      {checked && <input type="hidden" name={name} value="on" />}
    </>
  );
}
