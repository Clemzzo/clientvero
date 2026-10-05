import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading your portal…</span>
      <div aria-hidden className="space-y-8">
        <div>
          <Skeleton className="h-9 w-56 max-w-full" />
          <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="flex items-start gap-4 p-5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-6">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-6 h-2 w-full rounded-full" />
              <Skeleton className="mt-6 h-10 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
