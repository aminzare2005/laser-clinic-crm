import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatToman } from "@/lib/utils";
import { formatJalali } from "@/lib/jalali";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";

export default async function CheckoutListPage() {
  await requireRole("SECRETARY", "MANAGER");

  // دریافت ویزیت‌های آماده پرداخت (DONE) و آخرین پرداخت‌های تسویه شده (PAID)
  const [pendingVisits, recentPaid] = await Promise.all([
    db.visit.findMany({
      where: { status: "DONE" },
      orderBy: { finishedAt: "desc" },
      include: {
        patient: true,
        service: true,
        operator: { select: { displayName: true } },
      },
    }),
    db.visit.findMany({
      where: { status: "PAID" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        patient: true,
        service: true,
        payment: true,
        operator: { select: { displayName: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">صندوق و تسویه حساب مراجعین</h1>
        <p className="text-xs text-muted-foreground mt-1">
          مشاهده مراجعین اتمام‌یافته در اتاق درمان و صدور صورت‌حساب مالی
        </p>
      </div>

      {/* لیست بیماران منتظر در صندوق */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            مراجعین آماده تسویه در باجه ({pendingVisits.length} نفر)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {pendingVisits.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="در حال حاضر بیماری در انتظار پرداخت در صندوق نیست"
                description="به محض پایان جلسه درمان در اتاق اپراتور، نام مراجع جهت تسویه و صدور فاکتور در این لیست قرار می‌گیرد."
              />
            </div>
          ) : (
            <>
              {/* نمای مخصوص موبایل */}
              <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
                {pendingVisits.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-border/70 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {item.patient.firstName} {item.patient.lastName}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5" dir="ltr">
                          کد ملی: {item.patient.nationalId}
                        </div>
                      </div>
                      <div className="font-bold text-primary text-base">
                        {formatToman(item.service.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/50 text-muted-foreground">
                      <span>خدمت: <strong className="text-foreground">{item.service.name}</strong></span>
                      <span>اپراتور: <strong className="text-foreground">{item.operator?.displayName || "—"}</strong></span>
                    </div>

                    <Link href={`/secretary/checkout/${item.id}`} className="block">
                      <Button size="sm" className="w-full h-10 gap-2 shadow-xs font-bold cursor-pointer">
                        <span>تسویه حساب و صدور فاکتور</span>
                        <ArrowLeft className="size-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* نمای مخصوص تبلت و دسکتاپ */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام بیمار</TableHead>
                      <TableHead>خدمت انجام‌شده</TableHead>
                      <TableHead>اپراتور معالج</TableHead>
                      <TableHead>مبلغ قابل پرداخت</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVisits.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold">
                          <div>
                            {item.patient.firstName} {item.patient.lastName}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground" dir="ltr">
                            {item.patient.nationalId}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{item.service.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.operator?.displayName || "—"}
                        </TableCell>
                        <TableCell className="font-bold text-foreground text-base">
                          {formatToman(item.service.price)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/secretary/checkout/${item.id}`}>
                            <Button size="sm" className="gap-1.5 shadow-xs font-bold cursor-pointer">
                              تسویه حساب و صدور فاکتور
                              <ArrowLeft className="size-4" />
                            </Button>
                          </Link>
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

      {/* تاریخچه آخرین تسویه‌های امروز */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-5" />
            آخرین تسویه‌های انجام‌شده امروز
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {recentPaid.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="هنوز پرداختی در این شیفت ثبت نشده است"
                description="تراکنش‌های موفق پس از تسویه نهایی به عنوان رسید مالی ثبت می‌گردند."
              />
            </div>
          ) : (
            <>
              {/* نمای مخصوص موبایل */}
              <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
                {recentPaid.map((item) => {
                  const methodLabel =
                    item.payment?.method === "POS"
                      ? "کارتخوان (POS)"
                      : item.payment?.method === "CASH"
                      ? "نقدی"
                      : "کارت به کارت";

                  return (
                    <div key={item.id} className="p-3 bg-slate-50/60 rounded-xl space-y-2 border border-border/50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          {item.patient.firstName} {item.patient.lastName}
                        </span>
                        <Badge variant="outline">{methodLabel}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{item.service.name}</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {formatToman(item.payment?.amount || item.service.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono" dir="ltr">
                        <span>Ref: {item.payment?.referenceCode || "—"}</span>
                        <span>{item.payment ? formatJalali(new Date(item.payment.paidAt)) : "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* نمای مخصوص تبلت و دسکتاپ */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>بیمار</TableHead>
                      <TableHead>خدمت</TableHead>
                      <TableHead>مبلغ تسویه</TableHead>
                      <TableHead>روش پرداخت</TableHead>
                      <TableHead>کد پیگیری</TableHead>
                      <TableHead>زمان تسویه</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPaid.map((item) => {
                      const methodLabel =
                        item.payment?.method === "POS"
                          ? "کارتخوان (POS)"
                          : item.payment?.method === "CASH"
                          ? "نقدی"
                          : "کارت به کارت";

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold text-foreground">
                            {item.patient.firstName} {item.patient.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.service.name}</TableCell>
                          <TableCell className="font-bold text-emerald-700">
                            {formatToman(item.payment?.amount || item.service.price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{methodLabel}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground text-xs" dir="ltr">
                            {item.payment?.referenceCode || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.payment ? formatJalali(new Date(item.payment.paidAt)) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
