import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveSubtopicPath, getQuestions } from "@/lib/content";
import QuestionView from "@/components/QuestionView";

export default async function QuestionPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/questions/[questionId]">
) {
  const { paperSlug, topicSlug, subtopicSlug, questionId } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const questions = getQuestions(paper.slug, topic.slug, subtopic.slug);
  const index = questions.findIndex((q) => q.id === questionId);
  if (index === -1) notFound();

  const basePath = `/${paper.slug}/${topic.slug}/${subtopic.slug}`;
  const listHref = `/questions/${paper.slug}/${topic.slug}/${subtopic.slug}`;
  const prevHref = index > 0 ? `${basePath}/questions/${questions[index - 1].id}` : null;
  const nextHref =
    index < questions.length - 1 ? `${basePath}/questions/${questions[index + 1].id}` : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href={listHref} className="text-sm font-medium text-blue-600 hover:underline">
        &larr; {subtopic.name}
      </Link>
      <div className="mt-6">
        <QuestionView
          subtopicId={subtopic.id}
          question={questions[index]}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      </div>
    </div>
  );
}
