import "server-only";
import { headers } from "next/headers";

/** On Vercel, x-forwarded-for is set by the platform. Elsewhere, only trust it behind your own proxy. */
export function ipFrom(h: Headers) {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export async function clientIp() {
  return ipFrom(await headers());
}
