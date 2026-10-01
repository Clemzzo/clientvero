import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function LeadNotFound() {
  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-8">
      <EmptyState
        icon={<SearchX />}
        title="This lead doesn't exist"
        description="It may have been removed, or the link is wrong."
        action={
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/dashboard/leads">Back to leads</Link>
          </Button>
        }
      />
    </div>
  );
}
