import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatToman } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceFormDialog } from "./_components/ServiceFormDialog";
import { ToggleServiceButton } from "./_components/ToggleServiceButton";
import { EditServiceDialog } from "./_components/EditServiceDialog";
import { DeleteServiceButton } from "./_components/DeleteServiceButton";

export default async function ServicesPage() {
  await requireRole("MANAGER");

  const services = await db.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">مدیریت خدمات و تعرفه‌ها</h1>
          <p className="text-xs text-muted-foreground mt-1">
            تعریف، ویرایش و حذف خدمات لیزر، تزریقات زیبایی و تعیین قیمت مصوب کلینیک
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ServiceFormDialog />
        </div>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="هیچ خدمتی تعریف نشده است"
                description="با استفاده از دکمه افزودن خدمت جدید، اولین خدمت درمانگاه را تعریف نمایید."
              />
            </div>
          ) : (
            <>
              {/* نمای کارتی مخصوص موبایل */}
              <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
                {services.map((s) => (
                  <div key={s.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-border/70 space-y-2.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.description || "بدون توضیحات"}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-semibold border border-slate-200 shrink-0">
                        {s.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/50">
                      <span className="text-muted-foreground">تعرفه مصوب:</span>
                      <span className="font-bold text-foreground text-sm">{formatToman(s.price)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {s.isActive ? (
                        <Badge variant="success">فعال در کلینیک</Badge>
                      ) : (
                        <Badge variant="secondary">غیرفعال</Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <EditServiceDialog service={s} />
                        <ToggleServiceButton id={s.id} isActive={s.isActive} />
                        <DeleteServiceButton id={s.id} name={s.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای جدولی مخصوص دسکتاپ و تبلت */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام خدمت</TableHead>
                      <TableHead>دسته‌بندی</TableHead>
                      <TableHead>قیمت ثابت (تومان)</TableHead>
                      <TableHead>توضیحات</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead className="text-center">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold text-foreground">{s.name}</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {s.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatToman(s.price)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {s.description || "—"}
                        </TableCell>
                        <TableCell>
                          {s.isActive ? (
                            <Badge variant="success">فعال</Badge>
                          ) : (
                            <Badge variant="secondary">غیرفعال</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            <EditServiceDialog service={s} />
                            <ToggleServiceButton id={s.id} isActive={s.isActive} />
                            <DeleteServiceButton id={s.id} name={s.name} />
                          </div>
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
