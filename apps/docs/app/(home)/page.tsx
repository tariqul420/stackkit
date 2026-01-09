import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container relative px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-fd-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-fd-primary"></span>
            </span>
            <span>Production-Ready in 60 Seconds</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Ship Production-Ready Apps
            <br />
            <span className="bg-linear-to-r from-fd-primary to-fd-primary/50 bg-clip-text text-transparent">
              in 60 Seconds
            </span>
          </h1>

          <p className="max-w-2xl text-base text-fd-muted-foreground sm:text-lg md:text-xl">
            Full-stack project generator with authentication, database, and TypeScript configured
            out of the box. Choose your stack, run one command, start building.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-md bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/tariqul420/stackkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-fd-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Command Box */}
          <div className="relative mt-12 w-full max-w-2xl">
            <div className="overflow-hidden rounded-lg border-2 border-fd-primary/20 bg-fd-card shadow-lg">
              <div className="border-b bg-fd-muted/30 px-4 py-2 text-xs font-medium text-fd-muted-foreground">
                Terminal
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-fd-muted-foreground">$</span>
                  <span className="select-all text-base font-semibold sm:text-lg">
                    npx create-stackkit-app@latest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container space-y-12 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for developers who value their time
          </h2>
          <p className="mt-4 text-lg text-fd-muted-foreground">
            Enterprise-grade features without the enterprise setup time
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Lightning Fast</h3>
            <p className="text-sm text-fd-muted-foreground">
              From zero to running app in under 60 seconds
            </p>
          </div>

          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Production Ready</h3>
            <p className="text-sm text-fd-muted-foreground">
              Best practices, error handling, and security baked in
            </p>
          </div>

          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Modular</h3>
            <p className="text-sm text-fd-muted-foreground">
              Start minimal, add features as you grow
            </p>
          </div>

          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Type Safe</h3>
            <p className="text-sm text-fd-muted-foreground">
              End-to-end TypeScript with strict mode by default
            </p>
          </div>

          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Database Flexibility</h3>
            <p className="text-sm text-fd-muted-foreground">
              Prisma or Mongoose with PostgreSQL/MongoDB
            </p>
          </div>

          <div className="rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-fd-primary/10 text-fd-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold">Auth Ready</h3>
            <p className="text-sm text-fd-muted-foreground">
              Better Auth or Clerk with pre-built flows
            </p>
          </div>
        </div>
      </section>

      {/* Stack Showcase */}
      <section className="container px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your stack, your choice
            </h2>
            <p className="mt-4 text-lg text-fd-muted-foreground">
              All combinations tested and production-proven
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm0 2.15l8.5 4.97v9.76L12 21.85l-8.5-4.97V7.12L12 2.15z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Frameworks</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Next.js 16 (App Router)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>React + Vite</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Express</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C8.5 1 5.5 2.5 5.5 4.5v15c0 2 3 3.5 6.5 3.5s6.5-1.5 6.5-3.5v-15C18.5 2.5 15.5 1 12 1zm0 2c2.5 0 4.5 1 4.5 1.5S14.5 6 12 6 7.5 5 7.5 4.5 9.5 3 12 3zm0 18c-2.5 0-4.5-1-4.5-1.5V18c1 .5 2.7.8 4.5.8s3.5-.3 4.5-.8v1.5c0 .5-2 1.5-4.5 1.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Databases</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Prisma (PostgreSQL/MongoDB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Mongoose (MongoDB)</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Authentication</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Better Auth</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-fd-primary"></div>
                  <span>Clerk</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-lg border bg-fd-card p-6 text-center">
              <div className="text-3xl font-bold text-fd-primary">3</div>
              <div className="mt-1 text-sm font-medium">Frameworks</div>
            </div>
            <div className="rounded-lg border bg-fd-card p-6 text-center">
              <div className="text-3xl font-bold text-fd-primary">12+</div>
              <div className="mt-1 text-sm font-medium">Combinations</div>
            </div>
            <div className="rounded-lg border bg-fd-card p-6 text-center">
              <div className="text-3xl font-bold text-fd-primary">100%</div>
              <div className="mt-1 text-sm font-medium">Type Safe</div>
            </div>
            <div className="rounded-lg border bg-fd-card p-6 text-center">
              <div className="text-3xl font-bold text-fd-primary">&lt;60s</div>
              <div className="mt-1 text-sm font-medium">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start building instead of configuring
          </h2>
          <p className="mt-4 text-lg text-fd-muted-foreground">
            Join developers shipping faster with StackKit. Get started in 60 seconds.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-md bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-fd-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              Read Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
