import type { MetadataRoute } from "next";
import { getSubjects, getTopics, getPaperById, getSubtopicsByTopicId } from "@/lib/content";
import { slugify } from "@/lib/slug";

const SITE_URL = "https://aqa-pe-revision.vercel.app";

/**
 * Built by walking the same content helpers the pages themselves use, so the
 * sitemap can't drift out of sync with what actually resolves.
 *
 * `lastModified`, `changeFrequency` and `priority` are all deliberately
 * omitted. Google ignores the latter two, and a meaningful `lastModified`
 * isn't available here: deploys check the repo out fresh, so every content
 * file's mtime is the build time, which would claim every page changed on
 * every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/flashcards",
    "/notes",
    "/questions",
    "/past-papers",
    "/about",
    "/my-progress",
    "/terms",
    "/privacy",
  ];

  // Note: the practice-questions hub route is `app/questions/[paperSlug]`, but
  // that param is resolved as a *subject* slug, not a paper slug.
  for (const subject of getSubjects()) {
    paths.push(`/flashcards/${subject.slug}`, `/notes/${subject.slug}`, `/questions/${subject.slug}`);
  }

  for (const topic of getTopics()) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;
    const subjectSlug = slugify(topic.subject);

    paths.push(
      `/${paper.slug}/${topic.slug}`,
      `/${paper.slug}/${topic.slug}/questions`,
      `/notes/${subjectSlug}/${topic.slug}`
    );

    for (const subtopic of getSubtopicsByTopicId(topic.id)) {
      const subtopicPath = `/${paper.slug}/${topic.slug}/${subtopic.slug}`;
      paths.push(
        subtopicPath,
        `${subtopicPath}/flashcards`,
        `${subtopicPath}/questions`,
        `/notes/${subjectSlug}/${topic.slug}/${subtopic.slug}`
      );
    }
  }

  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
