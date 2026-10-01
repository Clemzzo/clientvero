import { Skeleton } from "@/components/ui/skeleton";

export default function AppHomeLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12">
      <span className="sr-only">Loading…</span>

      <div aria-hidden className="rounded-2xl border border-ink-200 bg-white p-8 sm:p-10">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-8 h-9 w-3/4" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-8 h-36 w-full rounded-xl" />
        <Skeleton className="mt-8 h-11 w-full" />
      </div>
    </div>
  );
}
