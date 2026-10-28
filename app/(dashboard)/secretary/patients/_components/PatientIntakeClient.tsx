"use client";

import { useState } from "react";
import { searchPatientAction, createPatientAction, registerVisitAction } from "@/lib/actions/patient";
import { formatToman, faNumber, cn } from "@/lib/utils";
import { formatJalali } from "@/lib/jalali";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  History,
  Check,
  Layers,
} from "lucide-react";

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
  service: { name: string; price: number };
  operator?: { displayName: string } | null;
}

interface PatientData {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phone: string;
  notes?: string | null;
  visits: VisitRecord[];
}

export function PatientIntakeClient({ services }: { services: ServiceItem[] }) {
  const [nationalId, setNationalId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);

  // فرم انتخاب خدمت
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "");

  const [registeringVisit, setRegisteringVisit] = useState(false);
  const [registeredVisitSuccess, setRegisteredVisitSuccess] = useState<string | null>(null);

  // فرم بیمار جدید
  const [newPatientLoading, setNewPatientLoading] = useState(false);
  const [newPatientError, setNewPatientError] = useState<string | null>(null);

  const currentSelectedService = services.find((s) => s.id === selectedServiceId);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setPatient(null);
    setIsNewPatient(false);
    setRegisteredVisitSuccess(null);

    const clean = nationalId.trim();
    if (!clean || clean.length !== 10) {
      setSearchError("کد ملی باید ۱۰ رقم باشد");
      return;
    }

    setSearching(true);
    const res = await searchPatientAction(clean);
    setSearching(false);

    if (!res.success) {
      setSearchError(res.error || "خطا در استعلام");
      return;
    }

    if (res.notFound || !res.data) {
      setIsNewPatient(true);
    } else {
      setPatient(res.data as PatientData);
      if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }
    }
  }

  async function handleCreatePatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewPatientError(null);
    setNewPatientLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("nationalId", nationalId.trim());

    const res = await createPatientAction(formData);
    setNewPatientLoading(false);

    if (!res.success) {
      setNewPatientError(res.error || "خطا در ثبت پرونده بیمار");
      return;
    }

    setIsNewPatient(false);
    const created = res.data as {
      id: string;
      nationalId: string;
      firstName: string;
      lastName: string;
      phone: string;
      notes?: string | null;
    };
    setPatient({
      ...created,
      visits: [],
    });
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }

  async function handleRegisterVisit() {
    if (!patient || !selectedServiceId) return;

    setRegisteringVisit(true);
    setRegisteredVisitSuccess(null);

    const res = await registerVisitAction(patient.id, selectedServiceId);
    setRegisteringVisit(false);

    if (!res.success) {
      alert(res.error || "خطا در ثبت نوبت");
      return;
    }

    setRegisteredVisitSuccess(
      `ویزیت خدمت «${currentSelectedService?.name}» برای بیمار ${patient.firstName} ${patient.lastName} با موفقیت در صف سالن انتظار ثبت شد.`
    );
  }

  return (
    <div className="space-y-6">
      {/* مرحله ۱: استعلام کد ملی با کارت VibeFarsi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            مرحله اول: استعلام کد ملی مراجع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
            <div className="flex-1 w-full">
              <Field label="کد ملی ۱۰ رقمی مراجع" htmlFor="nationalIdInput">
                <Input
                  id="nationalIdInput"
                  type="text"
                  maxLength={10}
                  dir="ltr"
                  placeholder="مثال: 0012345678"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  error={searchError || undefined}
                  required
                />
              </Field>
            </div>
            <Button
              id="searchPatientBtn"
              type="submit"
              disabled={searching}
              className="w-full sm:w-auto h-11 px-6 font-bold shadow-xs"
            >
              {searching ? "در حال استعلام..." : "بررسی پرونده"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* پیام موفقیت پذیرش */}
      {registeredVisitSuccess && (
        <div className="p-4 rounded-surface bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="size-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="text-sm font-medium">
            {registeredVisitSuccess}
            <div className="mt-1 text-xs text-emerald-700">
              بیمار هم‌اکنون در تابلوی صف انتظار اپراتورها قابل مشاهده است.
            </div>
          </div>
        </div>
      )}

      {/* مرحله ۲ - الف: بیمار جدید (فرم ثبت‌نام) */}
      {isNewPatient && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <UserPlus className="size-5" />
              پرونده‌ای با کد ملی {nationalId} یافت نشد — تشکیل پرونده مراجع جدید
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newPatientError && (
              <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                {newPatientError}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="نام" htmlFor="firstName">
                  <Input id="firstName" name="firstName" placeholder="مثال: سارا" required />
                </Field>

                <Field label="نام خانوادگی" htmlFor="lastName">
                  <Input id="lastName" name="lastName" placeholder="مثال: حسینی" required />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="شماره موبایل (جهت پیگیری)" htmlFor="phone">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    placeholder="09121234567"
                    required
                  />
                </Field>

                <Field label="کد ملی (تأیید شده)" htmlFor="readonlyNatId">
                  <Input id="readonlyNatId" value={nationalId} dir="ltr" disabled readOnly />
                </Field>
              </div>

              <Field label="یادداشت پرونده یا سوابق پزشکی / حساسیت‌ها" htmlFor="notes">
                <Input
                  id="notes"
                  name="notes"
                  placeholder="مثال: پوست حساس، سابقه آلرژی به بی‌حسی موضعی..."
                />
              </Field>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsNewPatient(false)}>
                  انصراف
                </Button>
                <Button id="createPatientBtn" type="submit" disabled={newPatientLoading}>
                  {newPatientLoading ? "در حال تشکیل پرونده..." : "ثبت پرونده و ادامه"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* مرحله ۲ - ب: بیمار یافت شد (اطلاعات پرونده + شبکه کارت‌های خدمات VibeFarsi) */}
      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* کارت مشخصات بیمار */}
          <Card className="lg:col-span-1 shadow-xs h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <UserCheck className="size-5" />
                پرونده فعال مراجع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">نام کامل:</span>
                <span className="font-bold text-foreground">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">کد ملی:</span>
                <span className="font-mono text-foreground font-semibold" dir="ltr">
                  {patient.nationalId}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">شماره تماس:</span>
                <span className="font-mono text-foreground font-semibold" dir="ltr">
                  {patient.phone}
                </span>
              </div>
              {patient.notes && (
                <div className="pt-2 text-xs">
                  <span className="text-muted-foreground block mb-1 font-semibold">یادداشت و هشدار بالینی:</span>
                  <p className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                    {patient.notes}
                  </p>
                </div>
              )}

              {/* سوابق مراجعات قبلی در تب پایین کارت */}
              <div className="pt-4 border-t border-border/70">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
                  <History className="size-4 text-muted-foreground" />
                  <span>سوابق اخیر بیمار ({faNumber(patient.visits.length)})</span>
                </div>
                {patient.visits.length === 0 ? (
                  <p className="text-xs text-muted-foreground">اولین مراجعه ثبت‌شده بیمار است.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                    {patient.visits.map((v) => (
                      <div
                        key={v.id}
                        className="p-2 rounded bg-slate-50 border border-border/70 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{v.service.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatJalali(new Date(v.createdAt))}
                          </div>
                        </div>
                        <span className="font-bold text-foreground">
                          {formatToman(v.service.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* بخش تخصیص خدمت: شبکه کارت‌های خدمات */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    انتخاب خدمت درخواستی مراجع
                  </CardTitle>
                  <span className="text-xs font-semibold text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-full border border-border">
                    {faNumber(services.length)} خدمت در دسترس
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* شبکه کارت‌های خدمات */}
                {services.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      title="هیچ خدمتی تعریف نشده است"
                      description="لطفاً از پنل مدیریت خدمات را تعریف نمایید."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
                    {services.map((svc) => {
                      const isSelected = selectedServiceId === svc.id;
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => setSelectedServiceId(svc.id)}
                          className={cn(
                            "text-start p-4 rounded-surface border transition-all cursor-pointer relative flex flex-col justify-between gap-3 text-start group",
                            isSelected
                              ? "bg-sky-50/70 border-primary ring-2 ring-primary/40 shadow-xs"
                              : "bg-white hover:bg-slate-50/90 border-border hover:border-slate-300 shadow-xs"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-sm text-foreground leading-snug">
                              {svc.name}
                            </div>
                            <div
                              className={cn(
                                "size-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary text-white shadow-xs"
                                  : "border border-slate-300 group-hover:border-slate-400"
                              )}
                            >
                              {isSelected && <Check className="size-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-border/80">
                              {svc.category}
                            </span>
                            <span className="font-bold text-foreground text-sm">
                              {formatToman(svc.price)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* بنر خلاصه خدمت انتخاب‌شده و دکمه ثبت */}
                {currentSelectedService && (
                  <div className="pt-2 space-y-3">
                    <div className="p-3.5 rounded-control bg-slate-50 border border-primary/30 flex items-center justify-between gap-3 shadow-xs">
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground block font-medium">
                          خدمت انتخاب‌شده:
                        </span>
                        <span className="text-sm font-bold text-foreground truncate block">
                          {currentSelectedService.name}
                        </span>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="text-xs text-muted-foreground block font-medium">
                          تعرفه مصوب:
                        </span>
                        <span className="text-base font-bold text-primary">
                          {formatToman(currentSelectedService.price)}
                        </span>
                      </div>
                    </div>

                    <Button
                      id="registerVisitBtn"
                      onClick={handleRegisterVisit}
                      disabled={registeringVisit || !selectedServiceId}
                      className="w-full h-12 text-sm font-bold shadow-xs gap-2 cursor-pointer"
                    >
                      <Clock className="size-4" />
                      {registeringVisit
                        ? "در حال ثبت نوبت..."
                        : "ثبت نوبت و ارجاع به سالن"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
