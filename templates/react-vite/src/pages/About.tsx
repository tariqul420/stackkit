import { SEO } from '../components/SEO';

export default function About() {
  return (
    <>
      <SEO title="About" description="About Stackkit - A production-ready React starter template" />

      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="text-2xl font-bold text-black dark:text-white">Stackkit</div>

          <div className="flex flex-col gap-12 sm:text-left">
            <div>
              <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-6">
                About this template
              </h1>
              <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400 mb-8">
                Stackkit is a production-ready React starter template that includes all the
                essential tools you need to build modern web applications.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
                What's included
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-400">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">React 19</div>
                  <div className="text-sm">Latest React with TypeScript</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">Vite 7</div>
                  <div className="text-sm">Fast build tool and dev server</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">React Router</div>
                  <div className="text-sm">Client-side routing</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">
                    TanStack Query
                  </div>
                  <div className="text-sm">Data fetching and caching</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">Axios</div>
                  <div className="text-sm">HTTP client with interceptors</div>
                </div>
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <div className="font-medium text-black dark:text-zinc-50 mb-1">Tailwind CSS</div>
                  <div className="text-sm">Utility-first CSS framework</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black px-5 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 md:w-[158px]"
              href="/"
            >
              Back to Home
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-zinc-900 md:w-[158px]"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
