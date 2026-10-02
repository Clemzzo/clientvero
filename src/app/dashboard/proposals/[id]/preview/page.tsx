import type { Metadata } from "next";

import { ProposalDocument } from "@/components/proposals/ProposalDocument";
import { BackLink } from "@/components/shared/BackLink";

import { loadProposal } from "../load-proposal";

export async function generateMetadata(props: PageProps<"/dashboard/proposals/[id]/preview">): Promise<Metadata> {
  const { proposal } = await loadProposal((await props.params).id);
  return { title: `Preview · ${proposal.title}` };
}

export default async function ProposalPreviewPage(props: PageProps<"/dashboard/proposals/[id]/preview">) {
  const { ctx, proposal } = await loadProposal((await props.params).id);

  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto flex max-w-190 items-center justify-between gap-4">
        <BackLink href={`/dashboard/proposals/${proposal.id}`}>Back to proposal</BackLink>
        <p className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-500">
          Client view preview
        </p>
      </div>
      <div className="mx-auto mt-6 max-w-190">
        <ProposalDocument proposal={{ ...proposal, organizationName: ctx.organization.name }} />
      </div>
    </div>
  );
}
