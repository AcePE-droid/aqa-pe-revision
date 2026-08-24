import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getSubjectBySlug,
  getTopicBySlug,
  getSubtopicBySlug,
  getSubtopicsByTopicId,
  getPaperById,
  getNotesMarkdown,
  getFlashcards,
  getQuestions,
} from "@/lib/content";
import { getSubjectStyle } from "@/lib/subject-styles";

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
  const style = getSubjectStyle(subject.slug);

  // Section number within its chapter (topic), textbook-style - "03" rather
  // than an internal ID, purely a reading aid for where this sits in the topic.
  const siblingSubtopics = getSubtopicsByTopicId(topic.id);
  const sectionNumber = siblingSubtopics.findIndex((s) => s.id === subtopic.id) + 1;

  return (
    <div className="py-16">
      <Link
        href={`/notes/${subject.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>

      <div className="mt-6 max-w-[68ch]">
        <p className={`text-xs font-semibold uppercase tracking-widest ${style.icon}`}>
          {topic.name}
        </p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="font-serif text-4xl font-light text-slate-300 sm:text-5xl">
            {String(sectionNumber).padStart(2, "0")}
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {subtopic.name}
          </h1>
        </div>
        <div className="mt-6 h-px w-full bg-slate-200" />
      </div>

      <div className="mt-8 max-w-[68ch]">
        {notesMarkdown ? (
          <article className="prose prose-slate max-w-none text-lg leading-[1.8] prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:mt-14 prose-h2:text-2xl prose-h3:mt-10 prose-h3:text-xl prose-p:my-6 prose-li:my-1 prose-strong:text-slate-900 prose-a:text-blue-600">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                blockquote: ({ children }) => (
                  <div className="not-prose my-8 flex gap-4">
                    <div className={`w-1 shrink-0 rounded-full ${style.progressBar}`} />
                    <blockquote className="font-serif text-xl italic leading-relaxed text-slate-700">
                      {children}
                    </blockquote>
                  </div>
                ),
              }}
            >
              {notesMarkdown}
            </ReactMarkdown>
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
        <div className="mt-12 max-w-[68ch]">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Also study</p>
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
