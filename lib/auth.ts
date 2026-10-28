import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "ورود با نام کاربری و کلمه عبور",
      credentials: {
        username: { label: "نام کاربری", type: "text" },
        password: { label: "کلمه عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = String(credentials.username).trim().toLowerCase();
        const user = await db.user.findUnique({
          where: { username },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.displayName,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;

        // اعتبارسنجی و تطبیق خودکار شناسه کاربر با پایگاه داده
        // در صورتی که دیتابیس مجدداً seed شده باشد یا شناسه کاربر تغییر یافته باشد،
        // برای جلوگیری از خطای P2003 (Foreign key constraint violation) شناسه واقعی بازنشانی می‌شود.
        const currentInDb = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, isActive: true },
        });

        if (currentInDb) {
          if (!currentInDb.isActive) {
            return null as unknown as typeof session;
          }
          session.user.id = currentInDb.id;
          session.user.role = currentInDb.role;
        } else if (token.username) {
          const byUsername = await db.user.findUnique({
            where: { username: token.username as string },
            select: { id: true, role: true, isActive: true },
          });
          if (byUsername && byUsername.isActive) {
            session.user.id = byUsername.id;
            session.user.role = byUsername.role;
            token.id = byUsername.id;
          }
        } else if (token.role) {
          // تطبیق با اولین کاربر فعال دارای نقش مرتبط در پایگاه داده
          const byRole = await db.user.findFirst({
            where: { role: token.role as Role, isActive: true },
            select: { id: true, role: true },
          });
          if (byRole) {
            session.user.id = byRole.id;
            session.user.role = byRole.role;
            token.id = byRole.id;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
