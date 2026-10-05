import Link from "next/link";
import { Activity, ArrowUpRight, History } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader } from "@/components/ui/card";
import type { ActivityEntry } from "@/server/services/activity.service";

type RecentActivityCardProps = {
  entries: ActivityEntry[];
};

export function RecentActivityCard({ entries }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader
        title="Recent activity"
        description="The latest changes across your workspace"
        icon={{ node: <Activity />, tone: "grape" }}
        action={
          entries.length > 0 && (
            <Link
              href="/dashboard/activity"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline"
            >
              Show all
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          )
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<History />}
          title="Nothing here yet"
          description="Leads you add and update, and every step after, will show up here."
        />
      ) : (
        <div className="mt-3 px-5 pb-3 sm:px-6">
          <ActivityTimeline entries={entries} />
        </div>
      )}
    </Card>
  );
}
