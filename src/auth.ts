import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb, schema } from "@/db";

/**
 * Sign-in with Google or Microsoft, and nothing else.
 *
 * No passwords, by choice. A student project that stores password hashes is a
 * student project that will one day leak them; delegating to two identity
 * providers every university already issues removes the whole category. It
 * also means no reset-email flow to build.
 *
 * Each provider is only registered when its credentials are present, so the
 * app builds and runs with none of them set - it simply has no sign-in button.
 */

const providers = (): Provider[] => {
  const list: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    list.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
  ) {
    list.push(
      MicrosoftEntraID({
        clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
        clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
        // "common" lets both personal Outlook accounts and university
        // Microsoft accounts in. A tenant-specific id would lock it to one
        // university, which is the opposite of the point.
        issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? undefined,
      }),
    );
  }

  return list;
};

export const authProviderNames = (): string[] =>
  providers().map((provider) =>
    typeof provider === "function" ? "unknown" : provider.id,
  );

export const authConfigured = (): boolean => providers().length > 0;

const db = getDb();

export const authConfig: NextAuthConfig = {
  // Without a database Auth.js has nowhere to put a user, so the adapter is
  // only attached when one exists.
  adapter:
    db === null
      ? undefined
      : DrizzleAdapter(db, {
          usersTable: schema.users,
          accountsTable: schema.accounts,
          sessionsTable: schema.sessions,
          verificationTokensTable: schema.verificationTokens,
        }),
  providers: providers(),
  session: { strategy: db === null ? "jwt" : "database" },
  pages: { signIn: "/account" },
  callbacks: {
    session({ session, user }) {
      // The user id is what every row is keyed by, so it has to reach the
      // client session rather than only the email.
      if (user?.id) session.user.id = user.id;
      return session;
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
