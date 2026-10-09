import { describe, expect, it } from "vitest";

import { MAX_FILE_BYTES } from "@/features/files/file-types";
import { completeUploadSchema, fileNameSchema, prepareUploadSchema } from "@/validators/files";

const projectId = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";

describe("file upload validation", () => {
  it("accepts allowed extensions in any case", () => {
    for (const name of ["brief.pdf", "Logo.PNG", "notes.Docx", "budget.xlsx", "data.csv", "assets.zip"]) {
      expect(fileNameSchema.safeParse(name).success).toBe(true);
    }
  });

  it("rejects types that could run in a browser or have no extension", () => {
    for (const name of ["logo.svg", "page.html", "script.js", "README", "archive.tar.gz"]) {
      expect(fileNameSchema.safeParse(name).success).toBe(false);
    }
  });

  it("rejects path separators and control characters in names", () => {
    expect(fileNameSchema.safeParse("../secret.pdf").success).toBe(false);
    expect(fileNameSchema.safeParse("folder\\file.pdf").success).toBe(false);
    expect(fileNameSchema.safeParse("bad\u0000name.pdf").success).toBe(false);
  });

  it("enforces the size bounds", () => {
    expect(prepareUploadSchema.safeParse({ projectId, name: "a.pdf", sizeBytes: 0 }).success).toBe(false);
    expect(prepareUploadSchema.safeParse({ projectId, name: "a.pdf", sizeBytes: MAX_FILE_BYTES }).success).toBe(true);
    expect(prepareUploadSchema.safeParse({ projectId, name: "a.pdf", sizeBytes: MAX_FILE_BYTES + 1 }).success).toBe(false);
  });

  it("requires the share choice on completion", () => {
    const base = { projectId, name: "a.pdf", sizeBytes: 10, objectKey: "org/x/projects/y/z" };
    expect(completeUploadSchema.safeParse(base).success).toBe(false);
    expect(completeUploadSchema.safeParse({ ...base, shared: true }).success).toBe(true);
  });
});
