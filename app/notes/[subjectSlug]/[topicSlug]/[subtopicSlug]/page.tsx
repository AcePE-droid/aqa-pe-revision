import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getSubjectBySlug,
  getTopicBySlug,
  getSubtopicBySlug,
  getPaperById,
  getNotesMarkdown,
  getFlashcards,
  getQuestions,
} from "@/lib/content";

export default async function NotesSubtopicPage(
  props: PageProps<"/notes/[subjectSlug]/[topicSlug]/[subtopicSlug]">
) {
  const { subjectSlug, topicSlug, subtopicSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  const topic = getTopicBySlug(topicSlug);
  const subtopic = getSubtopicBySlug(subtopicSlug);
  if (!subject || !topic || !subtopic || topic.subject !== subject.name || subtopic.topicId !== topic.id) {
    notFound();
  }
  const paper = getPaperById(topic.paperId);
  if (!paper) notFound();

  const notesMarkdown = getNotesMarkdown(paper.slug, topic.slug, subtopic.slug);
  const basePath = `/${paper.slug}/${topic.slug}/${subtopic.slug}`;
  const flashcardCount = getFlashcards(paper.slug, topic.slug, subtopic.slug).length;
  const questionCount = getQuestions(paper.slug, topic.slug, subtopic.slug).length;

  return (
    <div className="py-16">
      <Link
        href={`/notes/${subject.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subtopic.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Notes &middot; {topic.name} &middot; {topic.subject}
      </p>

      <div className="mt-8 max-w-[720px]">
        {notesMarkdown ? (
          <article className="prose prose-slate max-w-none text-lg leading-relaxed prose-headings:font-serif prose-headings:mt-8 prose-p:leading-relaxed prose-li:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notesMarkdown}</ReactMarkdown>
          </article>
        ) : (
          <div>
            <p className="text-slate-500">Notes for this subtopic haven&apos;t been written yet.</p>
            <Link
              href={`/notes/${subject.slug}/${topic.slug}`}
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              &larr; Back to {topic.name}
            </Link>
          </div>
        )}
      </div>

      {(flashcardCount > 0 || questionCount > 0) && (
        <div className="mt-12 max-w-[720px]">
          <p className="text-sm font-medium text-slate-500">Also study</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {flashcardCount > 0 && (
              <Link
                href={`${basePath}/flashcards`}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">Flashcards</p>
                <p className="mt-1 text-sm text-slate-500">
                  {flashcardCount} card{flashcardCount === 1 ? "" : "s"} ready
                </p>
              </Link>
            )}
            {questionCount > 0 && (
              <Link
                href={`${basePath}/questions`}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">Practice questions</p>
                <p className="mt-1 text-sm text-slate-500">
                  {questionCount} question{questionCount === 1 ? "" : "s"} ready
                </p>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
