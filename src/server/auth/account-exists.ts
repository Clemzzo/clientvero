import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";

export async function emailHasAccount(email: string): Promise<boolean> {
  const result = await db.execute(sql`select 1 from neon_auth."user" where lower(email) = ${email} limit 1`);
  return result.rows.length > 0;
}
