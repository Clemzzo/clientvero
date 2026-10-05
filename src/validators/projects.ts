import { z } from "zod";

import { currencyCodes } from "@/features/organizations/business-profile";
import { milestoneStatuses } from "@/features/projects/milestone-status";
import { projectFilters, projectStatuses } from "@/features/projects/project-status";
import { optionalDate, optionalMoney, optionalText, pageNumber, searchQuery } from "@/validators/fields";

export const PROJECTS_PAGE_SIZE = 20;

const projectName = z
  .string({ error: "Give the project a name." })
  .trim()
  .min(1, "Give the project a name.")
  .max(240, "Use 240 characters or fewer.");

const projectFields = z.object({
  name: projectName,
  description: optionalText(2000),
  budget: optionalMoney,
  currency: z.enum(currencyCodes as [string, ...string[]], { error: "Choose a currency." }),
  startDate: optionalDate,
  dueDate: optionalDate,
});

function dueAfterStart(input: { startDate: string | null; dueDate: string | null }) {
  return !input.startDate || !input.dueDate || input.dueDate >= input.startDate;
}

const dueDateIssue = { path: ["dueDate"], message: "The due date can't be before the start date." };

export const projectFormSchema = projectFields.refine(dueAfterStart, dueDateIssue);

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const createProjectSchema = projectFields
  .extend({
    clientId: z.uuid({ error: "Choose a client." }),
    proposalId: z
      .string()
      .optional()
      .transform((value) => value || null)
      .pipe(z.uuid().nullable()),
  })
  .refine(dueAfterStart, dueDateIssue);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const projectIdSchema = z.uuid();

export const projectStatusSchema = z.enum(projectStatuses);

export const projectListQuerySchema = z.object({
  q: searchQuery,
  status: z.enum(projectFilters).catch("all"),
  page: pageNumber,
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export const projectTabs = ["overview", "milestones", "activity"] as const;

export type ProjectTab = (typeof projectTabs)[number];

export const projectTabSchema = z.enum(projectTabs).catch("overview");

export const milestoneFormSchema = z.object({
  name: z
    .string({ error: "Give the milestone a name." })
    .trim()
    .min(1, "Give the milestone a name.")
    .max(240, "Use 240 characters or fewer."),
  description: optionalText(2000),
  dueDate: optionalDate,
});

export type MilestoneFormInput = z.infer<typeof milestoneFormSchema>;

export const milestoneIdSchema = z.uuid();

export const milestoneStatusSchema = z.enum(milestoneStatuses);

export const moveDirectionSchema = z.enum(["up", "down"]);

export type MoveDirection = z.infer<typeof moveDirectionSchema>;
