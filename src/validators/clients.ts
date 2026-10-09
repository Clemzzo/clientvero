import { z } from "zod";

import { countryCodes } from "@/features/organizations/business-profile";
import { optionalEmail, optionalText, optionalWebsite, pageNumber, requiredName, searchQuery } from "@/validators/fields";

export const CLIENTS_PAGE_SIZE = 20;

export const clientFormSchema = z.object({
  name: requiredName("Enter the client's name."),
  email: optionalEmail,
  phone: optionalText(40),
  company: optionalText(200),
  website: optionalWebsite,
  address: optionalText(500),
  country: z
    .string()
    .optional()
    .transform((value) => value || null)
    .pipe(z.enum(countryCodes as [string, ...string[]], { error: "Choose a country from the list." }).nullable()),
  notes: optionalText(5000),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;

export const clientIdSchema = z.uuid();

export const clientListQuerySchema = z.object({
  q: searchQuery,
  page: pageNumber,
});

export type ClientListQuery = z.infer<typeof clientListQuerySchema>;

export const clientTabs = ["overview", "proposals", "projects", "files", "messages", "activity"] as const;

export type ClientTab = (typeof clientTabs)[number];

export const clientTabSchema = z.enum(clientTabs).catch("overview");
