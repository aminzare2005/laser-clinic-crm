"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { success: false, error: "نام کاربری و کلمه عبور الزامی هستند" };
    }

    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "نام کاربری یا کلمه عبور اشتباه است" };
        default:
          return { success: false, error: "خطا در احراز هویت" };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
