"use client";

import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this page. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-red-50 text-destructive">
        <TriangleAlert aria-hidden className="size-5" />
      </span>
      <h2 className="mt-5 font-display text-[20px] font-bold tracking-[-0.02em] text-ink-900">{title}</h2>
      <p className="mt-2 text-[14px] leading-normal text-ink-500">{description}</p>
      <Button variant="outline" className="mt-6 rounded-lg" onClick={onRetry}>
        <RotateCw aria-hidden className="size-4" />
        Try again
      </Button>
    </div>
  );
}
