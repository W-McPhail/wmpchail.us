import { pgTable, serial, text, boolean, timestamp, varchar, index, integer, customType } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    tags: text("tags").array().notNull().default([]),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ publishedIdx: index("posts_published_idx").on(t.published, t.publishedAt) }),
);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  ip: varchar("ip", { length: 64 }),
  emailSent: boolean("email_sent").notNull().default(false),
  smsSent: boolean("sms_sent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;

// Uploaded blog images, stored in Postgres so no external object store is needed.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

export const images = pgTable("images", {
  id: varchar("id", { length: 24 }).primaryKey(),
  filename: text("filename").notNull(),
  mime: varchar("mime", { length: 64 }).notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Image = typeof images.$inferSelect;
