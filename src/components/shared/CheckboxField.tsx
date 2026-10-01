import type { ComponentProps } from "react";

type CheckboxFieldProps = Omit<ComponentProps<"input">, "type"> & {
  name: string;
  label: string;
  hint?: string;
};

export function CheckboxField({ name, label, hint, ...inputProps }: CheckboxFieldProps) {
  const id = `field-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        aria-describedby={hintId}
        className="mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-sm accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed"
        {...inputProps}
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-[14px] font-medium text-ink-900">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-[13px] text-ink-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
