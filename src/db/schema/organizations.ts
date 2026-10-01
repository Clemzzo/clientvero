import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./common";
import { organizationRoleEnum } from "./enums";
import { users } from "./users";

export const organizations = pgTable("organizations", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  logoUrl: text("logo_url"),
  website: text("website"),
  businessType: varchar("business_type", { length: 120 }),
  country: varchar("country", { length: 120 }),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  address: text("address"),
  taxId: varchar("tax_id", { length: 120 }),
  ...timestamps,
  ...softDelete,
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").notNull().default("MEMBER"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("organization_members_org_user_uidx").on(table.organizationId, table.userId),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export type Organization = typeof organizations.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];
