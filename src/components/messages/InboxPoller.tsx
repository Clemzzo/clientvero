"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { INBOX_POLL_MS } from "@/features/messages/thread-message";
import { usePolling } from "@/features/messages/use-polling";

type InboxPollerProps<Summary> = {
  initial: Summary;
  poll: () => Promise<Summary | null>;
};

export function InboxPoller<Summary>({ initial, poll }: InboxPollerProps<Summary>) {
  const router = useRouter();
  const last = useRef(JSON.stringify(initial));

  useEffect(() => {
    last.current = JSON.stringify(initial);
  }, [initial]);

  usePolling(async () => {
    const summary = await poll();
    if (!summary) return;

    const next = JSON.stringify(summary);
    if (next !== last.current) {
      last.current = next;
      router.refresh();
    }
  }, INBOX_POLL_MS);

  return null;
}
