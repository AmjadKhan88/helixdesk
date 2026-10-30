import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { Upload } from "@/models/Upload";

async function main() {
  await connectDB();
  const store = getStorage();
  const stale = await Upload.find({
    message: null,
    createdAt: { $lt: new Date(Date.now() - 24 * 3_600_000) },
  });

  for (const u of stale) {
    await store
      .remove(u.key)
      .catch((e) => console.warn("Could not remove", u.key, e));
    await u.deleteOne();
  }
  console.log(`Removed ${stale.length} unused upload(s).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
