import { NextResponse, type NextRequest } from "next/server";
import { ApiError, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { MAX_BYTES, sniffType } from "@/lib/uploads";
import { objectId } from "@/lib/validations/ticket";
import { Upload } from "@/models/Upload";

export const POST = route(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const user = await requireRole();
    await connectDB();
    const upload = await Upload.findOne({
      _id: objectId.parse((await params).id),
      uploader: user.id,
      status: "pending",
    });
    if (!upload) throw new ApiError(404, "Upload not found");

    const store = getStorage();
    const reject = async (message: string): Promise<never> => {
      await store.remove(upload.key).catch(() => {});
      await upload.deleteOne();
      throw new ApiError(400, message);
    };

    const head = await store.head(upload.key);
    if (!head) return reject("The upload did not finish. Please try again.");
    if (head.size !== upload.size || head.size > MAX_BYTES)
      return reject("The uploaded file does not match what was declared.");

    const detected = sniffType(
      (await store.readHead(upload.key, 16)) ?? new Uint8Array(),
    );
    if (detected !== upload.mimeType) {
      return reject(
        "This file's contents do not match its type. Only PNG, JPEG, GIF, WebP, or PDF files are allowed.",
      );
    }

    upload.status = "ready";
    await upload.save();

    return NextResponse.json({
      attachment: {
        id: String(upload._id),
        name: upload.name,
        size: upload.size,
        mimeType: upload.mimeType,
        url: `/api/files/${upload._id}`,
      },
    });
  },
);
