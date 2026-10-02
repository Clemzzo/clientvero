import { FileX } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";

export default function ProposalNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink-50 px-4">
      <EmptyState
        icon={<FileX />}
        title="This proposal isn't available"
        description="The link may be wrong, or the proposal was withdrawn. Contact the business that sent it."
      />
    </main>
  );
}
