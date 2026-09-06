import { Router } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts } from "../db/schema.js";
import { isAuthed, requireAdmin } from "../lib/auth.js";

export const postsRouter = Router();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 120);

// Drizzle wraps driver errors; the Postgres SQLSTATE lives on the cause.
const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } } | undefined;
  return e?.code === "23505" || e?.cause?.code === "23505";
};

const postInput = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().trim().max(500).default(""),
  content: z.string().max(200_000).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  published: z.boolean().default(false),
});

// Public: published posts only (admins see drafts too via ?all=1).
postsRouter.get("/", async (req, res) => {
  const includeDrafts = req.query.all === "1" && isAuthed(req);
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      tags: posts.tags,
      published: posts.published,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(includeDrafts ? undefined : eq(posts.published, true))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt));
  res.json(rows);
});

postsRouter.get("/:slug", async (req, res) => {
  const authed = isAuthed(req);
  const where = authed
    ? eq(posts.slug, req.params.slug)
    : and(eq(posts.slug, req.params.slug), eq(posts.published, true));
  const [row] = await db.select().from(posts).where(where).limit(1);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

postsRouter.post("/", requireAdmin, async (req, res) => {
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const d = parsed.data;
  const slug = slugify(d.slug || d.title) || `post-${Date.now()}`;
  try {
    const [row] = await db
      .insert(posts)
      .values({
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content,
        tags: d.tags,
        published: d.published,
        publishedAt: d.published ? new Date() : null,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    if (isUniqueViolation(err)) return res.status(409).json({ error: "A post with that slug already exists" });
    throw err;
  }
});

postsRouter.put("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Bad id" });
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
  const d = parsed.data;

  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const slug = slugify(d.slug || d.title) || existing.slug;
  const publishedAt = d.published ? (existing.publishedAt ?? new Date()) : null;
  try {
    const [row] = await db
      .update(posts)
      .set({
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content,
        tags: d.tags,
        published: d.published,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    if (isUniqueViolation(err)) return res.status(409).json({ error: "A post with that slug already exists" });
    throw err;
  }
});

postsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Bad id" });
  await db.delete(posts).where(eq(posts.id, id));
  res.json({ ok: true });
});
