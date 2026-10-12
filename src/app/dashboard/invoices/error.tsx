"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type InvoicesErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function InvoicesError({ error, retry }: InvoicesErrorProps) {
  useEffect(() => {
    console.error("[invoices] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your invoices. Check your connection and try again." onRetry={retry} />;
}
