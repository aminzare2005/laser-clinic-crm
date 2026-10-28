"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startVisitAction, finishVisitAction, uploadPhotosAction } from "@/lib/actions/visit";
import { formatToman } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Camera,
  Play,
  CheckCircle,
  FileText,
  User,
  Activity,
  Upload,
} from "lucide-react";

interface PhotoItem {
  id: string;
  filename: string;
  mimeType: string;
}

interface VisitData {
  id: string;
  status: string;
  startedAt?: Date | null;
  patient: {
    id: string;
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
  photos: PhotoItem[];
}

export function TreatmentRoomClient({ visit }: { visit: VisitData }) {
  const router = useRouter();

  const [started, setStarted] = useState(Boolean(visit.startedAt));
  const [starting, setStarting] = useState(false);

  // عکس‌ها
  const [photos, setPhotos] = useState<PhotoItem[]>(visit.photos || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // فرم لاگ درمان
  const [shotCount, setShotCount] = useState("");
  const [powerLens, setPowerLens] = useState("");
  const [area, setArea] = useState("");
  const [brand, setBrand] = useState("");
  const [ccVolume, setCcVolume] = useState("");
  const [units, setUnits] = useState("");
  const [notes, setNotes] = useState("");

  const [finishing, setFinishing] = useState(false);

  async function handleStart() {
    setStarting(true);
    const res = await startVisitAction(visit.id);
    setStarting(false);
    if (res.success) {
      setStarted(true);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("photos", e.target.files[i]);
    }

    const res = await uploadPhotosAction(visit.id, formData);
    setUploading(false);

    if (!res.success) {
      setUploadError(res.error || "خطا در بارگذاری تصویر");
    } else if (res.data) {
      setPhotos((prev) => [...prev, ...(res.data as PhotoItem[])]);
    }
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("آیا فرآیند درمان به پایان رسیده و بیمار جهت پرداخت به صندوق ارجاع داده شود؟")) {
      return;
    }

    setFinishing(true);

    const logData: Record<string, unknown> = {
      notes: notes || undefined,
      area: area || undefined,
    };

    if (visit.service.category.includes("لیزر")) {
      if (shotCount) logData.shotCount = Number(shotCount);
      if (powerLens) logData.powerLens = powerLens;
    } else if (visit.service.category.includes("فیلر")) {
      if (brand) logData.brand = brand;
      if (ccVolume) logData.ccVolume = Number(ccVolume);
    } else if (visit.service.category.includes("بوتاکس")) {
      if (brand) logData.brand = brand;
      if (units) logData.units = Number(units);
    }

    const res = await finishVisitAction(visit.id, logData);
    setFinishing(false);

    if (!res.success) {
      alert(res.error || "خطا در ثبت پایان درمان");
      return;
    }

    router.push("/operator/queue");
  }

  const isLaser = visit.service.category.includes("لیزر");
  const isFiller = visit.service.category.includes("فیلر");
  const isBotox = visit.service.category.includes("بوتاکس");

  return (
    <div className="space-y-6">
      {/* هدر صفحه و ناوبری */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/operator/queue">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowRight className="size-4" />
              بازگشت به صف
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            اتاق درمان: {visit.patient.firstName} {visit.patient.lastName}
          </h1>
        </div>
        <Badge variant={visit.status === "DONE" ? "default" : "brand"}>
          {visit.status === "DONE" ? "درمان تکمیل شد" : "در حال درمان"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* اطلاعات بیمار و خدمت درخواستی */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="py-3.5">
              <CardTitle className="text-xs flex items-center gap-2">
                <User className="size-4 text-primary" />
                مشخصات بیمار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">نام کامل:</span>
                <span className="font-bold text-foreground">
                  {visit.patient.firstName} {visit.patient.lastName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">کد ملی:</span>
                <span className="font-mono text-foreground font-semibold" dir="ltr">
                  {visit.patient.nationalId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">شماره تماس:</span>
                <span className="font-mono text-foreground font-semibold" dir="ltr">
                  {visit.patient.phone}
                </span>
              </div>
              {visit.patient.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1 font-semibold">یادداشت منشی / حساسیت:</span>
                  <p className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                    {visit.patient.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="py-3.5">
              <CardTitle className="text-xs flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                خدمت تعیین‌شده
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="font-bold text-sm text-foreground">{visit.service.name}</div>
              <div className="text-muted-foreground">دسته‌بندی: {visit.service.category}</div>
              <div className="text-foreground font-semibold">
                تعرفه مصوب: {formatToman(visit.service.price)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ناحیه انجام درمان و ثبت لاگ */}
        <div className="lg:col-span-2 space-y-6">
          {/* دکمه شروع درمان */}
          {!started ? (
            <Card className="border-2 border-dashed border-slate-300 text-center shadow-xs">
              <CardContent className="p-10 space-y-4">
                <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-xs">
                  <Play className="size-6 ms-0.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">بیمار در اتاق درمان حاضر است؟</h3>
                  <p className="text-xs text-muted-foreground">
                    با کلیک روی شروع درمان، زمان شروع فرآیند برای پرونده ثبت می‌شود.
                  </p>
                </div>
                <Button onClick={handleStart} disabled={starting} size="lg" className="px-8 shadow-xs font-bold">
                  {starting ? "در حال ثبت زمان..." : "شروع درمان"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleFinish} className="space-y-6">
              {/* بخش ۱: آپلود تصاویر قبل از درمان */}
              <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between py-3.5">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Camera className="size-4 text-primary" />
                    تصاویر قبل از عمل / درمان
                  </CardTitle>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-border shadow-xs">
                      <Upload className="size-3.5" />
                      {uploading ? "در حال آپلود..." : "افزودن عکس"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                </CardHeader>

                <CardContent>
                  {uploadError && (
                    <div className="p-2.5 mb-3 text-xs rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      {uploadError}
                    </div>
                  )}

                  {photos.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">
                      هنوز تصویری از موضع درمان ثبت نشده است. (جهت مقایسه و ارزیابی بالینی)
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          className="aspect-square rounded-control border border-border overflow-hidden bg-slate-50 relative group shadow-xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/uploads/${visit.id}/${p.filename}`}
                            alt="قبل از درمان"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* بخش ۲: ثبت مشخصات و متغیرهای درمانی */}
              <Card className="shadow-xs">
                <CardHeader className="py-3.5">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    ثبت جزئیات اجرایی درمان ({visit.service.name})
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* فیلدهای اختصاصی لیزر */}
                  {isLaser && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="تعداد شات دستگاه" htmlFor="shotCount">
                        <Input
                          id="shotCount"
                          type="number"
                          dir="ltr"
                          placeholder="مثال: 450"
                          value={shotCount}
                          onChange={(e) => setShotCount(e.target.value)}
                        />
                      </Field>
                      <Field label="سایز اسپات و توان (Joule / mm)" htmlFor="powerLens">
                        <Input
                          id="powerLens"
                          placeholder="مثال: 18mm / 14J"
                          dir="ltr"
                          value={powerLens}
                          onChange={(e) => setPowerLens(e.target.value)}
                        />
                      </Field>
                      <Field label="ناحیه بدن تحت درمان" htmlFor="area">
                        <Input
                          id="area"
                          placeholder="مثال: صورت کامل، زیر بغل..."
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </Field>
                    </div>
                  )}

                  {/* فیلدهای اختصاصی فیلر */}
                  {isFiller && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="برند فیلر مصرفی" htmlFor="brand">
                        <Input
                          id="brand"
                          placeholder="مثال: نورامیس، پرفکتا..."
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                        />
                      </Field>
                      <Field label="حجم تزریق (سی‌سی)" htmlFor="ccVolume">
                        <Input
                          id="ccVolume"
                          type="number"
                          step="0.1"
                          dir="ltr"
                          placeholder="مثال: 1.0"
                          value={ccVolume}
                          onChange={(e) => setCcVolume(e.target.value)}
                        />
                      </Field>
                      <Field label="موضع تزریق" htmlFor="area">
                        <Input
                          id="area"
                          placeholder="مثال: لب بالا و پایین..."
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </Field>
                    </div>
                  )}

                  {/* فیلدهای اختصاصی بوتاکس */}
                  {isBotox && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="برند بوتاکس" htmlFor="brand">
                        <Input
                          id="brand"
                          placeholder="مثال: دیسپورت، مصپورت..."
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                        />
                      </Field>
                      <Field label="میزان واحد تزریق (Unit)" htmlFor="units">
                        <Input
                          id="units"
                          type="number"
                          dir="ltr"
                          placeholder="مثال: 50"
                          value={units}
                          onChange={(e) => setUnits(e.target.value)}
                        />
                      </Field>
                      <Field label="موضع تزریق" htmlFor="area">
                        <Input
                          id="area"
                          placeholder="مثال: پیشانی و خط اخم..."
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                        />
                      </Field>
                    </div>
                  )}

                  {/* یادداشت آزاد درمان */}
                  <Field label="یادداشت و توصیه‌های مراقبت بعدی اپراتور" htmlFor="treatmentNotes">
                    <Input
                      id="treatmentNotes"
                      placeholder="توصیه‌های مصرف ترمیم‌کننده، تاریخ مراجعه بعدی..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Field>
                </CardContent>
              </Card>

              {/* دکمه اتمام درمان */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={finishing}
                  className="w-full h-12 text-base font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  <CheckCircle className="size-5" />
                  {finishing ? "در حال ثبت پایان درمان..." : "پایان درمان و ارجاع بیمار به صندوق"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
