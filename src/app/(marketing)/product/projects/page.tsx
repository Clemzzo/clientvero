import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/FinalCta";
import { ProductHero } from "@/components/marketing/product/ProductHero";
import { ProjectFromProposal } from "@/components/marketing/product/projects/ProjectFromProposal";
import { ProjectMilestones } from "@/components/marketing/product/projects/ProjectMilestones";
import { ProjectOverviewPreview } from "@/components/marketing/product/projects/ProjectOverviewPreview";
import { ProjectStatusBoard } from "@/components/marketing/product/projects/ProjectStatusBoard";
import { ProjectWorkspace } from "@/components/marketing/product/projects/ProjectWorkspace";
import { plans } from "@/features/subscriptions/plans";

function freeProjectsLine() {
  const projects = plans.find((plan) => plan.id === "free")?.limits.activeProjects;

  return projects
    ? `Run up to ${projects} active projects on the Free plan, with a client portal included. No credit card required.`
    : "Run your projects free, with a client portal included. No credit card required.";
}

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Turn accepted proposals into projects, plan the work as milestones, and track progress your clients can follow in their portal.",
};

export default function ProjectsProductPage() {
  return (
    <>
      <ProductHero
        eyebrow="Projects"
        title="Deliver projects your clients can follow."
        intro="Turn an accepted proposal into a project, plan the work as milestones, and keep files and messages next to it. Progress updates as you go, for you and your client."
        preview={<ProjectOverviewPreview />}
      />
      <ProjectFromProposal />
      <ProjectMilestones />
      <ProjectStatusBoard />
      <ProjectWorkspace />
      <FinalCta title="Plan your next project in minutes." description={freeProjectsLine()} />
    </>
  );
}
