"use client";

import { useState } from "react";
import { toggleUserAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";

export function ToggleUserButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleUserAction(id);
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
      {isActive ? "مسدودسازی" : "فعال‌سازی"}
    </Button>
  );
}
