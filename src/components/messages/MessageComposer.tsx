"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MESSAGE_COUNTER_FROM, MESSAGE_MAX_LENGTH } from "@/features/messages/thread-message";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 208;

type MessageComposerProps = {
  recipientName: string;
  disabled?: boolean;
  onSend: (content: string) => void;
};

export function MessageComposer({ recipientName, disabled = false, onSend }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const counterId = useId();
  const trimmed = value.trim();
  const showCounter = value.length >= MESSAGE_COUNTER_FROM;
  const tooLong = value.length > MESSAGE_MAX_LENGTH;
  const canSend = !disabled && trimmed.length > 0 && !tooLong;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !coarsePointer) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-ink-200 bg-white px-3 py-3 sm:px-4">
      <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-ink-50 py-1.5 pl-3.5 pr-1.5 transition-colors focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
        <label htmlFor={inputId} className="sr-only">
          Message {recipientName}
        </label>
        <textarea
          id={inputId}
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message ${recipientName}`}
          aria-describedby={showCounter ? counterId : undefined}
          aria-invalid={tooLong || undefined}
          className="max-h-52 min-h-6 flex-1 resize-none overflow-y-auto bg-transparent scrollbar-none [&::-webkit-scrollbar]:hidden py-1.5 text-[14.5px] leading-normal text-ink-900 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
        />
        <Button type="submit" disabled={!canSend} className="h-10 shrink-0 rounded-xl px-3.5">
          <SendHorizontal aria-hidden className="size-4" />
          Send
        </Button>
      </div>
      <div className="mt-1.5 flex min-h-4 items-center justify-between gap-3 px-1 text-[12px] text-ink-500">
        <span className="hidden sm:inline">Enter to send, Shift + Enter for a new line</span>
        {showCounter && (
          <span id={counterId} className={cn("ml-auto tabular-nums", tooLong && "font-semibold text-coral-700")}>
            {value.length.toLocaleString("en")} / {MESSAGE_MAX_LENGTH.toLocaleString("en")}
          </span>
        )}
      </div>
    </form>
  );
}
