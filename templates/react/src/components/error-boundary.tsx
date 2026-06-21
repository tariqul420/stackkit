import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">
          {error.status} {error.statusText}
        </h2>
        <p className="mt-2 text-gray-600">
          {error.data?.message || "An unexpected error occurred"}
        </p>
        <Link
          to="/"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-white text-black px-5 transition-colors hover:bg-zinc-200 md:w-40"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-gray-600">
        {error instanceof Error ? error.message : "An unexpected error occurred"}
      </p>
      <Link
        to="/"
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-white text-black px-5 transition-colors hover:bg-zinc-200 md:w-40"
      >
        Go Home
      </Link>
    </div>
  );
}
