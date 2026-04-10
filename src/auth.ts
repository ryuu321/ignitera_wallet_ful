import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "ignitera_emergency_secret_fallback_999",
  providers: [
    Credentials({
      name: "Ignitera Login",
      credentials: {
        username: { label: "Anonymous Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        const user = await prisma.user.findUnique({
          where: { anonymousName: credentials.username as string },
        });

        if (!user) return null;

        return {
          id: user.id,
          name: user.anonymousName,
          role: user.role, // Custom field
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
