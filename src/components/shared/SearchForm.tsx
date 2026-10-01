import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchFormProps = {
  action: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  hiddenFields?: Record<string, string | undefined>;
};

export function SearchForm({ action, label, placeholder, defaultValue, hiddenFields = {} }: SearchFormProps) {
  return (
    <form role="search" action={action} className="relative flex-1 sm:max-w-sm">
      {Object.entries(hiddenFields).map(
        ([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />,
      )}

      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
      <Input
        type="search"
        name="q"
        aria-label={label}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={100}
        className="h-10 rounded-lg pl-10 text-[14px]"
      />
    </form>
  );
}
