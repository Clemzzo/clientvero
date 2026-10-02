"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type ProposalsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ProposalsError({ error, retry }: ProposalsErrorProps) {
  useEffect(() => {
    console.error("[proposals] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your proposals. Check your connection and try again." onRetry={retry} />;
}
