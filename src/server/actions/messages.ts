"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ThreadMessage } from "@/features/messages/thread-message";
import { withinLimits, workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { unreadSummary, type UnreadSummary } from "@/server/repositories/message.repository";
import {
  deleteOwnTeamMessage,
  listEarlierMessages,
  pollThread,
  isTerminalPollError,
  requireTeamThread,
  sendTeamMessage,
  type PollFailure,
  type ThreadPoll,
} from "@/server/services/message.service";
import { earlierMessagesSchema, messageIdSchema, pollThreadSchema, sendMessageSchema } from "@/validators/messages";

const errorOptions = { scope: "messages", notFound: "This conversation is no longer available." };
const messageMissing = "This message no longer exists.";

type MessagesResult = { error: string } | { messages: ThreadMessage[] };

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "This message can't be sent.";
}

async function requireMessageWriter() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.projectsUpdate);
  await requireWithinLimit(ctx, workspaceLimits.messagesPerUser);
  return ctx;
}

async function requireMessageReader() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.projectsRead);
  return ctx;
}

export async function sendMessageAction(input: unknown): Promise<MessagesResult> {
  try {
    const ctx = await requireMessageWriter();
    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { error: firstIssue(parsed.error) };
    }

    const messages = await sendTeamMessage(ctx, parsed.data);
    revalidatePath("/dashboard/messages", "layout");
    return { messages };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function deleteMessageAction(id: string): Promise<{ error?: string }> {
  const messageId = messageIdSchema.safeParse(id);
  if (!messageId.success) {
    return { error: messageMissing };
  }

  try {
    const ctx = await requireMessageWriter();
    await deleteOwnTeamMessage(ctx, messageId.data);
  } catch (error) {
    return { error: toActionError(error, { scope: "messages", notFound: messageMissing }) };
  }

  revalidatePath("/dashboard/messages", "layout");
  return {};
}

export async function loadEarlierMessagesAction(input: unknown): Promise<MessagesResult> {
  const parsed = earlierMessagesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: errorOptions.notFound };
  }

  try {
    const ctx = await requireMessageReader();
    const access = await requireTeamThread(ctx, parsed.data.projectId);
    return { messages: await listEarlierMessages(access, parsed.data.before) };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function pollThreadAction(input: unknown): Promise<PollFailure | ThreadPoll | null> {
  const parsed = pollThreadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: errorOptions.notFound, retryable: false };
  }

  try {
    const ctx = await requireMessageReader();
    if (!(await withinLimits([workspaceLimits.messagePollsPerUser, ctx.user.id]))) {
      return null;
    }

    const access = await requireTeamThread(ctx, parsed.data.projectId);
    return await pollThread(access, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions), retryable: !isTerminalPollError(error) };
  }
}

export async function pollInboxSummaryAction(): Promise<UnreadSummary | null> {
  try {
    const ctx = await requireMessageReader();
    if (!(await withinLimits([workspaceLimits.messagePollsPerUser, ctx.user.id]))) {
      return null;
    }

    return await unreadSummary(ctx.organization.id, "team");
  } catch {
    return null;
  }
}
