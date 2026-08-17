import { NextRequest, NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { and, eq, desc } from "drizzle-orm";
import { requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, rules: [] });

  const rules = await db.query.autoReplyRules.findMany({
    where: eq(schema.autoReplyRules.workspaceId, ctx.workspace.id),
    orderBy: [desc(schema.autoReplyRules.priority), desc(schema.autoReplyRules.createdAt)],
  });

  return NextResponse.json({ ok: true, rules });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json();
  const {
    accountId,
    name,
    trigger,
    triggerValue,
    matchType,
    channel,
    responseType,
    responseText,
    responsePayload,
    delayMs,
    priority,
  } = body;

  if (!name || !trigger || !channel || !responseText) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: name, trigger, channel, responseText" },
      { status: 400 },
    );
  }

  const targetAccountId = accountId || ctx.accounts.find((a) => a.isActive)?.id || ctx.accounts[0]?.id;
  if (!targetAccountId) {
    return NextResponse.json({ ok: false, error: "No Instagram account connected" }, { status: 400 });
  }

  const inserted = await db
    .insert(schema.autoReplyRules)
    .values({
      workspaceId: ctx.workspace.id,
      accountId: targetAccountId,
      name,
      trigger,
      triggerValue: triggerValue ?? null,
      matchType: matchType ?? "contains",
      channel,
      responseType: responseType ?? "text",
      responseText,
      responsePayload: responsePayload ?? null,
      delayMs: delayMs ?? 0,
      priority: priority ?? 0,
    })
    .returning();

  return NextResponse.json({ ok: true, rule: inserted[0] });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json();
  const { ruleId, ...updates } = body;

  if (!ruleId) {
    return NextResponse.json({ ok: false, error: "Missing ruleId" }, { status: 400 });
  }

  const setValues: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.name !== undefined) setValues.name = updates.name;
  if (updates.trigger !== undefined) setValues.trigger = updates.trigger;
  if (updates.triggerValue !== undefined) setValues.triggerValue = updates.triggerValue;
  if (updates.matchType !== undefined) setValues.matchType = updates.matchType;
  if (updates.channel !== undefined) setValues.channel = updates.channel;
  if (updates.responseType !== undefined) setValues.responseType = updates.responseType;
  if (updates.responseText !== undefined) setValues.responseText = updates.responseText;
  if (updates.responsePayload !== undefined) setValues.responsePayload = updates.responsePayload;
  if (updates.delayMs !== undefined) setValues.delayMs = updates.delayMs;
  if (updates.priority !== undefined) setValues.priority = updates.priority;
  if (updates.isActive !== undefined) setValues.isActive = updates.isActive;

  await db
    .update(schema.autoReplyRules)
    .set(setValues)
    .where(
      and(
        eq(schema.autoReplyRules.id, ruleId),
        eq(schema.autoReplyRules.workspaceId, ctx.workspace.id),
      ),
    );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json();
  const { ruleId } = body;

  if (!ruleId) {
    return NextResponse.json({ ok: false, error: "Missing ruleId" }, { status: 400 });
  }

  await db
    .delete(schema.autoReplyRules)
    .where(
      and(
        eq(schema.autoReplyRules.id, ruleId),
        eq(schema.autoReplyRules.workspaceId, ctx.workspace.id),
      ),
    );

  return NextResponse.json({ ok: true });
}
