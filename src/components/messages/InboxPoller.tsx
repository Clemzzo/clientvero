"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { INBOX_POLL_MS } from "@/features/messages/thread-message";
import { usePolling } from "@/features/messages/use-polling";
import type { UnreadSummary } from "@/server/repositories/message.repository";

type InboxPollerProps = {
  initial: UnreadSummary;
  poll: () => Promise<UnreadSummary | null>;
};

export function InboxPoller({ initial, poll }: InboxPollerProps) {
  const router = useRouter();
  const last = useRef(initial);

  useEffect(() => {
    last.current = initial;
  }, [initial]);

  usePolling(async () => {
    const summary = await poll();
    if (!summary) return;

    if (summary.unread !== last.current.unread || summary.latestAt !== last.current.latestAt) {
      last.current = summary;
      router.refresh();
    }
  }, INBOX_POLL_MS);

  return null;
}
