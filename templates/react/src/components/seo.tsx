import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const defaultSEO = {
  title: "Stackkit - Production-ready React starter template",
  description: "Production-ready React starter template",
  keywords: "react, vite, typescript, stackkit, production-ready, starter template",
  image: "/og-image.png",
};

export function SEO({ title, description, keywords, image, url }: SEOProps) {
  const siteTitle = title ? `${title} | ${defaultSEO.title}` : defaultSEO.title;
  const siteDescription = description || defaultSEO.description;
  const siteKeywords = keywords || defaultSEO.keywords;
  const siteImage = image || defaultSEO.image;
  const siteUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      <link rel="canonical" href={siteUrl} />
    </Helmet>
  );
}
