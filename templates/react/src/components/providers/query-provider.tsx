import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const isProduction = import.meta.env.PROD;

const NO_RETRY_STATUSES = new Set([401, 403, 404, 422]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          NO_RETRY_STATUSES.has(Number((error as Error & { status?: number }).status))
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export default function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {!isProduction && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
