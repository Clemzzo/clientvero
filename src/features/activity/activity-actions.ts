export const activityActions = {
  leadCreated: "LEAD_CREATED",
  leadUpdated: "LEAD_UPDATED",
  leadStatusChanged: "LEAD_STATUS_CHANGED",
  leadConverted: "LEAD_CONVERTED",
  leadDeleted: "LEAD_DELETED",
  clientCreated: "CLIENT_CREATED",
  clientUpdated: "CLIENT_UPDATED",
  clientDeleted: "CLIENT_DELETED",
  contactAdded: "CONTACT_ADDED",
  contactUpdated: "CONTACT_UPDATED",
  contactRemoved: "CONTACT_REMOVED",
} as const;

export type ActivityAction = (typeof activityActions)[keyof typeof activityActions];

export const activityResources = {
  lead: "LEAD",
  client: "CLIENT",
} as const;

export type ActivityResource = (typeof activityResources)[keyof typeof activityResources];
