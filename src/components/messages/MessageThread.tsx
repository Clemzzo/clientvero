"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, LoaderCircle, MessagesSquare } from "lucide-react";

import { MessageBubble, type BubblePosition, type BubbleStatus } from "@/components/messages/MessageBubble";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { Avatar } from "@/components/shared/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { dayLabel, groupMessages, latestSeenId } from "@/features/messages/group-messages";
import { markSeen, mergeMessages } from "@/features/messages/merge-messages";
import {
  MESSAGES_PAGE_SIZE,
  THREAD_POLL_MS,
  sentAtDate,
  type MessageSide,
  type ThreadMessage,
} from "@/features/messages/thread-message";
import { useHydrated } from "@/features/messages/use-hydrated";
import { usePolling } from "@/features/messages/use-polling";
import { cn } from "@/lib/utils";
import type { PollFailure, ThreadPoll } from "@/server/services/message.service";

type MessagesResult = { error: string } | { messages: ThreadMessage[] };

export type ThreadActions = {
  send: (input: { id: string; projectId: string; content: string; after: string | null }) => Promise<MessagesResult>;
  remove: (id: string) => Promise<{ error?: string }>;
  loadEarlier: (input: { projectId: string; before: string }) => Promise<MessagesResult>;
  poll: (input: { projectId: string; after: string | null; knownIds: string[] }) => Promise<PollFailure | ThreadPoll | null>;
};

type MessageThreadProps = {
  projectId: string;
  viewerSide: MessageSide;
  selfName: string;
  recipientName: string;
  teamLabel?: string;
  initialMessages: ThreadMessage[];
  actions: ThreadActions;
  emptyTitle: string;
  emptyDescription: string;
};

type PendingMessage = { id: string; sentAt: string; content: string; status: Exclude<BubbleStatus, "sent">; error?: string };

type DisplayMessage = ThreadMessage & { status: BubbleStatus; error?: string; entrance: "none" | "send" | "arrive" };

const NEAR_BOTTOM_PX = 120;
const MAX_POLL_BACKOFF_MS = 60_000;
const networkError = "Check your connection and try again.";
const placeholderBubbles = ["w-64 self-start", "w-44 self-start", "w-56 self-end", "w-40 self-end"];
const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const fullTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

function pendingSentAt() {
  return new Date().toISOString().replace("Z", "000Z");
}

function positionOf(index: number, length: number): BubblePosition {
  if (length === 1) return "single";
  if (index === 0) return "first";
  return index === length - 1 ? "last" : "middle";
}

