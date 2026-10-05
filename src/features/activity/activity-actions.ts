export const activityActions = {
  leadCreated: "LEAD_CREATED",
  leadUpdated: "LEAD_UPDATED",
  leadStatusChanged: "LEAD_STATUS_CHANGED",
  leadConverted: "LEAD_CONVERTED",
  leadDeleted: "LEAD_DELETED",
  leadDeletedPermanently: "LEAD_DELETED_PERMANENTLY",
  leadRestored: "LEAD_RESTORED",
  clientCreated: "CLIENT_CREATED",
  clientUpdated: "CLIENT_UPDATED",
  clientDeleted: "CLIENT_DELETED",
  clientDeletedPermanently: "CLIENT_DELETED_PERMANENTLY",
  clientRestored: "CLIENT_RESTORED",
  contactAdded: "CONTACT_ADDED",
  contactUpdated: "CONTACT_UPDATED",
  contactRemoved: "CONTACT_REMOVED",
  proposalCreated: "PROPOSAL_CREATED",
  proposalUpdated: "PROPOSAL_UPDATED",
  proposalSent: "PROPOSAL_SENT",
  proposalViewed: "PROPOSAL_VIEWED",
  proposalAccepted: "PROPOSAL_ACCEPTED",
  proposalDeclined: "PROPOSAL_DECLINED",
  proposalWithdrawn: "PROPOSAL_WITHDRAWN",
  projectCreated: "PROJECT_CREATED",
  projectUpdated: "PROJECT_UPDATED",
  projectStatusChanged: "PROJECT_STATUS_CHANGED",
  projectDeleted: "PROJECT_DELETED",
  projectDeletedPermanently: "PROJECT_DELETED_PERMANENTLY",
  projectRestored: "PROJECT_RESTORED",
  milestoneAdded: "MILESTONE_ADDED",
  milestoneUpdated: "MILESTONE_UPDATED",
  milestoneCompleted: "MILESTONE_COMPLETED",
  milestoneRemoved: "MILESTONE_REMOVED",
  activityCleared: "ACTIVITY_CLEARED",
} as const;

export type ActivityAction = (typeof activityActions)[keyof typeof activityActions];

export const activityResources = {
  lead: "LEAD",
  client: "CLIENT",
  proposal: "PROPOSAL",
  project: "PROJECT",
  organization: "ORGANIZATION",
} as const;

export type ActivityResource = (typeof activityResources)[keyof typeof activityResources];

export const activityActorTypes = {
  user: "USER",
  client: "CLIENT",
} as const;

export type ActivityActorType = (typeof activityActorTypes)[keyof typeof activityActorTypes];
