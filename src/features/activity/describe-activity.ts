import { z } from "zod";

import { activityActions } from "@/features/activity/activity-actions";
import { leadStatusLabels, leadStatuses } from "@/features/leads/lead-status";
import { projectStatusLabels, projectStatuses } from "@/features/projects/project-status";

const metadataSchema = z
  .object({
    name: z.string().optional(),
    signerName: z.string().optional(),
    clientName: z.string().optional(),
    to: z.enum(leadStatuses).optional(),
    milestoneName: z.string().optional(),
    fileName: z.string().optional(),
    projectStatus: z.enum(projectStatuses).optional(),
    count: z.number().int().nonnegative().optional(),
  })
  .catch({});

type ActivityDescription = {
  verb: string;
  subject?: string;
  detail?: string;
};

export function describeActivity(action: string, metadata: unknown): ActivityDescription {
  const { name, to, milestoneName, fileName, projectStatus, count } = metadataSchema.parse(metadata ?? {});

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
    case activityActions.projectCreated:
      return { verb: "created project", subject: name };
    case activityActions.projectUpdated:
      return { verb: "updated project", subject: name };
    case activityActions.projectStatusChanged:
      return {
        verb: "moved",
        subject: name,
        detail: projectStatus ? `to ${projectStatusLabels[projectStatus]}` : undefined,
      };
    case activityActions.projectDeleted:
      return { verb: "archived project", subject: name };
    case activityActions.projectDeletedPermanently:
      return { verb: "permanently deleted project", subject: name };
    case activityActions.projectRestored:
      return { verb: "restored project", subject: name };
    case activityActions.milestoneAdded:
      return { verb: "added milestone", subject: milestoneName };
    case activityActions.milestoneUpdated:
      return { verb: "updated milestone", subject: milestoneName };
    case activityActions.milestoneCompleted:
      return { verb: "completed milestone", subject: milestoneName };
    case activityActions.milestoneRemoved:
      return { verb: "removed milestone", subject: milestoneName };
    case activityActions.fileUploaded:
      return { verb: "uploaded", subject: fileName };
    case activityActions.fileShared:
      return { verb: "shared", subject: fileName, detail: "with the client" };
    case activityActions.fileUnshared:
      return { verb: "stopped sharing", subject: fileName, detail: "with the client" };
    case activityActions.fileDeleted:
      return { verb: "permanently deleted file", subject: fileName };
    case activityActions.portalInvited:
      return { verb: "invited", subject: name, detail: "to the client portal" };
    case activityActions.portalLinkIssued:
      return { verb: "created a new portal link for", subject: name };
    case activityActions.portalActivated:
      return { verb: "joined the client portal" };
    case activityActions.portalAccessRevoked:
      return { verb: "revoked portal access for", subject: name };
    case activityActions.portalDisabled:
      return { verb: "turned off the client portal" };
    case activityActions.activityCleared:
      return { verb: `cleared ${count ?? 0} activity ${count === 1 ? "entry" : "entries"}` };
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
