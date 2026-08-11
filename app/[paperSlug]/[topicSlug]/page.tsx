import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicBySlug, getSubtopicsByTopicId, getFlashcards } from "@/lib/content";
import { slugify } from "@/lib/slug";
import FlashcardProgressBadge from "@/components/FlashcardProgressBadge";

export default async function TopicPage(props: PageProps<"/[paperSlug]/[topicSlug]">) {
  const { paperSlug, topicSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!paper || !topic || topic.paperId !== paper.id) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href={`/flashcards/${slugify(topic.subject)}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; Flashcards
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {topic.name}
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {subtopics.map((subtopic) => {
          const flashcardCount = getFlashcards(paper.slug, topic.slug, subtopic.slug).length;
          return (
            <Link
              key={subtopic.id}
              href={`/${paper.slug}/${topic.slug}/${subtopic.slug}`}
              className="rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50"
            >
              <h2 className="text-base font-semibold text-slate-900">{subtopic.name}</h2>
              <FlashcardProgressBadge subtopicId={subtopic.id} total={flashcardCount} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
