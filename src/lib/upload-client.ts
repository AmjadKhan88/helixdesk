import { apiFetch, ApiRequestError, errorMessage } from "@/lib/api-client";
import { ALLOWED_MIME, MAX_BYTES, mimeFromFile } from "@/lib/uploads";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
};

type Target = {
  method: "PUT" | "POST";
  url: string;
  fields?: Record<string, string>;
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

function send(
  target: Target,
  file: File,
  mime: string,
  onProgress: (pct: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(target.method, target.url);

    let body: XMLHttpRequestBodyInit;
    if (target.fields) {
      // Cloudinary: signed form fields first, the file last
      const form = new FormData();
      Object.entries(target.fields).forEach(([k, v]) => form.append(k, v));
      form.append("file", file);
      body = form; // the browser sets the multipart Content-Type itself
    } else {
      xhr.setRequestHeader("Content-Type", mime); // S3 / local: raw bytes
      body = file;
    }

    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let detail = "";
      try {
        detail = JSON.parse(xhr.responseText)?.error?.message ?? "";
      } catch {}
      reject(
        new Error(
          detail
            ? `Upload failed: ${detail}`
            : "Upload failed. Please try again.",
        ),
      );
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(body);
  });
}

/** 1) ask  2) send the bytes  3) let the server verify them */
export async function uploadFile(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadedFile> {
  const mime = mimeFromFile(file);
  const init = await apiFetch<{ id: string; target: Target }>("/api/uploads", {
    method: "POST",
    body: { name: file.name, size: file.size, mimeType: mime },
  });
  await send(init.target, file, mime, onProgress);
  const { attachment } = await apiFetch<{ attachment: UploadedFile }>(
    `/api/uploads/${init.id}/complete`,
    { method: "POST" },
  );
  return attachment;
}
