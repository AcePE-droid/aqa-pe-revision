export const SITE_URL = "https://aqa-pe-revision.vercel.app";

export const SITE_NAME = "AcePE";

/**
 * Routes that are per-user or transactional. They're kept out of the sitemap
 * and marked noindex, so Google doesn't burn crawl budget on pages that render
 * nothing useful to a logged-out visitor.
 */
export const PRIVATE_PATHS = [
  "/account",
  "/my-progress",
  "/friends",
  "/login",
  "/feedback",
] as const;
