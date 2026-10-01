import { Skeleton } from "@/components/ui/skeleton";

export function FormPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <span className="sr-only">{label}</span>
      <div aria-hidden>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-5 h-8 w-48" />
        <div className="mt-8 space-y-6 rounded-2xl border border-ink-200 bg-white p-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
