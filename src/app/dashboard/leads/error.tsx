"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type LeadsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function LeadsError({ error, retry }: LeadsErrorProps) {
  useEffect(() => {
    console.error("[leads] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your leads. Check your connection and try again." onRetry={retry} />;
}
