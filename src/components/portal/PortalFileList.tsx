import { Download } from "lucide-react";

import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { isViewableMimeType } from "@/features/files/file-types";
import { formatBytes, formatRelativeTime } from "@/lib/utils/format";
import type { PortalFile } from "@/server/repositories/file.repository";

type PortalFileListProps = {
  slug: string;
  files: PortalFile[];
};

export function PortalFileList({ slug, files }: PortalFileListProps) {
  return (
    <ul className="divide-y divide-ink-200">
      {files.map((file) => {
        const downloadHref = `/portal/${slug}/files/${file.id}/download`;
        const viewable = isViewableMimeType(file.mimeType);

        return (
          <li key={file.id} className="flex items-center gap-1">
            <a
              href={viewable ? `/portal/${slug}/files/${file.id}/view` : downloadHref}
              {...(viewable && { target: "_blank", rel: "noopener noreferrer" })}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-ink-50"
            >
              <FileTypeIcon mimeType={file.mimeType} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink-900">{file.name}</span>
                <span className="text-[13px] text-ink-500">
                  {formatBytes(file.sizeBytes)} · added {formatRelativeTime(file.createdAt)}
                  {viewable && " · click to view"}
                </span>
              </span>
            </a>
            <a
              href={downloadHref}
              aria-label={`Download ${file.name}`}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <Download aria-hidden className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
