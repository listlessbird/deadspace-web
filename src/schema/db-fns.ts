import { db } from "@/db"
import { followerRelation, postTable, schema, userTable } from "@/schema"
import { asc, desc, eq, gt, not, sql, lt, or } from "drizzle-orm"

const userInclude = {
  id: userTable.id,
  username: userTable.username,
  displayName: userTable.displayName,
  avatarUrl: userTable.avatarUrl,
  bio: userTable.bio,
}

export const postInclude = {
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

export async function getPaginatedPosts(
  cursor: string | undefined,
  limit: number = 10,
) {
  let q = db
    .select(postInclude)
    .from(postTable)
    .innerJoin(userTable, eq(postTable.userId, userTable.id))
    .orderBy(desc(postTable.createdAt), desc(postTable.id))
    .limit(limit)

  // if (cursor) {
  //   const cursorPost = await db
  //     .select({ createdAt: postTable.createdAt })
  //     .from(postTable)
  //     .where(sql`${postTable.id} = ${cursor}`)

  //   if (cursorPost[0]) {
  //     q.where(lt(postTable.createdAt, cursorPost[0].createdAt))
  //   }
  // }

  if (cursor) {
    // cursor is in the format postId:createdAt

    const [cursorId, cursorDate] = cursor.split(":")

    q.where(lt(postTable.createdAt, new Date(cursorDate)))
  }

  const result = await q

  const nextCursor =
    result.length === limit
      ? `${result[limit - 1].id}:${result[limit - 1].createdAt}`
      : null

  return {
    data: result,
    nextCursor,
  }
}

export type PostBaseType = Awaited<ReturnType<typeof getPosts>>[number]

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

export async function getPostById(postId: string) {
  const post = await db
    .selectDistinct()
    .from(schema.postTable)
    .where(sql`${schema.postTable.id} = ${postId}`)

  return post[0]
}

export async function removePost(postId: string) {
  return await db.execute(
    sql`
      delete 
        from ${schema.postTable}
      where
        ${schema.postTable.id} = ${postId}

    `,
  )
}

export async function getUserById(userId: string) {
  const user = await db
    .selectDistinct(userInclude)
    .from(userTable)
    .where(eq(userTable.id, userId))

  return user[0]
}

/**
 * Get the follower count of a user
 * @param userId the userId of the user whose follower count we need
 * @returns The follower count of the user
 */
export async function getFollowerCount(userId: string) {
  const count = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(followerRelation)
    .where(sql`${followerRelation.followedId} = ${userId}`)

  return count[0]
}

export async function createFollow(from: string, to: string) {
  const follow = await db.execute(
    sql`
      insert into ${followerRelation}
      (follower_id, followed_id)
      VALUES (${from}, ${to})
      RETURNING *
    `,
  )

  return follow
}
