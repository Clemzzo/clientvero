import { randomUUID } from "node:crypto";

const uuidPattern = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

function projectPrefix(organizationId: string, projectId: string) {
  return `org/${organizationId}/projects/${projectId}/`;
}

export function buildObjectKey(organizationId: string, projectId: string): string {
  return `${projectPrefix(organizationId, projectId)}${randomUUID()}`;
}

export function isProjectObjectKey(key: string, organizationId: string, projectId: string): boolean {
  const prefix = projectPrefix(organizationId, projectId);
  return key.startsWith(prefix) && new RegExp(`^${uuidPattern}$`).test(key.slice(prefix.length));
}
