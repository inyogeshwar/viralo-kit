import { CalendarDays, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPosts } from "@/lib/analytics";
import { getDashboardContext } from "@/lib/context";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  published: "success",
  scheduled: "info",
  draft: "secondary",
  processing: "warning",
  partial: "warning",
  failed: "destructive",
};

export default async function CalendarPage() {
  const ctx = await getDashboardContext();
  const posts = await listPosts(ctx.workspace.id, 60);
  const scheduled = posts
    .filter((p) => p.status === "scheduled" || p.status === "draft")
    .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming scheduled and draft posts. Drag-and-drop rescheduling arrives with the scheduler
          phase (Inngest).
        </p>
      </div>

      {scheduled.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">Nothing scheduled</p>
              <p className="text-sm text-muted-foreground">
                Use the compose page and pick a schedule time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming posts</CardTitle>
            <CardDescription>Chronological list of scheduled and draft posts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {scheduled.map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <div>
                    <p className="max-w-[420px] truncate text-sm font-medium">
                      {post.caption || "(no caption)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(post.scheduledAt?.toISOString() ?? "")} · @
                      {post.accountUsername ?? "?"}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant[post.status] ?? "secondary"}>{post.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
