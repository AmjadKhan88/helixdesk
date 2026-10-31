import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, readJson, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { Upload } from "@/models/Upload";
import {
  ALLOWED_MIME,
  MAX_BYTES,
  cleanName,
  extensionFor,
} from "@/lib/uploads";

const initSchema = z.object({
  name: z.string().trim().min(1).max(200),
  size: z
    .number()
    .int()
    .positive("This file is empty")
    .max(MAX_BYTES, "Files can be up to 10 MB"),
  mimeType: z.enum(ALLOWED_MIME, {
    message: "Only PNG, JPEG, GIF, WebP, or PDF files",
  }),
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireRole();
  const input = await readJson(req, initSchema);
  await connectDB();

  // Stops someone filling storage with abandoned uploads
  const pending = await Upload.countDocuments({
    uploader: user.id,
    status: "pending",
    createdAt: { $gte: new Date(Date.now() - 3_600_000) },
  });
  if (pending >= 20)
    throw new ApiError(
      429,
      "Too many uploads in progress. Try again in a bit.",
    );

  const key = `${randomUUID()}.${extensionFor(input.mimeType)}`;
  const upload = await Upload.create({
    key,
    name: cleanName(input.name),
    size: input.size,
    mimeType: input.mimeType,
    uploader: user.id,
  });

  const store = getStorage();
  const target = store.prepareUpload
    ? await store.prepareUpload(key, input.mimeType, input.size)
    : { method: "PUT" as const, url: `/api/uploads/${upload._id}/content` }; // local disk: the app receives the bytes

  return NextResponse.json({ id: String(upload._id), target }, { status: 201 });
});
