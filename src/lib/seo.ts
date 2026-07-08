type PageSeoOptions = {
  /** Short page title; "— Aethelred" is appended when missing. */
  title: string;
  description?: string;
  /** Path only, e.g. `/explore` */
  path?: string;
  /** Path or absolute URL for share image */
  image?: string;
  noIndex?: boolean;
};

export const SITE = {
  name: "Aethelred",
  tagline: "Real Assets. Verified. Accessible.",
  title: "Aethelred — Real Assets. Verified. Accessible.",
  description:
    "Tokenize verified real-world assets on Solana. See debt clearly, pass Guardian audits, and unlock Euro-backed liquidity with Building Culture.",
  author: "Building Culture LLC",
  locale: "en_US",
        twitterSite: "@buildingcultu3",
  themeColor: "#1c1d21",
  ogImage: "/og-image.jpg",
  ogImageAlt: "Aethelred — Real Assets. Verified. Accessible.",
} as const;

export function getSiteUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
    (typeof process !== "undefined" && process.env.VITE_SITE_URL);
  const trimmed = typeof fromEnv === "string" ? fromEnv.trim().replace(/\/$/, "") : "";
  return trimmed || "https://rwa.buildingcultureid.space";
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function formatTitle(title: string): string {
  return title.includes("Aethelred") ? title : `${title} — Aethelred`;
}

export function rootSeo() {
  const siteUrl = getSiteUrl();
  const image = absoluteUrl(SITE.ogImage);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE.title },
      { name: "description", content: SITE.description },
      { name: "author", content: SITE.author },
      { name: "application-name", content: SITE.name },
      { name: "theme-color", content: SITE.themeColor },
      { name: "color-scheme", content: "dark" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: SITE.locale },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:title", content: SITE.title },
      { property: "og:description", content: SITE.description },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SITE.ogImageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: SITE.twitterSite },
      { name: "twitter:title", content: SITE.title },
      { name: "twitter:description", content: SITE.description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: SITE.ogImageAlt },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: "Building Culture LLC",
              url: "https://buildingcultureid.space",
              logo: absoluteUrl("/icon-512.png"),
              sameAs: ["https://buildingcultureid.space", "https://solana.com"],
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              url: siteUrl,
              name: SITE.name,
              description: SITE.description,
              publisher: { "@id": `${siteUrl}/#organization` },
              inLanguage: "en",
            },
            {
              "@type": "WebApplication",
              "@id": `${siteUrl}/#app`,
              name: SITE.name,
              url: siteUrl,
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              description: SITE.description,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
            },
          ],
        },
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

export function pageSeo({
  title,
  description = SITE.description,
  path = "",
  image = SITE.ogImage,
  noIndex = false,
}: PageSeoOptions) {
  const fullTitle = formatTitle(title);
  const url = absoluteUrl(path || "/");
  const shareImage = absoluteUrl(image);

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(noIndex
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : [{ name: "robots", content: "index, follow" }]),
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: shareImage },
      { property: "og:image:alt", content: fullTitle },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: shareImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
