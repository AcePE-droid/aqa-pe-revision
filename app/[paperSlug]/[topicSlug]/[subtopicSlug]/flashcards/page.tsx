import { notFound } from "next/navigation";
import { resolveSubtopicPath, getFlashcards } from "@/lib/content";
import { slugify } from "@/lib/slug";
import FlashcardStudy from "@/components/FlashcardStudy";

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
      subtopicId={subtopic.id}
      subtopicName={subtopic.name}
      backHref={`/${paper.slug}/${topic.slug}/${subtopic.slug}`}
      cards={cards}
      groupLabel={groupLabel}
    />
  );
}
