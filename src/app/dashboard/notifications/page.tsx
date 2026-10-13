import type { Metadata } from "next";
import Link from "next/link";
import { BellOff, SearchX } from "lucide-react";

import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { NotificationList } from "@/components/notifications/NotificationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOrganizationContext } from "@/server/auth/organization";
import { listNotifications, notificationSummary } from "@/server/services/notification.service";
import { notificationFilters, notificationListQuerySchema, type NotificationFilter } from "@/validators/notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

const pathname = "/dashboard/notifications";

const filterLabels: Record<NotificationFilter, string> = {
  all: "All",
  unread: "Unread",
};

function filterHref(filter: NotificationFilter) {
  return filter === "all" ? pathname : `${pathname}?filter=${filter}`;
}

export default async function NotificationsPage(props: PageProps<"/dashboard/notifications">) {
  const ctx = await requireOrganizationContext();
  const query = notificationListQuerySchema.parse(await props.searchParams);
  const [result, summary] = await Promise.all([listNotifications(ctx, query), notificationSummary(ctx)]);

  const tabs = notificationFilters.map((filter) => ({
    value: filter,
    label: filterLabels[filter],
    href: filterHref(filter),
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Notifications"
        description="Updates from your clients — accepted proposals, viewed invoices, payments and new messages."
        actions={summary.unread > 0 && <MarkAllReadButton />}
      />

      <div className="mt-8 space-y-5">
        <TabLinks label="Filter notifications" tabs={tabs} active={query.filter} />

        {result.total === 0 ? (
          <Card>
            <EmptyState
              icon={<BellOff />}
              title={query.filter === "unread" ? "You're all caught up" : "No notifications yet"}
              description={
                query.filter === "unread"
                  ? "You've read every notification."
                  : "When a client accepts a proposal, opens an invoice or sends a message, you'll see it here."
              }
              className="py-16"
            />
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There ${result.pageCount === 1 ? "is only 1 page" : `are only ${result.pageCount} pages`} of notifications.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={filterHref(query.filter)}>Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <NotificationList notifications={result.rows} />
            </Card>
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname={pathname}
              searchParams={{ filter: query.filter === "all" ? undefined : query.filter }}
            />
          </>
        )}
      </div>
    </div>
  );
}
