import "server-only";

import { and, eq, inArray, isNull, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { messages, projects } from "@/db/schema";
import type { ThreadMessage } from "@/features/messages/thread-message";
import type { WorkspaceActor } from "@/server/auth/organization";
import type { PortalContext } from "@/server/auth/portal-session";
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from "@/server/errors";
import {
  findExistingIds,
  latestSeenAt,
  listThread,
  listThreadAfter,
  markThreadRead,
  type ThreadScope,
  type ThreadViewer,
} from "@/server/repositories/message.repository";
import { getPortalProject } from "@/server/repositories/portal.repository";
import { requireProject } from "@/server/services/project.service";
import type { PollThreadInput, SendMessageInput } from "@/validators/messages";

export type ThreadAccess = { scope: ThreadScope; viewer: ThreadViewer };

export type PollFailure = { error: string; retryable: boolean };

export function isTerminalPollError(error: unknown): boolean {
  return error instanceof NotFoundError || error instanceof AuthenticationError || error instanceof AuthorizationError;
}

export type ThreadPoll = {
  messages: ThreadMessage[];
  seenUpTo: string | null;
  deletedIds: string[];
  markedRead: number;
};

const messageMissing = "This message no longer exists.";

type NewMessage = typeof messages.$inferInsert & { id: string; organizationId: string; projectId: string };

async function insertOnce(values: NewMessage, sentBySameSender: SQL | undefined): Promise<void> {
  const [inserted] = await db
    .insert(messages)
    .values(values)
    .onConflictDoNothing({ target: messages.id })
    .returning({ id: messages.id });

  if (inserted) return;

  const [existing] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.id, values.id),
        eq(messages.organizationId, values.organizationId),
        eq(messages.projectId, values.projectId),
        sentBySameSender,
      ),
    )
    .limit(1);

  if (!existing) {
    throw new ConflictError("This message couldn't be sent. Try again.");
  }
}

export async function requireTeamThread(ctx: WorkspaceActor, projectId: string): Promise<ThreadAccess> {
  const project = await requireProject(ctx.organization.id, projectId);
  return {
    scope: { organizationId: ctx.organization.id, projectId: project.id },
    viewer: { side: "team", userId: ctx.user.id },
  };
}

export async function requireClientThread(context: PortalContext, projectId: string): Promise<ThreadAccess> {
  const project = await getPortalProject(context, projectId);
  return {
    scope: { organizationId: context.organization.id, projectId: project.id, clientId: context.client.id },
    viewer: { side: "client" },
  };
}

export async function sendTeamMessage(ctx: WorkspaceActor, input: SendMessageInput): Promise<ThreadMessage[]> {
  const project = await requireProject(ctx.organization.id, input.projectId);
  const scope: ThreadScope = { organizationId: ctx.organization.id, projectId: project.id };

  await insertOnce(
    {
      id: input.id,
      organizationId: scope.organizationId,
      clientId: project.clientId,
      projectId: project.id,
      senderUserId: ctx.user.id,
      content: input.content,
    },
    eq(messages.senderUserId, ctx.user.id),
  );

  return listThreadAfter(scope, { side: "team", userId: ctx.user.id }, input.after);
}

export async function sendClientMessage(context: PortalContext, input: SendMessageInput): Promise<ThreadMessage[]> {
  const { scope, viewer } = await requireClientThread(context, input.projectId);

  await insertOnce(
    {
      id: input.id,
      organizationId: scope.organizationId,
      clientId: context.client.id,
      projectId: scope.projectId,
      senderUserId: null,
      content: input.content,
    },
    and(isNull(messages.senderUserId), eq(messages.clientId, context.client.id)),
  );

  return listThreadAfter(scope, viewer, input.after);
}

function liveProjectIds(organizationId: string, clientId?: string) {
  return db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.organizationId, organizationId),
        isNull(projects.deletedAt),
        clientId ? eq(projects.clientId, clientId) : undefined,
      ),
    );
}

export async function deleteOwnTeamMessage(ctx: WorkspaceActor, messageId: string): Promise<void> {
  const deleted = await db
    .delete(messages)
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.organizationId, ctx.organization.id),
        eq(messages.senderUserId, ctx.user.id),
        inArray(messages.projectId, liveProjectIds(ctx.organization.id)),
      ),
    )
    .returning({ id: messages.id });

  if (deleted.length === 0) {
    throw new NotFoundError(messageMissing);
  }
}

export async function deleteOwnClientMessage(context: PortalContext, messageId: string): Promise<void> {
  const organizationId = context.organization.id;
  const deleted = await db
    .delete(messages)
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.organizationId, organizationId),
        eq(messages.clientId, context.client.id),
        isNull(messages.senderUserId),
        inArray(messages.projectId, liveProjectIds(organizationId, context.client.id)),
      ),
    )
    .returning({ id: messages.id });

  if (deleted.length === 0) {
    throw new NotFoundError(messageMissing);
  }
}

export async function pollThread({ scope, viewer }: ThreadAccess, input: Omit<PollThreadInput, "projectId">): Promise<ThreadPoll> {
  const markedRead = await markThreadRead(scope, viewer.side);
  const [newMessages, seenUpTo, existing] = await Promise.all([
    listThreadAfter(scope, viewer, input.after),
    latestSeenAt(scope, viewer.side),
    findExistingIds(scope, input.knownIds),
  ]);

  return {
    messages: newMessages,
    seenUpTo,
    deletedIds: input.knownIds.filter((id) => !existing.has(id)),
    markedRead,
  };
}

export function listEarlierMessages({ scope, viewer }: ThreadAccess, before: string): Promise<ThreadMessage[]> {
  return listThread(scope, viewer, before);
}
