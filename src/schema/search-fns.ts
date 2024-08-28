import { db } from "@/db"
import { userTable } from "@/schema/"
import { ilike, sql } from "drizzle-orm"

export async function findUser(query: string) {
  const search = await db
    .select({ username: userTable.username, avatarUrl: userTable.avatarUrl })
    .from(userTable)
    .where(ilike(userTable.username, `%${query}%`))

  return search
}
