import Link from "next/link";
import { Inbox, SearchX } from "lucide-react";

import { ConversationList } from "@/components/messages/ConversationList";
import { NewMessageDialog } from "@/components/messages/NewMessageDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { TabLinks } from "@/components/shared/TabLinks";
import { cn } from "@/lib/utils";
import type { ConversationListResult } from "@/server/repositories/message.repository";
import type { Option } from "@/types/option";
import type { InboxFilter, InboxQuery } from "@/validators/messages";

type InboxPaneProps = {
  result: ConversationListResult;
  query: InboxQuery;
  projects: Option[];
  activeProjectId?: string;
  className?: string;
};

function querySuffix(query: Partial<InboxQuery>) {
  const params = new URLSearchParams();
  if (query.filter && query.filter !== "all") params.set("filter", query.filter);
  if (query.q) params.set("q", query.q);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

const filterLabels: Record<InboxFilter, string> = { all: "All", unread: "Unread" };

export function InboxPane({ result, query, projects, activeProjectId, className }: InboxPaneProps) {
  const filtered = Boolean(query.q) || query.filter !== "all";
  const tabs = (Object.keys(filterLabels) as InboxFilter[]).map((filter) => ({
    value: filter,
    label: filterLabels[filter],
    href: `/dashboard/messages${querySuffix({ filter, q: query.q })}`,
  }));

  return (
    <section aria-label="Conversations" className={cn("flex min-h-0 flex-col bg-white", className)}>
      <div className="space-y-4 px-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[24px] font-extrabold leading-none tracking-[-0.03em] text-ink-900">Messages</h1>
          <NewMessageDialog projects={projects} />
        </div>
        <SearchForm
          action="/dashboard/messages"
          label="Search conversations"
          placeholder="Search client or project"
          defaultValue={query.q}
          hiddenFields={{ filter: query.filter === "all" ? undefined : query.filter }}
        />
        <TabLinks label="Filter conversations" tabs={tabs} active={query.filter} className="sm:-mx-4 sm:px-4" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {result.total === 0 ? (
          filtered ? (
            <EmptyState
              icon={<SearchX />}
              title={query.filter === "unread" && !query.q ? "You're all caught up" : "No conversations match"}
              description={
                query.filter === "unread" && !query.q ? "Every message from your clients has been read." : "Try a different search."
              }
              action={
                <Link href="/dashboard/messages" className="inline-flex min-h-10 items-center text-[14px] font-semibold text-brand-700 hover:underline">
                  Show all conversations
                </Link>
              }
              className="py-14"
            />
          ) : (
            <EmptyState
              icon={<Inbox />}
              title="No conversations yet"
              description="Open a project to message its client, or start one here."
              action={<NewMessageDialog projects={projects} />}
              className="py-14"
            />
          )
        ) : result.rows.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="This page is empty"
            description={`There are only ${result.pageCount} pages of conversations.`}
            action={
              <Link href={`/dashboard/messages${querySuffix({ filter: query.filter, q: query.q })}`} className="inline-flex min-h-10 items-center text-[14px] font-semibold text-brand-700 hover:underline">
                Go to the first page
              </Link>
            }
            className="py-14"
          />
        ) : (
          <ConversationList
            conversations={result.rows}
            viewerSide="team"
            activeProjectId={activeProjectId}
            hrefFor={(projectId) => `/dashboard/messages/${projectId}${querySuffix(query)}`}
          />
        )}
      </div>

      {result.pageCount > 1 && (
        <div className="border-t border-ink-200 px-4 py-3">
          <Pagination
            page={query.page}
            pageCount={result.pageCount}
            pathname={activeProjectId ? `/dashboard/messages/${activeProjectId}` : "/dashboard/messages"}
            searchParams={{ q: query.q || undefined, filter: query.filter === "all" ? undefined : query.filter }}
          />
        </div>
      )}
    </section>
  );
}
