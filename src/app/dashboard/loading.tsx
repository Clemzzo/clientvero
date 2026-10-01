import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <span className="sr-only">Loading your dashboard…</span>

      <div aria-hidden>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="mt-3 h-5 w-80 max-w-full" />
          </div>
          <Skeleton className="hidden h-11 w-32 rounded-lg sm:block" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-16" />
              <Skeleton className="mt-3 h-3.5 w-28" />
            </Card>
          ))}
        </div>

        {[0, 1].map((row) => (
          <div key={row} className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-6 h-40 w-full rounded-xl" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-6 h-40 w-full rounded-xl" />
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
