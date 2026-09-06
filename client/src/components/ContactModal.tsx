import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { profile } from "../data/resume";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "sending" | "sent" | "error";

export function ContactModal({ open, onClose }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setError(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => firstField.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);
    try {
      await api.contact({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        company: String(data.get("company") ?? ""),
        message: String(data.get("message") ?? ""),
        website: String(data.get("website") ?? ""),
      });
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative w-full max-w-lg rounded-b-none p-6 sm:rounded-2xl sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-ink-400 transition hover:bg-ink-800 hover:text-ink-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="mt-2 text-2xl font-semibold tracking-tight text-ink-50">
          Let's talk.
        </h2>
        <p className="mt-2 text-sm text-ink-400">
          Recruiting, a role, or a research question. Messages land in my inbox and on my phone.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-xl border border-accent-500/30 bg-accent-500/10 p-5">
            <p className="font-medium text-accent-300">Message sent.</p>
            <p className="mt-1 text-sm text-ink-300">Thanks for reaching out. I'll reply as soon as I can.</p>
            <button onClick={onClose} className="btn-ghost mt-4">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-name">Name</label>
                <input ref={firstField} id="c-name" name="name" required maxLength={120} className="input" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" name="email" type="email" required maxLength={200} className="input" placeholder="jane@firm.com" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="c-company">Company <span className="normal-case tracking-normal text-ink-500">(optional)</span></label>
              <input id="c-company" name="company" maxLength={120} className="input" placeholder="Firm / fund / team" />
            </div>
            <div>
              <label className="label" htmlFor="c-message">Message</label>
              <textarea id="c-message" name="message" required minLength={10} maxLength={4000} rows={5} className="input resize-y" placeholder="What are you hiring for, and what would you like to discuss?" />
            </div>
            {/* Honeypot — hidden from humans, filled by bots. */}
            <div className="absolute -left-[9999px] top-0" aria-hidden="true">
              <label htmlFor="c-website">Website</label>
              <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error && <p className="text-sm text-danger-400">{error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-ink-500">
                or email{" "}
                <a href={`mailto:${profile.email}`} className="text-ink-300 hover:text-accent-400">{profile.email}</a>
              </div>
              <button type="submit" disabled={status === "sending"} className="btn-primary">
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
