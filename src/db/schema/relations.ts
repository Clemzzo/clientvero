import { relations } from "drizzle-orm";

import { activityLogs } from "./activity";
import { clients } from "./clients";
import { leads } from "./leads";
import { portalAccounts, portalSessions, portalSetupTokens } from "./portal";
import { milestones, projects } from "./projects";
import { proposalSections, proposals } from "./proposals";
import { organizationMembers, organizations } from "./organizations";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  leads: many(leads),
  clients: many(clients),
  proposals: many(proposals),
  projects: many(projects),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [activityLogs.actorUserId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  proposals: many(proposals),
  projects: many(projects),
  portalAccount: one(portalAccounts),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [proposals.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [proposals.createdBy],
    references: [users.id],
  }),
  sections: many(proposalSections),
  projects: many(projects),
}));

export const proposalSectionsRelations = relations(proposalSections, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalSections.proposalId],
    references: [proposals.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  proposal: one(proposals, {
    fields: [projects.proposalId],
    references: [proposals.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  milestones: many(milestones),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  organization: one(organizations, {
    fields: [milestones.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}));

export const portalAccountsRelations = relations(portalAccounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [portalAccounts.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [portalAccounts.clientId],
    references: [clients.id],
  }),
  setupTokens: many(portalSetupTokens),
  sessions: many(portalSessions),
}));

export const portalSetupTokensRelations = relations(portalSetupTokens, ({ one }) => ({
  account: one(portalAccounts, {
    fields: [portalSetupTokens.portalAccountId],
    references: [portalAccounts.id],
  }),
}));

export const portalSessionsRelations = relations(portalSessions, ({ one }) => ({
  account: one(portalAccounts, {
    fields: [portalSessions.portalAccountId],
    references: [portalAccounts.id],
  }),
}));
