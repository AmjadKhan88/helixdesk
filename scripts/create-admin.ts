import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

async function main() {
  const [email, ...rest] = process.argv.slice(2);
  const name = rest.join(" ");
  if (!email || !name) {
    console.error('Usage: npm run admin:create -- you@example.com "Your Name"');
    process.exit(1);
  }

  await connectDB();
  const token = randomBytes(32).toString("base64url");
  const user =
    (await User.findOne({ email: email.toLowerCase() })) ??
    new User({ email: email.toLowerCase() });
  user.name = name;
  user.role = "admin";
  user.isActive = true;
  user.inviteTokenHash = createHash("sha256").update(token).digest("hex");
  user.inviteExpiresAt = new Date(Date.now() + 7 * 86_400_000);
  await user.save();

  console.log(
    `Admin ready. Open this link to choose a password:\n${process.env.APP_URL ?? "http://localhost:3000"}/invite/${token}`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
