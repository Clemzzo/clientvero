"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ThreadMessage } from "@/features/messages/thread-message";
import { portalLimits, withinLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { getPortalContext, type PortalContext } from "@/server/auth/portal-session";
import { AuthenticationError, RateLimitError } from "@/server/errors";
import { unreadSummary, type UnreadSummary } from "@/server/repositories/message.repository";
import {
  deleteOwnClientMessage,
  listEarlierMessages,
  pollThread,
  isTerminalPollError,
  requireClientThread,
  sendClientMessage,
  type PollFailure,
  type ThreadPoll,
} from "@/server/services/message.service";
import { earlierMessagesSchema, messageIdSchema, pollThreadSchema, sendMessageSchema } from "@/validators/messages";
import { portalSlugSchema } from "@/validators/portal";

const errorOptions = { scope: "portal-messages", notFound: "This conversation is no longer available." };
const messageMissing = "This message no longer exists.";

type MessagesResult = { error: string } | { messages: ThreadMessage[] };

async function requirePortal(slug: string): Promise<PortalContext> {
  const parsedSlug = portalSlugSchema.safeParse(slug);
  const context = parsedSlug.success ? await getPortalContext(parsedSlug.data) : null;

  if (!context) {
    throw new AuthenticationError("Your portal session has ended. Sign in again to continue.");
  }

  return context;
}

async function requireMessageLimit(context: PortalContext) {
  if (!(await withinLimits([portalLimits.messagesPerAccount, context.accountId]))) {
    throw new RateLimitError();
  }
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "This message can't be sent.";
}

export async function sendPortalMessageAction(slug: string, input: unknown): Promise<MessagesResult> {
  try {
    const context = await requirePortal(slug);
    await requireMessageLimit(context);

    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { error: firstIssue(parsed.error) };
    }

    const messages = await sendClientMessage(context, parsed.data);
    revalidatePath(`/portal/${context.organization.slug}`, "layout");
    return { messages };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function deletePortalMessageAction(slug: string, id: string): Promise<{ error?: string }> {
  const messageId = messageIdSchema.safeParse(id);
  if (!messageId.success) {
    return { error: messageMissing };
  }

  try {
    const context = await requirePortal(slug);
    await requireMessageLimit(context);
    await deleteOwnClientMessage(context, messageId.data);
    revalidatePath(`/portal/${context.organization.slug}`, "layout");
  } catch (error) {
    return { error: toActionError(error, { scope: "portal-messages", notFound: messageMissing }) };
  }

  return {};
}

export async function loadEarlierPortalMessagesAction(slug: string, input: unknown): Promise<MessagesResult> {
  const parsed = earlierMessagesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: errorOptions.notFound };
  }

  try {
    const context = await requirePortal(slug);
    const access = await requireClientThread(context, parsed.data.projectId);
    return { messages: await listEarlierMessages(access, parsed.data.before) };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function pollPortalThreadAction(slug: string, input: unknown): Promise<PollFailure | ThreadPoll | null> {
  const parsed = pollThreadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: errorOptions.notFound, retryable: false };
  }

  try {
    const context = await requirePortal(slug);
    if (!(await withinLimits([portalLimits.messagePollsPerAccount, context.accountId]))) {
      return null;
    }

    const access = await requireClientThread(context, parsed.data.projectId);
    return await pollThread(access, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions), retryable: !isTerminalPollError(error) };
  }
}

export async function pollPortalInboxSummaryAction(slug: string): Promise<UnreadSummary | null> {
  try {
    const context = await requirePortal(slug);
    if (!(await withinLimits([portalLimits.messagePollsPerAccount, context.accountId]))) {
      return null;
    }

    return await unreadSummary(context.organization.id, "client", context.client.id);
  } catch {
    return null;
  }
}
