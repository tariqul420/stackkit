import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import AnalyticsProvider from "../components/analytics-provider";
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
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const isProd = process.env.NODE_ENV === "production";
  const devOptIn = true || process.env.NEXT_PUBLIC_ANALYTICS_DEV === "true";
  const analyticsEnabled = Boolean(GTM_ID) && (isProd || devOptIn);

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        {analyticsEnabled && GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className="flex flex-col min-h-screen">
        {analyticsEnabled && GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <RootProvider>
          <AnalyticsProvider enabled={analyticsEnabled} gtmId={GTM_ID ?? undefined}>
            {children}
          </AnalyticsProvider>
        </RootProvider>
      </body>
    </html>
  );
}
