import Link from "next/link";
import { Download } from "lucide-react";

import { FileRowMenu } from "@/components/files/FileRowMenu";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { isViewableMimeType } from "@/features/files/file-types";
import { formatBytes, formatRelativeTime } from "@/lib/utils/format";
import type { FileRow } from "@/server/repositories/file.repository";

type FilesTableProps = {
  files: FileRow[];
  canEdit: boolean;
  showProject?: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function uploaderName(file: FileRow) {
  return [file.uploaderFirstName, file.uploaderLastName].filter(Boolean).join(" ") || file.uploaderEmail || "Someone";
}

function FileActions({ file, canEdit }: { file: FileRow; canEdit: boolean }) {
  if (canEdit) {
    return (
      <FileRowMenu fileId={file.id} name={file.name} isPublic={file.isPublic} viewable={isViewableMimeType(file.mimeType)} />
    );
  }

  return (
    <a
      href={`/dashboard/files/${file.id}/download`}
      aria-label={`Download ${file.name}`}
      className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
    >
      <Download aria-hidden className="size-4" />
    </a>
  );
}

function SharedBadge({ isPublic }: { isPublic: boolean }) {
  return isPublic ? <StatusBadge label="Shared" tone="mint" /> : <StatusBadge label="Internal" tone="neutral" />;
}

function fileLinkProps(file: FileRow) {
  return isViewableMimeType(file.mimeType)
    ? { href: `/dashboard/files/${file.id}/view`, target: "_blank", rel: "noopener noreferrer", title: `View ${file.name}` }
    : { href: `/dashboard/files/${file.id}/download`, title: `Download ${file.name}` };
}

function FileName({ file, showProject }: { file: FileRow; showProject: boolean }) {
  return (
    <div className="min-w-0">
      <a {...fileLinkProps(file)} className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700">
        {file.name}
      </a>
      {showProject && (
        <p className="truncate text-[13px] text-ink-500">
          <Link href={`/dashboard/projects/${file.projectId}?tab=files`} className="hover:text-brand-700">
            {file.projectName}
          </Link>
          {" · "}
          {file.clientName}
        </p>
      )}
    </div>
  );
}

export function FilesTable({ files, canEdit, showProject = false }: FilesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>File</th>
            <th scope="col" className={headerCell}>Visibility</th>
            <th scope="col" className={headerCell}>Uploaded</th>
            <th scope="col" className={`${headerCell} text-right`}>Size</th>
            <th scope="col" className="w-14">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {files.map((file) => (
            <tr key={file.id} className="transition-colors hover:bg-ink-50">
              <td className="max-w-96 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileTypeIcon mimeType={file.mimeType} />
                  <FileName file={file} showProject={showProject} />
                </div>
              </td>
              <td className="px-4 py-3">
                <SharedBadge isPublic={file.isPublic} />
              </td>
              <td className="px-4 py-3 text-[13px] text-ink-500">
                <span className="block truncate text-ink-700">{uploaderName(file)}</span>
                <time dateTime={file.createdAt.toISOString()}>{formatRelativeTime(file.createdAt)}</time>
              </td>
              <td className="px-4 py-3 text-right text-[13px] tabular-nums text-ink-500">{formatBytes(file.sizeBytes)}</td>
              <td className="py-3 pr-3 text-right">
                <FileActions file={file} canEdit={canEdit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {files.map((file) => (
          <li key={file.id} className="flex items-start gap-3 px-4 py-3.5">
            <FileTypeIcon mimeType={file.mimeType} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <FileName file={file} showProject={showProject} />
              <p className="flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                <SharedBadge isPublic={file.isPublic} />
                <span>{formatBytes(file.sizeBytes)}</span>
                <span aria-hidden>·</span>
                <time dateTime={file.createdAt.toISOString()}>{formatRelativeTime(file.createdAt)}</time>
              </p>
            </div>
            <FileActions file={file} canEdit={canEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}
