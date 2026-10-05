import type { Metadata } from "next";

import { PortalProjectGrid } from "@/components/portal/PortalProjectGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { requirePortalContext } from "@/server/auth/portal-session";
import { listPortalProjects } from "@/server/repositories/portal.repository";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function PortalProjectsPage(props: PageProps<"/portal/[slug]/projects">) {
  const context = await requirePortalContext((await props.params).slug);
  const projects = await listPortalProjects(context);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description={`Everything ${context.organization.name} is working on for you, with progress and next steps.`}
      />
      <PortalProjectGrid slug={context.organization.slug} organizationName={context.organization.name} projects={projects} />
    </div>
  );
}
