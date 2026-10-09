import { beforeEach, describe, expect, it, vi } from "vitest";

const objects = new Map<string, string>();

vi.mock("@/lib/storage/client", () => ({
  contentDisposition: (type: string, name: string) => `${type}; filename="${name}"`,
  openObject: async (key: string) => {
    const body = objects.get(key);
    return body === undefined ? null : { body: new Response(body).body, sizeBytes: body.length };
  },
}));

const { inlineFileResponse } = await import("@/lib/storage/view-response");

describe("viewing files inline", () => {
  beforeEach(() => {
    objects.clear();
    objects.set("k/photo", "image-bytes");
    objects.set("k/brief", "pdf-bytes");
    objects.set("k/notes", "docx-bytes");
  });

  it("streams PNG and JPEG images inline with a locked-down policy", async () => {
    for (const mimeType of ["image/png", "image/jpeg"]) {
      const response = await inlineFileResponse({ name: "photo.png", objectKey: "k/photo", mimeType });

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe(mimeType);
      expect(response.headers.get("content-disposition")).toMatch(/^inline;/);
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("content-security-policy")).toContain("sandbox");
      expect(await response.text()).toBe("image-bytes");
    }
  });

  it("streams PDFs inline", async () => {
    const response = await inlineFileResponse({ name: "brief.pdf", objectKey: "k/brief", mimeType: "application/pdf" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toMatch(/^inline;/);
    expect(await response.text()).toBe("pdf-bytes");
  });

  it("refuses types that aren't viewable, including other images", async () => {
    for (const mimeType of [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/gif",
      "image/webp",
      "text/plain",
    ]) {
      const response = await inlineFileResponse({ name: "notes", objectKey: "k/notes", mimeType });
      expect(response.status).toBe(404);
    }
  });

  it("returns not found when the stored object is missing", async () => {
    const response = await inlineFileResponse({ name: "gone.pdf", objectKey: "k/gone", mimeType: "application/pdf" });
    expect(response.status).toBe(404);
  });
});
