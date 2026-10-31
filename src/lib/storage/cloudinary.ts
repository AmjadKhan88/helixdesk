import { v2 as cloudinary } from "cloudinary";
import type { StorageDriver } from "./types";

function env(name: string) {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is required when STORAGE_DRIVER=cloudinary`);
  return value;
}

const isNotFound = (e: unknown) => {
  const err = e as { http_code?: number; error?: { http_code?: number } };
  return err?.http_code === 404 || err?.error?.http_code === 404;
};

export function createCloudinaryDriver(): StorageDriver {
  const cloudName = env("CLOUDINARY_CLOUD_NAME");
  const apiKey = env("CLOUDINARY_API_KEY");
  const apiSecret = env("CLOUDINARY_API_SECRET");
  const folder = process.env.CLOUDINARY_FOLDER || "helixdesk";

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  // Raw + authenticated: stored as-is, and only reachable with a signed URL that only this server creates
  const asset = {
    resource_type: "raw" as const,
    type: "authenticated" as const,
  };
  const publicId = (key: string) => `${folder}/${key}`; // raw public ids keep their extension, e.g. helixdesk/<uuid>.png
  const deliveryUrl = (key: string) =>
    cloudinary.url(publicId(key), { ...asset, sign_url: true, secure: true });

  async function fetchAsset(key: string) {
    const res = await fetch(deliveryUrl(key), { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) {
      // 401 on a PDF usually means "Allow delivery of PDF and ZIP files" is still off in Settings > Security
      console.error(
        `[cloudinary] ${res.status} reading ${key}: ${res.headers.get("x-cld-error") ?? "no details"}`,
      );
      return null;
    }
    return res;
  }

  return {
    // The browser uploads straight to Cloudinary with a signature only we can make
    async prepareUpload(key) {
      const params = {
        public_id: publicId(key),
        timestamp: String(Math.round(Date.now() / 1000)),
        type: asset.type,
      };
      const signature = cloudinary.utils.api_sign_request(params, apiSecret);
      return {
        method: "POST" as const,
        url: `https://api.cloudinary.com/v1_1/${cloudName}/${asset.resource_type}/upload`,
        fields: { ...params, api_key: apiKey, signature },
      };
    },

    async put(key, body) {
      await new Promise<void>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { public_id: publicId(key), overwrite: false, ...asset },
            (err) => (err ? reject(err) : resolve()),
          )
          .end(body);
      });
    },

    // The Admin API reports the size Cloudinary actually stored
    async head(key) {
      try {
        const r = await cloudinary.api.resource(publicId(key), asset);
        return { size: Number(r.bytes) };
      } catch (e) {
        if (isNotFound(e)) return null;
        throw e;
      }
    },

    async readHead(key, bytes) {
      const res = await fetchAsset(key);
      if (!res?.body) return null;
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (total < bytes) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
      }
      await reader.cancel().catch(() => {}); // we only needed the first bytes
      return Buffer.concat(chunks).subarray(0, bytes);
    },

    async stream(key) {
      return (await fetchAsset(key))?.body ?? null;
    },

    async remove(key) {
      await cloudinary.uploader.destroy(publicId(key), {
        ...asset,
        invalidate: true,
      });
    },
  };
}
