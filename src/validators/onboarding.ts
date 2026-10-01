import { z } from "zod";

import { businessTypes, countryCodes, currencyCodes } from "@/features/organizations/business-profile";

export const onboardingSchema = z.object({
  name: z
    .string({ error: "Enter a workspace name." })
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(200, "Use 200 characters or fewer."),
  businessType: z.enum(businessTypes, { error: "Choose what best describes you." }),
  country: z
    .string({ error: "Choose your country." })
    .refine((code) => countryCodes.includes(code), "Choose your country."),
  currency: z
    .string({ error: "Choose a currency." })
    .refine((code) => currencyCodes.includes(code), "Choose a currency."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
