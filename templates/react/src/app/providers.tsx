import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { SEOProvider } from "../shared/components/seo";
import { queryClient } from "../shared/lib/query-client";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SEOProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SEOProvider>
  );
}

export default Providers;
