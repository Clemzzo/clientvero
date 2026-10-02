import type { ComponentProps } from "react";

import { FormField, fieldAria } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";

type MoneyFieldProps = Omit<ComponentProps<typeof Input>, "type" | "inputMode"> & {
  name: string;
  label: string;
  currency: string;
  hint?: string;
  error?: string;
};

export function MoneyField({ name, label, currency, hint, error, ...inputProps }: MoneyFieldProps) {
  const id = `field-${name}`;

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-ink-100 px-1.5 py-0.5 text-[12px] font-semibold text-ink-500"
        >
          {currency}
        </span>
        <Input
          name={name}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          className="pl-16 text-right tabular-nums"
          {...fieldAria(id, { hint, error })}
          {...inputProps}
        />
      </div>
    </FormField>
  );
}
