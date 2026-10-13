"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type NotificationsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function NotificationsError({ error, retry }: NotificationsErrorProps) {
  useEffect(() => {
    console.error("[notifications] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your notifications. Check your connection and try again." onRetry={retry} />;
}
