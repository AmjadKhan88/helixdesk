import type { NextAuthConfig } from "next-auth";
import { homeFor } from "@/lib/constants";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  providers: [], // added in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    // Route protection rules, run by the proxy on every page request
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const path = nextUrl.pathname;

      if (path === "/account-disabled" || path.startsWith("/invite"))
        return true;

      if (path === "/login") {
        return user
          ? Response.redirect(new URL(homeFor(user.role), nextUrl))
          : true;
      }
      if (path === "/")
        return user
          ? Response.redirect(new URL(homeFor(user.role), nextUrl))
          : false;

      if (!user) return false; // → /login?callbackUrl=...

      const isStaff = user.role !== "customer";
      if (path.startsWith("/admin") && user.role !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (path.startsWith("/portal") && isStaff) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (!path.startsWith("/portal") && !isStaff) {
        return Response.redirect(new URL("/portal", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
