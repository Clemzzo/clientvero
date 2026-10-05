import { Flag, Plus } from "lucide-react";

import { MilestoneDialog } from "@/components/projects/MilestoneDialog";
import { MilestoneItem } from "@/components/projects/MilestoneItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { Milestone } from "@/db/schema";
import { MAX_MILESTONES } from "@/features/projects/milestone-status";

type MilestonesCardProps = {
  projectId: string;
  milestones: Milestone[];
  canEdit: boolean;
};

function AddMilestoneButton({ projectId }: { projectId: string }) {
  return (
    <MilestoneDialog
      projectId={projectId}
      trigger={
        <Button variant="outline" className="h-9 rounded-lg">
          <Plus aria-hidden className="size-4" />
          Add milestone
        </Button>
      }
    />
  );
}

export function MilestonesCard({ projectId, milestones, canEdit }: MilestonesCardProps) {
  const hasMilestones = milestones.length > 0;
  const canAdd = canEdit && milestones.length < MAX_MILESTONES;

  return (
    <Card>
      <CardHeader
        title="Milestones"
        description="Progress is the share of milestones completed."
        action={canAdd && hasMilestones && <AddMilestoneButton projectId={projectId} />}
      />

      {hasMilestones ? (
        <ol className="mt-2 divide-y divide-ink-200 px-5 pb-2 sm:px-6">
          {milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.id}
              projectId={projectId}
              milestone={milestone}
              canEdit={canEdit}
              isFirst={index === 0}
              isLast={index === milestones.length - 1}
            />
          ))}
        </ol>
        
      ) : (
        <EmptyState
          icon={<Flag />}
          title="No milestones yet"
          description="Break the project into steps. Completing them moves the progress bar."
          action={canAdd && <AddMilestoneButton projectId={projectId} />}
        />
      )}
    </Card>
  );
}
