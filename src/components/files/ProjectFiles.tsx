import { FolderOpen } from "lucide-react";

import { FileUploader } from "@/components/files/FileUploader";
import { FilesTable } from "@/components/files/FilesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader } from "@/components/ui/card";
import type { FileRow } from "@/server/repositories/file.repository";

type ProjectFilesProps = {
  projectId: string;
  files: FileRow[];
  canEdit: boolean;
};

export function ProjectFiles({ projectId, files, canEdit }: ProjectFilesProps) {
  return (
    <div className="space-y-4">
      {canEdit && (
        <Card>
          <CardHeader title="Upload files" description="Deliverables, briefs and documents for this project." />
          <div className="px-5 pb-5 pt-4 sm:px-6">
            <FileUploader projectId={projectId} />
          </div>
        </Card>
      )}

      {files.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen />}
            title="No files yet"
            description={
              canEdit
                ? "Upload a file above. Shared files show up in the client portal."
                : "Files uploaded to this project will show up here."
            }
            className="py-14"
          />
        </Card>
      ) : (
        <FilesTable files={files} canEdit={canEdit} />
      )}
    </div>
  );
}
