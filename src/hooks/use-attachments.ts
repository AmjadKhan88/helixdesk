"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  uploadErrorMessage,
  uploadFile,
  validateFile,
  type UploadedFile,
} from "@/lib/upload-client";
import { MAX_FILES } from "@/lib/uploads";

export type Pending = {
  key: string;
  name: string;
  size: number;
  previewUrl?: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  uploaded?: UploadedFile;
};

export type AttachmentsController = ReturnType<typeof useAttachments>;

export function useAttachments() {
  const [items, setItems] = useState<Pending[]>([]);

  const patch = (key: string, p: Partial<Pending>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...p } : i)));

  function add(files: File[]) {
    const room = MAX_FILES - items.filter((i) => i.status !== "error").length;
    if (files.length > room)
      toast.error(`You can attach up to ${MAX_FILES} files.`);

    for (const file of files.slice(0, Math.max(0, room))) {
      const key = crypto.randomUUID();
      const problem = validateFile(file);
      const previewUrl =
        !problem && file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

      setItems((prev) => [
        ...prev,
        {
          key,
          name: file.name,
          size: file.size,
          previewUrl,
          progress: 0,
          status: problem ? "error" : "uploading",
          error: problem ?? undefined,
        },
      ]);
      if (problem) continue;

      uploadFile(file, (progress) => patch(key, { progress }))
        .then((uploaded) =>
          patch(key, { status: "done", progress: 100, uploaded }),
        )
        .catch((err) =>
          patch(key, { status: "error", error: uploadErrorMessage(err) }),
        );
    }
  }

  function remove(key: string) {
    const item = items.find((i) => i.key === key);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item?.uploaded)
      fetch(`/api/uploads/${item.uploaded.id}`, { method: "DELETE" }).catch(
        () => {},
      );
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function reset() {
    items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  }

  return {
    items,
    add,
    remove,
    reset,
    busy: items.some((i) => i.status === "uploading"),
    ids: items.filter((i) => i.status === "done").map((i) => i.uploaded!.id),
  };
}
