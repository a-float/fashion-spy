import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const currentTime = () =>
  text()
    .notNull()
    .default(sql`(current_timestamp)`);

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  password: text().notNull(),
  createdAt: currentTime(),
  isActive: int().notNull().default(0),
  isAdmin: int().notNull().default(0),
  maxTrackedItems: int().notNull().default(20),
});

export const userRelations = relations(users, ({ one, many }) => ({
  session: one(sessions, {
    fields: [users.id],
    references: [sessions.userId],
  }),
  items: many(items),
}));

export const sessions = sqliteTable("sessions", {
  id: text().primaryKey(),
  createdAt: currentTime(),
  closedAt: text(),
  userId: int()
    .notNull()
    .references(() => users.id),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
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
  isTracked: int().notNull().default(1),
  createdAt: currentTime(),
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
  amount: int(),
  currency: text(),
  createdAt: currentTime(),
  updatedAt: currentTime(),
  details: text({ mode: "json" })
    .$type<Record<string, string | number>>()
    .notNull(),
});

export const itemStatusRelations = relations(itemStatus, ({ one }) => ({
  item: one(items, {
    fields: [itemStatus.itemId],
    references: [items.id],
  }),
}));

export const stores = sqliteTable("store_status", {
  name: text().primaryKey(),
  isDown: int().notNull(),
});

export const table = {
  users,
  sessions,
  stores,
  items,
  itemStatus,
} as const;
