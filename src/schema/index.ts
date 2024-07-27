import { db } from "@/db"
import { eq } from "drizzle-orm"
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core"

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

// jn table for keeping the follower relation
// follower_id - id of user who's following another
// followed_id - id of user who's being followed

export const followerRelation = pgTable(
  "follower_relation",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => userTable.id),
    followedId: text("followed_id")
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
      pk: primaryKey({ columns: [table.followerId, table.followedId] }),
    }
  },
)

export const schema = { userTable, sessionTable, postTable, followerRelation }
