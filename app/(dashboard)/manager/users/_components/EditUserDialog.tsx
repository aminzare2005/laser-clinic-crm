"use client";

import { useState } from "react";
import { updateUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  displayName: string;
  role: "MANAGER" | "SECRETARY" | "OPERATOR";
}

export function EditUserDialog({ user }: { user: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateUserAction(user.id, formData);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "خطا در ویرایش کاربر");
    } else {
      setIsOpen(false);
      setPassword("");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1 text-xs text-slate-600 hover:text-primary hover:bg-slate-100 cursor-pointer"
        title="ویرایش پرسنل"
      >
        <Edit2 className="size-3.5" />
        <span>ویرایش</span>
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="ویرایش حساب پرسنل"
        description="اطلاعات کاربری، نام، نقش و در صورت نیاز رمز عبور جدید را تعیین نمایید."
      >
        {error && (
          <div className="p-3 mb-4 text-xs rounded-control bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="نام و نام خانوادگی" htmlFor={`edit-display-${user.id}`}>
            <Input
              id={`edit-display-${user.id}`}
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="مثال: مریم کاظمی"
              required
            />
          </Field>

          <Field label="نام کاربری (جهت ورود)" htmlFor={`edit-username-${user.id}`}>
            <Input
              id={`edit-username-${user.id}`}
              name="username"
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: maryam"
              required
            />
          </Field>

          <Field label="رمز عبور جدید (در صورت تمایل به تغییر خالی نگذارید)" htmlFor={`edit-password-${user.id}`}>
            <Input
              id={`edit-password-${user.id}`}
              name="password"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="خالی بگذارید تا رمز تغییر نکند"
            />
          </Field>

          <Field label="نقش در کلینیک" htmlFor={`edit-role-${user.id}`}>
            <select
              id={`edit-role-${user.id}`}
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "MANAGER" | "SECRETARY" | "OPERATOR")}
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
              {loading ? "در حال ذخیره..." : "به‌روزرسانی حساب"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
