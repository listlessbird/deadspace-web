import { db } from "@/db"
import { postTable, schema, userTable } from "@/schema"
import { desc, eq, not, sql } from "drizzle-orm"

const userInclude = {
  id: userTable.id,
  username: userTable.username,
  displayName: userTable.displayName,
  avatarUrl: userTable.avatarUrl,
  bio: userTable.bio,
}

const postInclude = {
  id: postTable.id,
  content: postTable.content,
  createdAt: postTable.createdAt,
  username: userTable.username,
  displayName: userTable.displayName,
  avatarUrl: userTable.avatarUrl,
}

export async function getPostsByUser(userId: string) {
  const posts = await db
    .select(postInclude)
    .from(postTable)
    .innerJoin(userTable, eq(postTable.userId, userTable.id))
    .where(eq(userTable.id, userId))
    .orderBy(desc(postTable.createdAt))

  return posts
}

export async function getPostsWithUsers() {
  const posts = await db
    .select(postInclude)
    .from(postTable)
    .innerJoin(userTable, eq(postTable.userId, userTable.id))
    .orderBy(desc(postTable.createdAt))

  return posts
}

export async function getPosts() {
  const posts = await db
    .select()
    .from(postTable)
    .orderBy(desc(postTable.createdAt))

  return posts
}

export type PostType = Awaited<ReturnType<typeof getPosts>>[number]

export type PostWithUsers = Awaited<ReturnType<typeof getPostsByUser>>[number]

export async function getUsersToFollow(currUserId: string) {
  // use some algo
  const users = await db
    .select(userInclude)
    .from(schema.userTable)
    .where(not(eq(schema.userTable.id, currUserId)))
    .limit(5)

  return users
}

export type UserDisplayType = Awaited<
  ReturnType<typeof getUsersToFollow>
>[number]

export async function getTrendingTags(): Promise<
  { tag: string; count: number }[]
> {
  const query = sql<{ tag: string; count: bigint }[]>`
           SELECT
              LOWER(
                UNNEST(REGEXP_MATCHES(CONTENT, '#[[:alnum:]_]+', 'g'))
              ) AS tag,
              COUNT(*) AS COUNT
            FROM
              ${schema.postTable}
            GROUP BY
              tag
            ORDER BY
              COUNT DESC,
              tag ASC
            LIMIT
              5
        `
  const result = (await db.execute(query)) as unknown as {
    tag: string
    count: bigint
  }[]

  return result.map((row) => ({
    tag: row.tag,
    count: Number(row.count),
  }))
}
