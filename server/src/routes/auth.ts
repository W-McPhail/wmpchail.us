import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { checkPassword, clearSessionCookie, isAuthed, setSessionCookie } from "../lib/auth.js";

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

authRouter.post("/login", loginLimiter, (req, res) => {
  const parsed = z.object({ password: z.string().min(1).max(200) }).safeParse(req.body);
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    return res.status(401).json({ error: "Invalid password" });
  }
  setSessionCookie(res);
  res.json({ ok: true });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  res.json({ authenticated: isAuthed(req) });
});
