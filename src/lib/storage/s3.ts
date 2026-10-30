import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageDriver } from "./types";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required when STORAGE_DRIVER=s3`);
  return v;
}

const isMissing = (e: unknown) =>
  ["NoSuchKey", "NotFound"].includes((e as { name?: string })?.name ?? "");

export function createS3Driver(): StorageDriver {
  const Bucket = env("S3_BUCKET");
  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: env("S3_ACCESS_KEY_ID"),
      secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
    },
  });

  return {
    presignPut: (Key, ContentType) =>
      getSignedUrl(client, new PutObjectCommand({ Bucket, Key, ContentType }), {
        expiresIn: 600,
      }),

    async put(Key, Body, ContentType) {
      await client.send(
        new PutObjectCommand({ Bucket, Key, Body, ContentType }),
      );
    },
    async head(Key) {
      try {
        const r = await client.send(new HeadObjectCommand({ Bucket, Key }));
        return { size: r.ContentLength ?? 0 };
      } catch (e) {
        if (isMissing(e)) return null;
        throw e;
      }
    },
    async readHead(Key, bytes) {
      try {
        const r = await client.send(
          new GetObjectCommand({ Bucket, Key, Range: `bytes=0-${bytes - 1}` }),
        );
        return Buffer.from(await r.Body!.transformToByteArray());
      } catch (e) {
        if (isMissing(e)) return null;
        throw e;
      }
    },
    async stream(Key) {
      try {
        const r = await client.send(new GetObjectCommand({ Bucket, Key }));
        return r.Body!.transformToWebStream() as unknown as ReadableStream;
      } catch (e) {
        if (isMissing(e)) return null;
        throw e;
      }
    },
    async remove(Key) {
      await client.send(new DeleteObjectCommand({ Bucket, Key }));
    },
  };
}
