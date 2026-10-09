import { MessageThread } from "@/components/messages/MessageThread";
import { PortalAccessBanner } from "@/components/messages/PortalAccessBanner";
import { teamThreadActions } from "@/components/messages/team-thread-actions";
import type { User } from "@/db/schema";
import { clientCanReadMessages, listThread } from "@/server/repositories/message.repository";

type TeamThreadProps = {
  organizationId: string;
  user: User;
  projectId: string;
  clientId: string;
  clientName: string;
};

function displayName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export async function TeamThread({ organizationId, user, projectId, clientId, clientName }: TeamThreadProps) {
  const [messages, clientCanRead] = await Promise.all([
    listThread({ organizationId, projectId }, { side: "team", userId: user.id }),
    clientCanReadMessages(organizationId, clientId),
  ]);

  return (
    <>
      {!clientCanRead && <PortalAccessBanner clientName={clientName} />}
      <div className="min-h-0 flex-1">
        <MessageThread
          projectId={projectId}
          viewerSide="team"
          selfName={displayName(user)}
          recipientName={clientName}
          initialMessages={messages}
          actions={teamThreadActions}
          emptyTitle="Start the conversation"
          emptyDescription={`Write to ${clientName} about this project. They'll see it in their client portal.`}
        />
      </div>
    </>
  );
}
