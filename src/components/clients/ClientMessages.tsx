import { MessagesSquare } from "lucide-react";

import { ConversationList } from "@/components/messages/ConversationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Card } from "@/components/ui/card";
import type { ConversationListResult } from "@/server/repositories/message.repository";

type ClientMessagesProps = {
  clientId: string;
  clientName: string;
  result: ConversationListResult;
  page: number;
};

export function ClientMessages({ clientId, clientName, result, page }: ClientMessagesProps) {
  if (result.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<MessagesSquare />}
          title={result.total === 0 ? "No conversations yet" : "This page is empty"}
          description={
            result.total === 0
              ? `Open one of ${clientName}'s projects to start a conversation.`
              : `There are only ${result.pageCount} pages of conversations.`
          }
          className="py-14"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <ConversationList conversations={result.rows} viewerSide="team" hrefFor={(projectId) => `/dashboard/messages/${projectId}`} />
      </Card>
      <Pagination page={page} pageCount={result.pageCount} pathname={`/dashboard/clients/${clientId}`} searchParams={{ tab: "messages" }} />
    </div>
  );
}
