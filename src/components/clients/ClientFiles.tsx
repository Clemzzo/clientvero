import Link from "next/link";
import { FolderOpen, SearchX } from "lucide-react";

import { FilesTable } from "@/components/files/FilesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FileListResult } from "@/server/repositories/file.repository";

type ClientFilesProps = {
  clientId: string;
  result: FileListResult;
  page: number;
};

export function ClientFiles({ clientId, result, page }: ClientFilesProps) {
  const tabPath = `/dashboard/clients/${clientId}`;

  if (result.total === 0) {
    return (
      <Card>
        <EmptyState
          icon={<FolderOpen />}
          title="No files yet"
          description="Files uploaded to this client's projects will show up here."
          className="py-14"
        />
      </Card>
    );
  }

  if (result.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<SearchX />}
          title="This page is empty"
          description={`There are only ${result.pageCount} pages of files.`}
          action={
            <Button asChild variant="outline" className="rounded-lg">
              <Link href={`${tabPath}?tab=files`}>Go to the first page</Link>
            </Button>
          }
          className="py-14"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <FilesTable files={result.rows} canEdit={false} showProject />
      <Pagination page={page} pageCount={result.pageCount} pathname={tabPath} searchParams={{ tab: "files" }} />
    </div>
  );
}
