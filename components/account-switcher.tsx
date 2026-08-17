"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Account {
  id: string;
  igUserId: string;
  username: string | null;
  name: string | null;
  tokenType: string;
}

export function AccountSwitcher({ mockMode }: { mockMode: boolean }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setAccounts(data.accounts ?? []);
          setActiveId(data.activeId ?? "");
        }
      })
      .catch(() => undefined);
  }, []);

  async function onChange(id: string) {
    setActiveId(id);
    await fetch("/api/accounts/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  const active = accounts.find((a) => a.id === activeId);

  return (
    <div className="flex items-center gap-2">
      {mockMode ? <Badge variant="warning">Mock mode</Badge> : null}
      <Select value={activeId || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={accounts.length ? "Select account" : "No accounts"} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              @{account.username ?? account.igUserId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {active ? <span className="hidden text-xs text-muted-foreground sm:inline">{active.name}</span> : null}
    </div>
  );
}
