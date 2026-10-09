"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type MessagesErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function MessagesError({ error, retry }: MessagesErrorProps) {
  useEffect(() => {
    console.error("[messages] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your messages. Check your connection and try again." onRetry={retry} />;
}
