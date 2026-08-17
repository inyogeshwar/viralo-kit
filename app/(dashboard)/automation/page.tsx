"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Trash2, Loader2, Power, PowerOff, MessageSquare, AtSign, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AutoReplyRule {
  id: string;
  name: string;
  trigger: string;
  triggerValue: string | null;
  matchType: string;
  channel: string;
  responseType: string;
  responseText: string;
  delayMs: number;
  isActive: boolean;
  priority: number;
  triggerCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
}

interface Account {
  id: string;
  igUserId: string;
  username: string | null;
}

const triggerLabels: Record<string, string> = {
  keyword: "Keyword Match",
  all_dms: "All DMs",
  all_comments: "All Comments",
  new_follower: "New Follower",
};

const channelLabels: Record<string, string> = {
  dm: "DM Reply",
  comment: "Comment Reply",
  private_reply: "Private Reply to Commenter",
};

const channelIcons: Record<string, typeof MessageSquare> = {
  dm: MessageSquare,
  comment: AtSign,
  private_reply: Send,
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTrigger, setFormTrigger] = useState("keyword");
  const [formTriggerValue, setFormTriggerValue] = useState("");
  const [formMatchType, setFormMatchType] = useState("contains");
  const [formChannel, setFormChannel] = useState("dm");
  const [formResponseText, setFormResponseText] = useState("");
  const [formDelay, setFormDelay] = useState(0);
  const [formPriority, setFormPriority] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [rulesRes, accountsRes] = await Promise.all([
          fetch("/api/automation"),
          fetch("/api/accounts"),
        ]);
        const rulesData = await rulesRes.json();
        const accountsData = await accountsRes.json();
        if (!cancelled) {
          if (rulesData.ok) setRules(rulesData.rules ?? []);
          if (accountsData.ok) {
            setAccounts(accountsData.accounts ?? []);
            if (accountsData.activeId) setAccountId(accountsData.activeId);
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function saveRule() {
    if (!formName || !formResponseText) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          name: formName,
          trigger: formTrigger,
          triggerValue: formTrigger === "keyword" ? formTriggerValue : null,
          matchType: formMatchType,
          channel: formChannel,
          responseText: formResponseText,
          delayMs: formDelay,
          priority: formPriority,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to save");
      setMessage({ kind: "ok", text: "Rule created" });
      setShowForm(false);
      setFormName("");
      setFormTriggerValue("");
      setFormResponseText("");
      // Reload rules
      const res2 = await fetch("/api/automation");
      const data2 = await res2.json();
      if (data2.ok) setRules(data2.rules ?? []);
    } catch (err) {
      setMessage({ kind: "error", text: String(err instanceof Error ? err.message : err) });
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(ruleId: string, isActive: boolean) {
    try {
      await fetch("/api/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, isActive: !isActive }),
      });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, isActive: !isActive } : r)));
    } catch {
      // silent
    }
  }

  async function deleteRule(ruleId: string) {
    try {
      await fetch("/api/automation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId }),
      });
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch {
      // silent
    }
  }

  const activeCount = rules.filter((r) => r.isActive).length;
  const totalTriggers = rules.reduce((sum, r) => sum + (r.triggerCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automation</h1>
          <p className="text-sm text-muted-foreground">
            Auto-reply to DMs, comments, and mentions with smart rules.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 size-3.5" />
          New Rule
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Bot className="size-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active rules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Send className="size-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{totalTriggers}</p>
              <p className="text-xs text-muted-foreground">Total triggers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MessageSquare className="size-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-xs text-muted-foreground">Total rules</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Auto-Reply Rule</CardTitle>
            <CardDescription>Define when and how to auto-respond.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Rule Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Welcome DM" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>@{a.username ?? a.igUserId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label>Trigger</Label>
                <Select value={formTrigger} onValueChange={setFormTrigger}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword Match</SelectItem>
                    <SelectItem value="all_dms">All DMs</SelectItem>
                    <SelectItem value="all_comments">All Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Channel</Label>
                <Select value={formChannel} onValueChange={setFormChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm">DM Reply</SelectItem>
                    <SelectItem value="comment">Comment Reply</SelectItem>
                    <SelectItem value="private_reply">Private Reply to Commenter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Match Type</Label>
                <Select value={formMatchType} onValueChange={setFormMatchType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="starts_with">Starts With</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formTrigger === "keyword" && (
              <div className="flex flex-col gap-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={formTriggerValue}
                  onChange={(e) => setFormTriggerValue(e.target.value)}
                  placeholder="price, buy, order, help"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Response Text</Label>
              <Textarea
                value={formResponseText}
                onChange={(e) => setFormResponseText(e.target.value)}
                placeholder="Thanks for reaching out! How can we help?"
                className="min-h-20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Delay (ms)</Label>
                <Input
                  type="number"
                  value={formDelay}
                  onChange={(e) => setFormDelay(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Priority (higher = checked first)</Label>
                <Input
                  type="number"
                  value={formPriority}
                  onChange={(e) => setFormPriority(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveRule} disabled={saving || !formName || !formResponseText}>
                {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Plus className="mr-1.5 size-3.5" />}
                Create Rule
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 size-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading rules...</span>
          </CardContent>
        </Card>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bot className="size-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">No automation rules</p>
              <p className="text-sm text-muted-foreground">
                Create your first rule to auto-reply to DMs and comments.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Rules ({rules.length})</CardTitle>
            <CardDescription>Active rules are processed on incoming webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rules.map((rule) => {
              const Icon = channelIcons[rule.channel] ?? MessageSquare;
              return (
                <div key={rule.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{rule.name}</p>
                        <Badge variant={rule.isActive ? "success" : "secondary"}>
                          {rule.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Badge variant="outline">{triggerLabels[rule.trigger] ?? rule.trigger}</Badge>
                        <Badge variant="outline">{channelLabels[rule.channel] ?? rule.channel}</Badge>
                      </div>
                      <p className="max-w-[400px] truncate text-xs text-muted-foreground">
                        {rule.responseText}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Triggered {rule.triggerCount ?? 0} times
                        {rule.lastTriggeredAt ? ` · Last: ${new Date(rule.lastTriggeredAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => toggleRule(rule.id, rule.isActive)}>
                      {rule.isActive ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
