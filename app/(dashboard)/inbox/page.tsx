import { MessageCircle, MessageSquare, Inbox as InboxIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb, schema } from "@/lib/db";
import { getDashboardContext } from "@/lib/context";
import { formatDate } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const ctx = await getDashboardContext();
  const { workspace } = ctx;
  const db = getDb();

  let comments: Array<Record<string, unknown>> = [];
  let messages: Array<Record<string, unknown>> = [];

  if (db) {
    comments = await db
      .select({
        id: schema.comments.id,
        igCommentId: schema.comments.igCommentId,
        mediaId: schema.comments.mediaId,
        text: schema.comments.text,
        fromUsername: schema.comments.fromUsername,
        replied: schema.comments.replied,
        createdAt: schema.comments.createdAt,
        accountUsername: schema.socialAccounts.username,
      })
      .from(schema.comments)
      .leftJoin(schema.socialAccounts, eq(schema.comments.accountId, schema.socialAccounts.id))
      .where(eq(schema.comments.workspaceId, workspace.id))
      .orderBy(desc(schema.comments.createdAt))
      .limit(50)
      .then((rows) => rows as unknown as Array<Record<string, unknown>>);

    messages = await db
      .select({
        id: schema.messages.id,
        igMessageId: schema.messages.igMessageId,
        text: schema.messages.text,
        fromUsername: schema.messages.fromUsername,
        isFromUs: schema.messages.isFromUs,
        replied: schema.messages.replied,
        createdAt: schema.messages.createdAt,
        accountUsername: schema.socialAccounts.username,
      })
      .from(schema.messages)
      .leftJoin(schema.socialAccounts, eq(schema.messages.accountId, schema.socialAccounts.id))
      .where(eq(schema.messages.workspaceId, workspace.id))
      .orderBy(desc(schema.messages.createdAt))
      .limit(50)
      .then((rows) => rows as unknown as Array<Record<string, unknown>>);
  }

  const totalComments = comments.length;
  const totalMessages = messages.length;
  const unrepliedComments = comments.filter((c) => !c["replied"]).length;
  const unrepliedMessages = messages.filter((m) => !m["replied"] && !m["isFromUs"]).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Comments and DMs from your connected accounts. Webhook events appear here in real-time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <MessageSquare className="size-5 text-sky-500" />
            <div>
              <p className="text-lg font-bold tabular-nums">{totalComments}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <MessageCircle className="size-5 text-violet-500" />
            <div>
              <p className="text-lg font-bold tabular-nums">{totalMessages}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="size-5 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-600">{unrepliedComments}</span>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{unrepliedComments}</p>
              <p className="text-xs text-muted-foreground">Unreplied comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="size-5 rounded-full bg-rose-500/10 flex items-center justify-center">
              <span className="text-xs font-bold text-rose-600">{unrepliedMessages}</span>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{unrepliedMessages}</p>
              <p className="text-xs text-muted-foreground">Unreplied DMs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              Comments
            </CardTitle>
            <CardDescription>Latest comments on your posts.</CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <InboxIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No comments yet. Set up webhooks to receive them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={String(c["id"])} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          @{String(c["fromUsername"] ?? "unknown")} · {String(c["accountUsername"] ?? "")}
                        </p>
                        <p className="mt-1 text-sm">{String(c["text"])}</p>
                      </div>
                      <Badge variant={c["replied"] ? "success" : "warning"} className="shrink-0 text-[10px]">
                        {c["replied"] ? "replied" : "new"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(String(c["createdAt"] ?? ""))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="size-4" />
              Direct Messages
            </CardTitle>
            <CardDescription>Latest DMs from your followers.</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <InboxIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No messages yet. Set up webhooks to receive them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={String(m["id"])} className={`rounded-lg border p-3 ${m["isFromUs"] ? "bg-primary/5" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {m["isFromUs"] ? "You" : `@${String(m["fromUsername"] ?? "unknown")}`} · {String(m["accountUsername"] ?? "")}
                        </p>
                        <p className="mt-1 text-sm">{String(m["text"] ?? "(no text)")}</p>
                      </div>
                      <Badge variant={m["replied"] ? "success" : m["isFromUs"] ? "secondary" : "warning"} className="shrink-0 text-[10px]">
                        {m["replied"] ? "replied" : m["isFromUs"] ? "sent" : "new"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(String(m["createdAt"] ?? ""))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
