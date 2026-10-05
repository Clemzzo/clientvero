import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-8">
      <EmptyState
        icon={<SearchX />}
        title="This project doesn't exist"
        description="It may have been archived or removed, or the link is wrong."
        action={
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/dashboard/projects">Back to projects</Link>
          </Button>
        }
      />
    </div>
  );
}
