"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RemoveAccountButton({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
      <Trash2 className="size-4 text-red-500" />
    </Button>
  );
}
