import { Activity } from "lucide-react";

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
      <CardHeader title="Recent activity" description="The latest changes across your workspace" />

      {entries.length === 0 ? (
        <EmptyState
          icon={<Activity />}
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
