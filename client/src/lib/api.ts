export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Post extends PostSummary {
  content: string;
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
}

export interface ImageMeta {
  id: string;
  filename: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  createdAt?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  posts: {
    list: (all = false) => request<PostSummary[]>(`/api/posts${all ? "?all=1" : ""}`),
    get: (slug: string) => request<Post>(`/api/posts/${encodeURIComponent(slug)}`),
    create: (input: PostInput) => request<Post>("/api/posts", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: PostInput) =>
      request<Post>(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    remove: (id: number) => request<{ ok: true }>(`/api/posts/${id}`, { method: "DELETE" }),
  },
  auth: {
    me: () => request<{ authenticated: boolean }>("/api/auth/me"),
    login: (password: string) => request<{ ok: true }>("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }),
    logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  },
  images: {
    list: () => request<ImageMeta[]>("/api/images"),
    remove: (id: string) => request<{ ok: true }>(`/api/images/${id}`, { method: "DELETE" }),
    upload: async (blob: Blob, name: string, width?: number, height?: number) => {
      const q = new URLSearchParams({ name });
      if (width) q.set("w", String(width));
      if (height) q.set("h", String(height));
      const res = await fetch(`/api/images?${q}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": blob.type || "application/octet-stream" },
        body: blob,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, body?.error ?? `Upload failed (${res.status})`);
      return body as ImageMeta;
    },
  },
  contact: (input: { name: string; email: string; company?: string; message: string; website?: string }) =>
    request<{ ok: true }>("/api/contact", { method: "POST", body: JSON.stringify(input) }),
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
