import type { ReactNode } from "react";
import Link from "next/link";
import { Archive, SearchX } from "lucide-react";

import { ArchivedRecordsTable } from "@/components/shared/ArchivedRecordsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ArchivedListResult, ArchivedRecord } from "@/types/archived-record";
import type { ArchivedListQuery } from "@/validators/fields";

type ArchivedRecordsSectionProps = {
  result: ArchivedListResult;
  query: ArchivedListQuery;
  pathname: string;
  recordLabel: string;
  pluralLabel: string;
  renderActions: (record: ArchivedRecord) => ReactNode;
};

function ResetLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="outline" className="rounded-lg">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function ArchivedRecordsSection({
  result,
  query,
  pathname,
  recordLabel,
  pluralLabel,
  renderActions,
}: ArchivedRecordsSectionProps) {
  if (result.total === 0) {
    return (
      <Card>
        {query.q ? (
          <EmptyState
            icon={<SearchX />}
            title={`No archived ${pluralLabel} match`}
            description={`Try a different search, or clear it to see every archived ${recordLabel.toLowerCase()}.`}
            action={<ResetLink href={pathname}>Clear search</ResetLink>}
            className="py-16"
          />
        ) : (
          <EmptyState
            icon={<Archive />}
            title="Nothing archived"
            description={`${recordLabel}s you archive appear here, where you can restore them or delete them permanently.`}
            className="py-16"
          />
        )}
      </Card>
    );
  }

  if (result.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<SearchX />}
          title="This page is empty"
          description={`There are only ${result.pageCount} pages of archived ${pluralLabel}.`}
          action={<ResetLink href={pathname}>Go to the first page</ResetLink>}
          className="py-16"
        />
      </Card>
    );
  }

  return (
    <>
      <ArchivedRecordsTable recordLabel={recordLabel} records={result.rows} renderActions={renderActions} />
      <Pagination page={query.page} pageCount={result.pageCount} pathname={pathname} searchParams={{ q: query.q }} />
    </>
  );
}
