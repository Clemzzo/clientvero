import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, timestamps } from "./common";
import { portalAccountStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

const organizationId = () =>
  uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" });

export const portalAccounts = pgTable(
  "portal_accounts",
  {
    id: id(),
    organizationId: organizationId(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash"),
    status: portalAccountStatusEnum("status").notNull().default("INVITED"),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    invitedAt: timestamp("invited_at", { withTimezone: true }).notNull().defaultNow(),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("portal_accounts_client_uidx").on(table.clientId),
    uniqueIndex("portal_accounts_org_email_uidx").on(table.organizationId, sql`lower(${table.email})`),
    index("portal_accounts_org_client_idx").on(table.organizationId, table.clientId),
  ],
);

export const portalSetupTokens = pgTable(
  "portal_setup_tokens",
  {
    id: id(),
    organizationId: organizationId(),
    portalAccountId: uuid("portal_account_id")
      .notNull()
      .references(() => portalAccounts.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("portal_setup_tokens_account_idx").on(table.portalAccountId)],
);

export const portalSessions = pgTable(
  "portal_sessions",
  {
    id: id(),
    organizationId: organizationId(),
    portalAccountId: uuid("portal_account_id")
      .notNull()
      .references(() => portalAccounts.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("portal_sessions_account_idx").on(table.portalAccountId)],
);

export type PortalAccount = typeof portalAccounts.$inferSelect;
export type PortalAccountStatus = (typeof portalAccountStatusEnum.enumValues)[number];
