"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { acceptVisitAction } from "@/lib/actions/visit";
import { formatRelativeJalali } from "@/lib/jalali";
import { faNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Clock, UserCheck, PlayCircle, RefreshCw } from "lucide-react";
import { EditQueueVisitDialog } from "./EditQueueVisitDialog";
import { CancelVisitButton } from "./CancelVisitButton";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface VisitRecord {
  id: string;
  createdAt: Date;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
    notes?: string | null;
  };
  service: {
    id: string;
    name: string;
    category: string;
    price: number;
  };
}

export function OperatorQueueClient({
  initialWaiting,
  initialInProgress,
  userRole = "OPERATOR",
  services = [],
}: {
  initialWaiting: VisitRecord[];
  initialInProgress: VisitRecord[];
  userRole?: "MANAGER" | "SECRETARY" | "OPERATOR";
  services?: ServiceItem[];
}) {
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canManageQueue = userRole === "MANAGER" || userRole === "SECRETARY";
  const canAccept = userRole === "OPERATOR" || userRole === "MANAGER";

  // Polling صف هر ۲۰ ثانیه جهت بلادرنگ بودن صف
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 20000);
    return () => clearInterval(timer);
  }, [router]);

  async function handleAccept(visitId: string) {
    setAcceptingId(visitId);
    const res = await acceptVisitAction(visitId);
    setAcceptingId(null);

    if (!res.success) {
      alert(res.error || "خطا در پذیرش بیمار");
      return;
    }

    router.push(`/operator/queue/${visitId}`);
  }

  function handleManualRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  }

  return (
    <div className="space-y-6">
      {/* بیماران در حال درمان (اتاق درمان فعال) */}
      {initialInProgress.length > 0 && (
        <Card className="bg-sky-50/50 border-sky-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PlayCircle className="size-5 text-primary animate-pulse" />
              بیماران در حال درمان ({faNumber(initialInProgress.length)})
            </CardTitle>
            <span className="text-xs text-primary font-bold bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-xs">
              اتاق درمان فعال
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {initialInProgress.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-white border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-foreground truncate text-sm">
                      {v.patient.firstName} {v.patient.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      خدمت: <span className="text-foreground font-semibold">{v.service.name}</span>
                    </div>
                  </div>
                  {canAccept && (
                    <Link href={`/operator/queue/${v.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="default" className="w-full sm:w-auto gap-1.5 shrink-0 shadow-xs font-bold">
                        ورود به اتاق درمان
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* لیست صف انتظار عمومی مراجعین */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            بیماران حاضر در سالن انتظار ({faNumber(initialWaiting.length)} نفر)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">به‌روزرسانی صف</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {initialWaiting.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Clock}
                title="در حال حاضر هیچ بیماری در صف انتظار نیست"
                description="به محض ثبت پذیرش توسط منشی، نام بیمار به صورت بلادرنگ در این صفحه نمایان خواهد شد."
              />
            </div>
          ) : (
            <>
              {/* نمای مخصوص موبایل: کارت‌های کامل با دکمه‌های کنترل و پذیرش */}
              <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
                {initialWaiting.map((item) => (
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
                      <Badge variant="outline" className="text-[11px] shrink-0">
                        {item.service.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/50">
                      <span className="text-muted-foreground">خدمت انتخابی:</span>
                      <span className="font-bold text-foreground">{item.service.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                      <span>زمان ثبت در سالن:</span>
                      <span>{formatRelativeJalali(new Date(item.createdAt))}</span>
                    </div>

                    {item.patient.notes && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        {item.patient.notes}
                      </div>
                    )}

                    {/* دکمه‌های عملیات صف */}
                    <div className="space-y-2 pt-1">
                      {canManageQueue && (
                        <div className="grid grid-cols-2 gap-2">
                          <EditQueueVisitDialog visit={item} services={services} />
                          <CancelVisitButton
                            visitId={item.id}
                            patientName={`${item.patient.firstName} ${item.patient.lastName}`}
                          />
                        </div>
                      )}

                      {canAccept && (
                        <Button
                          size="sm"
                          onClick={() => handleAccept(item.id)}
                          disabled={acceptingId === item.id}
                          className="w-full gap-2 shadow-xs font-bold h-10 cursor-pointer"
                        >
                          <UserCheck className="size-4" />
                          {acceptingId === item.id ? "در حال پذیرش..." : "پذیرش بیمار"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* نمای مخصوص تبلت و دسکتاپ: جدول کامل VibeFarsi */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام بیمار</TableHead>
                      <TableHead>خدمت درخواستی</TableHead>
                      <TableHead>دسته‌بندی</TableHead>
                      <TableHead>زمان انتظار</TableHead>
                      <TableHead>یادداشت منشی</TableHead>
                      <TableHead className="text-center">عملیات صف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialWaiting.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-bold text-foreground">
                            {item.patient.firstName} {item.patient.lastName}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground mt-0.5" dir="ltr">
                            {item.patient.nationalId}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {item.service.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.service.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-amber-700 font-bold">
                          {formatRelativeJalali(new Date(item.createdAt))}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {item.patient.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {canManageQueue && (
                              <>
                                <EditQueueVisitDialog visit={item} services={services} />
                                <CancelVisitButton
                                  visitId={item.id}
                                  patientName={`${item.patient.firstName} ${item.patient.lastName}`}
                                />
                              </>
                            )}

                            {canAccept && (
                              <Button
                                size="sm"
                                onClick={() => handleAccept(item.id)}
                                disabled={acceptingId === item.id}
                                className="gap-1.5 shadow-xs font-bold cursor-pointer"
                              >
                                <UserCheck className="size-4" />
                                {acceptingId === item.id ? "در حال پذیرش..." : "پذیرش بیمار"}
                              </Button>
                            )}
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
