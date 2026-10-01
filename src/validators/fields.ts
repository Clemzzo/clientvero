import { z } from "zod";

export function requiredName(message: string) {
  return z.string({ error: message }).trim().min(1, message).max(200, "Use 200 characters or fewer.");
}

export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Use ${max.toLocaleString("en")} characters or fewer.`)
    .optional()
    .transform((value) => value || null);
}

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .transform((value) => value || null)
  .pipe(z.email({ error: "Enter a valid email address." }).max(320).nullable());

export const optionalWebsite = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value || null))
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a valid website address." }).max(2000).nullable());

export const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((value) => value?.replaceAll(",", "") || null)
  .pipe(
    z
      .string()
      .regex(/^\d{1,12}(\.\d{1,2})?$/, "Enter an amount like 1500 or 1500.50.")
      .nullable(),
  );

export const searchQuery = z.string().trim().max(100).catch("").default("");

export const pageNumber = z.coerce.number().int().min(1).max(10_000).catch(1).default(1);
