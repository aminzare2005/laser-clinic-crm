"use client";

import { useState } from "react";
import { updateServiceAction } from "@/lib/actions/service";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";

interface ServiceData {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string | null;
}

export function EditServiceDialog({ service }: { service: ServiceData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(service.name);
  const [category, setCategory] = useState(service.category);
  const [price, setPrice] = useState(service.price.toString());
  const [description, setDescription] = useState(service.description || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateServiceAction(service.id, formData);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "خطا در ویرایش خدمت");
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
        className="gap-1 text-xs text-slate-600 hover:text-primary hover:bg-slate-100 cursor-pointer"
        title="ویرایش خدمت"
      >
        <Edit2 className="size-3.5" />
        <span>ویرایش</span>
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="ویرایش مشخصات خدمت و تعرفه"
        description="اطلاعات خدمت کلینیک را ویرایش و ذخیره نمایید."
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="نام خدمت" htmlFor={`edit-name-${service.id}`}>
            <Input
              id={`edit-name-${service.id}`}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: لیزر صورت کامل"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="دسته‌بندی" htmlFor={`edit-category-${service.id}`}>
              <Input
                id={`edit-category-${service.id}`}
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: لیزر، بوتاکس، فیلر"
                required
              />
            </Field>

            <Field label="قیمت ثابت (تومان)" htmlFor={`edit-price-${service.id}`}>
              <Input
                id={`edit-price-${service.id}`}
                name="price"
                type="number"
                dir="ltr"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 850000"
                required
              />
            </Field>
          </div>

          <Field label="توضیحات و پروتکل درمان" htmlFor={`edit-desc-${service.id}`}>
            <Input
              id={`edit-desc-${service.id}`}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات تکمیلی خدمت..."
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
              {loading ? "در حال ذخیره..." : "به‌روزرسانی خدمت"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
