import { pgEnum } from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", ["OWNER", "ADMIN", "MEMBER"]);
