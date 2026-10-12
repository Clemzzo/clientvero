import "server-only";

import { randomBytes } from "node:crypto";

export function generatePublicId() {
  return randomBytes(16).toString("base64url");
}
