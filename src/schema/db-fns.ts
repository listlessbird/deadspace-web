import { db } from "@/db"
import { UpdateUserProfileType } from "@/lib/validations"
import {
  followerRelation,
  postAttachmentTableInsertType,
  postAttachmentTableSelectType,
  postTable,
  schema,
  userTable,
  commentsTable,
  postAttachments,
  agentsTable,
} from "@/schema"
import { BookmarkData, CommentMeta, LikeData, UserViewType } from "@/types"
import { desc, eq, sql, lt, and, inArray, or } from "drizzle-orm"

export const userInclude = {
  id: userTable.id,
  username: userTable.username,
  displayName: userTable.displayName,
  avatarUrl: userTable.avatarUrl,
  bio: userTable.bio,
  createdAt: userTable.createdAt,
}

export const agentInclude = {
  id: agentsTable.id,
  username: agentsTable.name,
  displayName: agentsTable.name,
  avatarUrl: agentsTable.avatarUrl,
  bio: agentsTable.description,
  createdAt: agentsTable.createdAt,
  createdBy: agentsTable.createdBy,
  behaviouralTags: agentsTable.behaviourTags,
  description: agentsTable.description,
}

// export const postInclude = {
//   id: postTable.id,
//   content: postTable.content,
//   createdAt: postTable.createdAt,
//   username: userTable.username || agentsTable.name,
//   displayName: userTable.displayName || agentsTable.name,
//   avatarUrl: userTable.avatarUrl || agentsTable.avatarUrl,
//   userId: userTable.id || agentsTable.id,
// }

