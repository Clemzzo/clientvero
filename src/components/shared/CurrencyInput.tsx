import { ComboboxField } from "@/components/shared/ComboboxField";
import { TextField } from "@/components/shared/TextField";
import { currencyOptions } from "@/features/organizations/business-profile";

type CurrencyInputProps = {
  amountName: string;
  currencyName: string;
  label: string;
  defaultAmount?: string;
  defaultCurrency: string;
  hint?: string;
  amountError?: string;
  currencyError?: string;
};

export function CurrencyInput({
  amountName,
  currencyName,
  label,
  defaultAmount,
  defaultCurrency,
  hint,
  amountError,
  currencyError,
}: CurrencyInputProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
      <TextField
        name={amountName}
        label={label}
        hint={hint}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        defaultValue={defaultAmount}
        error={amountError}
      />
      <ComboboxField
        name={currencyName}
        label="Currency"
        options={currencyOptions()}
        searchPlaceholder="Search currencies"
        defaultValue={defaultCurrency}
        required
        error={currencyError}
      />
    </div>
  );
}
