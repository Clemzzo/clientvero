import "server-only";

import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, files, projects, users } from "@/db/schema";
import type { PortalContext } from "@/server/auth/portal-session";
import { escapeLike } from "@/server/repositories/search";
import { FILES_PAGE_SIZE, type FileListQuery } from "@/validators/files";

export type FileRow = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  isPublic: boolean;
  createdAt: Date;
  projectId: string;
  projectName: string;
  clientName: string;
  uploaderFirstName: string | null;
  uploaderLastName: string | null;
  uploaderEmail: string | null;
};

export type FileListResult = {
  rows: FileRow[];
  total: number;
  pageCount: number;
};

export type PortalFile = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

const PROJECT_FILE_LIMIT = 200;

function liveFiles(organizationId: string) {
  return [eq(files.organizationId, organizationId), isNull(projects.deletedAt)];
}

function selectFileRows() {
  return db
    .select({
      id: files.id,
      name: files.name,
      mimeType: files.mimeType,
      sizeBytes: files.sizeBytes,
      isPublic: files.isPublic,
      createdAt: files.createdAt,
      projectId: files.projectId,
      projectName: projects.name,
      clientName: clients.name,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
      uploaderEmail: users.email,
    })
    .from(files)
    .innerJoin(projects, and(eq(projects.id, files.projectId), eq(projects.organizationId, files.organizationId)))
    .innerJoin(clients, eq(clients.id, files.clientId))
    .leftJoin(users, eq(users.id, files.uploadedBy))
    .orderBy(desc(files.createdAt), desc(files.id))
    .$dynamic();
}

export function listProjectFiles(organizationId: string, projectId: string): Promise<FileRow[]> {
  return selectFileRows()
    .where(and(...liveFiles(organizationId), eq(files.projectId, projectId)))
    .limit(PROJECT_FILE_LIMIT);
}

function searchFilter(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  return or(ilike(files.name, pattern), ilike(projects.name, pattern), ilike(clients.name, pattern))!;
}

export async function listWorkspaceFiles(
  organizationId: string,
  query: FileListQuery,
  scope: { clientId?: string } = {},
): Promise<FileListResult> {
  const filters: SQL[] = liveFiles(organizationId);
  if (scope.clientId) filters.push(eq(files.clientId, scope.clientId));
  if (query.q) filters.push(searchFilter(query.q));
  const where = and(...filters);

  const [rows, [{ total }]] = await Promise.all([
    selectFileRows()
      .where(where)
      .limit(FILES_PAGE_SIZE)
      .offset((query.page - 1) * FILES_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(files)
      .innerJoin(projects, and(eq(projects.id, files.projectId), eq(projects.organizationId, files.organizationId)))
      .innerJoin(clients, eq(clients.id, files.clientId))
      .where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / FILES_PAGE_SIZE)) };
}

function portalFiles(context: PortalContext) {
  return and(
    eq(files.organizationId, context.organization.id),
    eq(files.clientId, context.client.id),
    eq(files.isPublic, true),
    eq(projects.organizationId, context.organization.id),
    eq(projects.clientId, context.client.id),
    isNull(projects.deletedAt),
  );
}

function selectPortalFiles() {
  return db
    .select({
      id: files.id,
      name: files.name,
      mimeType: files.mimeType,
      sizeBytes: files.sizeBytes,
      createdAt: files.createdAt,
    })
    .from(files)
    .innerJoin(projects, eq(projects.id, files.projectId))
    .$dynamic();
}

export function listPortalProjectFiles(context: PortalContext, projectId: string): Promise<PortalFile[]> {
  return selectPortalFiles()
    .where(and(portalFiles(context), eq(files.projectId, projectId)))
    .orderBy(desc(files.createdAt), desc(files.id))
    .limit(PROJECT_FILE_LIMIT);
}

export type FileObject = { name: string; objectKey: string; mimeType: string };

export async function findPortalFileObject(context: PortalContext, fileId: string): Promise<FileObject | null> {
  const [file] = await db
    .select({ name: files.name, objectKey: files.objectKey, mimeType: files.mimeType })
    .from(files)
    .innerJoin(projects, eq(projects.id, files.projectId))
    .where(and(portalFiles(context), eq(files.id, fileId)))
    .limit(1);

  return file ?? null;
}
