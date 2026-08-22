import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicBySlug, getSubtopicsByTopicId, getFlashcards } from "@/lib/content";
import { slugify } from "@/lib/slug";
import FlashcardProgressBadge from "@/components/FlashcardProgressBadge";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES } from "@/lib/styles";
import { getSubjectStyle } from "@/lib/subject-styles";

export default async function TopicPage(props: PageProps<"/[paperSlug]/[topicSlug]">) {
  const { paperSlug, topicSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!paper || !topic || topic.paperId !== paper.id) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);
  const style = getSubjectStyle(slugify(topic.subject));

  return (
    <div className="py-16">
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
          const flashcardIds = getFlashcards(paper.slug, topic.slug, subtopic.slug).map((f) => f.id);
          return (
            <Link
              key={subtopic.id}
              href={`/${paper.slug}/${topic.slug}/${subtopic.slug}`}
              className={`${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${style.hoverBorder} ${style.hoverBg}`}
            >
              <h2 className="text-base font-semibold text-slate-900">{subtopic.name}</h2>
              <FlashcardProgressBadge
                subtopicId={subtopic.id}
                flashcardIds={flashcardIds}
                total={flashcardIds.length}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
