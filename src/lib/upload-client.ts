import { apiFetch, ApiRequestError, errorMessage } from "@/lib/api-client";
import { ALLOWED_MIME, MAX_BYTES, mimeFromFile } from "@/lib/uploads";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
};

export function validateFile(file: File) {
  if (!(ALLOWED_MIME as readonly string[]).includes(mimeFromFile(file)))
    return "Only PNG, JPEG, GIF, WebP, or PDF files.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_BYTES) return "Files can be up to 10 MB.";
  return null;
}

export const uploadErrorMessage = (e: unknown) =>
  e instanceof ApiRequestError
    ? errorMessage(e)
    : e instanceof Error
      ? e.message
      : "Upload failed.";

function put(
  url: string,
  file: File,
  mime: string,
  onProgress: (pct: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mime);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("Upload failed. Please try again."));
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

/** 1) ask  2) send the bytes  3) let the server verify them */
export async function uploadFile(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadedFile> {
  const mime = mimeFromFile(file);
  const init = await apiFetch<{ id: string; uploadUrl: string }>(
    "/api/uploads",
    {
      method: "POST",
      body: { name: file.name, size: file.size, mimeType: mime },
    },
  );
  await put(init.uploadUrl, file, mime, onProgress);
  const { attachment } = await apiFetch<{ attachment: UploadedFile }>(
    `/api/uploads/${init.id}/complete`,
    { method: "POST" },
  );
  return attachment;
}
