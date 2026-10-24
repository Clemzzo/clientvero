export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const imageTargets = ["avatar", "logo"] as const;

export type ImageTarget = (typeof imageTargets)[number];

const imageMimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export const imageAcceptAttribute = ".png,.jpg,.jpeg,image/png,image/jpeg";

export const imageTypesLabel = "PNG or JPG";

export const maxImageSizeLabel = `${MAX_IMAGE_BYTES / (1024 * 1024)} MB`;

export function imageMimeTypeForName(name: string): string | null {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return imageMimeTypes[extension] ?? null;
}

export function isImageMimeType(mimeType: string | null): mimeType is string {
  return mimeType === "image/png" || mimeType === "image/jpeg";
}
