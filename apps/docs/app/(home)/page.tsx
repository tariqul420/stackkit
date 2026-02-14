import Link from "next/link";
import CopyCommand from "../../components/copy-command";

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

export default function HomePage() {
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
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Star on GitHub</span>
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
