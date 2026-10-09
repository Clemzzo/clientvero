import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function ThreadNotFound() {
  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-8">
      <EmptyState
        icon={<SearchX />}
        title="This conversation isn't available"
        description="Its project may have been archived or removed, or the link is wrong."
        action={
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/dashboard/messages">Back to messages</Link>
          </Button>
        }
      />
    </div>
  );
}
