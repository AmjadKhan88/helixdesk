export interface StorageDriver {
  /** Present when the browser can upload straight to storage. Absent means the app receives the bytes. */
  presignPut?(key: string, contentType: string, size: number): Promise<string>;
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  head(key: string): Promise<{ size: number } | null>;
  readHead(key: string, bytes: number): Promise<Buffer | null>;
  stream(key: string): Promise<ReadableStream | null>;
  remove(key: string): Promise<void>;
}
