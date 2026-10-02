import { FormField, fieldAria } from "@/components/shared/FormField";
import { Combobox } from "@/components/ui/combobox";
import type { Option } from "@/types/option";

type ComboboxFieldProps = {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  onValueChange?: (value: string) => void;
};

export function ComboboxField({ name, label, hint, error, ...comboboxProps }: ComboboxFieldProps) {
  const id = `field-${name}`;
  const aria = fieldAria(id, { hint, error });

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <Combobox
        name={name}
        id={aria.id}
        invalid={aria["aria-invalid"]}
        describedBy={aria["aria-describedby"]}
        {...comboboxProps}
      />
    </FormField>
  );
}
