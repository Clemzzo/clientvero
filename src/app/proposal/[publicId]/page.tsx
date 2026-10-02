import { cache } from "react";
import type { Metadata } from "next";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { CircleCheck, CircleX } from "lucide-react";

import { ProposalDocument } from "@/components/proposals/ProposalDocument";
import { ProposalResponseBar } from "@/components/proposals/ProposalResponseBar";
import { isOpenForResponse } from "@/features/proposals/proposal-status";
import { formatMoney } from "@/lib/utils/format";
import { getPublicProposal, markProposalViewed, type PublicProposal } from "@/server/services/public-proposal.service";
import { proposalPublicIdSchema } from "@/validators/proposals";

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" });

const loadProposal = cache(async (publicId: string) => {
  const parsed = proposalPublicIdSchema.safeParse(publicId);
  const proposal = parsed.success ? await getPublicProposal(parsed.data) : null;

  if (!proposal) {
    notFound();
  }

  return proposal;
});

export async function generateMetadata(props: PageProps<"/proposal/[publicId]">): Promise<Metadata> {
  const proposal = await loadProposal((await props.params).publicId);

  return {
    title: `${proposal.title} · ${proposal.organizationName}`,
    robots: { index: false, follow: false },
  };
}

function ResponseBanner({ proposal }: { proposal: PublicProposal }) {
  if (proposal.status === "ACCEPTED" && proposal.acceptedAt) {
    const by = proposal.signerName ? ` by ${proposal.signerName}` : "";

    return (
      <p role="status" className="flex items-center gap-2.5 text-[14px] font-medium text-mint-800">
        <CircleCheck aria-hidden className="size-5 shrink-0 text-mint-600" />
        Accepted{by} on {dateFormat.format(proposal.acceptedAt)}. This proposal is closed.
      </p>
    );
  }

  if (proposal.status === "DECLINED" && proposal.declinedAt) {
    return (
      <p role="status" className="flex items-center gap-2.5 text-[14px] font-medium text-ink-700">
        <CircleX aria-hidden className="size-5 shrink-0 text-ink-500" />
        Declined on {dateFormat.format(proposal.declinedAt)}. This proposal is closed.
      </p>
    );
  }

  return null;
}

export default async function PublicProposalPage(props: PageProps<"/proposal/[publicId]">) {
  const proposal = await loadProposal((await props.params).publicId);
  const open = isOpenForResponse(proposal.status);

  if (proposal.status === "SENT") {
    after(() => markProposalViewed(proposal.publicId));
  }

  return (
    <main className="min-h-dvh bg-ink-50 px-4 pb-40 pt-8 sm:pb-32 sm:pt-14 print:bg-white print:p-0">
      <div className="mx-auto max-w-190">
        <ProposalDocument proposal={proposal} banner={open ? undefined : <ResponseBanner proposal={proposal} />} />
        <p className="mt-6 text-center text-[12.5px] text-ink-500 print:hidden">Sent with ClientVero</p>
      </div>

      {open && (
        <ProposalResponseBar
          publicId={proposal.publicId}
          organizationName={proposal.organizationName}
          totalLabel={formatMoney(proposal.total, proposal.currency)}
        />
      )}
    </main>
  );
}
