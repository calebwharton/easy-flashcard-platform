import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-auth-secret",
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "missing-google-client-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "missing-google-client-secret",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "missing-github-client-id",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "missing-github-client-secret",
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
});
