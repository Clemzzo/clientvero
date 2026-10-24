import { randomUUID } from "node:crypto";

const uuidPattern = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

function projectPrefix(organizationId: string, projectId: string) {
  return `org/${organizationId}/projects/${projectId}/`;
}

export function buildObjectKey(organizationId: string, projectId: string): string {
  return `${projectPrefix(organizationId, projectId)}${randomUUID()}`;
}

export function isProjectObjectKey(key: string, organizationId: string, projectId: string): boolean {
  return hasPrefixAndId(key, projectPrefix(organizationId, projectId));
}

function logoPrefix(organizationId: string) {
  return `org/${organizationId}/brand/logo/`;
}

function avatarPrefix(organizationId: string, userId: string) {
  return `org/${organizationId}/members/${userId}/avatar/`;
}

function hasPrefixAndId(key: string, prefix: string) {
  return key.startsWith(prefix) && new RegExp(`^${uuidPattern}$`).test(key.slice(prefix.length));
}

export function buildLogoKey(organizationId: string): string {
  return `${logoPrefix(organizationId)}${randomUUID()}`;
}

export function buildAvatarKey(organizationId: string, userId: string): string {
  return `${avatarPrefix(organizationId, userId)}${randomUUID()}`;
}

export function isLogoKey(key: string, organizationId: string): boolean {
  return hasPrefixAndId(key, logoPrefix(organizationId));
}

export function isAvatarKey(key: string, organizationId: string, userId: string): boolean {
  return hasPrefixAndId(key, avatarPrefix(organizationId, userId));
}
