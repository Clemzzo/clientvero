import { z } from "zod";

import { currencyCodes } from "@/features/organizations/business-profile";
import { leadStatuses } from "@/features/leads/lead-status";
import {
  optionalEmail,
  optionalMoney,
  optionalText,
  optionalWebsite,
  pageNumber,
  requiredName,
  searchQuery,
} from "@/validators/fields";

export const LEADS_PAGE_SIZE = 20;

export const leadFormSchema = z.object({
  name: requiredName("Enter the lead's name."),
  email: optionalEmail,
  phone: optionalText(40),
  company: optionalText(200),
  website: optionalWebsite,
  source: optionalText(100),
  service: optionalText(160),
  estimatedValue: optionalMoney,
  currency: z.enum(currencyCodes as [string, ...string[]], { error: "Choose a currency." }),
  notes: optionalText(5000),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const leadStatusSchema = z.enum(leadStatuses);

export const leadIdSchema = z.uuid();

export const leadListQuerySchema = z.object({
  view: z.enum(["list", "pipeline"]).catch("list"),
  q: searchQuery,
  status: leadStatusSchema.optional().catch(undefined),
  page: pageNumber,
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
