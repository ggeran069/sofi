import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const contentItems = sqliteTable("content_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  status: text("status").default("draft").notNull(),
  featured: integer("featured", { mode: "boolean" }).default(false).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  metadata: text("metadata", { mode: "json" }).default("{}"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const contentImages = sqliteTable("content_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contentItemId: text("content_item_id")
    .references(() => contentItems.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  contentItems: many(contentItems),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [contentItems.categoryId],
    references: [categories.id],
  }),
  images: many(contentImages),
}));

export const contentImagesRelations = relations(contentImages, ({ one }) => ({
  contentItem: one(contentItems, {
    fields: [contentImages.contentItemId],
    references: [contentItems.id],
  }),
}));
