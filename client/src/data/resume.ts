export const profile = {
  name: "Willow McPhail",
  title: "Software Engineer & Quantitative Trader",
  location: "New York, NY",
  email: "mcphailwillow@gmail.com",
  phone: "914-806-1544",
  phoneHref: "tel:+19148061544",
  github: "https://github.com/w-mcphail",
  githubHandle: "w-mcphail",
  resumeUrl: "/Willow-McPhail-Resume.pdf",
  summary:
    "Quantitative researcher and trader combining independent research in factor signals, statistical arbitrage, and walk-forward validation with live-market experience in systematic and discretionary futures trading. I also design, build, and run production software end to end.",
  seeking:
    "Open to quant research / trading roles and software engineering roles where rigorous signal research, disciplined risk management, and shipping real systems translate directly.",
};

export const stats = [
  { label: "Net Sharpe, walk-forward", value: "0.41", note: "after 10 bps/turnover" },
  { label: "Systematic strategies", value: "30+", note: "designed, backtested, deployed" },
  { label: "Signal library", value: "20", note: "IC / ICIR measured" },
  { label: "Profit factor, live", value: "1.7", note: "max drawdown 20%, 2 yrs" },
];

export const research = {
  title: "Crypto Statistical Arbitrage Research",
  stack: ["Python", "pandas", "NumPy", "statsmodels", "scipy"],
  bullets: [
    {
      head: "Cross-sectional momentum, net of costs",
      body:
        "Achieved Sharpe 0.41 net of 10 bps/turnover costs on a daily-rebalanced cross-sectional long/short momentum strategy across a 20-asset crypto universe, walk-forward validated over 2 years of daily bars.",
    },
    {
      head: "20-signal library with IC / ICIR scoring",
      body:
        "Engineered signals spanning cross-sectional momentum, BTC-adjusted excess momentum, time-series momentum, volume-confirmed momentum, and mean reversion; measured signal quality via Information Coefficient (IC) and ICIR across all signals.",
    },
    {
      head: "Portfolio construction bake-off",
      body:
        "Applied a net-Sharpe quality gate to filter qualifying signals; compared six construction methods: equal weight, rank-normalize, regime-filtered, Sharpe-weighted, IC-weighted, and mean-variance.",
    },
    {
      head: "Three independent walk-forward frameworks",
      body:
        "Validated signal-window selection, the portfolio construction pipeline, and pairs selection separately; identified regime-dependency as the primary failure mode (profitable in trending markets, negative in choppy / macro-shock regimes).",
    },
    {
      head: "Pairs stat-arb pipeline and selection-bias diagnosis",
      body:
        "Built Engle-Granger cointegration, expanding-OLS hedge ratios, and spread z-score entry/exit; diagnosed spurious cointegration in crypto (185/190 pairs flagged at p < 0.05) and an IS/OOS Sharpe gap of 1.6 → −0.14 under walk-forward.",
    },
  ],
};

export interface Experience {
  role: string;
  org: string;
  period: string;
  location: string;
  href?: string;
  bullets: string[];
  tags: string[];
}

export const experience: Experience[] = [
  {
    role: "Quantitative / Futures Trader",
    org: "Self-Directed",
    period: "May 2024 — Present",
    location: "New York, NY",
    tags: ["Crypto futures", "CME NQ", "Systematic", "Discretionary", "Risk"],
    bullets: [
      "Designed, backtested, and deployed 30+ systematic trading strategies across crypto futures (momentum, mean-reversion, and statistical signals), prioritizing out-of-sample validation and transaction-cost modeling over in-sample fit.",
      "Traded CME E-mini Nasdaq-100 (NQ) futures discretionarily, documenting repeatable asymmetric setups (avg 2.5 R:R, ~2:1 winner-to-loser) and translating market-microstructure intuition into testable, rules-based hypotheses.",
      "Maintained disciplined live-capital risk management, holding maximum drawdown to 20% at a 1.7 profit factor across a two-year deployment period.",
    ],
  },
  {
    role: "Founder & Engineer",
    org: "Effortless Home Maintenance",
    period: "Aug 2026 — Present",
    location: "New York, NY",
    href: "https://belashomemaintenance.com",
    tags: ["TypeScript", "React", "PostgreSQL", "Auth", "LLM pipeline", "Ops"],
    bullets: [
      "Designed, built, and deployed a production full-stack web application solo: TypeScript/React front end, PostgreSQL schema and migrations, user authentication, TLS and secrets management, and an LLM pipeline that parses uploaded documents into structured, bookable jobs.",
      "Live with a pilot home service provider: 30 bookings across 8 users since launch. Own deployment, uptime, and incident response.",
    ],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "TypeScript", "C++", "Java", "SQL"] },
  { group: "Quant stack", items: ["pandas", "NumPy", "statsmodels", "scipy", "Backtesting", "Walk-forward validation"] },
  {
    group: "Research",
    items: [
      "Factor research & IC analysis",
      "Statistical arbitrage",
      "Cointegration",
      "Cross-sectional momentum",
      "Portfolio construction & optimization",
      "Transaction cost modeling",
      "Regression analysis",
      "Statistical & mathematical modelling",
    ],
  },
  { group: "Engineering", items: ["React", "Node.js", "PostgreSQL", "REST APIs", "Auth & secrets", "Deployment & uptime", "LLM pipelines"] },
  { group: "Trading", items: ["Quantitative trading", "Discretionary futures", "Risk management", "Market microstructure"] },
];

export const education = {
  degree: "B.S. Computer Science",
  school: "Hunter College",
  period: "2019 — 2024",
  location: "New York, NY",
  details: ["GPA 3.5 / 4.0", "SAT Math 800", "SAT Math II 800"],
};

export const interests = ["Poker", "Chess", "Squash", "Skiing"];
export const languages = ["English", "Spanish"];
