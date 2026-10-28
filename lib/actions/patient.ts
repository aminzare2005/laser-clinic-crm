"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patientSchema, visitRegisterSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function searchPatientAction(nationalId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "ابتدا وارد سیستم شوید" };
    }

    const cleanNationalId = nationalId.trim();
    if (!cleanNationalId) {
      return { success: false, error: "کد ملی الزامی است" };
    }

    const patient = await db.patient.findUnique({
      where: { nationalId: cleanNationalId },
      include: {
        visits: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            service: true,
            operator: { select: { displayName: true } },
          },
        },
      },
    });

    if (!patient) {
      return { success: true, data: null, notFound: true };
    }

    return { success: true, data: patient, notFound: false };
  } catch (error) {
    console.error("Search Patient Error:", error);
    return { success: false, error: "خطا در جستجوی بیمار" };
  }
}

export async function createPatientAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SECRETARY" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز برای ثبت بیمار" };
    }

    const rawData = {
      nationalId: formData.get("nationalId") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      notes: (formData.get("notes") as string) || undefined,
    };

    const validated = patientSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "اطلاعات بیمار نامعتبر است";
      return { success: false, error: firstError };
    }

    // بررسی تکراری نبودن کد ملی
    const existing = await db.patient.findUnique({
      where: { nationalId: validated.data.nationalId },
    });

    if (existing) {
      return { success: false, error: "بیماری با این کد ملی قبلاً ثبت شده است" };
    }

    // اعتبارسنجی کاربر ثبت‌کننده جهت جلوگیری از نقض کلید خارجی
    let creatorId = session.user.id;
    const userInDb = await db.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!userInDb) {
      const fallbackUser = await db.user.findFirst({
        where: { role: { in: ["SECRETARY", "MANAGER"] }, isActive: true },
        select: { id: true },
      });
      if (!fallbackUser) {
        return { success: false, error: "کاربر مجاز ثبت‌کننده در سیستم یافت نشد. لطفاً مجدداً وارد شوید." };
      }
      creatorId = fallbackUser.id;
    }

    const patient = await db.patient.create({
      data: {
        ...validated.data,
        createdById: creatorId,
      },
    });

    revalidatePath("/secretary/patients");
    return { success: true, data: patient };
  } catch (error) {
    console.error("Create Patient Error:", error);
    return { success: false, error: "خطا در ثبت اطلاعات بیمار" };
  }
}

export async function registerVisitAction(patientId: string, serviceId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SECRETARY" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز برای پذیرش" };
    }

    const validated = visitRegisterSchema.safeParse({ patientId, serviceId });
    if (!validated.success) {
      return { success: false, error: "اطلاعات بیمار یا خدمت نامعتبر است" };
    }

    const service = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      return { success: false, error: "خدمت مورد نظر در دسترس نیست" };
    }

    // اعتبارسنجی کاربر ثبت‌کننده جهت جلوگیری از نقض کلید خارجی
    let creatorId = session.user.id;
    const userInDb = await db.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!userInDb) {
      const fallbackUser = await db.user.findFirst({
        where: { role: { in: ["SECRETARY", "MANAGER"] }, isActive: true },
        select: { id: true },
      });
      if (!fallbackUser) {
        return { success: false, error: "کاربر مجاز در سیستم یافت نشد. لطفاً مجدداً وارد شوید." };
      }
      creatorId = fallbackUser.id;
    }

    const visit = await db.visit.create({
      data: {
        patientId,
        serviceId,
        createdById: creatorId,
        status: "WAITING",
      },
      include: {
        patient: true,
        service: true,
      },
    });

    revalidatePath("/secretary/patients");
    revalidatePath("/operator/queue");
    return { success: true, data: visit };
  } catch (error) {
    console.error("Register Visit Error:", error);
    return { success: false, error: "خطا در ثبت نوبت بیمار" };
  }
}
