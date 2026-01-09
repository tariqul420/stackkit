import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-5xl w-full text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-block animate-pulse">
            <span className="text-6xl">⚡</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            StackKit
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Production-ready project generator with modular composition. Build modern web
            applications faster.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center items-center flex-wrap">
          <Link
            href="/docs"
            className="px-8 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-opacity text-lg"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/tariqul420/stackkit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
          >
            View on GitHub
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
          <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">🧙</div>
            <h3 className="font-bold text-xl mb-3">Interactive Wizard</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Choose your framework, database, and authentication with an intuitive CLI experience
            </p>
          </div>
          <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="font-bold text-xl mb-3">Modular Architecture</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Mix and match components. Add features anytime with simple commands
            </p>
          </div>
          <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-3">Production Ready</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Best practices built-in. TypeScript, linting, and modern tooling configured
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="pt-12 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold">Quick Start</h2>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 font-mono text-left shadow-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-2">Terminal</span>
            </div>
            <code className="text-green-400 text-base">npx create-stackkit-app my-app</code>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Frameworks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">2</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">CLI Tools</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">∞</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Combinations</div>
          </div>
        </div>
      </div>
    </main>
  );
}
