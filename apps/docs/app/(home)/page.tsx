import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container relative overflow-hidden px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-fd-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-fd-primary"></span>
            </span>
            <span>Production-Ready CLI Tool</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build your stack,
            <br />
            <span className="text-fd-muted-foreground">ship in minutes</span>
          </h1>

          <p className="max-w-2xl text-base text-fd-muted-foreground sm:text-lg md:text-xl">
            Stop wasting time on project setup. StackKit generates production-ready applications
            with your favorite stack. Choose your framework, add auth and database, deploy.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/docs/getting-started/installation"
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
              Star on GitHub
            </a>
          </div>

          {/* Terminal Preview */}
          <div className="relative mt-8 w-full max-w-3xl">
            <div className="rounded-lg border bg-fd-card shadow-2xl">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-fd-muted"></div>
                  <div className="size-3 rounded-full bg-fd-muted"></div>
                  <div className="size-3 rounded-full bg-fd-muted"></div>
                </div>
                <div className="flex-1 text-center text-xs text-fd-muted-foreground">Terminal</div>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-fd-muted-foreground">$</span>
                  <div className="flex-1">
                    <div className="text-fd-foreground">npx create-stackkit-app my-app</div>
                    <div className="mt-3 space-y-1 text-fd-muted-foreground">
                      <div>✔ What framework would you like? › Next.js</div>
                      <div>✔ Choose database › Prisma (PostgreSQL)</div>
                      <div>✔ Add authentication? › Better Auth</div>
                      <div className="mt-2">
                        <span className="text-fd-primary">✓</span> Project created successfully!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-12 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-lg text-fd-muted-foreground">
            Powerful features that save hours of setup time and let you focus on building your
            product.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-fd-muted-foreground">
              Generate fully configured projects in seconds. From idea to running app in under a
              minute.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Modular Architecture</h3>
            <p className="text-sm text-fd-muted-foreground">
              Add authentication, database, or any module anytime. No need to decide everything
              upfront.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Production Ready</h3>
            <p className="text-sm text-fd-muted-foreground">
              TypeScript, ESLint, Prettier configured. Security best practices and error handling
              included.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Zero Configuration</h3>
            <p className="text-sm text-fd-muted-foreground">
              Database connections, auth flows, and environment variables configured automatically.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Database Flexibility</h3>
            <p className="text-sm text-fd-muted-foreground">
              Choose between Prisma or Mongoose. Support for PostgreSQL and MongoDB out of the box.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-fd-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-fd-background">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Auth Ready</h3>
            <p className="text-sm text-fd-muted-foreground">
              Integrate Better Auth or Clerk with pre-built authentication flows and session
              handling.
            </p>
          </div>
        </div>
      </section>

      {/* Stack Showcase */}
      <section className="container px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Choose your stack
            </h2>
            <p className="mt-4 text-lg text-fd-muted-foreground">
              Mix and match the best tools for your project. All combinations tested and
              battle-proven.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Frameworks */}
            <div className="rounded-lg border bg-fd-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10">
                  <svg className="size-5 text-fd-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm0 2.15l8.5 4.97v9.76L12 21.85l-8.5-4.97V7.12L12 2.15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Frameworks</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Next.js 16</div>
                    <div className="text-fd-muted-foreground">App Router, Server Components</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">React + Vite</div>
                    <div className="text-fd-muted-foreground">Fast HMR, Optimized builds</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Express</div>
                    <div className="text-fd-muted-foreground">Minimal, flexible Node.js</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Databases */}
            <div className="rounded-lg border bg-fd-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10">
                  <svg className="size-5 text-fd-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C8.5 1 5.5 2.5 5.5 4.5v15c0 2 3 3.5 6.5 3.5s6.5-1.5 6.5-3.5v-15C18.5 2.5 15.5 1 12 1zm0 2c2.5 0 4.5 1 4.5 1.5S14.5 6 12 6 7.5 5 7.5 4.5 9.5 3 12 3zm0 18c-2.5 0-4.5-1-4.5-1.5V18c1 .5 2.7.8 4.5.8s3.5-.3 4.5-.8v1.5c0 .5-2 1.5-4.5 1.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Databases</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Prisma</div>
                    <div className="text-fd-muted-foreground">
                      Type-safe ORM, PostgreSQL/MongoDB
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Mongoose</div>
                    <div className="text-fd-muted-foreground">MongoDB ODM with schemas</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Authentication */}
            <div className="rounded-lg border bg-fd-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10">
                  <svg className="size-5 text-fd-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Authentication</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Better Auth</div>
                    <div className="text-fd-muted-foreground">Modern TypeScript auth</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-fd-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Clerk</div>
                    <div className="text-fd-muted-foreground">Complete user management</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              From zero to deployed in 3 steps
            </h2>
            <p className="mt-4 text-lg text-fd-muted-foreground">
              No complicated setup. No configuration files. Just answer a few questions.
            </p>
          </div>

          <div className="space-y-12">
            <div className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-fd-primary bg-fd-background text-sm font-bold">
                  1
                </div>
                <div className="mt-2 h-full w-px bg-fd-border"></div>
              </div>
              <div className="pb-12">
                <h3 className="mb-2 text-xl font-semibold">Run the CLI</h3>
                <p className="mb-4 text-fd-muted-foreground">
                  Start with a single command. No installation required, works with npx.
                </p>
                <div className="rounded-lg border bg-fd-card p-4 font-mono text-sm">
                  <span className="text-fd-muted-foreground">$</span> npx create-stackkit-app my-app
                </div>
              </div>
            </div>

            <div className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-fd-primary bg-fd-background text-sm font-bold">
                  2
                </div>
                <div className="mt-2 h-full w-px bg-fd-border"></div>
              </div>
              <div className="pb-12">
                <h3 className="mb-2 text-xl font-semibold">Choose Your Stack</h3>
                <p className="mb-4 text-fd-muted-foreground">
                  Interactive prompts guide you through selecting framework, database, and auth.
                </p>
                <div className="space-y-2 rounded-lg border bg-fd-card p-4 font-mono text-sm">
                  <div className="text-fd-primary">? What framework would you like?</div>
                  <div className="pl-2 text-fd-muted-foreground">
                    › Next.js
                    <br /> Express
                    <br /> React + Vite
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-fd-primary bg-fd-background text-sm font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Start Building</h3>
                <p className="mb-4 text-fd-muted-foreground">
                  Your project is ready with database connected, auth configured, and best practices
                  in place.
                </p>
                <div className="space-y-2 rounded-lg border bg-fd-card p-4 font-mono text-sm">
                  <div className="text-fd-primary">✓ Project created successfully!</div>
                  <div className="text-fd-muted-foreground">
                    <br />
                    cd my-app
                    <br />
                    npm run dev
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="container px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 rounded-lg border bg-fd-card p-8 md:grid-cols-3 md:divide-x">
            <div className="text-center">
              <div className="text-4xl font-bold">6+</div>
              <div className="mt-2 text-sm text-fd-muted-foreground">Authentication Options</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">3</div>
              <div className="mt-2 text-sm text-fd-muted-foreground">Database Adapters</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">&lt;60s</div>
              <div className="mt-2 text-sm text-fd-muted-foreground">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to build your next project?
          </h2>
          <p className="mt-4 text-lg text-fd-muted-foreground">
            Join developers who are shipping faster with StackKit. Start building in the next 60
            seconds.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/docs/getting-started/installation"
              className="inline-flex h-11 items-center justify-center rounded-md bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
            >
              Get Started for Free
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-fd-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
