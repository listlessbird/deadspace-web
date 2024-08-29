import { db } from "@/db"
import { eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm"
import {
  AnyPgColumn,
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

export const postTable = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content"),
  userId: text("user_id")
    .references(() => userTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
})

export type BasePostType = typeof postTable.$inferSelect
export const followerRelation = pgTable(
  "follower_relation",
  {
    followFrom: text("follow_from")
      .notNull()
      .references(() => userTable.id),
    followTo: text("follow_to")
      .notNull()
      .references(() => userTable.id),
    relationBeganOn: timestamp("relationship_start_on", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followFrom, table.followTo] }),
      noSelfFollow: sql`CHECK (${table.followFrom} <> ${table.followTo})`,
    }
  },
)

export const mediaType = pgEnum("media_type", ["video", "image"])

export const postAttachments = pgTable("post_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  // rather than removing the record when a post is delted we need to remove the attachment from the media/file store
  postId: uuid("post_id").references(() => postTable.id, {
    onDelete: "set null",
  }),
  attachmentUrl: text("attachment_url"),
  attachmentType: mediaType("attachment_type"),
  blurhash: text("blurhash"),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
})

export type postAttachmentTableInsertType = InferInsertModel<
  typeof postAttachments
>

export type postAttachmentTableSelectType = InferSelectModel<
  typeof postAttachments
>

export const postLikesTable = pgTable(
  "post_likes",
  {
    userId: text("user_id")
      .references(() => userTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    postId: uuid("post_id")
      .references(() => postTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => {
    return {
      pk: primaryKey({ columns: [t.postId, t.userId] }),
      uniqueRecord: unique("uniq_like").on(t.postId, t.userId),
    }
  },
)

export const bookMarksTable = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => userTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    postId: uuid("post_id")
      .references(() => postTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => {
    return {
      uniqueRecord: unique("uniq_bookmark").on(t.postId, t.userId),
    }
  },
)

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("post_id")
    .references(() => postTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => commentsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
})

export const notificationTypes = pgEnum("notification_types", [
  "post-like",
  "comment-like",
  "post-comment",
  "comment-reply",
  "follow",
  "mention",
  "system",
])

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipientId: text("recipient_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  // id of the user who did some action in the notification_types and triggered the notification
  issuerId: text("issuer_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  type: notificationTypes("type").default("system").notNull(),
  content: text("content").notNull(),
  resourceId: uuid("resource_id").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
})

export const schema = {
  userTable,
  sessionTable,
  postTable,
  followerRelation,
  postLikesTable,
  postAttachments,
  bookMarksTable,
}