export function MessageThread({
  projectId,
  viewerSide,
  selfName,
  recipientName,
  teamLabel,
  initialMessages,
  actions,
  emptyTitle,
  emptyDescription,
}: MessageThreadProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion() ?? false;
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [sentIds, setSentIds] = useState<ReadonlySet<string>>(() => new Set());
  const [arrivedIds, setArrivedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [hasEarlier, setHasEarlier] = useState(initialMessages.length >= MESSAGES_PAGE_SIZE);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showNewPill, setShowNewPill] = useState(false);
  const [deleting, setDeleting] = useState<ThreadMessage | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const scrollIntent = useRef<"bottom" | "follow" | { keepFrom: number } | null>("bottom");
  const messagesRef = useRef(messages);
  const pollFailures = useRef(0);
  const nextPollAt = useRef(0);

  useLayoutEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const display = useMemo<DisplayMessage[]>(() => {
    const savedIds = new Set(messages.map((message) => message.id));
    const confirmed: DisplayMessage[] = messages.map((message) => ({
      ...message,
      status: "sent",
      entrance: sentIds.has(message.id) ? "send" : arrivedIds.has(message.id) ? "arrive" : "none",
    }));
    const outgoing: DisplayMessage[] = pending
      .filter((item) => !savedIds.has(item.id))
      .map((item) => ({
        id: item.id,
        sentAt: item.sentAt,
        content: item.content,
        side: viewerSide,
        mine: true,
        senderName: selfName,
        isRead: false,
        status: item.status,
        error: item.error,
        entrance: "send",
      }));
    return [...confirmed, ...outgoing];
  }, [messages, pending, sentIds, arrivedIds, viewerSide, selfName]);

  const sections = useMemo(() => groupMessages(display), [display]);
  const seenId = useMemo(() => latestSeenId(messages, viewerSide), [messages, viewerSide]);

  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const element = scrollRef.current;
      if (!element) return;
      element.scrollTo({ top: element.scrollHeight, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
      setShowNewPill(false);
    },
    [reducedMotion],
  );

  useLayoutEffect(() => {
    const element = scrollRef.current;
    const intent = scrollIntent.current;
    if (!hydrated || !element || !intent) return;
    scrollIntent.current = null;

    if (intent === "bottom") {
      scrollToBottom(false);
    } else if (intent === "follow") {
      if (nearBottom.current) scrollToBottom(true);
      else setShowNewPill(true);
    } else {
      element.scrollTop = element.scrollHeight - intent.keepFrom;
    }
  }, [display, hydrated, scrollToBottom]);

  function onScroll() {
    const element = scrollRef.current;
    if (!element) return;
    nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
    if (nearBottom.current) setShowNewPill(false);
  }

  function backOff() {
    pollFailures.current += 1;
    nextPollAt.current = Date.now() + Math.min(THREAD_POLL_MS * 2 ** pollFailures.current, MAX_POLL_BACKOFF_MS);
  }

  usePolling(
    async () => {
      if (Date.now() < nextPollAt.current) return;

      const current = messagesRef.current;
      const result = await actions
        .poll({
          projectId,
          after: current.at(-1)?.sentAt ?? null,
          knownIds: current.slice(-MESSAGES_PAGE_SIZE).map((message) => message.id),
        })
        .catch((): PollFailure => ({ error: networkError, retryable: true }));

      if (!result) return;
      if ("error" in result) {
        if (result.retryable) backOff();
        else setUnavailable(result.error);
        return;
      }

      pollFailures.current = 0;
      nextPollAt.current = 0;

      const knownIds = new Set(messagesRef.current.map((message) => message.id));
      const fresh = result.messages.filter((message) => !knownIds.has(message.id) && !sentIds.has(message.id));
      const savedIds = new Set(result.messages.map((message) => message.id));

      if (fresh.length > 0) {
        setArrivedIds((ids) => new Set([...ids, ...fresh.map((message) => message.id)]));
        scrollIntent.current = "follow";
      }

      setPending((items) => (items.some((item) => savedIds.has(item.id)) ? items.filter((item) => !savedIds.has(item.id)) : items));
      setMessages((existing) =>
        markSeen(mergeMessages(existing, result.messages, result.deletedIds), viewerSide, result.seenUpTo),
      );

      if (result.markedRead > 0) router.refresh();
    },
    THREAD_POLL_MS,
    unavailable === null,
  );

  async function deliver(id: string, content: string) {
    setPending((items) => items.map((item) => (item.id === id ? { ...item, status: "sending", error: undefined } : item)));

    const known = new Set(messagesRef.current.map((message) => message.id));
    const result = await actions
      .send({ id, projectId, content, after: messagesRef.current.at(-1)?.sentAt ?? null })
      .catch(() => ({ error: networkError }));

    if ("error" in result) {
      setPending((items) => items.map((item) => (item.id === id ? { ...item, status: "failed", error: result.error } : item)));
      setNotice(`Your message wasn't sent. ${result.error}`);
      return;
    }

    const others = result.messages.filter((message) => message.id !== id && !known.has(message.id));

    if (others.length > 0) {
      setArrivedIds((ids) => new Set([...ids, ...others.map((message) => message.id)]));
      scrollIntent.current = "bottom";
    }
    setMessages((existing) => mergeMessages(existing, result.messages));
    setPending((items) => items.filter((item) => item.id !== id));
  }

  function send(content: string) {
    const id = crypto.randomUUID();
    setSentIds((ids) => new Set([...ids, id]));
    setPending((items) => [...items, { id, sentAt: pendingSentAt(), content, status: "sending" }]);
    setNotice("Sending");
    scrollIntent.current = "bottom";
    void deliver(id, content);
  }

  function retry(id: string) {
    const item = pending.find((entry) => entry.id === id);
    if (item) void deliver(id, item.content);
  }

  async function loadEarlier() {
    const first = messages[0];
    const element = scrollRef.current;
    if (!first || !element) return;

    setLoadingEarlier(true);
    const result = await actions.loadEarlier({ projectId, before: first.sentAt }).catch(() => ({ error: networkError }));
    setLoadingEarlier(false);

    if ("error" in result) {
      setNotice(result.error);
      return;
    }

    scrollIntent.current = { keepFrom: element.scrollHeight - element.scrollTop };
    setHasEarlier(result.messages.length >= MESSAGES_PAGE_SIZE);
    setMessages((existing) => mergeMessages(existing, result.messages));
  }

  function confirmDelete() {
    const target = deleting;
    if (!target) return;

    startDelete(async () => {
      const result = await actions.remove(target.id).catch(() => ({ error: networkError }));
      setDeleting(null);

      if (result.error) {
        setNotice(result.error);
        return;
      }

      setMessages((existing) => existing.filter((message) => message.id !== target.id));
      setNotice("Message deleted");
    });
  }

  const isEmpty = display.length === 0;

  return (
    <section aria-label={`Conversation with ${recipientName}`} className="relative flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label="Messages"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6"
      >
        {hydrated && hasEarlier && (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={loadEarlier}
              disabled={loadingEarlier}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60"
            >
              {loadingEarlier && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
              {loadingEarlier ? "Loading…" : "Show earlier messages"}
            </button>
          </div>
        )}

        {!hydrated ? (
          <div aria-hidden className="flex flex-col gap-3 pt-6">
            {placeholderBubbles.map((bubble) => (
              <Skeleton key={bubble} className={cn("h-10 rounded-[18px]", bubble)} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <MessagesSquare aria-hidden className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">{emptyTitle}</h3>
            <p className="mt-1.5 max-w-[40ch] text-[14px] leading-normal text-ink-500">{emptyDescription}</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.key} className="pt-5">
              <div className="flex items-center gap-3 py-2" role="separator" aria-label={dayLabel(section.date)}>
                <span className="h-px flex-1 bg-ink-200" />
                <span className="text-[12.5px] font-medium text-ink-500">{dayLabel(section.date)}</span>
                <span className="h-px flex-1 bg-ink-200" />
              </div>

              {section.groups.map((group) => {
                const outgoing = group.side === viewerSide;
                const last = group.messages.at(-1)!;
                const showName = !outgoing || !last.mine;
                const label = group.side === "team" && teamLabel ? `${group.senderName}, ${teamLabel}` : group.senderName;

                return (
                  <article key={group.key} className={cn("mt-3 flex gap-2.5", outgoing ? "justify-end" : "justify-start")}>
                    {!outgoing && <Avatar name={group.senderName} className="mt-6 size-7 text-[11px]" />}
                    <div className={cn("flex min-w-0 flex-1 flex-col", outgoing ? "items-end" : "items-start")}>
                      <h4 className={cn("mb-1 px-1 text-[12.5px] font-semibold text-ink-700", !showName && "sr-only")}>
                        {outgoing && last.mine ? "You" : label}
                      </h4>
                      <div className={cn("flex w-full flex-col gap-0.5", outgoing ? "items-end" : "items-start")}>
                        <AnimatePresence initial={false}>
                          {group.messages.map((message, index) => (
                            <MessageBubble
                              key={message.id}
                              content={message.content}
                              outgoing={outgoing}
                              status={message.status}
                              position={positionOf(index, group.messages.length)}
                              entrance={message.entrance}
                              error={message.error}
                              onDelete={message.mine ? () => setDeleting(message) : undefined}
                              onRetry={message.status === "failed" ? () => retry(message.id) : undefined}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                      {last.status === "sent" && (
                        <p className="mt-1 px-1 text-[12px] text-ink-500">
                          <time dateTime={sentAtDate(last.sentAt).toISOString()} title={fullTimeFormat.format(sentAtDate(last.sentAt))}>
                            {timeFormat.format(sentAtDate(last.sentAt))}
                          </time>
                          {outgoing && group.messages.some((message) => message.id === seenId) && (
                            <span className="ml-1.5 font-medium text-ink-700">Seen</span>
                          )}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ))
        )}
      </div>

      {showNewPill && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-26 left-1/2 inline-flex h-10 -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink-900 px-4 text-[13px] font-semibold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <ArrowDown aria-hidden className="size-3.5" />
          New messages
        </button>
      )}

      <p role="status" className="sr-only">
        {notice}
      </p>

      {unavailable ? (
        <p role="alert" className="border-t border-ink-200 bg-ink-50 px-4 py-4 text-center text-[14px] text-ink-700">
          {unavailable}
        </p>
      ) : (
        <MessageComposer recipientName={recipientName} onSend={send} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this message?"
        description="It will be removed for everyone in this conversation. This can't be undone."
        confirmLabel="Delete message"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={isDeleting}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
