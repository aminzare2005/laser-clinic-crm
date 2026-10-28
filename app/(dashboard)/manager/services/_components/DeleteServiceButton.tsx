"use client";

import { useState } from "react";
import { deleteServiceAction } from "@/lib/actions/service";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteServiceButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`آیا از حذف خدمت «${name}» اطمینان دارید؟`);
    if (!ok) return;

    setLoading(true);
    const res = await deleteServiceAction(id);
    setLoading(false);

    if (!res.success) {
      alert(res.error || "خطا در حذف خدمت");
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
      title="حذف خدمت"
    >
      <Trash2 className="size-3.5" />
      <span>{loading ? "..." : "حذف"}</span>
    </Button>
  );
}
