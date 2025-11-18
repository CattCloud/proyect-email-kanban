// src/lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  // En desarrollo avisamos si faltan variables de entorno para Google OAuth.
  // eslint-disable-next-line no-console
  console.warn(
    "[auth-options] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos. " +
      "Configura las variables de entorno para habilitar el login con Google."
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = (profile as { email?: string }).email ?? token.email;
        token.name = (profile as { name?: string }).name ?? token.name;
        token.picture = (profile as { picture?: string }).picture ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};