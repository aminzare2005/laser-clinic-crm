"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceSchema, serviceUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createServiceAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به تعریف خدمات است" };
    }

    const rawData = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: formData.get("price") as unknown as number,
      description: (formData.get("description") as string) || undefined,
    };

    const validated = serviceSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "اطلاعات خدمت نامعتبر است" };
    }

    const service = await db.service.create({
      data: validated.data,
    });

    revalidatePath("/manager/services");
    revalidatePath("/secretary/patients");
    return { success: true, data: service };
  } catch (error) {
    console.error("Create Service Error:", error);
    return { success: false, error: "خطا در ایجاد خدمت جدید" };
  }
}

export async function updateServiceAction(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به ویرایش خدمات است" };
    }

    const rawData = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: formData.get("price") as unknown as number,
      description: (formData.get("description") as string) || undefined,
    };

    const validated = serviceUpdateSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "اطلاعات ویرایش نامعتبر است" };
    }

    const updated = await db.service.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/manager/services");
    revalidatePath("/secretary/patients");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update Service Error:", error);
    return { success: false, error: "خطا در ویرایش خدمت" };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "فقط مدیر مجاز به حذف خدمت است" };
    }

    // بررسی آیا ویزیت مرتبطی با این خدمت ثبت شده است یا خیر
    const visitCount = await db.visit.count({ where: { serviceId: id } });

    if (visitCount > 0) {
      // جهت حفظ یکپارچگی سوابق بالینی بیماران، خدمت غیرفعال می‌شود
      await db.service.update({
        where: { id },
        data: { isActive: false },
      });
      revalidatePath("/manager/services");
      revalidatePath("/secretary/patients");
      return {
        success: true,
        message: "به دلیل وجود سابقه مراجعین با این خدمت، وضعیت آن به «غیرفعال» تغییر یافت.",
      };
    }

    // اگر هیچ ویزیتی به این خدمت متصل نباشد، مستقیماً حذف می‌شود
    await db.service.delete({ where: { id } });

    revalidatePath("/manager/services");
    revalidatePath("/secretary/patients");
    return { success: true, message: "خدمت با موفقیت حذف گردید." };
  } catch (error) {
    console.error("Delete Service Error:", error);
    return { success: false, error: "خطا در حذف خدمت" };
  }
}

export async function toggleServiceAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MANAGER") {
      return { success: false, error: "دسترسی غیرمجاز" };
    }

    const current = await db.service.findUnique({ where: { id } });
    if (!current) return { success: false, error: "خدمت یافت نشد" };

    const updated = await db.service.update({
      where: { id },
      data: { isActive: !current.isActive },
    });

    revalidatePath("/manager/services");
    revalidatePath("/secretary/patients");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Toggle Service Error:", error);
    return { success: false, error: "خطا در تغییر وضعیت خدمت" };
  }
}
