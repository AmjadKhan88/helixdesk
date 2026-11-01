import { v2 as cloudinary } from "cloudinary";

async function main() {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  console.log(`STORAGE_DRIVER = ${driver}`);
  if (driver !== "cloudinary") {
    console.log("Nothing to check for this driver.");
    return;
  }

  const cfg = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error("Missing in .env.local:", missing.join(", "));
    process.exit(1);
  }
  if (
    cfg.cloud_name === "your-cloud-name" ||
    cfg.api_secret === "your-api-secret"
  ) {
    console.error(
      "These are still the placeholder values. Paste your real ones from the Cloudinary Console.",
    );
    process.exit(1);
  }

  cloudinary.config({ ...cfg, secure: true });
  try {
    await cloudinary.api.ping();
    console.log("Cloudinary credentials are valid.");
  } catch (e) {
    console.error(
      "Cloudinary rejected the credentials:",
      (e as { error?: { message?: string } }).error?.message ?? e,
    );
    process.exit(1);
  }
}

main();
