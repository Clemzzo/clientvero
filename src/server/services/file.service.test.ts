import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db";
import { activityLogs, files, type Organization, type User } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import type { PortalContext } from "@/server/auth/portal-session";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import {
  findPortalFileObject,
  listPortalProjectFiles,
  listProjectFiles,
  listWorkspaceFiles,
} from "@/server/repositories/file.repository";
import { createClient } from "@/server/services/client.service";
import {
  completeProjectUpload,
  deleteFile,
  getFileForDownload,
  prepareProjectUpload,
  setFileShared,
} from "@/server/services/file.service";
import { archiveProject, createProject, deleteProjectPermanently } from "@/server/services/project.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";

const storage = vi.hoisted(() => ({
  objects: new Map<string, { sizeBytes: number; contentType: string | null }>(),
  deleted: [] as string[],
}));

vi.mock("@/lib/storage/client", () => ({
  createUploadUrl: async (key: string, file: { contentType: string }) => ({
    url: `https://storage.test/${key}`,
    headers: { "Content-Type": file.contentType },
  }),
  createDownloadUrl: async (key: string) => `https://storage.test/${key}?download`,
  headObject: async (key: string) => storage.objects.get(key) ?? null,
  deleteObject: async (key: string) => {
    storage.deleted.push(key);
    storage.objects.delete(key);
  },
}));

const clientInput = {
  email: null,
  phone: null,
  company: null,
  website: null,
  address: null,
  country: "NG",
  notes: null,
};

const projectInput = {
  description: null,
  budget: null,
  currency: "USD",
  startDate: null,
  dueDate: null,
  proposalId: null,
};

