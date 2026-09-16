import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicBySlug,
  getPaperById,
  getSubtopicsByTopicId,
  getNotesMarkdown,
} from "@/lib/content";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES } from "@/lib/styles";
import { getSubjectStyle } from "@/lib/subject-styles";
import NotesSubtopicList from "@/components/NotesSubtopicList";

export default async function NotesTopicPage(props: PageProps<"/notes/[subjectSlug]/[topicSlug]">) {
  const { subjectSlug, topicSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!subject || !topic || topic.subject !== subject.name) notFound();

  const paper = getPaperById(topic.paperId);
  if (!paper) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);
  const style = getSubjectStyle(subject.slug);

  return (
    <div className="py-16">
      <Link
        href={`/notes/${subject.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {subject.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {topic.name}
      </h1>
      <p className="mt-2 text-slate-600">Choose a subtopic to view notes.</p>

      <NotesSubtopicList
        subtopics={subtopics.map((subtopic) => ({
          id: subtopic.id,
          name: subtopic.name,
          slug: subtopic.slug,
          hasNotes: getNotesMarkdown(paper.slug, topic.slug, subtopic.slug) !== null,
        }))}
        basePath={`/notes/${subject.slug}/${topic.slug}`}
        cardClassName={`${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${style.border} ${style.hoverBg}`}
        mutedCardClassName={`${CARD_BASE_CLASSES} ${style.border} opacity-50`}
      />
    </div>
  );
}
