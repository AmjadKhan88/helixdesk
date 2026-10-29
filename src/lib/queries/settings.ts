import "server-only";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/Settings";

export async function getSettings() {
  await connectDB();
  const s = await Settings.findById("workspace").lean();
  return { firstResponseTargetMinutes: s?.firstResponseTargetMinutes ?? 240 };
}
