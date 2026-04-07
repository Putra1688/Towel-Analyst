import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { getSheet, getLoadedDoc } = await import("@/lib/google-sheets");
        const sheet = await getSheet("users");
        
        if (!sheet) {
          const doc = await getLoadedDoc();
          console.error("Sheet 'users' not found! Available sheets:", doc.sheetsByIndex.map((s: any) => s.title));
          return null;
        }
        
        const rows = await sheet.getRows();
        
        // Extract the prefix from email/username (e.g., 'coach' from 'coach@towell.com')
        const inputUsername = (credentials?.email || "").split("@")[0].trim();
        const inputPassword = (credentials?.password || "").trim();

        console.log("Login Trial:", { inputUsername, inputPassword });

        const userRow = rows.find((row) => {
          const data = row.toObject();
          return (
            String(data.Username).trim() === inputUsername && 
            String(data.Password).trim() === inputPassword
          );
        });

        if (userRow) {
          const user = userRow.toObject();
          return {
            id: user.User_ID,
            name: user.Nama,
            email: user.Username, 
            role: user.Role,
            userId: user.User_ID,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = (user as any).userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "any-secret-for-now",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
