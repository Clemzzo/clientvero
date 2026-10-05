import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ height }: { height: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className={`mt-6 w-full rounded-xl ${height}`} />
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <span className="sr-only">Loading your dashboard…</span>

      <div aria-hidden className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
              <Skeleton className="mt-3 h-3.5 w-28" />
            </Card>
          ))}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <CardSkeleton height="h-40" />
            <CardSkeleton height="h-56" />
          </div>
          <div className="space-y-4">
            <CardSkeleton height="h-36" />
            <CardSkeleton height="h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
