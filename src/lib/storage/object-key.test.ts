import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { buildObjectKey, isProjectObjectKey } from "@/lib/storage/object-key";

describe("project object keys", () => {
  const organizationId = randomUUID();
  const projectId = randomUUID();

  it("builds keys that belong to the project", () => {
    const key = buildObjectKey(organizationId, projectId);

    expect(key.startsWith(`org/${organizationId}/projects/${projectId}/`)).toBe(true);
    expect(isProjectObjectKey(key, organizationId, projectId)).toBe(true);
  });

  it("rejects keys from another organization or project", () => {
    const key = buildObjectKey(organizationId, projectId);

    expect(isProjectObjectKey(key, randomUUID(), projectId)).toBe(false);
    expect(isProjectObjectKey(key, organizationId, randomUUID())).toBe(false);
  });

  it("rejects keys with extra path segments or a non-UUID name", () => {
    const prefix = `org/${organizationId}/projects/${projectId}/`;

    expect(isProjectObjectKey(`${prefix}${randomUUID()}/x`, organizationId, projectId)).toBe(false);
    expect(isProjectObjectKey(`${prefix}../other`, organizationId, projectId)).toBe(false);
    expect(isProjectObjectKey(`${prefix}file.pdf`, organizationId, projectId)).toBe(false);
  });
});
