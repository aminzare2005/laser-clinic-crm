"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { treatmentLogSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function acceptVisitAction(visitId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "OPERATOR" && session.user.role !== "MANAGER")) {
      return { success: false, error: "فقط اپراتور یا مدیر مجاز به پذیرش بیمار هستند" };
    }

    const visit = await db.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      return { success: false, error: "ویزیت یافت نشد" };
    }

    if (visit.status !== "WAITING") {
      return { success: false, error: "این بیمار قبلاً تعیین وضعیت شده است" };
    }

    // اعتبارسنجی شناسه اپراتور جهت جلوگیری از نقض کلید خارجی
    let opId = session.user.id;
    const opInDb = await db.user.findUnique({
      where: { id: opId },
      select: { id: true },
    });

    if (!opInDb) {
      const fallbackOp = await db.user.findFirst({
        where: { role: { in: ["OPERATOR", "MANAGER"] }, isActive: true },
        select: { id: true },
      });
      if (!fallbackOp) {
        return { success: false, error: "اپراتور معتبری در سیستم یافت نشد. لطفاً مجدداً وارد شوید." };
      }
      opId = fallbackOp.id;
    }

    const updated = await db.visit.update({
      where: { id: visitId },
      data: {
        operatorId: opId,
        acceptedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    revalidatePath("/operator/queue");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Accept Visit Error:", error);
    return { success: false, error: "خطا در پذیرش بیمار" };
  }
}

export async function startVisitAction(visitId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "OPERATOR" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز" };
    }

    const updated = await db.visit.update({
      where: { id: visitId },
      data: {
        startedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    revalidatePath(`/operator/queue/${visitId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Start Visit Error:", error);
    return { success: false, error: "خطا در شروع فرآیند درمان" };
  }
}

export async function finishVisitAction(visitId: string, logData: Record<string, unknown>) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "OPERATOR" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز برای ثبت پایان درمان" };
    }

    const validatedLog = treatmentLogSchema.safeParse(logData);
    const jsonString = validatedLog.success ? JSON.stringify(validatedLog.data) : JSON.stringify(logData);

    const updated = await db.visit.update({
      where: { id: visitId },
      data: {
        finishedAt: new Date(),
        status: "DONE",
        treatmentLog: jsonString,
      },
    });

    revalidatePath("/operator/queue");
    revalidatePath("/secretary/checkout");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Finish Visit Error:", error);
    return { success: false, error: "خطا در پایان درمان" };
  }
}

/** لغو نوبت بیمار در صف انتظار (مثلاً در صورت انصراف مراجع یا خروج از سالن) */
export async function cancelVisitAction(visitId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user || !["MANAGER", "SECRETARY", "OPERATOR"].includes(session.user.role)) {
      return { success: false, error: "دسترسی غیرمجاز" };
    }

    const visit = await db.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });

    if (!visit) {
      return { success: false, error: "نوبت ویزیت یافت نشد" };
    }

    if (visit.status === "DONE" || visit.status === "PAID") {
      return { success: false, error: "امکان لغو نوبتی که درمان آن خاتمه یافته وجود ندارد" };
    }

    const updated = await db.visit.update({
      where: { id: visitId },
      data: {
        status: "CANCELLED",
        treatmentLog: reason ? JSON.stringify({ cancelReason: reason }) : undefined,
      },
    });

    revalidatePath("/operator/queue");
    revalidatePath("/secretary/patients");
    revalidatePath("/secretary/checkout");
    revalidatePath("/manager");
    return {
      success: true,
      message: `نوبت مراجع «${visit.patient.firstName} ${visit.patient.lastName}» با موفقیت لغو شد.`,
      data: updated,
    };
  } catch (error) {
    console.error("Cancel Visit Error:", error);
    return { success: false, error: "خطا در لغو نوبت بیمار" };
  }
}

/** حذف کامل نوبت اشتباه ثبت‌شده از صف انتظار (فقط در وضعیت WAITING) */
export async function deleteWaitingVisitAction(visitId: string) {
  try {
    const session = await auth();
    if (!session?.user || !["MANAGER", "SECRETARY"].includes(session.user.role)) {
      return { success: false, error: "فقط منشی و مدیر مجاز به حذف نوبت از صف هستند" };
    }

    const visit = await db.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });

    if (!visit) {
      return { success: false, error: "نوبت ویزیت یافت نشد" };
    }

    if (visit.status !== "WAITING") {
      return { success: false, error: "فقط نوبت‌های حاضر در صف انتظار امکان حذف دارند" };
    }

    await db.visit.delete({
      where: { id: visitId },
    });

    revalidatePath("/operator/queue");
    revalidatePath("/secretary/patients");
    revalidatePath("/manager");
    return {
      success: true,
      message: `نوبت مراجع «${visit.patient.firstName} ${visit.patient.lastName}» از صف انتظار حذف شد.`,
    };
  } catch (error) {
    console.error("Delete Waiting Visit Error:", error);
    return { success: false, error: "خطا در حذف نوبت از صف" };
  }
}

/** ویرایش نوبت حاضر در صف انتظار (تغییر خدمت درخواستی یا یادداشت مراجع) */
export async function updateWaitingVisitAction(
  visitId: string,
  data: { serviceId: string; notes?: string }
) {
  try {
    const session = await auth();
    if (!session?.user || !["MANAGER", "SECRETARY"].includes(session.user.role)) {
      return { success: false, error: "فقط منشی و مدیر مجاز به ویرایش نوبت صف هستند" };
    }

    const visit = await db.visit.findUnique({
      where: { id: visitId },
      include: { patient: true },
    });

    if (!visit) {
      return { success: false, error: "نوبت ویزیت یافت نشد" };
    }

    if (visit.status !== "WAITING") {
      return { success: false, error: "فقط نوبت‌های حاضر در صف انتظار امکان ویرایش دارند" };
    }

    // بررسی وجود خدمت جدید
    const service = await db.service.findUnique({ where: { id: data.serviceId } });
    if (!service) {
      return { success: false, error: "خدمت جدید انتخاب‌شده معتبر نیست" };
    }

    // به‌روزرسانی خدمت نوبت و یادداشت بیمار
    const [updatedVisit] = await db.$transaction([
      db.visit.update({
        where: { id: visitId },
        data: { serviceId: data.serviceId },
      }),
      db.patient.update({
        where: { id: visit.patientId },
        data: { notes: data.notes ?? visit.patient.notes },
      }),
    ]);

    revalidatePath("/operator/queue");
    revalidatePath("/secretary/patients");
    revalidatePath("/manager");
    return {
      success: true,
      message: "اطلاعات نوبت در صف انتظار با موفقیت به‌روزرسانی شد.",
      data: updatedVisit,
    };
  } catch (error) {
    console.error("Update Waiting Visit Error:", error);
    return { success: false, error: "خطا در به‌روزرسانی نوبت صف" };
  }
}

export async function uploadPhotosAction(visitId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "OPERATOR" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز برای بارگذاری تصویر" };
    }

    const files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      return { success: false, error: "هیچ فایلی انتخاب نشده است" };
    }

    const uploadDir = path.join(process.cwd(), "uploads", visitId);
    await fs.mkdir(uploadDir, { recursive: true });

    const savedPhotos = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: `حجم فایل ${file.name} بیشتر از ۵ مگابایت است` };
      }

      if (!file.type.startsWith("image/")) {
        return { success: false, error: "فقط فایل‌های تصویری مجاز هستند" };
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);

      await fs.writeFile(filePath, buffer);

      const photo = await db.photo.create({
        data: {
          visitId,
          filename: safeFilename,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });

      savedPhotos.push(photo);
    }

    revalidatePath(`/operator/queue/${visitId}`);
    return { success: true, data: savedPhotos };
  } catch (error) {
    console.error("Upload Photos Error:", error);
    return { success: false, error: "خطا در بارگذاری تصاویر" };
  }
}