describe("project files", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;
  let clientA: string;
  let clientB: string;
  let projectA: string;
  let projectB: string;

  const ctxA = () => ({ user, organization: orgA });
  const ctxB = () => ({ user, organization: orgB });

  function portalContext(clientId: string, organization = orgA): PortalContext {
    return {
      accountId: "unused",
      email: "client@example.com",
      client: { id: clientId, name: "Client" },
      organization: { id: organization.id, name: organization.name, slug: organization.slug },
    };
  }

  async function upload(projectId: string, name: string, { shared = true, sizeBytes = 1200 } = {}) {
    const prepared = await prepareProjectUpload(ctxA(), { projectId, name, sizeBytes });
    storage.objects.set(prepared.objectKey, { sizeBytes, contentType: prepared.headers["Content-Type"] });
    await completeProjectUpload(ctxA(), { projectId, name, sizeBytes, objectKey: prepared.objectKey, shared });
    const [row] = await db.select().from(files).where(eq(files.objectKey, prepared.objectKey));
    return row;
  }

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);
    clientA = await createClient(ctxA(), { ...clientInput, name: "Client A" });
    clientB = await createClient(ctxA(), { ...clientInput, name: "Client B" });
    projectA = await createProject(ctxA(), { ...projectInput, name: "Project A", clientId: clientA });
    projectB = await createProject(ctxA(), { ...projectInput, name: "Project B", clientId: clientB });
  });

  beforeEach(() => {
    storage.deleted.length = 0;
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("records an upload once, with its activity, even when completion repeats", async () => {
    const file = await upload(projectA, "Brief.pdf");

    expect(file).toMatchObject({ clientId: clientA, mimeType: "application/pdf", sizeBytes: 1200, isPublic: true });

    await completeProjectUpload(ctxA(), {
      projectId: projectA,
      name: "Brief.pdf",
      sizeBytes: 1200,
      objectKey: file.objectKey,
      shared: true,
    });

    const rows = await db.select().from(files).where(eq(files.objectKey, file.objectKey));
    const uploads = await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.organizationId, orgA.id), eq(activityLogs.action, activityActions.fileUploaded)));

    expect(rows).toHaveLength(1);
    expect(uploads.filter((entry) => (entry.metadata as { fileName?: string }).fileName === "Brief.pdf")).toHaveLength(1);
  });

  it("never touches the stored object of a file that was already saved", async () => {
    const file = await upload(projectA, "Contract.pdf");

    await completeProjectUpload(ctxA(), {
      projectId: projectA,
      name: "Contract.png",
      sizeBytes: 1,
      objectKey: file.objectKey,
      shared: false,
    });

    const [row] = await db.select().from(files).where(eq(files.objectKey, file.objectKey));
    expect(storage.deleted).not.toContain(file.objectKey);
    expect(storage.objects.has(file.objectKey)).toBe(true);
    expect(row).toMatchObject({ name: "Contract.pdf", sizeBytes: 1200, isPublic: true });
  });

  it("lists a client's files with a real total, a page at a time", async () => {
    await upload(projectB, "Logo.png");

    const result = await listWorkspaceFiles(orgA.id, { q: "", page: 1 }, { clientId: clientB });
    const otherOrg = await listWorkspaceFiles(orgB.id, { q: "", page: 1 }, { clientId: clientB });

    expect(result.total).toBeGreaterThan(0);
    expect(result.rows.every((row) => row.clientName === "Client B")).toBe(true);
    expect(otherOrg.total).toBe(0);
  });

  it("rejects an upload whose stored object doesn't match, and removes the object", async () => {
    const prepared = await prepareProjectUpload(ctxA(), { projectId: projectA, name: "big.pdf", sizeBytes: 500 });
    storage.objects.set(prepared.objectKey, { sizeBytes: 999_999, contentType: "application/pdf" });

    await expect(
      completeProjectUpload(ctxA(), {
        projectId: projectA,
        name: "big.pdf",
        sizeBytes: 500,
        objectKey: prepared.objectKey,
        shared: false,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(storage.deleted).toContain(prepared.objectKey);
  });

  it("rejects a completion that was never uploaded or points outside the project", async () => {
    const prepared = await prepareProjectUpload(ctxA(), { projectId: projectA, name: "ghost.pdf", sizeBytes: 10 });
    const ghost = { projectId: projectA, name: "ghost.pdf", sizeBytes: 10, shared: true };

    await expect(completeProjectUpload(ctxA(), { ...ghost, objectKey: prepared.objectKey })).rejects.toBeInstanceOf(
      ValidationError,
    );

    const other = await prepareProjectUpload(ctxA(), { projectId: projectB, name: "ghost.pdf", sizeBytes: 10 });
    storage.objects.set(other.objectKey, { sizeBytes: 10, contentType: "application/pdf" });
    await expect(completeProjectUpload(ctxA(), { ...ghost, objectKey: other.objectKey })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("shares, unshares and permanently deletes files, row and stored object", async () => {
    const file = await upload(projectA, "draft.docx", { shared: false });

    await setFileShared(ctxA(), file.id, true);
    expect((await getFileForDownload(orgA.id, file.id)).isPublic).toBe(true);

    await deleteFile(ctxA(), file.id);
    await expect(getFileForDownload(orgA.id, file.id)).rejects.toBeInstanceOf(NotFoundError);
    expect(await db.select().from(files).where(eq(files.id, file.id))).toHaveLength(0);
    expect(storage.deleted).toContain(file.objectKey);
    await expect(deleteFile(ctxA(), file.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("keeps another organization out of a file", async () => {
    const file = await upload(projectA, "contract.pdf");

    await expect(getFileForDownload(orgB.id, file.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(setFileShared(ctxB(), file.id, false)).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteFile(ctxB(), file.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(prepareProjectUpload(ctxB(), { projectId: projectA, name: "x.pdf", sizeBytes: 10 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(await listProjectFiles(orgB.id, projectA)).toHaveLength(0);
  });

  it("shows portal clients only their own shared files on live projects", async () => {
    const shared = await upload(projectA, "final.png");
    const internal = await upload(projectA, "notes.txt", { shared: false });
    const otherClient = await upload(projectB, "other.pdf");

    const visible = (await listPortalProjectFiles(portalContext(clientA), projectA)).map((file) => file.id);
    expect(visible).toContain(shared.id);
    expect(visible).not.toContain(internal.id);

    expect(await findPortalFileObject(portalContext(clientA), internal.id)).toBeNull();
    expect(await findPortalFileObject(portalContext(clientA), otherClient.id)).toBeNull();
    expect(await listPortalProjectFiles(portalContext(clientA), projectB)).toHaveLength(0);
    expect(await findPortalFileObject(portalContext(clientA, orgB), shared.id)).toBeNull();
    expect(await findPortalFileObject(portalContext(clientA), shared.id)).toMatchObject({ name: "final.png" });
  });

  it("hides files of archived projects and keeps projects with files archive-only", async () => {
    const projectId = await createProject(ctxA(), { ...projectInput, name: "Archived", clientId: clientA });
    const file = await upload(projectId, "handover.zip");

    await expect(deleteProjectPermanently(ctxA(), projectId)).rejects.toBeInstanceOf(ConflictError);

    await archiveProject(ctxA(), projectId);
    expect(await findPortalFileObject(portalContext(clientA), file.id)).toBeNull();
    await expect(getFileForDownload(orgA.id, file.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lets a project be deleted permanently once its files are deleted", async () => {
    const projectId = await createProject(ctxA(), { ...projectInput, name: "Cleared", clientId: clientA });
    const file = await upload(projectId, "old.pdf");

    await deleteFile(ctxA(), file.id);
    await deleteProjectPermanently(ctxA(), projectId);

    await expect(createProject(ctxA(), { ...projectInput, name: "Next", clientId: clientA })).resolves.toBeTypeOf("string");
  });
});
