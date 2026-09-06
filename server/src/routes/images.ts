import { Router, raw } from "express";
import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { images } from "../db/schema.js";
import { requireAdmin } from "../lib/auth.js";

export const imagesRouter = Router();

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

const safeName = (name: string, ext: string) => {
  const base = name
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "image"}.${ext}`;
};

// Minimal header sniffing so the declared content type has to match the bytes.
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /avi[fs]/.test(buf.subarray(8, 12).toString("ascii"))) return "image/avif";
  return null;
}

// Public: serve an image. The trailing filename segment is cosmetic (nicer URLs in Markdown).
imagesRouter.get("/:id{/:name}", async (req, res) => {
  const [row] = await db.select().from(images).where(eq(images.id, String(req.params.id))).limit(1);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.setHeader("Content-Type", row.mime);
  res.setHeader("Content-Length", String(row.size));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.send(row.data);
});

// Admin: list uploads (metadata only).
imagesRouter.get("/", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({ id: images.id, filename: images.filename, mime: images.mime, size: images.size, width: images.width, height: images.height, createdAt: images.createdAt })
    .from(images)
    .orderBy(desc(images.createdAt));
  res.json(rows.map((r) => ({ ...r, url: `/api/images/${r.id}/${r.filename}` })));
});

// Admin: upload. Body is the raw image bytes; filename and dimensions come via query string.
imagesRouter.post("/", requireAdmin, raw({ type: (req) => /^image\//.test(req.headers["content-type"] ?? ""), limit: MAX_BYTES }), async (req, res) => {
  const buf = req.body as Buffer | undefined;
  if (!Buffer.isBuffer(buf) || buf.length === 0) {
    return res.status(400).json({ error: "Send the image as the request body with an image/* content type" });
  }
  const mime = sniff(buf);
  if (!mime || !ALLOWED[mime]) return res.status(415).json({ error: "Unsupported image type. Use PNG, JPEG, GIF, WebP, or AVIF." });

  const id = randomBytes(9).toString("base64url"); // 12 chars, URL-safe
  const filename = safeName(String(req.query.name ?? "image"), ALLOWED[mime]);
  const width = Number(req.query.w) || null;
  const height = Number(req.query.h) || null;

  await db.insert(images).values({ id, filename, mime, size: buf.length, width, height, data: buf });
  res.status(201).json({ id, filename, mime, size: buf.length, width, height, url: `/api/images/${id}/${filename}` });
});

imagesRouter.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(images).where(eq(images.id, String(req.params.id)));
  res.json({ ok: true });
});
