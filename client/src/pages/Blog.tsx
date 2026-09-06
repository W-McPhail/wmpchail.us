import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "../components/Section";
import { api, formatDate, type PostSummary } from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Writing — Willow McPhail";
    api.posts.list().then(setPosts).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="eyebrow">Writing</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-50">Notes on markets and code.</h1>
      <p className="mt-3 text-ink-400">Research write-ups, trading notes, and engineering.</p>

      <div className="mt-12 space-y-4">
        {error && <p className="text-danger-400">{error}</p>}
        {posts === null && !error && <p className="text-ink-500">Loading…</p>}
        {posts?.length === 0 && <p className="text-ink-400">Nothing published yet. Check back soon.</p>}
        {posts?.map((p) => (
          <Link key={p.id} to={`/blog/${p.slug}`} className="card card-hover block p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-400">
              <span>{formatDate(p.publishedAt)}</span>
              {p.tags.length > 0 && <span className="text-ink-600">·</span>}
              {p.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
            <h2 className="mt-2 text-xl font-semibold text-ink-50">{p.title}</h2>
            {p.excerpt && <p className="mt-2 text-ink-300">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
