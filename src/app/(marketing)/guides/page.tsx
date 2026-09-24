import type { Metadata } from "next";

import { FinalCta } from "@/components/marketing/final-cta";
import { GuidesHero } from "@/components/marketing/resources/guides/GuidesHero";
import { GuidesLibrary } from "@/components/marketing/resources/guides/GuidesLibrary";
import { GuidesLoop } from "@/components/marketing/resources/guides/GuidesLoop";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Short, practical playbooks for running a client business: qualify leads, write proposals clients accept, plan projects in milestones, set up a client portal, and get paid.",
};

export default function GuidesPage() {
  return (
    <>
      <GuidesHero />
      <GuidesLibrary />
      <GuidesLoop />
      <FinalCta title="Turn the playbooks into your workflow." />
    </>
  );
}
