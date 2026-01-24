import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "../components/analytics/google-tag-manager";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StackKit - Production-ready project generator",
    template: "%s | StackKit",
  },
  description:
    "Modern CLI tool for creating production-ready web applications with modular architecture. Build with Next.js, Express, or React.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? "https://stackkit.tariqul.dev"),
  openGraph: {
    title: "StackKit",
    description: "Production-ready project generator with modular composition",
    url: "https://stackkit.tariqul.dev",
    siteName: "StackKit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackKit",
    description: "Production-ready project generator",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <GoogleTagManager />
      </head>
      <body className="flex flex-col min-h-screen">
        <GoogleTagManagerNoScript />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
