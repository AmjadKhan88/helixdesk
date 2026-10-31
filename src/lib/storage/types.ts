export type UploadTarget = {
  method: "PUT" | "POST";
  url: string;
  /** Present for POST. The browser sends these as form fields, then the file last. */
  fields?: Record<string, string>;
};

export interface StorageDriver {
  /** Present when the browser can upload straight to storage. Absent means the app receives the bytes. */
  prepareUpload?(
    key: string,
    contentType: string,
    size: number,
  ): Promise<UploadTarget>;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  head(key: string): Promise<{ size: number } | null>;
  readHead(key: string, bytes: number): Promise<Buffer | null>;
  stream(key: string): Promise<ReadableStream | null>;
  remove(key: string): Promise<void>;
}
