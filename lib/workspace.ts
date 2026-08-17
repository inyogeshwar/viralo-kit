import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { mockAccounts } from "@/lib/mock";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface AccountRow {
  id: string;
  workspaceId: string;
  platform: string;
  igUserId: string;
  username: string | null;
  name: string | null;
  profilePictureUrl: string | null;
  tokenType: string;
  accessToken: string;
  isActive: boolean;
  createdAt: Date;
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "workspace"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function ensureWorkspace(
  userId: string,
  user: { email?: string | null; name?: string | null; imageUrl?: string | null },
): Promise<Workspace> {
  const db = getDb();
  if (!db) {
    return { id: "mock-workspace", name: "My Workspace", slug: "my-workspace", plan: "free" };
  }

  await db
    .insert(schema.users)
    .values({
      id: userId,
      email: user.email ?? null,
      name: user.name ?? null,
      imageUrl: user.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { email: user.email ?? null, name: user.name ?? null, imageUrl: user.imageUrl ?? null },
    });

  const existing = await db.query.workspaceMembers.findFirst({
    where: eq(schema.workspaceMembers.userId, userId),
  });
  if (existing) {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, existing.workspaceId),
    });
    if (workspace) {
      return { id: workspace.id, name: workspace.name, slug: workspace.slug, plan: workspace.plan };
    }
  }

  const name = user.name ? `${user.name}'s Workspace` : "My Workspace";
  const created = await db
    .insert(schema.workspaces)
    .values({ name, slug: slugify(name), ownerId: userId })
    .returning();
  await db.insert(schema.workspaceMembers).values({
    workspaceId: created[0].id,
    userId,
    role: "owner",
  });
  return { id: created[0].id, name: created[0].name, slug: created[0].slug, plan: created[0].plan };
}

export async function listAccounts(workspaceId: string): Promise<AccountRow[]> {
  const db = getDb();
  if (!db) return mockAccounts;
  const rows = await db
    .select()
    .from(schema.socialAccounts)
    .where(eq(schema.socialAccounts.workspaceId, workspaceId))
    .orderBy(schema.socialAccounts.createdAt);
  return rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspaceId,
    platform: r.platform,
    igUserId: r.igUserId,
    username: r.username,
    name: r.name,
    profilePictureUrl: r.profilePictureUrl,
    tokenType: r.tokenType,
    accessToken: r.accessToken,
    isActive: r.isActive,
    createdAt: r.createdAt,
  }));
}

export async function getActiveAccount(workspaceId: string): Promise<AccountRow | null> {
  const db = getDb();
  const accounts = await listAccounts(workspaceId);
  if (!accounts.length) return null;
  const active = accounts.find((a) => a.isActive) ?? accounts[0];
  if (db && !active.isActive) {
    await db
      .update(schema.socialAccounts)
      .set({ isActive: true })
      .where(eq(schema.socialAccounts.id, active.id));
    active.isActive = true;
  }
  return active;
}

export async function setActiveAccount(workspaceId: string, accountId: string) {
  const db = getDb();
  if (!db) return true;
  await db
    .update(schema.socialAccounts)
    .set({ isActive: false })
    .where(eq(schema.socialAccounts.workspaceId, workspaceId));
  const result = await db
    .update(schema.socialAccounts)
    .set({ isActive: true })
    .where(and(eq(schema.socialAccounts.id, accountId), eq(schema.socialAccounts.workspaceId, workspaceId)))
    .returning();
  return result.length > 0;
}

export { env };
