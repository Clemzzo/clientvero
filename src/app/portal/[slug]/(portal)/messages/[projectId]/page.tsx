import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MessageThread } from "@/components/messages/MessageThread";
import { ThreadHeader } from "@/components/messages/ThreadHeader";
import { Card } from "@/components/ui/card";
import {
  deletePortalMessageAction,
  loadEarlierPortalMessagesAction,
  pollPortalThreadAction,
  sendPortalMessageAction,
} from "@/server/actions/portal-messages";
import { requirePortalContext } from "@/server/auth/portal-session";
import { NotFoundError } from "@/server/errors";
import { listThread } from "@/server/repositories/message.repository";
import { getPortalProject } from "@/server/repositories/portal.repository";
import { projectIdSchema } from "@/validators/projects";

const loadThread = cache(async (slug: string, id: string) => {
  const context = await requirePortalContext(slug);
  const projectId = projectIdSchema.safeParse(id);
  if (!projectId.success) notFound();

  try {
    const project = await getPortalProject(context, projectId.data);
    const messages = await listThread(
      { organizationId: context.organization.id, projectId: project.id, clientId: context.client.id },
      { side: "client" },
    );
    return { context, project, messages };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});

export async function generateMetadata(props: PageProps<"/portal/[slug]/messages/[projectId]">): Promise<Metadata> {
  const { slug, projectId } = await props.params;
  const { project } = await loadThread(slug, projectId);
  return { title: `Messages: ${project.name}` };
}

export default async function PortalThreadPage(props: PageProps<"/portal/[slug]/messages/[projectId]">) {
  const { slug, projectId } = await props.params;
  const { context, project, messages } = await loadThread(slug, projectId);
  const organizationName = context.organization.name;
  const boundSlug = context.organization.slug;

  return (
    <div className="space-y-4">
      <Link
        href={`/portal/${boundSlug}/messages`}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md text-[14px] font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Messages
      </Link>

      <Card className="flex h-[min(760px,calc(100dvh-200px))] min-h-[480px] flex-col overflow-hidden">
        <ThreadHeader
          projectName={project.name}
          subtitle={`With ${organizationName}`}
          status={project.status}
          progress={project.progress}
          action={
            <Link
              href={`/portal/${boundSlug}/projects/${project.id}`}
              className="inline-flex min-h-10 shrink-0 items-center rounded-md text-[13.5px] font-semibold text-brand-700 hover:underline"
            >
              View project
            </Link>
          }
        />
        <div className="min-h-0 flex-1 bg-ink-50">
          <MessageThread
            key={project.id}
            projectId={project.id}
            viewerSide="client"
            selfName="You"
            recipientName={organizationName}
            teamLabel={organizationName}
            initialMessages={messages}
            actions={{
              send: sendPortalMessageAction.bind(null, boundSlug),
              remove: deletePortalMessageAction.bind(null, boundSlug),
              loadEarlier: loadEarlierPortalMessagesAction.bind(null, boundSlug),
              poll: pollPortalThreadAction.bind(null, boundSlug),
            }}
            emptyTitle={`Message ${organizationName}`}
            emptyDescription="Ask a question or share an update about this project. The team will see it right away."
          />
        </div>
      </Card>
    </div>
  );
}
