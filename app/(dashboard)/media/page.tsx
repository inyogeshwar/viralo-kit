"use client";

import { useEffect, useState } from "react";
import { Check, Cloud, Images, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CloudinaryResource {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function MediaPage() {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/media/cloudinary");
        const data = await res.json();
        if (!cancelled && data.ok) {
          setResources(data.resources ?? []);
          setTotal(data.total ?? 0);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === resources.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(resources.map((r) => r.publicId)));
    }
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    setDeleting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/media/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ ok: true, text: `Deleted ${data.deleted} of ${data.total} images.` });
        setSelected(new Set());
        const listRes = await fetch("/api/media/cloudinary");
        const listData = await listRes.json();
        if (listData.ok) {
          setResources(listData.resources ?? []);
          setTotal(listData.total ?? 0);
        }
      } else {
        setMsg({ ok: false, text: data.error || "Delete failed" });
      }
    } catch (err) {
      setMsg({ ok: false, text: String(err) });
    } finally {
      setDeleting(false);
    }
  }

  const totalBytes = resources.reduce((s, r) => s + r.bytes, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media library</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Cloudinary images. Delete unused files to free storage.
          </p>
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={deleting}>
            {deleting ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Trash2 className="mr-1.5 size-3.5" />}
            Delete {selected.size} image{selected.size > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <Cloud className="size-5 text-sky-500" />
            <div>
              <p className="text-lg font-bold tabular-nums">{total}</p>
              <p className="text-xs text-muted-foreground">Total images</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <Images className="size-5 text-violet-500" />
            <div>
              <p className="text-lg font-bold tabular-nums">{formatBytes(totalBytes)}</p>
              <p className="text-xs text-muted-foreground">Storage used</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-600">25</span>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{(25 - totalBytes / 1073741824).toFixed(2)} GB</p>
              <p className="text-xs text-muted-foreground">Free tier remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {msg && (
        <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"}`}>
          {msg.text}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Cloudinary images</CardTitle>
            <CardDescription>
              {resources.length > 0 && (
                <button onClick={toggleAll} className="underline underline-offset-2 hover:text-foreground">
                  {selected.size === resources.length ? "Deselect all" : "Select all"}
                </button>
              )}
            </CardDescription>
          </div>
          <Badge variant="secondary">{resources.length}</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Images className="size-10 text-muted-foreground" />
              <p className="font-semibold">No images yet</p>
              <p className="text-sm text-muted-foreground">Published posts appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {resources.map((r) => (
                <figure
                  key={r.publicId}
                  className={`group relative overflow-hidden rounded-lg border-2 transition-all ${selected.has(r.publicId) ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"}`}
                >
                  <button onClick={() => toggle(r.publicId)} className="block w-full text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.url}
                      alt={r.publicId.split("/").pop() ?? "image"}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                  {selected.has(r.publicId) && (
                    <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </div>
                  )}
                  <figcaption className="flex items-center justify-between px-2 py-1.5">
                    <span className="truncate text-xs text-muted-foreground">
                      {formatBytes(r.bytes)} · {r.format.toUpperCase()}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