export const postInclude = {
  id: postTable.id,
  content: postTable.content,
  createdAt: postTable.createdAt,
  username: sql<string>`COALESCE(${userTable.username}, ${agentsTable.name})`,
  displayName: sql<string>`COALESCE(${userTable.displayName}, ${agentsTable.name})`,
  avatarUrl: sql<string>`COALESCE(${userTable.avatarUrl}, ${agentsTable.avatarUrl})`,
  userId: postTable.userId,
  agentId: postTable.agentId,
  postType: postTable.type,
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

function getBasePostQuery() {
  return db
    .select({
      ...postInclude,
      attachments: sql<
        {
          attachmentType: "image" | "video"
          attachmentUrl: string
          blurhash?: string
        }[]
      >`coalesce(
        json_agg(
          json_build_object('attachmentType', ${schema.postAttachments.attachmentType}, 'attachmentUrl', ${schema.postAttachments.attachmentUrl}, 'blurhash', ${schema.postAttachments.blurhash})
          ) FILTER  (WHERE ${schema.postAttachments.id} is not null), '[]'::json
          )
      `,
      // likes: sql<LikeData>`coalesce(
      //   json_agg(
      //     json_build_object('likeCount', count(${schema.postLikesTable.postId}), 'isLiked', (select exists(select 1 from ${schema.postLikesTable} where ${postTable.userId} = ${currentUserId})))
      //     ) FILTER  (WHERE ${schema.postLikesTable.postId} is not null), '{}'::json
      //     )
      // `,
    })
    .from(postTable)
    .leftJoin(agentsTable, eq(postTable.agentId, agentsTable.id))
    .leftJoin(userTable, eq(postTable.userId, userTable.id))
    .leftJoin(
      schema.postAttachments,
      eq(postTable.id, schema.postAttachments.postId),
    )
    .leftJoin(
      schema.postLikesTable,
      eq(schema.postLikesTable.postId, schema.postTable.id),
    )
    .groupBy(
      postInclude.avatarUrl,
      postInclude.content,
      postInclude.createdAt,
      postInclude.displayName,
      postInclude.id,
      postInclude.userId,
      postInclude.username,
      postInclude.postType,
      postInclude.agentId,
    )
  // .orderBy(desc(postTable.createdAt), desc(postTable.id))
}

function getBasePostForFeedQuery(currentUserId: string) {
  return db
    .select({
      ...postInclude,
      attachments: sql<
        {
          attachmentType: "image" | "video"
          attachmentUrl: string
          blurhash?: string
        }[]
      >`
        (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'attachmentType', ${postAttachments.attachmentType},
              'attachmentUrl', ${postAttachments.attachmentUrl},
              'blurhash', ${postAttachments.blurhash}
            )
          ) FILTER (WHERE ${postAttachments.id} IS NOT NULL), 
          '[]'::json
        )
        FROM ${postAttachments}
        WHERE ${postAttachments.postId} = ${postTable.id}
      )
      `,
      likes: sql<LikeData>`
      (
        select json_build_object('likeCount', (
      select count(*) 
      from ${schema.postLikesTable}
      where ${schema.postLikesTable.postId} = ${schema.postTable.id}
    ), 'isLiked', exists(
          select 1 from ${schema.postLikesTable}
          where ${schema.postLikesTable.postId} = ${schema.postTable.id}
          and ${schema.postLikesTable.userId} = ${currentUserId}
          ))
      )
`,
      bookmarks: sql<BookmarkData>`
       (
          select json_build_object('bookMarkCount',
            count(${schema.bookMarksTable.postId}),
            'isBookMarked',
            exists(
              select 1 from ${schema.bookMarksTable}
              where ${schema.bookMarksTable.postId} = ${schema.postTable.id}
              and ${schema.bookMarksTable.userId} = ${currentUserId}
            ) 
          )
       )
     `,
      comments: sql<CommentMeta>`
        (
          select json_build_object('commentCount',
            count(${commentsTable.id}) filter (WHERE ${commentsTable.parentId} is null)
          )
        )
      `,
    })
    .from(postTable)
    .leftJoin(agentsTable, eq(postTable.agentId, agentsTable.id))
    .leftJoin(userTable, eq(postTable.userId, userTable.id))
    .leftJoin(
      schema.postAttachments,
      eq(postTable.id, schema.postAttachments.postId),
    )
    .leftJoin(
      schema.postLikesTable,
      eq(schema.postLikesTable.postId, schema.postTable.id),
    )
    .leftJoin(
      schema.bookMarksTable,
      eq(schema.bookMarksTable.postId, schema.postTable.id),
    )
    .leftJoin(commentsTable, eq(commentsTable.postId, postTable.id))
    .groupBy(
      postInclude.avatarUrl,
      postInclude.content,
      postInclude.createdAt,
      postInclude.displayName,
      postInclude.id,
      postInclude.userId,
      postInclude.username,
      postInclude.postType,
      postInclude.agentId,
    )
  // .orderBy(desc(postTable.createdAt), desc(postTable.id))
}

export function getPaginatedBasePostQuery(currentUserId: string) {
  return getBasePostForFeedQuery(currentUserId).orderBy(
    desc(postTable.createdAt),
    desc(postTable.id),
  )
}

export async function getPaginatedPosts(
  currentUserId: string,
  cursor: string | undefined,
  limit: number = 10,
) {
  let q = getPaginatedBasePostQuery(currentUserId).limit(limit)

  if (cursor) {
    // cursor is in the format postId::createdAt

    const [cursorId, cursorDate] = cursor.split("::")
    const date = new Date(cursorDate)
    q.where(lt(postTable.createdAt, date))
  }

  const result = await q

  const nextCursor =
    result.length === limit
      ? `${result[limit - 1].id}::${result[limit - 1].createdAt.toString()}`
      : null

  return {
    data: result,
    nextCursor,
  }
}

export async function getPaginatedPostsForFollowingFeed(
  currentUserId: string,
  cursor: string | undefined,
  limit: number = 10,
) {
  let cdate: Date | undefined

  if (cursor) {
    const [, cursorDate] = cursor.split("::")

    cdate = new Date(cursorDate)
  }

  const q = getPaginatedBasePostQuery(currentUserId)
    .leftJoin(followerRelation, eq(followerRelation.followTo, postTable.userId))
    .where(
      or(
        and(
          eq(followerRelation.followFrom, currentUserId),
          cdate ? lt(postTable.createdAt, cdate) : undefined,
        ),
        eq(agentsTable.createdBy, currentUserId),
      ),
    )
    .limit(limit)

  const result = await q
  const nextCursor =
    result.length === limit
      ? `${result[limit - 1].id}::${result[limit - 1].createdAt}`
      : null

  return {
    data: result,
    nextCursor,
  }
}

export async function getPaginatedUserPosts(
  currentUserId: string,
  userId: string,
  cursor: string | undefined,
  limit: number = 10,
) {
  let cdate: Date | undefined

  if (cursor) {
    const [, cursorDate] = cursor.split("::")

    cdate = new Date(cursorDate)
  }

  const result = await getPaginatedBasePostQuery(currentUserId)
    .where(
      or(
        and(
          eq(postTable.userId, userId),
          cdate ? lt(postTable.createdAt, cdate) : undefined,
        ),
        and(
          eq(postTable.agentId, userId),
          cdate ? lt(postTable.createdAt, cdate) : undefined,
        ),
      ),
    )
    .limit(limit)

  const nextCursor =
    result.length === limit
      ? `${result[limit - 1].id}::${result[limit - 1].createdAt}`
      : null

  return { data: result, nextCursor }
}

export type PostBaseType = Awaited<ReturnType<typeof getPosts>>[number]

export type PostWithUsers = Awaited<ReturnType<typeof getPostsByUser>>[number]

export async function getUsersToFollow(currUserId: string) {
  // use some algo

  const users = await db
    .select({
      ...userInclude,
      followerCount:
        sql<number>`(select count(${followerRelation.followTo}) from ${followerRelation} where ${followerRelation.followTo} = ${userTable.id}) as follow_count`.mapWith(
          Number,
        ),
      isFollowedByLoggedInUser: sql<boolean>`exists (
        select 1 from ${followerRelation} where ${followerRelation.followFrom} = ${currUserId} and ${followerRelation.followTo} = ${userTable.id}
      )`,
    })
    .from(userTable)
    .where(sql`${userTable.id} != ${currUserId}`)
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
  const post = await getBasePostQuery().where(eq(postTable.id, postId))

  // const post = await db
  //   .selectDistinct()
  //   .from(schema.postTable)
  //   .where(sql`${schema.postTable.id} = ${postId}`)

  return post[0]
}

export async function getPostByIdForFeed(
  postId: string,
  currentUserId: string,
) {
  const post = await getBasePostForFeedQuery(currentUserId).where(
    eq(postTable.id, postId),
  )

  // const post = await db
  //   .selectDistinct()
  //   .from(schema.postTable)
  //   .where(sql`${schema.postTable.id} = ${postId}`)

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

export async function getUserById(userId: string): Promise<UserViewType> {
  const userq = db
    .select({
      ...userInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(userTable)
    .leftJoin(followerRelation, eq(userTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(userTable.id, postTable.userId))
    .where(eq(userTable.id, userId))
    .groupBy(userTable.id)
    .limit(1)

  const agentQ = db
    .select({
      ...agentInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(agentsTable)
    .leftJoin(followerRelation, eq(agentsTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(agentsTable.id, postTable.agentId))
    .where(eq(agentsTable.id, userId))
    .groupBy(agentsTable.id)
    .limit(1)

  const [user, agent] = await Promise.all([userq, agentQ])
  if (typeof user[0] !== "undefined" && "id" in user[0]) {
    return { ...user[0], userType: "user" }
  } else {
    return { ...agent[0], userType: "agent" }
  }
}

export async function getUserByUsername(
  username: string,
): Promise<UserViewType> {
  const userq = db
    .select({
      ...userInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(userTable)
    .leftJoin(followerRelation, eq(userTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(userTable.id, postTable.userId))
    .where(eq(userTable.username, username))
    .groupBy(userTable.id)
    .limit(1)

  const agentQ = db
    .select({
      ...agentInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(agentsTable)
    .leftJoin(followerRelation, eq(agentsTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(agentsTable.id, postTable.agentId))
    .where(eq(agentsTable.name, username))
    .groupBy(agentsTable.id)
    .limit(1)

  const [user, agent] = await Promise.all([userq, agentQ])

  if (typeof user[0] !== "undefined" && "id" in user[0]) {
    return { ...user[0], userType: "user" }
  } else {
    return { ...agent[0], userType: "agent" }
  }
}

export async function getUserByGoogleId(
  googleId: string,
): Promise<UserViewType | null> {
  const result = await db
    .selectDistinct({
      ...userInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(userTable)
    .leftJoin(followerRelation, eq(userTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(userTable.id, postTable.userId))
    .where(eq(userTable.googleId, googleId))
    .groupBy(userTable.id)
    .limit(1)
  console.log(`getUserByEmail/gid`, result)
  if (!result[0]) {
    return null
  }

  return { ...result[0], userType: "user" }
}

export async function getUserByEmail(
  email: string,
): Promise<UserViewType | null> {
  const result = await db
    .selectDistinct({
      ...userInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(userTable)
    .leftJoin(followerRelation, eq(userTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(userTable.id, postTable.userId))
    .where(eq(userTable.googleId, email))
    .groupBy(userTable.id)
    .limit(1)
  console.log(`getUserByEmail/gid`, result)
  if (!result[0]) {
    return null
  }

  return { ...result[0], userType: "user" }
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
    .where(sql`${followerRelation.followTo} = ${userId}`)

  return count[0]
}

export async function getPostCount(userId: string) {
  const postsCount = await db.execute(
    sql<{
      count: number
    }>`select count(*) from ${postTable} where ${postTable.userId} = ${userId}`.mapWith(
      Number,
    ),
  )
  return postsCount[0]["count"] as number
}

export async function createFollow(from: string, to: string) {
  const follow = await db.execute(
    sql`
      insert into ${followerRelation}
      (follow_from, follow_to)
      VALUES (${from}, ${to})
      RETURNING *
    `,
  )

  return follow
}

export async function removeFollow(from: string, by: string) {
  const unfollow = await db.execute(
    sql`
      delete 
      from ${followerRelation}
      where ${followerRelation.followFrom} = ${from} 
      and ${followerRelation.followTo} = ${by}
      returning *
      `,
  )

  return unfollow
}

export async function isCurrentUserFollowingTarget(
  targetUserId: string,
  currentUserId: string,
) {
  const isCurrentUserFollowingTarget = await db.execute(
    sql<{ is_following: boolean }>`
      select 
        exists (
          select 1 
            from 
              ${followerRelation}
            where 
              ${followerRelation.followFrom} = ${currentUserId}
            and 
              ${followerRelation.followTo} = ${targetUserId}
        ) as is_following
    `.mapWith(Boolean),
  )

  return isCurrentUserFollowingTarget[0]["is_following"] as boolean
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const updatedAvatar = await db
    .update(userTable)
    .set({ avatarUrl })
    .where(eq(userTable.id, userId))
    .returning({ avatarUrl: userTable.avatarUrl })

  return updatedAvatar[0]["avatarUrl"]
}
export async function updateUserDisplayInfo({
  displayName,
  bio,
  userId,
}: UpdateUserProfileType & { userId: string }) {
  const updatedUser = await db
    .update(userTable)
    .set({ bio, displayName })
    .where(eq(userTable.id, userId))
    .returning(userInclude)

  return updatedUser[0]
}

export async function createMediaAttachmentEntry({
  attachmentUrl,
  attachmentType,
  postId,
  blurhash,
}: Pick<postAttachmentTableInsertType, "attachmentType" | "attachmentUrl"> & {
  postId?: postAttachmentTableInsertType["postId"]
  blurhash?: postAttachmentTableInsertType["blurhash"]
}) {
  const insertRecord = await db
    .insert(schema.postAttachments)
    .values({
      attachmentType,
      attachmentUrl,
      postId: postId ? postId : undefined,
      blurhash: blurhash ? blurhash : null,
    })
    .returning()

  return insertRecord[0]
}

export async function createPost({
  content,
  userId,
  attachmentIds,
}: {
  content: string
  userId: string
  attachmentIds?: string[]
}): Promise<{
  id: string
  createdAt: Date
  content: string | null
  userId: string | null
  attachments?: Pick<
    postAttachmentTableSelectType,
    "attachmentType" | "attachmentUrl" | "blurhash"
  >[]
}> {
  if (attachmentIds && attachmentIds?.length > 0) {
    const data = await db.transaction(async (tx) => {
      const post = await tx
        .insert(postTable)
        .values({ content, userId, type: "user", agentId: null })
        .returning()

      const postId = post[0].id

      const updatedAttachments = await tx
        .update(schema.postAttachments)
        .set({ postId })
        .where(inArray(schema.postAttachments.id, attachmentIds))
        .returning({
          attachmentUrl: schema.postAttachments.attachmentUrl,
          attachmentType: schema.postAttachments.attachmentType,
          blurhash: schema.postAttachments.blurhash,
        })

      return { ...post[0], attachments: updatedAttachments }
    })
    return data
  }

  const newPost = await db
    .insert(schema.postTable)
    .values({
      userId,
      content,
      type: "user",
    })
    .returning()

  return newPost[0]
}
