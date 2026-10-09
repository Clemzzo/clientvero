"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";
import { Ellipsis, Trash2 } from "lucide-react";

import { MessageText } from "@/components/messages/MessageText";
import { SendingIndicator } from "@/components/messages/SendingIndicator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type BubbleStatus = "sent" | "sending" | "failed";
export type BubblePosition = "single" | "first" | "middle" | "last";

type MessageBubbleProps = {
  content: string;
  outgoing: boolean;
  status: BubbleStatus;
  position: BubblePosition;
  entrance: "none" | "send" | "arrive";
  error?: string;
  onDelete?: () => void;
  onRetry?: () => void;
};

const corners: Record<"outgoing" | "incoming", Record<BubblePosition, string>> = {
  outgoing: {
    single: "rounded-[18px]",
    first: "rounded-[18px] rounded-br-[6px]",
    middle: "rounded-[18px] rounded-r-[6px]",
    last: "rounded-[18px] rounded-tr-[6px]",
  },
  incoming: {
    single: "rounded-[18px]",
    first: "rounded-[18px] rounded-bl-[6px]",
    middle: "rounded-[18px] rounded-l-[6px]",
    last: "rounded-[18px] rounded-tl-[6px]",
  },
};

const sendSpring: Transition = { type: "spring", stiffness: 500, damping: 32 };
const arriveFade: Transition = { duration: 0.16, ease: "easeOut" };

function entranceFrom(entrance: MessageBubbleProps["entrance"], reduced: boolean): TargetAndTransition | false {
  if (reduced || entrance === "none") return false;
  return entrance === "send" ? { opacity: 0, y: 12, scale: 0.96 } : { opacity: 0, y: 6 };
}

function statusAnimation(status: BubbleStatus, reduced: boolean): TargetAndTransition {
  if (status === "sending") {
    return reduced
      ? { opacity: 0.7, x: 0 }
      : { opacity: [0.7, 0.85, 0.7], x: 0, transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } };
  }
  if (status === "failed" && !reduced) {
    return { opacity: 1, x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.24, ease: "easeInOut" } };
  }
  return { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.15 } };
}

export function MessageBubble({ content, outgoing, status, position, entrance, error, onDelete, onRetry }: MessageBubbleProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={entranceFrom(entrance, reduced)}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.18 } }}
      transition={entrance === "send" ? sendSpring : arriveFade}
      style={{ transformOrigin: outgoing ? "bottom right" : "bottom left" }}
      className={cn("group/bubble flex w-full flex-col", outgoing ? "items-end" : "items-start")}
    >
      <div className={cn("flex w-full items-center gap-1.5", outgoing ? "flex-row-reverse" : "flex-row")}>
        <motion.div
          animate={statusAnimation(status, reduced)}
          className={cn(
            "max-w-[min(560px,80%)] whitespace-pre-wrap wrap-break-word px-3.5 py-2 text-[14.5px] leading-normal",
            corners[outgoing ? "outgoing" : "incoming"][position],
            outgoing ? "bg-brand-600 text-white" : "border border-ink-200 bg-white text-ink-900",
            status === "failed" && "outline-2 outline-offset-2 outline-coral-600",
          )}
        >
          <MessageText content={content} outgoing={outgoing} />
        </motion.div>

        {onDelete && status === "sent" && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Message actions"
              className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 opacity-0 transition-opacity hover:bg-ink-100 hover:text-ink-900 focus-visible:opacity-100 group-hover/bubble:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
            >
              <Ellipsis aria-hidden className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={outgoing ? "end" : "start"} className="min-w-44">
              <DropdownMenuItem tone="destructive" onSelect={onDelete}>
                <Trash2 aria-hidden />
                Delete message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {status === "sending" && (
        <div className="mt-1 px-1">
          <SendingIndicator />
        </div>
      )}

      {status === "failed" && (
        <p
          role="alert"
          className={cn(
            "mt-1.5 flex max-w-[min(560px,80%)] flex-wrap items-baseline gap-x-1.5 px-1 text-[12.5px] leading-snug",
            outgoing ? "justify-end text-right" : "justify-start text-left",
          )}
        >
          <span className="font-semibold text-coral-700">Not sent.</span>
          {error && <span className="text-ink-500">{error}</span>}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-10 items-center rounded-sm px-1 font-semibold text-brand-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Retry
            </button>
          )}
        </p>
      )}
    </motion.div>
  );
}
