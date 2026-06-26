import { pgTable, serial, varchar, date, text, timestamp } from "drizzle-orm/pg-core"

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  interests: text("interests").array().notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type InsertRegistration = typeof registrations.$inferInsert
export type SelectRegistration = typeof registrations.$inferSelect
