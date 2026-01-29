import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./router";
import { queryClient } from "./shared/lib/query-client";
import { SEOProvider } from "./shared/components/seo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SEOProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SEOProvider>
  </StrictMode>,
);
