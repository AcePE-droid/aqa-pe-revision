import Link from "next/link";
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
  const { paper, topic, subtopic } = resolved;

  const notesMarkdown = getNotesMarkdown(paper.slug, topic.slug, subtopic.slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href={`/notes/${paper.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
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
