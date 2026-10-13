"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type PaymentsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function PaymentsError({ error, retry }: PaymentsErrorProps) {
  useEffect(() => {
    console.error("[payments] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your payments. Check your connection and try again." onRetry={retry} />;
}
