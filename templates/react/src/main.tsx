import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import QueryProvider from "./components/providers/query-provider";
import { SEOProvider } from "./components/seo";
import "./index.css";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SEOProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster theme="system" position="top-right" richColors />
      </QueryProvider>
    </SEOProvider>
  </StrictMode>,
);
