import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSiteUrl } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = getSiteUrl();
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/explore", changefreq: "daily", priority: "0.9" },
          { path: "/create", changefreq: "monthly", priority: "0.8" },
          { path: "/portfolio", changefreq: "daily", priority: "0.7" },
          { path: "/profile", changefreq: "weekly", priority: "0.5" },
          { path: "/guardian", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "weekly", priority: "0.8" },
          { path: "/technology", changefreq: "monthly", priority: "0.6" },
          { path: "/tasks", changefreq: "daily", priority: "0.7" },
          { path: "/governance", changefreq: "weekly", priority: "0.6" },
          { path: "/vault", changefreq: "weekly", priority: "0.6" },
          { path: "/passport", changefreq: "weekly", priority: "0.6" },
          { path: "/names", changefreq: "weekly", priority: "0.5" },
          { path: "/funds", changefreq: "weekly", priority: "0.7" },
          { path: "/markets/OG1-PERP", changefreq: "daily", priority: "0.8" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
