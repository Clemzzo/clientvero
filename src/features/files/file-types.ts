export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_PROJECT = 200;

export type FileKind = "pdf" | "image" | "document" | "spreadsheet" | "presentation" | "text" | "archive";

type FileType = { mimeType: string; kind: FileKind };

const fileTypes: Record<string, FileType> = {
  pdf: { mimeType: "application/pdf", kind: "pdf" },
  png: { mimeType: "image/png", kind: "image" },
  jpg: { mimeType: "image/jpeg", kind: "image" },
  jpeg: { mimeType: "image/jpeg", kind: "image" },
  webp: { mimeType: "image/webp", kind: "image" },
  gif: { mimeType: "image/gif", kind: "image" },
  doc: { mimeType: "application/msword", kind: "document" },
  docx: { mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", kind: "document" },
  xls: { mimeType: "application/vnd.ms-excel", kind: "spreadsheet" },
  xlsx: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", kind: "spreadsheet" },
  csv: { mimeType: "text/csv", kind: "spreadsheet" },
  ppt: { mimeType: "application/vnd.ms-powerpoint", kind: "presentation" },
  pptx: { mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", kind: "presentation" },
  txt: { mimeType: "text/plain", kind: "text" },
  zip: { mimeType: "application/zip", kind: "archive" },
};

export const allowedExtensions = Object.keys(fileTypes);

export const acceptAttribute = allowedExtensions.map((extension) => `.${extension}`).join(",");

export const allowedTypesLabel = "PDF, images, Word, Excel, PowerPoint, CSV, text and ZIP";

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function fileTypeForName(name: string): FileType | null {
  return fileTypes[extensionOf(name)] ?? null;
}

const viewableMimeTypes: ReadonlySet<string> = new Set(["application/pdf", "image/png", "image/jpeg"]);

export function isViewableMimeType(mimeType: string): boolean {
  return viewableMimeTypes.has(mimeType);
}

export function fileKindForMimeType(mimeType: string): FileKind {
  return Object.values(fileTypes).find((type) => type.mimeType === mimeType)?.kind ?? "document";
}
