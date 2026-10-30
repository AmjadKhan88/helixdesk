import "server-only";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

export async function getCategoryOptions() {
  await connectDB();
  const items = await Category.find().sort({ name: 1 }).select("name").lean();
  return items.map((c) => ({ id: String(c._id), name: c.name }));
}
