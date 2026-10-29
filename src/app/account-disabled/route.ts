import { connection } from "next/server";
import { signOut } from "@/auth";

export async function GET() {
  await connection();
  await signOut({ redirectTo: "/login?notice=deactivated" });
}
