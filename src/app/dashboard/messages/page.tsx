import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { InboxPane } from "@/components/messages/InboxPane";

import { loadInbox } from "./inbox-data";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage(props: PageProps<"/dashboard/messages">) {
  const { query, result, projects } = await loadInbox(await props.searchParams);

  return (
    <div className="flex h-[calc(100dvh-101px)] lg:h-[calc(100dvh-64px)]">
      <InboxPane result={result} query={query} projects={projects} className="w-full lg:w-[360px] lg:border-r lg:border-ink-200" />
      <div className="hidden flex-1 flex-col items-center justify-center px-8 text-center lg:flex">
        <span className="grid size-12 place-items-center rounded-2xl bg-white text-ink-500 shadow-xs">
          <MessagesSquare aria-hidden className="size-5" />
        </span>
        <p className="mt-4 font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">Choose a conversation</p>
        <p className="mt-1.5 max-w-[36ch] text-[14px] text-ink-500">Each project has one thread with its client. Pick one on the left to read and reply.</p>
      </div>
    </div>
  );
}
