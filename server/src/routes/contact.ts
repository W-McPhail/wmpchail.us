import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { db } from "../db/index.js";
import { inquiries } from "../db/schema.js";
import { sendEmail, sendSms } from "../lib/notify.js";

export const contactRouter = Router();

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(4000),
  // Honeypot: real users never fill this in (checked before validation so bots get a silent 201).
  website: z.string().optional(),
});

contactRouter.post("/", limiter, async (req, res) => {
  if (typeof req.body?.website === "string" && req.body.website.length > 0) {
    return res.status(201).json({ ok: true }); // bot filled the honeypot; pretend it worked
  }
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { name, email, message } = parsed.data;
  const company = parsed.data.company || undefined;
  const payload = { name, email, company, message };

  const [emailSent, smsSent] = await Promise.all([sendEmail(payload), sendSms(payload)]);

  await db.insert(inquiries).values({
    name,
    email,
    company: company ?? null,
    message,
    ip: req.ip ?? null,
    emailSent,
    smsSent,
  });

  res.status(201).json({ ok: true });
});
