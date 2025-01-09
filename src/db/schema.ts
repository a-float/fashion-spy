import { relations, sql } from "drizzle-orm";
import { integer } from "drizzle-orm/pg-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  created_at: text()
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const sessions = sqliteTable("sessions", {
  id: int().primaryKey(),
  userId: int().references(() => users.id),
});

export const userSessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const table = {
  users,
  sessions,
  userSessionRelation,
} as const;
