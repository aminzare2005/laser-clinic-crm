"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUserAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به ایجاد کاربر جدید است" };
    }

    const rawData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      displayName: formData.get("displayName") as string,
      role: formData.get("role") as "MANAGER" | "SECRETARY" | "OPERATOR",
    };

    const validated = userCreateSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "اطلاعات کاربر نامعتبر است" };
    }

    const existing = await db.user.findUnique({
      where: { username: validated.data.username },
    });

    if (existing) {
      return { success: false, error: "این نام کاربری قبلاً استفاده شده است" };
    }

    const passwordHash = await bcrypt.hash(validated.data.password, 10);

    const user = await db.user.create({
      data: {
        username: validated.data.username,
        passwordHash,
        displayName: validated.data.displayName,
        role: validated.data.role,
      },
    });

    revalidatePath("/manager/users");
    return { success: true, data: { id: user.id, username: user.username, role: user.role } };
  } catch (error) {
    console.error("Create User Error:", error);
    return { success: false, error: "خطا در ثبت کاربر جدید" };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به ویرایش پرسنل است" };
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "کاربر یافت نشد" };

    const rawData = {
      username: formData.get("username") as string,
      password: (formData.get("password") as string) || "",
      displayName: formData.get("displayName") as string,
      role: formData.get("role") as "MANAGER" | "SECRETARY" | "OPERATOR",
    };

    const validated = userUpdateSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "اطلاعات ویرایش نامعتبر است" };
    }

    // اگر نام کاربری تغییر کرده، چک تکراری نبودن
    if (validated.data.username !== user.username) {
      const existing = await db.user.findUnique({
        where: { username: validated.data.username },
      });
      if (existing && existing.id !== id) {
        return { success: false, error: "این نام کاربری توسط شخص دیگری انتخاب شده است" };
      }
    }

    // اگر رمز جدید وارد شده بود، هش جدید ساخته می‌شود
    let updateData: {
      username: string;
      displayName: string;
      role: "MANAGER" | "SECRETARY" | "OPERATOR";
      passwordHash?: string;
    } = {
      username: validated.data.username,
      displayName: validated.data.displayName,
      role: validated.data.role,
    };

    if (validated.data.password && validated.data.password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(validated.data.password, 10);
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/manager/users");
    return { success: true, data: { id: updated.id, username: updated.username, displayName: updated.displayName } };
  } catch (error) {
    console.error("Update User Error:", error);
    return { success: false, error: "خطا در ویرایش اطلاعات کاربر" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به حذف کاربر است" };
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "کاربر یافت نشد" };

    if (user.id === session.user.id) {
      return { success: false, error: "نمی‌توانید حساب کاربری خودتان را حذف نمایید" };
    }

    // بررسی آیا ویزیت یا مراجعی توسط این کاربر ثبت/درمان شده است
    const [visitCount, createdPatientCount] = await Promise.all([
      db.visit.count({ where: { OR: [{ operatorId: id }, { createdById: id }] } }),
      db.patient.count({ where: { createdById: id } }),
    ]);

    if (visitCount > 0 || createdPatientCount > 0) {
      // جهت جلوگیری از خرابی داده‌های تاریخی، کاربر به جای حذف فیزیکی غیرفعال می‌شود
      await db.user.update({
        where: { id },
        data: { isActive: false },
      });
      revalidatePath("/manager/users");
      return {
        success: true,
        message: "به دلیل ثبت سوابق بیمار توسط این پرسنل، حساب وی به حالت «غیرفعال» تغییر یافت.",
      };
    }

    await db.user.delete({ where: { id } });
    revalidatePath("/manager/users");
    return { success: true, message: "کاربر با موفقیت حذف گردید." };
  } catch (error) {
    console.error("Delete User Error:", error);
    return { success: false, error: "خطا در حذف کاربر" };
  }
}

export async function toggleUserAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "دسترسی غیرمجاز" };
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "کاربر یافت نشد" };

    if (user.id === session.user.id) {
      return { success: false, error: "نمی‌توانید حساب کاربری خودتان را غیرفعال کنید" };
    }

    const updated = await db.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/manager/users");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Toggle User Error:", error);
    return { success: false, error: "خطا در تغییر وضعیت کاربر" };
  }
}
