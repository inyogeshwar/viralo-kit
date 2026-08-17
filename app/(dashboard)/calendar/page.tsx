"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarDays, Clock, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";

interface ScheduledPost {
  id: string;
  caption: string | null;
  mediaType: string;
  status: string;
  scheduledAt: string | null;
  accountUsername: string | null;
}

const statusVariant: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  published: "success",
  scheduled: "info",
  draft: "secondary",
  processing: "warning",
  partial: "warning",
  failed: "destructive",
};

function SortablePost({
  post,
  onReschedule,
  onCancel,
}: {
  post: ScheduledPost;
  onReschedule: (id: string, date: Date) => void;
  onCancel: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-md border p-3 ${isDragging ? "ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button className="cursor-grab text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
          <GripVertical className="size-4" />
        </button>
        <CalendarDays className="size-4 text-muted-foreground" />
        <div>
          <p className="max-w-[420px] truncate text-sm font-medium">
            {post.caption || "(no caption)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {post.scheduledAt ? formatDateTime(post.scheduledAt) : "No date"} · @{post.accountUsername ?? "?"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={statusVariant[post.status] ?? "secondary"}>{post.status}</Badge>
        <Input
          type="datetime-local"
          defaultValue={post.scheduledAt?.slice(0, 16) ?? ""}
          onChange={(e) => {
            if (e.target.value) onReschedule(post.id, new Date(e.target.value));
          }}
          className="w-40 text-xs"
        />
        <Button variant="ghost" size="icon" className="size-7" onClick={() => onCancel(post.id)}>
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();
        if (!cancelled && data.ok) setPosts(data.posts ?? []);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setPosts((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [],
  );

  const handleReschedule = useCallback(async (id: string, date: Date) => {
    try {
      const res = await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, scheduledAt: date.toISOString() }),
      });
      const data = await res.json();
      if (data.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, scheduledAt: date.toISOString() } : p)),
        );
        setMessage("Rescheduled successfully");
        setTimeout(() => setMessage(null), 2000);
      }
    } catch {
      setMessage("Failed to reschedule");
      setTimeout(() => setMessage(null), 2000);
    }
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/calendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setMessage("Post cancelled");
        setTimeout(() => setMessage(null), 2000);
      }
    } catch {
      setMessage("Failed to cancel");
      setTimeout(() => setMessage(null), 2000);
    }
  }, []);

  const scheduled = posts.filter((p) => p.status === "scheduled" || p.status === "draft");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Drag to reorder, edit dates inline, or cancel scheduled posts.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          {message}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Clock className="mr-2 size-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading posts...</span>
          </CardContent>
        </Card>
      ) : scheduled.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">Nothing scheduled</p>
              <p className="text-sm text-muted-foreground">
                Use the compose page to schedule posts.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts ({scheduled.length})</CardTitle>
            <CardDescription>Drag to reorder priority. Edit dates inline.</CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={scheduled.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {scheduled.map((post) => (
                    <SortablePost
                      key={post.id}
                      post={post}
                      onReschedule={handleReschedule}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
