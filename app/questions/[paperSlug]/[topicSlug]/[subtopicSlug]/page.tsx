import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveSubtopicPath, getQuestions } from "@/lib/content";

export default async function QuestionsSubtopicPage(
  props: PageProps<"/questions/[paperSlug]/[topicSlug]/[subtopicSlug]">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const questions = getQuestions(paper.slug, topic.slug, subtopic.slug);

  return (
    <div className="py-16">
      <Link
        href={`/questions/${paper.slug}/${topic.slug}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        &larr; {topic.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subtopic.name}
      </h1>

      <div className="mt-8">
        {questions.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/${paper.slug}/${topic.slug}/${subtopic.slug}/questions/${q.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <span className="font-medium text-slate-900">{q.questionNumber}</span>
                  <span className="ml-2 text-sm text-slate-500">({q.marks} marks)</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No practice questions for this subtopic yet.</p>
        )}
      </div>
    </div>
  );
}
