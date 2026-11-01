export const PORT = 3100;
export const BASE_URL = `http://localhost:${PORT}`;
export const TEST_DB =
  process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27017/helixdesk_e2e";

export const USERS = {
  admin: {
    name: "Ada Admin",
    email: "admin@e2e.test",
    password: "e2e-admin-pass",
    role: "admin",
  },
  agent: {
    name: "Leo Agent",
    email: "agent@e2e.test",
    password: "e2e-agent-pass",
    role: "agent",
  },
  customer: {
    name: "Cora Customer",
    email: "customer@e2e.test",
    password: "e2e-customer-pass",
    role: "customer",
  },
  other: {
    name: "Otto Other",
    email: "other@e2e.test",
    password: "e2e-other-pass",
    role: "customer",
  },
} as const;

export const AUTH_DIR = "tests/e2e/.auth";
export const authFile = (role: "admin" | "agent" | "customer") =>
  `${AUTH_DIR}/${role}.json`;

/** Environment for the app under test. It never touches your development database or uploads. */
export const SERVER_ENV: Record<string, string> = {
  NODE_ENV: "production",
  MONGODB_URI: TEST_DB,
  AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-0123456789abcdef",
  AUTH_TRUST_HOST: "true",
  AUTH_URL: BASE_URL,
  APP_URL: BASE_URL,
  APP_TIMEZONE: "UTC",
  EMAIL_DRIVER: "console",
  STORAGE_DRIVER: "local",
  UPLOAD_DIR: ".uploads-e2e",
  ALLOW_SIGNUP: "true",
};
