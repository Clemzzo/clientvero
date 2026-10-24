"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";

import { ImageUploader } from "@/components/settings/ImageUploader";
import { useSavedNotice } from "@/components/settings/use-saved-notice";
import { ComboboxField } from "@/components/shared/ComboboxField";
import { CopyField } from "@/components/shared/CopyField";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Card } from "@/components/ui/card";
import type { Organization } from "@/db/schema";
import { businessTypes } from "@/features/organizations/business-profile";
import { updateBusinessAction } from "@/server/actions/settings";
import type { Option } from "@/types/option";

type BusinessFormProps = {
  organization: Pick<Organization, "name" | "businessType" | "country" | "currency" | "website" | "address">;
  logoSrc: string | null;
  portalUrl: string;
  countries: Option[];
  currencies: Option[];
};

const businessTypeOptions = businessTypes.map((type) => ({ value: type, label: type }));

export function BusinessForm({ organization, logoSrc, portalUrl, countries, currencies }: BusinessFormProps) {
  const [state, submit, isPending] = useActionState(updateBusinessAction, null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  useSavedNotice(state, "Business details saved.");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <div className="space-y-6">
      <Card>
        <FormSection title="Logo" description="Appears in your client portal and on proposals and invoices.">
          <ImageUploader target="logo" name={organization.name} src={logoSrc} label="Business logo" />
        </FormSection>
        <FormSection title="Client portal" description="Your clients sign in here. The address is fixed so links never break.">
          <CopyField label="Client portal address" value={portalUrl} />
        </FormSection>
      </Card>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isPending} className="space-y-5">
          {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

          <Card>
            <FormSection title="Client-facing details" description="Shown on proposals, invoices and in the client portal.">
              <TextField
                name="name"
                label="Business name"
                autoComplete="organization"
                required
                minLength={2}
                maxLength={200}
                defaultValue={organization.name}
                error={errorFor("name")}
              />
              <TextField
                name="website"
                label="Website"
                inputMode="url"
                autoComplete="url"
                placeholder="example.com"
                defaultValue={organization.website ?? ""}
                error={errorFor("website")}
              />
              <TextareaField
                name="address"
                label="Address"
                rows={3}
                maxLength={500}
                defaultValue={organization.address ?? ""}
                error={errorFor("address")}
              />
            </FormSection>

            <FormSection title="Region & currency" description="Defaults for new work. Existing records keep their own values.">
              <ComboboxField
                name="businessType"
                label="What best describes you?"
                options={businessTypeOptions}
                placeholder="Choose one"
                defaultValue={organization.businessType ?? ""}
                required
                error={errorFor("businessType")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <ComboboxField
                  name="country"
                  label="Country"
                  options={countries}
                  placeholder="Choose your country"
                  searchPlaceholder="Search countries…"
                  defaultValue={organization.country ?? ""}
                  required
                  error={errorFor("country")}
                />
                <ComboboxField
                  name="currency"
                  label="Currency"
                  hint="New proposals and invoices use this currency."
                  options={currencies}
                  searchPlaceholder="Search currencies…"
                  defaultValue={organization.currency}
                  required
                  error={errorFor("currency")}
                />
              </div>
            </FormSection>
          </Card>

          <div className="flex justify-end">
            <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-44">
              Save changes
            </SubmitButton>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
