import { describe, expect, it } from "vitest";

import { hasPermission, permissions, requirePermission } from "@/server/authorization/permissions";
import { AuthorizationError } from "@/server/errors";

const everyPermission = Object.values(permissions);

describe("hasPermission", () => {
  it("gives OWNER and ADMIN every permission", () => {
    for (const permission of everyPermission) {
      expect(hasPermission("OWNER", permission)).toBe(true);
      expect(hasPermission("ADMIN", permission)).toBe(true);
    }
  });

  it("keeps billing, team management, and workspace settings away from MEMBER", () => {
    expect(hasPermission("MEMBER", permissions.billingRead)).toBe(false);
    expect(hasPermission("MEMBER", permissions.billingManage)).toBe(false);
    expect(hasPermission("MEMBER", permissions.teamManage)).toBe(false);
    expect(hasPermission("MEMBER", permissions.organizationUpdate)).toBe(false);
  });

  it("lets MEMBER work with leads", () => {
    expect(hasPermission("MEMBER", permissions.leadsRead)).toBe(true);
    expect(hasPermission("MEMBER", permissions.leadsCreate)).toBe(true);
    expect(hasPermission("MEMBER", permissions.leadsUpdate)).toBe(true);
  });
});

describe("requirePermission", () => {
  it("throws AuthorizationError when the role lacks the permission", () => {
    const member = { membership: { role: "MEMBER" as const } };
    expect(() => requirePermission(member, permissions.billingManage)).toThrow(AuthorizationError);
  });

  it("passes when the role has the permission", () => {
    const owner = { membership: { role: "OWNER" as const } };
    expect(() => requirePermission(owner, permissions.billingManage)).not.toThrow();
  });
});
