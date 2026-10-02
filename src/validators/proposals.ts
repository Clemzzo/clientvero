import { z } from "zod";

import { currencyCodes } from "@/features/organizations/business-profile";
import { sectionTypes } from "@/features/proposals/section-types";
import { toCents } from "@/lib/utils/money";
import { optionalMoney, optionalText, pageNumber, searchQuery } from "@/validators/fields";

export const PROPOSALS_PAGE_SIZE = 20;

const sectionSchema = z.object({
  title: z.string().trim().min(1, "Give this section a title.").max(240, "Use 240 characters or fewer."),
  content: z.string().trim().max(10_000, "Use 10,000 characters or fewer."),
  sectionType: z.enum(sectionTypes),
});

const sectionsSchema = z
  .string({ error: "Add at least one section." })
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "The proposal sections couldn't be read." });
      return z.NEVER;
    }
  })
  .pipe(z.array(sectionSchema).min(1, "Add at least one section.").max(20, "Use 20 sections or fewer."));

const amountOrZero = optionalMoney.transform((value) => value ?? "0");

export const proposalFormSchema = z
  .object({
    clientId: z.uuid({ error: "Choose a client." }),
    title: z.string({ error: "Give the proposal a title." }).trim().min(1, "Give the proposal a title.").max(240, "Use 240 characters or fewer."),
    description: optionalText(500),
    currency: z.enum(currencyCodes as [string, ...string[]], { error: "Choose a currency." }),
    subtotal: optionalMoney.refine((value) => value !== null && toCents(value) > 0n, "Enter the proposal amount."),
    discount: amountOrZero,
    tax: amountOrZero,
    timeline: optionalText(2000),
    terms: optionalText(10_000),
    sections: sectionsSchema,
  })
  .transform((input) => ({ ...input, subtotal: input.subtotal as string }))
  .refine((input) => toCents(input.discount) <= toCents(input.subtotal), {
    path: ["discount"],
    message: "Discount can't be more than the amount.",
  });

export type ProposalFormInput = z.infer<typeof proposalFormSchema>;

export const proposalIdSchema = z.uuid();

export const proposalPublicIdSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);

export const proposalFilters = ["all", "draft", "sent", "accepted", "declined"] as const;

export type ProposalFilter = (typeof proposalFilters)[number];

export const proposalListQuerySchema = z.object({
  q: searchQuery,
  status: z.enum(proposalFilters).catch("all"),
  page: pageNumber,
});

export type ProposalListQuery = z.infer<typeof proposalListQuerySchema>;

export const acceptProposalSchema = z.object({
  signerName: z.string({ error: "Type your full name to accept." }).trim().min(2, "Type your full name to accept.").max(120, "Use 120 characters or fewer."),
});

export const declineProposalSchema = z.object({
  reason: optionalText(1000),
});
