import type { NextRequest } from "next/server";
import { ApiError, route } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/session";
import { objectId } from "@/lib/validations/ticket";
import { Message } from "@/models/Message";
import { Ticket } from "@/models/Ticket";
import { Upload } from "@/models/Upload";

export const GET = route(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireRole();
    await connectDB();

    const upload = await Upload.findOne({
      _id: objectId.parse((await params).id),
      status: "ready",
    }).lean();
    if (!upload) throw new ApiError(404, "File not found");

    // Who may read it? Everything below answers 404 so that file ids can't be probed
    if (!upload.message) {
      if (String(upload.uploader) !== user.id)
        throw new ApiError(404, "File not found"); // not sent yet: only the uploader
    } else if (user.role === "customer") {
      const message = await Message.findById(upload.message)
        .select("ticket isInternal")
        .lean();
      if (!message || message.isInternal)
        throw new ApiError(404, "File not found");
      if (!(await Ticket.exists({ _id: message.ticket, requester: user.id })))
        throw new ApiError(404, "File not found");
    }

    const stream = await getStorage().stream(upload.key);
    if (!stream) throw new ApiError(404, "File not found");

    // Images show inline. PDFs always download.
    const inline =
      upload.mimeType.startsWith("image/") &&
      !req.nextUrl.searchParams.has("download");
    const ascii = upload.name
      .replace(/[^\x20-\x7e]/g, "_")
      .replace(/["\\]/g, "_");

    return new Response(stream, {
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Length": String(upload.size),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(upload.name)}`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "private, max-age=3600",
      },
    });
  },
);
