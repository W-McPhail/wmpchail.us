import { Link } from "react-router-dom";
import { profile } from "../data/resume";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-medium text-ink-200">{profile.name}</p>
          <p className="mt-0.5">{profile.title} · {profile.location}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={`mailto:${profile.email}`} className="hover:text-accent-400">{profile.email}</a>
          <a href={profile.phoneHref} className="hover:text-accent-400">{profile.phone}</a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-accent-400">GitHub</a>
          <Link to="/blog" className="hover:text-accent-400">Writing</Link>
          <Link to="/admin" className="text-ink-600 hover:text-ink-400">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
