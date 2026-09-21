import type { Metadata } from "next";

/** Named in every description, so each one says which spec it belongs to. */
export const SPEC = "AQA A-Level PE (7582)";

/**
 * Builds a page's metadata: a title that feeds the root layout's "%s | AcePE"
 * template, a description, and a canonical URL pointing at the page itself.
 *
 * The canonical is the real point of this helper. Several routes render the
 * same content under a query string (the flashcard decks take ?group=), and
 * without a self-referencing canonical each variant looks like a separate
 * page competing with the others. Pointing every variant at the bare path
 * consolidates them.
 *
 * `path` is root-relative and resolves against the `metadataBase` set in
 * app/layout.tsx, so it must start with a slash and carry no query string.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      // Not run through the layout's title template - OpenGraph titles are
      // resolved independently of it, so the suffix has to be explicit.
      title: `${title} | AcePE`,
      description,
      url: path,
      type: "website",
    },
  };
}

/**
 * For pages that only mean anything to the signed-in student. robots.txt
 * already keeps crawlers off most of these; this is the second lock, so the
 * pages stay out of the index even if that file is ever loosened or a link
 * to one leaks out.
 */
export const PRIVATE_PAGE: Metadata["robots"] = { index: false, follow: false };
