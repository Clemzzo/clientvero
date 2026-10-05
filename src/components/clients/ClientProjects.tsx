import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProjectListRow } from "@/server/repositories/project.repository";

type ClientProjectsProps = {
  clientId: string;
  projects: ProjectListRow[];
  canCreate: boolean;
};

export function ClientProjects({ clientId, projects, canCreate }: ClientProjectsProps) {
  const newProjectHref = `/dashboard/projects/new?clientId=${clientId}`;

  if (projects.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<FolderKanban />}
          title="No projects yet"
          description="Start a project for this client, or create one from an accepted proposal."
          action={
            canCreate && (
              <Button asChild className="rounded-lg">
                <Link href={newProjectHref}>
                  <Plus aria-hidden className="size-4" />
                  New project
                </Link>
              </Button>
            )
          }
          className="py-14"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button asChild variant="outline" className="h-9 rounded-lg">
            <Link href={newProjectHref}>
              <Plus aria-hidden className="size-4" />
              New project
            </Link>
          </Button>
        </div>
      )}
      <ProjectsTable projects={projects} canDelete={false} showClient={false} />
    </div>
  );
}
