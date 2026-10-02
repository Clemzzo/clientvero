import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { ProposalsTable } from "@/components/proposals/ProposalsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProposalListRow } from "@/server/repositories/proposal.repository";

type ClientProposalsProps = {
  clientId: string;
  proposals: ProposalListRow[];
  canCreate: boolean;
};

export function ClientProposals({ clientId, proposals, canCreate }: ClientProposalsProps) {
  const newProposalHref = `/dashboard/proposals/new?clientId=${clientId}`;

  if (proposals.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<FileText />}
          title="No proposals yet"
          description="Send this client a proposal they can read and accept online."
          action={
            canCreate && (
              <Button asChild className="rounded-lg">
                <Link href={newProposalHref}>
                  <Plus aria-hidden className="size-4" />
                  New proposal
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
            <Link href={newProposalHref}>
              <Plus aria-hidden className="size-4" />
              New proposal
            </Link>
          </Button>
        </div>
      )}
      <ProposalsTable proposals={proposals} showClient={false} />
    </div>
  );
}
