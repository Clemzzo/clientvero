import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, SearchX } from "lucide-react";

import { FilesTable } from "@/components/files/FilesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listWorkspaceFiles } from "@/server/repositories/file.repository";
import { fileListQuerySchema } from "@/validators/files";

export const metadata: Metadata = {
  title: "Files",
};

export default async function FilesPage(props: PageProps<"/dashboard/files">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = fileListQuerySchema.parse(await props.searchParams);
  const canEdit = hasPermission(membership.role, permissions.projectsUpdate);
  const result = await listWorkspaceFiles(organization.id, query);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Files"
        description="Every file across your projects. Upload new files from a project's Files tab."
      />

      <div className="mt-8 space-y-5">
        <SearchForm
          action="/dashboard/files"
          label="Search files"
          placeholder="Search file, project or client"
          defaultValue={query.q}
        />

        {result.total === 0 ? (
          <Card>
            {query.q ? (
              <EmptyState
                icon={<SearchX />}
                title="No files match"
                description="Try a different search."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/files">Show all files</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<FolderOpen />}
                title="No files yet"
                description="Open a project and use its Files tab to upload deliverables and documents."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/projects">Go to projects</Link>
                  </Button>
                }
                className="py-16"
              />
            )}
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of files.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={query.q ? `/dashboard/files?q=${encodeURIComponent(query.q)}` : "/dashboard/files"}>
                    Go to the first page
                  </Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <FilesTable files={result.rows} canEdit={canEdit} showProject />
            <Pagination page={query.page} pageCount={result.pageCount} pathname="/dashboard/files" searchParams={{ q: query.q }} />
          </>
        )}
      </div>
    </div>
  );
}
