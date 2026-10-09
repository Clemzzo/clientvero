import "server-only";

import { and, asc, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, messages, portalAccounts, projects, users, type ProjectStatus } from "@/db/schema";
import { MESSAGES_PAGE_SIZE, type MessageSide, type ThreadMessage } from "@/features/messages/thread-message";
import { escapeLike } from "@/server/repositories/search";
import type { Option } from "@/types/option";
import { INBOX_PAGE_SIZE, type InboxQuery } from "@/validators/messages";

export type ThreadViewer = { side: "team"; userId: string } | { side: "client" };

export type ThreadScope = {
  organizationId: string;
  projectId: string;
  clientId?: string;
};

export type ConversationRow = {
  projectId: string;
  projectName: string;
  projectStatus: ProjectStatus;
  clientId: string;
  clientName: string;
  preview: string;
  lastSide: MessageSide;
  lastAt: Date;
  unread: number;
};

export type ConversationListResult = {
  rows: ConversationRow[];
  total: number;
  pageCount: number;
};

export type UnreadSummary = {
  unread: number;
  latestAt: string | null;
};

const POLL_LIMIT = 100;
const POLL_OVERLAP = sql`interval '2 seconds'`;
const PORTAL_CONVERSATION_LIMIT = 50;
const PREVIEW_LENGTH = 140;

