import { Resend } from "resend";
import twilio from "twilio";
import { env } from "./env.js";

export interface InquiryPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendEmail(p: InquiryPayload): Promise<boolean> {
  if (!env.resendApiKey) {
    console.log("[notify] RESEND_API_KEY not set — skipping email. Inquiry:", p);
    return false;
  }
  try {
    const resend = new Resend(env.resendApiKey);
    const subject = `New inquiry from ${p.name}${p.company ? ` (${p.company})` : ""}`;
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">New portfolio inquiry</h2>
        <p><b>Name:</b> ${escapeHtml(p.name)}</p>
        <p><b>Email:</b> <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></p>
        ${p.company ? `<p><b>Company:</b> ${escapeHtml(p.company)}</p>` : ""}
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f4f5;padding:12px;border-radius:8px">${escapeHtml(p.message)}</pre>
      </div>`;
    const { error } = await resend.emails.send({
      from: env.resendFrom,
      to: env.contactEmail,
      replyTo: p.email,
      subject,
      html,
      text: `Name: ${p.name}\nEmail: ${p.email}\nCompany: ${p.company ?? "-"}\n\n${p.message}`,
    });
    if (error) {
      console.error("[notify] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notify] email failed:", err);
    return false;
  }
}

export async function sendSms(p: InquiryPayload): Promise<boolean> {
  if (!env.twilioSid || !env.twilioToken || !env.twilioFrom) {
    console.log("[notify] Twilio not configured — skipping SMS.");
    return false;
  }
  try {
    const client = twilio(env.twilioSid, env.twilioToken);
    const preview = p.message.length > 160 ? `${p.message.slice(0, 157)}...` : p.message;
    await client.messages.create({
      from: env.twilioFrom,
      to: env.contactPhone,
      body: `wmcphail.us inquiry from ${p.name}${p.company ? ` @ ${p.company}` : ""} <${p.email}>: ${preview}`,
    });
    return true;
  } catch (err) {
    console.error("[notify] sms failed:", err);
    return false;
  }
}
