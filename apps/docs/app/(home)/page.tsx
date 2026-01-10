import Link from 'next/link';

// Shared CSS classes
const styles = {
  section: 'container px-6 py-32',
  sectionHeader: 'mx-auto max-w-3xl text-center',
  sectionTitle: 'text-4xl font-bold tracking-tight sm:text-5xl',
  sectionDescription: 'mt-6 text-xl text-fd-muted-foreground',
  card: 'group relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-8 transition-all',
  cardGlow: 'absolute rounded-full bg-fd-primary/5 blur-2xl transition-all',
  iconWrapper: 'flex items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/20',
  primaryButton:
    'inline-flex h-12 items-center justify-center rounded-lg bg-fd-primary px-10 text-base font-medium text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-fd-primary/30',
  secondaryButton:
    'inline-flex h-12 items-center justify-center rounded-lg border border-fd-border bg-fd-card/80 px-10 text-base font-medium backdrop-blur-sm transition-all hover:scale-105 hover:bg-fd-accent',
  gradientText: 'bg-linear-to-br from-fd-primary to-fd-primary/60 bg-clip-text text-transparent',
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
    title: 'Lightning Fast',
    description: 'From zero to running app in under 60 seconds',
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
    title: 'Production Ready',
    description: 'Best practices, error handling, and security baked in',
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
    title: 'Modular',
    description: 'Start minimal, add features as you grow',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    ),
    title: 'Type Safe',
    description: 'End-to-end TypeScript with strict mode by default',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    ),
    title: 'Database Flexibility',
    description: 'Prisma or Mongoose with PostgreSQL/MongoDB',
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
    title: 'Auth Ready',
    description: 'Better Auth or Clerk with pre-built flows',
  },
];

const stackCategories = [
  {
    icon: (
      <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm0 2.15l8.5 4.97v9.76L12 21.85l-8.5-4.97V7.12L12 2.15z" />
    ),
    title: 'Frameworks',
    items: ['Next.js 16 (App Router)', 'React + Vite', 'Express'],
  },
  {
    icon: (
      <path d="M12 1C8.5 1 5.5 2.5 5.5 4.5v15c0 2 3 3.5 6.5 3.5s6.5-1.5 6.5-3.5v-15C18.5 2.5 15.5 1 12 1zm0 2c2.5 0 4.5 1 4.5 1.5S14.5 6 12 6 7.5 5 7.5 4.5 9.5 3 12 3zm0 18c-2.5 0-4.5-1-4.5-1.5V18c1 .5 2.7.8 4.5.8s3.5-.3 4.5-.8v1.5c0 .5-2 1.5-4.5 1.5z" />
    ),
    title: 'Databases',
    items: ['Prisma (PostgreSQL/MongoDB)', 'Mongoose (MongoDB)'],
  },
  {
    icon: (
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    ),
    title: 'Authentication',
    items: ['Better Auth', 'Clerk'],
  },
];

const stats = [
  { value: '3', label: 'Frameworks' },
  { value: '12+', label: 'Combinations' },
  { value: '100%', label: 'Type Safe' },
  { value: '<60s', label: 'Setup Time' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="container relative px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-fd-primary/20 bg-fd-card/50 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-fd-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-fd-primary"></span>
            </span>
            <span>Production-Ready in 60 Seconds</span>
          </div>

          <div className="space-y-6">
            <h1 className="max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Ship Production-Ready Apps
              <br />
              <span className="bg-linear-to-r from-fd-primary via-fd-primary to-fd-primary/60 bg-clip-text text-transparent">
                in 60 Seconds
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-fd-muted-foreground sm:text-xl md:text-2xl">
              Full-stack project generator with authentication, database, and TypeScript configured
              out of the box.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/docs" className={styles.primaryButton}>
              Get Started →
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

          {/* Command Box */}
          <div className="mt-16 w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card/80 shadow-md backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-2 text-xs font-medium text-fd-muted-foreground">terminal</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 font-mono text-lg">
                  <span className="text-fd-primary">$</span>
                  <span className="select-all font-semibold">npx create-stackkit-app@latest</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.section}>
        <div className="mx-auto max-w-6xl space-y-16">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for developers who value their time</h2>
            <p className={styles.sectionDescription}>
              Enterprise-grade features without the enterprise setup time
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className={styles.card}>
                <div
                  className={`${styles.cardGlow} -right-8 -top-8 size-32 group-hover:bg-fd-primary/10`}
                />
                <div className="relative space-y-4">
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
        </div>
      </section>

      {/* Stack Showcase */}
      <section className={styles.section}>
        <div className="mx-auto max-w-6xl space-y-16">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your stack, your choice</h2>
            <p className={styles.sectionDescription}>
              All combinations tested and production-proven
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {stackCategories.map((category, index) => (
              <div key={index} className={`${styles.card} hover:shadow-xl`}>
                <div
                  className={`${styles.cardGlow} -right-4 -top-4 size-24 blur-xl group-hover:scale-150`}
                />
                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`${styles.iconWrapper} size-12`}>
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                        {category.icon}
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  <ul className="space-y-3 text-fd-muted-foreground">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-md bg-fd-primary/10">
                          <div className="size-2 rounded-full bg-fd-primary" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.section}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-fd-border bg-fd-card p-8 text-center">
                  <div className={`mb-2 text-5xl font-bold ${styles.gradientText}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-fd-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container relative px-6 py-32">
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-fd-primary/5 to-transparent" />
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-fd-border bg-fd-card/50 p-12 text-center backdrop-blur-sm md:p-16">
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-fd-primary/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-fd-primary/10 blur-3xl" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Start building instead of configuring
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-fd-muted-foreground md:text-xl">
                  Join developers shipping faster with StackKit. Get started in 60 seconds.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/docs" className={styles.primaryButton}>
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
