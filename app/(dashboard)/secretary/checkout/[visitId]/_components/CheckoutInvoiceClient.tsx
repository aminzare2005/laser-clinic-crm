"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { confirmPaymentAction } from "@/lib/actions/payment";
import { formatToman } from "@/lib/utils";
import { formatJalali } from "@/lib/jalali";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Printer,
  CheckCircle2,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

interface VisitDetails {
  id: string;
  status: string;
  createdAt: Date;
  patient: {
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
  };
  service: {
    name: string;
    category: string;
    price: number;
  };
  operator?: { displayName: string } | null;
  payment?: {
    id: string;
    amount: number;
    method: string;
    referenceCode?: string | null;
    paidAt: Date;
  } | null;
}

export function CheckoutInvoiceClient({ visit }: { visit: VisitDetails }) {
  const router = useRouter();

  const [method, setMethod] = useState<"POS" | "CASH" | "CARD_TO_CARD">("POS");
  const [referenceCode, setReferenceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(Boolean(visit.payment));

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("visitId", visit.id);
    formData.append("method", method);
    if (referenceCode) {
      formData.append("referenceCode", referenceCode);
    }

    const res = await confirmPaymentAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "خطا در ثبت پرداخت");
    } else {
      setIsSuccess(true);
      router.refresh();
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* دکمه بازگشت */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link href="/secretary/checkout">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
            <ArrowRight className="size-4" />
            بازگشت به لیست صندوق
          </Button>
        </Link>
        {isSuccess && (
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2 font-bold shadow-xs cursor-pointer">
            <Printer className="size-4" />
            چاپ فاکتور رسمی
          </Button>
        )}
      </div>

      {/* پیام تسویه حساب موفقیت‌آمیز */}
      {isSuccess && (
        <div className="p-4 rounded-surface bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 no-print animate-in fade-in shadow-xs">
          <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <span className="font-bold block text-emerald-900">تسویه حساب و پرداخت با موفقیت ثبت شد.</span>
            <span className="text-xs text-emerald-700">
              پرونده این ویزیت در وضعیت «تسویه شده» بایگانی گردید.
            </span>
          </div>
        </div>
      )}

      {/* برگه صورت‌حساب رسمی VibeFarsi */}
      <Card className="p-4 sm:p-6 md:p-8 space-y-6 print:border-none print:shadow-none print:p-0 shadow-xs">
        {/* سربرگ فاکتور */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-border/70 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs shrink-0">
              <Building2 className="size-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                کلینیک تخصصی پوست، مو و زیبایی
              </h1>
              <p className="text-xs text-muted-foreground">
                صورت‌حساب رسمی خدمات درمانی و لیزر
              </p>
            </div>
          </div>
          <div className="text-start sm:text-end text-xs space-y-1 font-mono text-muted-foreground pt-1 sm:pt-0 border-t sm:border-0 border-border/50">
            <div>شماره فاکتور: {visit.id.slice(-8).toUpperCase()}</div>
            <div>تاریخ: {formatJalali(new Date())}</div>
          </div>
        </div>

        {/* مشخصات بیمار و اپراتور */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs bg-slate-50 p-4 rounded-control border border-border">
          <div className="space-y-1.5">
            <div>
              <span className="text-muted-foreground">نام بیمار: </span>
              <span className="font-bold text-foreground">
                {visit.patient.firstName} {visit.patient.lastName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">کد ملی: </span>
              <span className="font-mono text-foreground font-semibold" dir="ltr">
                {visit.patient.nationalId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">شماره تماس: </span>
              <span className="font-mono text-foreground font-semibold" dir="ltr">
                {visit.patient.phone}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-start sm:text-end pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
            <div>
              <span className="text-muted-foreground">اپراتور انجام‌دهنده: </span>
              <span className="font-bold text-foreground">
                {visit.operator?.displayName || "پرسنل کلینیک"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">دسته‌بندی خدمت: </span>
              <span className="text-foreground font-medium">{visit.service.category}</span>
            </div>
          </div>
        </div>

        {/* جدول اقلام صورت‌حساب */}
        <div className="overflow-x-auto rounded-control border border-border">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-700 border-b border-border">
              <tr>
                <th className="p-3 text-start whitespace-nowrap">ردیف</th>
                <th className="p-3 text-start whitespace-nowrap">شرح خدمت پزشکی / لیزر</th>
                <th className="p-3 text-start whitespace-nowrap">تعرفه مصوب کلینیک</th>
                <th className="p-3 text-start whitespace-nowrap">مبلغ نهایی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-mono">۱</td>
                <td className="p-3 font-semibold text-foreground whitespace-nowrap">{visit.service.name}</td>
                <td className="p-3 text-muted-foreground whitespace-nowrap">{formatToman(visit.service.price)}</td>
                <td className="p-3 font-bold text-foreground whitespace-nowrap">{formatToman(visit.service.price)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50/70 border-t border-border font-bold">
              <tr>
                <td colSpan={3} className="p-3 text-end text-foreground">
                  مبلغ کل قابل پرداخت:
                </td>
                <td className="p-3 font-bold text-sm sm:text-base text-primary whitespace-nowrap">
                  {formatToman(visit.service.price)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* فرم دریافت وجه و انتخاب روش پرداخت (فقط قبل از پرداخت) */}
        {!isSuccess && (
          <form onSubmit={handleConfirmPayment} className="space-y-6 pt-4 border-t border-border no-print">
            {error && (
              <div className="p-3 text-xs rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground block">
                انتخاب روش پرداخت وجه توسط بیمار:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("POS")}
                  className={`p-3.5 rounded-control border text-center space-y-1.5 transition-all cursor-pointer ${
                    method === "POS"
                      ? "bg-primary text-white border-primary font-bold shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs"
                  }`}
                >
                  <CreditCard className="size-5 mx-auto" />
                  <span className="block text-xs">کارتخوان (POS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("CASH")}
                  className={`p-3.5 rounded-control border text-center space-y-1.5 transition-all cursor-pointer ${
                    method === "CASH"
                      ? "bg-primary text-white border-primary font-bold shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs"
                  }`}
                >
                  <Banknote className="size-5 mx-auto" />
                  <span className="block text-xs">وجه نقد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("CARD_TO_CARD")}
                  className={`p-3.5 rounded-control border text-center space-y-1.5 transition-all cursor-pointer ${
                    method === "CARD_TO_CARD"
                      ? "bg-primary text-white border-primary font-bold shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs"
                  }`}
                >
                  <Smartphone className="size-5 mx-auto" />
                  <span className="block text-xs">کارت به کارت</span>
                </button>
              </div>
            </div>

            <Field
              label={method === "CASH" ? "توضیحات دریافت وجه (اختیاری)" : "شماره پیگیری / مرجع بانکی"}
              htmlFor="referenceCode"
            >
              <Input
                id="referenceCode"
                name="referenceCode"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                dir="ltr"
                placeholder={
                  method === "CASH"
                    ? "مثال: پرداخت کامل نقدی تحویل باجه"
                    : "مثال: 948123049182"
                }
                required={method !== "CASH"}
              />
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-12 text-base font-bold shadow-xs cursor-pointer"
              >
                {loading ? "در حال ثبت پرداخت..." : "تأیید تراکنش و تسویه نهایی حساب"}
              </Button>
            </div>
          </form>
        )}

        {/* وضعیت پرداخت موفق ثبت‌شده */}
        {isSuccess && visit.payment && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="text-xs font-bold text-muted-foreground uppercase">
              اطلاعات تراکنش پرداختی:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-control border border-border">
              <div>
                <span className="text-muted-foreground">روش پرداخت: </span>
                <span className="font-bold text-foreground">
                  {visit.payment.method === "POS"
                    ? "دستگاه کارتخوان (POS)"
                    : visit.payment.method === "CASH"
                    ? "وجه نقد"
                    : "کارت به کارت"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">شماره مرجع: </span>
                <span className="font-mono text-foreground font-semibold" dir="ltr">
                  {visit.payment.referenceCode || "—"}
                </span>
              </div>
              <div className="text-start sm:text-end">
                <span className="text-muted-foreground">زمان ثبت: </span>
                <span className="text-foreground font-medium">
                  {formatJalali(new Date(visit.payment.paidAt))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
