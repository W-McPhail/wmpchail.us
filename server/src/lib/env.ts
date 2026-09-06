import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from the repo root (../../.env relative to server/src or server/dist) or server/.
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env") });
dotenv.config({ path: path.resolve(here, "../../.env") });
dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  isProd: process.env.NODE_ENV === "production",
  adminPassword: required("ADMIN_PASSWORD"),
  sessionSecret: required("SESSION_SECRET"),
  contactEmail: process.env.CONTACT_EMAIL ?? "mcphailwillow@gmail.com",
  contactPhone: process.env.CONTACT_PHONE ?? "+19148061544",
  // Email (Resend). Optional in dev — inquiries are always stored in Postgres.
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
  // SMS (Twilio). Optional.
  twilioSid: process.env.TWILIO_ACCOUNT_SID,
  twilioToken: process.env.TWILIO_AUTH_TOKEN,
  twilioFrom: process.env.TWILIO_FROM_NUMBER,
};
