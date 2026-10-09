import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalMessagesLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading messages…</span>
      <div aria-hidden className="space-y-8">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        </div>
        <Card className="overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex gap-3 border-b border-ink-200 px-4 py-4 last:border-b-0">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-64 max-w-full" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
