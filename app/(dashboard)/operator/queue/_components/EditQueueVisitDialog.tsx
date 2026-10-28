"use client";

import { useState } from "react";
import { updateWaitingVisitAction } from "@/lib/actions/visit";
import { formatToman } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface VisitItem {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
    notes?: string | null;
  };
  service: {
    id: string;
    name: string;
    price: number;
  };
}

export function EditQueueVisitDialog({
  visit,
  services,
}: {
  visit: VisitItem;
  services: ServiceItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState(visit.service.id);
  const [notes, setNotes] = useState(visit.patient.notes || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await updateWaitingVisitAction(visit.id, {
      serviceId: selectedServiceId,
      notes,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "خطا در ویرایش نوبت");
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
        title="ویرایش نوبت در صف"
      >
        <Edit2 className="size-3.5" />
        <span>ویرایش</span>
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={`ویرایش نوبت مراجع: ${visit.patient.firstName} ${visit.patient.lastName}`}
        description="تغییر خدمت درخواستی یا یادداشت بالینی بیمار در صف انتظار سالن"
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="تغییر خدمت درخواستی" htmlFor={`edit-service-${visit.id}`}>
            <select
              id={`edit-service-${visit.id}`}
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="flex h-11 w-full rounded-field border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category}) — {formatToman(s.price)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="یادداشت منشی یا حساسیت بیمار" htmlFor={`edit-notes-${visit.id}`}>
            <Input
              id={`edit-notes-${visit.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: پوست حساس، تزریق با بی‌حسی..."
            />
          </Field>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ذخیره..." : "ثبت تغییرات"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
