const env = process.env;
const checks: [string, boolean, string][] = [
  [
    "AUTH_SECRET is at least 32 characters",
    (env.AUTH_SECRET ?? "").length >= 32,
    "Run: npx auth secret (use a different value from development)",
  ],
  [
    "APP_URL is an https address",
    /^https:\/\//.test(env.APP_URL ?? ""),
    "Set APP_URL to your production domain",
  ],
  [
    "MONGODB_URI is not local",
    !/127\.0\.0\.1|localhost/.test(env.MONGODB_URI ?? "") && !!env.MONGODB_URI,
    "Use MongoDB Atlas, and allow Vercel in its network access list",
  ],
  [
    "STORAGE_DRIVER is cloudinary or s3",
    ["cloudinary", "s3"].includes(env.STORAGE_DRIVER ?? ""),
    "Local disk does not work on Vercel",
  ],
  [
    "Cloudinary credentials are set",
    env.STORAGE_DRIVER !== "cloudinary" ||
      !!(
        env.CLOUDINARY_CLOUD_NAME &&
        env.CLOUDINARY_API_KEY &&
        env.CLOUDINARY_API_SECRET
      ),
    "Set the three CLOUDINARY_* variables",
  ],
  [
    "EMAIL_DRIVER is smtp or resend",
    ["smtp", "resend"].includes(env.EMAIL_DRIVER ?? ""),
    "console only prints to logs",
  ],
  [
    "EMAIL_FROM is set",
    !!env.EMAIL_FROM,
    'Example: "HelixDesk <noreply@yourdomain.com>"',
  ],
  ["APP_TIMEZONE is set", !!env.APP_TIMEZONE, "Example: Asia/Karachi"],
];

let failed = 0;
for (const [label, ok, fix] of checks) {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n      → ${fix}`}`,
  );
  if (!ok) failed++;
}
console.log(
  failed
    ? `\n${failed} problem(s) to fix before deploying.`
    : "\nLooks ready to deploy.",
);
process.exit(failed ? 1 : 0);
