"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type SettingsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function SettingsError({ error, retry }: SettingsErrorProps) {
  useEffect(() => {
    console.error("[settings] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your settings. Check your connection and try again." onRetry={retry} />;
}
