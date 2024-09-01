import { db } from "@/db"
import {
  commentsTable,
  followerRelation,
  postAttachments,
  postTable,
  schema,
  userTable,
} from "@/schema/"
import { postInclude, userInclude } from "@/schema/db-fns"
import { BookmarkData, CommentMeta, LikeData, PostType } from "@/types"
import { desc, eq, ilike, sql } from "drizzle-orm"

export async function findUserMeta(query: string) {
  const search = await db
    .select({
      ...userInclude,
      followerCount: sql<number>`count(distinct ${followerRelation.followFrom})`,
      postCount: sql<number>`count(distinct ${postTable.id})`,
    })
    .from(userTable)
    .leftJoin(followerRelation, eq(userTable.id, followerRelation.followTo))
    .leftJoin(postTable, eq(userTable.id, postTable.userId))
    .where(ilike(userTable.username, `%${query}%`))
    .groupBy(userTable.id)
    .limit(7)

  return search
}

export async function searchPosts(
  query: string,
  currentUserId: string,
): Promise<PostType[]> {
  const search = await db
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
      rank: sql<number>`ts_rank(to_tsvector('english', coalesce(${postTable.content}, '')), websearch_to_tsquery('english', ${query}))`.as(
        "rank",
      ),
    })
    .from(postTable)
    .innerJoin(userTable, eq(postTable.userId, userTable.id))
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
    .where(
      sql`to_tsvector('english', coalesce(${postTable.content}, '')) @@ websearch_to_tsquery('english', ${query})`,
    )
    .groupBy(
      postInclude.avatarUrl,
      postInclude.content,
      postInclude.createdAt,
      postInclude.displayName,
      postInclude.id,
      postInclude.userId,
      postInclude.username,
    )
    .orderBy(sql`rank DESC`)
    .limit(10)

  return search
}
