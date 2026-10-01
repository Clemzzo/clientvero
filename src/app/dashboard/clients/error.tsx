"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type ClientsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ClientsError({ error, retry }: ClientsErrorProps) {
  useEffect(() => {
    console.error("[clients] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your clients. Check your connection and try again." onRetry={retry} />;
}
