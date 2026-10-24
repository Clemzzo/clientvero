import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";
import { organizationRoleEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    role: organizationRoleEnum("role").notNull().default("MEMBER"),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    // AES-GCM copy of the token so an open invite link can be copied again; cleared once accepted or revoked.
    tokenSealed: text("token_sealed"),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("organization_invitations_open_email_uidx")
      .on(table.organizationId, sql`lower(${table.email})`)
      .where(sql`${table.acceptedAt} is null and ${table.revokedAt} is null`),
    index("organization_invitations_org_idx").on(table.organizationId),
    index("organization_invitations_email_idx").on(sql`lower(${table.email})`),
    check("organization_invitations_role_check", sql`${table.role} <> 'OWNER'`),
  ],
);

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
