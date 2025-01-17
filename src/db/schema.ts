import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const currentTime = () =>
  text()
    .notNull()
    .default(sql`(current_timestamp)`);

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  created_at: currentTime(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  session: one(sessions, {
    fields: [users.id],
    references: [sessions.userId],
  }),
  items: many(items),
}));

export const sessions = sqliteTable("sessions", {
  id: int().primaryKey(),
  userId: int()
    .notNull()
    .references(() => users.id),
});

export const sessionRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const items = sqliteTable("items", {
  id: int().primaryKey(),
  store: text().notNull(),
  url: text().notNull(),
  name: text().notNull(),
  imagePath: text().notNull(),
  ownerId: int()
    .notNull()
    .references(() => users.id),
  hidden: int().notNull().default(0),
  created_at: currentTime(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  user: one(users, {
    fields: [items.ownerId],
    references: [users.id],
  }),
  status: many(itemStatus),
}));

export const itemStatus = sqliteTable("item_status", {
  id: int().primaryKey(),
  itemId: int()
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  amount: int().notNull(),
  currency: text().notNull(),
  available: int().notNull().default(1),
  created_at: currentTime(),
});

export const itemStatusRelations = relations(itemStatus, ({ one }) => ({
  item: one(items, {
    fields: [itemStatus.itemId],
    references: [items.id],
  }),
}));

export const table = {
  users,
  sessions,
  items,
  itemStatus,
} as const;
