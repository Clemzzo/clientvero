"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FormField, fieldAria } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type"> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

export function PasswordField({ name, label, hint, error, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = `field-${name}`;
  const Icon = visible ? EyeOff : Eye;

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          className="pr-12"
          {...fieldAria(id, { hint, error })}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          aria-label="Show password"
          className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-sm text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <Icon aria-hidden className="size-4.5" />
        </button>
      </div>
    </FormField>
  );
}
