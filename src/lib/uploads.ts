export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 5;
export const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];
export const ACCEPT = ALLOWED_MIME.join(",");

const BY_EXTENSION: Record<string, AllowedMime> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** Browsers sometimes leave file.type empty, so fall back to the extension */
export function mimeFromFile(file: { name: string; type: string }) {
  if ((ALLOWED_MIME as readonly string[]).includes(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[ext] ?? file.type;
}

/** No path separators or control characters, and a sane length */
export function cleanName(name: string) {
  return (
    name
      .replace(/[\\/\u0000-\u001f]/g, "_")
      .trim()
      .slice(0, 200) || "file"
  );
}

/** Identify a file by its first bytes, never by its name or the browser's claim */
export function sniffType(b: Uint8Array): AllowedMime | null {
  const starts = (...bytes: number[]) => bytes.every((v, i) => b[i] === v);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
    return "image/png";
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (
    starts(0x47, 0x49, 0x46, 0x38) &&
    (b[4] === 0x37 || b[4] === 0x39) &&
    b[5] === 0x61
  )
    return "image/gif";
  if (
    starts(0x52, 0x49, 0x46, 0x46) &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return "image/webp";
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf";
  return null;
}

const EXTENSION: Record<AllowedMime, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
export const extensionFor = (mime: AllowedMime) => EXTENSION[mime];
