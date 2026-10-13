import "server-only";

import { cookies } from "next/headers";

import { TIME_ZONE_COOKIE, userToday } from "@/lib/utils/timezone";

export async function viewerToday(): Promise<string> {
  const cookieStore = await cookies();
  return userToday(cookieStore.get(TIME_ZONE_COOKIE)?.value);
}
