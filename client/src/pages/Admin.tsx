import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Markdown } from "../components/Markdown";
import { api, formatDate, type ImageMeta, type PostInput, type PostSummary } from "../lib/api";
import { prepareImage } from "../lib/image";

/* ---------- auth gate ---------- */

function useAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    api.auth.me().then((r) => setAuthed(r.authenticated)).catch(() => setAuthed(false));
  }, []);
  return { authed, setAuthed };
}

export default function Admin() {
  const { authed, setAuthed } = useAuth();
  useEffect(() => { document.title = "Admin — Willow McPhail"; }, []);

  if (authed === null) return <div className="mx-auto max-w-5xl px-5 py-24 text-ink-500 sm:px-8">Loading…</div>;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <Routes>
      <Route index element={<PostList onLogout={() => setAuthed(false)} />} />
      <Route path="new" element={<Editor />} />
      <Route path="edit/:id" element={<Editor />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

/* ---------- login ---------- */

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.auth.login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-24 sm:px-8">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink-50">Sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" autoFocus className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger-400">{error}</p>}
        <button disabled={busy || !password} className="btn-primary w-full">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

/* ---------- list ---------- */

function PostList({ onLogout }: { onLogout: () => void }) {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.posts.list(true).then(setPosts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(p: PostSummary) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await api.posts.remove(p.id);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-50">Posts</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/new" className="btn-primary">New post</Link>
          <button onClick={() => api.auth.logout().then(onLogout)} className="btn-ghost">Sign out</button>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {error && <p className="text-danger-400">{error}</p>}
        {posts === null && !error && <p className="text-ink-500">Loading…</p>}
        {posts?.length === 0 && <p className="text-ink-400">No posts yet. Write your first one.</p>}
        {posts?.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${p.published ? "bg-accent-500/15 text-accent-300" : "bg-ink-700 text-ink-300"}`}>
                  {p.published ? "published" : "draft"}
                </span>
                <h2 className="truncate font-medium text-ink-50">{p.title}</h2>
              </div>
              <p className="mt-1 font-mono text-xs text-ink-400">/blog/{p.slug} · updated {formatDate(p.updatedAt)}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <Link to={`/blog/${p.slug}`} className="btn-ghost !py-1.5">View</Link>
              <Link to={`/admin/edit/${p.id}`} className="btn-ghost !py-1.5">Edit</Link>
              <button onClick={() => remove(p)} className="btn-ghost !py-1.5 text-danger-400 hover:border-danger-400/50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- editor ---------- */

const empty: PostInput = { title: "", slug: "", excerpt: "", content: "", tags: [], published: false };

const imageMarkdown = (img: { url: string; filename: string }) =>
  `![${img.filename.replace(/\.[a-z0-9]+$/i, "").replace(/-/g, " ")}](${img.url})`;

const fmtBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id !== undefined;
  const [form, setForm] = useState<PostInput>(empty);
  const [tagsText, setTagsText] = useState("");
  const [loaded, setLoaded] = useState(!editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [library, setLibrary] = useState<ImageMeta[] | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    // Fetch the list to map id -> slug, then load the full post.
    api.posts
      .list(true)
      .then((list) => {
        const summary = list.find((p) => p.id === Number(id));
        if (!summary) throw new Error("Post not found");
        return api.posts.get(summary.slug);
      })
      .then((p) => {
        setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, tags: p.tags, published: p.published });
        setTagsText(p.tags.join(", "));
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, [editing, id]);

  useEffect(() => {
    if (showLibrary && library === null) api.images.list().then(setLibrary).catch((e) => setError(e.message));
  }, [showLibrary, library]);

  const set = <K extends keyof PostInput>(k: K, v: PostInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  /** Insert text at the textarea cursor (or append), keeping focus. */
  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    setForm((f) => {
      if (!ta) return { ...f, content: `${f.content}\n\n${text}\n` };
      const start = ta.selectionStart ?? f.content.length;
      const end = ta.selectionEnd ?? start;
      const before = f.content.slice(0, start);
      const after = f.content.slice(end);
      const pad = before.length && !before.endsWith("\n") ? "\n\n" : "";
      const next = `${before}${pad}${text}\n${after}`;
      requestAnimationFrame(() => {
        ta.focus();
        const pos = before.length + pad.length + text.length + 1;
        ta.setSelectionRange(pos, pos);
      });
      return { ...f, content: next };
    });
  }, []);

  const uploadFiles = useCallback(
    async (files: Iterable<File>) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      setError(null);
      for (const file of list) {
        setUploading(file.name);
        try {
          const prepared = await prepareImage(file);
          const meta = await api.images.upload(prepared.blob, prepared.name, prepared.width, prepared.height);
          insertAtCursor(imageMarkdown(meta));
          setLibrary((l) => (l ? [meta, ...l] : l));
        } catch (e) {
          setError(e instanceof Error ? `${file.name}: ${e.message}` : "Upload failed");
        }
      }
      setUploading(null);
    },
    [insertAtCursor],
  );

  const onDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };
  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.items)
      .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
      .map((i) => i.getAsFile())
      .filter((f): f is File => !!f);
    if (files.length) {
      e.preventDefault();
      uploadFiles(files);
    }
  };

  async function removeImage(img: ImageMeta) {
    if (!confirm(`Delete ${img.filename}? Posts referencing it will show a broken image.`)) return;
    await api.images.remove(img.id);
    setLibrary((l) => l?.filter((i) => i.id !== img.id) ?? l);
  }

  async function save(publish?: boolean) {
    setBusy(true);
    setError(null);
    const payload: PostInput = {
      ...form,
      published: publish ?? form.published,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      const saved = editing ? await api.posts.update(Number(id), payload) : await api.posts.create(payload);
      if (!editing) navigate(`/admin/edit/${saved.id}`, { replace: true });
      setForm({ title: saved.title, slug: saved.slug, excerpt: saved.excerpt, content: saved.content, tags: saved.tags, published: saved.published });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <div className="mx-auto max-w-5xl px-5 py-24 text-ink-500 sm:px-8">{error ?? "Loading…"}</div>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="font-mono text-xs text-ink-400 hover:text-accent-400">← Posts</Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink-50">{editing ? "Edit post" : "New post"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-1 font-mono text-[10px] uppercase ${form.published ? "bg-accent-500/15 text-accent-300" : "bg-ink-700 text-ink-300"}`}>
            {form.published ? "published" : "draft"}
          </span>
          <button onClick={() => setPreview((p) => !p)} className="btn-ghost lg:hidden">{preview ? "Edit" : "Preview"}</button>
          <button onClick={() => save(false)} disabled={busy || !form.title} className="btn-ghost">Save draft</button>
          <button onClick={() => save(true)} disabled={busy || !form.title} className="btn-primary">
            {form.published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-danger-400">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={`space-y-4 ${preview ? "hidden lg:block" : ""}`}>
          <div>
            <label className="label">Title</label>
            <input className="input text-lg font-medium" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Slug <span className="normal-case tracking-normal text-ink-500">(auto from title if blank)</span></label>
              <input className="input font-mono text-xs" value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="my-post" />
            </div>
            <div>
              <label className="label">Tags <span className="normal-case tracking-normal text-ink-500">(comma-separated)</span></label>
              <input className="input font-mono text-xs" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="quant, momentum" />
            </div>
          </div>
          <div>
            <label className="label">Excerpt</label>
            <textarea className="input" rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences shown in the list." />
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="label !mb-0">Content <span className="normal-case tracking-normal text-ink-500">(Markdown · GFM · $\LaTeX$ math · fenced code)</span></label>
              <div className="flex items-center gap-2">
                {uploading && <span className="font-mono text-[11px] text-accent-400">uploading {uploading}…</span>}
                <button type="button" onClick={() => setShowLibrary((v) => !v)} className="btn-ghost !px-2.5 !py-1 text-xs">
                  {showLibrary ? "Hide images" : "Images"}
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!!uploading} className="btn-ghost !px-2.5 !py-1 text-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                  Insert image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                  multiple
                  hidden
                  onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
                />
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className={`input min-h-[60vh] resize-y font-mono text-[13px] leading-relaxed transition ${dragging ? "!border-accent-400 ring-2 ring-accent-500/30" : ""}`}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onPaste={onPaste}
              placeholder={"## Heading\n\nSome text with **bold** and `code`.\n\nDrop, paste, or insert an image — it becomes ![alt](/api/images/…)\n\n$$\\text{Sharpe} = \\frac{E[R - R_f]}{\\sigma}$$\n\n```python\nprint('hello')\n```"}
              spellCheck
            />
            <p className="mt-1.5 text-[11px] text-ink-500">Drag & drop or paste images directly into the editor. Large images are resized to 1800px and stored as WebP.</p>
          </div>

          {showLibrary && (
            <div className="card p-4">
              <p className="label">Uploaded images</p>
              {library === null && <p className="text-sm text-ink-500">Loading…</p>}
              {library?.length === 0 && <p className="text-sm text-ink-400">No images yet.</p>}
              {library && library.length > 0 && (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {library.map((img) => (
                    <li key={img.id} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/60 p-2">
                      <img src={img.url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs text-ink-100">{img.filename}</p>
                        <p className="text-[11px] text-ink-500">{fmtBytes(img.size)}{img.width ? ` · ${img.width}×${img.height}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => insertAtCursor(imageMarkdown(img))} className="btn-ghost !px-2 !py-1 text-xs">Insert</button>
                        <button type="button" onClick={() => removeImage(img)} className="btn-ghost !px-2 !py-1 text-xs text-danger-400 hover:border-danger-400/50" aria-label="Delete image">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={`${preview ? "" : "hidden lg:block"}`}>
          <p className="label">Preview</p>
          <div className="card min-h-[60vh] p-6">
            <h1 className="text-3xl font-semibold tracking-tight text-ink-50">{form.title || "Untitled"}</h1>
            {form.excerpt && <p className="mt-3 text-ink-300">{form.excerpt}</p>}
            <hr className="my-6 border-ink-700" />
            <Markdown>{form.content || "_Start writing on the left…_"}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
