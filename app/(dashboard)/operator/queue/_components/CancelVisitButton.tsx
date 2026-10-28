"use client";

import { useState } from "react";
import { cancelVisitAction, deleteWaitingVisitAction } from "@/lib/actions/visit";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { UserX, Trash2, LogOut } from "lucide-react";

export function CancelVisitButton({
  visitId,
  patientName,
}: {
  visitId: string;
  patientName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"cancel" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setLoadingAction("cancel");
    const res = await cancelVisitAction(visitId, "انصراف مراجع از انتظار در سالن");
    setLoadingAction(null);

    if (!res.success) {
      setError(res.error || "خطا در لغو نوبت");
    } else {
      setIsOpen(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setLoadingAction("delete");
    const res = await deleteWaitingVisitAction(visitId);
    setLoadingAction(null);

    if (!res.success) {
      setError(res.error || "خطا در حذف نوبت");
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shadow-xs"
        title="لغو یا حذف نوبت"
      >
        <UserX className="size-3.5" />
        <span>لغو / حذف</span>
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={`تعیین وضعیت نوبت: ${patientName}`}
        description="یکی از گزینه‌های زیر را جهت خروج مراجع از صف انتظار انتخاب نمایید:"
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3 py-2">
          {/* گزینه ۱: انصراف بیمار */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <LogOut className="size-4 text-amber-600" />
              <span>انصراف مراجع (بیمار تصمیم گرفت صبر نکند و رفت)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              پرونده حفظ شده و وضعیت ویزیت به «لغو شده» تغییر می‌یابد تا در سوابق مراجعین کلینیک ثبت بماند.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingAction !== null}
              onClick={handleCancel}
              className="w-full text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              {loadingAction === "cancel" ? "در حال ثبت انصراف..." : "ثبت انصراف مراجع و خروج از صف"}
            </Button>
          </div>

          {/* گزینه ۲: ثبت اشتباه و حذف کامل */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <Trash2 className="size-4 text-rose-600" />
              <span>ثبت اشتباه نوبت (حذف کامل از دیتابیس)</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              این نوبت به اشتباه برای بیمار ثبت شده و به طور کامل از تابلوی صف انتظار حذف خواهد شد.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={loadingAction !== null}
              onClick={handleDelete}
              className="w-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              {loadingAction === "delete" ? "در حال حذف..." : "حذف کامل نوبت اشتباه"}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={loadingAction !== null}
          >
            انصراف و بستن
          </Button>
        </div>
      </Dialog>
    </>
  );
}
