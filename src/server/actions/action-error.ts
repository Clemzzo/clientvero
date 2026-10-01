import "server-only";

import { AppError, NotFoundError } from "@/server/errors";

type ActionErrorOptions = {
  scope: string;
  notFound: string;
};

export function toActionError(error: unknown, { scope, notFound }: ActionErrorOptions): string {
  if (error instanceof NotFoundError) return notFound;
  if (error instanceof AppError) return error.message;

  console.error(`[${scope}] action failed`, error instanceof Error ? error.message : error);
  return "Something went wrong. Please try again.";
}
