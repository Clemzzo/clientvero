"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type FilesErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function FilesError({ error, retry }: FilesErrorProps) {
  useEffect(() => {
    console.error("[files] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your files. Check your connection and try again." onRetry={retry} />;
}
