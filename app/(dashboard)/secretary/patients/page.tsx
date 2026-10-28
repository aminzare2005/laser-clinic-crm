import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PatientIntakeClient } from "./_components/PatientIntakeClient";

export default async function SecretaryPatientsPage() {
  await requireRole("SECRETARY", "MANAGER");

  // دریافت خدمات فعال برای فرم پذیرش
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">پذیرش و تشکیل پرونده بیمار</h1>
        <p className="text-sm text-slate-500 mt-1">
          جستجو بر اساس کد ملی، ثبت پرونده جدید و ارجاع بیمار به سالن انتظار
        </p>
      </div>

      <PatientIntakeClient services={services} />
    </div>
  );
}
