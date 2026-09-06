import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { env } from "./env.js";

const COOKIE = "wm_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret).update(payload).digest("base64url");
}

export function issueToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(env.adminPassword);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function setSessionCookie(res: Response) {
  res.cookie(COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    maxAge: TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

export function isAuthed(req: Request): boolean {
  return verifyToken(req.cookies?.[COOKIE]);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });
  next();
}
