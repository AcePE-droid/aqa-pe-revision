import Link from "next/link";
import { notFound } from "next/navigation";
import {
  resolveSubtopicPath,
  getFlashcards,
  getQuestions,
  getNotesMarkdown,
} from "@/lib/content";
import SubtopicTabs from "@/components/SubtopicTabs";

export default async function SubtopicPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const flashcards = getFlashcards(paper.slug, topic.slug, subtopic.slug);
  const questions = getQuestions(paper.slug, topic.slug, subtopic.slug);
  const notesMarkdown = getNotesMarkdown(paper.slug, topic.slug, subtopic.slug);

  const basePath = `/${paper.slug}/${topic.slug}/${subtopic.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href={`/${paper.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subtopic.name}
      </h1>

      <SubtopicTabs
        basePath={basePath}
        notesMarkdown={notesMarkdown}
        flashcardCount={flashcards.length}
        questions={questions}
      />
    </div>
  );
}
