import Link from "next/link";
import CopyCommand from "../../components/copy-command";
import { GithubStarCount } from "../../components/github-star-count";
import { getGithubStars } from "../../components/github-stars";

// Shared CSS classes
const styles = {
  section: "w-full",
  sectionHeader: "mx-auto max-w-3xl text-center",
  sectionTitle: "text-3xl font-bold tracking-tight sm:text-4xl",
  sectionDescription: "mt-4 text-base text-fd-muted-foreground sm:text-lg",
  card: "rounded-2xl border border-fd-border bg-fd-card p-6",
  iconWrapper:
    "flex items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/20",
  primaryButton:
    "inline-flex h-11 items-center justify-center rounded-lg bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90",
  secondaryButton:
    "inline-flex h-11 items-center justify-center rounded-lg border border-fd-border bg-fd-card px-8 text-sm font-medium transition-colors hover:bg-fd-accent",
};

const features = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
    title: "Lightning Fast",
    description: "Scaffold a full-stack project in under one minute.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    title: "Production Ready",
    description: "Sensible defaults, clean structure, and robust tooling included.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
      />
    ),
    title: "Modular",
    description: "Start minimal and add auth or database modules when needed.",
  },
];

const quickSteps = [
  {
    title: "Pick your stack",
    description: "Select framework, database, and auth based on your project needs.",
  },
  {
    title: "Generate project",
    description: "Run one command to scaffold a production-ready structure.",
  },
  {
    title: "Iterate safely",
    description: "Add modules and run checks as your app grows.",
  },
];

const resources = [
  {
    title: "Quick Start",
    description: "Setup your first app with the recommended workflow.",
    href: "/docs/getting-started/quickstart",
  },
  {
    title: "CLI Reference",
    description: "See all commands, flags, and usage examples.",
    href: "/docs/cli/overview",
  },
  {
    title: "Troubleshooting",
    description: "Fix common setup and runtime issues quickly.",
    href: "/docs/reference/troubleshooting",
  },
];

export default async function HomePage() {
  const stars = await getGithubStars();
  return (
    <div className="container mx-auto flex max-w-6xl flex-col items-center gap-20 pb-24">
      {/* Hero Section */}
      <section className="relative w-full pt-10">
        <div className="rounded-3xl border border-fd-border bg-fd-card/60 px-6 py-12 text-center backdrop-blur-sm sm:px-10 md:py-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fd-primary/20 bg-fd-card px-4 py-1.5 text-xs font-medium text-fd-muted-foreground">
            <span className="size-2 rounded-full bg-fd-primary" />
            Production-ready in under 60 seconds
          </div>

          <div className="mx-auto mt-7 max-w-4xl space-y-5">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Build and ship full-stack apps faster
            </h1>
            <p className="mx-auto max-w-2xl text-base text-fd-muted-foreground sm:text-lg md:text-xl">
              StackKit scaffolds a clean project foundation with your framework, database, and auth
              choices—so your team can focus on product, not setup.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/docs/getting-started/quickstart" className={styles.primaryButton}>
              Get Started
            </Link>
            <a
              href="https://github.com/tariqul420/stackkit"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.secondaryButton} gap-2`}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>Star on GitHub</span>
              {stars !== null && stars > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                  ★ <GithubStarCount count={stars} />
                </span>
              )}
            </a>
          </div>

          <div className="mx-auto mt-9 max-w-3xl">
            <CopyCommand />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.section}>
        <div className="mx-auto max-w-3xl pb-10 text-center">
          <h2 className={styles.sectionTitle}>Why teams choose StackKit</h2>
          <p className={styles.sectionDescription}>
            Built for teams who want reliable defaults and faster delivery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className="space-y-4">
                <div className={`${styles.iconWrapper} size-14`}>
                  <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-fd-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className="mx-auto max-w-3xl pb-10 text-center">
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionDescription}>A simple path from idea to production setup.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {quickSteps.map((step, index) => (
            <div key={step.title} className={styles.card}>
              <div className="inline-flex size-8 items-center justify-center rounded-full bg-fd-primary/10 text-sm font-semibold text-fd-primary">
                {index + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-fd-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className={styles.section}>
        <div className="mx-auto max-w-3xl pb-10 text-center">
          <h2 className={styles.sectionTitle}>Essential resources</h2>
          <p className={styles.sectionDescription}>
            Use these docs to get started and troubleshoot quickly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="rounded-xl border border-fd-border bg-fd-card px-5 py-4 transition-colors hover:border-fd-primary/30 hover:bg-fd-accent"
            >
              <h3 className="text-base font-semibold">{resource.title}</h3>
              <p className="mt-1 text-sm text-fd-muted-foreground">{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-fd-border bg-fd-card p-10 text-center md:p-14">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to launch faster?
                </h2>
                <p className="mx-auto max-w-2xl text-base text-fd-muted-foreground sm:text-lg">
                  Follow the quick start and generate your first project in under a minute.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/docs/getting-started/quickstart" className={styles.primaryButton}>
                  Get Started →
                </Link>
                <Link href="/docs" className={styles.secondaryButton}>
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
