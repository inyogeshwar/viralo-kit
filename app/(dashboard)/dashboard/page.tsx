import Link from "next/link";
import { Eye, Heart, Image, Megaphone, PenSquare, TrendingUp, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getAccountAnalytics, listPosts } from "@/lib/analytics";
import { getDashboardContext } from "@/lib/context";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
    published: "success",
    scheduled: "info",
    draft: "secondary",
    processing: "warning",
    partial: "warning",
    failed: "destructive",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

const statColors = [
  "from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400",
  "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400",
  "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
  "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  "from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400",
  "from-pink-500/10 to-pink-500/5 text-pink-600 dark:text-pink-400",
];

export default async function DashboardPage() {
  const ctx = await getDashboardContext();
  const { activeAccount, workspace } = ctx;

  const analytics = activeAccount ? await getAccountAnalytics(activeAccount) : null;
  const posts = await listPosts(workspace.id, 10);

  const account = (analytics?.account ?? {}) as Record<string, unknown>;
  const insights = (analytics?.insights ?? {}) as Record<string, unknown>;

  const stats = [
    { label: "Followers", value: account["followersCount"], icon: Users },
    { label: "Posts", value: account["mediaCount"], icon: Image },
    { label: "Reach", value: insights["reach"], icon: Eye },
    { label: "Profile views", value: insights["profileViews"], icon: TrendingUp },
    { label: "Total interactions", value: insights["totalInteractions"], icon: Heart },
    { label: "Accounts engaged", value: insights["accountsEngaged"], icon: Megaphone },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {activeAccount
              ? `Overview for @${activeAccount.username ?? activeAccount.igUserId}`
              : "Connect an Instagram account to see analytics."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/compose">
              <PenSquare className="mr-1.5 size-3.5" />
              New post
            </Link>
          </Button>
          {!activeAccount && (
            <Button asChild size="sm">
              <Link href="/accounts">
                <Zap className="mr-1.5 size-3.5" />
                Connect account
              </Link>
            </Button>
          )}
        </div>
      </div>

      {activeAccount ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, i) => (
              <Card key={stat.label} className="relative overflow-hidden py-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${statColors[i]} opacity-50`} />
                <CardContent className="relative flex flex-col gap-1 px-4">
                  <stat.icon className="size-4 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums">
                    {formatNumber(stat.value as number | null | undefined)}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent posts</CardTitle>
              <CardDescription>Latest posts across your connected account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Scheduled</TableHead>
                      <TableHead className="hidden md:table-cell">Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No posts yet. Create your first post from the compose page.
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="max-w-[200px] truncate font-medium sm:max-w-[260px]">
                            {post.caption || "(no caption)"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell capitalize">{post.mediaType}</TableCell>
                          <TableCell>
                            <StatusBadge status={post.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {formatDateTime(post.scheduledAt?.toISOString() ?? "")}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {formatDateTime(post.publishedAt?.toISOString() ?? "")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Users className="size-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">No Instagram account connected</p>
              <p className="text-sm text-muted-foreground">
                Connect via Instagram OAuth or paste a dev token to get started.
              </p>
            </div>
            <Button asChild>
              <Link href="/accounts">Connect an account</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
