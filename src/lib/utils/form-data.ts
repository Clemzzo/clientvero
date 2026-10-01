export function readFormFields<const Field extends string>(formData: FormData, fields: readonly Field[]) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : undefined];
    }),
  ) as Record<Field, string | undefined>;
}
