import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import QueryProvider from "./components/providers/query-provider";
import "./index.css";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster theme="system" position="top-right" richColors />
      </QueryProvider>
    </HelmetProvider>
  </StrictMode>,
);
