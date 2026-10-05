import { FolderKanban } from "lucide-react";

import { PortalProjectCard } from "@/components/portal/PortalProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import type { PortalProjectSummary } from "@/server/repositories/portal.repository";

type PortalProjectGridProps = {
  slug: string;
  organizationName: string;
  projects: PortalProjectSummary[];
};

export function PortalProjectGrid({ slug, organizationName, projects }: PortalProjectGridProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<FolderKanban />}
          title="No projects yet"
          description={`${organizationName} will share your projects here as soon as work begins.`}
          className="py-16"
        />
      </Card>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id}>
          <PortalProjectCard slug={slug} project={project} />
        </li>
      ))}
    </ul>
  );
}
