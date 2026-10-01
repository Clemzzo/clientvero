import { relations } from "drizzle-orm";

import { organizationMembers, organizations } from "./organizations";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
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
