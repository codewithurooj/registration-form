import { eq } from "drizzle-orm"
import { unstable_noStore as noStore } from "next/cache"
import { getDb } from "./client"
import { registrations } from "./schema"
import type { InsertRegistration } from "./schema"

export async function insertRegistration(data: InsertRegistration) {
  const db = getDb()
  const [row] = await db.insert(registrations).values(data).returning({ id: registrations.id })
  return row
}

export async function emailExists(email: string): Promise<boolean> {
  const db = getDb()
  const result = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.email, email))
    .limit(1)
  return result.length > 0
}

export async function getAllRegistrations() {
  noStore()
  const db = getDb()
  return db
    .select()
    .from(registrations)
    .orderBy(registrations.createdAt)
}
