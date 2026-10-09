import { linkify } from "@/features/messages/linkify";
import { cn } from "@/lib/utils";

export function MessageText({ content, outgoing }: { content: string; outgoing: boolean }) {
  return linkify(content).map((part, index) =>
    part.type === "link" ? (
      <a
        key={index}
        href={part.href}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        className={cn(
          "break-all underline underline-offset-2",
          outgoing ? "decoration-white/60 hover:decoration-white" : "text-brand-700 decoration-brand-300 hover:decoration-brand-700",
        )}
      >
        {part.value}
      </a>
    ) : (
      <span key={index}>{part.value}</span>
    ),
  );
}
