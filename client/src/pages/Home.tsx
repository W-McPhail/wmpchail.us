import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Section, Tag } from "../components/Section";
import { EquityCurve } from "../components/EquityCurve";
import { useContact } from "../components/ContactContext";
import { api, formatDate, type PostSummary } from "../lib/api";
import { education, experience, interests, languages, profile, research, skills, stats } from "../data/resume";

export default function Home() {
  const { open } = useContact();
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    api.posts.list().then((p) => setPosts(p.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
          <div className="animate-fade-up">
            <p className="eyebrow">{profile.location}</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink-50 sm:text-6xl lg:text-7xl">
              {profile.name.split(" ")[0]}
              <br />
              <span className="text-ink-400">{profile.name.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="mt-5 font-mono text-base text-accent-400 sm:text-lg">
              software engineer <span className="text-ink-500">·</span> quantitative trader
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">{profile.summary}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={open} className="btn-primary">
                Contact me
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /></svg>
                Résumé (PDF)
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" /></svg>
                {profile.githubHandle}
              </a>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="card relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-ink-400">cross-sectional momentum · walk-forward</p>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-accent-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_#34d399]" /> live
                </span>
              </div>
              <EquityCurve className="mt-3 h-40 w-full sm:h-48" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-3.5">
                    <p className="font-mono text-2xl font-semibold text-ink-50">{s.value}</p>
                    <p className="mt-1 text-xs font-medium text-ink-300">{s.label}</p>
                    <p className="text-[11px] text-ink-500">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <Section id="about" eyebrow="About" title="Research rigor, engineered end to end.">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4 text-lg leading-relaxed text-ink-300">
            <p>
              I sit at the intersection of quantitative research and software engineering. On the research side I
              build signal libraries, score them with IC / ICIR, gate them on net-of-cost Sharpe, and validate everything
              walk-forward so the results survive contact with live markets. On the engineering side I ship and operate
              production systems: schemas, migrations, auth, deployment, and incident response.
            </p>
            <p>{profile.seeking}</p>
          </div>
          <div className="card p-6">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-ink-400">Focus</dt><dd className="text-right text-ink-100">Quant research · Systematic trading · Full-stack</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-400">Markets</dt><dd className="text-right text-ink-100">Crypto futures · CME NQ</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-400">Education</dt><dd className="text-right text-ink-100">{education.degree}, {education.school}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-400">Languages</dt><dd className="text-right text-ink-100">{languages.join(" · ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-400">Off-screen</dt><dd className="text-right text-ink-100">{interests.join(" · ")}</dd></div>
            </dl>
          </div>
        </div>
      </Section>

      {/* Research */}
      <Section
        id="research"
        eyebrow="Quantitative research"
        title={research.title}
        intro="An independent research program on cross-sectional momentum and pairs statistical arbitrage in crypto, with the emphasis on validation and failure-mode diagnosis rather than headline backtest numbers."
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {research.stack.map((s) => <Tag key={s}>{s}</Tag>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {research.bullets.map((b, i) => (
            <article key={b.head} className={`card card-hover p-6 ${i === 0 ? "md:col-span-2" : ""}`}>
              <p className="font-mono text-xs text-accent-400">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink-50">{b.head}</h3>
              <p className="mt-2 leading-relaxed text-ink-300">{b.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section id="experience" eyebrow="Experience" title="Where the work has been.">
        <ol className="relative space-y-10 border-l border-ink-700 pl-8">
          {experience.map((e) => (
            <li key={e.role + e.org} className="relative">
              <span className="absolute -left-[37px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent-500 bg-ink-900" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-semibold text-ink-50">
                  {e.role} <span className="text-ink-400">·</span>{" "}
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noreferrer" className="text-accent-400 hover:underline">{e.org}</a>
                  ) : (
                    <span className="text-ink-200">{e.org}</span>
                  )}
                </h3>
                <p className="font-mono text-xs text-ink-400">{e.period} · {e.location}</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-ink-300">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">{e.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Skills + Education */}
      <Section id="skills" eyebrow="Skills" title="Toolkit.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {skills.map((g) => (
              <div key={g.group} className="card p-5">
                <p className="font-mono text-xs uppercase tracking-wider text-ink-400">{g.group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span key={s} className="rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-sm text-ink-100">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="card h-fit p-6">
            <p className="eyebrow">Education</p>
            <h3 className="mt-3 text-lg font-semibold text-ink-50">{education.degree}</h3>
            <p className="text-ink-300">{education.school}</p>
            <p className="mt-1 font-mono text-xs text-ink-400">{education.period} · {education.location}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-300">
              {education.details.map((d) => (
                <li key={d} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent-400" />{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Writing */}
      <Section id="writing" eyebrow="Writing" title="Notes on markets and code.">
        {posts.length === 0 ? (
          <p className="text-ink-400">Posts are on the way. <Link to="/blog" className="text-accent-400 hover:underline">Visit the blog →</Link></p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="card card-hover flex flex-col p-6">
                <p className="font-mono text-xs text-ink-400">{formatDate(p.publishedAt)}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-50">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-300">{p.excerpt}</p>
                <span className="mt-auto pt-4 text-sm text-accent-400">Read →</span>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link to="/blog" className="text-sm text-ink-300 hover:text-accent-400">All posts →</Link>
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="grid-bg absolute inset-0 -z-10 opacity-60" />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">Hiring?</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-50">Let's talk about the role.</h2>
              <p className="mt-2 max-w-xl text-ink-400">
                Quant research, trading, or engineering. Send a note and I'll get back to you quickly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={open} className="btn-primary">Contact me</button>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost">Résumé</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
