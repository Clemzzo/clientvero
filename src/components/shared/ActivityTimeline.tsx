import type { ReactNode } from "react";

import { Avatar } from "@/components/shared/Avatar";
import { actorName, describeActivity } from "@/features/activity/describe-activity";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ActivityEntry } from "@/server/services/activity.service";

type ActivityTimelineProps = {
  entries: ActivityEntry[];
  showSubject?: boolean;
  renderAction?: (entry: ActivityEntry) => ReactNode;
};

export function ActivityTimeline({ entries, showSubject = true, renderAction }: ActivityTimelineProps) {
  const now = new Date();

  return (
    <ol>
      {entries.map((entry) => {
        const actor = actorName(entry);
        const { verb, subject, detail } = describeActivity(entry.action, entry.metadata);

        return (
          <li key={entry.id} className="flex items-start gap-3 border-b border-ink-200 py-3.5 last:border-b-0">
            <Avatar name={actor} />
            <p className="min-w-0 flex-1 text-[14px] leading-snug text-ink-500">
              <span className="font-semibold text-ink-900">{actor}</span> {verb}
              {showSubject && subject && <span className="font-semibold text-ink-900"> {subject}</span>}
              {detail && ` ${detail}`}
            </p>
            <time dateTime={entry.createdAt.toISOString()} className="shrink-0 pt-px text-[12.5px] text-ink-500 tabular-nums">
              {formatRelativeTime(entry.createdAt, now)}
            </time>
            {renderAction?.(entry)}
          </li>
        );
      })}
    </ol>
  );
}
