import type { Metadata } from "next";
import Link from "next/link";
import { History, SearchX } from "lucide-react";

import { ClearActivityButton } from "@/components/activity/ClearActivityButton";
import { DeleteActivityButton } from "@/components/activity/DeleteActivityButton";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activityActions } from "@/features/activity/activity-actions";
import { activityFilterLabels, activityFilters, type ActivityFilter } from "@/features/activity/activity-filters";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listWorkspaceActivity } from "@/server/services/activity.service";
import { activityListQuerySchema } from "@/validators/activity";

export const metadata: Metadata = {
  title: "Activity",
};

const pathname = "/dashboard/activity";

function filterHref(filter: ActivityFilter) {
  return filter === "all" ? pathname : `${pathname}?resource=${filter}`;
}

export default async function ActivityPage(props: PageProps<"/dashboard/activity">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = activityListQuerySchema.parse(await props.searchParams);
  const canDelete = hasPermission(membership.role, permissions.activityDelete);
  const result = await listWorkspaceActivity(organization.id, query);
  const filterLabel = activityFilterLabels[query.resource].toLowerCase();

  const tabs = activityFilters.map((filter) => ({
    value: filter,
    label: activityFilterLabels[filter],
    href: filterHref(filter),
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Activity"
        description="Everything that's happened across your workspace."
        actions={canDelete && <ClearActivityButton />}
      />

      <div className="mt-8 space-y-5">
        <TabLinks label="Filter activity by type" tabs={tabs} active={query.resource} />

        {result.total === 0 ? (
          <Card>
            <EmptyState
              icon={<History />}
              title={query.resource === "all" ? "No activity yet" : `No ${filterLabel} activity yet`}
              description="Changes to your leads, clients, proposals and projects will show up here."
              className="py-16"
            />
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of activity.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={filterHref(query.resource)}>Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <Card className="px-5 py-2 sm:px-6">
              <ActivityTimeline
                entries={result.rows}
                renderAction={(entry) =>
                  canDelete &&
                  entry.action !== activityActions.activityCleared && <DeleteActivityButton entryId={entry.id} />
                }
              />
            </Card>
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname={pathname}
              searchParams={{ resource: query.resource === "all" ? undefined : query.resource }}
            />
          </>
        )}
      </div>
    </div>
  );
}
