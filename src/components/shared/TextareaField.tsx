import type { ComponentProps } from "react";

import { FormField, fieldAria } from "@/components/shared/FormField";
import { Textarea } from "@/components/ui/textarea";

type TextareaFieldProps = ComponentProps<typeof Textarea> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextareaField({ name, label, hint, error, ...textareaProps }: TextareaFieldProps) {
  const id = `field-${name}`;

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <Textarea name={name} {...fieldAria(id, { hint, error })} {...textareaProps} />
    </FormField>
  );
}
