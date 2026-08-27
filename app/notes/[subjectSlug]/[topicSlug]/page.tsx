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

      <div className="mt-8 flex flex-col gap-3">
        {subtopics.map((subtopic, i) => {
          const hasNotes = getNotesMarkdown(paper.slug, topic.slug, subtopic.slug) !== null;
          const number = String(i + 1).padStart(2, "0");

          if (!hasNotes) {
            return (
              <div
                key={subtopic.id}
                className={`flex items-center gap-4 ${CARD_BASE_CLASSES} ${style.border} opacity-50`}
              >
                <span className="font-serif text-lg font-light text-slate-300">{number}</span>
                <h2 className="flex-1 font-serif text-base font-semibold text-slate-900">
                  {subtopic.name}
                </h2>
                <p className="text-sm text-slate-500">Coming soon</p>
              </div>
            );
          }

          return (
            <Link
              key={subtopic.id}
              href={`/notes/${subject.slug}/${topic.slug}/${subtopic.slug}`}
              className={`flex items-center gap-4 ${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${style.border} ${style.hoverBg}`}
            >
              <span className="font-serif text-lg font-light text-slate-300">{number}</span>
              <h2 className="flex-1 font-serif text-base font-semibold text-slate-900">
                {subtopic.name}
              </h2>
              <p className="text-sm text-slate-500">Notes available</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
