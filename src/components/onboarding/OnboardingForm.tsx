"use client";

import { startTransition, useActionState, useRef, useState, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft } from "lucide-react";

import { ComboboxField } from "@/components/shared/ComboboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { businessTypes, defaultCurrency } from "@/features/organizations/business-profile";
import { cn } from "@/lib/utils";
import { completeOnboardingAction, type OnboardingFormState } from "@/server/actions/onboarding";
import type { Option } from "@/types/option";

type Step = 1 | 2;

type OnboardingFormProps = {
  countries: Option[];
  currencies: Option[];
};

const stepTitles: Record<Step, string> = {
  1: "About your business",
  2: "Where you work",
};

const stepOneFields = ["name", "businessType"] as const;
const businessTypeOptions = businessTypes.map((type) => ({ value: type, label: type }));

function hasStepOneError(state: OnboardingFormState) {
  return stepOneFields.some((field) => state?.fieldErrors?.[field]);
}

export function OnboardingForm({ countries, currencies }: OnboardingFormProps) {
  const [state, submit, isPending] = useActionState(completeOnboardingAction, null);
  const [step, setStep] = useState<Step>(1);
  const [shownState, setShownState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);

  if (state !== shownState) {
    setShownState(state);
    if (hasStepOneError(state)) setStep(1);
  }

  function errorFor(field: "name" | "businessType" | "country" | "currency") {
    return state?.fieldErrors?.[field]?.[0];
  }

  function goToStep(next: Step, focusField: string) {
    flushSync(() => setStep(next));
    document.getElementById(`field-${focusField}`)?.focus();
  }

  function stepOneIsValid() {
    const form = formRef.current;
    if (!form) return false;

    return stepOneFields.every((field) => {
      const element = form.elements.namedItem(field);
      return !(element instanceof HTMLInputElement) || element.reportValidity();
    });
  }

  function continueToStepTwo() {
    if (stepOneIsValid()) goToStep(2, "country");
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 1) {
      continueToStepTwo();
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <StepHeader step={step} />

      <fieldset disabled={isPending} className="mt-6 space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <div hidden={step !== 1} className="space-y-5">
          <TextField
            name="name"
            label="Workspace name"
            hint="Your clients see this name."
            autoComplete="organization"
            required
            minLength={2}
            maxLength={200}
            error={errorFor("name")}
          />

          <ComboboxField
            name="businessType"
            label="What best describes you?"
            options={businessTypeOptions}
            placeholder="Choose one"
            required
            error={errorFor("businessType")}
          />

          <Button type="button" onClick={continueToStepTwo} className="mt-2 h-12 w-full rounded-md text-[15px] font-semibold">
            Continue
          </Button>
        </div>

        <div hidden={step !== 2} className="space-y-5">
          <ComboboxField
            name="country"
            label="Country"
            options={countries}
            placeholder="Choose your country"
            searchPlaceholder="Search countries…"
            required
            error={errorFor("country")}
          />

          <ComboboxField
            name="currency"
            label="Currency"
            hint="Used for your invoices and proposals."
            options={currencies}
            searchPlaceholder="Search currencies…"
            defaultValue={defaultCurrency}
            required
            error={errorFor("currency")}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(1, "name")}
              className="mt-2 h-12 rounded-md px-5 text-[15px] font-semibold"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </Button>

            <SubmitButton pending={isPending} pendingLabel="Creating workspace…" className="flex-1">
              Create workspace
            </SubmitButton>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

function StepHeader({ step }: { step: Step }) {
  return (
    <div>
      <p aria-live="polite" className="text-[16px] font-semibold text-ink-500">
        Step {step} of 2 · <span className="text-ink-900">{stepTitles[step]}</span>
      </p>
      <div aria-hidden className="mt-3 h-1 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            "h-full rounded-full bg-brand-600 transition-[width] duration-300",
            step === 1 ? "w-1/2" : "w-full",
          )}
        />
      </div>
    </div>
  );
}
