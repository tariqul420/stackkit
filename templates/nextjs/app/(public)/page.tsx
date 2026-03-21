import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex items-center gap-4 mb-8">
          <div className="text-2xl font-bold text-black dark:text-white">StackKit</div>
          <span className="text-xl text-zinc-400">+</span>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This template includes Next.js, Tailwind CSS, and StackKit best practices. Check out the{" "}
            <a
              href="https://github.com/tariqul420/stackkit"
              className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              StackKit repository
            </a>{" "}
            for more info.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center rounded-full bg-white text-black px-5 transition-colors hover:bg-zinc-200 md:w-40"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full bg-black text-white px-5 transition-colors hover:bg-zinc-900 md:w-40"
            href="https://github.com/tariqul420/stackkit"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stackkit GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
