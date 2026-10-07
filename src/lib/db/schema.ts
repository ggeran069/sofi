import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).unique().notNull(),
    description: text("description"),
    longDescription: text("long_description"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    featured: boolean("featured").default(false).notNull(),
    thumbnailUrl: text("thumbnail_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("content_items_category_id_idx").on(table.categoryId)],
);

export const contentImages = pgTable(
  "content_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentItemId: uuid("content_item_id")
      .references(() => contentItems.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("content_images_item_id_idx").on(table.contentItemId)],
);

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
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
