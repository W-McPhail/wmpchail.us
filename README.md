# wmcphail.us

Portfolio, résumé, and blog for Willow McPhail — software engineer & quantitative trader.

**Stack:** React 18 + TypeScript + Tailwind v4 (Vite) · Express + TypeScript · PostgreSQL (Drizzle ORM) · Resend (email) · Twilio (SMS) · Render.

```
client/   Vite React app (pages, components, resume content in src/data/resume.ts)
server/   Express API, Postgres schema + migrations, contact notifications
render.yaml  Render blueprint (web service + Postgres)
```

## Features

- **Resume-driven home page** — hero with live stats, research, experience timeline, skills, education. Content lives in `client/src/data/resume.ts`; the PDF is served at `/Willow-McPhail-Resume.pdf`.
- **Contact me** — modal form (nav, hero, and footer CTA). Submissions are stored in Postgres and forwarded by **email (Resend)** and **SMS (Twilio)**. Rate-limited, honeypot-protected.
- **Blog / writing** — Markdown with GitHub-flavored tables, LaTeX math (`$...$`, `$$...$$`), and syntax-highlighted code. Drafts vs. published.
- **Admin** at `/admin` — password login, post list, split-pane editor with live preview.

## Local development

Requirements: Node 20+, a Postgres URL (Docker is easiest).

```bash
docker run -d --name wm-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=wmcphail -p 55432:5432 postgres:16-alpine
cp .env.example .env         # then edit ADMIN_PASSWORD / SESSION_SECRET
npm install
npm run dev                  # client on :5173 (proxies /api), server on :3000
```

Migrations run automatically when the server starts. After changing `server/src/db/schema.ts`, generate a new migration:

```bash
npm run db:generate
```

## Deploying to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick the repo. Render reads `render.yaml` and creates the web service + Postgres.
3. Set the secrets marked `sync: false` in the dashboard: `ADMIN_PASSWORD`, `RESEND_API_KEY`, and optionally the three `TWILIO_*` values.
4. Point your domain (`wmcphail.us`) at the service under **Settings → Custom Domains**.

The build runs `npm ci --include=dev && npm run build` (dev deps are needed because Render sets `NODE_ENV=production`, which makes plain `npm ci` skip Vite and TypeScript) (client + server), and `npm start` serves the built client and the API from one process. Migrations run on boot.

### Notifications

- **Email (Resend):** sign up, create an API key, set `RESEND_API_KEY`. Until you verify your domain, keep `RESEND_FROM` on `onboarding@resend.dev` (Resend only delivers those to the account owner's address — which is your inbox, so that's fine).
- **SMS (Twilio):** set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and a purchased `TWILIO_FROM_NUMBER`. On a trial account you must verify `+19148061544` as a recipient first.

If either integration isn't configured, the inquiry is still saved to the `inquiries` table and the server logs it.

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/contact` | — | Submit inquiry (5/hour/IP) |
| GET | `/api/posts` | — | Published posts (`?all=1` includes drafts when signed in) |
| GET | `/api/posts/:slug` | — | One post (drafts only when signed in) |
| POST/PUT/DELETE | `/api/posts[/:id]` | admin | Create / update / delete |
| POST | `/api/auth/login` · `/logout` · GET `/me` | — | Admin session |
