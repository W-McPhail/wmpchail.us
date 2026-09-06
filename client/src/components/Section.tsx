import type { ReactNode } from "react";

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, intro, children, className = "" }: Props) {
  return (
    <section id={id} className={`scroll-mt-24 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-ink-400">{intro}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-ink-700 bg-ink-800/70 px-2 py-0.5 font-mono text-[11px] text-ink-300">
      {children}
    </span>
  );
}
