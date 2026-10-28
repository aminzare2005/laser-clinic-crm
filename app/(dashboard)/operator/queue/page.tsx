import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { OperatorQueueClient } from "./_components/OperatorQueueClient";

export default async function OperatorQueuePage() {
  const user = await requireRole("OPERATOR", "MANAGER", "SECRETARY");

  // دریافت ویزیت‌های در انتظار، ویزیت‌های در جریان و لیست خدمات جهت ویرایش
  const [waitingVisits, inProgressVisits, services] = await Promise.all([
    db.visit.findMany({
      where: { status: "WAITING" },
      orderBy: { createdAt: "asc" },
      include: {
        patient: true,
        service: true,
      },
    }),
    db.visit.findMany({
      where: {
        status: "IN_PROGRESS",
        ...(user.role === "OPERATOR" ? { operatorId: user.id } : {}),
      },
      orderBy: { acceptedAt: "desc" },
      include: {
        patient: true,
        service: true,
        operator: { select: { displayName: true } },
      },
    }),
    db.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, price: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">صف انتظار و تابلوی بیماران</h1>
          <p className="text-xs text-slate-500 mt-1">
            مشاهده بیماران حاضر در سالن کلینیک، مدیریت صف، ویرایش نوبت و پذیرش در اتاق درمان
          </p>
        </div>
      </div>

      <OperatorQueueClient
        initialWaiting={waitingVisits}
        initialInProgress={inProgressVisits}
        userRole={user.role}
        services={services}
      />
    </div>
  );
}
