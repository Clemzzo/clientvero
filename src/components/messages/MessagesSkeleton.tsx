import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex-col border-ink-200 bg-white", className)}>
      <div className="space-y-4 border-b border-ink-200 px-4 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-28" />
      </div>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex gap-3 border-b border-ink-200 px-4 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-48 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

const bubbles = [
  { side: "left", width: "w-64" },
  { side: "left", width: "w-44" },
  { side: "right", width: "w-56" },
  { side: "left", width: "w-72" },
  { side: "right", width: "w-40" },
] as const;

function ThreadSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-ink-50">
      <div className="space-y-3 border-b border-ink-200 bg-white px-6 py-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-2 w-72 rounded-full" />
      </div>
      <div className="flex-1 space-y-3 px-6 py-6">
        {bubbles.map((bubble, index) => (
          <div key={index} className={cn("flex", bubble.side === "right" ? "justify-end" : "justify-start")}>
            <Skeleton className={cn("h-10 rounded-[18px]", bubble.width)} />
          </div>
        ))}
      </div>
      <div className="border-t border-ink-200 bg-white px-4 py-3">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function MessagesSkeleton({ withThread = false }: { withThread?: boolean }) {
  return (
    <div role="status" aria-live="polite" className="flex h-[calc(100dvh-101px)] lg:h-[calc(100dvh-64px)]">
      <span className="sr-only">Loading messages…</span>
      <div aria-hidden className="flex flex-1">
        <ListSkeleton className={cn("w-full lg:flex-90 lg:border-r", withThread ? "hidden" : "flex")} />
        {withThread ? <ThreadSkeleton /> : <div className="hidden flex-1 lg:block" />}
      </div>
    </div>
  );
}
