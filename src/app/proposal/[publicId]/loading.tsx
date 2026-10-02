import { Skeleton } from "@/components/ui/skeleton";

export default function ProposalLoading() {
  return (
    <main role="status" aria-live="polite" className="min-h-dvh bg-ink-50 px-4 pt-8 sm:pt-14">
      <span className="sr-only">Loading proposal…</span>
      <div aria-hidden className="mx-auto max-w-190 overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="space-y-4 border-b border-ink-200 bg-ink-50/60 px-6 py-8 sm:px-12">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-8 h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="space-y-6 px-6 py-10 sm:px-12">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
