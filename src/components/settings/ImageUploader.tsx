"use client";

import { useEffect, useId, useRef, useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, LoaderCircle, Trash2 } from "lucide-react";

import { useNotice } from "@/components/shared/notice-provider";
import { Avatar } from "@/components/shared/Avatar";
import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import { Button } from "@/components/ui/button";
import {
  imageAcceptAttribute,
  imageMimeTypeForName,
  imageTypesLabel,
  MAX_IMAGE_BYTES,
  maxImageSizeLabel,
  type ImageTarget,
} from "@/features/settings/image-types";
import { cn } from "@/lib/utils";
import { completeImageUploadAction, prepareImageUploadAction, removeImageAction } from "@/server/actions/settings";

type ImageUploaderProps = {
  target: ImageTarget;
  name: string;
  src: string | null;
  label: string;
};

const copy: Record<ImageTarget, { saved: string; removed: string; remove: string }> = {
  avatar: { saved: "Profile photo updated.", removed: "Profile photo removed.", remove: "Remove photo" },
  logo: { saved: "Logo updated.", removed: "Logo removed.", remove: "Remove logo" },
};

function checkImage(file: File): string | undefined {
  if (!imageMimeTypeForName(file.name)) return `Upload a ${imageTypesLabel} image.`;
  if (file.size === 0) return "This image is empty.";
  if (file.size > MAX_IMAGE_BYTES) return `Images can be up to ${maxImageSizeLabel}.`;
  return undefined;
}

async function putImage(url: string, headers: Record<string, string>, file: File) {
  const response = await fetch(url, { method: "PUT", headers, body: file });
  if (!response.ok) throw new Error("upload");
}

export function ImageUploader({ target, name, src, label }: ImageUploaderProps) {
  const router = useRouter();
  const showNotice = useNotice();
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [removing, startRemoving] = useTransition();
  const busy = uploading || removing;
  const shown = preview ?? src;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function upload(file: File) {
    const problem = checkImage(file);
    if (problem) {
      showNotice("error", problem);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const prepared = await prepareImageUploadAction({ target, name: file.name, sizeBytes: file.size });
      if ("error" in prepared) throw new Error(prepared.error);

      await putImage(prepared.url, prepared.headers, file);

      const completed = await completeImageUploadAction({
        target,
        name: file.name,
        sizeBytes: file.size,
        objectKey: prepared.objectKey,
      });
      if (completed.error) throw new Error(completed.error);

      showNotice("success", copy[target].saved);
      router.refresh();
    } catch (error) {
      setPreview(null);
      const message = error instanceof Error && error.message !== "upload" ? error.message : null;
      showNotice("error", message ?? "The upload was interrupted. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    startRemoving(async () => {
      const result = await removeImageAction(target);
      if (result.error) {
        showNotice("error", result.error);
        return;
      }
      setPreview(null);
      showNotice("success", copy[target].removed);
      router.refresh();
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !busy) void upload(file);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-dashed border-transparent p-1 transition-colors sm:flex-row sm:items-center",
        dragging && "border-brand-400 bg-brand-50/60",
      )}
    >
      <div className="relative w-fit">
        {target === "avatar" ? (
          <Avatar name={name} src={shown} className="size-18 text-[22px]" />
        ) : (
          <WorkspaceLogo name={name} src={shown} className="size-18 rounded-2xl text-[28px]" />
        )}
        {uploading && (
          <span
            className={cn(
              "absolute inset-0 grid place-items-center bg-white/70",
              target === "avatar" ? "rounded-full" : "rounded-2xl",
            )}
          >
            <LoaderCircle aria-label="Uploading" className="size-5 animate-spin text-brand-600" />
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] font-medium text-ink-900">{label}</p>
        <p id={hintId} className="mt-0.5 text-[13px] text-ink-500">
          {imageTypesLabel}, up to {maxImageSizeLabel}. Drag an image here or choose one.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={busy}
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp aria-hidden className="size-4" />
            {uploading ? "Uploading…" : src ? "Replace" : "Upload"}
          </Button>
          {src && (
            <Button type="button" variant="ghost" size="sm" className="rounded-lg text-destructive hover:bg-red-50 hover:text-destructive" disabled={busy} onClick={remove}>
              {removing ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Trash2 aria-hidden className="size-4" />}
              {copy[target].remove}
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={imageAcceptAttribute}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
