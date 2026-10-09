"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, LoaderCircle, Upload } from "lucide-react";

import { CheckboxField } from "@/components/shared/CheckboxField";
import { Button } from "@/components/ui/button";
import { acceptAttribute, allowedTypesLabel, fileTypeForName, MAX_FILE_BYTES } from "@/features/files/file-types";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/format";
import { completeFileUploadAction, prepareFileUploadAction } from "@/server/actions/files";
import type { PreparedUpload } from "@/server/services/file.service";

type UploadStatus = "queued" | "uploading" | "done" | "failed";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
};

const maxSizeLabel = `${MAX_FILE_BYTES / (1024 * 1024)} MB`;

function checkFile(file: File): string | undefined {
  if (!fileTypeForName(file.name)) return `Upload ${allowedTypesLabel} files.`;
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_FILE_BYTES) return `Files can be up to ${maxSizeLabel}.`;
  return undefined;
}

function putFile(target: PreparedUpload, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", target.url);
    for (const [name, value] of Object.entries(target.headers)) {
      request.setRequestHeader(name, value);
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => (request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("upload")));
    request.onerror = () => reject(new Error("network"));
    request.send(file);
  });
}

export function FileUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [shared, setShared] = useState(true);
  const [dragging, setDragging] = useState(false);
  const busy = items.some((item) => item.status === "queued" || item.status === "uploading");

  function update(id: string, patch: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadOne(item: UploadItem, file: File): Promise<boolean> {
    update(item.id, { status: "uploading" });

    try {
      return await sendFile(item, file);
    } catch {
      update(item.id, { status: "failed", error: "Something went wrong. Check your connection and try again." });
      return false;
    }
  }

  async function sendFile(item: UploadItem, file: File): Promise<boolean> {
    const prepared = await prepareFileUploadAction({ projectId, name: file.name, sizeBytes: file.size });
    if ("error" in prepared) {
      update(item.id, { status: "failed", error: prepared.error });
      return false;
    }

    try {
      await putFile(prepared, file, (progress) => update(item.id, { progress }));
    } catch {
      update(item.id, { status: "failed", error: "The upload was interrupted. Check your connection and try again." });
      return false;
    }

    const completed = await completeFileUploadAction({
      projectId,
      name: file.name,
      sizeBytes: file.size,
      objectKey: prepared.objectKey,
      shared,
    });

    if (completed.error) {
      update(item.id, { status: "failed", error: completed.error });
      return false;
    }

    update(item.id, { status: "done", progress: 100 });
    return true;
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || busy) return;

    const queue = Array.from(fileList).map((file) => {
      const error = checkFile(file);
      const item: UploadItem = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        progress: 0,
        status: error ? "failed" : "queued",
        error,
      };
      return { item, file };
    });

    setItems(queue.map(({ item }) => item));

    let uploaded = 0;
    try {
      for (const { item, file } of queue) {
        if (item.status === "queued" && (await uploadOne(item, file))) uploaded += 1;
      }
    } finally {
      if (uploaded > 0) router.refresh();
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center rounded-xl border border-dashed border-ink-300 bg-ink-50 px-6 py-8 text-center transition-colors",
          dragging && "border-brand-500 bg-brand-50",
        )}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-white text-ink-500 shadow-xs">
          <Upload aria-hidden className="size-5" />
        </span>
        <p className="mt-3 text-[14px] font-medium text-ink-900">Drag files here, or</p>
        <Button
          type="button"
          variant="outline"
          className="mt-2 h-9 rounded-lg"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-describedby={hintId}
        >
          {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {busy ? "Uploading…" : "Choose files"}
        </Button>
        <p id={hintId} className="mt-2 text-[13px] text-ink-500">
          {allowedTypesLabel} · up to {maxSizeLabel} each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptAttribute}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <CheckboxField
        name="shared"
        label="Share new uploads with the client"
        hint="Shared files appear in the client portal. You can change this for each file later."
        checked={shared}
        disabled={busy}
        onChange={(event) => setShared(event.target.checked)}
      />

      {items.length > 0 && (
        <ul aria-live="polite" className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <UploadStatusIcon status={item.status} />
                <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-900">{item.name}</p>
                <span className="text-[12.5px] tabular-nums text-ink-500">{formatBytes(item.size)}</span>
              </div>
              {item.status === "uploading" && (
                <div
                  role="progressbar"
                  aria-label={`Uploading ${item.name}`}
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"
                >
                  <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              {item.error && <p className="mt-1 text-[13px] text-red-700">{item.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UploadStatusIcon({ status }: { status: UploadStatus }) {
  if (status === "done") return <CircleCheck aria-label="Uploaded" className="size-4 shrink-0 text-emerald-600" />;
  if (status === "failed") return <CircleAlert aria-label="Failed" className="size-4 shrink-0 text-red-600" />;
  return <LoaderCircle aria-label="Uploading" className="size-4 shrink-0 animate-spin text-ink-400" />;
}
