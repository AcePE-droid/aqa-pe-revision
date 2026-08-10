import { notFound } from "next/navigation";
import { resolveSubtopicPath, getFlashcards } from "@/lib/content";
import FlashcardStudy from "@/components/FlashcardStudy";

export default async function FlashcardStudyPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/flashcards">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const cards = getFlashcards(paper.slug, topic.slug, subtopic.slug);

  return (
    <FlashcardStudy
      subtopicId={subtopic.id}
      subtopicName={subtopic.name}
      backHref={`/${paper.slug}/${topic.slug}/${subtopic.slug}`}
      cards={cards}
    />
  );
}
