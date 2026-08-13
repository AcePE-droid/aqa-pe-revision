import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveSubtopicPath, getNotesMarkdown } from "@/lib/content";

export default async function NotesSubtopicPage(
  props: PageProps<"/notes/[paperSlug]/[topicSlug]/[subtopicSlug]">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { topic, subtopic } = resolved;

  const notesMarkdown = getNotesMarkdown(paperSlug, topicSlug, subtopicSlug);

  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{topic.name}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subtopic.name}
      </h1>

      <div className="mt-8">
        {notesMarkdown ? (
          <article className="prose prose-slate max-w-[65ch] prose-headings:font-serif">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notesMarkdown}</ReactMarkdown>
          </article>
        ) : (
          <p className="text-slate-500">Notes for this subtopic haven&apos;t been added yet.</p>
        )}
      </div>
    </div>
  );
}
