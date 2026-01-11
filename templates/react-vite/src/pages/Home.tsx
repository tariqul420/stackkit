import { SEO } from "../components/SEO";

export default function Home() {
  return (
    <>
      <SEO title="Home" />
      <div className="flex min-h-screen items-center justify-center bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-black sm:items-start">
          <div className="flex items-center gap-4 mb-8">
            <div className="text-2xl font-bold text-white">Stackkit</div>
            <span className="text-xl text-zinc-400">+</span>
            <img src="https://react.dev/favicon.ico" alt="React logo" width={32} height={32} />
          </div>

          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-zinc-50">
              To get started, edit the Home.tsx file.
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-400">
              This template includes React Router, TanStack Query, Axios, and Tailwind CSS. Check
              out the{" "}
              <a href="/about" className="font-medium text-zinc-50 hover:underline">
                About
              </a>{" "}
              page to learn more about the included features.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center rounded-full bg-white text-black px-5 transition-colors hover:bg-zinc-200 md:w-39.5"
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full px-5 transition-colors hover:border-transparent bg-zinc-900 md:w-39.5 dark:text-white text-black"
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
