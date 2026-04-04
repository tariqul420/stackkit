import Link from "next/link";
import CopyCommand from "../../components/copy-command";
import { GithubStarCount } from "../../components/github-star-count";
import { getGithubStars } from "../../components/github-stars";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const ArrowRight = () => (
  <svg
    className="size-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const features = [
  {
    title: "Up in under a minute",
    description:
      "One command, a few prompts, and you have a fully-wired project ready to run. No more starting from scratch every time.",
  },
  {
    title: "No lock-in",
    description:
      "StackKit is a generator, not a framework. The code it writes uses standard libraries — you own every file with no runtime dependency.",
  },
  {
    title: "Modular by design",
    description:
      "Start minimal. Add a database or auth module later with a single command. StackKit only shows options compatible with your setup.",
  },
  {
    title: "Production defaults",
    description:
      "TypeScript strict mode, ESLint, documented .env variables, and git — all handled so your project is solid from commit one.",
  },
];

const steps = [
  {
    n: "01",
    cmd: "npx stackkit@latest create my-app",
    label: "Scaffold your project",
    detail: "Choose your framework, database, and auth from a short interactive prompt.",
  },
  {
    n: "02",
    cmd: "cp .env.example .env",
    label: "Configure environment",
    detail: "Every variable is already documented. Fill in your credentials and you're done.",
  },
  {
    n: "03",
    cmd: "npm run dev",
    label: "Start building",
    detail: "Your app is running. Add more modules any time with stackkit add.",
  },
];

const links = [
  {
    title: "Quick Start",
    description: "Get your first project running step by step.",
    href: "/docs/getting-started/quickstart",
  },
  {
    title: "CLI Reference",
    description: "All commands, flags, and options explained.",
    href: "/docs/cli/overview",
  },
  {
    title: "Modules",
    description: "Deep dives into every integration.",
    href: "/docs/modules/authentication/better-auth",
  },
  {
    title: "Troubleshooting",
    description: "Fix the most common problems fast.",
    href: "/docs/reference/troubleshooting",
  },
];

export default async function HomePage() {
  const stars = await getGithubStars();

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="relative w-full overflow-hidden px-6 pt-20 pb-24 text-center sm:px-10">
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.07] text-fd-primary"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow orb — top center */}
        <div
          aria-hidden
          className="animate-pulse-slow pointer-events-none absolute -top-48 left-1/2 -z-10 h-130 w-180 -translate-x-1/2 rounded-full bg-fd-primary/15 blur-3xl"
        />

        {/* Glow orb — bottom right */}
        <div
          aria-hidden
          className="animate-drift pointer-events-none absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-fd-primary/10 blur-3xl"
          style={{ animationDelay: "3s" }}
        />

        {/* Glow orb — left */}
        <div
          aria-hidden
          className="animate-drift pointer-events-none absolute top-1/3 -left-20 -z-10 h-56 w-56 rounded-full bg-fd-primary/8 blur-3xl"
          style={{ animationDelay: "7s" }}
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Badge */}
          <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3.5 py-1 text-xs font-medium text-fd-muted-foreground">
            <span className="size-1.5 rounded-full bg-fd-primary" />
            Open-source · No lock-in · TypeScript first
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
            style={{ animationDelay: "100ms" }}
          >
            Stop setting up.{" "}
            <span className="bg-linear-to-br from-fd-primary to-fd-primary/60 bg-clip-text text-transparent">
              Start building.
            </span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-fd-muted-foreground sm:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            StackKit scaffolds a production-ready project with your chosen framework, database, and
            auth — fully wired and ready to run in under a minute.
          </p>

          {/* Actions */}
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/docs/getting-started/quickstart"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started <ArrowRight />
            </Link>
            <a
              href="https://github.com/tariqul420/stackkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              <GithubIcon />
              GitHub
              {stars !== null && stars > 0 && (
                <span className="ml-0.5 rounded-full bg-fd-muted px-1.5 py-0.5 text-xs font-semibold">
                  <GithubStarCount count={stars} />
                </span>
              )}
            </a>
          </div>

          {/* Terminal */}
          <div
            className="animate-fade-up mx-auto mt-10 max-w-2xl"
            style={{ animationDelay: "420ms" }}
          >
            <CopyCommand />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full border-t border-fd-border">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why developers use StackKit
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Eliminate setup friction without giving up flexibility.
            </p>
          </div>

          <div className="grid gap-px rounded-2xl border border-fd-border bg-fd-border sm:grid-cols-2">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-none bg-fd-card p-7 first:rounded-tl-2xl nth-2:rounded-tr-2xl nth-last-2:rounded-bl-2xl last:rounded-br-2xl"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="w-full border-t border-fd-border bg-fd-card/40">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              From zero to running in three steps
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              No reading required. Run the command and follow the prompts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-4">
                <span className="text-4xl font-bold tabular-nums text-fd-border">{s.n}</span>
                <div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{s.detail}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-3.5 py-2.5 font-mono text-xs text-fd-muted-foreground">
                  <span className="select-none text-fd-primary">$</span>
                  {s.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Docs links */}
      <section className="w-full border-t border-fd-border">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Documentation</h2>
            <p className="mt-3 text-fd-muted-foreground">Everything in one place.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((l) => (
              <Link
                key={l.title}
                href={l.href}
                className="group flex flex-col gap-1.5 rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent"
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{l.title}</span>
                  <span className="text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-primary">
                    <ArrowRight />
                  </span>
                </span>
                <p className="text-xs leading-relaxed text-fd-muted-foreground">{l.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full border-t border-fd-border">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to skip the boilerplate?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-fd-muted-foreground">
            Your next project is one command away.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/getting-started/quickstart"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started <ArrowRight />
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-10 items-center rounded-lg border border-fd-border bg-fd-card px-5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Browse Docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

