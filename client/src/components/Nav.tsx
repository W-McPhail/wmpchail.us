import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContact } from "./ContactContext";
import { profile } from "../data/resume";

const sections = [
  { to: "/#research", label: "Research" },
  { to: "/#experience", label: "Experience" },
  { to: "/#skills", label: "Skills" },
];

export function Nav() {
  const { open } = useContact();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [location]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-ink-800 bg-ink-900/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 ring-1 ring-ink-700 transition group-hover:ring-accent-500/50">
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10,44 22,30 30,36 42,18 54,24" />
            </svg>
          </span>
          <span className="font-mono text-sm font-medium text-ink-100">wmcphail<span className="text-accent-400">.us</span></span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {sections.map((s) => (
            <a key={s.to} href={s.to} className="text-ink-300 transition hover:text-ink-50">
              {s.label}
            </a>
          ))}
          <NavLink to="/blog" className={({ isActive }) => `transition hover:text-ink-50 ${isActive ? "text-ink-50" : "text-ink-300"}`}>
            Writing
          </NavLink>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-ink-300 transition hover:text-ink-50">
            Résumé
          </a>
          <button onClick={open} className="btn-primary !py-2">
            Contact me
          </button>
        </nav>

        <button
          className="rounded-md p-2 text-ink-300 hover:bg-ink-800 md:hidden"
          onClick={() => setMenu((m) => !m)}
          aria-label="Toggle menu"
          aria-expanded={menu}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menu ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menu && (
        <div className="border-t border-ink-800 bg-ink-900/95 px-5 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {sections.map((s) => (
              <a key={s.to} href={s.to} onClick={() => setMenu(false)} className="rounded-md px-2 py-2.5 text-ink-200 hover:bg-ink-800">
                {s.label}
              </a>
            ))}
            <Link to="/blog" className="rounded-md px-2 py-2.5 text-ink-200 hover:bg-ink-800">Writing</Link>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="rounded-md px-2 py-2.5 text-ink-200 hover:bg-ink-800">Résumé</a>
            <button onClick={() => { setMenu(false); open(); }} className="btn-primary mt-2 w-full">
              Contact me
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
