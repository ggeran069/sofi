import type { NextAuthConfig } from "next-auth";

// Base NextAuth config shared between the server auth instance
// (src/lib/auth.ts) and the middleware (src/middleware.ts). It must stay
// free of database imports so middleware can run on Cloudflare Workers.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
