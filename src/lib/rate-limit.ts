import "server-only";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { RateLimit } from "@/models/RateLimit";

/** Fixed-window counter: at most `limit` hits per `windowSec` for this name and id. */
export async function rateLimit(
  name: string,
  id: string,
  limit: number,
  windowSec: number,
) {
  await connectDB();
  const nowSec = Math.floor(Date.now() / 1000);
  const windowIndex = Math.floor(nowSec / windowSec);
  const resetAt = (windowIndex + 1) * windowSec;

  const doc = await RateLimit.findOneAndUpdate(
    { _id: `${name}:${id}:${windowIndex}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((resetAt + 60) * 1000) },
    },
    { upsert: true, returnDocument: "after" },
  ).lean();

  return {
    ok: (doc?.count ?? 1) <= limit,
    retryAfter: Math.max(1, resetAt - nowSec),
  };
}

/** For API routes: throws a 429 with a Retry-After header. */
export async function enforceLimit(
  name: string,
  id: string,
  limit: number,
  windowSec: number,
  message = "Too many requests. Please try again later.",
) {
  const r = await rateLimit(name, id, limit, windowSec);
  if (!r.ok) throw new ApiError(429, message, r.retryAfter);
}
