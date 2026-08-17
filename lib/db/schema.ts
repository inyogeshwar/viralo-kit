import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "admin", "member", "viewer"]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "processing",
  "published",
  "partial",
  "failed",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    plan: text("plan").default("free").notNull(),
    ownerId: text("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("workspaces_owner_idx").on(table.ownerId)],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: roleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    platform: text("platform").default("instagram").notNull(),
    igUserId: text("ig_user_id").notNull(),
    username: text("username"),
    name: text("name"),
    profilePictureUrl: text("profile_picture_url"),
    accessToken: text("access_token").notNull(),
    tokenType: text("token_type").default("dev").notNull(),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    isActive: boolean("is_active").default(false).notNull(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("social_accounts_workspace_idx").on(table.workspaceId)],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => socialAccounts.id, { onDelete: "cascade" })
      .notNull(),
    platform: text("platform").default("instagram").notNull(),
    mediaType: text("media_type").notNull(),
    caption: text("caption"),
    mediaUrls: jsonb("media_urls").$type<string[]>(),
    status: postStatusEnum("status").default("draft").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    containerId: text("container_id"),
    mediaId: text("media_id"),
    permalink: text("permalink"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("posts_workspace_idx").on(table.workspaceId),
    index("posts_status_idx").on(table.status),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    publicId: text("public_id"),
    url: text("url").notNull(),
    mediaType: text("media_type").default("image").notNull(),
    width: text("width"),
    height: text("height"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("media_assets_workspace_idx").on(table.workspaceId)],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => socialAccounts.id, { onDelete: "cascade" })
      .notNull(),
    field: text("field").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("webhook_events_workspace_idx").on(table.workspaceId)],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => socialAccounts.id, { onDelete: "cascade" })
      .notNull(),
    igCommentId: text("ig_comment_id").notNull(),
    mediaId: text("media_id"),
    text: text("text").notNull(),
    fromUsername: text("from_username"),
    fromUserId: text("from_user_id"),
    replied: boolean("replied").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_workspace_idx").on(table.workspaceId),
    index("comments_ig_id_idx").on(table.igCommentId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => socialAccounts.id, { onDelete: "cascade" })
      .notNull(),
    igMessageId: text("ig_message_id").notNull(),
    igThreadId: text("ig_thread_id"),
    text: text("text"),
    fromUsername: text("from_username"),
    fromUserId: text("from_user_id"),
    isFromUs: boolean("is_from_us").default(false).notNull(),
    replied: boolean("replied").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_workspace_idx").on(table.workspaceId),
    index("messages_ig_id_idx").on(table.igMessageId),
  ],
);

export const autoReplyRules = pgTable(
  "auto_reply_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => socialAccounts.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    trigger: text("trigger").notNull(), // "keyword" | "all_dms" | "all_comments" | "new_follower"
    triggerValue: text("trigger_value"), // keyword(s) for keyword trigger, comma-separated
    matchType: text("match_type").default("contains").notNull(), // "contains" | "exact" | "starts_with" | "regex"
    channel: text("channel").default("dm").notNull(), // "dm" | "comment" | "private_reply"
    responseType: text("response_type").default("text").notNull(), // "text" | "quick_reply" | "button_template" | "generic_template"
    responsePayload: jsonb("response_payload"), // template/quick_reply JSON
    responseText: text("response_text").notNull(),
    delayMs: jsonb("delay_ms").$type<number>().default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    priority: jsonb("priority").$type<number>().default(0).notNull(),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
    triggerCount: jsonb("trigger_count").$type<number>().default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("auto_reply_rules_workspace_idx").on(table.workspaceId),
    index("auto_reply_rules_account_idx").on(table.accountId),
    index("auto_reply_rules_active_idx").on(table.isActive),
  ],
);

export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];