const sentAt = sql<string>`to_char(${messages.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

function cursorTime(cursor: string) {
  return sql`${cursor}::timestamptz`;
}

function fromSide(side: MessageSide) {
  return side === "team" ? isNotNull(messages.senderUserId) : isNull(messages.senderUserId);
}

function otherSide(side: MessageSide): MessageSide {
  return side === "team" ? "client" : "team";
}

function liveProject(organizationId: string) {
  return and(eq(projects.id, messages.projectId), eq(projects.organizationId, organizationId), isNull(projects.deletedAt));
}

function scopeFilters(scope: ThreadScope): SQL[] {
  const filters = [eq(messages.organizationId, scope.organizationId), eq(messages.projectId, scope.projectId)];
  if (scope.clientId) {
    filters.push(eq(messages.clientId, scope.clientId), eq(projects.clientId, scope.clientId));
  }
  return filters;
}

function selectThreadRows() {
  return db
    .select({
      id: messages.id,
      sentAt,
      content: messages.content,
      senderUserId: messages.senderUserId,
      isRead: messages.isRead,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
      senderEmail: users.email,
      clientName: clients.name,
    })
    .from(messages)
    .innerJoin(projects, eq(projects.id, messages.projectId))
    .innerJoin(clients, eq(clients.id, messages.clientId))
    .leftJoin(users, eq(users.id, messages.senderUserId))
    .$dynamic();
}

type ThreadRow = Awaited<ReturnType<ReturnType<typeof selectThreadRows>["execute"]>>[number];

function teamName(row: ThreadRow, viewer: ThreadViewer) {
  if (viewer.side === "client") return row.senderFirstName || "Team";
  return [row.senderFirstName, row.senderLastName].filter(Boolean).join(" ") || row.senderEmail || "Team member";
}

function toThreadMessage(row: ThreadRow, viewer: ThreadViewer): ThreadMessage {
  const side: MessageSide = row.senderUserId ? "team" : "client";
  const mine = viewer.side === "team" ? row.senderUserId === viewer.userId : side === "client";

  return {
    id: row.id,
    sentAt: row.sentAt,
    content: row.content,
    side,
    mine,
    senderName: side === "team" ? teamName(row, viewer) : viewer.side === "client" ? "You" : row.clientName,
    isRead: row.isRead,
  };
}

function threadWhere(scope: ThreadScope, ...extra: (SQL | undefined)[]) {
  return and(...scopeFilters(scope), eq(projects.organizationId, scope.organizationId), isNull(projects.deletedAt), ...extra);
}

export async function listThread(scope: ThreadScope, viewer: ThreadViewer, before?: string): Promise<ThreadMessage[]> {
  const rows = await selectThreadRows()
    .where(threadWhere(scope, before ? sql`${messages.createdAt} < ${cursorTime(before)}` : undefined))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(MESSAGES_PAGE_SIZE);

  return rows.reverse().map((row) => toThreadMessage(row, viewer));
}

export async function listThreadAfter(scope: ThreadScope, viewer: ThreadViewer, after: string | null): Promise<ThreadMessage[]> {
  if (!after) {
    return listThread(scope, viewer);
  }

  const rows = await selectThreadRows()
    .where(threadWhere(scope, sql`${messages.createdAt} > ${cursorTime(after)} - ${POLL_OVERLAP}`))
    .orderBy(messages.createdAt, messages.id)
    .limit(POLL_LIMIT);

  return rows.map((row) => toThreadMessage(row, viewer));
}

export async function findExistingIds(scope: ThreadScope, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const rows = await db
    .select({ id: messages.id })
    .from(messages)
    .innerJoin(projects, eq(projects.id, messages.projectId))
    .where(threadWhere(scope, inArray(messages.id, ids)));

  return new Set(rows.map((row) => row.id));
}

export async function latestSeenAt(scope: ThreadScope, side: MessageSide): Promise<string | null> {
  const [row] = await db
    .select({ sentAt })
    .from(messages)
    .innerJoin(projects, eq(projects.id, messages.projectId))
    .where(threadWhere(scope, fromSide(side), eq(messages.isRead, true)))
    .orderBy(desc(messages.createdAt))
    .limit(1);

  return row?.sentAt ?? null;
}

export async function markThreadRead(scope: ThreadScope, readerSide: MessageSide): Promise<number> {
  const scopeProject = db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, scope.projectId),
        eq(projects.organizationId, scope.organizationId),
        isNull(projects.deletedAt),
        scope.clientId ? eq(projects.clientId, scope.clientId) : undefined,
      ),
    );

  const updated = await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.organizationId, scope.organizationId),
        eq(messages.projectId, scope.projectId),
        scope.clientId ? eq(messages.clientId, scope.clientId) : undefined,
        inArray(messages.projectId, scopeProject),
        fromSide(otherSide(readerSide)),
        eq(messages.isRead, false),
      ),
    )
    .returning({ id: messages.id });

  return updated.length;
}

type ConversationScope = { organizationId: string; clientId?: string; readerSide: MessageSide };

function conversationSources(scope: ConversationScope) {
  const scopeFilter = and(
    eq(messages.organizationId, scope.organizationId),
    scope.clientId ? eq(messages.clientId, scope.clientId) : undefined,
  );

  const latest = db
    .selectDistinctOn([messages.projectId], {
      projectId: messages.projectId,
      preview: sql<string>`left(${messages.content}, ${PREVIEW_LENGTH})`.as("preview"),
      lastFromTeam: sql<boolean>`${messages.senderUserId} is not null`.as("last_from_team"),
      lastAt: sql<Date>`${messages.createdAt}`.mapWith(messages.createdAt).as("last_at"),
    })
    .from(messages)
    .where(scopeFilter)
    .orderBy(desc(messages.projectId), desc(messages.createdAt), desc(messages.id))
    .as("latest");

  const unread = db
    .select({
      projectId: messages.projectId,
      total: count().as("unread_total"),
    })
    .from(messages)
    .where(and(scopeFilter, fromSide(otherSide(scope.readerSide)), eq(messages.isRead, false)))
    .groupBy(messages.projectId)
    .as("unread");

  return { latest, unread };
}

type ConversationSources = ReturnType<typeof conversationSources>;

function conversationFilters(
  scope: ConversationScope,
  { unread }: ConversationSources,
  query?: Pick<InboxQuery, "q" | "filter">,
) {
  const filters: SQL[] = [eq(projects.organizationId, scope.organizationId), isNull(projects.deletedAt)];

  if (scope.clientId) filters.push(eq(projects.clientId, scope.clientId));
  if (query?.filter === "unread") filters.push(sql`coalesce(${unread.total}, 0) > 0`);
  if (query?.q) {
    const pattern = `%${escapeLike(query.q)}%`;
    filters.push(or(ilike(projects.name, pattern), ilike(clients.name, pattern))!);
  }

  return and(...filters);
}

function selectConversations({ latest, unread }: ConversationSources) {
  return db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      projectStatus: projects.status,
      clientId: clients.id,
      clientName: clients.name,
      preview: latest.preview,
      lastFromTeam: latest.lastFromTeam,
      lastAt: latest.lastAt,
      unread: sql<number>`coalesce(${unread.total}, 0)`.mapWith(Number),
    })
    .from(latest)
    .innerJoin(projects, eq(projects.id, latest.projectId))
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(unread, eq(unread.projectId, latest.projectId))
    .$dynamic();
}

function toConversationRow(row: Awaited<ReturnType<ReturnType<typeof selectConversations>["execute"]>>[number]): ConversationRow {
  return {
    projectId: row.projectId,
    projectName: row.projectName,
    projectStatus: row.projectStatus,
    clientId: row.clientId,
    clientName: row.clientName,
    preview: row.preview,
    lastSide: row.lastFromTeam ? "team" : "client",
    lastAt: row.lastAt,
    unread: row.unread,
  };
}

export async function listConversations(
  organizationId: string,
  query: InboxQuery,
  options: { clientId?: string } = {},
): Promise<ConversationListResult> {
  const scope: ConversationScope = { organizationId, clientId: options.clientId, readerSide: "team" };
  const sources = conversationSources(scope);
  const { latest, unread } = sources;
  const where = conversationFilters(scope, sources, query);

  const [rows, [{ total }]] = await Promise.all([
    selectConversations(sources)
      .where(where)
      .orderBy(desc(latest.lastAt))
      .limit(INBOX_PAGE_SIZE)
      .offset((query.page - 1) * INBOX_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(latest)
      .innerJoin(projects, eq(projects.id, latest.projectId))
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .leftJoin(unread, eq(unread.projectId, latest.projectId))
      .where(where),
  ]);

  return {
    rows: rows.map(toConversationRow),
    total,
    pageCount: Math.max(1, Math.ceil(total / INBOX_PAGE_SIZE)),
  };
}

export async function listPortalConversations(organizationId: string, clientId: string): Promise<ConversationRow[]> {
  const scope: ConversationScope = { organizationId, clientId, readerSide: "client" };
  const sources = conversationSources(scope);

  const rows = await selectConversations(sources)
    .where(conversationFilters(scope, sources))
    .orderBy(desc(sources.latest.lastAt))
    .limit(PORTAL_CONVERSATION_LIMIT);

  return rows.map(toConversationRow);
}

export async function unreadSummary(
  organizationId: string,
  readerSide: MessageSide,
  clientId?: string,
): Promise<UnreadSummary> {
  const visible = and(
    eq(messages.organizationId, organizationId),
    clientId ? eq(messages.clientId, clientId) : undefined,
  );

  const [[unread], [latest]] = await Promise.all([
    db
      .select({ total: count() })
      .from(messages)
      .innerJoin(projects, liveProject(organizationId))
      .where(and(visible, fromSide(otherSide(readerSide)), eq(messages.isRead, false))),
    db
      .select({ sentAt })
      .from(messages)
      .innerJoin(projects, liveProject(organizationId))
      .where(visible)
      .orderBy(desc(messages.createdAt))
      .limit(1),
  ]);

  return { unread: unread?.total ?? 0, latestAt: latest?.sentAt ?? null };
}

export async function unreadByProject(organizationId: string, readerSide: MessageSide, projectId: string, clientId?: string) {
  const [row] = await db
    .select({ total: count() })
    .from(messages)
    .innerJoin(projects, liveProject(organizationId))
    .where(
      and(
        eq(messages.organizationId, organizationId),
        eq(messages.projectId, projectId),
        clientId ? eq(messages.clientId, clientId) : undefined,
        fromSide(otherSide(readerSide)),
        eq(messages.isRead, false),
      ),
    );

  return row?.total ?? 0;
}

export async function listProjectOptions(organizationId: string): Promise<Option[]> {
  const rows = await db
    .select({ value: projects.id, projectName: projects.name, clientName: clients.name })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.organizationId, organizationId), isNull(projects.deletedAt)))
    .orderBy(asc(clients.name), asc(projects.name))
    .limit(500);

  return rows.map((row) => ({ value: row.value, label: `${row.projectName} (${row.clientName})` }));
}

export async function clientCanReadMessages(organizationId: string, clientId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: portalAccounts.id })
    .from(portalAccounts)
    .innerJoin(clients, eq(clients.id, portalAccounts.clientId))
    .where(
      and(
        eq(portalAccounts.organizationId, organizationId),
        eq(portalAccounts.clientId, clientId),
        eq(portalAccounts.status, "ACTIVE"),
        eq(clients.portalEnabled, true),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  return Boolean(row);
}
