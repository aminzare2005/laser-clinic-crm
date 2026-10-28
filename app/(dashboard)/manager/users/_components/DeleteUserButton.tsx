"use client";

import { useState } from "react";
import { deleteUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({ id, displayName }: { id: string; displayName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`آیا از حذف حساب کاربری «${displayName}» اطمینان دارید؟`);
    if (!ok) return;

    setLoading(true);
    const res = await deleteUserAction(id);
    setLoading(false);

    if (!res.success) {
      alert(res.error || "خطا در حذف کاربر");
    } else if (res.message) {
      alert(res.message);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
      title="حذف پرسنل"
    >
      <Trash2 className="size-3.5" />
      <span>{loading ? "..." : "حذف"}</span>
    </Button>
  );
}
