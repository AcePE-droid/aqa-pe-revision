import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveSubtopicPath, getFlashcards } from "@/lib/content";
import FlashcardGroupList from "@/components/FlashcardGroupList";

export default async function SubtopicPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const flashcards = getFlashcards(paper.slug, topic.slug, subtopic.slug);

  const basePath = `/${paper.slug}/${topic.slug}/${subtopic.slug}`;

  return (
    <div className="py-16">
      <Link
        href={`/${paper.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subtopic.name}
      </h1>

      <FlashcardGroupList basePath={basePath} flashcards={flashcards} />
    </div>
  );
}
