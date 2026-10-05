"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/ErrorState";

type ProjectsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ProjectsError({ error, retry }: ProjectsErrorProps) {
  useEffect(() => {
    console.error("[projects] render failed", error.digest ?? error.message);
  }, [error]);

  return <ErrorState description="We couldn't load your projects. Check your connection and try again." onRetry={retry} />;
}
