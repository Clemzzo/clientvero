"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type ActivityErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ActivityError({ error, retry }: ActivityErrorProps) {
  useEffect(() => {
    console.error("[activity] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your activity. Check your connection and try again." onRetry={retry} />;
}
