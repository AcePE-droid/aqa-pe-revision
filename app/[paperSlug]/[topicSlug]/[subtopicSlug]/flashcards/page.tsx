import { notFound } from "next/navigation";
import { resolveSubtopicPath, getFlashcards, getSubjectItemCounts } from "@/lib/content";
import { slugify } from "@/lib/slug";
import FlashcardStudy from "@/components/FlashcardStudy";
import type { Metadata } from "next";
import { pageMetadata, SPEC } from "@/lib/metadata";

export async function generateMetadata(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/flashcards">
): Promise<Metadata> {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) return {};
  const { paper, topic, subtopic } = resolved;

  const count = getFlashcards(paper.slug, topic.slug, subtopic.slug).length;
  return pageMetadata({
    title: `${subtopic.name} Flashcards`,
    description: `${count} interactive flashcards on ${subtopic.name} (${topic.name}) for ${SPEC}.`,
    // Deliberately drops the ?group= filter this page reads, so every deck
    // variant points at one canonical URL instead of competing with the rest.
    path: `/${paper.slug}/${topic.slug}/${subtopic.slug}/flashcards`,
  });
}

export default async function FlashcardStudyPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/flashcards">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const searchParams = await props.searchParams;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const allCards = getFlashcards(paper.slug, topic.slug, subtopic.slug);
  const groupParam = typeof searchParams?.group === "string" ? searchParams.group : undefined;
  const cards = groupParam
    ? allCards.filter((c) => slugify(c.group?.trim() || "General") === groupParam)
    : allCards;
  const groupLabel = groupParam
    ? cards[0]?.group?.trim() || "General"
    : undefined;

  return (
    <FlashcardStudy
      key={subtopic.id}
      subtopicId={subtopic.id}
      subtopicName={subtopic.name}
      topicName={topic.name}
      subjectSlug={slugify(topic.subject)}
      subject={topic.subject}
      backHref={`/${paper.slug}/${topic.slug}/${subtopic.slug}`}
      cards={cards}
      groupLabel={groupLabel}
      subjectTotalItems={getSubjectItemCounts(topic.subject)}
    />
  );
}
