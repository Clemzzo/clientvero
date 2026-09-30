import type { ReactNode } from "react";
import Image from "next/image";
import { Download, FileImage, FileText, Lock, MessageSquare, Paperclip, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import sarahAvatar from "@/assets/images/sarah.png";
import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const sharedFiles = [
  { name: "logo-concepts.pdf", size: "4.1 MB", shared: "18 Sep", icon: FileText },
  { name: "colour-palette.png", size: "820 KB", shared: "15 Sep", icon: FileImage },
  { name: "moodboard.pdf", size: "2.4 MB", shared: "10 Sep", icon: FileText },
];

const thread = [
  {
    from: "team",
    name: "Sarah Chen",
    when: "2h ago",
    text: "Logo concepts are up in Files. Let me know which direction you like best.",
  },
  { from: "client", name: "James", when: "1h ago", text: "Option B is the one. Could we try it in a darker navy?" },
  { from: "team", name: "Sarah Chen", when: "20m ago", text: "Absolutely. I'll share the update before Friday." },
] as const;

function CapabilityCard({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className="p-6 sm:p-7">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon aria-hidden className="size-5" />
        </span>
        <h3 className="mt-5 font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">{title}</h3>
        <p className="mt-2 max-w-[46ch] text-[14px] leading-[1.6] text-ink-500">{detail}</p>
      </div>
      <div aria-hidden className="mt-auto border-t border-ink-200 bg-ink-50 p-4 sm:p-5">
        {children}
      </div>
    </li>
  );
}

function FilesPreview() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
        <span className="text-[12px] font-semibold text-ink-900">Brand identity files</span>
        <span className="text-[10.5px] text-ink-400">{sharedFiles.length} files</span>
      </div>
      <ul className="divide-y divide-ink-100">
        {sharedFiles.map((file) => (
          <li key={file.name} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <file.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-ink-900">{file.name}</span>
              <span className="block truncate text-[10.5px] text-ink-400">
                {file.size}, shared {file.shared}
              </span>
            </span>
            <span className="grid size-7 shrink-0 place-items-center rounded-md border border-ink-200 text-ink-500">
              <Download className="size-3.5" />
            </span>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 border-t border-ink-200 px-4 py-2.5 text-[10.5px] text-ink-400">
        <Lock className="size-3 shrink-0 text-emerald-600" />
        Downloads use secure links that expire
      </p>
    </div>
  );
}

function MessagesPreview() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
        <span className="text-[12px] font-semibold text-ink-900">Brand identity</span>
        <span className="text-[10.5px] text-ink-400">Northwind Studio</span>
      </div>

      <ul className="space-y-3 px-4 py-4">
        {thread.map((message) => {
          const fromClient = message.from === "client";

          return (
            <li key={message.text} className={cn("flex items-end gap-2", fromClient && "flex-row-reverse")}>
              {fromClient ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-100 text-[9px] font-bold text-ink-500">
                  JM
                </span>
              ) : (
                <Image src={sarahAvatar} alt="" sizes="24px" className="size-6 shrink-0 rounded-full object-cover" />
              )}
              <span
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2",
                  fromClient ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-ink-50 text-ink-700",
                )}
              >
                <span
                  className={cn(
                    "flex items-baseline justify-between gap-3 text-[10px]",
                    fromClient ? "text-brand-100" : "text-ink-400",
                  )}
                >
                  <span className="font-semibold">{message.name}</span>
                  <span>{message.when}</span>
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug">{message.text}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-2 border-t border-ink-200 px-3 py-2.5">
        <span className="flex-1 truncate rounded-lg bg-ink-50 px-3 py-2 text-[11px] text-ink-400">
          Write a message…
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
          <Send className="size-3.5" />
        </span>
      </div>
    </div>
  );
}

export function PortalFilesMessages() {
  return (
    <ProductSection
      id="files-messages"
      title="Files and messages, next to the work."
      intro="Share deliverables and talk things through on the project itself, so nothing gets lost across email, chat, and cloud folders."
      className="bg-ink-50"
    >
      <ul className="grid gap-5 lg:grid-cols-2">
        <CapabilityCard
          icon={Paperclip}
          title="Files"
          detail="Share documents and deliverables on the project they belong to. Your client downloads them from the portal whenever they need them."
        >
          <FilesPreview />
        </CapabilityCard>
        <CapabilityCard
          icon={MessageSquare}
          title="Messages"
          detail="Keep one conversation per project. Your client replies from the portal, and you're notified as soon as they do."
        >
          <MessagesPreview />
        </CapabilityCard>
      </ul>
    </ProductSection>
  );
}
