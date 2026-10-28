"use client";

import { useState } from "react";
import { createServiceAction } from "@/lib/actions/service";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function ServiceFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createServiceAction(formData);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "خطا در ثبت خدمت");
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-xs">
        <Plus className="size-4" />
        افزودن خدمت جدید
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="تعریف خدمت و تعرفه جدید"
        description="مشخصات خدمت درمانی و تعرفه مصوب کلینیک را وارد نمایید."
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="نام خدمت" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="مثال: لیزر صورت کامل"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="دسته‌بندی" htmlFor="category">
              <Input
                id="category"
                name="category"
                placeholder="مثال: لیزر، بوتاکس، فیلر"
                required
              />
            </Field>

            <Field label="قیمت ثابت (تومان)" htmlFor="price">
              <Input
                id="price"
                name="price"
                type="number"
                dir="ltr"
                placeholder="مثال: 850000"
                required
              />
            </Field>
          </div>

          <Field label="توضیحات و پروتکل درمان" htmlFor="description">
            <Input
              id="description"
              name="description"
              placeholder="توضیحات تکمیلی..."
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
              {loading ? "در حال ثبت..." : "ذخیره خدمت"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
