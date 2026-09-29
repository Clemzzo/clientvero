import type { ComponentProps } from "react";

import { FormField, fieldAria } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";

type TextFieldProps = ComponentProps<typeof Input> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ name, label, hint, error, ...inputProps }: TextFieldProps) {
  const id = `field-${name}`;

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <Input name={name} {...fieldAria(id, { hint, error })} {...inputProps} />
    </FormField>
  );
}
