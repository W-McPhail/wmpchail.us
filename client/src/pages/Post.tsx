import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Markdown } from "../components/Markdown";
import { Tag } from "../components/Section";
import { api, formatDate, type Post as PostT } from "../lib/api";

export default function Post() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<PostT | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPost(null);
    setError(null);
    api.posts
      .get(slug)
      .then((p) => {
        setPost(p);
        document.title = `${p.title} — Willow McPhail`;
      })
      .catch((e) => setError(e.status === 404 ? "Post not found." : e.message));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="text-xl text-ink-300">{error}</p>
        <Link to="/blog" className="mt-4 inline-block text-accent-400 hover:underline">← Back to writing</Link>
      </div>
    );
  }
  if (!post) return <div className="mx-auto max-w-3xl px-5 py-24 text-ink-500 sm:px-8">Loading…</div>;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <Link to="/blog" className="font-mono text-xs text-ink-400 hover:text-accent-400">← Writing</Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-ink-400">
        <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
        {!post.published && <span className="rounded bg-danger-400/15 px-1.5 py-0.5 text-danger-400">draft</span>}
        {post.tags.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-ink-300">{post.excerpt}</p>}
      <hr className="my-8 border-ink-700" />
      <Markdown>{post.content}</Markdown>
    </article>
  );
}
