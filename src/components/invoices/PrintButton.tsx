"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button type="button" variant="outline" className="h-9 rounded-lg bg-white print:hidden" onClick={() => window.print()}>
      <Printer aria-hidden className="size-4" />
      Print or save as PDF
    </Button>
  );
}
