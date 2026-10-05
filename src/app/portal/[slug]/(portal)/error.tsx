"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type PortalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function PortalError({ error, retry }: PortalErrorProps) {
  useEffect(() => {
    console.error("[portal] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your portal. Check your connection and try again." onRetry={retry} />;
}
