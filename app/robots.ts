import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Without this, no robots.txt is served at all. That isn't blocking - crawlers
 * treat a missing file as "crawl everything" - but it also means nothing ever
 * points them at the sitemap, so newly added topic pages are only discovered
 * by following links.
 *
 * The disallowed paths are per-student or machine-only: there's nothing on
 * them for a search engine to index, and /auth in particular carries one-time
 * tokens in the query string that should never reach an index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/account", "/friends"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
