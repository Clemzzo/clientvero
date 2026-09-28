import { pgTable, text, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";

export const users = pgTable("users", {
  id: id(),
  authUserId: text("auth_user_id").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 100 }),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
