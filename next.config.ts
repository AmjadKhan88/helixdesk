import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** Where the browser is allowed to send uploads directly */
function uploadHosts(): string[] {
  if (process.env.STORAGE_DRIVER === "cloudinary")
    return ["https://api.cloudinary.com"];
  if (process.env.STORAGE_DRIVER === "s3") {
    try {
      const host = process.env.S3_ENDPOINT
        ? new URL(process.env.S3_ENDPOINT).host
        : "amazonaws.com";
      return [`https://${host}`, `https://*.${host}`];
    } catch {
      return ["https://*.amazonaws.com"];
    }
  }
  return [];
}

// 'unsafe-inline' is needed for the inline scripts Next.js and the theme script emit.
// A nonce-based policy is stricter but forces every page to render dynamically.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${uploadHosts().join(" ")}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
    ];
    return [
      {
        source: "/(.*)",
        headers: isProd
          ? [
              ...base,
              {
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains",
              },
              { key: "Content-Security-Policy", value: csp },
            ]
          : base,
      },
    ];
  },
};

export default nextConfig;
