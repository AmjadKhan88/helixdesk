import { NextResponse, type NextRequest } from "next/server";
import { ApiError, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { MAX_BYTES } from "@/lib/uploads";
import { objectId } from "@/lib/validations/ticket";
import { Upload } from "@/models/Upload";

export const PUT = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireRole();
    const store = getStorage();
    if (store.prepareUpload)
      throw new ApiError(400, "This storage accepts direct uploads only.");

    await connectDB();
    const upload = await Upload.findOne({
      _id: objectId.parse((await params).id),
      uploader: user.id,
      status: "pending",
    });
    if (!upload) throw new ApiError(404, "Upload not found");

    if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES)
      throw new ApiError(413, "Files can be up to 10 MB");
    const bytes = Buffer.from(await req.arrayBuffer());
    if (bytes.length !== upload.size)
      throw new ApiError(
        400,
        "The file size does not match what was declared.",
      );

    await store.put(upload.key, bytes, upload.mimeType);
    return new NextResponse(null, { status: 204 });
  },
);
