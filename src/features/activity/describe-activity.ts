import { z } from "zod";

import { activityActions } from "@/features/activity/activity-actions";
import { leadStatusLabels, leadStatuses } from "@/features/leads/lead-status";

const metadataSchema = z
  .object({
    name: z.string().optional(),
    contactName: z.string().optional(),
    to: z.enum(leadStatuses).optional(),
  })
  .catch({});

type ActivityDescription = {
  verb: string;
  subject?: string;
  detail?: string;
};

export function describeActivity(action: string, metadata: unknown): ActivityDescription {
  const { name, contactName, to } = metadataSchema.parse(metadata ?? {});

  switch (action) {
    case activityActions.leadCreated:
      return { verb: "added lead", subject: name };
    case activityActions.leadUpdated:
      return { verb: "updated lead", subject: name };
    case activityActions.leadStatusChanged:
      return { verb: "moved", subject: name, detail: to ? `to ${leadStatusLabels[to]}` : undefined };
    case activityActions.leadConverted:
      return { verb: "converted", subject: name, detail: "to a client" };
    case activityActions.leadDeleted:
      return { verb: "deleted lead", subject: name };
    case activityActions.clientCreated:
      return { verb: "added client", subject: name };
    case activityActions.clientUpdated:
      return { verb: "updated client", subject: name };
    case activityActions.clientDeleted:
      return { verb: "deleted client", subject: name };
    case activityActions.contactAdded:
      return { verb: "added contact", subject: contactName };
    case activityActions.contactUpdated:
      return { verb: "updated contact", subject: contactName };
    case activityActions.contactRemoved:
      return { verb: "removed contact", subject: contactName };
    default:
      return { verb: "made a change" };
  }
}

export function actorName(entry: { actorFirstName: string | null; actorLastName: string | null; actorEmail: string | null }) {
  return [entry.actorFirstName, entry.actorLastName].filter(Boolean).join(" ") || entry.actorEmail || "Someone";
}
