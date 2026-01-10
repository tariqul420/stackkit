import { SEO } from '../components/SEO';

export default function Home() {
  return (
    <>
      <SEO title="Home" />
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="text-2xl font-bold text-black dark:text-white">Stackkit</div>

          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              To get started, edit the Home.tsx file.
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              This template includes React Router, TanStack Query, Axios, and Tailwind CSS. Check
              out the{' '}
              <a
                href="/about"
                className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
              >
                About
              </a>{' '}
              page to learn more about the included features.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black px-5 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 md:w-[158px]"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-zinc-900 md:w-[158px]"
              href="/about"
            >
              Documentation
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
