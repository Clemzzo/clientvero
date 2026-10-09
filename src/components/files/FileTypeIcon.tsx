import { FileArchive, FileImage, FileSpreadsheet, FileText, FileType2, Presentation, type LucideIcon } from "lucide-react";

import { fileKindForMimeType, type FileKind } from "@/features/files/file-types";
import { cn } from "@/lib/utils";

const kindIcons: Record<FileKind, { icon: LucideIcon; className: string }> = {
  pdf: { icon: FileText, className: "bg-red-50 text-red-700" },
  image: { icon: FileImage, className: "bg-brand-50 text-brand-700" },
  document: { icon: FileType2, className: "bg-ink-100 text-ink-700" },
  spreadsheet: { icon: FileSpreadsheet, className: "bg-emerald-50 text-emerald-700" },
  presentation: { icon: Presentation, className: "bg-amber-50 text-amber-800" },
  text: { icon: FileText, className: "bg-ink-100 text-ink-700" },
  archive: { icon: FileArchive, className: "bg-ink-100 text-ink-700" },
};

export function FileTypeIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  const { icon: Icon, className: tone } = kindIcons[fileKindForMimeType(mimeType)];

  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tone, className)}>
      <Icon aria-hidden className="size-4.5" />
    </span>
  );
}
