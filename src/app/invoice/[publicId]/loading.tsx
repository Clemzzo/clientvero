import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLoading() {
  return (
    <main role="status" aria-live="polite" className="min-h-dvh bg-ink-100 px-4 pt-8 sm:pt-14">
      <span className="sr-only">Loading invoice…</span>
      <div aria-hidden className="mx-auto max-w-190 space-y-6">
        <Skeleton className="h-9 w-72 bg-white" />
        <div className="space-y-8 rounded-lg border border-ink-200 bg-white p-6 sm:p-10">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="ml-auto h-20 w-64" />
        </div>
      </div>
    </main>
  );
}
