import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const bubbles = ["w-64 self-start", "w-44 self-start", "w-56 self-end", "w-40 self-end"];

export default function PortalThreadLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading conversation…</span>
      <div aria-hidden className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Card className="flex h-[min(760px,calc(100dvh-200px))] min-h-[480px] flex-col overflow-hidden">
          <div className="space-y-3 border-b border-ink-200 px-6 py-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-2 w-72 rounded-full" />
          </div>
          <div className="flex flex-1 flex-col gap-3 bg-ink-50 px-6 py-6">
            {bubbles.map((bubble) => (
              <Skeleton key={bubble} className={cn("h-10 rounded-[18px]", bubble)} />
            ))}
          </div>
          <div className="border-t border-ink-200 px-4 py-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
