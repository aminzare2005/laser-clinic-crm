"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentSchema } from "@/lib/validations";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function confirmPaymentAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SECRETARY" && session.user.role !== "MANAGER")) {
      return { success: false, error: "دسترسی غیرمجاز برای ثبت پرداخت" };
    }

    const rawData = {
      visitId: formData.get("visitId") as string,
      method: formData.get("method") as PaymentMethod,
      referenceCode: (formData.get("referenceCode") as string) || undefined,
    };

    const validated = paymentSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: "اطلاعات پرداخت نامعتبر است" };
    }

    const visit = await db.visit.findUnique({
      where: { id: validated.data.visitId },
      include: { service: true, payment: true },
    });

    if (!visit) {
      return { success: false, error: "ویزیت مورد نظر یافت نشد" };
    }

    if (visit.payment) {
      return { success: false, error: "پرداخت این ویزیت قبلاً ثبت شده است" };
    }

    const [payment] = await db.$transaction([
      db.payment.create({
        data: {
          visitId: visit.id,
          amount: visit.service.price,
          method: validated.data.method,
          referenceCode: validated.data.referenceCode,
        },
      }),
      db.visit.update({
        where: { id: visit.id },
        data: { status: "PAID" },
      }),
    ]);

    revalidatePath("/secretary/checkout");
    revalidatePath("/manager");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    return { success: false, error: "خطا در ثبت پرداخت" };
  }
}
