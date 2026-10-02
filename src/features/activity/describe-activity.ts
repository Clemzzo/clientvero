import { z } from "zod";

import { activityActions } from "@/features/activity/activity-actions";
import { leadStatusLabels, leadStatuses } from "@/features/leads/lead-status";

const metadataSchema = z
  .object({
    name: z.string().optional(),
    contactName: z.string().optional(),
    signerName: z.string().optional(),
    clientName: z.string().optional(),
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
      return { verb: "archived lead", subject: name };
    case activityActions.leadDeletedPermanently:
      return { verb: "permanently deleted lead", subject: name };
    case activityActions.leadRestored:
      return { verb: "restored lead", subject: name };
    case activityActions.clientCreated:
      return { verb: "added client", subject: name };
    case activityActions.clientUpdated:
      return { verb: "updated client", subject: name };
    case activityActions.clientDeleted:
      return { verb: "archived client", subject: name };
    case activityActions.clientDeletedPermanently:
      return { verb: "permanently deleted client", subject: name };
    case activityActions.clientRestored:
      return { verb: "restored client", subject: name };
    case activityActions.contactAdded:
      return { verb: "added contact", subject: contactName };
    case activityActions.contactUpdated:
      return { verb: "updated contact", subject: contactName };
    case activityActions.contactRemoved:
      return { verb: "removed contact", subject: contactName };
    case activityActions.proposalCreated:
      return { verb: "created proposal", subject: name };
    case activityActions.proposalUpdated:
      return { verb: "updated proposal", subject: name };
    case activityActions.proposalSent:
      return { verb: "sent proposal", subject: name };
    case activityActions.proposalViewed:
      return { verb: "viewed proposal", subject: name };
    case activityActions.proposalAccepted:
      return { verb: "accepted proposal", subject: name };
    case activityActions.proposalDeclined:
      return { verb: "declined proposal", subject: name };
    case activityActions.proposalWithdrawn:
      return { verb: "withdrew proposal", subject: name };
    default:
      return { verb: "made a change" };
  }
}

type ActorFields = {
  actorFirstName: string | null;
  actorLastName: string | null;
  actorEmail: string | null;
  metadata: unknown;
};

export function actorName(entry: ActorFields) {
  const userName = [entry.actorFirstName, entry.actorLastName].filter(Boolean).join(" ") || entry.actorEmail;

  if (userName) return userName;

  const { signerName, clientName } = metadataSchema.parse(entry.metadata ?? {});
  return signerName ?? clientName ?? "Someone";
}
