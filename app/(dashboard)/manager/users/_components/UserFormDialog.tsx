"use client";

import { useState } from "react";
import { createUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function UserFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "خطا در ثبت کاربر");
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-xs">
        <Plus className="size-4" />
        ثبت کاربر جدید
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="ایجاد حساب پرسنل"
        description="اطلاعات کاربری و نقش پرسنل جدید کلینیک را تعریف نمایید."
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="نام و نام خانوادگی" htmlFor="displayName">
            <Input
              id="displayName"
              name="displayName"
              placeholder="مثال: مریم کاظمی"
              required
            />
          </Field>

          <Field label="نام کاربری (جهت ورود)" htmlFor="username">
            <Input
              id="username"
              name="username"
              dir="ltr"
              placeholder="مثال: maryam"
              required
            />
          </Field>

          <Field label="رمز عبور اولیه" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              dir="ltr"
              placeholder="حداقل ۶ کاراکتر"
              required
            />
          </Field>

          <Field label="نقش در کلینیک" htmlFor="role">
            <select
              id="role"
              name="role"
              defaultValue="OPERATOR"
              className="flex h-11 w-full rounded-field border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
            >
              <option value="OPERATOR">اپراتور درمان</option>
              <option value="SECRETARY">منشی پذیرش</option>
              <option value="MANAGER">مدیر کلینیک</option>
            </select>
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
              {loading ? "در حال ذخیره..." : "ایجاد کاربر"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
