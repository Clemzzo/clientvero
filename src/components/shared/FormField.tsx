import type { ReactNode } from "react";

type FieldMessages = {
  hint?: string;
  error?: string;
};

type FormFieldProps = FieldMessages & {
  id: string;
  label: string;
  children: ReactNode;
};

export function fieldAria(id: string, { hint, error }: FieldMessages) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  };
}

export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[14px] font-medium text-ink-900">
        {label}
      </label>

      {children}

      {error && (
        <p id={`${id}-error`} className="text-[13px] text-destructive">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${id}-hint`} className="text-[13px] text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
}
