import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";
import { Upload } from "@/models/Upload";

export const DELETE = route(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const user = await requireRole();
    await connectDB();
    const upload = await Upload.findOne({
      _id: objectId.parse((await params).id),
      uploader: user.id,
      message: null,
    });
    if (upload) {
      await getStorage()
        .remove(upload.key)
        .catch(() => {});
      await upload.deleteOne();
    }
    return NextResponse.json({ ok: true });
  },
);
