export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to StackKit</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your production-ready Next.js starter
        </p>
        <div className="mt-8 space-y-2">
          <p>✅ Next.js 15 App Router</p>
          <p>✅ TypeScript</p>
          <p>✅ Prisma + PostgreSQL</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Environment validation</p>
        </div>
        <div className="mt-8">
          <a
            href="/api/health"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check API Health →
          </a>
        </div>
      </div>
    </main>
  );
}
