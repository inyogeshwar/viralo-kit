"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlugZap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AddAccountForm() {
  const router = useRouter();
  const [igUserId, setIgUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addDevToken() {
    if (!igUserId.trim() || !accessToken.trim()) {
      setMessage("Fill in both the IG user ID and access token.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igUserId, accessToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to add account");
      setIgUserId("");
      setAccessToken("");
      router.refresh();
    } catch (err) {
      setMessage(String(err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <a href="/api/instagram/connect">
        <Button className="w-full" type="button">
          <PlugZap /> Connect with Instagram (OAuth)
        </Button>
      </a>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or add a dev token</span>
        <Separator className="flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="dev-ig-id">Instagram user ID</Label>
        <Input
          id="dev-ig-id"
          value={igUserId}
          onChange={(e) => setIgUserId(e.target.value)}
          placeholder="e.g. 17841441536072453"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="dev-token">Access token</Label>
        <Input
          id="dev-token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Paste token (stored encrypted server-side)"
          type="password"
        />
      </div>
      <Button type="button" variant="outline" onClick={addDevToken} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Save dev token
      </Button>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
