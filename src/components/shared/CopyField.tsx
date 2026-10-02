"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CopyFieldProps = {
  label: string;
  value: string;
};

export function CopyField({ label, value }: CopyFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      inputRef.current?.select();
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        readOnly
        value={value}
        aria-label={label}
        onFocus={(event) => event.currentTarget.select()}
        className="h-11 bg-ink-50 font-mono text-[13px]"
      />
      <Button type="button" variant="outline" className="h-11 shrink-0 rounded-lg" onClick={copy}>
        {copied ? <Check aria-hidden className="size-4 text-mint-600" /> : <Copy aria-hidden className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
