"use client";

import { useState } from "react";
import { toggleServiceAction } from "@/lib/actions/service";
import { Button } from "@/components/ui/button";

export function ToggleServiceButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleServiceAction(id);
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="text-xs"
    >
      {isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
    </Button>
  );
}
