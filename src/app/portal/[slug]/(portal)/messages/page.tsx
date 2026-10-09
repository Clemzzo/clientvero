import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { ConversationList } from "@/components/messages/ConversationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requirePortalContext } from "@/server/auth/portal-session";
import { listPortalConversations } from "@/server/repositories/message.repository";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function PortalMessagesPage(props: PageProps<"/portal/[slug]/messages">) {
  const context = await requirePortalContext((await props.params).slug);
  const conversations = await listPortalConversations(context.organization.id, context.client.id);
  const slug = context.organization.slug;

  return (
    <div className="space-y-8">
      <PageHeader title="Messages" description={`Your conversations with ${context.organization.name}, one for each project.`} />

      {conversations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessagesSquare />}
            title="No messages yet"
            description={`Open a project to send ${context.organization.name} a message about it.`}
            action={
              <Button asChild variant="outline" className="rounded-lg">
                <Link href={`/portal/${slug}/projects`}>View projects</Link>
              </Button>
            }
            className="py-14"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ConversationList
            conversations={conversations}
            viewerSide="client"
            hrefFor={(projectId) => `/portal/${slug}/messages/${projectId}`}
          />
        </Card>
      )}
    </div>
  );
}
