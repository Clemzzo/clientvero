"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function DashboardError({ error, retry }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState onRetry={retry} />;
}
