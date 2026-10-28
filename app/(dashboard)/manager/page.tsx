import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatToman, faNumber } from "@/lib/utils";
import { formatJalali } from "@/lib/jalali";
import { Users, Clock, CheckCircle2, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ManagerDashboardPage() {
  await requireRole("MANAGER");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [waitingCount, doneCount, paidCount, todayPayments, recentVisits] = await Promise.all([
    db.visit.count({
      where: {
        status: "WAITING",
        createdAt: { gte: today },
      },
    }),
    db.visit.count({
      where: {
        status: "DONE",
        createdAt: { gte: today },
      },
    }),
    db.visit.count({
      where: {
        status: "PAID",
        createdAt: { gte: today },
      },
    }),
    db.payment.aggregate({
      where: {
        paidAt: { gte: today },
      },
      _sum: {
        amount: true,
      },
    }),
    db.visit.findMany({
      where: {
        createdAt: { gte: today },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        patient: true,
        service: true,
        operator: { select: { displayName: true } },
      },
    }),
  ]);

  const totalIncome = todayPayments._sum.amount || 0;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Badge variant="warning">در انتظار سالن</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="brand">در حال درمان</Badge>;
      case "DONE":
        return <Badge variant="default">آماده پرداخت</Badge>;
      case "PAID":
        return <Badge variant="success">تسویه شده</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">لغو شده</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">داشبورد مدیریت کلینیک</h1>
          <p className="text-xs text-muted-foreground mt-1">
            وضعیت عملکرد امروز — {formatJalali(new Date(), { weekday: true, year: true })}
          </p>
        </div>
      </div>

      {/* کارت‌های شاخص آمار VibeFarsi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat
          label="درآمد وصول‌شده امروز"
          value={formatToman(totalIncome)}
          icon={DollarSign}
          delta={12}
          deltaLabel="نسبت به میانگین هفته"
        />

        <Stat
          label="بیماران در انتظار سالن"
          value={faNumber(waitingCount)}
          unit="نفر"
          icon={Clock}
        />

        <Stat
          label="ویزیت‌های آماده تسویه"
          value={faNumber(doneCount)}
          unit="مورد"
          icon={Users}
        />

        <Stat
          label="ویزیت‌های تسویه شده"
          value={faNumber(paidCount)}
          unit="مورد"
          icon={CheckCircle2}
          delta={8}
          deltaLabel="نسبت به روز گذشته"
        />
      </div>

      {/* مراجعات اخیر امروز: نمای ریسپانسیو (کارت روی موبایل، جدول روی دسکتاپ) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            آخرین مراجعات ثبت‌شده امروز
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            مجموع: {faNumber(recentVisits.length)}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {recentVisits.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="هنوز برای امروز ویزیتی ثبت نشده است"
                description="به محض پذیرش اولین بیمار توسط منشی، سوابق در این بخش لیست می‌شوند."
              />
            </div>
          ) : (
            <>
              {/* نمای کارتی مخصوص موبایل */}
              <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
                {recentVisits.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50/60 rounded-xl space-y-2 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {v.patient.firstName} {v.patient.lastName}
                      </span>
                      {renderStatusBadge(v.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>خدمت: <strong className="text-foreground">{v.service.name}</strong></span>
                      <span className="font-bold text-foreground">{formatToman(v.service.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>کد ملی: <span className="font-mono" dir="ltr">{v.patient.nationalId}</span></span>
                      <span>اپراتور: {v.operator?.displayName || "—"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای جدولی مخصوص تبلت و دسکتاپ */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام بیمار</TableHead>
                      <TableHead>کد ملی</TableHead>
                      <TableHead>خدمت درخواستی</TableHead>
                      <TableHead>اپراتور</TableHead>
                      <TableHead>تعرفه خدمت</TableHead>
                      <TableHead>وضعیت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVisits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-semibold">
                          {v.patient.firstName} {v.patient.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono" dir="ltr">
                          {v.patient.nationalId}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{v.service.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.operator?.displayName || "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatToman(v.service.price)}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(v.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
